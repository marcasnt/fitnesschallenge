import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!user.athlete) redirect("/onboarding");
  if (!user.athlete.competitionDate) redirect("/onboarding");
  redirect("/dashboard");
}
