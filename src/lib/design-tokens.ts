import type { CompetitionLevel } from "./category";
import type { MesocyclePhase } from "./periodization";

export interface LevelDesign {
  bg: string;
  text: string;
  badge: string;
  ring: string;
  gradient: string;
  label: string;
}

export const LEVEL_DESIGN: Record<CompetitionLevel, LevelDesign> = {
  GOLD: {
    bg: "#FFD700",
    text: "#1A1A00",
    badge: "bg-yellow-400 text-black",
    ring: "ring-yellow-400",
    gradient: "from-yellow-300 via-yellow-500 to-amber-600",
    label: "ORO",
  },
  SILVER: {
    bg: "#C0C0C0",
    text: "#0A0A0A",
    badge: "bg-slate-300 text-black",
    ring: "ring-slate-300",
    gradient: "from-slate-200 via-slate-300 to-slate-500",
    label: "PLATA",
  },
  BRONZE: {
    bg: "#CD7F32",
    text: "#FFFFFF",
    badge: "bg-orange-600 text-white",
    ring: "ring-orange-600",
    gradient: "from-orange-400 via-orange-600 to-amber-700",
    label: "BRONCE",
  },
  SPEED_FIT: {
    bg: "#FF4500",
    text: "#FFFFFF",
    badge: "bg-red-600 text-white",
    ring: "ring-red-500",
    gradient: "from-red-400 via-red-600 to-red-800",
    label: "SPEED FIT",
  },
};

export const PHASE_COLORS: Record<MesocyclePhase, { color: string; label: string }> = {
  ACCUMULATION: { color: "#3B82F6", label: "Acumulación" },
  TRANSFORMATION: { color: "#F59E0B", label: "Transformación" },
  REALIZATION: { color: "#EF4444", label: "Realización" },
  PEAK: { color: "#8B5CF6", label: "Peak" },
  TAPERING: { color: "#10B981", label: "Tapering" },
};

export const TIMER_COLORS = {
  WORK: "text-emerald-400",
  TRANSITION: "text-sky-400",
  WARNING: "text-amber-400",
  CRITICAL: "text-rose-500",
  COMPLETE: "text-violet-400",
};
