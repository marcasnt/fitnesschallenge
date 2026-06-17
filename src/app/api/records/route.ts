import { db } from "@/db";
import { personalRecords, exercises } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireUser } from "@/lib/auth";
import { ok, bad, handleError } from "@/lib/api-helpers";
import { predictPerformance } from "@/lib/tiebreaker";

export async function GET() {
  try {
    const user = await requireUser();
    if (!user.athlete) return bad("Atleta no encontrado", 404);

    const records = await db
      .select({ pr: personalRecords, exercise: exercises })
      .from(personalRecords)
      .innerJoin(exercises, eq(personalRecords.exerciseId, exercises.id))
      .where(eq(personalRecords.athleteId, user.athlete.id))
      .orderBy(desc(personalRecords.recordDate));

    return ok({ records: records.map((r) => ({ ...r.pr, exercise: r.exercise })) });
  } catch (e) {
    return handleError(e);
  }
}
