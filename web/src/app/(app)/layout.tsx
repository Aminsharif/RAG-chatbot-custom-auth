// import type { Metadata } from "next";
// import "../globals.css";
// import React from "react";

// export const metadata: Metadata = {
//   title: "Agent with Auth and Payments - Client",
//   description: "Agent with Auth and Payments - Client",
// };

// export default function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode;
// }>) {
//   return <>{children}</>;
// }
// components/AuthRedirectHandler.tsx
"use client";

import { useAuthContext } from "@/providers/Auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicRoutes = ["/signin", "/login", "/signup", "/forgot-password"];

export default function AuthRedirectHandler({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !publicRoutes.includes(pathname)) {
      router.replace("/login");
    }

    // If authenticated and trying to access auth routes (signin, signup, etc.)
    if (isAuthenticated && publicRoutes.includes(pathname)) {
      router.replace("/dashboard"); // or your default authenticated route
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Only show children if authenticated for protected routes, or if it's a public route
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return null; // Or a loading skeleton
  }

  return <>{children}</>;
}
