import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { macrocycles, mesocycles, microcycles, plannedSessions, plannedBlocks, exercises } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { AppShell } from "@/components/AppShell";
import { TrainingClient } from "./TrainingClient";

export const dynamic = "force-dynamic";

export default async function TrainingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");

  const macroRows = await db
    .select()
    .from(macrocycles)
    .where(and(eq(macrocycles.athleteId, user.athlete.id), eq(macrocycles.isActive, true)))
    .limit(1);

  if (macroRows.length === 0) {
    return (
      <AppShell athleteName={user.athlete.firstName}>
        <div className="text-center py-16">
          <p className="text-slate-400">No tienes un plan generado aún. Completa el onboarding.</p>
        </div>
      </AppShell>
    );
  }

  const macro = macroRows[0]!;
  const mesos = await db
    .select()
    .from(mesocycles)
    .where(eq(mesocycles.macrocycleId, macro.id))
    .orderBy(asc(mesocycles.orderIndex));

  const allMicros = await Promise.all(
    mesos.map(async (meso) => {
      const micros = await db
        .select()
        .from(microcycles)
        .where(eq(microcycles.mesocycleId, meso.id))
        .orderBy(asc(microcycles.weekNumber));

      const microsWithSessions = await Promise.all(
        micros.map(async (micro) => {
          const sessions = await db
            .select()
            .from(plannedSessions)
            .where(eq(plannedSessions.microcycleId, micro.id))
            .orderBy(asc(plannedSessions.orderIndex));

          const sessionData = await Promise.all(
            sessions.map(async (s) => {
              const blocks = await db
                .select({ block: plannedBlocks, exercise: exercises })
                .from(plannedBlocks)
                .innerJoin(exercises, eq(plannedBlocks.exerciseId, exercises.id))
                .where(eq(plannedBlocks.plannedSessionId, s.id))
                .orderBy(asc(plannedBlocks.orderIndex));

              return {
                id: s.id,
                dayOfWeek: s.dayOfWeek,
                sessionType: s.sessionType,
                estimatedMinutes: s.estimatedMinutes,
                title: s.title,
                description: s.description,
                orderIndex: s.orderIndex,
                blocks: blocks.map((b) => ({
                  id: b.block.id,
                  exerciseId: b.block.exerciseId,
                  station: b.block.station,
                  sets: b.block.sets,
                  repsTarget: b.block.repsTarget,
                  durationSeconds: b.block.durationSeconds,
                  restSeconds: b.block.restSeconds,
                  isSimulation: b.block.isSimulation,
                  volumeModifier: b.block.volumeModifier,
                  orderIndex: b.block.orderIndex,
                  isTiebreakerStation: b.exercise.isTiebreakerStation,
                  exercise: {
                    nameEs: b.exercise.nameEs,
                    name: b.exercise.name,
                    station: b.exercise.station,
                    level: b.exercise.level,
                    weightMaleKg: b.exercise.weightMaleKg,
                    weightFemaleKg: b.exercise.weightFemaleKg,
                    weightLabel: b.exercise.weightLabel,
                    isTiebreakerStation: b.exercise.isTiebreakerStation,
                  },
                })),
              };
            })
          );

          return {
            id: micro.id,
            weekNumber: micro.weekNumber,
            startDate: micro.startDate,
            endDate: micro.endDate,
            weekObjective: micro.weekObjective,
            volumeLevel: micro.volumeLevel,
            intensityLevel: micro.intensityLevel,
            sessions: sessionData,
          };
        })
      );

      return {
        id: meso.id,
        phase: meso.phase,
        orderIndex: meso.orderIndex,
        startDate: meso.startDate,
        endDate: meso.endDate,
        weekCount: meso.weekCount,
        title: meso.title,
        description: meso.description,
        mainObjective: meso.mainObjective,
        microcycles: microsWithSessions,
      };
    })
  );

  return (
    <AppShell athleteName={`${user.athlete!.firstName} ${user.athlete!.lastName}`}>
      <TrainingClient
        macrocycle={{
          id: macro.id,
          type: macro.type,
          startDate: macro.startDate,
          endDate: macro.endDate,
          totalWeeks: macro.totalWeeks,
        }}
        mesocycles={allMicros}
        athleteLevel={user.athlete!.competitionLevel}
      />
    </AppShell>
  );
}
