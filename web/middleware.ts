import type { NextRequest } from "next/server";
import { updateSession } from "./src/lib/auth/middleware";

export function middleware(request: NextRequest) {
  return updateSession(request);
}

