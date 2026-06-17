"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Play, Pause, RotateCcw, Plus, Minus, Zap, Trophy } from "lucide-react";
import { useOfficialTimer, formatTime } from "@/hooks/useOfficialTimer";
import { sounds, primeAudio } from "@/lib/timer-sounds";

type Station = "STATION_1" | "STATION_2" | "STATION_3" | "STATION_4" | "STATION_5" | "STATION_6";
interface Ex { nameEs: string; station: Station; isTiebreakerStation: boolean }

interface Props { exercises: Ex[]; mode: "INDIVIDUAL" | "TEAM_4" }

export function SpeedFitTimer({ exercises, mode }: Props) {
  const TARGET = mode === "TEAM_4" ? 60 : 30;
  const { state, start, pause, reset, addRep, removeRep } = useOfficialTimer({
    mode: "SPEEDFIT",
    speedFitTargetReps: TARGET,
  });
  const [reps, setReps] = useState<Record<number, number>>({});

  const isComplete = state.phase === "COMPLETE";
  const isRunning = state.isRunning;

  function add(station: number) {
    sounds.repClick();
    setReps((p) => ({ ...p, [station]: (p[station] ?? 0) + 1 }));
  }
  function remove(station: number) {
    setReps((p) => ({ ...p, [station]: Math.max(0, (p[station] ?? 0) - 1) }));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/timer" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-rose-500/10 to-red-900/10 border border-rose-800/40 p-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-rose-400" />
          <h1 className="text-xl font-black">Speed Fit · Cronómetro</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Cronómetro ascendente. Target: {TARGET} reps por estación ({mode === "TEAM_4" ? "equipo de 4" : "individual"}).
        </p>
      </div>

      {/* Big stopwatch */}
      <div className={`rounded-3xl bg-slate-900 border-2 ${
        isComplete ? "border-emerald-500/60" : "border-rose-500/40"
      } p-8 text-center`}>
        <p className="text-xs uppercase tracking-[0.3em] font-black text-rose-400">
          {isComplete ? "TARGET ALCANZADO" : isRunning ? "CRONÓMETRO" : "EN PAUSA"}
        </p>
        <div className="timer-display text-[clamp(6rem,20vw,10rem)] font-black text-white leading-none mt-1">
          {formatTime(state.secondsRemaining)}
        </div>
        <p className="text-sm text-slate-400 mt-2">
          {isComplete ? `¡${TARGET} reps completadas!` : `Tiempo para ${TARGET} reps`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {state.phase === "IDLE" ? (
          <button
            onClick={() => { primeAudio(); start(); }}
            className="col-span-2 py-5 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 text-white font-black text-lg flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(244,63,94,0.3)]"
          >
            <Zap className="w-6 h-6" fill="currentColor" /> START CRONÓMETRO
          </button>
        ) : (
          <>
            <button
              onClick={isRunning ? pause : () => { primeAudio(); start(); }}
              className={`py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 ${
                isRunning ? "bg-amber-500 text-black" : "bg-emerald-500 text-white"
              }`}
            >
              {isRunning ? <><Pause className="w-5 h-5" />PAUSAR</> : <><Play className="w-5 h-5" />REANUDAR</>}
            </button>
            <button onClick={reset} className="py-5 rounded-2xl bg-slate-800 text-white font-bold flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />REINICIAR
            </button>
          </>
        )}
      </div>

      {/* Per-station manual counter */}
      <div>
        <h2 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-2.5">Reps acumuladas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((n) => {
            const ex = exercises.find((e) => e.station === (`STATION_${n}` as Station));
            const r = reps[n] ?? 0;
            return (
              <div
                key={n}
                className={`rounded-xl border p-2.5 ${
                  r >= TARGET ? "bg-emerald-950/30 border-emerald-700/60" : "bg-slate-900/40 border-slate-800"
                }`}
              >
                <p className="text-[10px] text-slate-500 uppercase font-bold">E{n} {ex?.isTiebreakerStation && "⭐"}</p>
                <p className="text-[10px] text-slate-400 truncate mb-1.5">{ex?.nameEs ?? "—"}</p>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => remove(n)} className="w-6 h-6 rounded-md bg-slate-800 text-white flex items-center justify-center">
                    <Minus className="w-3 h-3" />
                  </button>
                  <div className="flex-1 text-center">
                    <p className={`text-xl font-black timer-display ${r >= TARGET ? "text-emerald-300" : "text-white"}`}>{r}</p>
                  </div>
                  <button onClick={() => add(n)} className="w-6 h-6 rounded-md bg-rose-500 text-white flex items-center justify-center">
                    <Plus className="w-3 h-3" strokeWidth={3} />
                  </button>
                </div>
                {r >= TARGET && (
                  <p className="text-[9px] text-emerald-400 font-bold mt-1">✓ TARGET</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl bg-slate-900/30 border border-slate-800/60 p-3 text-[10px] text-slate-500">
        <p className="font-bold text-slate-400 mb-1.5">⚡ Sobre Speed Fit</p>
        <p>Mide el tiempo que tardas en completar {TARGET} reps por estación. Se permite cambio de peso. La velocidad pura gana.</p>
      </div>
    </div>
  );
}
