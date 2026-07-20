import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { beanStatusSchema, idSchema } from "@/lib/validations";
import {
  rejectUntrustedOrigin,
  requireAuthentication
} from "@/lib/auth";
import {
  ApiRequestError,
  apiErrorResponse,
  readJsonBody
} from "@/lib/api-security";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const authError = await requireAuthentication(request);
  if (authError) {
    return authError;
  }
  const originError = rejectUntrustedOrigin(request);
  if (originError) {
    return originError;
  }

  try {
    const id = idSchema.safeParse((await params).id);
    if (!id.success) {
      throw new ApiRequestError(400, "Geçersiz kayıt kimliği.");
    }
    const body = beanStatusSchema.safeParse(await readJsonBody(request, 1024));
    if (!body.success) {
      throw new ApiRequestError(
        400,
        "Doğrulama hatası.",
        body.error.flatten()
      );
    }

    const updated = await prisma.bean.update({
      where: { id: id.data },
      data: { isFinished: body.data.isFinished }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return apiErrorResponse(error, "beans.update");
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const authError = await requireAuthentication(request);
  if (authError) {
    return authError;
  }
  const originError = rejectUntrustedOrigin(request);
  if (originError) {
    return originError;
  }

  try {
    const id = idSchema.safeParse((await params).id);
    if (!id.success) {
      throw new ApiRequestError(400, "Geçersiz kayıt kimliği.");
    }

    await prisma.bean.delete({ where: { id: id.data } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return apiErrorResponse(error, "beans.delete");
  }
}
