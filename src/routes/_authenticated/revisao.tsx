import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { gerarReview, analiseDisciplina, type Periodo } from "@/engines/review-engine";
import { detectarPadroesTemporais } from "@/engines/behavior-engine";
import { compararEvolucao } from "@/engines/decision-diff";
import { construirGrafo } from "@/engines/knowledge-graph";
import { calcularEvolutionScore } from "@/engines/evolution-score";
import { cn } from "@/lib/utils";
import type { DiaryEntry } from "@/engines/types";
import { ArrowDownRight, ArrowUpRight, Gauge, GitCompare, Minus, Network } from "lucide-react";

export const Route = createFileRoute("/_authenticated/revisao")({
  head: () => ({
    meta: [
      { title: "Revisão cognitiva · Zero ao Trade" },
      {
        name: "description",
        content:
          "Revisão semanal e mensal das suas decisões: disciplina, Decision Score, padrões de comportamento e o foco do próximo período.",
      },
      { property: "og:title", content: "Revisão cognitiva · Zero ao Trade" },
      {
        property: "og:description",
        content: "Transforme seu histórico de decisões em aprendizado: evolução, padrões e foco.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Revisao,
});

function Revisao() {
  const [periodo, setPeriodo] = useState<Periodo>("semana");
  const qc = useQueryClient();

  const q = useQuery({
    queryKey: ["diary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("diary_entries")
        .select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as unknown as DiaryEntry[];
    },
  });

  const entries = useMemo(() => q.data ?? [], [q.data]);
  const review = useMemo(() => gerarReview(entries, periodo), [entries, periodo]);
  const disciplinaTotal = useMemo(() => analiseDisciplina(entries), [entries]);
  const padroesTemporais = useMemo(() => detectarPadroesTemporais(entries), [entries]);
  const diff = useMemo(() => compararEvolucao(entries), [entries]);
  const evolucao = useMemo(() => calcularEvolutionScore(entries), [entries]);

  const rules = useQuery({
    queryKey: ["rules"],
    queryFn: async () => (await supabase.from("personal_rules").select("id, texto")).data ?? [],
  });
  const grafo = useMemo(
    () => construirGrafo(entries, (rules.data ?? []) as { id: string; texto: string }[]),
    [entries, rules.data],
  );

  const salvas = useQuery({
    queryKey: ["reviews", periodo],
    queryFn: async () => {
      const tabela = periodo === "semana" ? "weekly_reviews" : "monthly_reviews";
      const { data } = await supabase
        .from(tabela)
        .select("*")
        .order("period_start", { ascending: false })
        .limit(6);
      return data ?? [];
    },
  });

  const salvar = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("sem sessão");
      const tabela = periodo === "semana" ? "weekly_reviews" : "monthly_reviews";
      const { error } = await supabase.from(tabela).insert({
        user_id: u.user.id,
        period_start: review.inicio,
        resumo: `${review.narrativa}\n\n${review.foco}`,
        metricas: {
          ...review.metricas,
          deltas: review.deltas,
          licoes: review.licoes,
          padroes: review.padroes,
        } as never,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Revisão arquivada no seu histórico.");
      qc.invalidateQueries({ queryKey: ["reviews", periodo] });
    },
    onError: () => toast.error("Não consegui salvar esta revisão."),
  });

  const encerradas = entries.filter((e) => e.status === "encerrada" && e.resultado !== null);
  const porEstrategia = Object.entries(
    encerradas.reduce<Record<string, { total: number; ganhos: number; count: number }>>(
      (acc, e) => {
        const k = e.estrutura || "outra";
        acc[k] ??= { total: 0, ganhos: 0, count: 0 };
        acc[k].total += Number(e.resultado || 0);
        acc[k].count++;
        if (Number(e.resultado || 0) > 0) acc[k].ganhos++;
        return acc;
      },
      {},
    ),
  ).map(([nome, v]) => ({ nome, resultado: +v.total.toFixed(2) }));

  return (
    <AppShell title="Revisão do meu processo">
      <div className="mb-5 flex items-center gap-2">
        {(["semana", "mes"] as Periodo[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriodo(p)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              periodo === p
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {p === "semana" ? "Esta semana" : "Este mês"}
          </button>
        ))}
        <span className="ml-auto font-mono text-[11px] text-muted-foreground">
          {review.inicio} → {review.fim}
        </span>
      </div>

      {/* Narrativa do período */}
      <section className="mb-6 rounded-lg border border-primary/40 bg-primary/5 p-5">
        <div className="text-xs uppercase tracking-wide text-primary">Leitura do período</div>
        <p className="mt-2 text-sm leading-relaxed">{review.narrativa}</p>
        <p className="mt-3 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium">
          {review.foco}
        </p>
        <Button
          size="sm"
          className="mt-4"
          onClick={() => salvar.mutate()}
          disabled={salvar.isPending}
        >
          {salvar.isPending ? "Arquivando…" : "Arquivar esta revisão"}
        </Button>
      </section>

      {/* Evolution Score */}
      <section className="mb-6 rounded-lg border border-primary/30 bg-card p-5">
        <div className="mb-3 flex items-center gap-2 text-xs uppercase text-muted-foreground">
          <Gauge size={13} /> Sua evolução
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-center">
            <div
              className={cn(
                "font-mono text-5xl font-bold",
                evolucao.atual === null
                  ? "text-muted-foreground"
                  : evolucao.atual >= 60
                    ? "text-success"
                    : evolucao.atual >= 40
                      ? "text-primary"
                      : "text-loss",
              )}
            >
              {evolucao.atual ?? "—"}
            </div>
            <div className="text-[11px] text-muted-foreground">/100 · sua evolução</div>
          </div>
          <div className="grid flex-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {evolucao.componentes.map((c) => (
              <div key={c.chave} title={c.descricao}>
                <div className="flex justify-between text-xs">
                  <span>{c.rotulo}</span>
                  <span className="font-mono text-muted-foreground">
                    {c.pct !== null ? `${c.pct.toFixed(0)}%` : "sem dados"}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${c.pct ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{evolucao.leitura}</p>
        {evolucao.serie.length >= 2 && (
          <div className="mt-4 h-40">
            <ResponsiveContainer>
              <LineChart data={evolucao.serie}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="rotulo" tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  name="Sua evolução"
                  stroke="oklch(0.78 0.17 65)"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Evolução contra o período anterior */}
      <section className="mb-6">
        <div className="mb-2 text-xs uppercase text-muted-foreground">
          Evolução vs. período anterior
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {review.deltas.map((d) => {
            const up = d.diff > 0.5;
            const down = d.diff < -0.5;
            return (
              <div key={d.label} className="rounded-lg border border-border bg-card p-4">
                <div className="text-xs text-muted-foreground">{d.label}</div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-bold">
                    {d.unidade === "%" || d.unidade === "pt" ? d.atual.toFixed(0) : d.atual}
                    <span className="text-sm text-muted-foreground">
                      {d.unidade === "%" ? "%" : ""}
                    </span>
                  </span>
                  <span
                    className={`font-mono text-xs ${up ? "text-success" : down ? "text-loss" : "text-muted-foreground"}`}
                  >
                    {d.diff > 0 ? "+" : ""}
                    {d.unidade === "" ? d.diff : d.diff.toFixed(0)}
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  antes: {d.unidade === "" ? d.anterior : d.anterior.toFixed(0)}
                  {d.unidade === "%" ? "%" : ""}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Padrões de comportamento */}
      <section className="mb-6">
        <div className="mb-2 text-xs uppercase text-muted-foreground">
          Padrões que o sistema enxergou
        </div>
        {review.padroes.length === 0 && padroesTemporais.length === 0 ? (
          <p className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Ainda não há registros suficientes para afirmar um padrão. A partir de ~3 decisões
            encerradas eu começo a comparar seus comportamentos.
          </p>
        ) : (
          <div className="space-y-3">
            {[...review.padroes, ...padroesTemporais].map((p) => (
              <div
                key={p.key}
                className={`rounded-lg border p-4 ${
                  p.severidade === "alerta" ? "border-loss/40 bg-loss/5" : "border-border bg-card"
                }`}
              >
                <div className="text-sm font-semibold">{p.titulo}</div>
                <p className="mt-1 text-sm text-muted-foreground">{p.descricao}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Disciplina vs. resultado — todo o histórico */}
      <section className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="mb-3 text-xs uppercase text-muted-foreground">
          Disciplina vs. resultado (todo o histórico)
        </div>
        {disciplinaTotal.comRegra === 0 ? (
          <p className="text-sm text-muted-foreground">
            Quando você registrar no diário se seguiu ou furou a própria regra, este painel começa a
            contar a história real: não a do mercado, a da sua disciplina.
          </p>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground">Decisões avaliadas</div>
                <div className="mt-1 font-mono text-2xl font-bold">{disciplinaTotal.comRegra}</div>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground">Regras respeitadas</div>
                <div className="mt-1 font-mono text-2xl font-bold text-success">
                  {disciplinaTotal.pctSeguiu.toFixed(0)}%
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {disciplinaTotal.seguiu} de {disciplinaTotal.comRegra}
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground">Você ignorou suas regras</div>
                <div className="mt-1 font-mono text-2xl font-bold text-loss">
                  {disciplinaTotal.furou} vezes
                </div>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <div className="text-xs text-muted-foreground">Resultado ao seguir</div>
                <div className="mt-1 font-mono text-xl font-bold">
                  {disciplinaTotal.mediaSeguiu !== null ? (
                    <span
                      className={disciplinaTotal.mediaSeguiu >= 0 ? "text-success" : "text-loss"}
                    >
                      R$ {disciplinaTotal.mediaSeguiu.toFixed(2)}
                    </span>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  vs. furar:{" "}
                  {disciplinaTotal.mediaFurou !== null ? (
                    <span
                      className={disciplinaTotal.mediaFurou >= 0 ? "text-success" : "text-loss"}
                    >
                      R$ {disciplinaTotal.mediaFurou.toFixed(2)}
                    </span>
                  ) : (
                    "—"
                  )}{" "}
                  por operação
                </div>
              </div>
            </div>
            {disciplinaTotal.insight && (
              <p className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed">
                {disciplinaTotal.insight}
              </p>
            )}
          </>
        )}
      </section>

      {/* Decision Diff — quem você era vs. quem você é */}
      <section className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase text-muted-foreground">
          <GitCompare size={13} /> Quem você era → quem você é
        </div>
        <p className="mb-3 text-[11px] text-muted-foreground">
          Comparação por maturidade, não por lucro: primeira metade das suas decisões contra a
          segunda.
        </p>
        {diff === null ? (
          <p className="text-sm text-muted-foreground">
            São necessárias pelo menos 4 decisões para comparar o seu antes com o seu agora.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {diff.map((e) => {
              const icon =
                e.direcao === "melhorou" ? (
                  <ArrowUpRight size={14} className="text-success" />
                ) : e.direcao === "piorou" ? (
                  <ArrowDownRight size={14} className="text-loss" />
                ) : (
                  <Minus size={14} className="text-muted-foreground" />
                );
              return (
                <div key={e.chave} className="rounded-lg border border-border bg-background p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      {icon} {e.rotulo}
                    </div>
                  </div>
                  <div className="mt-2 flex items-baseline gap-2 font-mono text-sm">
                    <span className="text-muted-foreground line-through decoration-1">
                      {e.antes}
                    </span>
                    <span
                      className={cn(
                        "font-bold",
                        e.direcao === "melhorou"
                          ? "text-success"
                          : e.direcao === "piorou"
                            ? "text-loss"
                            : "text-foreground",
                      )}
                    >
                      {e.agora}
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {e.detalhe}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Personal Knowledge Graph */}
      <section className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase text-muted-foreground">
          <Network size={13} /> Mapa dos seus padrões
        </div>
        <p className="mb-3 text-[11px] text-muted-foreground">
          Conceitos, estruturas, emoções e regras conectados pela frequência com que aparecem nas
          suas decisões.
        </p>
        {grafo === null ? (
          <p className="text-sm text-muted-foreground">
            Registre decisões no diário para o grafo começar a conectar o que você faz com o que
            você sente.
          </p>
        ) : (
          <>
            {grafo.caminho.length >= 2 && (
              <div className="mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div className="text-xs uppercase tracking-wide text-primary">
                  O caminho que mais se repete
                </div>
                <ol className="mt-3 space-y-1.5">
                  {grafo.caminho.map((n, i) => (
                    <li key={n.id} className="flex items-center gap-3">
                      <span className="rounded-md border border-border bg-background px-2.5 py-1 text-sm">
                        {n.rotulo}
                      </span>
                      {i < grafo.caminho.length - 1 && (
                        <span className="text-[10px] uppercase text-muted-foreground">
                          ↓ relaciona-se com
                        </span>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}
            <div className="mb-2 text-xs uppercase text-muted-foreground">Conexões mais fortes</div>
            {grafo.ligacoes.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Ainda sem conexões — elas surgem quando emoções, regras e estruturas aparecem juntas
                numa mesma decisão.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {grafo.ligacoes.slice(0, 8).map((l) => (
                  <li key={`${l.de}-${l.para}`} className="flex items-center gap-2 text-xs">
                    <span className="truncate">{grafo.nos.find((n) => n.id === l.de)?.rotulo}</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="truncate">
                      {grafo.nos.find((n) => n.id === l.para)?.rotulo}
                    </span>
                    <span className="ml-auto shrink-0 font-mono text-muted-foreground">
                      ×{l.peso}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              {grafo.explicacao}
            </p>
          </>
        )}
      </section>

      {/* Lições do período */}
      {review.licoes.length > 0 && (
        <section className="mb-6 rounded-lg border border-border bg-card p-5">
          <div className="text-xs uppercase text-muted-foreground">
            O que este período te ensinou
          </div>
          <ul className="mt-3 space-y-2">
            {review.licoes.map((l) => (
              <li key={l} className="flex gap-2 text-sm leading-snug">
                <span className="text-primary">→</span>
                <span>{l}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Resultado por estrutura (histórico completo) */}
      <section className="mb-6 rounded-lg border border-border bg-card p-5">
        <div className="mb-3 text-xs uppercase text-muted-foreground">
          Resultado por estrutura (todo o histórico)
        </div>
        {porEstrategia.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Encerre operações no diário com resultado pra ver o painel.
          </p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={porEstrategia}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
                <Tooltip
                  contentStyle={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="resultado">
                  {porEstrategia.map((d, i) => (
                    <Cell
                      key={i}
                      fill={d.resultado >= 0 ? "oklch(0.72 0.18 155)" : "oklch(0.63 0.24 27)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Revisões arquivadas */}
      {(salvas.data?.length ?? 0) > 0 && (
        <section className="rounded-lg border border-border bg-card p-5">
          <div className="mb-3 text-xs uppercase text-muted-foreground">Revisões arquivadas</div>
          <ul className="space-y-3">
            {(salvas.data ?? []).map(
              (r: { id: string; period_start: string | null; resumo: string | null }) => (
                <li key={r.id} className="border-l-2 border-border pl-3">
                  <div className="font-mono text-[11px] text-muted-foreground">
                    {r.period_start}
                  </div>
                  <p className="whitespace-pre-line text-sm leading-snug text-muted-foreground">
                    {r.resumo}
                  </p>
                </li>
              ),
            )}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
