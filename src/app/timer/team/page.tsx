import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AppShell } from "@/components/AppShell";
import { TeamTimer } from "./TeamTimer";

export const dynamic = "force-dynamic";

export default async function TeamTimerPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");

  return (
    <AppShell athleteName={`${user.athlete.firstName} ${user.athlete.lastName}`}>
      <TeamTimer leaderName={user.athlete.firstName} />
    </AppShell>
  );
}
