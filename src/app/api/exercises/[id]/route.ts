import { db } from "@/db";
import { exercises, techAlerts } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { ok, bad, handleError } from "@/lib/api-helpers";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    if (rows.length === 0) return bad("Ejercicio no encontrado", 404);

    const alerts = await db
      .select()
      .from(techAlerts)
      .where(eq(techAlerts.exerciseId, id))
      .orderBy(asc(techAlerts.sortOrder));

    return ok({ exercise: rows[0], techAlerts: alerts });
  } catch (e) {
    return handleError(e);
  }
}
