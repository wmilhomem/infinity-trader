import { Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";
import {
  BookOpen,
  Calculator,
  ClipboardList,
  Home,
  LineChart,
  LogOut,
  MessageCircle,
  ScrollText,
} from "lucide-react";

const NAV = [
  { to: "/home", label: "Início", icon: Home },
  { to: "/trilha", label: "Trilha", icon: BookOpen },
  { to: "/simulador", label: "Simulador", icon: Calculator },
  { to: "/regras", label: "Regras", icon: ScrollText },
  { to: "/diario", label: "Diário", icon: ClipboardList },
  { to: "/revisao", label: "Revisão", icon: LineChart },
  { to: "/copilot", label: "Copilot", icon: MessageCircle },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
  const router = useRouter();
  async function signOut() {
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card/40 p-4">
        <Link to="/home" className="mb-6 flex items-center gap-2">
          <div className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground font-mono font-bold">
            0→
          </div>
          <div className="leading-tight">
            <div className="font-semibold">Zero ao Trade</div>
            <div className="text-xs text-muted-foreground">Seu processo de decisão</div>
          </div>
        </Link>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
              activeProps={{ className: "bg-accent text-foreground" }}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <button
          onClick={signOut}
          className="mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <LogOut size={16} /> Sair
        </button>
      </aside>
      <main className="flex-1 min-w-0">
        <header className="border-b border-border bg-card/30 px-6 py-4 backdrop-blur">
          <h1 className="text-lg font-semibold">{title}</h1>
        </header>
        <div className="p-6 max-w-6xl">{children}</div>
        {/* mobile nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 flex justify-around border-t border-border bg-card p-2">
          {NAV.slice(0, 5).map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] text-muted-foreground"
              activeProps={{ className: "text-primary" }}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
