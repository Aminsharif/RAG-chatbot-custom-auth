import type { Role } from "@/components/routing/ProtectedRoute";

export const publicRoutes = ["/login", "/register"];

export const authRoutes = ["/login", "/register"];

export const protectedRoutes: { path: string; roles?: Role[] }[] = [
  { path: "/chatbot" },
  // { path: "/analytics", roles: ["admin"] },
  { path: "/settings" },
];

export const DEFAULT_LOGIN_REDIRECT = "/chatbot";
