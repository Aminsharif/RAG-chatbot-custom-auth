import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/config/env";

const schema = z.object({
  email: z.string().email(),
});

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const email = url.searchParams.get("email");
  const parse = schema.safeParse({ email });

  if (!parse.success) {
    return NextResponse.json(
      { available: false, message: "Invalid email" },
      { status: 400 },
    );
  }

  const backendResponse = await fetch(
    `${env.apiBaseUrl}/auth/check-email?email=${encodeURIComponent(parse.data.email)}`,
  );

  if (!backendResponse.ok) {
    return NextResponse.json(
      { available: false, message: "Unable to verify email" },
      { status: backendResponse.status },
    );
  }

  const data = await backendResponse.json().catch(() => ({}));

  return NextResponse.json(
    { available: Boolean((data as { available?: boolean }).available) },
    { status: 200 },
  );
}

