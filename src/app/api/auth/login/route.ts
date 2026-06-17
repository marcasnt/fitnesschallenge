import { z } from "zod";
import { db } from "@/db";
import { users, athletes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createSession } from "@/lib/auth";
import { ok, bad, parseJson, handleError } from "@/lib/api-helpers";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

export async function POST(req: Request) {
  try {
    const data = await parseJson(req, schema);

    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (found.length === 0) {
      return bad("Email o contraseña incorrectos", 401);
    }

    const user = found[0];
    if (!user.isActive) {
      return bad("Cuenta desactivada", 403);
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return bad("Email o contraseña incorrectos", 401);
    }

    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, user.id));

    await createSession(user.id, user.email, user.role);

    const athleteRows = await db
      .select()
      .from(athletes)
      .where(eq(athletes.userId, user.id))
      .limit(1);

    return ok({
      userId: user.id,
      email: user.email,
      role: user.role,
      hasAthlete: athleteRows.length > 0,
      onboardingComplete: athleteRows[0]?.competitionDate != null,
    });
  } catch (e) {
    return handleError(e);
  }
}
