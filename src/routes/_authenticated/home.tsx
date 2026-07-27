import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { LESSONS } from "@/lib/lessons";
import { cn } from "@/lib/utils";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  ClipboardList,
  Gauge,
  LineChart,
  MessageCircle,
  Radar,
  ScrollText,
  Target,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Cockpit · Zero ao Trade" },
      {
        name: "description",
        content:
          "Seu cockpit de decisão: estado cognitivo, missão do dia, radar da decisão e linha do tempo das suas decisões.",
      },
      { property: "og:title", content: "Cockpit · Zero ao Trade" },
      {
        property: "og:description",
        content: "Estado cognitivo, missão do dia, radar da decisão e linha do tempo cognitiva.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const DIAS = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];

function Home() {
  const navigate = useNavigate();

  const profileQ = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", user.user.id).maybeSingle();
      return data;
    },
  });

  const progressQ = useQuery({
    queryKey: ["progress"],
    queryFn: async () => (await supabase.from("lessons_progress").select("*")).data ?? [],
  });

  const rulesQ = useQuery({
    queryKey: ["rules"],
    queryFn: async () =>
      (await supabase.from("personal_rules").select("*").eq("ativa", true).order("created_at")).data ?? [],
  });

  const diaryQ = useQuery({
    queryKey: ["diary-recent"],
    queryFn: async () =>
      (await supabase.from("diary_entries").select("*").order("created_at", { ascending: false }).limit(20)).data ?? [],
  });

  const simsQ = useQuery({
    queryKey: ["sims-recent"],
    queryFn: async () =>
      (await supabase.from("simulations").select("*").order("created_at", { ascending: false }).limit(10)).data ?? [],
  });

  useEffect(() => {
    if (profileQ.data && !profileQ.data.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profileQ.data, navigate]);

  const progress = progressQ.data ?? [];
  const rules = rulesQ.data ?? [];
  const diary = diaryQ.data ?? [];
  const sims = simsQ.data ?? [];

  const doneSlugs = new Set(progress.filter((p) => p.completed_at).map((p) => p.lesson_slug));
  const proximaLicao = LESSONS.find((l) => !doneSlugs.has(l.slug)) ?? LESSONS[LESSONS.length - 1];
  const nome = profileQ.data?.nome ?? "trader";
  const streak = profileQ.data?.streak_dias ?? 0;

  const hoje = new Date();
  const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  const isHoje = (iso: string) => new Date(iso).getTime() >= inicioDoDia;

  // ---- Estado cognitivo -------------------------------------------------
  const avaliadas = diary.filter((d) => d.seguiu_regra !== null);
  const seguidas = avaliadas.filter((d) => d.seguiu_regra).length;
  const disciplina = avaliadas.length ? Math.round((seguidas / avaliadas.length) * 100) : null;
  const notaQualidade =
    disciplina === null ? "—" : disciplina >= 90 ? "A" : disciplina >= 75 ? "B" : disciplina >= 60 ? "C" : "D";

  const ultimasTres = avaliadas.slice(0, 3);
  const viesDetectado =
    ultimasTres.length >= 2 && ultimasTres.filter((d) => !d.seguiu_regra).length >= 2
      ? "Desvio recorrente de regra"
      : rules.length === 0
        ? "Operando sem regras escritas"
        : null;

  // ---- Missão do dia ----------------------------------------------------
  const licaoHoje = progress.some((p) => p.completed_at && isHoje(p.completed_at));
  const simHoje = sims.some((s) => isHoje(s.created_at));
  const diarioHoje = diary.some((d) => isHoje(d.created_at));
  const temRegras = rules.length >= 3;

  const missao = [
    {
      done: licaoHoje,
      label: `Terminar a lição "${proximaLicao.titulo}"`,
      to: "/licao/$slug" as const,
      params: { slug: proximaLicao.slug },
      min: 8,
    },
    { done: temRegras, label: "Revisar suas regras pessoais", to: "/regras" as const, min: 3 },
    { done: simHoje, label: "Simular um payoff antes de decidir", to: "/simulador" as const, min: 5 },
    { done: diarioHoje, label: "Registrar uma hipótese no diário", to: "/diario" as const, min: 2 },
  ];
  const missaoFeita = missao.filter((m) => m.done).length;
  const minutos = missao.filter((m) => !m.done).reduce((a, m) => a + m.min, 0);

  // ---- Radar da decisão -------------------------------------------------
  const radar = [
    { ok: temRegras, label: "Plano escrito (3+ regras ativas)" },
    { ok: doneSlugs.size >= 3, label: "Base conceitual mínima (3 lições)" },
    { ok: simHoje || sims.length > 0, label: "Payoff simulado" },
    { ok: diary.some((d) => d.status === "aberta") || diarioHoje, label: "Hipótese registrada" },
  ];
  const confianca = Math.round((radar.filter((r) => r.ok).length / radar.length) * 100);
  const prontidao = confianca >= 75 ? "Preparado" : confianca >= 50 ? "Atenção" : "Sem contexto";
  const prontidaoCor =
    confianca >= 75 ? "text-success" : confianca >= 50 ? "text-primary" : "text-destructive";

  // ---- Timeline ---------------------------------------------------------
  const hora = (iso: string) =>
    new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const timeline = [
    ...progress
      .filter((p) => p.completed_at && isHoje(p.completed_at))
      .map((p) => ({
        at: p.completed_at as string,
        label: `Lição concluída: ${LESSONS.find((l) => l.slug === p.lesson_slug)?.titulo ?? p.lesson_slug}`,
      })),
    ...sims
      .filter((s) => isHoje(s.created_at))
      .map((s) => ({ at: s.created_at, label: `Simulação: ${s.tipo_estrategia}${s.ativo ? ` · ${s.ativo}` : ""}` })),
    ...diary
      .filter((d) => isHoje(d.created_at))
      .map((d) => ({
        at: d.created_at,
        label: `Decisão registrada: ${d.ativo} ${d.estrutura}${d.seguiu_regra === false ? " · regra furada" : d.seguiu_regra ? " · seguiu regra" : ""}`,
      })),
  ].sort((a, b) => a.at.localeCompare(b.at));

  const saudacao = hoje.getHours() < 12 ? "Bom dia" : hoje.getHours() < 18 ? "Boa tarde" : "Boa noite";

  return (
    <AppShell title="Cockpit da decisão">
      {/* Briefing */}
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Briefing</div>
        <p className="mt-2 text-base leading-relaxed">
          {saudacao}, <span className="font-semibold">{nome}</span>. Hoje é {DIAS[hoje.getDay()]}.{" "}
          {disciplina === null
            ? "Você ainda não tem decisões avaliadas — o sistema começa a te acompanhar no primeiro registro do diário."
            : `Sua disciplina está em ${disciplina}%, com ${seguidas} de ${avaliadas.length} decisões dentro das suas próprias regras.`}{" "}
          {missaoFeita === missao.length
            ? "Missão de hoje concluída."
            : `Faltam ${missao.length - missaoFeita} itens da missão de hoje (~${minutos} min).`}
        </p>
      </div>

      {/* 1. Estado atual */}
      <SectionTitle icon={Gauge} n="01" title="Estado cognitivo" sub="Como você está hoje" />
      <div className="grid gap-3 md:grid-cols-4">
        <Metric label="Prontidão" value={prontidao} valueClass={prontidaoCor} hint={`Confiança ${confianca}%`} />
        <Metric
          label="Disciplina"
          value={disciplina === null ? "—" : `${disciplina}%`}
          hint={`${seguidas}/${avaliadas.length} regras seguidas`}
        />
        <Metric label="Qualidade das decisões" value={notaQualidade} hint={`${diary.length} registros`} />
        <Metric
          label="Viés detectado"
          value={viesDetectado ? "Sim" : "Nenhum"}
          valueClass={viesDetectado ? "text-destructive" : "text-success"}
          hint={viesDetectado ?? `Streak de ${streak} dias`}
        />
      </div>

      {/* 2. Missão do dia */}
      <SectionTitle icon={Target} n="02" title="Missão de hoje" sub={`~${minutos} min restantes`} />
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${(missaoFeita / missao.length) * 100}%` }}
          />
        </div>
        <ul className="space-y-2">
          {missao.map((m) => (
            <li key={m.label}>
              <Link
                to={m.to as string}
                params={"params" in m ? (m.params as never) : undefined}
                className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent"
              >
                <span
                  className={cn(
                    "grid size-5 shrink-0 place-items-center rounded border",
                    m.done ? "border-success bg-success text-success-foreground" : "border-border",
                  )}
                >
                  {m.done && <Check size={12} />}
                </span>
                <span className={cn("text-sm", m.done && "text-muted-foreground line-through")}>{m.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{m.min} min</span>
                <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-60" />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 3. Radar da decisão */}
      <SectionTitle icon={Radar} n="03" title="Radar da decisão" sub="Você tem contexto para operar?" />
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="shrink-0">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Confiança atual</div>
            <div className={cn("font-mono text-5xl font-bold", prontidaoCor)}>{confianca}%</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {confianca >= 75
                ? "Contexto suficiente para estruturar uma decisão."
                : "Contexto insuficiente. Complete os itens ao lado antes de decidir."}
            </div>
          </div>
          <ul className="grid flex-1 gap-2 sm:grid-cols-2">
            {radar.map((r) => (
              <li key={r.label} className="flex items-center gap-2 text-sm">
                <span
                  className={cn(
                    "grid size-4 place-items-center rounded-sm border text-[10px]",
                    r.ok ? "border-success bg-success text-success-foreground" : "border-border text-transparent",
                  )}
                >
                  ✓
                </span>
                <span className={r.ok ? "text-foreground" : "text-muted-foreground"}>{r.label}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
          O radar mede o seu processo, não o mercado. Nada aqui é recomendação de investimento.
        </p>
      </div>

      {/* 4. Copilot */}
      <SectionTitle icon={MessageCircle} n="04" title="Copilot" sub="Pergunte qualquer coisa — ele informa, você decide" />
      <div className="rounded-lg border border-primary/40 bg-card p-6">
        <div className="text-xl font-semibold">O que você quer entender agora?</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "Explique valor extrínseco",
            "Revise minha última operação",
            "Não entendi strike",
            "Analise meu diário",
            "Minha trava respeita minhas regras?",
          ].map((q) => (
            <Link
              key={q}
              to="/copilot"
              className="rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground hover:border-primary/60 hover:text-foreground"
            >
              {q}
            </Link>
          ))}
        </div>
        <Link
          to="/copilot"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Abrir Copilot <ArrowRight size={15} />
        </Link>
      </div>

      {/* 5. Timeline */}
      <SectionTitle icon={Activity} n="05" title="Linha do tempo cognitiva" sub="O que você fez hoje" />
      <div className="rounded-lg border border-border bg-card p-5">
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum registro hoje ainda. Cada lição, simulação e decisão aparece aqui em ordem.
          </p>
        ) : (
          <ol className="relative space-y-4 border-l border-border pl-5">
            {timeline.map((t, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[1.55rem] top-1.5 size-2 rounded-full bg-primary" />
                <div className="font-mono text-xs text-muted-foreground">{hora(t.at)}</div>
                <div className="text-sm">{t.label}</div>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Fluxo narrativo */}
      <SectionTitle icon={LineChart} n="06" title="Seu loop de decisão" sub="A ordem importa" />
      <div className="grid gap-3 md:grid-cols-5">
        <Step n={1} icon={BookOpen} label="Aprender" to="/trilha" desc={`${doneSlugs.size}/${LESSONS.length} lições`} />
        <Step n={2} icon={ScrollText} label="Definir" to="/regras" desc={`${rules.length} regras ativas`} />
        <Step n={3} icon={Calculator} label="Simular" to="/simulador" desc={`${sims.length} simulações`} />
        <Step n={4} icon={ClipboardList} label="Registrar" to="/diario" desc={`${diary.length} decisões`} />
        <Step n={5} icon={LineChart} label="Revisar" to="/revisao" desc={disciplina === null ? "sem dados" : `${disciplina}% disciplina`} />
      </div>
    </AppShell>
  );
}

function SectionTitle({
  icon: Icon,
  n,
  title,
  sub,
}: {
  icon: any;
  n: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mt-8 mb-3 flex items-baseline gap-3">
      <span className="font-mono text-xs text-primary">{n}</span>
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider">
        <Icon size={15} className="text-primary" /> {title}
      </h2>
      <span className="truncate text-xs text-muted-foreground">{sub}</span>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  valueClass,
}: {
  label: string;
  value: string | number;
  hint?: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-2 font-mono text-2xl font-bold", valueClass)}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Step({
  n,
  icon: Icon,
  label,
  to,
  desc,
}: {
  n: number;
  icon: any;
  label: string;
  to: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/60"
    >
      <div className="flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-full border border-primary/50 font-mono text-[11px] text-primary">
          {n}
        </span>
        <Icon size={16} className="text-muted-foreground group-hover:text-primary" />
      </div>
      <div className="mt-3 text-sm font-semibold">{label}</div>
      <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
    </Link>
  );
}
