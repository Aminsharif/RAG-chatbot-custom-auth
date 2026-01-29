"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/Auth";

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "U";
  const parts = trimmed.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default function ProfileCard() {
  const { user, signOut, isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const name =
    (user as { name?: string } | null)?.name ||
    user?.displayName ||
    user?.firstName ||
    user?.email ||
    "User";
  const email = user?.email || "unknown@example.com";
  const userRole =
    user?.role ?? user?.roles?.[0]?.name ?? user?.metadata?.role;
  const isAdmin = userRole === "admin";

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (isLoading || (isAuthenticated && !user)) {
    return (
      <div className="relative w-full px-4 pb-4">
        <div className="flex w-full items-center gap-3 rounded-xl border bg-background p-3">
          <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-muted" />
            <div className="h-3 w-32 rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative w-full px-4 pb-4">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="flex w-full items-center gap-3 rounded-xl border bg-background p-3 text-left shadow-sm transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted text-sm font-semibold text-foreground">
            ?
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Sign in</div>
            <div className="truncate text-xs text-muted-foreground">
              Continue to your account
            </div>
          </div>
        </button>
      </div>
    );
  }

  const handleLogout = async () => {
    setIsOpen(false);
    await signOut();
    router.replace("/login");
  };

  return (
    <div ref={containerRef} className="relative w-full px-4 pb-4">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open profile menu"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center gap-3 rounded-xl border bg-background p-3 text-left shadow-sm transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-muted text-sm font-semibold text-foreground">
          {getInitials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold">{name}</div>
          <div className="truncate text-xs text-muted-foreground">{email}</div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            role="menu"
            aria-label="Profile menu"
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-0 z-50 mb-2 w-full rounded-xl border bg-background p-4 shadow-lg"
          >
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-xs text-muted-foreground">{email}</div>
            <div className="my-3 h-px bg-border" />
            {isAdmin ? (
              <Link
                role="menuitem"
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Admin Panel
              </Link>
            ) : null}
            <button
              role="menuitem"
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center rounded-md px-2 py-2 text-sm text-destructive hover:bg-destructive/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Logout
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
