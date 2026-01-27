import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";
import { rateLimit } from "@/app/api/_lib/rateLimit";

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown";

  const limit = rateLimit(`login:${ip}`);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many login attempts. Please wait and try again." },
      { status: 429 },
    );
  }

  const body = await request.json();

  const backendResponse = await fetch(`${env.apiBaseUrl}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", 
      "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
  });

  const data = await backendResponse.json().catch(() => ({}));

  if (!backendResponse.ok) {
    const message =
      (data as { message?: string }).message ??
      (backendResponse.status === 401
        ? "Invalid email or password."
        : "Unable to sign in. Please try again.");
    return NextResponse.json(
      { message },
      { status: backendResponse.status || 500 },
    );
  }

  const response = NextResponse.json(
    {
      accessToken: (data as { accessToken: string }).accessToken,
      refreshToken: (data as { refreshToken: string }).refreshToken,
    },
    { status: 200 },
  );

  const cookies = (data as { cookies?: { name: string; value: string }[] })
    .cookies;

  if (cookies && Array.isArray(cookies)) {
    cookies.forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value, {
        httpOnly: true,
        sameSite: "lax",
        secure: true,
        path: "/",
      });
    });
  }

  return response;
}
