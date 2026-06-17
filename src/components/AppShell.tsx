"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Trophy, LayoutDashboard, Calendar, Timer as TimerIcon, Dumbbell, User, LogOut } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Inicio", icon: LayoutDashboard },
  { href: "/training", label: "Plan", icon: Calendar },
  { href: "/timer", label: "Timer", icon: TimerIcon },
  { href: "/exercises", label: "Ejercicios", icon: Dumbbell },
  { href: "/profile", label: "Perfil", icon: User },
];

export function AppShell({ children, athleteName }: { children: ReactNode; athleteName?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen pb-24 md:pb-0">
      {/* Top bar (desktop) */}
      <header className="hidden md:flex sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/60 px-6 py-3 items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 flex items-center justify-center">
            <Trophy className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-black text-sm leading-tight">
              <span className="gradient-gold">IFBB</span> Challenge
            </div>
            <div className="text-[10px] text-slate-500 leading-tight">Trainer v2.0</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition",
                  active
                    ? "bg-yellow-500/15 text-yellow-300"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={logout}
            className="ml-3 px-3 py-2 rounded-lg text-slate-500 hover:text-rose-300 hover:bg-rose-500/10 transition flex items-center gap-1.5 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </nav>
        {athleteName && (
          <div className="text-sm text-slate-400">
            Hola, <span className="text-white font-semibold">{athleteName}</span>
          </div>
        )}
      </header>

      {/* Top bar (mobile) */}
      <header className="md:hidden sticky top-0 z-30 bg-slate-950/85 backdrop-blur-lg border-b border-slate-800/60 px-5 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-300 via-amber-500 to-orange-600 flex items-center justify-center">
            <Trophy className="w-4 h-4 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-black text-sm">
            <span className="gradient-gold">IFBB</span> Trainer
          </span>
        </Link>
        <button
          onClick={logout}
          className="text-slate-500 hover:text-rose-300 p-1.5"
          aria-label="Cerrar sesión"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      <main className="px-5 md:px-8 py-6 max-w-6xl mx-auto">{children}</main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/60">
        <div className="grid grid-cols-5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-semibold uppercase tracking-wide transition",
                  active ? "text-yellow-300" : "text-slate-500"
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
