"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Calendar, Timer as TimerIcon, Dumbbell, ChevronDown, ChevronUp } from "lucide-react";
import { PHASE_COLORS, LEVEL_DESIGN } from "@/lib/design-tokens";
import { REGULATION_WEIGHTS } from "@/lib/weights";

type Phase = "ACCUMULATION" | "TRANSFORMATION" | "REALIZATION" | "PEAK" | "TAPERING";
type Level = "GOLD" | "SILVER" | "BRONZE" | "SPEED_FIT";
type Gender = "MALE" | "FEMALE";
type Station = "STATION_1" | "STATION_2" | "STATION_3" | "STATION_4" | "STATION_5" | "STATION_6";

interface Block {
  id: string;
  exerciseId: string;
  station: Station | null;
  sets: number | null;
  repsTarget: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  isSimulation: boolean;
  volumeModifier: number;
  orderIndex: number;
  isTiebreakerStation: boolean;
  exercise: { nameEs: string; name: string; station: Station; level: Level; weightMaleKg: number | null; weightFemaleKg: number | null; weightLabel: string | null; isTiebreakerStation: boolean };
}

interface Session {
  id: string;
  dayOfWeek: string;
  sessionType: string;
  estimatedMinutes: number;
  title: string;
  description: string;
  orderIndex: number;
  blocks: Block[];
}

interface Microcycle {
  id: string;
  weekNumber: number;
  startDate: Date | string;
  endDate: Date | string;
  weekObjective: string;
  volumeLevel: number;
  intensityLevel: number;
  sessions: Session[];
}

interface Mesocycle {
  id: string;
  phase: Phase;
  orderIndex: number;
  startDate: Date | string;
  endDate: Date | string;
  weekCount: number;
  title: string;
  description: string;
  mainObjective: string;
  microcycles: Microcycle[];
}

interface Props {
  macrocycle: { id: string; type: string; startDate: Date | string; endDate: Date | string; totalWeeks: number };
  mesocycles: Mesocycle[];
  athleteLevel: Level;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: "L", TUESDAY: "M", WEDNESDAY: "X", THURSDAY: "J", FRIDAY: "V", SATURDAY: "S", SUNDAY: "D",
};
const DAY_NAMES: Record<string, string> = {
  MONDAY: "Lunes", TUESDAY: "Martes", WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves", FRIDAY: "Viernes", SATURDAY: "Sábado", SUNDAY: "Domingo",
};

const SESSION_META: Record<string, { label: string; color: string; emoji: string }> = {
  STRENGTH: { label: "Fuerza", color: "from-blue-500 to-indigo-600", emoji: "💪" },
  ENDURANCE: { label: "Resistencia", color: "from-amber-500 to-orange-600", emoji: "🔥" },
  TECHNIQUE: { label: "Técnica", color: "from-emerald-500 to-teal-600", emoji: "🎯" },
  SIMULATION: { label: "Simulacro", color: "from-rose-500 to-red-700", emoji: "⚡" },
  CARDIO: { label: "Cardio", color: "from-sky-500 to-cyan-600", emoji: "🏃" },
  ACTIVE_RECOVERY: { label: "Recuperación", color: "from-violet-500 to-purple-700", emoji: "🧘" },
  REST: { label: "Descanso", color: "from-slate-500 to-slate-700", emoji: "😴" },
};

export function TrainingClient({ macrocycle, mesocycles, athleteLevel }: Props) {
  const [selectedMesoIdx, setSelectedMesoIdx] = useState(0);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);

  const selectedMeso = mesocycles[selectedMesoIdx];
  if (!selectedMeso) {
    return <p className="text-slate-400">No hay mesociclos</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="w-4 h-4 text-yellow-400" />
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Macrociclo</span>
        </div>
        <h1 className="text-2xl font-black">Plan de Entrenamiento</h1>
        <div className="mt-3 flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-slate-500 text-xs">Tipo</span>
            <p className="font-bold">{macrocycle.type}</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs">Semanas</span>
            <p className="font-bold">{macrocycle.totalWeeks}</p>
          </div>
          <div>
            <span className="text-slate-500 text-xs">Nivel</span>
            <p className="font-bold">{LEVEL_DESIGN[athleteLevel].label}</p>
          </div>
        </div>
      </div>

      {/* Meso selector */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => setSelectedMesoIdx((i) => Math.max(0, i - 1))}
          disabled={selectedMesoIdx === 0}
          className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-30 transition"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Mesociclo</p>
          <h2 className="text-lg font-black" style={{ color: PHASE_COLORS[selectedMeso.phase].color }}>
            {PHASE_COLORS[selectedMeso.phase].label}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">{selectedMeso.weekCount} semanas</p>
        </div>
        <button
          onClick={() => setSelectedMesoIdx((i) => Math.min(mesocycles.length - 1, i + 1))}
          disabled={selectedMesoIdx === mesocycles.length - 1}
          className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 disabled:opacity-30 transition"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Meso description */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-4">
        <p className="text-sm text-slate-300">{selectedMeso.mainObjective}</p>
      </div>

      {/* Microcycles (weeks) */}
      <div className="space-y-3">
        {selectedMeso.microcycles.map((micro) => {
          const grouped: Record<string, Session[]> = {};
          for (const s of micro.sessions) {
            if (!grouped[s.dayOfWeek]) grouped[s.dayOfWeek] = [];
            grouped[s.dayOfWeek]!.push(s);
          }
          const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

          return (
            <div key={micro.id} className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
              <div className="px-5 py-3 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Semana</p>
                  <p className="text-lg font-black">Semana {micro.weekNumber}</p>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="px-2 py-1 rounded-md bg-blue-500/15 text-blue-300 font-semibold">V: {micro.volumeLevel}/10</span>
                  <span className="px-2 py-1 rounded-md bg-rose-500/15 text-rose-300 font-semibold">I: {micro.intensityLevel}/10</span>
                </div>
              </div>
              <div className="p-3 space-y-2">
                {dayOrder.map((d) => {
                  const dSessions = grouped[d];
                  if (!dSessions || dSessions.length === 0) return null;
                  return dSessions.map((s) => {
                    const meta = SESSION_META[s.sessionType] ?? SESSION_META.TECHNIQUE!;
                    const isExpanded = expandedSession === s.id;
                    return (
                      <div key={s.id} className="rounded-xl bg-slate-950/60 border border-slate-800/60 overflow-hidden">
                        <button
                          onClick={() => setExpandedSession(isExpanded ? null : s.id)}
                          className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-900/40 transition"
                        >
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${meta.color} flex items-center justify-center text-lg flex-shrink-0`}>
                            {meta.emoji}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{s.title}</p>
                            <p className="text-[10px] text-slate-500 uppercase">{DAY_NAMES[d]} · {s.estimatedMinutes} min</p>
                          </div>
                          {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>
                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-2">
                            <p className="text-xs text-slate-400 italic mb-2">{s.description}</p>
                            {s.blocks.length === 0 ? (
                              <p className="text-xs text-slate-500">Sin bloques de ejercicios</p>
                            ) : (
                              s.blocks.map((b) => {
                                const stationNum = b.station ? b.station.replace("STATION_", "") : "?";
                                return (
                                  <div key={b.id} className="rounded-lg bg-slate-900/80 p-3 flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-md flex items-center justify-center font-black text-xs flex-shrink-0 ${b.exercise.isTiebreakerStation ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-300"}`}>
                                      E{stationNum}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold text-white truncate">{b.exercise.nameEs}</p>
                                      <p className="text-[10px] text-slate-500">
                                        {b.isSimulation ? "🔥 Simulacro" : `${b.sets}×${b.repsTarget ?? "—"}`}
                                        {b.durationSeconds && ` · ${b.durationSeconds}s`}
                                        {b.restSeconds && b.restSeconds > 0 && ` · Descanso ${b.restSeconds}s`}
                                        {b.isTiebreakerStation && " · ⭐ Desempate"}
                                      </p>
                                    </div>
                                    <Link
                                      href={`/exercises/${b.exerciseId}`}
                                      className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 flex-shrink-0"
                                    >
                                      <Dumbbell className="w-3.5 h-3.5" />
                                    </Link>
                                  </div>
                                );
                              })
                            )}
                            {s.sessionType === "SIMULATION" && (
                              <Link
                                href="/timer/competition"
                                className="mt-3 w-full py-3 rounded-lg bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-sm flex items-center justify-center gap-2"
                              >
                                <TimerIcon className="w-4 h-4" />
                                Iniciar Simulacro Oficial
                              </Link>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  });
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
