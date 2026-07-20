import { NextRequest, NextResponse } from "next/server";
import {
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifySessionToken
} from "@/lib/auth";

const PUBLIC_PATHS = new Set([
  "/login",
  "/og.png",
  "/api/auth/login",
  "/api/auth/logout"
]);

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.has(pathname);
}

export async function proxy(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (await verifySessionToken(token)) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    const response = NextResponse.json(
      { error: "Oturum gerekli." },
      { status: 401 }
    );
    response.headers.set("Cache-Control", "no-store");
    response.cookies.set(SESSION_COOKIE_NAME, "", {
      ...sessionCookieOptions(),
      maxAge: 0
    });
    return response;
  }

  const loginUrl = new URL("/login", request.url);
  const destination = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  if (destination.length <= 1024) {
    loginUrl.searchParams.set("next", destination);
  }
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions(),
    maxAge: 0
  });
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"
  ]
};
