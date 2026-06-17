"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Play, Pause, RotateCcw, Plus, Minus, Users, ArrowLeftRight } from "lucide-react";
import { useOfficialTimer, formatTime } from "@/hooks/useOfficialTimer";
import { sounds, primeAudio } from "@/lib/timer-sounds";
import { LEVEL_DESIGN } from "@/lib/design-tokens";

type Level = "GOLD" | "SILVER" | "BRONZE" | "SPEED_FIT";
type Station = "STATION_1" | "STATION_2" | "STATION_3" | "STATION_4" | "STATION_5" | "STATION_6";

interface Ex { nameEs: string; station: Station; isTiebreakerStation: boolean; weightMaleKg: number | null; weightFemaleKg: number | null; weightLabel: string | null }

interface Props { athleteName: string; level: Level; exercises: Ex[] }

export function PairTimer({ athleteName, level, exercises }: Props) {
  const { state, start, pause, reset, addRep, removeRep } = useOfficialTimer({ mode: "PAIR" });
  const [activeAthlete, setActiveAthlete] = useState<"A" | "B">("A");
  const [athleteAName, setAthleteAName] = useState("Atleta A");
  const [athleteBName, setAthleteBName] = useState("Atleta B");

  const currentEx = exercises.find((e) => e.station === (`STATION_${state.currentStation}` as Station));
  const design = LEVEL_DESIGN[level];
  const isWork = state.phase === "WORK";
  const isComplete = state.phase === "COMPLETE";

  // Reps per athlete per station
  const [repsA, setRepsA] = useState<Record<number, number>>({});
  const [repsB, setRepsB] = useState<Record<number, number>>({});

  const activeReps = activeAthlete === "A" ? repsA : repsB;
  const currentReps = activeReps[state.currentStation] ?? 0;

  function add() {
    sounds.repClick();
    if (activeAthlete === "A") {
      setRepsA((p) => ({ ...p, [state.currentStation]: (p[state.currentStation] ?? 0) + 1 }));
    } else {
      setRepsB((p) => ({ ...p, [state.currentStation]: (p[state.currentStation] ?? 0) + 1 }));
    }
  }
  function remove() {
    if (activeAthlete === "A") {
      setRepsA((p) => ({ ...p, [state.currentStation]: Math.max(0, (p[state.currentStation] ?? 0) - 1) }));
    } else {
      setRepsB((p) => ({ ...p, [state.currentStation]: Math.max(0, (p[state.currentStation] ?? 0) - 1) }));
    }
  }

  function swap() {
    setActiveAthlete((a) => (a === "A" ? "B" : "A"));
  }

  const totalA = Object.values(repsA).reduce((a, b) => a + b, 0);
  const totalB = Object.values(repsB).reduce((a, b) => a + b, 0);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/timer" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ChevronLeft className="w-4 h-4" /> Volver
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-sky-500/10 to-cyan-900/10 border border-sky-800/40 p-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-sky-400" />
          <h1 className="text-xl font-black">Modo Pareja · Relevos</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">2 atletas se relevan. El total se suma al final.</p>
      </div>

      {/* Athletes */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => setActiveAthlete("A")}
          className={`p-3 rounded-2xl border-2 transition ${
            activeAthlete === "A" ? "bg-amber-500/15 border-amber-500/60" : "bg-slate-900/50 border-slate-800"
          }`}
        >
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Atleta A</p>
          <input
            value={athleteAName}
            onChange={(e) => setAthleteAName(e.target.value)}
            className="w-full bg-transparent text-sm font-bold text-white mt-0.5 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-2xl font-black text-amber-300 mt-1 timer-display">{totalA}</p>
        </button>
        <button
          onClick={() => setActiveAthlete("B")}
          className={`p-3 rounded-2xl border-2 transition ${
            activeAthlete === "B" ? "bg-violet-500/15 border-violet-500/60" : "bg-slate-900/50 border-slate-800"
          }`}
        >
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Atleta B</p>
          <input
            value={athleteBName}
            onChange={(e) => setAthleteBName(e.target.value)}
            className="w-full bg-transparent text-sm font-bold text-white mt-0.5 focus:outline-none"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="text-2xl font-black text-violet-300 mt-1 timer-display">{totalB}</p>
        </button>
      </div>

      <button
        onClick={swap}
        className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold flex items-center justify-center gap-2"
      >
        <ArrowLeftRight className="w-4 h-4" /> Cambiar turno ({activeAthlete === "A" ? athleteAName : athleteBName} → {activeAthlete === "A" ? athleteBName : athleteAName})
      </button>

      {/* Timer */}
      <div className={`rounded-3xl bg-slate-900 border-2 ${
        isWork ? "border-emerald-500/40" : isComplete ? "border-violet-500/40" : "border-sky-500/40"
      } p-8 text-center`}>
        <p className={`text-xs uppercase tracking-[0.3em] font-black ${
          isWork ? "text-emerald-400" : isComplete ? "text-violet-400" : "text-sky-400"
        }`}>
          {isWork ? "TRABAJO" : isComplete ? "COMPLETADO" : state.phase === "TRANSITION" ? "TRANSICIÓN" : "EN PAUSA"}
        </p>
        <div className="timer-display text-[clamp(6rem,20vw,10rem)] font-black text-white leading-none mt-1">
          {formatTime(Math.max(0, state.secondsRemaining))}
        </div>
        <p className="text-sm text-slate-400 mt-2">
          Estación {state.currentStation} de 6
          {currentEx && ` · ${currentEx.nameEs}`}
        </p>

        {isWork && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button onClick={remove} className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center">
              <Minus className="w-4 h-4" />
            </button>
            <div className="min-w-[80px]">
              <p className={`text-4xl font-black ${activeAthlete === "A" ? "text-amber-300" : "text-violet-300"} timer-display`}>
                {currentReps}
              </p>
            </div>
            <button
              onClick={add}
              className={`w-12 h-12 rounded-full text-black flex items-center justify-center shadow-lg ${
                activeAthlete === "A" ? "bg-gradient-to-br from-amber-400 to-yellow-500" : "bg-gradient-to-br from-violet-400 to-purple-500"
              }`}
            >
              <Plus className="w-5 h-5" strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {state.phase === "IDLE" ? (
          <button
            onClick={() => { primeAudio(); start(); }}
            className="col-span-2 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-lg flex items-center justify-center gap-2"
          >
            <Play className="w-6 h-6" fill="currentColor" /> COMENZAR
          </button>
        ) : isComplete ? (
          <div className="col-span-2 py-5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-center">
            🏆 Total Pareja: {totalA + totalB} reps
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

      <div className="rounded-2xl bg-slate-900/30 border border-slate-800/60 p-3 text-[10px] text-slate-500">
        <p className="font-bold text-slate-400 mb-1.5">📋 Estrategia de relevos</p>
        <p>El atleta más fuerte empieza. En Est. 4 (zancadas), el cambio se hace sin detener el cronómetro. En pareja mixta, el peso es el unificado excepto en Est. 4 (zancadas).</p>
      </div>
    </div>
  );
}
