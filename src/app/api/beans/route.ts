import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { beanSchema } from "@/lib/validations";
import {
  rejectUntrustedOrigin,
  requireApiUser
} from "@/lib/auth";
import {
  ApiRequestError,
  apiErrorResponse,
  readJsonBody
} from "@/lib/api-security";

export async function GET(request: Request) {
  const { user, response } = await requireApiUser(request);
  if (response) return response;

  try {
    const beans = await prisma.bean.findMany({
      where: { userId: user.id },
      orderBy: { roastDate: "desc" },
      take: 500
    });
    const response = NextResponse.json(beans);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return apiErrorResponse(error, "beans.list");
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
    const parsed = beanSchema.safeParse({
      ...(typeof body === "object" && body !== null ? body : {})
    });

    if (!parsed.success) {
      throw new ApiRequestError(
        400,
        "Doğrulama hatası.",
        parsed.error.flatten()
      );
    }

    const bean = await prisma.bean.create({
      data: {
        userId: user.id,
        ...parsed.data,
        roastDate: parsed.data.roastDate,
        openDate: parsed.data.openDate ?? null
      }
    });

    return NextResponse.json(bean, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "beans.create");
  }
}
