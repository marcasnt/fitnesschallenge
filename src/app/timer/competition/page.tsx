import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { exercises, trainingSessions, executedBlocks, personalRecords } from "@/db/schema";
import { eq, and, asc, desc } from "drizzle-orm";
import { AppShell } from "@/components/AppShell";
import { CompetitionTimer } from "./CompetitionTimer";

export const dynamic = "force-dynamic";

export default async function CompetitionTimerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");

  const level = user.athlete.competitionLevel;
  const exerciseList = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.level, level), eq(exercises.isActive, true)))
    .orderBy(asc(exercises.station));

  // Load best PRs per station for prediction
  const prs = await db
    .select({ pr: personalRecords, exercise: exercises })
    .from(personalRecords)
    .innerJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
    .where(eq(personalRecords.athleteId, user.athlete.id))
    .orderBy(desc(personalRecords.maxRepsIn2Min));

  const bestPerStation: Record<number, number> = {};
  for (const r of prs) {
    const stationNum = parseInt(r.exercise.station.replace("STATION_", ""), 10);
    if (!bestPerStation[stationNum] && r.pr.maxRepsIn2Min) {
      bestPerStation[stationNum] = r.pr.maxRepsIn2Min;
    }
  }

  return (
    <AppShell athleteName={`${user.athlete.firstName} ${user.athlete.lastName}`}>
      <CompetitionTimer
        level={level}
        athleteGender={user.athlete.gender}
        athleteId={user.athlete.id}
        exercises={exerciseList.map((e) => ({
          id: e.id,
          nameEs: e.nameEs,
          station: e.station,
          isTiebreakerStation: e.isTiebreakerStation,
          weightMaleKg: e.weightMaleKg,
          weightFemaleKg: e.weightFemaleKg,
          weightLabel: e.weightLabel,
        }))}
        bestPerStation={bestPerStation}
      />
    </AppShell>
  );
}
