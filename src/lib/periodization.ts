export type MesocyclePhase =
  | "ACCUMULATION"
  | "TRANSFORMATION"
  | "REALIZATION"
  | "PEAK"
  | "TAPERING";

export type MacrocycleType =
  | "COMPLETE"
  | "STANDARD"
  | "REDUCED"
  | "SHOCK"
  | "PEAK_ONLY";

export interface MacrocycleConfig {
  type: MacrocycleType;
  phases: MesocyclePhase[];
}

export const PHASE_TITLES: Record<MesocyclePhase, string> = {
  ACCUMULATION: "Fase 1: Acumulación — Fuerza Base y Técnica",
  TRANSFORMATION: "Fase 2: Transformación — Resistencia a la Fuerza",
  REALIZATION: "Fase 3: Realización — Simulacros Oficiales",
  PEAK: "Fase 4: Peak — Máximo Rendimiento",
  TAPERING: "Fase Final: Tapering — Puesta a Punto",
};

export const PHASE_DESCRIPTIONS: Record<MesocyclePhase, string> = {
  ACCUMULATION:
    "Construcción de la base de fuerza y dominio técnico de los 6 movimientos. Volumen alto, intensidad media.",
  TRANSFORMATION:
    "Aumento de la capacidad de resistencia muscular y metabólica. Más trabajo específico de cada estación.",
  REALIZATION:
    "Simulacros oficiales completos para cronometrar y medir tu rendimiento real. Ajustes finos de estrategia.",
  PEAK:
    "Afinación del máximo rendimiento. Calidad por encima de cantidad. Preparación mental y técnica definitiva.",
  TAPERING:
    "Descarga controlada para llegar en óptimas condiciones. Mantén la técnica y descansa lo suficiente.",
};

export const PHASE_OBJECTIVES: Record<
  MesocyclePhase,
  Record<string, string>
> = {
  ACCUMULATION: {
    INDIVIDUAL: "Dominar la técnica de los 6 ejercicios y construir fuerza base",
    PAIR_MALE:
      "Sincronizar transiciones y construir fuerza base en pareja masculina",
    PAIR_FEMALE:
      "Sincronizar relevos y construir resistencia en pareja femenina",
    PAIR_MIXED:
      "Adaptarse al peso unificado (excepción en Est.4) y entrenar relevos",
    TEAM_6: "Asignar estaciones y construir técnica individual por estación",
  },
  TRANSFORMATION: {
    INDIVIDUAL: "Mejorar resistencia muscular y metabólica en cada estación",
    PAIR_MALE: "Mejorar transiciones y duplicar la producción por relevo",
    PAIR_FEMALE: "Aumentar volumen total de la pareja",
    PAIR_MIXED: "Coordinar diferencias de peso entre ambos atletas",
    TEAM_6: "Optimizar el rendimiento simultáneo en las 6 estaciones",
  },
  REALIZATION: {
    INDIVIDUAL: "Ejecutar simulacros cronometrados y registrar marcas",
    PAIR_MALE: "Simulacros cronometrados con relevos limpios",
    PAIR_FEMALE: "Cronometrar y medir el total combinado",
    PAIR_MIXED: "Verificar la sincronización bajo la regla de pesos",
    TEAM_6: "Simulacro completo con cambio de estaciones",
  },
  PEAK: {
    INDIVIDUAL: "Maximizar las repeticiones en la estación 6 (desempate)",
    PAIR_MALE: "Pulir la sincronización final",
    PAIR_FEMALE: "Pulir la sincronización final",
    PAIR_MIXED: "Pulir estrategia mixta y Est.4 diferenciada",
    TEAM_6: "Afinar estrategia de equipo y Est.6 desempate",
  },
  TAPERING: {
    INDIVIDUAL: "Llegar fresco, mantener técnica y confianza",
    PAIR_MALE: "Descanso activo, visualizaciones y repaso de estrategia",
    PAIR_FEMALE: "Descanso activo y repaso de transiciones",
    PAIR_MIXED: "Descanso activo y repaso de pesos por estación",
    TEAM_6: "Descanso del equipo y confirmación de asignaciones",
  },
};

export function getMacrocycleConfig(weeks: number): MacrocycleConfig {
  if (weeks >= 16)
    return {
      type: "COMPLETE",
      phases: ["ACCUMULATION", "TRANSFORMATION", "REALIZATION", "PEAK", "TAPERING"],
    };
  if (weeks >= 12)
    return {
      type: "STANDARD",
      phases: ["ACCUMULATION", "TRANSFORMATION", "REALIZATION", "TAPERING"],
    };
  if (weeks >= 8)
    return {
      type: "REDUCED",
      phases: ["TRANSFORMATION", "REALIZATION", "TAPERING"],
    };
  if (weeks >= 4) return { type: "SHOCK", phases: ["REALIZATION", "TAPERING"] };
  return { type: "PEAK_ONLY", phases: ["TAPERING"] };
}

export function distributeWeeks(
  phases: MesocyclePhase[],
  total: number
): number[] {
  const base: Record<MesocyclePhase, number> = {
    ACCUMULATION: 4,
    TRANSFORMATION: 4,
    REALIZATION: 4,
    PEAK: 2,
    TAPERING: 1,
  };
  const baseTotal = phases.reduce((sum, p) => sum + base[p], 0);
  const ratio = total / baseTotal;
  return phases.map((p) => Math.max(1, Math.round(base[p] * ratio)));
}

export interface GeneratedMacrocycle {
  type: MacrocycleType;
  startDate: Date;
  endDate: Date;
  totalWeeks: number;
  mesocycles: Array<{
    phase: MesocyclePhase;
    orderIndex: number;
    startDate: Date;
    endDate: Date;
    weekCount: number;
    title: string;
    description: string;
    mainObjective: string;
  }>;
}

export function generateMacrocycle(opts: {
  competitionDate: Date;
  competitionModality: string;
  competitionLevel: string;
  availableDays: string[];
  maxSessionMinutes: number;
  experienceLevel: number;
}): GeneratedMacrocycle {
  const today = new Date();
  const weeksAvailable = Math.max(
    1,
    Math.floor(
      (opts.competitionDate.getTime() - today.getTime()) /
        (7 * 24 * 60 * 60 * 1000)
    )
  );

  const { type, phases } = getMacrocycleConfig(weeksAvailable);
  const distribution = distributeWeeks(phases, weeksAvailable);

  let cursor = new Date(today);
  const mesocycles = phases.map((phase, index) => {
    const weekCount = distribution[index];
    const startDate = new Date(cursor);
    const endDate = new Date(cursor);
    endDate.setDate(endDate.getDate() + weekCount * 7);
    cursor = endDate;

    return {
      phase,
      orderIndex: index + 1,
      startDate,
      endDate,
      weekCount,
      title: PHASE_TITLES[phase],
      description: PHASE_DESCRIPTIONS[phase],
      mainObjective:
        PHASE_OBJECTIVES[phase][opts.competitionModality] ??
        PHASE_OBJECTIVES[phase]["INDIVIDUAL"],
    };
  });

  return {
    type,
    startDate: today,
    endDate: opts.competitionDate,
    totalWeeks: weeksAvailable,
    mesocycles,
  };
}
