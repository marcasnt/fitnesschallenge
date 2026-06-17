"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, Sparkles, Trophy } from "lucide-react";
import { LEVEL_DESIGN, PHASE_COLORS } from "@/lib/design-tokens";
import { sounds } from "@/lib/timer-sounds";

type Gender = "MALE" | "FEMALE";
type CompetitionLevel = "GOLD" | "SILVER" | "BRONZE" | "SPEED_FIT";
type CompetitionModality =
  | "INDIVIDUAL"
  | "PAIR_MALE"
  | "PAIR_FEMALE"
  | "PAIR_MIXED"
  | "TEAM_6"
  | "SPEED_FIT_INDIVIDUAL"
  | "SPEED_FIT_TEAM_4";

const DAYS = [
  { value: "MONDAY", label: "L" },
  { value: "TUESDAY", label: "M" },
  { value: "WEDNESDAY", label: "X" },
  { value: "THURSDAY", label: "J" },
  { value: "FRIDAY", label: "V" },
  { value: "SATURDAY", label: "S" },
  { value: "SUNDAY", label: "D" },
];

const MODALITIES: { value: CompetitionModality; label: string; icon: string; desc: string }[] = [
  { value: "INDIVIDUAL", label: "Individual", icon: "🏃", desc: "Compite solo en las 6 estaciones" },
  { value: "PAIR_MALE", label: "Pareja Masc.", icon: "👬", desc: "2 hombres, mismo peso" },
  { value: "PAIR_FEMALE", label: "Pareja Fem.", icon: "👭", desc: "2 mujeres, mismo peso" },
  { value: "PAIR_MIXED", label: "Pareja Mixta", icon: "👫", desc: "Hombre + mujer, peso unif." },
  { value: "TEAM_6", label: "Equipo (6)", icon: "👥", desc: "1 atleta por estación" },
  { value: "SPEED_FIT_INDIVIDUAL", label: "Speed Fit Ind.", icon: "⚡", desc: "Cronometra 30 reps" },
  { value: "SPEED_FIT_TEAM_4", label: "Speed Fit Eq.", icon: "🚀", desc: "4 atletas, 60 reps/est." },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [bodyWeightKg, setBodyWeightKg] = useState<number | "">("");
  const [modality, setModality] = useState<CompetitionModality>("INDIVIDUAL");
  const [level, setLevel] = useState<CompetitionLevel>("GOLD");
  const [competitionDate, setCompetitionDate] = useState("");
  const [availableDays, setAvailableDays] = useState<string[]>(["MONDAY", "WEDNESDAY", "FRIDAY", "SATURDAY"]);
  const [maxSessionMinutes, setMaxSessionMinutes] = useState(60);
  const [experienceLevel, setExperienceLevel] = useState(5);

  // Auto-detection result
  const [category, setCategory] = useState<{
    category: string;
    autoAssigned: CompetitionLevel | null;
    allowed: CompetitionLevel[];
    rule: string;
  } | null>(null);

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.authenticated && data.athlete) {
        setFirstName(data.athlete.firstName);
        setLastName(data.athlete.lastName);
        setGender(data.athlete.gender);
        setDateOfBirth(data.athlete.dateOfBirth?.split("T")[0] ?? "");
        setBodyWeightKg(data.athlete.bodyWeightKg ?? "");
        setLevel(data.athlete.competitionLevel);
        setModality(data.athlete.competitionModality);
        if (data.athlete.competitionDate) {
          setCompetitionDate(data.athlete.competitionDate.split("T")[0]);
        }
        if (data.athlete.availableDaysJson) {
          try {
            setAvailableDays(JSON.parse(data.athlete.availableDaysJson));
          } catch { /* ignore */ }
        }
      }
    }
    void loadUser();
  }, []);

  function calculateAge(dob: string): number {
    if (!dob) return 0;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  function detectCategory(dob: string, g: Gender) {
    const age = calculateAge(dob);
    if (age < 23) {
      return {
        category: "JUNIOR",
        autoAssigned: "GOLD" as CompetitionLevel,
        allowed: ["GOLD"] as CompetitionLevel[],
        rule: "Atletas menores de 23 años compiten exclusivamente en Nivel ORO",
      };
    }
    const masterAge = g === "MALE" ? 40 : 35;
    if (age >= masterAge) {
      return {
        category: "MASTER",
        autoAssigned: "SILVER" as CompetitionLevel,
        allowed: ["SILVER"] as CompetitionLevel[],
        rule: `Atletas Master (${g === "MALE" ? "hombres >40" : "mujeres >35"} años) compiten exclusivamente en Nivel PLATA`,
      };
    }
    return {
      category: "SENIOR",
      autoAssigned: null,
      allowed: ["GOLD", "SILVER", "BRONZE", "SPEED_FIT"] as CompetitionLevel[],
      rule: "Categoría Senior puede elegir cualquier nivel disponible",
    };
  }

  function handleNextFromStep3() {
    const cat = detectCategory(dateOfBirth, gender);
    setCategory(cat);
    if (cat.autoAssigned) {
      setLevel(cat.autoAssigned);
    } else if (!cat.allowed.includes(level)) {
      setLevel("GOLD");
    }
    setStep(4);
  }

  function toggleDay(d: string) {
    setAvailableDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  async function finish(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/athletes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          bodyWeightKg: bodyWeightKg === "" ? undefined : Number(bodyWeightKg),
          competitionLevel: level,
          competitionModality: modality,
          competitionDate,
          availableDaysJson: JSON.stringify(availableDays),
          maxSessionMinutes,
          experienceLevel,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar");
        setLoading(false);
        return;
      }
      sounds.complete();
      setStep(6);
      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1800);
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  const age = calculateAge(dateOfBirth);

  return (
    <div className="min-h-screen px-5 py-8 max-w-2xl mx-auto">
      {/* Progress bar */}
      {step < 6 && (
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Paso {step} de 5</span>
            <span className="font-semibold text-yellow-400">{Math.round((step / 5) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 transition-all"
              style={{ width: `${(step / 5) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1 — Datos personales */}
      {step === 1 && (
        <div className="space-y-5">
          <Header step={1} title="Datos Personales" subtitle="Empecemos por lo básico" />
          <Field label="Nombre">
            <input
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
            />
          </Field>
          <Field label="Apellidos">
            <input
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
            />
          </Field>
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Sexo</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {(["MALE", "FEMALE"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`py-3.5 rounded-xl border font-semibold transition ${
                    gender === g
                      ? "bg-yellow-500/20 border-yellow-500/60 text-yellow-200"
                      : "bg-slate-900/60 border-slate-700/50 text-slate-400"
                  }`}
                >
                  {g === "MALE" ? "👨 Hombre" : "👩 Mujer"}
                </button>
              ))}
            </div>
          </div>
          <Field label="Fecha de nacimiento">
            <input
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
            />
            {age > 0 && (
              <p className="text-xs text-slate-500 mt-1.5">{age} años</p>
            )}
          </Field>
          <Field label="Peso corporal (kg) — opcional">
            <input
              type="number"
              step="0.1"
              value={bodyWeightKg}
              onChange={(e) => setBodyWeightKg(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              placeholder="75.5"
            />
          </Field>
          <NavButton
            onClick={() => setStep(2)}
            disabled={!firstName || !lastName || !dateOfBirth}
            label="Continuar"
          />
        </div>
      )}

      {/* STEP 2 — Modalidad */}
      {step === 2 && (
        <div className="space-y-4">
          <Header step={2} title="Modalidad" subtitle="¿Cómo competirás?" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {MODALITIES.map((m) => (
              <button
                key={m.value}
                onClick={() => setModality(m.value)}
                className={`text-left p-4 rounded-2xl border-2 transition ${
                  modality === m.value
                    ? "bg-yellow-500/15 border-yellow-500/60"
                    : "bg-slate-900/40 border-slate-800/60 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-2xl">{m.icon}</span>
                  <span className="font-bold text-white">{m.label}</span>
                </div>
                <p className="text-xs text-slate-400">{m.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-4">
            <BackButton onClick={() => setStep(1)} />
            <NavButton onClick={() => setStep(3)} label="Continuar" />
          </div>
        </div>
      )}

      {/* STEP 3 — Nivel (con detección) */}
      {step === 3 && (
        <div className="space-y-5">
          <Header step={3} title="Nivel de Competición" subtitle="Detectamos tu categoría automáticamente" />
          {dateOfBirth && (
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Categoría detectada</span>
              </div>
              <div className="text-lg font-black mb-1">
                {(() => {
                  const cat = detectCategory(dateOfBirth, gender);
                  return (
                    <span className={
                      cat.category === "JUNIOR" ? "text-yellow-400" :
                      cat.category === "MASTER" ? "text-slate-300" :
                      "text-emerald-400"
                    }>
                      {cat.category}
                    </span>
                  );
                })()}
              </div>
              <p className="text-xs text-slate-400">
                {detectCategory(dateOfBirth, gender).rule}
              </p>
            </div>
          )}

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Nivel de Competición
            </label>
            <div className="mt-2 space-y-2.5">
              {(["GOLD", "SILVER", "BRONZE", "SPEED_FIT"] as CompetitionLevel[]).map((lv) => {
                const cat = dateOfBirth ? detectCategory(dateOfBirth, gender) : null;
                const disabled = cat ? !cat.allowed.includes(lv) : false;
                const design = LEVEL_DESIGN[lv];
                return (
                  <button
                    key={lv}
                    type="button"
                    onClick={() => !disabled && setLevel(lv)}
                    disabled={disabled}
                    className={`w-full p-4 rounded-2xl border-2 transition flex items-center justify-between ${
                      level === lv
                        ? `bg-gradient-to-r ${design.gradient} border-transparent text-black`
                        : disabled
                        ? "bg-slate-900/20 border-slate-800/40 opacity-40 cursor-not-allowed"
                        : "bg-slate-900/40 border-slate-800/60 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Trophy className="w-5 h-5" strokeWidth={2.5} />
                      <div className="text-left">
                        <div className="font-black text-base">{design.label}</div>
                        <div className="text-xs opacity-70">
                          {lv === "GOLD" && "Atletas avanzados — mayor peso"}
                          {lv === "SILVER" && "Atletas intermedios"}
                          {lv === "BRONZE" && "Principiantes — peso corporal"}
                          {lv === "SPEED_FIT" && "Velocidad pura (cronómetro)"}
                        </div>
                      </div>
                    </div>
                    {disabled && <span className="text-xs font-semibold opacity-60">No permitido</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <BackButton onClick={() => setStep(2)} />
            <NavButton onClick={handleNextFromStep3} label="Continuar" />
          </div>
        </div>
      )}

      {/* STEP 4 — Fecha competición */}
      {step === 4 && (
        <div className="space-y-5">
          <Header step={4} title="Fecha de Competición" subtitle="Generaremos tu plan automáticamente" />
          <Field label="¿Cuándo compites?">
            <input
              type="date"
              required
              min={new Date().toISOString().split("T")[0]}
              value={competitionDate}
              onChange={(e) => setCompetitionDate(e.target.value)}
              className="w-full px-4 py-4 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-lg focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
            />
          </Field>
          {competitionDate && (
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <p className="text-xs text-slate-400 mb-1">Tiempo hasta la competición</p>
              <p className="text-3xl font-black gradient-gold">
                {Math.max(1, Math.ceil((new Date(competitionDate).getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)))} semanas
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Se generará un plan con fases de acumulación, transformación, realización y tapering
              </p>
            </div>
          )}
          <Field label="Duración máxima por sesión (min)">
            <input
              type="number"
              min={15}
              max={240}
              value={maxSessionMinutes}
              onChange={(e) => setMaxSessionMinutes(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
            />
          </Field>
          <Field label={`Nivel de experiencia (${experienceLevel}/10)`}>
            <input
              type="range"
              min={1}
              max={10}
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(Number(e.target.value))}
              className="w-full accent-yellow-500"
            />
          </Field>
          <div className="flex gap-2 pt-2">
            <BackButton onClick={() => setStep(3)} />
            <NavButton onClick={() => setStep(5)} disabled={!competitionDate} label="Continuar" />
          </div>
        </div>
      )}

      {/* STEP 5 — Disponibilidad semanal */}
      {step === 5 && (
        <form onSubmit={finish} className="space-y-5">
          <Header step={5} title="Disponibilidad" subtitle="¿Qué días puedes entrenar?" />
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Días disponibles</p>
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  className={`aspect-square rounded-xl flex items-center justify-center text-base font-black transition ${
                    availableDays.includes(d.value)
                      ? "bg-gradient-to-br from-yellow-400 to-amber-500 text-black shadow-lg"
                      : "bg-slate-900/60 text-slate-500 border border-slate-800"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Has seleccionado {availableDays.length} días · Recomendado: 3-5 días/semana
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <BackButton onClick={() => setStep(4)} />
            <button
              type="submit"
              disabled={loading || availableDays.length === 0}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold tracking-wide shadow-[0_8px_30px_rgba(255,215,0,0.25)] disabled:opacity-60 transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generar mi plan
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* STEP 6 — Success */}
      {step === 6 && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 mb-6 shadow-[0_0_50px_rgba(255,215,0,0.5)]">
            <CheckCircle2 className="w-12 h-12 text-black" strokeWidth={2.5} />
          </div>
          <h2 className="text-3xl font-black mb-2 gradient-gold">¡Plan Generado!</h2>
          <p className="text-slate-400 mb-6">
            Tu macrociclo personalizado está listo
          </p>
          <div className="flex items-center justify-center gap-2 text-yellow-300">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Cargando dashboard...</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Header({ step, title, subtitle }: { step: number; title: string; subtitle: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider">Paso {step}</p>
      <h1 className="text-2xl font-black mt-1">{title}</h1>
      <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function NavButton({ onClick, disabled, label }: { onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold tracking-wide shadow-[0_8px_30px_rgba(255,215,0,0.25)] disabled:opacity-60 disabled:saturate-50 transition flex items-center justify-center gap-2"
    >
      {label}
      <ChevronRight className="w-4 h-4" />
    </button>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-5 py-4 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-200 font-semibold transition flex items-center gap-1.5"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
  );
}
