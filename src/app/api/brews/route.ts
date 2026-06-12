import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { brewLogSchema } from "@/lib/validations";

const PAGE_SIZE = 10;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [brews, total] = await Promise.all([
    prisma.brewLog.findMany({
      orderBy: { createdAt: "desc" },
      include: { bean: true },
      skip,
      take: PAGE_SIZE
    }),
    prisma.brewLog.count()
  ]);

  return NextResponse.json({
    brews,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE)
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = brewLogSchema.safeParse({
      ...body,
      doseGrams: Number(body.doseGrams),
      yieldMl: Number(body.yieldMl),
      waterTempC: Number(body.waterTempC),
      brewTimeMin: Number(body.brewTimeMin),
      brewTimeSec: Number(body.brewTimeSec),
      rating: Number(body.rating)
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const brew = await prisma.brewLog.create({
      data: parsed.data
    });

    return NextResponse.json(brew, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
