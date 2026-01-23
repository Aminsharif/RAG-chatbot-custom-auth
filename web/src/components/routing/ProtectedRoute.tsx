"use client";

import { ReactNode, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers/Auth";

export type Role = "admin" | "user" | "viewer";

type ProtectedRouteProps = {
  children: ReactNode;
  roles?: Role[];
};

export const ProtectedRoute = ({ children, roles }: ProtectedRouteProps) => {
  const { status, user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (status !== "authenticated") {
      const next = encodeURIComponent(pathname || "/");
      router.replace(`/login?next=${next}`);
      return;
    }
    if (roles && roles.length > 0) {
      const hasRole = user?.roles.some((role) => roles.includes(role as Role));
      if (!hasRole) {
        router.replace("/forbidden");
      }
    }
  }, [isLoading, status, user, roles, router, pathname]);

  if (isLoading || status === "idle") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (status !== "authenticated") {
    return null;
  }

  if (roles && roles.length > 0) {
    const hasRole = user?.roles.some((role) => roles.includes(role as Role));
    if (!hasRole) {
      return null;
    }
  }

  return <>{children}</>;
};
