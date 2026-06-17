import { z } from "zod";
import { db } from "@/db";
import { trainingSessions, executedBlocks, repSets, personalRecords, notifications } from "@/db/schema";
import { eq, and, desc, asc } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { ok, bad, parseJson, handleError } from "@/lib/api-helpers";
import { resolveCompetitionTie } from "@/lib/tiebreaker";

const completeSchema = z.object({
  plannedSessionId: z.string().optional(),
  sessionType: z.enum(["STRENGTH", "ENDURANCE", "TECHNIQUE", "SIMULATION", "CARDIO", "ACTIVE_RECOVERY", "REST"]),
  durationMinutes: z.number().int().optional(),
  perceivedEffort: z.number().int().min(1).max(10).optional(),
  notes: z.string().optional(),
  isSimulation: z.boolean().default(false),
  repsByStation: z.record(z.string(), z.number().int()).optional(),
  blocks: z.array(
    z.object({
      exerciseId: z.string(),
      station: z.enum(["STATION_1", "STATION_2", "STATION_3", "STATION_4", "STATION_5", "STATION_6"]).optional(),
      totalReps: z.number().int(),
      totalValidReps: z.number().int().optional(),
      totalInvalidReps: z.number().int().optional(),
      weightKg: z.number().optional(),
      durationSeconds: z.number().int().optional(),
      isSimulationBlock: z.boolean().default(false),
    })
  ).default([]),
});

export async function GET(req: Request) {
  try {
    const user = await requireUser();
    if (!user.athlete) return bad("Atleta no encontrado", 404);

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "20", 10);

    const sessions = await db
      .select()
      .from(trainingSessions)
      .where(eq(trainingSessions.athleteId, user.athlete.id))
      .orderBy(desc(trainingSessions.sessionDate))
      .limit(limit);

    return ok({ sessions });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireUser();
    if (!user.athlete) return bad("Atleta no encontrado", 404);

    const data = await parseJson(req, completeSchema);

    const totalRepsSim = data.isSimulation
      ? Object.values(data.repsByStation ?? {}).reduce((a, b) => a + b, 0)
      : null;

    const sessionId = crypto.randomUUID();
    await db
      .insert(trainingSessions)
      .values({
        id: sessionId,
        athleteId: user.athlete.id,
        plannedSessionId: data.plannedSessionId ?? null,
        sessionDate: new Date(),
        sessionType: data.sessionType,
        durationMinutes: data.durationMinutes,
        perceivedEffort: data.perceivedEffort,
        notes: data.notes,
        isSimulation: data.isSimulation,
        completedAt: new Date(),
        totalRepsSimulation: totalRepsSim,
        repsByStationJson: data.repsByStation ? JSON.stringify(data.repsByStation) : null,
      });
    const session = { id: sessionId };

    if (!session) return bad("Error guardando sesión", 500);

    for (let i = 0; i < data.blocks.length; i++) {
      const b = data.blocks[i]!;
      const blockId = crypto.randomUUID();
      await db
        .insert(executedBlocks)
        .values({
          id: blockId,
          sessionId: session.id,
          exerciseId: b.exerciseId,
          station: b.station,
          orderIndex: i,
          totalReps: b.totalReps,
          totalValidReps: b.totalValidReps ?? b.totalReps,
          totalInvalidReps: b.totalInvalidReps ?? 0,
          weightUsedKg: b.weightKg,
          durationSeconds: b.durationSeconds,
          isSimulationBlock: b.isSimulationBlock,
          workDurationSec: b.isSimulationBlock ? 120 : 60,
        });
      const block = { id: blockId };

      if (block && b.totalReps > 0) {
        // Update personal record
        const existing = await db
          .select()
          .from(personalRecords)
          .where(
            and(
              eq(personalRecords.athleteId, user.athlete.id),
              eq(personalRecords.exerciseId, b.exerciseId)
            )
          )
          .orderBy(desc(personalRecords.maxRepsIn2Min))
          .limit(1);

        if (existing.length === 0 || (existing[0]?.maxRepsIn2Min ?? 0) < b.totalReps) {
          await db.insert(personalRecords).values({
            athleteId: user.athlete.id,
            exerciseId: b.exerciseId,
            maxRepsIn2Min: b.totalReps,
            recordDate: new Date(),
            sessionId: session.id,
          });
        }
      }
    }

    // Congrats notification
    if (data.isSimulation && totalRepsSim && totalRepsSim > 0) {
      await db.insert(notifications).values({
        athleteId: user.athlete.id,
        title: "🏆 Simulacro registrado",
        body: `¡${totalRepsSim} repeticiones totales! Sigue así.`,
        type: "SIMULATION_RESULT",
      });
    }

    return ok({ sessionId: session.id, totalReps: totalRepsSim });
  } catch (e) {
    return handleError(e);
  }
}
