import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  rejectUntrustedOrigin,
  requireAdmin
} from "@/lib/auth";
import { idSchema, userUpdateSchema } from "@/lib/validations";
import {
  ApiRequestError,
  apiErrorResponse,
  readJsonBody
} from "@/lib/api-security";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const authorization = await requireAdmin(request);
  if (authorization.response || !authorization.user) {
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
    const parsed = userUpdateSchema.safeParse(
      await readJsonBody(request, 1_024)
    );
    if (!parsed.success) {
      throw new ApiRequestError(
        400,
        "Kullanıcı güncellenemedi.",
        parsed.error.flatten()
      );
    }
    if (
      id.data === authorization.user.id &&
      (parsed.data.isActive === false || parsed.data.role === "MEMBER")
    ) {
      throw new ApiRequestError(
        409,
        "Kendi yönetici hesabını pasifleştiremez veya üye yapamazsın."
      );
    }

    const updated = await prisma.$transaction(async (transaction) => {
      const target = await transaction.user.findUnique({
        where: { id: id.data }
      });
      if (!target) {
        throw new ApiRequestError(404, "Kullanıcı bulunamadı.");
      }
      const removesActiveAdmin =
        target.role === "ADMIN" &&
        target.isActive &&
        (parsed.data.role === "MEMBER" || parsed.data.isActive === false);
      if (removesActiveAdmin) {
        await transaction.$queryRaw`
          SELECT "id"
          FROM "User"
          WHERE "role" = 'ADMIN'::"UserRole" AND "isActive" = true
          FOR UPDATE
        `;
        if (
          (await transaction.user.count({
            where: { role: "ADMIN", isActive: true }
          })) <= 1
        ) {
          throw new ApiRequestError(
            409,
            "Çalışma alanında en az bir aktif yönetici kalmalı."
          );
        }
      }

      const accessChanged =
        (parsed.data.role !== undefined && parsed.data.role !== target.role) ||
        (parsed.data.isActive !== undefined &&
          parsed.data.isActive !== target.isActive);
      return transaction.user.update({
        where: { id: target.id },
        data: {
          ...parsed.data,
          ...(accessChanged ? { sessionVersion: { increment: 1 } } : {})
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          passwordHash: true,
          inviteExpiresAt: true,
          lastLoginAt: true,
          createdAt: true
        }
      });
    });

    const response = NextResponse.json({
      ...updated,
      passwordHash: undefined,
      hasPassword: Boolean(updated.passwordHash)
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return apiErrorResponse(error, "users.update");
  }
}
