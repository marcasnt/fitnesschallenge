"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Dumbbell, AlertTriangle, AlertCircle, Ban, Star, Filter, ChevronRight, Zap } from "lucide-react";
import { LEVEL_DESIGN } from "@/lib/design-tokens";

type Level = "GOLD" | "SILVER" | "BRONZE" | "SPEED_FIT";
type Station = "STATION_1" | "STATION_2" | "STATION_3" | "STATION_4" | "STATION_5" | "STATION_6";
type Severity = "WARNING" | "INVALID" | "PROHIBITED";

interface Ex {
  id: string;
  name: string;
  nameEs: string;
  station: Station;
  level: Level;
  weightMaleKg: number | null;
  weightFemaleKg: number | null;
  weightLabel: string | null;
  mixedPairException: boolean;
  strapsAllowed: boolean;
  isTiebreakerStation: boolean;
  techAlerts: Array<{ id: string; title: string; severity: Severity }>;
}

interface Props {
  exercises: Ex[];
  athleteGender: "MALE" | "FEMALE";
}

const SEVERITY_STYLES: Record<Severity, { bg: string; text: string; icon: typeof AlertTriangle }> = {
  WARNING: { bg: "bg-amber-950/30 border-amber-800/40", text: "text-amber-300", icon: AlertTriangle },
  INVALID: { bg: "bg-rose-950/30 border-rose-800/40", text: "text-rose-300", icon: AlertCircle },
  PROHIBITED: { bg: "bg-violet-950/30 border-violet-800/40", text: "text-violet-300", icon: Ban },
};

const LEVELS: Level[] = ["GOLD", "SILVER", "BRONZE", "SPEED_FIT"];

export function ExercisesClient({ exercises, athleteGender }: Props) {
  const [filter, setFilter] = useState<Level | "ALL">("ALL");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = exercises;
    if (filter !== "ALL") list = list.filter((e) => e.level === filter);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.nameEs.toLowerCase().includes(q) || e.name.toLowerCase().includes(q));
    }
    return list;
  }, [exercises, filter, search]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Dumbbell className="w-5 h-5 text-emerald-400" />
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Catálogo</span>
        </div>
        <h1 className="text-2xl font-black">Biblioteca de Ejercicios</h1>
        <p className="text-sm text-slate-400 mt-1">
          Los {exercises.length} ejercicios reglamentarios IFBB con su juez virtual
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar ejercicio..."
          className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm focus:border-yellow-500/60 focus:outline-none"
        />
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
              filter === "ALL" ? "bg-yellow-500 text-black" : "bg-slate-800/60 text-slate-400"
            }`}
          >
            Todos
          </button>
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className={`px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap ${
                filter === l ? LEVEL_DESIGN[l].badge + " ring-2 ring-white/20" : "bg-slate-800/60 text-slate-400"
              }`}
            >
              {LEVEL_DESIGN[l].label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2.5">
        {filtered.map((ex) => {
          const w = athleteGender === "MALE" ? ex.weightMaleKg : ex.weightFemaleKg;
          const design = LEVEL_DESIGN[ex.level];
          const stationNum = ex.station.replace("STATION_", "");
          const maxSeverity = ex.techAlerts.reduce<Severity | null>((acc, a) => {
            if (a.severity === "PROHIBITED") return "PROHIBITED";
            if (a.severity === "INVALID" && acc !== "PROHIBITED") return "INVALID";
            if (a.severity === "WARNING" && !acc) return "WARNING";
            return acc;
          }, null);
          const severityStyle = maxSeverity ? SEVERITY_STYLES[maxSeverity] : null;
          const SevIcon = severityStyle?.icon ?? AlertTriangle;

          return (
            <Link
              key={ex.id}
              href={`/exercises/${ex.id}`}
              className="block rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 p-4 transition"
            >
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${design.badge} flex items-center justify-center font-black flex-shrink-0 ${
                  ex.isTiebreakerStation ? "ring-2 ring-amber-400" : ""
                }`}>
                  E{stationNum}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-white">{ex.nameEs}</h3>
                    {ex.isTiebreakerStation && (
                      <span className="text-amber-400" title="Estación de desempate">
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </span>
                    )}
                    {ex.strapsAllowed && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold uppercase tracking-wider">Correas</span>
                    )}
                    {ex.mixedPairException && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-pink-500/15 text-pink-300 font-bold uppercase tracking-wider">Excepción Pareja Mixta</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                    {design.label} · {w === 0 ? "Peso corporal" : `${w} kg · ${ex.weightLabel}`}
                  </p>
                </div>
                {severityStyle && (
                  <div className={`flex-shrink-0 w-9 h-9 rounded-lg ${severityStyle.bg} flex items-center justify-center`}>
                    <SevIcon className={`w-4 h-4 ${severityStyle.text}`} />
                  </div>
                )}
                <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
              </div>
            </Link>
          );
        })}
        {filtered.length === 0 && (
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-8 text-center text-slate-400">
            No hay ejercicios con esos filtros
          </div>
        )}
      </div>
    </div>
  );
}
