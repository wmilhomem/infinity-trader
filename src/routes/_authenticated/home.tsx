import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { liçõesDe } from "@/lib/lessons";
import { cn } from "@/lib/utils";
import { preverTamanhoPosicao } from "@/engines/behavior-forecast";
import { montarPainelDeVoo, type CheckCognitivo } from "@/engines/readiness";
import { useCaminho } from "@/lib/use-caminho";
import type { DiaryEntry } from "@/engines/types";
import { CheckCognitivoModal } from "@/components/CheckCognitivoModal";
import {
  FLOW_OPERAR_KEY,
  FluxoOperarModal,
  type FluxoRetomada,
} from "@/components/FluxoOperarModal";
import { RitualModal } from "@/components/RitualModal";
import {
  ArrowRight,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  LineChart,
  MessageCircle,
  Moon,
  Radar,
  ScrollText,
  Sprout,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Hoje · Zero ao Trade" },
      {
        name: "description",
        content:
          "Uma missão por dia: não perder dinheiro por impulso. Veja sua disciplina evoluir e decida com processo.",
      },
      { property: "og:title", content: "Hoje · Zero ao Trade" },
      {
        property: "og:description",
        content:
          "Uma missão por dia, sua disciplina em evolução e um copilot que pergunta antes de responder.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { caminho } = useCaminho();
  const [expandido, setExpandido] = useState(false);
  const [checkAberto, setCheckAberto] = useState(false);
  const [ritualAberto, setRitualAberto] = useState(false);
  const [flowAberto, setFlowAberto] = useState(false);
  const [flowTela, setFlowTela] = useState<"hipotese" | "resumo" | "parou-hoje">("hipotese");
  const [flowSalvo, setFlowSalvo] = useState<FluxoRetomada | null>(() => {
    try {
      const raw = sessionStorage.getItem(FLOW_OPERAR_KEY);
      if (!raw) return null;
      const p = JSON.parse(raw) as Partial<FluxoRetomada>;
      if (typeof p.tese !== "string" || !p.tese.trim()) return null;
      return {
        tese: p.tese,
        regraId: p.regraId ?? null,
        regraTexto: p.regraTexto ?? null,
      };
    } catch {
      return null;
    }
  });

  function abrirFluxo(tela: "hipotese" | "resumo" | "parou-hoje") {
    setFlowTela(tela);
    setFlowAberto(true);
  }

  function limparFluxo() {
    try {
      sessionStorage.removeItem(FLOW_OPERAR_KEY);
    } catch {
      /* storage indisponível */
    }
    setFlowSalvo(null);
  }

  const checkQ = useQuery({
    queryKey: ["checks-today"],
    queryFn: async () => {
      const inicioDoDia = new Date();
      inicioDoDia.setHours(0, 0, 0, 0);
      const { data } = await supabase
        .from("cheques_cognitivos")
        .select("*")
        .gte("created_at", inicioDoDia.toISOString())
        .order("created_at", { ascending: false })
        .limit(1);
      return (data ?? [])[0] ?? null;
    },
  });

  const reflexaoQ = useQuery({
    queryKey: ["reflexao-today"],
    queryFn: async () => {
      const { data } = await supabase
        .from("reflexoes_diarias")
        .select("*")
        .eq("data", new Date().toISOString().slice(0, 10))
        .maybeSingle();
      return data ?? null;
    },
  });

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
    queryFn: async () => (await supabase.from("lessons_progress").select("*")).data ?? [],
  });

  const rulesQ = useQuery({
    queryKey: ["rules"],
    queryFn: async () =>
      (await supabase.from("personal_rules").select("*").eq("ativa", true).order("created_at"))
        .data ?? [],
  });

  const diaryQ = useQuery({
    queryKey: ["diary-recent"],
    queryFn: async () =>
      (
        await supabase
          .from("diary_entries")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(200)
      ).data ?? [],
  });

  const simsQ = useQuery({
    queryKey: ["sims-recent"],
    queryFn: async () =>
      (
        await supabase
          .from("simulations")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50)
      ).data ?? [],
  });

  useEffect(() => {
    if (profileQ.isLoading || profileQ.isFetching) return;
    if (profileQ.data && !profileQ.data.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profileQ.data, profileQ.isLoading, profileQ.isFetching, navigate]);

  const progress = progressQ.data ?? [];
  const rules = rulesQ.data ?? [];
  const diary = (diaryQ.data ?? []) as unknown as DiaryEntry[];
  const sims = simsQ.data ?? [];

  const doneSlugs = new Set(progress.filter((p) => p.completed_at).map((p) => p.lesson_slug));
  const trilha = liçõesDe(caminho);
  const proximaLicao = trilha.find((l) => !doneSlugs.has(l.slug)) ?? trilha[trilha.length - 1];
  const primeiroNome = (profileQ.data?.nome ?? "").trim().split(" ")[0];

  // ---- Painel de voo -----------------------------------------------------
  const forecast = preverTamanhoPosicao(diary);
  const painel = montarPainelDeVoo({
    checkHoje: checkQ.data
      ? {
          emocao: checkQ.data.emocao as CheckCognitivo["emocao"],
          motivo: checkQ.data.motivo as CheckCognitivo["motivo"],
          regraId: checkQ.data.regra_id,
          criadoEm: checkQ.data.created_at,
        }
      : null,
    forecast,
    rules: rules.map((r) => ({ id: r.id, texto: r.texto })),
    diary,
  });

  const hoje = new Date();
  const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  const isHoje = (iso: string) => new Date(iso).getTime() >= inicioDoDia;
  const diasAtras = (n: number) => hoje.getTime() - n * 86400000;

  // ---- Disciplina e evolução -------------------------------------------
  const avaliadas = diary.filter((d) => d.seguiu_regra !== null);
  const pct = (arr: typeof avaliadas) =>
    arr.length ? Math.round((arr.filter((d) => d.seguiu_regra).length / arr.length) * 100) : null;

  const janela30 = avaliadas.filter((d) => new Date(d.created_at).getTime() >= diasAtras(30));
  const disc30 = pct(janela30);

  // ---- Missão do dia ----------------------------------------------------
  const licaoHoje = progress.some((p) => p.completed_at && isHoje(p.completed_at));
  const simHoje = sims.some((s) => isHoje(s.created_at));
  const diarioHoje = diary.some((d) => isHoje(d.created_at));
  const temRegras = rules.length >= 3;

  const missao = [
    {
      done: licaoHoje,
      label: `Entender "${proximaLicao.titulo}"`,
      to: "/licao/$slug" as const,
      params: { slug: proximaLicao.slug },
      min: 8,
    },
    { done: temRegras, label: "Atualizar suas regras", to: "/regras" as const, min: 3 },
    {
      done: simHoje,
      label: "Fazer uma simulação antes de decidir",
      to: "/simulador" as const,
      min: 5,
    },
    { done: diarioHoje, label: "Escrever a tese de uma decisão", to: "/diario" as const, min: 2 },
  ];
  const pendentes = missao.filter((m) => !m.done);
  const missaoFeita = missao.length - pendentes.length;
  const minutos = pendentes.reduce((a, m) => a + m.min, 0);
  const tudoFeito = pendentes.length === 0;

  // ---- Voz do mentor ----------------------------------------------------
  const saudacao =
    hoje.getHours() < 12 ? "Bom dia" : hoje.getHours() < 18 ? "Boa tarde" : "Boa noite";
  const ultimasTres = avaliadas.slice(0, 3);
  const furouRecente =
    ultimasTres.length >= 2 && ultimasTres.filter((d) => !d.seguiu_regra).length >= 2;

  const missaoUnica = tudoFeito
    ? "Você já fez o que precisava. O resto é paciência."
    : furouRecente
      ? "Não repetir a decisão de ontem."
      : rules.length === 0
        ? "Escrever a primeira regra antes de qualquer operação."
        : diary.length === 0
          ? "Pensar antes de clicar."
          : "Não perder dinheiro por impulso.";

  const fechamento = tudoFeito
    ? "Volte amanhã."
    : pendentes.length === 1
      ? "Falta um passo. Vamos."
      : "Vamos começar.";

  // ---- Celebração de pequenas vitórias ----------------------------------
  const marcos: { key: string; titulo: string; texto: string }[] = [];
  if (diary.length === 1)
    marcos.push({
      key: "primeira-tese",
      titulo: "Excelente.",
      texto: "A maioria das pessoas opera. Você começou a pensar antes de clicar.",
    });
  if (rules.length === 1)
    marcos.push({
      key: "primeira-regra",
      titulo: "Sua primeira regra existe.",
      texto: "A partir de agora dá para saber se você se respeitou — ou não.",
    });
  if (sims.length === 1)
    marcos.push({
      key: "primeira-sim",
      titulo: "Primeira simulação feita.",
      texto: "Você viu o prejuízo máximo antes do mercado te mostrar.",
    });
  if (doneSlugs.size === 1)
    marcos.push({
      key: "primeira-licao",
      titulo: "Começou.",
      texto: "Uma lição vale mais que dez opiniões.",
    });
  if (janela30.length >= 5 && (disc30 ?? 0) >= 80)
    marcos.push({
      key: "disciplina-alta",
      titulo: "Você virou outro investidor.",
      texto: `${disc30}% das suas últimas decisões respeitaram suas próprias regras.`,
    });
  const marco = marcos[0];

  // ---- Pergunta do copilot ----------------------------------------------
  const perguntaCopilot = furouRecente
    ? "Você escreveu que seguiria sua regra. O que fez você ignorá-la?"
    : diary.length === 0
      ? "O que você faria hoje se o mercado abrisse caindo 3%?"
      : rules.length === 0
        ? "Qual é a única regra que você nunca deveria furar?"
        : "Minha última decisão respeitou minhas regras?";

  return (
    <AppShell title="Hoje">
      {/* Painel de voo */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Como está sua cabeça hoje?
          </div>
          {painel.checkFeitoHoje && (
            <span className="font-mono text-[11px] text-success">check concluído</span>
          )}
        </div>
        <div
          className={cn(
            "mt-3 flex items-center gap-2 text-2xl font-bold tracking-tight",
            painel.estado.cor === "verde" && "text-success",
            painel.estado.cor === "amarelo" && "text-amber-400",
            painel.estado.cor === "vermelho" && "text-loss",
            painel.estado.cor === "cinza" && "text-muted-foreground",
          )}
        >
          <span
            className={cn(
              "inline-block size-2.5 rounded-full",
              painel.estado.cor === "verde" && "bg-success",
              painel.estado.cor === "amarelo" && "bg-amber-400",
              painel.estado.cor === "vermelho" && "bg-loss",
              painel.estado.cor === "cinza" && "bg-muted-foreground/50",
            )}
          />
          {painel.estado.rotulo}
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          {painel.estado.mensagem}
        </p>

        {painel.atencao && (
          <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-400/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-amber-400">
              <span className="inline-block size-2 rounded-full bg-amber-400" /> Atenção
            </div>
            <p className="mt-1.5 text-sm leading-relaxed">{painel.atencao.mensagem}</p>
          </div>
        )}

        {painel.lembrete && (
          <div className="mt-3 rounded-lg border border-loss/40 bg-loss/5 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-loss">
              <span className="inline-block size-2 rounded-full bg-loss" /> Lembre-se
            </div>
            <p className="mt-1.5 text-sm leading-relaxed">
              “{painel.lembrete.texto}”
              {painel.lembrete.vezes > 1 && (
                <span className="text-muted-foreground">
                  {" "}
                  — quebrada {painel.lembrete.vezes} vezes no seu histórico
                </span>
              )}
            </p>
          </div>
        )}

        <div className="mt-4 border-t border-border pt-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="inline-block size-2 rounded-full bg-muted-foreground/50" /> Próximo
            passo
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <p className="text-base font-medium">{painel.proximoPasso}</p>
            <button
              onClick={() => setCheckAberto(true)}
              className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              {painel.checkFeitoHoje
                ? "Refazer meu check (60 segundos)"
                : "Fazer meu Check (60 segundos)"}
            </button>
          </div>
        </div>
      </div>

      {/* Fluxo contínuo — a conversa do dia */}
      <div className="mt-4 rounded-xl border border-primary/40 bg-card p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
          <MessageCircle size={13} /> Fluxo contínuo
        </div>
        <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight">
          Hoje você pensa em operar?
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Em vez de pular direto para a estrutura, comece pelo “por quê”. Eu caminho com você até o
          simulador — e posso te impedir de parar na regra.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {flowSalvo ? (
            <>
              <button
                onClick={() => abrirFluxo("resumo")}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Continuar de onde parou <ArrowRight size={15} />
              </button>
              <button
                onClick={limparFluxo}
                className="rounded-xl border border-border px-5 py-3 text-sm text-muted-foreground hover:bg-accent"
              >
                Recomeçar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => abrirFluxo("hipotese")}
                className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Sim, vou operar
              </button>
              <button
                onClick={() => abrirFluxo("parou-hoje")}
                className="rounded-xl border border-border px-5 py-3 text-sm text-muted-foreground hover:bg-accent"
              >
                Ainda não
              </button>
            </>
          )}
        </div>
      </div>

      {/* Voz do mentor */}
      <section className="pb-2 pt-6">
        <p className="text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
          {saudacao}
          {primeiroNome ? `, ${primeiroNome}` : ""}.
        </p>
        <p className="mt-3 max-w-xl text-lg leading-relaxed text-muted-foreground">
          {tudoFeito ? "Hoje não sobrou nenhuma missão." : "Hoje existe apenas uma missão."}
        </p>
        <p className="mt-1 max-w-xl text-lg font-medium leading-relaxed text-foreground">
          {missaoUnica}
        </p>
        <p className="mt-3 text-sm text-muted-foreground">{fechamento}</p>
      </section>

      {/* Pequena vitória */}
      {marco && (
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-success/40 bg-success/5 p-5">
          <Sprout size={18} className="mt-0.5 shrink-0 text-success" />
          <div>
            <div className="font-semibold text-success">{marco.titulo}</div>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{marco.texto}</p>
          </div>
        </div>
      )}

      {/* Missão do dia — protagonista */}
      <div className="mt-6 rounded-xl border border-primary/30 bg-card p-6">
        <div className="flex items-baseline justify-between">
          <div className="text-xs uppercase tracking-[0.2em] text-primary">Hoje</div>
          <div className="font-mono text-sm text-muted-foreground">
            {tudoFeito ? "concluído" : `${minutos} minutos`}
          </div>
        </div>

        {tudoFeito ? (
          <p className="mt-4 text-lg">Acabou. Nada mais precisa ser feito hoje.</p>
        ) : (
          <ol className="mt-5 space-y-1">
            {pendentes.map((m, i) => (
              <li key={m.label}>
                {i > 0 && <div className="ml-[0.6rem] h-4 w-px bg-border" />}
                <Link
                  to={m.to as string}
                  params={"params" in m ? (m.params as never) : undefined}
                  className="group flex items-center gap-3 rounded-md py-1.5 pr-2 hover:text-primary"
                >
                  <span className="grid size-5 shrink-0 place-items-center rounded-full border border-primary/50 font-mono text-[10px] text-primary">
                    {i + 1}
                  </span>
                  <span className="text-base">{m.label}</span>
                  <ArrowRight
                    size={14}
                    className="ml-auto opacity-0 transition-opacity group-hover:opacity-70"
                  />
                </Link>
              </li>
            ))}
          </ol>
        )}

        {missaoFeita > 0 && !tudoFeito && (
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
            {missao
              .filter((m) => m.done)
              .map((m) => (
                <span key={m.label} className="flex items-center gap-1.5">
                  <Check size={12} className="text-success" /> {m.label}
                </span>
              ))}
          </div>
        )}
      </div>

      {/* Previsão de comportamento — não do mercado */}
      {forecast && (
        <div className="mt-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <Radar size={13} /> Como você tende a agir hoje
          </div>
          <p className="mt-3 max-w-2xl text-lg font-medium leading-relaxed">{forecast.rotulo}</p>
          {forecast.fatores.length > 0 && (
            <ul className="mt-3 space-y-1.5">
              {forecast.fatores.map((f) => (
                <li key={f.rotulo} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  <span>{f.rotulo}</span>
                  <span className="ml-auto shrink-0 font-mono text-[11px]">+{f.impacto}pts</span>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
            {forecast.base}
          </p>
        </div>
      )}

      {/* Copilot que pergunta */}
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <MessageCircle size={13} /> Copilot
        </div>
        <p className="mt-3 max-w-xl text-lg leading-relaxed">{perguntaCopilot}</p>
        <Link
          to="/copilot"
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          Responder ao copilot <ArrowRight size={14} />
        </Link>
      </div>

      {/* Ritual de fechamento */}
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <Moon size={13} /> Ritual de fechamento
        </div>
        <p className="mt-3 max-w-xl text-base leading-relaxed">
          {reflexaoQ.data
            ? "Seu dia já está fechado. Amanhã, o check abre e o ritual fecha de novo."
            : "Feche o dia com uma pergunta: o que você levou dele? O check abre, o ritual fecha."}
        </p>
        {!reflexaoQ.data && (
          <button
            onClick={() => setRitualAberto(true)}
            className="mt-4 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Fechar o dia (2 minutos)
          </button>
        )}
      </div>

      {/* Progressive disclosure */}
      <button
        onClick={() => setExpandido((v) => !v)}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-md py-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        {expandido ? "Esconder o resto" : "Ver o resto do sistema"}
        <ChevronDown size={14} className={cn("transition-transform", expandido && "rotate-180")} />
      </button>

      {expandido && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-5">
            <Step
              n={1}
              icon={BookOpen}
              label="Aprender"
              to="/trilha"
              desc={`${doneSlugs.size}/${trilha.length} lições`}
            />
            <Step
              n={2}
              icon={ScrollText}
              label="Definir"
              to="/regras"
              desc={`${rules.length} regras ativas`}
            />
            <Step
              n={3}
              icon={Calculator}
              label="Simular"
              to="/simulador"
              desc={`${sims.length} simulações`}
            />
            <Step
              n={4}
              icon={ClipboardList}
              label="Registrar"
              to="/diario"
              desc={`${diary.length} decisões`}
            />
            <Step
              n={5}
              icon={LineChart}
              label="Sua história"
              to="/historia"
              desc="marcos e evolução mês a mês"
            />
          </div>
        </div>
      )}

      <CheckCognitivoModal
        aberto={checkAberto}
        rules={rules.map((r) => ({ id: r.id, texto: r.texto }))}
        onClose={() => setCheckAberto(false)}
      />

      <FluxoOperarModal
        key={`${flowTela}-${flowAberto}`}
        aberto={flowAberto}
        rules={rules.map((r) => ({ id: r.id, texto: r.texto }))}
        telaInicial={flowTela}
        retomada={flowSalvo ?? undefined}
        onClose={() => setFlowAberto(false)}
      />

      <RitualModal
        aberto={ritualAberto}
        temDecisaoHoje={diarioHoje}
        checkHoje={painel.checkFeitoHoje}
        onClose={() => setRitualAberto(false)}
      />
    </AppShell>
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
  icon: LucideIcon;
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
