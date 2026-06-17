import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { ProfileClient } from "./ProfileClient";
import { calculateAge } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");

  const a = user.athlete;
  const age = calculateAge(a.dateOfBirth);

  return (
    <AppShell athleteName={`${a.firstName} ${a.lastName}`}>
      <ProfileClient
        athlete={{
          id: a.id,
          firstName: a.firstName,
          lastName: a.lastName,
          email: user.email,
          dateOfBirth: a.dateOfBirth,
          gender: a.gender,
          ageCategory: a.ageCategory,
          competitionLevel: a.competitionLevel,
          competitionModality: a.competitionModality,
          competitionDate: a.competitionDate,
          bodyWeightKg: a.bodyWeightKg,
          maxSessionMinutes: a.maxSessionMinutes,
          experienceLevel: a.experienceLevel,
        }}
        age={age}
      />
    </AppShell>
  );
}
