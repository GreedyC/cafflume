import { NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n";
import { rejectUntrustedOrigin } from "@/lib/auth";
import { ApiRequestError, apiErrorResponse, readJsonBody } from "@/lib/api-security";

export async function POST(request: Request) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;

  try {
    const body = await readJsonBody(request);
    const locale = typeof body === "object" && body && !Array.isArray(body) && "locale" in body
      ? String(body.locale)
      : "";
    if (!isLocale(locale)) throw new ApiRequestError(400, "Unsupported locale.");

    const response = NextResponse.json({ locale });
    response.cookies.set("brewstack-locale", locale, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 365,
      path: "/"
    });
    return response;
  } catch (error) {
    return apiErrorResponse(error, "locale.update");
  }
}
