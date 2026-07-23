import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { LESSONS } from "@/lib/lessons";
import { toast } from "sonner";
import {
  BookOpen,
  Calculator,
  ClipboardList,
  Flame,
  LineChart,
  MessageCircle,
  ScrollText,
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Início · Zero ao Trade" },
      { name: "description", content: "Sua trilha, regras e diário num só lugar." },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.user.id)
        .maybeSingle();
      return data;
    },
  });

  const progressQ = useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      const { data } = await supabase.from("lessons_progress").select("*");
      return data ?? [];
    },
  });

  const rulesCountQ = useQuery({
    queryKey: ["rules-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("personal_rules")
        .select("*", { count: "exact", head: true })
        .eq("ativa", true);
      return count ?? 0;
    },
  });

  const diaryCountQ = useQuery({
    queryKey: ["diary-count"],
    queryFn: async () => {
      const { count } = await supabase
        .from("diary_entries")
        .select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  useEffect(() => {
    if (profileQ.data && !profileQ.data.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profileQ.data, navigate]);

  const doneSlugs = new Set((progressQ.data ?? []).filter((p) => p.completed_at).map((p) => p.lesson_slug));
  const proximaLicao = LESSONS.find((l) => !doneSlugs.has(l.slug)) ?? LESSONS[0];
  const xp = profileQ.data?.xp_total ?? 0;
  const streak = profileQ.data?.streak_dias ?? 0;
  const nome = profileQ.data?.nome ?? "trader";

  return (
    <AppShell title={`E aí, ${nome} 👋`}>
      <div className="grid gap-4 md:grid-cols-3">
        <Stat icon={Sparkles} label="XP total" value={xp} />
        <Stat icon={Flame} label="Streak" value={`${streak} dias`} />
        <Stat icon={BookOpen} label="Lições" value={`${doneSlugs.size} / ${LESSONS.length}`} />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Continuar de onde parou</div>
        <div className="mt-2 text-lg font-semibold">{proximaLicao.titulo}</div>
        <p className="mt-1 text-sm text-muted-foreground">{proximaLicao.resumo}</p>
        <Link
          to="/licao/$slug"
          params={{ slug: proximaLicao.slug }}
          className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Abrir lição →
        </Link>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <Card
          icon={Calculator}
          label="Simulador de payoff"
          desc="Monte trava de alta, iron condor ou call sozinha."
          to="/simulador"
        />
        <Card
          icon={ScrollText}
          label={`Regras pessoais (${rulesCountQ.data ?? 0})`}
          desc="Escreva as regras que você vai seguir."
          to="/regras"
        />
        <Card
          icon={ClipboardList}
          label={`Diário (${diaryCountQ.data ?? 0})`}
          desc="Registre por que abriu, qual regra aplicou, resultado."
          to="/diario"
        />
        <Card
          icon={LineChart}
          label="Revisão"
          desc="Analise seu histórico. 'Segui regra' vs 'não segui'."
          to="/revisao"
        />
        <Card
          icon={MessageCircle}
          label="Copilot"
          desc="Tire dúvida sobre lição, sobre uma simulação, ou revise uma decisão do diário."
          to="/copilot"
        />
      </div>
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        <Icon size={14} className="text-primary" /> {label}
      </div>
      <div className="mt-2 text-2xl font-bold font-mono">{value}</div>
    </div>
  );
}

function Card({ icon: Icon, label, desc, to }: { icon: any; label: string; desc: string; to: string }) {
  return (
    <Link
      to={to}
      className="group rounded-lg border border-border bg-card p-5 hover:border-primary/60 transition-colors"
    >
      <Icon className="text-primary" size={20} />
      <div className="mt-3 font-semibold">{label}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Link>
  );
}
