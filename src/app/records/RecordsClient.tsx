"use client";

import { Trophy, Star, TrendingUp } from "lucide-react";
import { LEVEL_DESIGN } from "@/lib/design-tokens";

type Level = "GOLD" | "SILVER" | "BRONZE" | "SPEED_FIT";
type Station = "STATION_1" | "STATION_2" | "STATION_3" | "STATION_4" | "STATION_5" | "STATION_6";

interface PR {
  id: string;
  maxRepsIn2Min: number | null;
  recordDate: Date | string;
  exercise: { nameEs: string; station: Station; level: Level; isTiebreakerStation: boolean };
}

interface Props {
  records: PR[];
}

export function RecordsClient({ records }: Props) {
  const grouped: Record<number, PR[]> = {};
  for (const r of records) {
    const station = parseInt(r.exercise.station.replace("STATION_", ""), 10);
    if (!grouped[station]) grouped[station] = [];
    grouped[station]!.push(r);
  }

  const bestPerStation: Record<number, PR> = {};
  for (const r of records) {
    const station = parseInt(r.exercise.station.replace("STATION_", ""), 10);
    if (!bestPerStation[station] || (r.maxRepsIn2Min ?? 0) > (bestPerStation[station]!.maxRepsIn2Min ?? 0)) {
      bestPerStation[station] = r;
    }
  }

  const totalReps = Object.values(bestPerStation).reduce((a, b) => a + (b.maxRepsIn2Min ?? 0), 0);
  const tiebreakerReps = bestPerStation[6]?.maxRepsIn2Min ?? 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Histórico</span>
        </div>
        <h1 className="text-2xl font-black">Récords Personales</h1>
        <p className="text-sm text-slate-400 mt-1">Tus mejores marcas en simulacros cronometrados</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Total Récords</p>
          <p className="text-3xl font-black text-amber-300 mt-1">{records.length}</p>
        </div>
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-4 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Suma Estaciones</p>
          <p className="text-3xl font-black text-emerald-300 mt-1">{totalReps}</p>
        </div>
        <div className="rounded-2xl bg-amber-950/20 border border-amber-800/40 p-4 text-center">
          <p className="text-[10px] text-amber-400 uppercase tracking-wider font-bold flex items-center justify-center gap-1">
            <Star className="w-3 h-3 fill-current" /> Est.6
          </p>
          <p className="text-3xl font-black text-amber-300 mt-1">{tiebreakerReps}</p>
        </div>
      </div>

      {/* Best per station */}
      <div>
        <h2 className="text-lg font-black mb-3">Mejor por Estación</h2>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((n) => {
            const pr = bestPerStation[n];
            if (!pr) {
              return (
                <div key={n} className="rounded-xl bg-slate-900/30 border border-slate-800/60 p-3 flex items-center gap-3 opacity-50">
                  <div className="w-10 h-10 rounded-md bg-slate-800 text-slate-500 flex items-center justify-center font-black text-sm">
                    E{n}
                  </div>
                  <p className="text-sm text-slate-500">Sin récords aún</p>
                </div>
              );
            }
            const design = LEVEL_DESIGN[pr.exercise.level];
            return (
              <div key={n} className={`rounded-xl border p-3 flex items-center gap-3 ${
                pr.exercise.isTiebreakerStation ? "bg-amber-950/20 border-amber-800/40" : "bg-slate-900/50 border-slate-800"
              }`}>
                <div className={`w-10 h-10 rounded-md ${design.badge} flex items-center justify-center font-black text-sm`}>
                  E{n}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{pr.exercise.nameEs}</p>
                  <p className="text-[10px] text-slate-500 uppercase">
                    {design.label} · {new Date(pr.recordDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-amber-300 timer-display">{pr.maxRepsIn2Min ?? 0}</p>
                  <p className="text-[10px] text-slate-500 uppercase">reps</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent history per exercise */}
      {Object.keys(grouped).length > 0 && (
        <div>
          <h2 className="text-lg font-black mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Progresión Reciente
          </h2>
          <div className="space-y-2">
            {Object.entries(grouped).map(([station, list]) => (
              <div key={station} className="rounded-xl bg-slate-900/30 border border-slate-800 p-3">
                <p className="text-xs font-bold text-slate-400 mb-1.5">Estación {station}</p>
                <div className="flex flex-wrap gap-1.5">
                  {list.slice(0, 8).map((r) => (
                    <div
                      key={r.id}
                      className="px-2 py-1 rounded-md bg-slate-800/60 text-xs text-white font-mono"
                      title={new Date(r.recordDate).toLocaleString("es-ES")}
                    >
                      {r.maxRepsIn2Min}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
