"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Play, Pause, RotateCcw, Plus, Minus, Users, Trophy } from "lucide-react";
import { useOfficialTimer, formatTime } from "@/hooks/useOfficialTimer";
import { sounds, primeAudio } from "@/lib/timer-sounds";

const DEFAULT_TEAM = [
  { name: "Atleta 1", station: 1 },
  { name: "Atleta 2", station: 2 },
  { name: "Atleta 3", station: 3 },
  { name: "Atleta 4", station: 4 },
  { name: "Atleta 5", station: 5 },
  { name: "Atleta 6", station: 6 },
];

interface Props { leaderName: string }

export function TeamTimer({ leaderName }: Props) {
  const { state, start, pause, reset } = useOfficialTimer({ mode: "TEAM" });
  const [team, setTeam] = useState(DEFAULT_TEAM);
  const [reps, setReps] = useState<Record<number, number>>({});

  const isWork = state.phase === "WORK";
  const isComplete = state.phase === "COMPLETE";
  const totalTeam = Object.values(reps).reduce((a, b) => a + b, 0);

  function add(station: number) {
    sounds.repClick();
    setReps((p) => ({ ...p, [station]: (p[station] ?? 0) + 1 }));
  }
  function remove(station: number) {
    setReps((p) => ({ ...p, [station]: Math.max(0, (p[station] ?? 0) - 1) }));
  }
  function updateName(idx: number, name: string) {
    setTeam((t) => t.map((a, i) => (i === idx ? { ...a, name } : a)));
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/timer" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-900/10 border border-violet-800/40 p-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-400" />
          <h1 className="text-xl font-black">Modo Equipo · 6 Atletas</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">1 atleta por estación, todos a la vez durante 2 min.</p>
      </div>

      {/* Timer */}
      <div className={`rounded-3xl bg-slate-900 border-2 ${
        isWork ? "border-emerald-500/40" : isComplete ? "border-violet-500/40" : "border-violet-500/40"
      } p-6 text-center`}>
        <p className={`text-xs uppercase tracking-[0.3em] font-black ${
          isWork ? "text-emerald-400" : isComplete ? "text-violet-400" : "text-violet-400"
        }`}>
          {isWork ? "TRABAJO SIMULTÁNEO" : isComplete ? "FINALIZADO" : state.phase === "TRANSITION" ? "TRANSICIÓN" : "EN PAUSA"}
        </p>
        <div className="timer-display text-[clamp(5rem,18vw,9rem)] font-black text-white leading-none mt-1">
          {formatTime(Math.max(0, state.secondsRemaining))}
        </div>
        <p className="text-sm text-slate-400 mt-2">
          {isWork ? "Todos los atletas cuentan a la vez" : isComplete ? `Total equipo: ${totalTeam} reps` : "Listo para empezar"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {state.phase === "IDLE" ? (
          <button
            onClick={() => { primeAudio(); start(); }}
            className="col-span-2 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-lg flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6" fill="currentColor" /> COMENZAR 2 MIN
          </button>
        ) : isComplete ? (
          <div className="col-span-2 py-5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-center flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5" /> Total Equipo: {totalTeam} reps
          </div>
        ) : (
          <>
            <button
              onClick={state.isRunning ? pause : () => { primeAudio(); start(); }}
              className={`py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 ${
                state.isRunning ? "bg-amber-500 text-black" : "bg-emerald-500 text-white"
              }`}
            >
              {state.isRunning ? <><Pause className="w-5 h-5" />PAUSAR</> : <><Play className="w-5 h-5" />REANUDAR</>}
            </button>
            <button onClick={reset} className="py-5 rounded-2xl bg-slate-800 text-white font-bold flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />REINICIAR
            </button>
          </>
        )}
      </div>

      {/* Team grid */}
      <div>
        <h2 className="text-sm uppercase tracking-widest text-slate-500 font-bold mb-2.5">Reps por atleta</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {team.map((a, idx) => (
            <div key={a.station} className="rounded-xl bg-slate-900/50 border border-slate-800 p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center text-sm font-black flex-shrink-0">
                {a.station}
              </div>
              <div className="flex-1 min-w-0">
                <input
                  value={a.name}
                  onChange={(e) => updateName(idx, e.target.value)}
                  className="w-full bg-transparent text-sm font-bold text-white focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 uppercase">Estación {a.station}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => remove(a.station)} className="w-7 h-7 rounded-md bg-slate-800 text-white flex items-center justify-center">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <div className="min-w-[36px] text-center">
                  <p className="text-lg font-black text-white timer-display">{reps[a.station] ?? 0}</p>
                </div>
                <button
                  onClick={() => add(a.station)}
                  className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-purple-600 text-white flex items-center justify-center"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
