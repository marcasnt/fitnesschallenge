import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { exercises, techAlerts } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { AppShell } from "@/components/AppShell";
import { ExerciseDetail } from "./ExerciseDetail";

export const dynamic = "force-dynamic";

export default async function ExerciseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");

  const { id } = await params;
  const rows = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
  if (rows.length === 0) notFound();
  const ex = rows[0]!;

  const alerts = await db
    .select()
    .from(techAlerts)
    .where(eq(techAlerts.exerciseId, id))
    .orderBy(asc(techAlerts.sortOrder));

  const reqs = JSON.parse(ex.techRequirementsJson) as string[];
  const errors = ex.commonErrorsJson ? (JSON.parse(ex.commonErrorsJson) as string[]) : [];

  return (
    <AppShell athleteName={`${user.athlete.firstName} ${user.athlete.lastName}`}>
      <ExerciseDetail
        exercise={{
          id: ex.id,
          name: ex.name,
          nameEs: ex.nameEs,
          station: ex.station,
          level: ex.level,
          description: ex.description,
          weightMaleKg: ex.weightMaleKg,
          weightFemaleKg: ex.weightFemaleKg,
          weightLabel: ex.weightLabel,
          mixedPairException: ex.mixedPairException,
          strapsAllowed: ex.strapsAllowed,
          isTiebreakerStation: ex.isTiebreakerStation,
          requiresEquipment: ex.requiresEquipment,
          techRequirements: reqs,
          commonErrors: errors,
        }}
        alerts={alerts.map((a) => ({ id: a.id, title: a.title, description: a.description, severity: a.severity }))}
        athleteGender={user.athlete.gender}
      />
    </AppShell>
  );
}
