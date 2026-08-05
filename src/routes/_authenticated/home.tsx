import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { LESSONS } from "@/lib/lessons";
import { cn } from "@/lib/utils";
import { evolucaoInvestidor, linhaDoTempo } from "@/engines/timeline";
import type { DiaryEntry } from "@/engines/types";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  LineChart,
  MessageCircle,
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
  const [expandido, setExpandido] = useState(false);

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
    if (profileQ.data && !profileQ.data.onboarded) {
      navigate({ to: "/onboarding", replace: true });
    }
  }, [profileQ.data, navigate]);

  const progress = progressQ.data ?? [];
  const rules = rulesQ.data ?? [];
  const diary = (diaryQ.data ?? []) as unknown as DiaryEntry[];
  const sims = simsQ.data ?? [];

  const doneSlugs = new Set(progress.filter((p) => p.completed_at).map((p) => p.lesson_slug));
  const proximaLicao = LESSONS.find((l) => !doneSlugs.has(l.slug)) ?? LESSONS[LESSONS.length - 1];
  const primeiroNome = (profileQ.data?.nome ?? "").trim().split(" ")[0];

  const hoje = new Date();
  const inicioDoDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  const isHoje = (iso: string) => new Date(iso).getTime() >= inicioDoDia;
  const diasAtras = (n: number) => hoje.getTime() - n * 86400000;

  // ---- Disciplina e evolução -------------------------------------------
  const avaliadas = diary.filter((d) => d.seguiu_regra !== null);
  const pct = (arr: typeof avaliadas) =>
    arr.length ? Math.round((arr.filter((d) => d.seguiu_regra).length / arr.length) * 100) : null;

  const disciplina = pct(avaliadas);
  const janela30 = avaliadas.filter((d) => new Date(d.created_at).getTime() >= diasAtras(30));
  const janelaAnterior = avaliadas.filter((d) => {
    const t = new Date(d.created_at).getTime();
    return t < diasAtras(30) && t >= diasAtras(60);
  });
  const disc30 = pct(janela30);
  const discAntes = pct(janelaAnterior);
  const evoluiu = disc30 !== null && discAntes !== null;
  const delta = evoluiu ? disc30 - discAntes : null;

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

  // ---- Radar (progressivo) ----------------------------------------------
  const radar = [
    { ok: temRegras, label: "Plano escrito (3+ regras ativas)" },
    { ok: doneSlugs.size >= 3, label: "Base conceitual mínima (3 lições)" },
    { ok: sims.length > 0, label: "Payoff simulado" },
    { ok: diary.some((d) => d.status === "aberta") || diarioHoje, label: "Hipótese registrada" },
  ];
  const confianca = Math.round((radar.filter((r) => r.ok).length / radar.length) * 100);
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
      .map((s) => ({
        at: s.created_at,
        label: `Simulação: ${s.tipo_estrategia}${s.ativo ? ` · ${s.ativo}` : ""}`,
      })),
    ...diary
      .filter((d) => isHoje(d.created_at))
      .map((d) => ({
        at: d.created_at,
        label: `Decisão registrada: ${d.ativo} ${d.estrutura}${d.seguiu_regra === false ? " · regra furada" : d.seguiu_regra ? " · seguiu regra" : ""}`,
      })),
  ].sort((a, b) => a.at.localeCompare(b.at));

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
      {/* Voz do mentor */}
      <section className="pb-2 pt-2">
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

      {/* Evolução */}
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Sua disciplina
        </div>
        {disciplina === null ? (
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
            Ainda não dá para medir. No dia em que você registrar uma decisão e disser se seguiu a
            própria regra, este número começa a existir — e ele vale mais que qualquer XP.
          </p>
        ) : evoluiu ? (
          <>
            <div className="mt-4 flex items-end gap-4">
              <span className="font-mono text-3xl text-muted-foreground line-through decoration-1">
                {discAntes}%
              </span>
              <ArrowUpRight
                size={26}
                className={cn(
                  "mb-1",
                  (delta ?? 0) >= 0 ? "text-success" : "rotate-90 text-destructive",
                )}
              />
              <span
                className={cn(
                  "font-mono text-5xl font-bold",
                  (delta ?? 0) >= 0 ? "text-success" : "text-destructive",
                )}
              >
                {disc30}%
              </span>
            </div>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {(delta ?? 0) >= 0
                ? `Sua disciplina evoluiu ${delta} pontos nos últimos 30 dias. Isso é o que separa quem opera de quem investe.`
                : `Sua disciplina caiu ${Math.abs(delta ?? 0)} pontos nos últimos 30 dias. Vale revisar o que mudou no seu processo.`}
            </p>
          </>
        ) : (
          <>
            <div className="mt-4 font-mono text-5xl font-bold text-primary">
              {disc30 ?? disciplina}%
            </div>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted-foreground">
              {avaliadas.length} decisões avaliadas até aqui. Em 30 dias você vai ver esse número se
              mover — para cima ou para baixo — e é isso que importa.
            </p>
          </>
        )}
      </div>

      {/* Sua evolução — Decision Timeline */}
      <div className="mt-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <LineChart size={13} /> Seu investidor mudou
        </div>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-muted-foreground">
          {diary.length === 0
            ? "A primeira decisão registrada no diário abre esta linha do tempo. É aqui que você vai ver — daqui a meses — que o processo mudou, antes do resultado mudar."
            : diary.length < 4
              ? "Aos poucos: são necessárias pelo menos 4 decisões para comparar o seu antes com o seu agora."
              : "Comparando a primeira metade das suas decisões com a segunda:"}
        </p>

        {diary.length >= 4 && (
          <>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {evolucaoInvestidor(diary).map((h) => (
                <div key={h.chave} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {h.mudou ? (
                        <Check size={14} className="shrink-0 text-success" />
                      ) : (
                        <span className="grid size-3.5 shrink-0 place-items-center rounded-sm border border-muted-foreground/40 text-[9px] text-transparent">
                          ✓
                        </span>
                      )}
                      <span>{h.rotulo}</span>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {h.antes} →{" "}
                      <span
                        className={cn("font-bold", h.mudou ? "text-success" : "text-foreground")}
                      >
                        {h.agora}
                      </span>
                    </span>
                  </div>
                  <p className="mt-1.5 pl-[1.4rem] text-xs leading-relaxed text-muted-foreground">
                    {h.descricao}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <div className="mb-3 text-xs uppercase text-muted-foreground">Mês a mês</div>
              <div className="space-y-2">
                {linhaDoTempo(diary)
                  .slice(-6)
                  .map((m) => (
                    <div key={m.chave} className="flex items-center gap-3 text-sm">
                      <span className="w-20 shrink-0 text-muted-foreground">{m.rotulo}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        {m.disciplina !== null && (
                          <div
                            className={cn(
                              "h-full rounded-full",
                              m.disciplina >= 70
                                ? "bg-success"
                                : m.disciplina >= 40
                                  ? "bg-primary"
                                  : "bg-loss",
                            )}
                            style={{ width: `${m.disciplina}%` }}
                          />
                        )}
                      </div>
                      <span className="w-16 shrink-0 text-right font-mono text-xs">
                        {m.decisoes} decisão{m.decisoes === 1 ? "" : "es"}
                      </span>
                      <span
                        className={cn(
                          "w-24 shrink-0 text-right font-mono text-xs",
                          m.resultado > 0
                            ? "text-success"
                            : m.resultado < 0
                              ? "text-loss"
                              : "text-muted-foreground",
                        )}
                      >
                        {m.resultado !== 0 ? `R$ ${m.resultado.toFixed(0)}` : "—"}
                      </span>
                    </div>
                  ))}
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Barra = % das decisões do mês que respeitaram suas próprias regras. Resultado é
                consequência.
              </p>
            </div>
          </>
        )}
      </div>

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
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Radar size={13} /> Radar da decisão
            </div>
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="shrink-0">
                <div className={cn("font-mono text-5xl font-bold", prontidaoCor)}>{confianca}%</div>
                <div className="mt-1 max-w-[14rem] text-xs text-muted-foreground">
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
                        r.ok
                          ? "border-success bg-success text-success-foreground"
                          : "border-border text-transparent",
                      )}
                    >
                      ✓
                    </span>
                    <span className={r.ok ? "text-foreground" : "text-muted-foreground"}>
                      {r.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              O radar mede o seu processo, não o mercado. Nada aqui é recomendação de investimento.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <Activity size={13} /> Linha do tempo de hoje
            </div>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nada registrado hoje ainda. Cada lição, simulação e decisão aparece aqui em ordem.
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

          <div className="grid gap-3 md:grid-cols-5">
            <Step
              n={1}
              icon={BookOpen}
              label="Aprender"
              to="/trilha"
              desc={`${doneSlugs.size}/${LESSONS.length} lições`}
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
              label="Revisar"
              to="/revisao"
              desc={disciplina === null ? "sem dados" : `${disciplina}% disciplina`}
            />
          </div>
        </div>
      )}
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
