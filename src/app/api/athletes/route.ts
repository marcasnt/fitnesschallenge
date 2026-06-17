import { z } from "zod";
import { db } from "@/db";
import { athletes, macrocycles, mesocycles, microcycles, plannedSessions, plannedBlocks, exercises, notifications } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { ok, bad, parseJson, handleError } from "@/lib/api-helpers";
import { generateMacrocycle } from "@/lib/periodization";

const updateSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  bodyWeightKg: z.number().optional(),
  competitionLevel: z.enum(["GOLD", "SILVER", "BRONZE", "SPEED_FIT"]).optional(),
  competitionModality: z
    .enum([
      "INDIVIDUAL",
      "PAIR_MALE",
      "PAIR_FEMALE",
      "PAIR_MIXED",
      "TEAM_6",
      "SPEED_FIT_INDIVIDUAL",
      "SPEED_FIT_TEAM_4",
    ])
    .optional(),
  competitionDate: z.string().optional(),
  availableDaysJson: z.string().optional(),
  maxSessionMinutes: z.number().int().min(15).max(240).optional(),
  experienceLevel: z.number().int().min(1).max(10).optional(),
});

export async function GET() {
  try {
    const user = await requireUser();
    return ok({ athlete: user.athlete });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: Request) {
  try {
    const user = await requireUser();
    if (!user.athlete) return bad("Atleta no encontrado", 404);

    const data = await parseJson(req, updateSchema);

    const updateValues: Record<string, unknown> = { updatedAt: new Date() };
    if (data.firstName !== undefined) updateValues.firstName = data.firstName;
    if (data.lastName !== undefined) updateValues.lastName = data.lastName;
    if (data.bodyWeightKg !== undefined) updateValues.bodyWeightKg = data.bodyWeightKg;
    if (data.competitionLevel !== undefined) updateValues.competitionLevel = data.competitionLevel;
    if (data.competitionModality !== undefined)
      updateValues.competitionModality = data.competitionModality;
    if (data.competitionDate !== undefined)
      updateValues.competitionDate = new Date(data.competitionDate);
    if (data.availableDaysJson !== undefined)
      updateValues.availableDaysJson = data.availableDaysJson;
    if (data.maxSessionMinutes !== undefined)
      updateValues.maxSessionMinutes = data.maxSessionMinutes;
    if (data.experienceLevel !== undefined)
      updateValues.experienceLevel = data.experienceLevel;

    await db.update(athletes).set(updateValues).where(eq(athletes.id, user.athlete.id));

    // If competition date set, generate the macrocycle
    if (data.competitionDate) {
      await generateMacrocycleForAthlete(
        user.athlete.id,
        new Date(data.competitionDate),
        (data.competitionModality ?? user.athlete.competitionModality) as string,
        (data.competitionLevel ?? user.athlete.competitionLevel) as string,
        user.athlete.availableDaysJson
      );
    }

    const refreshed = await db
      .select()
      .from(athletes)
      .where(eq(athletes.id, user.athlete.id))
      .limit(1);

    return ok({ athlete: refreshed[0] });
  } catch (e) {
    return handleError(e);
  }
}

async function generateMacrocycleForAthlete(
  athleteId: string,
  competitionDate: Date,
  modality: string,
  level: string,
  availableDaysJson: string
) {
  // Wipe previous
  const previous = await db
    .select()
    .from(macrocycles)
    .where(eq(macrocycles.athleteId, athleteId))
    .limit(1);

  if (previous.length > 0) {
    await db.delete(macrocycles).where(eq(macrocycles.athleteId, athleteId));
  }

  const availableDays = JSON.parse(availableDaysJson) as string[];
  const gen = generateMacrocycle({
    competitionDate,
    competitionModality: modality,
    competitionLevel: level,
    availableDays,
    maxSessionMinutes: 60,
    experienceLevel: 5,
  });

  const macroId = crypto.randomUUID();
  await db
    .insert(macrocycles)
    .values({
      id: macroId,
      athleteId,
      type: gen.type,
      startDate: gen.startDate,
      endDate: gen.endDate,
      totalWeeks: gen.totalWeeks,
      isActive: true,
    });
  const macro = { id: macroId };

  if (!macro) return;

  for (const meso of gen.mesocycles) {
    const mesoId = crypto.randomUUID();
    await db
      .insert(mesocycles)
      .values({
        id: mesoId,
        macrocycleId: macro.id,
        phase: meso.phase,
        orderIndex: meso.orderIndex,
        startDate: meso.startDate,
        endDate: meso.endDate,
        weekCount: meso.weekCount,
        title: meso.title,
        description: meso.description,
        mainObjective: meso.mainObjective,
      });
    const mesoRow = { id: mesoId };

    if (!mesoRow) continue;

    // Generate microcycles and sessions for each week
    for (let w = 0; w < meso.weekCount; w++) {
      const weekStart = new Date(meso.startDate);
      weekStart.setDate(weekStart.getDate() + w * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const microId = crypto.randomUUID();
      await db
        .insert(microcycles)
        .values({
          id: microId,
          mesocycleId: mesoRow.id,
          weekNumber: w + 1,
          startDate: weekStart,
          endDate: weekEnd,
          weekObjective: `Semana ${w + 1} de ${meso.title}`,
          volumeLevel: Math.min(10, 4 + w + meso.orderIndex),
          intensityLevel: Math.min(10, 3 + w + meso.orderIndex),
        });
      const micro = { id: microId };

      if (!micro) continue;

      // Build sessions for each available day
      const sessionTypes: Array<"STRENGTH" | "ENDURANCE" | "TECHNIQUE" | "SIMULATION" | "CARDIO" | "ACTIVE_RECOVERY"> = [
        "STRENGTH",
        "TECHNIQUE",
        "ENDURANCE",
        "SIMULATION",
        "ACTIVE_RECOVERY",
      ];

      for (let i = 0; i < availableDays.length; i++) {
        const day = availableDays[i] as
          | "MONDAY"
          | "TUESDAY"
          | "WEDNESDAY"
          | "THURSDAY"
          | "FRIDAY"
          | "SATURDAY"
          | "SUNDAY";

        // Pick session type based on phase
        let sessionType = sessionTypes[i % sessionTypes.length] ?? "TECHNIQUE";
        if (meso.phase === "REALIZATION" || meso.phase === "PEAK") {
          sessionType = i % 3 === 0 ? "SIMULATION" : "TECHNIQUE";
        }
        if (meso.phase === "TAPERING" && i > 0) {
          sessionType = "ACTIVE_RECOVERY";
        }

        const psessionId = crypto.randomUUID();
        await db
          .insert(plannedSessions)
          .values({
            id: psessionId,
            microcycleId: micro.id,
            dayOfWeek: day,
            sessionType,
            estimatedMinutes: 45 + (i % 2) * 15,
            title: sessionTitle(sessionType, w + 1, meso.phase),
            description: sessionDescription(sessionType, meso.phase),
            orderIndex: i,
          });
        const psession = { id: psessionId };

        if (!psession) continue;

        // Add 2-3 exercise blocks to the session
        const blockCount = sessionType === "SIMULATION" ? 6 : 3;
        const exerciseList = await db
          .select()
          .from(exercises)
          .where(and(eq(exercises.level, level as "GOLD" | "SILVER" | "BRONZE"), eq(exercises.isActive, true)))
          .orderBy(asc(exercises.station))
          .limit(blockCount);

        for (let s = 0; s < exerciseList.length; s++) {
          const ex = exerciseList[s]!;
          await db.insert(plannedBlocks).values({
            plannedSessionId: psession.id,
            exerciseId: ex.id,
            station: ex.station,
            sets: sessionType === "SIMULATION" ? 1 : 3 + (w % 3),
            repsTarget: sessionType === "SIMULATION" ? null : 8 + s * 2,
            durationSeconds: sessionType === "SIMULATION" ? 120 : 60,
            restSeconds: sessionType === "SIMULATION" ? 0 : 90,
            workSeconds: 120,
            transitionSeconds: 120,
            isSimulation: sessionType === "SIMULATION",
            volumeModifier: meso.phase === "ACCUMULATION" ? 1.1 : meso.phase === "TAPERING" ? 0.7 : 1.0,
            orderIndex: s,
          });
        }
      }
    }
  }

  // Welcome notification
  await db.insert(notifications).values({
    athleteId,
    title: "🎉 ¡Plan generado!",
    body: `Tu plan de entrenamiento de ${gen.totalWeeks} semanas está listo. ¡A por el podio!`,
    type: "PLAN_GENERATED",
  });
}

function sessionTitle(
  type: "STRENGTH" | "ENDURANCE" | "TECHNIQUE" | "SIMULATION" | "CARDIO" | "ACTIVE_RECOVERY",
  week: number,
  phase: string
): string {
  const map: Record<string, string> = {
    STRENGTH: "Sesión de Fuerza",
    ENDURANCE: "Sesión de Resistencia",
    TECHNIQUE: "Sesión Técnica",
    SIMULATION: "🔥 Simulacro Oficial",
    CARDIO: "Cardio Metabólico",
    ACTIVE_RECOVERY: "Recuperación Activa",
  };
  return `${map[type]} — Semana ${week} (${phase})`;
}

function sessionDescription(
  type: "STRENGTH" | "ENDURANCE" | "TECHNIQUE" | "SIMULATION" | "CARDIO" | "ACTIVE_RECOVERY",
  phase: string
): string {
  const base: Record<string, string> = {
    STRENGTH: "Trabaja los pesos reglamentarios con cargas submáximas. Foco en fuerza pura.",
    ENDURANCE: "Series largas, recupera poco. Prepara tu cuerpo para los 2 minutos de trabajo.",
    TECHNIQUE: "Calidad sobre cantidad. Ejecuta cada repetición con la máxima precisión técnica.",
    SIMULATION: "Simulacro oficial cronometrado de las 6 estaciones. Registra tus marcas.",
    CARDIO: "20-30 min de cardio a intensidad moderada para mejorar la base aeróbica.",
    ACTIVE_RECOVERY: "Movilidad, foam roller y caminata ligera. Deja que tu cuerpo se recupere.",
  };
  return base[type] + (phase === "TAPERING" ? " Reduce el volumen al 70%." : "");
}
