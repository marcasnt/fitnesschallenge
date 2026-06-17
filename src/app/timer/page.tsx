import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { AppShell } from "@/components/AppShell";
import { TimerModeSelector } from "./TimerModeSelector";

export const dynamic = "force-dynamic";

export default async function TimerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");

  // Load exercises for the current level
  const level = user.athlete.competitionLevel;
  const exerciseList = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.level, level), eq(exercises.isActive, true)))
    .orderBy(asc(exercises.station));

  return (
    <AppShell athleteName={`${user.athlete.firstName} ${user.athlete.lastName}`}>
      <TimerModeSelector
        level={level}
        exercises={exerciseList.map((e) => ({
          id: e.id,
          nameEs: e.nameEs,
          station: e.station,
          isTiebreakerStation: e.isTiebreakerStation,
          weightMaleKg: e.weightMaleKg,
          weightFemaleKg: e.weightFemaleKg,
          weightLabel: e.weightLabel,
        }))}
        athleteGender={user.athlete.gender}
      />
    </AppShell>
  );
}
