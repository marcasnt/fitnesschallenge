import { z } from "zod";
import { db } from "@/db";
import { users, athletes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSession } from "@/lib/auth";
import { detectCategory } from "@/lib/category";
import { ok, bad, parseJson, handleError } from "@/lib/api-helpers";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  dateOfBirth: z.string().min(1),
  gender: z.enum(["MALE", "FEMALE"]),
});

export async function POST(req: Request) {
  try {
    const data = await parseJson(req, schema);

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, data.email.toLowerCase()))
      .limit(1);

    if (existing.length > 0) {
      return bad("El email ya está registrado", 409);
    }

    const dob = new Date(data.dateOfBirth);
    const category = detectCategory(dob, data.gender);

    const passwordHash = await hashPassword(data.password);

    const userId = crypto.randomUUID();
    await db
      .insert(users)
      .values({
        id: userId,
        email: data.email.toLowerCase(),
        passwordHash,
        role: "ATHLETE",
        isEmailVerified: true, // Auto-verified for sandbox
      });
    const newUser = {
      id: userId,
      email: data.email.toLowerCase(),
      role: "ATHLETE" as const,
    };

    if (!newUser) return bad("Error creando usuario", 500);

    await db.insert(athletes).values({
      userId: newUser.id,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: dob,
      gender: data.gender,
      ageCategory: category.category,
      competitionLevel: category.autoAssignedLevel ?? "GOLD",
      competitionModality: "INDIVIDUAL",
      availableDaysJson: JSON.stringify([
        "MONDAY",
        "WEDNESDAY",
        "FRIDAY",
        "SATURDAY",
      ]),
    });

    await createSession(newUser.id, newUser.email, newUser.role);

    return ok({
      userId: newUser.id,
      email: newUser.email,
      category: category.category,
      autoAssignedLevel: category.autoAssignedLevel,
    });
  } catch (e) {
    return handleError(e);
  }
}
