"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Trophy, Mail, Lock, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      if (!data.hasAthlete || !data.onboardingComplete) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col px-6 py-10">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 mb-5 shadow-[0_0_40px_rgba(255,215,0,0.4)]">
            <Trophy className="w-10 h-10 text-black" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="gradient-gold">IFBB</span>{" "}
            <span className="text-white">Fitness</span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Challenge Trainer v2.0</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Email</label>
            <div className="mt-1.5 relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atleta@ejemplo.com"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white placeholder-slate-500 focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">Contraseña</label>
            <div className="mt-1.5 relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-900/60 border border-slate-700/50 text-white placeholder-slate-500 focus:border-yellow-500/60 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 transition"
              />
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
            className="w-full py-4 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black font-bold tracking-wide shadow-[0_8px_30px_rgba(255,215,0,0.25)] disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
          </button>
        </form>

        <p className="text-center text-slate-400 text-sm mt-8">
          ¿No tienes cuenta?{" "}
          <Link href="/register" className="text-yellow-400 font-semibold hover:text-yellow-300">
            Crear cuenta
          </Link>
        </p>
      </div>

      <p className="text-center text-xs text-slate-600">
        Preparación oficial para IFBB Fitness Challenge
      </p>
    </div>
  );
}
