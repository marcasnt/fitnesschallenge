"use client";

import Link from "next/link";
import { Timer, Trophy, Target, Flame, Calendar, ChevronRight, TrendingUp, Bell, Award, Dumbbell } from "lucide-react";
import { LEVEL_DESIGN, PHASE_COLORS } from "@/lib/design-tokens";
import { formatTime } from "@/lib/utils";

type Phase = "ACCUMULATION" | "TRANSFORMATION" | "REALIZATION" | "PEAK" | "TAPERING";
type Level = "GOLD" | "SILVER" | "BRONZE" | "SPEED_FIT";

interface Props {
  athlete: {
    id: string;
    firstName: string;
    lastName: string;
    ageCategory: "JUNIOR" | "SENIOR" | "MASTER";
    competitionLevel: Level;
    competitionModality: string;
    competitionDate: Date | string | null;
    bodyWeightKg: number | null;
  };
  daysUntil: number | null;
  currentMeso: { id: string; phase: Phase; title: string; description: string; mainObjective: string; weekCount: number; orderIndex: number } | null;
  currentMicro: { id: string; weekNumber: number; weekObjective: string; volumeLevel: number; intensityLevel: number } | null;
  todaysSessions: Array<{ id: string; title: string; sessionType: string; estimatedMinutes: number; description: string }>;
  recentPRs: Array<{ id: string; maxRepsIn2Min: number | null; recordDate: Date | string; exercise: { nameEs: string; station: string; level: Level } }>;
  lastSessions: Array<{ id: string; sessionDate: Date | string; sessionType: string; durationMinutes: number | null; totalRepsSimulation: number | null; isSimulation: boolean }>;
  notifications: Array<{ id: string; title: string; body: string; type: string; isRead: boolean; createdAt: Date | string }>;
}

const DAY_MAP: Record<string, string> = {
  MONDAY: "Lunes", TUESDAY: "Martes", WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves", FRIDAY: "Viernes", SATURDAY: "Sábado", SUNDAY: "Domingo",
};

const SESSION_TYPE_LABEL: Record<string, { label: string; color: string; icon: string }> = {
  STRENGTH: { label: "Fuerza", color: "from-blue-500 to-indigo-600", icon: "💪" },
  ENDURANCE: { label: "Resistencia", color: "from-amber-500 to-orange-600", icon: "🔥" },
  TECHNIQUE: { label: "Técnica", color: "from-emerald-500 to-teal-600", icon: "🎯" },
  SIMULATION: { label: "Simulacro", color: "from-rose-500 to-red-700", icon: "⚡" },
  CARDIO: { label: "Cardio", color: "from-sky-500 to-cyan-600", icon: "🏃" },
  ACTIVE_RECOVERY: { label: "Recuperación", color: "from-violet-500 to-purple-700", icon: "🧘" },
  REST: { label: "Descanso", color: "from-slate-500 to-slate-700", icon: "😴" },
};

export function DashboardClient({ athlete, daysUntil, currentMeso, currentMicro, todaysSessions, recentPRs, lastSessions, notifications }: Props) {
  const design = LEVEL_DESIGN[athlete.competitionLevel];
  const phaseColor = currentMeso ? PHASE_COLORS[currentMeso.phase] : null;
  const fullName = `${athlete.firstName} ${athlete.lastName}`;

  return (
    <div className="space-y-6">
      {/* Hero / countdown */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 md:p-8">
        <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full opacity-20 blur-3xl" style={{ background: design.bg }} />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <div className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-widest ${design.badge}`}>
              {design.label}
            </div>
            <span className="text-xs text-slate-500">·</span>
            <span className="text-xs text-slate-400">{athlete.ageCategory}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black">
            Hola, <span className="gradient-gold">{athlete.firstName}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {formatModality(athlete.competitionModality)}
          </p>

          {daysUntil !== null && daysUntil > 0 && (
            <div className="mt-5 flex items-end gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Competición en</p>
                <p className="text-5xl md:text-6xl font-black leading-none">
                  <span className={daysUntil <= 7 ? "text-rose-400" : "text-white"}>
                    {daysUntil}
                  </span>
                  <span className="text-base text-slate-500 ml-2">días</span>
                </p>
              </div>
            </div>
          )}

          {/* Quick action buttons */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <Link
              href="/timer/competition"
              className="flex flex-col items-center justify-center gap-1 py-3.5 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 text-black font-bold text-sm shadow-[0_8px_30px_rgba(255,215,0,0.25)] hover:scale-[1.02] transition"
            >
              <Timer className="w-5 h-5" strokeWidth={2.5} />
              Iniciar Timer
            </Link>
            <Link
              href="/training"
              className="flex flex-col items-center justify-center gap-1 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-white font-semibold text-sm transition"
            >
              <Calendar className="w-5 h-5 text-sky-400" />
              Plan
            </Link>
            <Link
              href="/exercises"
              className="flex flex-col items-center justify-center gap-1 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-white font-semibold text-sm transition"
            >
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              Ejercicios
            </Link>
            <Link
              href="/records"
              className="flex flex-col items-center justify-center gap-1 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-white font-semibold text-sm transition"
            >
              <Trophy className="w-5 h-5 text-amber-400" />
              Récords
            </Link>
          </div>
        </div>
      </div>

      {/* Current mesocycle */}
      {currentMeso && phaseColor && (
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Fase actual</p>
              <h2 className="text-xl font-black mt-0.5" style={{ color: phaseColor.color }}>
                {phaseColor.label}
              </h2>
            </div>
            {currentMicro && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Semana</p>
                <p className="text-2xl font-black text-white">
                  {currentMicro.weekNumber}
                  <span className="text-sm text-slate-500">/{currentMeso.weekCount}</span>
                </p>
              </div>
            )}
          </div>
          <p className="text-sm text-slate-300 mb-3">{currentMeso.mainObjective}</p>
          {currentMicro && (
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Volumen" value={`${currentMicro.volumeLevel}/10`} />
              <Stat label="Intensidad" value={`${currentMicro.intensityLevel}/10`} />
            </div>
          )}
        </div>
      )}

      {/* Today's sessions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Hoy
          </h2>
          <Link href="/training" className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
            Ver plan <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        {todaysSessions.length === 0 ? (
          <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 text-center">
            <p className="text-slate-400 text-sm">Día de descanso. ¡Recupérate bien!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {todaysSessions.map((s) => {
              const meta = SESSION_TYPE_LABEL[s.sessionType] ?? SESSION_TYPE_LABEL.TECHNIQUE!;
              return (
                <Link
                  key={s.id}
                  href="/training"
                  className="block rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 p-4 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${meta.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{s.title}</p>
                      <p className="text-xs text-slate-400 truncate">{s.description}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-white">{s.estimatedMinutes}'</p>
                      <p className="text-[10px] text-slate-500 uppercase">min</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom grid: PRs + Sessions */}
      <div className="grid md:grid-cols-2 gap-4">
        <section>
          <h2 className="text-lg font-black flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-amber-400" />
            Récords recientes
          </h2>
          {recentPRs.length === 0 ? (
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 text-center text-sm text-slate-400">
              Completa un simulacro para registrar tu primer récord
            </div>
          ) : (
            <div className="space-y-2">
              {recentPRs.map((pr) => (
                <div key={pr.id} className="rounded-xl bg-slate-900/50 border border-slate-800 p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 font-black text-sm">
                    E{pr.exercise.station.replace("STATION_", "")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{pr.exercise.nameEs}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{LEVEL_DESIGN[pr.exercise.level].label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-amber-300">{pr.maxRepsIn2Min ?? 0}</p>
                    <p className="text-[10px] text-slate-500 uppercase">reps</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-black flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Últimas sesiones
          </h2>
          {lastSessions.length === 0 ? (
            <div className="rounded-2xl bg-slate-900/40 border border-slate-800 p-6 text-center text-sm text-slate-400">
              Aún no hay sesiones registradas
            </div>
          ) : (
            <div className="space-y-2">
              {lastSessions.map((s) => {
                const meta = SESSION_TYPE_LABEL[s.sessionType] ?? SESSION_TYPE_LABEL.TECHNIQUE!;
                return (
                  <div key={s.id} className="rounded-xl bg-slate-900/50 border border-slate-800 p-3 flex items-center gap-3">
                    <div className="text-2xl">{meta.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{meta.label}</p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(s.sessionDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                        {s.durationMinutes && ` · ${s.durationMinutes}'`}
                      </p>
                    </div>
                    {s.isSimulation && s.totalRepsSimulation !== null && (
                      <div className="text-right">
                        <p className="text-base font-black text-emerald-300">{s.totalRepsSimulation}</p>
                        <p className="text-[10px] text-slate-500 uppercase">total</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <section>
          <h2 className="text-lg font-black flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-sky-400" />
            Notificaciones
          </h2>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`rounded-xl p-3 border ${
                  n.isRead ? "bg-slate-900/30 border-slate-800" : "bg-sky-950/30 border-sky-800/50"
                }`}
              >
                <p className="text-sm font-bold text-white">{n.title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{n.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function formatModality(mod: string): string {
  const map: Record<string, string> = {
    INDIVIDUAL: "🏃 Competición Individual",
    PAIR_MALE: "👬 Pareja Masculina",
    PAIR_FEMALE: "👭 Pareja Femenina",
    PAIR_MIXED: "👫 Pareja Mixta",
    TEAM_6: "👥 Equipo de 6 atletas",
    SPEED_FIT_INDIVIDUAL: "⚡ Speed Fit Individual",
    SPEED_FIT_TEAM_4: "🚀 Speed Fit Equipo de 4",
  };
  return map[mod] ?? mod;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-950/50 p-2.5">
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">{label}</p>
      <p className="text-lg font-black text-white mt-0.5">{value}</p>
    </div>
  );
}
