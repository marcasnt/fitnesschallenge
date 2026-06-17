import { db } from "@/db";
import { macrocycles, mesocycles, microcycles, plannedSessions, plannedBlocks, exercises } from "@/db/schema";
import { eq, asc, and, gte, lte, desc } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { ok, bad, handleError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.athlete) return bad("Atleta no encontrado", 404);

    const macroRows = await db
      .select()
      .from(macrocycles)
      .where(eq(macrocycles.athleteId, user.athlete.id))
      .orderBy(desc(macrocycles.createdAt))
      .limit(1);

    if (macroRows.length === 0) {
      return ok({ macrocycle: null, mesocycles: [], microcycles: [] });
    }

    const macro = macroRows[0]!;
    const mesos = await db
      .select()
      .from(mesocycles)
      .where(eq(mesocycles.macrocycleId, macro.id))
      .orderBy(asc(mesocycles.orderIndex));

    const micros = await db
      .select()
      .from(microcycles)
      .where(
        eq(
          microcycles.mesocycleId,
          mesos[0]?.id ?? ""
        )
      )
      .orderBy(asc(microcycles.weekNumber));

    return ok({ macrocycle: macro, mesocycles: mesos, microcycles: micros });
  } catch (e) {
    return handleError(e);
  }
}
