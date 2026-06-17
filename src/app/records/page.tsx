import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { personalRecords, exercises } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { AppShell } from "@/components/AppShell";
import { RecordsClient } from "./RecordsClient";

export const dynamic = "force-dynamic";

export default async function RecordsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");

  const records = await db
    .select({ pr: personalRecords, exercise: exercises })
    .from(personalRecords)
    .innerJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
    .where(eq(personalRecords.athleteId, user.athlete.id))
    .orderBy(desc(personalRecords.maxRepsIn2Min));

  return (
    <AppShell athleteName={`${user.athlete.firstName} ${user.athlete.lastName}`}>
      <RecordsClient
        records={records.map((r) => ({
          id: r.pr.id,
          maxRepsIn2Min: r.pr.maxRepsIn2Min,
          recordDate: r.pr.recordDate,
          exercise: {
            nameEs: r.exercise.nameEs,
            station: r.exercise.station,
            level: r.exercise.level,
            isTiebreakerStation: r.exercise.isTiebreakerStation,
          },
        }))}
      />
    </AppShell>
  );
}
