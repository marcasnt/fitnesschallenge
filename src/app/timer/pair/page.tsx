import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { AppShell } from "@/components/AppShell";
import { PairTimer } from "./PairTimer";

export const dynamic = "force-dynamic";

export default async function PairTimerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");

  const exerciseList = await db
    .select()
    .from(exercises)
    .where(and(eq(exercises.level, user.athlete.competitionLevel), eq(exercises.isActive, true)))
    .orderBy(asc(exercises.station));

  return (
    <AppShell athleteName={`${user.athlete.firstName} ${user.athlete.lastName}`}>
      <PairTimer
        athleteName={user.athlete.firstName}
        level={user.athlete.competitionLevel}
        exercises={exerciseList.map((e) => ({
          nameEs: e.nameEs,
          station: e.station,
          isTiebreakerStation: e.isTiebreakerStation,
          weightMaleKg: e.weightMaleKg,
          weightFemaleKg: e.weightFemaleKg,
          weightLabel: e.weightLabel,
        }))}
      />
    </AppShell>
  );
}
