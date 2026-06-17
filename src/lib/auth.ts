import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { db } from "@/db";
import { sessions, users, athletes } from "@/db/schema";
import { eq, and, gt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "ifbb-fitness-challenge-default-secret-change-in-production-please-64chars-min"
);

const SESSION_DAYS = 30;
const COOKIE_NAME = "ifbb_session";

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: "ATHLETE" | "COACH" | "ADMIN";
}

export async function createSession(userId: string, email: string, role: "ATHLETE" | "COACH" | "ADMIN") {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });

  return { token, expiresAt };
}

export async function getSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie) return null;

  const result = await db
    .select({
      sessionId: sessions.id,
      userId: sessions.userId,
      expiresAt: sessions.expiresAt,
      user: users,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.token, cookie.value), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (result.length === 0) return null;
  const row = result[0];
  return {
    userId: row.userId,
    email: row.user.email,
    role: row.user.role,
    expiresAt: row.expiresAt,
  };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (cookie) {
    await db.delete(sessions).where(eq(sessions.token, cookie.value));
    cookieStore.delete(COOKIE_NAME);
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export interface CurrentUser {
  userId: string;
  email: string;
  role: "ATHLETE" | "COACH" | "ADMIN";
  athlete: typeof athletes.$inferSelect | null;
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession();
  if (!session) return null;

  const athleteRows = await db
    .select()
    .from(athletes)
    .where(eq(athletes.userId, session.userId))
    .limit(1);

  return {
    userId: session.userId,
    email: session.email,
    role: session.role,
    athlete: athleteRows[0] ?? null,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("No autenticado", 401);
  }
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

// JWT for API tokens (if needed for mobile/external clients)
export async function signJWT(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as SessionPayload;
}
