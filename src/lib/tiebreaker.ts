export interface AthleteResult {
  athleteId: string;
  totalReps: number;
  repsByStation: Record<number, number>;
  level: "GOLD" | "SILVER" | "BRONZE";
}

export function resolveCompetitionTie(
  results: AthleteResult[]
): AthleteResult[] {
  return [...results].sort((a, b) => {
    if (b.totalReps !== a.totalReps) return b.totalReps - a.totalReps;
    const s6A = a.repsByStation[6] ?? 0;
    const s6B = b.repsByStation[6] ?? 0;
    if (s6B !== s6A) return s6B - s6A;
    return 0;
  });
}

export interface PerformanceHistory {
  date: Date;
  repsIn2Min: number;
}

export function predictPerformance(
  history: PerformanceHistory[],
  targetDate: Date
): { predictedReps: number; confidence: "HIGH" | "MEDIUM" | "LOW" } {
  if (history.length < 1) return { predictedReps: 0, confidence: "LOW" };
  if (history.length < 3) {
    return {
      predictedReps: history[history.length - 1].repsIn2Min,
      confidence: "LOW",
    };
  }

  const n = history.length;
  const x = history.map((_, i) => i);
  const y = history.map((h) => h.repsIn2Min);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) {
    return {
      predictedReps: history[history.length - 1].repsIn2Min,
      confidence: "LOW",
    };
  }

  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const weeksLeft = Math.max(
    0,
    Math.floor(
      (targetDate.getTime() - new Date().getTime()) / (7 * 24 * 60 * 60 * 1000)
    )
  );

  const projected = Math.round(intercept + slope * (n + weeksLeft));
  return {
    predictedReps: Math.max(0, projected),
    confidence: n >= 6 ? "HIGH" : "MEDIUM",
  };
}
