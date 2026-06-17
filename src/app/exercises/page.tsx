import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { exercises, techAlerts } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { AppShell } from "@/components/AppShell";
import { ExercisesClient } from "./ExercisesClient";

export const dynamic = "force-dynamic";

export default async function ExercisesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");

  const all = await db
    .select()
    .from(exercises)
    .where(eq(exercises.isActive, true))
    .orderBy(asc(exercises.level), asc(exercises.station));

  const withAlerts = await Promise.all(
    all.map(async (e) => {
      const alerts = await db
        .select()
        .from(techAlerts)
        .where(eq(techAlerts.exerciseId, e.id))
        .orderBy(asc(techAlerts.sortOrder));
      return { ...e, techAlerts: alerts };
    })
  );

  return (
    <AppShell athleteName={`${user.athlete.firstName} ${user.athlete.lastName}`}>
      <ExercisesClient
        exercises={withAlerts.map((e) => ({
          id: e.id,
          name: e.name,
          nameEs: e.nameEs,
          station: e.station,
          level: e.level,
          weightMaleKg: e.weightMaleKg,
          weightFemaleKg: e.weightFemaleKg,
          weightLabel: e.weightLabel,
          mixedPairException: e.mixedPairException,
          strapsAllowed: e.strapsAllowed,
          isTiebreakerStation: e.isTiebreakerStation,
          techAlerts: e.techAlerts.map((a) => ({ id: a.id, title: a.title, severity: a.severity })),
        }))}
        athleteGender={user.athlete.gender}
      />
    </AppShell>
  );
}
