import { db } from "@/db";
import { macrocycles, mesocycles, microcycles, plannedSessions, plannedBlocks, exercises } from "@/db/schema";
import { eq, and, asc, gte, lte } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { ok, bad, handleError } from "@/lib/api-helpers";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.athlete) return bad("Atleta no encontrado", 404);

    const macroRows = await db
      .select()
      .from(macrocycles)
      .where(and(eq(macrocycles.athleteId, user.athlete.id), eq(macrocycles.isActive, true)))
      .limit(1);

    if (macroRows.length === 0) return ok({ week: null, sessions: [] });
    const macro = macroRows[0]!;

    const now = new Date();
    const microRows = await db
      .select({
        micro: microcycles,
        meso: mesocycles,
      })
      .from(microcycles)
      .innerJoin(mesocycles, eq(microcycles.mesocycleId, mesocycles.id))
      .where(
        and(
          eq(mesocycles.macrocycleId, macro.id),
          lte(microcycles.startDate, now),
          gte(microcycles.endDate, now)
        )
      )
      .limit(1);

    if (microRows.length === 0) return ok({ week: null, sessions: [], mesocycle: null });

    const { micro, meso } = microRows[0]!;

    const sessions = await db
      .select()
      .from(plannedSessions)
      .where(eq(plannedSessions.microcycleId, micro.id))
      .orderBy(asc(plannedSessions.orderIndex));

    const sessionsWithBlocks = await Promise.all(
      sessions.map(async (s) => {
        const blocks = await db
          .select({
            block: plannedBlocks,
            exercise: exercises,
          })
          .from(plannedBlocks)
          .innerJoin(exercises, eq(plannedBlocks.exerciseId, exercises.id))
          .where(eq(plannedBlocks.plannedSessionId, s.id))
          .orderBy(asc(plannedBlocks.orderIndex));
        return { ...s, blocks: blocks.map((b) => ({ ...b.block, exercise: b.exercise })) };
      })
    );

    return ok({ week: micro, mesocycle: meso, sessions: sessionsWithBlocks });
  } catch (e) {
    return handleError(e);
  }
}
