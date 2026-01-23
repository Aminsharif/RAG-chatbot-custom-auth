import { NextRequest, NextResponse } from "next/server";
import { env } from "@/config/env";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const backendResponse = await fetch(`${env.apiBaseUrl}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      // "X-Requested-With": "XMLHttpRequest",
    },
    body: JSON.stringify(body),
  });

  const data = await backendResponse.json().catch(() => ({}));

  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        message:
          (data as { message?: string }).message ??
          "Session has expired. Please sign in again.",
      },
      { status: backendResponse.status || 401 },
    );
  }

  const response = NextResponse.json(
    {
      accessToken: (data as { accessToken: string }).accessToken,
      refreshToken: (data as { refreshToken?: string }).refreshToken,
    },
    { status: 200 },
  );

  return response;
}

