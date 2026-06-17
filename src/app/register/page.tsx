"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Mail, Lock, User, Calendar, Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "MALE" as "MALE" | "FEMALE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al registrarse");
        setLoading(false);
        return;
      }

      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 mb-4 shadow-[0_0_30px_rgba(255,215,0,0.4)]">
            <Trophy className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black">Crear Cuenta</h1>
          <p className="text-slate-400 mt-1 text-sm">Comienza tu preparación oficial</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Nombre</label>
              <div className="mt-1 relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  required
                  value={form.firstName}
                  onChange={(e) => update("firstName", e.target.value)}
                  className="w-full pl-8 pr-3 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                />
              </div>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Apellidos</label>
              <input
                required
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className="w-full mt-1 px-3 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Email</label>
            <div className="mt-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="w-full pl-8 pr-3 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Contraseña</label>
            <div className="mt-1 relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                className="w-full pl-8 pr-3 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Fecha de nacimiento</label>
            <div className="mt-1 relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="date"
                required
                value={form.dateOfBirth}
                onChange={(e) => update("dateOfBirth", e.target.value)}
                className="w-full pl-8 pr-3 py-3 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white text-sm focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Sexo</label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              {(["MALE", "FEMALE"] as const).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => update("gender", g)}
                  className={`py-3 rounded-xl border text-sm font-semibold transition ${
                    form.gender === g
                      ? "bg-yellow-500/20 border-yellow-500/60 text-yellow-200"
                      : "bg-slate-900/60 border-slate-700/50 text-slate-400"
                  }`}
                >
                  {g === "MALE" ? "Hombre" : "Mujer"}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold tracking-wide shadow-[0_8px_30px_rgba(255,215,0,0.25)] disabled:opacity-60 transition flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Crear cuenta"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="text-yellow-400 font-semibold hover:text-yellow-300">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
