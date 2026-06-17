"use client";

import Link from "next/link";
import { Timer as TimerIcon, Users, Zap, ChevronRight } from "lucide-react";
import { LEVEL_DESIGN } from "@/lib/design-tokens";
import { REGULATION_WEIGHTS } from "@/lib/weights";

type Level = "GOLD" | "SILVER" | "BRONZE" | "SPEED_FIT";
type Station = "STATION_1" | "STATION_2" | "STATION_3" | "STATION_4" | "STATION_5" | "STATION_6";

interface ExSummary {
  id: string;
  nameEs: string;
  station: Station;
  isTiebreakerStation: boolean;
  weightMaleKg: number | null;
  weightFemaleKg: number | null;
  weightLabel: string | null;
}

interface Props {
  level: Level;
  exercises: ExSummary[];
  athleteGender: "MALE" | "FEMALE";
}

const MODES = [
  {
    href: "/timer/competition",
    icon: TimerIcon,
    title: "Timer Oficial",
    subtitle: "Circuito individual 2+2 × 6 estaciones",
    color: "from-yellow-400 to-amber-500",
    textColor: "text-black",
    desc: "Simulacro oficial IFBB",
  },
  {
    href: "/timer/pair",
    icon: Users,
    title: "Modo Pareja",
    subtitle: "Relevos alternados 2 atletas",
    color: "from-sky-400 to-cyan-500",
    textColor: "text-black",
    desc: "Suma del total de la pareja",
  },
  {
    href: "/timer/team",
    icon: Users,
    title: "Modo Equipo",
    subtitle: "6 atletas simultáneos",
    color: "from-violet-400 to-purple-500",
    textColor: "text-black",
    desc: "Un atleta por estación",
  },
  {
    href: "/timer/speedfit",
    icon: Zap,
    title: "Speed Fit",
    subtitle: "Cronómetro ascendente",
    color: "from-rose-500 to-red-600",
    textColor: "text-white",
    desc: "Mide tiempo hasta 30/60 reps",
  },
];

export function TimerModeSelector({ level, exercises, athleteGender }: Props) {
  const design = LEVEL_DESIGN[level];
  const totalDuration = 24; // 2 + 2 × 6 = 24 min
  const stationSummary = exercises.map((e) => {
    const w = athleteGender === "MALE" ? e.weightMaleKg : e.weightFemaleKg;
    return {
      station: e.station,
      name: e.nameEs,
      weight: w,
      weightLabel: e.weightLabel,
      isTiebreaker: e.isTiebreakerStation,
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <TimerIcon className="w-5 h-5 text-yellow-400" />
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Centro de Control</span>
        </div>
        <h1 className="text-2xl font-black">Temporizador</h1>
        <p className="text-sm text-slate-400 mt-1">
          Elige un modo de cronómetro. El oficial IFBB es 2 min trabajo + 2 min transición × 6 estaciones
          ({totalDuration} min total).
        </p>
        <div className="mt-3 inline-flex items-center gap-2">
          <div className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest ${design.badge}`}>
            {design.label}
          </div>
          <span className="text-xs text-slate-500">Nivel activo</span>
        </div>
      </div>

      {/* Mode grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          return (
            <Link
              key={mode.href}
              href={mode.href}
              className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 p-5 transition"
            >
              <div className={`inline-flex w-12 h-12 rounded-xl bg-gradient-to-br ${mode.color} items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${mode.textColor}`} strokeWidth={2.5} />
              </div>
              <h3 className="text-lg font-black text-white">{mode.title}</h3>
              <p className="text-sm text-slate-400 mt-0.5">{mode.subtitle}</p>
              <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-wider">{mode.desc}</p>
              <ChevronRight className="absolute top-5 right-5 w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition" />
            </Link>
          );
        })}
      </div>

      {/* Station summary */}
      <div>
        <h2 className="text-lg font-black mb-3">Resumen de Estaciones · {design.label}</h2>
        <div className="space-y-2">
          {stationSummary.map((s) => (
            <div
              key={s.station}
              className={`rounded-xl border p-3 flex items-center gap-3 ${
                s.isTiebreaker ? "bg-amber-950/20 border-amber-800/50" : "bg-slate-900/40 border-slate-800"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black flex-shrink-0 ${
                s.isTiebreaker ? "bg-amber-500/20 text-amber-300" : "bg-slate-800 text-slate-300"
              }`}>
                E{s.station.replace("STATION_", "")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{s.name}</p>
                <p className="text-[10px] text-slate-500 uppercase">
                  {s.weight === 0 ? "Peso corporal" : `${s.weight} kg · ${s.weightLabel}`}
                </p>
              </div>
              {s.isTiebreaker && (
                <div className="text-amber-300 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded bg-amber-500/10 flex-shrink-0">
                  ⭐ Desempate
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
