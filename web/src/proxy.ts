import { NextRequest, NextResponse } from "next/server";
import { protectedRoutes, publicRoutes, DEFAULT_LOGIN_REDIRECT } from "@/config/routes";

const isProtectedPath = (pathname: string) => {
  return protectedRoutes.some((route) => pathname.startsWith(route.path));
};

const isPublicPath = (pathname: string) => {
  return publicRoutes.includes(pathname);
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("access_token")?.value);

  if (isPublicPath(pathname)) {
    if (hasSession) {
      const redirectUrl = new URL(DEFAULT_LOGIN_REDIRECT, request.url);
      return NextResponse.redirect(redirectUrl);
    }
    return NextResponse.next();
  }

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
