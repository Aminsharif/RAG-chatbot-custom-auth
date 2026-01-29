"use client";

import React from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/providers/Auth";
import ProfileMenu from "./ProfileMenu";

function getInitials(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "U";
  const parts = trimmed.split(" ").filter(Boolean);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "U";
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export default function ProfileAvatar() {
  const { user, signOut, isAuthenticated } = useAuthContext();
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const name =
    (user as { name?: string } | null)?.name ||
    user?.displayName ||
    user?.firstName ||
    user?.email ||
    "User";
  const email = user?.email || "unknown@example.com";
  const role =
    user?.role ??
    user?.roles?.[0]?.name ??
    user?.metadata?.role ??
    "user";
  const isAdmin = role === "admin";

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

  const handleLogout = async () => {
    await signOut();
    router.replace("/signin");
  };

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Open profile menu"
        onClick={handleToggle}
        className="flex h-11 w-11 items-center justify-center rounded-full border bg-background text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {getInitials(name)}
      </button>
      <AnimatePresence>
        {isOpen ? (
          <ProfileMenu
            name={name}
            email={email}
            isAdmin={isAdmin}
            onClose={() => setIsOpen(false)}
            onLogout={
              isAuthenticated ? handleLogout : () => router.push("/signin")
            }
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}
