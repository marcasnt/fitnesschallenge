import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const safeUrl = dbUrl
    ? dbUrl.replace(/:([^@]+)@/, ":****@")
    : "NO DATABASE_URL SET";

  try {
    // Intentar importar y conectar
    const { db } = await import("@/db");
    const { sql } = await import("drizzle-orm");
    const result = await db.execute(sql`SELECT 1 as test`);
    return NextResponse.json({
      status: "OK",
      database: "Connected",
      connectionString: safeUrl,
      testQuery: "SELECT 1 passed",
    });
  } catch (err: unknown) {
    const error = err as Error & { code?: string; errno?: number; sqlState?: string };
    return NextResponse.json({
      status: "ERROR",
      connectionString: safeUrl,
      errorMessage: error.message,
      errorCode: error.code ?? "unknown",
      errno: error.errno ?? null,
      sqlState: error.sqlState ?? null,
      stack: error.stack?.split("\n").slice(0, 5),
    }, { status: 500 });
  }
}
