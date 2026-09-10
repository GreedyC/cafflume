import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cuppingSessionSchema } from "@/lib/validations";
import { rejectUntrustedOrigin, requireApiUser } from "@/lib/auth";
import { ApiRequestError, apiErrorResponse, readJsonBody } from "@/lib/api-security";

export async function GET(request: Request) {
  const { user, response } = await requireApiUser(request);
  if (response) return response;

  try {
    const cuppings = await prisma.cuppingSession.findMany({
      where: { userId: user.id },
      include: { bean: true },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    const response = NextResponse.json({ cuppings });
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch (error) {
    return apiErrorResponse(error, "cuppings.list");
  }
}

export async function POST(request: Request) {
  const { user, response } = await requireApiUser(request);
  if (response) return response;
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;

  try {
    const body = await readJsonBody(request);
    const parsed = cuppingSessionSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiRequestError(400, "Validation failed.", parsed.error.flatten());
    }

    const bean = await prisma.bean.findFirst({
      where: { id: parsed.data.beanId, userId: user.id },
      select: { id: true }
    });
    if (!bean) throw new ApiRequestError(404, "Coffee not found.");

    const dimensions = [
      parsed.data.fragranceAroma,
      parsed.data.flavor,
      parsed.data.aftertaste,
      parsed.data.acidity,
      parsed.data.sweetness,
      parsed.data.body,
      parsed.data.balance,
      parsed.data.overall
    ];
    const totalScore = Number(
      ((dimensions.reduce((sum, score) => sum + score, 0) / dimensions.length) * 10).toFixed(1)
    );

    const cupping = await prisma.cuppingSession.create({
      data: { ...parsed.data, userId: user.id, totalScore }
    });
    return NextResponse.json(cupping, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error, "cuppings.create");
  }
}
