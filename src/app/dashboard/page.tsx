import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { athletes, macrocycles, mesocycles, microcycles, plannedSessions, trainingSessions, notifications, personalRecords, exercises } from "@/db/schema";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm";
import { AppShell } from "@/components/AppShell";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");
  if (!user.athlete.competitionDate) redirect("/onboarding");

  const athlete = user.athlete;

  const daysUntil = athlete.competitionDate
    ? Math.max(0, Math.ceil((athlete.competitionDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
    : null;

  const macroRows = await db
    .select()
    .from(macrocycles)
    .where(and(eq(macrocycles.athleteId, athlete.id), eq(macrocycles.isActive, true)))
    .limit(1);

  let currentMeso = null;
  let currentMicro = null;
  let todaysSessions: Array<{ id: string; title: string; sessionType: string; estimatedMinutes: number; dayOfWeek: string; description: string; }> = [];

  if (macroRows.length > 0) {
    const now = new Date();
    const microRows = await db
      .select({ micro: microcycles, meso: mesocycles })
      .from(microcycles)
      .innerJoin(mesocycles, eq(microcycles.mesocycleId, mesocycles.id))
      .where(
        and(
          eq(mesocycles.macrocycleId, macroRows[0]!.id),
          lte(microcycles.startDate, now),
          gte(microcycles.endDate, now)
        )
      )
      .limit(1);

    if (microRows.length > 0) {
      currentMeso = microRows[0]!.meso;
      currentMicro = microRows[0]!.micro;

      const dayMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
      const todayName = dayMap[now.getDay()]!;
      const availableDays = JSON.parse(athlete.availableDaysJson) as string[];

      if (availableDays.includes(todayName)) {
        const psessions = await db
          .select()
          .from(plannedSessions)
          .where(eq(plannedSessions.microcycleId, currentMicro.id))
          .orderBy(asc(plannedSessions.orderIndex));

        todaysSessions = psessions
          .filter((s) => s.dayOfWeek === todayName)
          .map((s) => ({
            id: s.id,
            title: s.title,
            sessionType: s.sessionType,
            estimatedMinutes: s.estimatedMinutes,
            dayOfWeek: s.dayOfWeek,
            description: s.description,
          }));
      }
    }
  }

  const recentPRs = await db
    .select({ pr: personalRecords, exercise: exercises })
    .from(personalRecords)
    .innerJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
    .where(eq(personalRecords.athleteId, athlete.id))
    .orderBy(desc(personalRecords.recordDate))
    .limit(5);

  const lastSessions = await db
    .select()
    .from(trainingSessions)
    .where(eq(trainingSessions.athleteId, athlete.id))
    .orderBy(desc(trainingSessions.sessionDate))
    .limit(10);

  const notifs = await db
    .select()
    .from(notifications)
    .where(eq(notifications.athleteId, athlete.id))
    .orderBy(desc(notifications.createdAt))
    .limit(5);

  return (
    <AppShell athleteName={`${athlete.firstName} ${athlete.lastName}`}>
      <DashboardClient
        athlete={athlete}
        daysUntil={daysUntil}
        currentMeso={currentMeso}
        currentMicro={currentMicro}
        todaysSessions={todaysSessions}
        recentPRs={recentPRs.map((r) => ({ ...r.pr, exercise: r.exercise }))}
        lastSessions={lastSessions}
        notifications={notifs}
      />
    </AppShell>
  );
}
