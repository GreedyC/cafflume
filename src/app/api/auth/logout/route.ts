import { NextResponse } from "next/server";
import {
  rejectUntrustedOrigin,
  SESSION_COOKIE_NAME,
  sessionCookieOptions
} from "@/lib/auth";

export async function POST(request: Request) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) {
    return originError;
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
