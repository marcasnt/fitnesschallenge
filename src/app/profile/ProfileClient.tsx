"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Trophy, Save, Loader2, Edit3 } from "lucide-react";
import { LEVEL_DESIGN, PHASE_COLORS } from "@/lib/design-tokens";

type Level = "GOLD" | "SILVER" | "BRONZE" | "SPEED_FIT";
type Modality =
  | "INDIVIDUAL"
  | "PAIR_MALE"
  | "PAIR_FEMALE"
  | "PAIR_MIXED"
  | "TEAM_6"
  | "SPEED_FIT_INDIVIDUAL"
  | "SPEED_FIT_TEAM_4";
type AgeCat = "JUNIOR" | "SENIOR" | "MASTER";
type Gender = "MALE" | "FEMALE";

interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: Date | string;
  gender: Gender;
  ageCategory: AgeCat;
  competitionLevel: Level;
  competitionModality: Modality;
  competitionDate: Date | string | null;
  bodyWeightKg: number | null;
  maxSessionMinutes: number;
  experienceLevel: number;
}

interface Props {
  athlete: Athlete;
  age: number;
}

const MODALITY_LABELS: Record<Modality, string> = {
  INDIVIDUAL: "🏃 Individual",
  PAIR_MALE: "👬 Pareja Masc.",
  PAIR_FEMALE: "👭 Pareja Fem.",
  PAIR_MIXED: "👫 Pareja Mixta",
  TEAM_6: "👥 Equipo (6)",
  SPEED_FIT_INDIVIDUAL: "⚡ Speed Fit Ind.",
  SPEED_FIT_TEAM_4: "🚀 Speed Fit Eq.",
};

export function ProfileClient({ athlete, age }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    firstName: athlete.firstName,
    lastName: athlete.lastName,
    bodyWeightKg: athlete.bodyWeightKg ?? 0,
    competitionDate: athlete.competitionDate
      ? new Date(athlete.competitionDate).toISOString().split("T")[0]
      : "",
    maxSessionMinutes: athlete.maxSessionMinutes,
    experienceLevel: athlete.experienceLevel,
  });

  const design = LEVEL_DESIGN[athlete.competitionLevel];

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/athletes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          bodyWeightKg: form.bodyWeightKg || undefined,
          competitionDate: form.competitionDate,
          maxSessionMinutes: form.maxSessionMinutes,
          experienceLevel: form.experienceLevel,
        }),
      });
      if (res.ok) {
        setSaved(true);
        setEditing(false);
        setTimeout(() => router.refresh(), 800);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Perfil</p>
            <h1 className="text-2xl md:text-3xl font-black mt-1">{athlete.firstName} {athlete.lastName}</h1>
            <p className="text-sm text-slate-400 mt-1">{athlete.email}</p>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-black text-2xl font-black flex-shrink-0">
            {athlete.firstName[0]}{athlete.lastName[0]}
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <div className={`px-3 py-1.5 rounded-lg text-xs font-black ${design.badge}`}>
            {design.label}
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-slate-800/60 text-xs text-slate-200 font-semibold">
            {MODALITY_LABELS[athlete.competitionModality]}
          </div>
          <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
            athlete.ageCategory === "JUNIOR" ? "bg-yellow-500/15 text-yellow-300" :
            athlete.ageCategory === "MASTER" ? "bg-slate-500/15 text-slate-300" :
            "bg-emerald-500/15 text-emerald-300"
          }`}>
            {athlete.ageCategory}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <Stat icon={User} label="Edad" value={`${age} años`} />
        <Stat icon={User} label="Sexo" value={athlete.gender === "MALE" ? "Hombre" : "Mujer"} />
        <Stat icon={Trophy} label="Peso" value={athlete.bodyWeightKg ? `${athlete.bodyWeightKg} kg` : "—"} />
        <Stat icon={Calendar} label="Compite" value={athlete.competitionDate ? new Date(athlete.competitionDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" }) : "—"} />
      </div>

      {/* Edit form */}
      {editing ? (
        <form onSubmit={save} className="rounded-2xl bg-slate-900/50 border border-slate-800 p-5 space-y-4">
          <h2 className="font-black text-lg">Editar perfil</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Nombre</label>
              <input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Apellidos</label>
              <input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Peso (kg)</label>
              <input
                type="number"
                step="0.1"
                value={form.bodyWeightKg}
                onChange={(e) => setForm({ ...form, bodyWeightKg: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Fecha competición</label>
              <input
                type="date"
                value={form.competitionDate}
                onChange={(e) => setForm({ ...form, competitionDate: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Max minutos por sesión</label>
            <input
              type="number"
              value={form.maxSessionMinutes}
              onChange={(e) => setForm({ ...form, maxSessionMinutes: Number(e.target.value) })}
              className="w-full mt-1 px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Experiencia ({form.experienceLevel}/10)</label>
            <input
              type="range"
              min={1}
              max={10}
              value={form.experienceLevel}
              onChange={(e) => setForm({ ...form, experienceLevel: Number(e.target.value) })}
              className="w-full mt-1 accent-yellow-500"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-200 font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-bold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="w-full py-4 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 text-white font-semibold flex items-center justify-center gap-2 transition"
        >
          {saved ? <>✅ Guardado</> : <><Edit3 className="w-4 h-4" /> Editar perfil</>}
        </button>
      )}

      <div className="rounded-2xl bg-slate-900/30 border border-slate-800/60 p-4 text-xs text-slate-500">
        <p className="font-bold text-slate-400 mb-1.5">Información</p>
        <p>Si cambias la fecha de competición se regenerará automáticamente tu plan de entrenamiento con la nueva cuenta atrás.</p>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-3">
      <Icon className="w-4 h-4 text-slate-500 mb-1" />
      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">{label}</p>
      <p className="text-base font-bold text-white mt-0.5">{value}</p>
    </div>
  );
}
