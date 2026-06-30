import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const safeUrl = dbUrl
    ? dbUrl.replace(/:([^@]+)@/, ":****@")
    : "NO DATABASE_URL SET";

  try {
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    // Probar conexión usando mysql2 nativo para obtener el error crudo
    const connection = await mysql.createConnection(dbUrl);
    const [rows] = await connection.query("SELECT 1 as test");
    await connection.end();

    return NextResponse.json({
      status: "OK",
      database: "Connected via mysql2",
      connectionString: safeUrl,
      testQuery: rows,
    });
  } catch (err: unknown) {
    const error = err as Error & { code?: string; errno?: number; sqlState?: string };
    return NextResponse.json({
      status: "ERROR",
      connectionString: safeUrl,
      rawErrorName: error.name,
      rawErrorMessage: error.message,
      rawErrorCode: error.code ?? "unknown",
      rawErrno: error.errno ?? null,
      rawSqlState: error.sqlState ?? null,
      stack: error.stack?.split("\n").slice(0, 5),
    }, { status: 500 });
  }
}
