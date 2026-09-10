import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { brewLogSchema, pageSchema } from "@/lib/validations";
import {
  rejectUntrustedOrigin,
  requireApiUser
} from "@/lib/auth";
import {
  ApiRequestError,
  apiErrorResponse,
  readJsonBody
} from "@/lib/api-security";

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const { user, response } = await requireApiUser(request);
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const parsedPage = pageSchema.safeParse(searchParams.get("page") ?? 1);
    if (!parsedPage.success) {
      throw new ApiRequestError(400, "Geçersiz sayfa numarası.");
    }
    const page = parsedPage.data;
    const skip = (page - 1) * PAGE_SIZE;

    const [brews, total] = await Promise.all([
      prisma.brewLog.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: { bean: true },
        skip,
        take: PAGE_SIZE
      }),
      prisma.brewLog.count({ where: { userId: user.id } })
    ]);

    const response = NextResponse.json({
      brews,
      total,
      page,
      totalPages: Math.ceil(total / PAGE_SIZE)
    });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return apiErrorResponse(error, "brews.list");
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser(request);
  if (response) return response;
  const originError = rejectUntrustedOrigin(request);
  if (originError) {
    return originError;
  }

  try {
    const body = await readJsonBody(request);
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      throw new ApiRequestError(400, "İstek gövdesi bir nesne olmalı.");
    }
    const parsed = brewLogSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiRequestError(
        400,
        "Doğrulama hatası.",
        parsed.error.flatten()
      );
    }

    const brew = await prisma.$transaction(async (transaction) => {
      const bean = await transaction.bean.findFirst({
        where: { id: parsed.data.beanId, userId: user.id, isFinished: false },
        select: { id: true }
      });
      if (!bean) {
        throw new ApiRequestError(
          409,
          "Seçilen çekirdek bulunamadı veya artık aktif değil."
        );
      }

      return transaction.brewLog.create({
        data: { ...parsed.data, userId: user.id }
      });
    });

    return NextResponse.json(brew, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "brews.create");
  }
}
