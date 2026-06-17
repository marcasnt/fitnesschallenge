"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Play, Pause, RotateCcw, Plus, Minus, Save, ChevronLeft, Volume2, VolumeX, Trophy, Star } from "lucide-react";
import { useOfficialTimer, formatTime } from "@/hooks/useOfficialTimer";
import { sounds, primeAudio } from "@/lib/timer-sounds";
import { LEVEL_DESIGN } from "@/lib/design-tokens";
import { REGULATION_WEIGHTS } from "@/lib/weights";
import Link from "next/link";

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
  athleteGender: "MALE" | "FEMALE";
  athleteId: string;
  exercises: ExSummary[];
  bestPerStation: Record<number, number>;
}

export function CompetitionTimer({ level, athleteGender, athleteId, exercises, bestPerStation }: Props) {
  const router = useRouter();
  const { state, start, pause, reset, addRep, removeRep } = useOfficialTimer({
    mode: "COMPETITION",
    workSeconds: 120,
    transitionSeconds: 120,
    totalStations: 6,
  });
  const [muted, setMuted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const currentEx = exercises.find((e) => e.station === (`STATION_${state.currentStation}` as Station));
  const design = LEVEL_DESIGN[level];
  const weight = currentEx
    ? athleteGender === "MALE" ? currentEx.weightMaleKg : currentEx.weightFemaleKg
    : 0;
  const isWork = state.phase === "WORK";
  const isTransition = state.phase === "TRANSITION";
  const isComplete = state.phase === "COMPLETE";
  const isCritical = isWork && state.secondsRemaining <= 10 && state.secondsRemaining > 0;
  const isWarning = isWork && state.secondsRemaining <= 30 && state.secondsRemaining > 10;

  const phaseLabel = isWork ? "TRABAJO" : isTransition ? "TRANSICIÓN" : isComplete ? "COMPLETADO" : "EN PAUSA";
  const phaseColor = isWork
    ? isCritical ? "text-rose-400" : isWarning ? "text-amber-400" : "text-emerald-400"
    : isTransition ? "text-sky-400" : isComplete ? "text-violet-400" : "text-slate-400";

  const phaseBg = isWork
    ? isCritical ? "from-rose-500/20 to-red-900/20" : isWarning ? "from-amber-500/20 to-orange-900/20" : "from-emerald-500/20 to-green-900/20"
    : isTransition ? "from-sky-500/20 to-blue-900/20" : isComplete ? "from-violet-500/20 to-purple-900/20" : "from-slate-500/20 to-slate-900/20";

  // Big number color
  const timerColor = isWork
    ? isCritical ? "text-rose-400" : isWarning ? "text-amber-300" : "text-emerald-300"
    : isTransition ? "text-sky-300" : isComplete ? "text-violet-300" : "text-slate-300";

  // Mute handling
  useEffect(() => {
    if (muted) {
      // cannot mute the synth easily, so we monkey-patch the sounds object
      const original = { ...sounds };
      Object.keys(sounds).forEach((k) => {
        (sounds as Record<string, () => void>)[k] = () => {};
      });
      return () => {
        Object.keys(sounds).forEach((k) => {
          (sounds as Record<string, () => void>)[k] = (original as Record<string, () => void>)[k]!;
        });
      };
    }
  }, [muted]);

  function handleStart() {
    primeAudio();
    start();
  }

  async function saveSession() {
    setSaving(true);
    try {
      const repsByStation: Record<string, number> = {};
      Object.entries(state.repsByStation).forEach(([k, v]) => (repsByStation[k] = v));

      const blocks = exercises
        .filter((e) => (state.repsByStation[parseInt(e.station.replace("STATION_", ""), 10)] ?? 0) > 0)
        .map((e) => ({
          exerciseId: e.id,
          station: e.station,
          totalReps: state.repsByStation[parseInt(e.station.replace("STATION_", ""), 10)] ?? 0,
          totalValidReps: state.repsByStation[parseInt(e.station.replace("STATION_", ""), 10)] ?? 0,
          isSimulationBlock: true,
        }));

      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionType: "SIMULATION",
          isSimulation: true,
          durationMinutes: 24,
          repsByStation,
          blocks,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => router.push("/dashboard"), 1500);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/timer" className="flex items-center gap-1 text-sm text-slate-400 hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Volver
        </Link>
        <button
          onClick={() => setMuted((m) => !m)}
          className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white"
          aria-label="Silenciar"
        >
          {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Top phase banner */}
      <div className={`rounded-2xl bg-gradient-to-br ${phaseBg} border border-slate-800 p-4 text-center transition-all`}>
        <p className={`text-xs uppercase tracking-[0.3em] font-black ${phaseColor}`}>
          {phaseLabel}
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Estación <span className="text-white font-bold">{state.currentStation}</span> de 6
        </p>
      </div>

      {/* Main timer card */}
      <div className={`rounded-3xl bg-gradient-to-br ${phaseBg} border-2 ${
        isWork ? (isCritical ? "border-rose-500/60 glow-emerald" : "border-emerald-500/40 glow-emerald") :
        isTransition ? "border-sky-500/40" : "border-violet-500/40"
      } p-8 md:p-12 text-center transition-all`}>
        {/* Big timer */}
        <div className="timer-display text-[clamp(7rem,25vw,12rem)] font-black leading-none">
          <span className={timerColor}>{formatTime(Math.max(0, state.secondsRemaining))}</span>
        </div>

        {/* Current exercise */}
        {currentEx && (
          <div className="mt-4">
            <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Ejercicio actual</p>
            <h2 className="text-2xl md:text-3xl font-black text-white mt-1">{currentEx.nameEs}</h2>
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-md text-xs font-black ${design.badge}`}>
                {design.label}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-800/60 text-slate-300">
                Estación {state.currentStation}
              </span>
              {currentEx.isTiebreakerStation && (
                <span className="px-3 py-1 rounded-md text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  ⭐ DESEMPATE
                </span>
              )}
              {weight !== null && (
                <span className="px-3 py-1 rounded-md text-xs font-bold bg-slate-800/60 text-slate-300">
                  {weight === 0 ? "Peso corporal" : `${weight} kg · ${currentEx.weightLabel}`}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Rep counter */}
        {isWork && (
          <div className="mt-6">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Repeticiones</p>
            <div className="flex items-center justify-center gap-3 mt-2">
              <button
                onClick={() => removeRep()}
                className="w-12 h-12 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center active:scale-95 transition"
              >
                <Minus className="w-5 h-5" />
              </button>
              <div className="min-w-[120px]">
                <p className={`text-6xl font-black ${timerColor} timer-display`}>
                  {state.repsByStation[state.currentStation] ?? 0}
                </p>
              </div>
              <button
                onClick={() => addRep()}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black flex items-center justify-center active:scale-95 transition shadow-[0_8px_30px_rgba(255,215,0,0.4)]"
              >
                <Plus className="w-7 h-7" strokeWidth={3} />
              </button>
            </div>
            {bestPerStation[state.currentStation] && (
              <p className="text-xs text-slate-500 mt-2">
                Tu mejor: {bestPerStation[state.currentStation]} reps
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-3">
        {state.phase === "IDLE" ? (
          <button
            onClick={handleStart}
            className="col-span-2 py-5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-black text-lg flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(16,185,129,0.3)] active:scale-[0.98] transition"
          >
            <Play className="w-6 h-6" fill="currentColor" />
            COMENZAR SIMULACRO
          </button>
        ) : isComplete ? (
          <button
            onClick={saveSession}
            disabled={saving || saved}
            className="col-span-2 py-5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-black text-lg flex items-center justify-center gap-2 shadow-[0_8px_30px_rgba(255,215,0,0.3)] active:scale-[0.98] transition disabled:opacity-60"
          >
            {saved ? <>✅ Guardado</> : saving ? <>Guardando...</> : (
              <>
                <Save className="w-6 h-6" />
                GUARDAR RESULTADO ({state.totalReps} reps)
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={state.isRunning ? pause : () => { primeAudio(); start(); }}
              className={`py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-2 active:scale-[0.98] transition ${
                state.isRunning
                  ? "bg-amber-500 hover:bg-amber-400 text-black"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white"
              }`}
            >
              {state.isRunning ? <><Pause className="w-6 h-6" fill="currentColor" />PAUSAR</> : <><Play className="w-6 h-6" fill="currentColor" />REANUDAR</>}
            </button>
            <button
              onClick={reset}
              className="py-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-base flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <RotateCcw className="w-5 h-5" />REINICIAR
            </button>
          </>
        )}
      </div>

      {/* Total reps panel */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4">
        <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-3">Reps por estación</p>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 6 }, (_, i) => i + 1).map((n) => {
            const ex = exercises.find((e) => e.station === (`STATION_${n}` as Station));
            const reps = state.repsByStation[n] ?? 0;
            const isCurrent = n === state.currentStation && !isComplete;
            return (
              <div
                key={n}
                className={`rounded-xl p-2.5 text-center border ${
                  isCurrent ? "bg-emerald-500/10 border-emerald-500/50" :
                  ex?.isTiebreakerStation ? "bg-amber-500/5 border-amber-500/30" :
                  "bg-slate-950/60 border-slate-800"
                }`}
              >
                <p className="text-[10px] text-slate-500 uppercase">E{n}{ex?.isTiebreakerStation && " ⭐"}</p>
                <p className={`text-2xl font-black timer-display ${isCurrent ? "text-emerald-300" : reps > 0 ? "text-white" : "text-slate-600"}`}>
                  {reps}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total</span>
          <span className="text-3xl font-black gradient-gold timer-display">
            {state.totalReps}
          </span>
        </div>
      </div>

      {/* Audio legend */}
      <div className="rounded-2xl bg-slate-900/30 border border-slate-800/60 p-3 text-[10px] text-slate-500">
        <p className="uppercase font-bold tracking-wider text-slate-400 mb-1.5">Señales auditivas reglamentarias</p>
        <div className="grid grid-cols-2 gap-1.5">
          <div>🔊 Inicio: "¡Ya!"</div>
          <div>🔊 Pitido 30s restantes</div>
          <div>🔊 Bocina fin de estación</div>
          <div>🔊 Silbato de transición</div>
        </div>
      </div>
    </div>
  );
}
