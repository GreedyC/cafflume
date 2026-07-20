import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createSessionToken,
  getAuthenticatedUser,
  hashPassword,
  rejectUntrustedOrigin,
  SESSION_COOKIE_NAME,
  sessionCookieOptions,
  verifyPassword
} from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations";
import {
  ApiRequestError,
  apiErrorResponse,
  readJsonBody
} from "@/lib/api-security";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser(request);
  if (!user) {
    const response = NextResponse.json(
      { error: "Oturum gerekli." },
      { status: 401 }
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  const originError = rejectUntrustedOrigin(request);
  if (originError) {
    return originError;
  }

  try {
    const parsed = changePasswordSchema.safeParse(
      await readJsonBody(request, 2_048)
    );
    if (!parsed.success) {
      throw new ApiRequestError(
        400,
        "Parola değiştirilemedi.",
        parsed.error.flatten()
      );
    }

    const record = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true, sessionVersion: true }
    });
    if (
      !record?.passwordHash ||
      !(await verifyPassword(parsed.data.currentPassword, record.passwordHash))
    ) {
      throw new ApiRequestError(400, "Mevcut parola hatalı.");
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const nextSessionVersion = record.sessionVersion + 1;
    const updated = await prisma.user.updateMany({
      where: { id: user.id, sessionVersion: record.sessionVersion },
      data: { passwordHash, sessionVersion: nextSessionVersion }
    });
    if (updated.count !== 1) {
      throw new ApiRequestError(
        409,
        "Oturum bilgisi değişti. Yeniden giriş yapıp tekrar dene."
      );
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      SESSION_COOKIE_NAME,
      await createSessionToken(user.id, nextSessionVersion),
      sessionCookieOptions()
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return apiErrorResponse(error, "account.password");
  }
}
