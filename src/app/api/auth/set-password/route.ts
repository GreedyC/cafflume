import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashInviteToken,
  hashPassword,
  rejectUntrustedOrigin
} from "@/lib/auth";
import { setPasswordSchema } from "@/lib/validations";
import {
  ApiRequestError,
  apiErrorResponse,
  readJsonBody
} from "@/lib/api-security";

export async function POST(request: Request) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) {
    return originError;
  }

  try {
    const parsed = setPasswordSchema.safeParse(
      await readJsonBody(request, 2_048)
    );
    if (!parsed.success) {
      throw new ApiRequestError(
        400,
        "Parola belirlenemedi.",
        parsed.error.flatten()
      );
    }

    const inviteTokenHash = await hashInviteToken(parsed.data.token);
    const user = await prisma.user.findFirst({
      where: {
        inviteTokenHash,
        inviteExpiresAt: { gt: new Date() },
        isActive: true
      },
      select: { id: true, email: true }
    });
    if (!user) {
      throw new ApiRequestError(
        400,
        "Davet bağlantısı geçersiz veya süresi dolmuş."
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const result = await prisma.user.updateMany({
      where: {
        id: user.id,
        inviteTokenHash,
        inviteExpiresAt: { gt: new Date() }
      },
      data: {
        passwordHash,
        inviteTokenHash: null,
        inviteExpiresAt: null,
        sessionVersion: { increment: 1 }
      }
    });
    if (result.count !== 1) {
      throw new ApiRequestError(
        409,
        "Davet daha önce kullanılmış. Yöneticinden yeni bağlantı iste."
      );
    }

    const response = NextResponse.json({ ok: true, email: user.email });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return apiErrorResponse(error, "auth.set-password");
  }
}
