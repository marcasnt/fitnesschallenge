"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { sounds } from "@/lib/timer-sounds";

export type TimerPhase = "IDLE" | "WORK" | "TRANSITION" | "COMPLETE";
export type TimerMode = "COMPETITION" | "PAIR" | "TEAM" | "SPEEDFIT";

export interface TimerState {
  phase: TimerPhase;
  currentStation: number;
  secondsRemaining: number;
  totalSeconds: number;
  elapsedSeconds: number;
  repsByStation: Record<number, number>;
  totalReps: number;
  isRunning: boolean;
}

export interface TimerConfig {
  mode: TimerMode;
  workSeconds?: number;
  transitionSeconds?: number;
  totalStations?: number;
  speedFitTargetReps?: number; // if set, time ascending until target reached
}

export function useOfficialTimer(config: TimerConfig) {
  const WORK_SEC = config.workSeconds ?? 120;
  const TRANS_SEC = config.transitionSeconds ?? 120;
  const TOTAL_STA = config.totalStations ?? 6;

  const [state, setState] = useState<TimerState>({
    phase: "IDLE",
    currentStation: 1,
    secondsRemaining: WORK_SEC,
    totalSeconds: 0,
    elapsedSeconds: 0,
    repsByStation: {},
    totalReps: 0,
    isRunning: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningFiredRef = useRef(false);
  const lastBeepRef = useRef(-1);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setState((prev) => {
      // Speed Fit mode: time ascending
      if (config.mode === "SPEEDFIT") {
        const newSeconds = prev.secondsRemaining + 1;
        if (config.speedFitTargetReps && prev.totalReps >= config.speedFitTargetReps) {
          sounds.complete();
          clear();
          return { ...prev, phase: "COMPLETE", isRunning: false, secondsRemaining: newSeconds };
        }
        return { ...prev, secondsRemaining: newSeconds, elapsedSeconds: prev.elapsedSeconds + 1 };
      }

      // Competition / pair / team mode
      const newSeconds = prev.secondsRemaining - 1;

      // 30s warning (work phase only)
      if (prev.phase === "WORK" && newSeconds === 30 && !warningFiredRef.current) {
        sounds.warning30s();
        warningFiredRef.current = true;
      }

      // 5-4-3-2-1 final countdown
      if (prev.phase === "WORK" && newSeconds <= 5 && newSeconds > 0 && newSeconds !== lastBeepRef.current) {
        sounds.countdownBeep();
        lastBeepRef.current = newSeconds;
      }

      if (newSeconds <= 0) {
        if (prev.phase === "WORK") {
          sounds.hornEnd();
          if (prev.currentStation >= TOTAL_STA) {
            sounds.complete();
            clear();
            return { ...prev, phase: "COMPLETE", secondsRemaining: 0, isRunning: false, totalSeconds: prev.totalSeconds + WORK_SEC };
          }
          warningFiredRef.current = false;
          lastBeepRef.current = -1;
          return {
            ...prev,
            phase: "TRANSITION",
            secondsRemaining: TRANS_SEC,
            totalSeconds: prev.totalSeconds + WORK_SEC,
          };
        }

        if (prev.phase === "TRANSITION") {
          sounds.startYa();
          warningFiredRef.current = false;
          lastBeepRef.current = -1;
          return {
            ...prev,
            phase: "WORK",
            currentStation: prev.currentStation + 1,
            secondsRemaining: WORK_SEC,
            totalSeconds: prev.totalSeconds + TRANS_SEC,
          };
        }
      }

      return {
        ...prev,
        secondsRemaining: newSeconds,
        elapsedSeconds: prev.elapsedSeconds + 1,
      };
    });
  }, [WORK_SEC, TRANS_SEC, TOTAL_STA, config.mode, config.speedFitTargetReps, clear]);

  const start = useCallback(() => {
    sounds.startYa();
    warningFiredRef.current = false;
    lastBeepRef.current = -1;
    setState((prev) => ({
      ...prev,
      phase: "WORK",
      isRunning: true,
      secondsRemaining: WORK_SEC,
    }));
    clear();
    intervalRef.current = setInterval(tick, 1000);
  }, [tick, WORK_SEC, clear]);

  const pause = useCallback(() => {
    clear();
    setState((prev) => ({ ...prev, isRunning: false }));
  }, [clear]);

  const reset = useCallback(() => {
    clear();
    warningFiredRef.current = false;
    lastBeepRef.current = -1;
    setState({
      phase: "IDLE",
      currentStation: 1,
      secondsRemaining: WORK_SEC,
      totalSeconds: 0,
      elapsedSeconds: 0,
      repsByStation: {},
      totalReps: 0,
      isRunning: false,
    });
  }, [WORK_SEC, clear]);

  const addRep = useCallback(
    (stationIndex?: number) => {
      sounds.repClick();
      setState((prev) => {
        const station = stationIndex ?? prev.currentStation;
        const current = prev.repsByStation[station] ?? 0;
        return {
          ...prev,
          repsByStation: { ...prev.repsByStation, [station]: current + 1 },
          totalReps: prev.totalReps + 1,
        };
      });
    },
    []
  );

  const removeRep = useCallback((stationIndex?: number) => {
    setState((prev) => {
      const station = stationIndex ?? prev.currentStation;
      const current = prev.repsByStation[station] ?? 0;
      if (current <= 0) return prev;
      return {
        ...prev,
        repsByStation: { ...prev.repsByStation, [station]: current - 1 },
        totalReps: Math.max(0, prev.totalReps - 1),
      };
    });
  }, []);

  useEffect(() => {
    return () => clear();
  }, [clear]);

  return { state, start, pause, reset, addRep, removeRep };
}

export function formatTime(seconds: number): string {
  const sign = seconds < 0 ? "-" : "";
  const abs = Math.abs(seconds);
  const m = Math.floor(abs / 60)
    .toString()
    .padStart(2, "0");
  const s = (abs % 60).toString().padStart(2, "0");
  return `${sign}${m}:${s}`;
}
