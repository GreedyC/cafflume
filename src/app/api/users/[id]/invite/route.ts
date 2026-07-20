import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createInviteToken,
  hashInviteToken,
  rejectUntrustedOrigin,
  requireAdmin
} from "@/lib/auth";
import { idSchema } from "@/lib/validations";
import { ApiRequestError, apiErrorResponse } from "@/lib/api-security";

const INVITE_TTL_MS = 48 * 60 * 60 * 1_000;

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const authorization = await requireAdmin(request);
  if (authorization.response) {
    return authorization.response;
  }
  const originError = rejectUntrustedOrigin(request);
  if (originError) {
    return originError;
  }

  try {
    const id = idSchema.safeParse((await params).id);
    if (!id.success) {
      throw new ApiRequestError(400, "Geçersiz kullanıcı kimliği.");
    }
    const target = await prisma.user.findUnique({
      where: { id: id.data },
      select: { id: true, isActive: true }
    });
    if (!target?.isActive) {
      throw new ApiRequestError(404, "Aktif kullanıcı bulunamadı.");
    }

    const token = createInviteToken();
    const inviteTokenHash = await hashInviteToken(token);
    const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS);
    await prisma.user.update({
      where: { id: target.id },
      data: { inviteTokenHash, inviteExpiresAt }
    });
    const inviteUrl = new URL("/set-password", request.url);
    inviteUrl.hash = `token=${token}`;
    const response = NextResponse.json({
      inviteUrl: inviteUrl.toString(),
      inviteExpiresAt
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return apiErrorResponse(error, "users.invite");
  }
}
