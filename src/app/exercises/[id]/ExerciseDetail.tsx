"use client";

import Link from "next/link";
import { ChevronLeft, AlertTriangle, AlertCircle, Ban, Star, CheckCircle2, X, Dumbbell, ShieldAlert, Users } from "lucide-react";
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
  description: string;
  weightMaleKg: number | null;
  weightFemaleKg: number | null;
  weightLabel: string | null;
  mixedPairException: boolean;
  strapsAllowed: boolean;
  isTiebreakerStation: boolean;
  requiresEquipment: string | null;
  techRequirements: string[];
  commonErrors: string[];
}

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
}

const SEVERITY_STYLES: Record<Severity, { bg: string; border: string; text: string; icon: typeof AlertTriangle; label: string }> = {
  WARNING: { bg: "bg-amber-950/30", border: "border-amber-700/50", text: "text-amber-300", icon: AlertTriangle, label: "ADVERTENCIA" },
  INVALID: { bg: "bg-rose-950/30", border: "border-rose-700/50", text: "text-rose-300", icon: AlertCircle, label: "INVÁLIDO" },
  PROHIBITED: { bg: "bg-violet-950/30", border: "border-violet-700/50", text: "text-violet-300", icon: Ban, label: "PROHIBIDO" },
};

interface Props {
  exercise: Ex;
  alerts: Alert[];
  athleteGender: "MALE" | "FEMALE";
}

export function ExerciseDetail({ exercise: ex, alerts, athleteGender }: Props) {
  const design = LEVEL_DESIGN[ex.level];
  const w = athleteGender === "MALE" ? ex.weightMaleKg : ex.weightFemaleKg;
  const stationNum = ex.station.replace("STATION_", "");

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      <Link href="/exercises" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft className="w-4 h-4" /> Biblioteca
      </Link>

      <div className={`rounded-3xl bg-gradient-to-br ${design.gradient} p-[1px]`}>
        <div className="rounded-3xl bg-slate-950 p-6">
          <div className="flex items-start gap-4">
            <div className={`w-16 h-16 rounded-2xl ${design.badge} flex items-center justify-center font-black text-2xl flex-shrink-0 ${
              ex.isTiebreakerStation ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-slate-950" : ""
            }`}>
              E{stationNum}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black tracking-widest ${design.badge}`}>
                  {design.label}
                </span>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Estación {stationNum}</span>
                {ex.isTiebreakerStation && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] font-black uppercase tracking-widest">
                    <Star className="w-3 h-3 fill-current" /> Desempate
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">{ex.nameEs}</h1>
              <p className="text-sm text-slate-400 mt-0.5">{ex.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Weight and metadata */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Peso Hombre</p>
          <p className="text-xl font-black text-white mt-1">{ex.weightMaleKg ?? 0} kg</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Peso Mujer</p>
          <p className="text-xl font-black text-white mt-1">{ex.weightFemaleKg ?? 0} kg</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Tu peso</p>
          <p className="text-xl font-black text-yellow-300 mt-1">{w ?? 0} kg</p>
        </div>
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-3 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Equipo</p>
          <p className="text-sm font-bold text-white mt-1">{ex.weightLabel ?? "—"}</p>
        </div>
      </div>

      {/* Special flags */}
      {(ex.mixedPairException || ex.strapsAllowed || ex.requiresEquipment) && (
        <div className="flex flex-wrap gap-2">
          {ex.mixedPairException && (
            <div className="px-3 py-2 rounded-lg bg-pink-500/10 border border-pink-500/30 text-xs text-pink-300 font-semibold flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Excepción Pareja Mixta
            </div>
          )}
          {ex.strapsAllowed && (
            <div className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Correas permitidas (única estación)
            </div>
          )}
          {ex.requiresEquipment && (
            <div className="px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/30 text-xs text-sky-300 font-semibold flex items-center gap-1.5">
              <Dumbbell className="w-3.5 h-3.5" />
              Requiere: {ex.requiresEquipment.replace("_", " ")}
            </div>
          )}
        </div>
      )}

      {/* Description */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-5">
        <h2 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-2">Descripción</h2>
        <p className="text-sm text-slate-300 leading-relaxed">{ex.description}</p>
      </div>

      {/* Tech requirements */}
      <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-5">
        <h2 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Requisitos Técnicos
        </h2>
        <ul className="space-y-2">
          {ex.techRequirements.map((r, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-200">
              <span className="text-emerald-400 font-black flex-shrink-0">✓</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Common errors */}
      {ex.commonErrors.length > 0 && (
        <div className="rounded-2xl bg-rose-950/20 border border-rose-900/40 p-5">
          <h2 className="text-sm uppercase tracking-widest text-rose-400 font-bold mb-3 flex items-center gap-2">
            <X className="w-4 h-4" />
            Errores Comunes (invalidan la rep)
          </h2>
          <ul className="space-y-1.5">
            {ex.commonErrors.map((e, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-rose-200/80">
                <span className="text-rose-400 font-black flex-shrink-0">✗</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tech alerts (juez virtual) */}
      {alerts.length > 0 && (
        <div className="space-y-2.5">
          <h2 className="text-sm uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-yellow-400" />
            Juez Virtual — Alertas Técnicas
          </h2>
          {alerts.map((a) => {
            const s = SEVERITY_STYLES[a.severity];
            const Icon = s.icon;
            return (
              <div key={a.id} className={`rounded-xl ${s.bg} border ${s.border} p-4`}>
                <div className="flex items-start gap-3">
                  <Icon className={`w-5 h-5 ${s.text} flex-shrink-0 mt-0.5`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs uppercase tracking-widest font-black ${s.text} mb-1`}>
                      {s.label}
                    </p>
                    <p className={`text-sm font-bold ${s.text}`}>{a.title}</p>
                    <p className="text-sm text-slate-300 mt-1">{a.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="pt-2">
        <Link
          href="/timer/competition"
          className="block w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-center shadow-[0_8px_30px_rgba(255,215,0,0.25)] hover:scale-[1.01] transition"
        >
          Practicar en simulacro oficial
        </Link>
      </div>
    </div>
  );
}
