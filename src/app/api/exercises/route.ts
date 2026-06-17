import { db } from "@/db";
import { exercises, techAlerts } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { ok, handleError } from "@/lib/api-helpers";
import { IFBB_EXERCISES_SEED } from "@/lib/seed-exercises";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const level = url.searchParams.get("level");
    const station = url.searchParams.get("station");

    // Check if seed already exists, otherwise seed it
    const existing = await db.select().from(exercises).limit(1);
    if (existing.length === 0) {
      await seedExercises();
    }

    const conditions = [eq(exercises.isActive, true)];
    if (level) conditions.push(eq(exercises.level, level as "GOLD" | "SILVER" | "BRONZE" | "SPEED_FIT"));
    if (station) conditions.push(eq(exercises.station, station as "STATION_1" | "STATION_2" | "STATION_3" | "STATION_4" | "STATION_5" | "STATION_6"));

    const list = await db
      .select()
      .from(exercises)
      .where(and(...conditions))
      .orderBy(asc(exercises.level), asc(exercises.station));

    // Attach alerts
    const result = await Promise.all(
      list.map(async (ex) => {
        const alerts = await db
          .select()
          .from(techAlerts)
          .where(eq(techAlerts.exerciseId, ex.id))
          .orderBy(asc(techAlerts.sortOrder));
        return { ...ex, techAlerts: alerts };
      })
    );

    return ok({ exercises: result });
  } catch (e) {
    return handleError(e);
  }
}

export async function seedExercises() {
  for (const ex of IFBB_EXERCISES_SEED) {
    const { techAlerts: alerts, ...exerciseData } = ex;
    const exerciseId = crypto.randomUUID();
    await db
      .insert(exercises)
      .values({
        ...exerciseData,
        id: exerciseId,
      });
    if (alerts.length > 0) {
      await db.insert(techAlerts).values(
        alerts.map((a) => ({
          ...a,
          exerciseId,
        }))
      );
    }
  }
}
