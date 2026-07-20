import "server-only";

import { NextResponse } from "next/server";

const DEFAULT_MAX_BODY_BYTES = 8 * 1024;

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function readJsonBody(
  request: Request,
  maxBytes = DEFAULT_MAX_BODY_BYTES
) {
  const contentType = request.headers.get("content-type")?.split(";", 1)[0];
  if (contentType?.trim().toLowerCase() !== "application/json") {
    throw new ApiRequestError(415, "Content-Type application/json olmalı.");
  }

  const contentLength = request.headers.get("content-length");
  if (
    contentLength &&
    (!/^\d+$/u.test(contentLength) || Number(contentLength) > maxBytes)
  ) {
    throw new ApiRequestError(413, "İstek gövdesi çok büyük.");
  }

  const body = new Uint8Array(await request.arrayBuffer());
  if (body.byteLength === 0) {
    throw new ApiRequestError(400, "İstek gövdesi boş olamaz.");
  }
  if (body.byteLength > maxBytes) {
    throw new ApiRequestError(413, "İstek gövdesi çok büyük.");
  }

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
  } catch {
    throw new ApiRequestError(400, "Geçersiz JSON.");
  }
}

export function apiErrorResponse(error: unknown, context: string) {
  if (error instanceof ApiRequestError) {
    const response = NextResponse.json(
      {
        error: error.message,
        ...(error.details === undefined ? {} : { details: error.details })
      },
      { status: error.status }
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  const prismaCode =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof error.code === "string"
      ? error.code
      : null;

  if (prismaCode === "P2025") {
    const response = NextResponse.json(
      { error: "Kayıt bulunamadı." },
      { status: 404 }
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  if (prismaCode === "P2003") {
    const response = NextResponse.json(
      { error: "Kayıt ilişkili veriler nedeniyle güncellenemedi." },
      { status: 409 }
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  }
  if (prismaCode === "P2002") {
    const response = NextResponse.json(
      { error: "Bu bilgiyle eşleşen bir kayıt zaten var." },
      { status: 409 }
    );
    response.headers.set("Cache-Control", "no-store");
    return response;
  }

  console.error(`[${context}] request failed`, error);
  const response = NextResponse.json(
    { error: "Sunucu hatası." },
    { status: 500 }
  );
  response.headers.set("Cache-Control", "no-store");
  return response;
}
