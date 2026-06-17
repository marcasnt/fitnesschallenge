import { drizzle } from "drizzle-orm/mysql2";
import { createPool, Pool } from "mysql2";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsMysqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsMysqlPool ??
  createPool(databaseUrl);

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsMysqlPool = pool;
}

export const db = drizzle(pool);
