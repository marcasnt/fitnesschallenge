import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";
import { AuthError } from "./auth";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function bad(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

export async function parseJson<T>(req: Request, schema: ZodSchema<T>): Promise<T> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new AuthError("JSON inválido", 400);
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new AuthError("Datos inválidos", 400);
  }
  return parsed.data;
}

export function handleError(err: unknown) {
  if (err instanceof AuthError) {
    return bad(err.message, err.status);
  }
  if (err instanceof ZodError) {
    return bad("Datos inválidos", 400, { issues: err.issues });
  }
  console.error("API error:", err);
  return bad("Error interno del servidor", 500);
}
