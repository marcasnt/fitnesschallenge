import type { CompetitionLevel } from "./category";

export const REGULATION_WEIGHTS: Record<
  CompetitionLevel,
  Record<
    "STATION_1" | "STATION_2" | "STATION_3" | "STATION_4" | "STATION_5" | "STATION_6",
    { male: number | null; female: number | null; label: string }
  >
> = {
  GOLD: {
    STATION_1: { male: 0, female: 0, label: "Peso corporal" },
    STATION_2: { male: 32, female: 24, label: "Kettlebell (kg)" },
    STATION_3: { male: 0, female: 0, label: "Peso corporal" },
    STATION_4: { male: 50, female: 30, label: "Barra (kg)" },
    STATION_5: { male: 0, female: 0, label: "Peso corporal" },
    STATION_6: { male: 15, female: 10, label: "Par de mancuernas (kg c/u)" },
  },
  SILVER: {
    STATION_1: { male: 0, female: 0, label: "Peso corporal" },
    STATION_2: { male: 60, female: 40, label: "Barra (kg)" },
    STATION_3: { male: 0, female: 0, label: "Peso corporal" },
    STATION_4: { male: 15, female: 10, label: "Par de mancuernas (kg c/u)" },
    STATION_5: { male: 10, female: 10, label: "Disco sobre el pecho (kg)" },
    STATION_6: { male: 12, female: 8, label: "Kettlebell (kg)" },
  },
  BRONZE: {
    STATION_1: { male: 0, female: 0, label: "Peso corporal asistido" },
    STATION_2: { male: 32, female: 24, label: "Kettlebell (kg)" },
    STATION_3: { male: 0, female: 0, label: "Peso corporal" },
    STATION_4: { male: 12.5, female: 7.5, label: "Par de mancuernas (kg c/u)" },
    STATION_5: { male: 0, female: 0, label: "Sin peso" },
    STATION_6: { male: 12, female: 8, label: "Kettlebell (kg)" },
  },
  SPEED_FIT: {
    STATION_1: { male: 0, female: 0, label: "Peso corporal" },
    STATION_2: { male: 32, female: 24, label: "Kettlebell (kg)" },
    STATION_3: { male: 0, female: 0, label: "Peso corporal" },
    STATION_4: { male: 50, female: 30, label: "Barra (kg)" },
    STATION_5: { male: 0, female: 0, label: "Peso corporal" },
    STATION_6: { male: 15, female: 10, label: "Par de mancuernas (kg c/u)" },
  },
};

export interface WeightResult {
  weightKg: number;
  label: string;
  isUnified: boolean;
  ruleNote?: string;
}

export function getRegulationWeight(
  exerciseLevel: CompetitionLevel,
  station: 1 | 2 | 3 | 4 | 5 | 6,
  gender: "MALE" | "FEMALE",
  modality: string,
  partnerGender?: "MALE" | "FEMALE"
): WeightResult {
  const stationKey = `STATION_${station}` as const;
  const weights = REGULATION_WEIGHTS[exerciseLevel][stationKey];

  if (modality === "PAIR_MIXED" && partnerGender) {
    if (station === 4) {
      return {
        weightKg: gender === "MALE" ? (weights.male ?? 0) : (weights.female ?? 0),
        label: weights.label,
        isUnified: false,
        ruleNote:
          "Excepción reglamentaria: zancadas caminando permite peso diferenciado en pareja mixta",
      };
    }
    return {
      weightKg: weights.male ?? 0,
      label: weights.label,
      isUnified: true,
      ruleNote:
        "⚠️ Pareja Mixta: ambos atletas usan el mismo peso en esta estación",
    };
  }

  return {
    weightKg: gender === "MALE" ? (weights.male ?? 0) : (weights.female ?? 0),
    label: weights.label,
    isUnified: false,
  };
}
