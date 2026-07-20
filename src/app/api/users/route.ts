import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createInviteToken,
  hashInviteToken,
  rejectUntrustedOrigin,
  requireAdmin
} from "@/lib/auth";
import { userInviteSchema } from "@/lib/validations";
import {
  ApiRequestError,
  apiErrorResponse,
  readJsonBody
} from "@/lib/api-security";

const INVITE_TTL_MS = 48 * 60 * 60 * 1_000;

export async function POST(request: Request) {
  const authorization = await requireAdmin(request);
  if (authorization.response) {
    return authorization.response;
  }
  const originError = rejectUntrustedOrigin(request);
  if (originError) {
    return originError;
  }

  try {
    const parsed = userInviteSchema.safeParse(
      await readJsonBody(request, 2_048)
    );
    if (!parsed.success) {
      throw new ApiRequestError(
        400,
        "Kullanıcı oluşturulamadı.",
        parsed.error.flatten()
      );
    }

    const token = createInviteToken();
    const inviteTokenHash = await hashInviteToken(token);
    const inviteExpiresAt = new Date(Date.now() + INVITE_TTL_MS);
    const user = await prisma.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        role: parsed.data.role,
        inviteTokenHash,
        inviteExpiresAt
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });
    const inviteUrl = new URL("/set-password", request.url);
    inviteUrl.hash = `token=${token}`;
    const response = NextResponse.json(
      { user, inviteUrl: inviteUrl.toString(), inviteExpiresAt },
      { status: 201 }
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return apiErrorResponse(error, "users.create");
  }
}
