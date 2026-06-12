import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { beanSchema } from "@/lib/validations";

export async function GET() {
  const beans = await prisma.bean.findMany({
    orderBy: { roastDate: "desc" }
  });
  return NextResponse.json(beans);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = beanSchema.safeParse({
      ...body,
      roastDate: body.roastDate,
      openDate: body.openDate
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation error", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const bean = await prisma.bean.create({
      data: {
        ...parsed.data,
        roastDate: parsed.data.roastDate,
        openDate: parsed.data.openDate ?? null
      }
    });

    return NextResponse.json(bean, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
