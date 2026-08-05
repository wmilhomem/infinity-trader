import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/AppShell";
import { lerReplay, type ReplayView } from "@/engines/replay";
import { NarrativaEstrutura } from "@/components/simulador/NarrativaEstrutura";
import { cn } from "@/lib/utils";
import type { Json } from "@/integrations/supabase/types";
import {
  ArrowLeft,
  Brain,
  CalendarClock,
  Check,
  ListChecks,
  Radar,
  Scale,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/_authenticated/replay/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Replay · Zero ao Trade` },
      { name: "description", content: "Replay completo de uma decisão registrada." },
      { property: "og:title", content: "Decision Replay · Zero ao Trade" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: ReplayPage,
});

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const FASES: Record<string, string> = {
  abertura: "abertura do pregão",
  miolo: "miolo do pregão",
  fechamento: "fechamento do pregão",
  fechado: "fora do horário da B3",
};

function Cartao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">{titulo}</div>
      {children}
    </div>
  );
}

function ReplayPage() {
  const { id } = Route.useParams();

  const q = useQuery({
    queryKey: ["replay", id],
    queryFn: async () => {
      const { data: entry } = await supabase
        .from("diary_entries")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      const { data: memoria } = await supabase
        .from("decision_memory")
        .select("contexto")
        .eq("diary_entry_id", id)
        .maybeSingle();
      return { entry, memoria: (memoria?.contexto ?? null) as Json | null };
    },
  });

  const replay = useMemo<ReplayView | null>(
    () => (q.data?.entry ? lerReplay(q.data.entry, q.data.memoria) : null),
    [q.data],
  );

  if (q.isLoading) {
    return (
      <AppShell title="Replay">
        <p className="text-sm text-muted-foreground">Reconstruindo o instante da decisão…</p>
      </AppShell>
    );
  }

  if (!replay) {
    return (
      <AppShell title="Replay">
        <p className="text-sm text-muted-foreground">
          Não encontrei o snapshot desta decisão.{" "}
          <Link to="/replay" className="text-primary hover:underline">
            Voltar ao histórico de replays
          </Link>
          .
        </p>
      </AppShell>
    );
  }

  const dataPt = new Date(replay.data).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <AppShell title="Replay da decisão">
      <Link
        to="/replay"
        className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={13} /> Todos os replays
      </Link>

      <div className="rounded-xl border border-primary/30 bg-card p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <div className="font-mono text-xl font-bold">
              {replay.ativo} · {replay.estrutura}
            </div>
            {replay.nome && replay.nome !== replay.estrutura && (
              <div className="mt-0.5 text-sm text-muted-foreground">{replay.nome}</div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 font-mono text-xs font-bold",
                replay.resultado === null
                  ? "bg-muted text-muted-foreground"
                  : replay.resultado >= 0
                    ? "bg-success/15 text-success"
                    : "bg-loss/15 text-loss",
              )}
            >
              {replay.resultado === null
                ? (replay.status ?? "aberta")
                : `R$ ${replay.resultado.toFixed(2)}`}
            </span>
            {replay.score !== null && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-1 font-mono text-xs font-bold",
                  replay.score >= 65
                    ? "bg-success/15 text-success"
                    : replay.score >= 40
                      ? "bg-primary/20 text-primary"
                      : "bg-loss/15 text-loss",
                )}
              >
                Score {replay.score}
              </span>
            )}
          </div>
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarClock size={12} /> {dataPt}
          </span>
          {replay.capturedWeekday !== null && (
            <span>
              {DIAS[replay.capturedWeekday]}, na {FASES[replay.sessionPhase ?? ""] ?? "sessão"}
            </span>
          )}
          {replay.ivAtm !== null && (
            <span className="font-mono">IV ATM {replay.ivAtm.toFixed(1)}%</span>
          )}
          {replay.ivRank !== null && (
            <span className="font-mono">IV no percentil {replay.ivRank}%</span>
          )}
        </div>
        {replay.tese && (
          <p className="mt-4 rounded-md border border-border bg-background p-3 text-sm italic leading-relaxed text-muted-foreground">
            “{replay.tese}”
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          {replay.curva && (
            <Cartao titulo="Payoff — como estava naquele dia">
              <div className="h-64">
                <ResponsiveContainer>
                  <AreaChart data={replay.curva}>
                    <defs>
                      <linearGradient id="replayGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.78 0.17 65)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="oklch(0.78 0.17 65)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="preco"
                      tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }}
                      tickFormatter={(v: number) => v.toFixed(2)}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "rgba(255,255,255,0.55)" }} />
                    <Tooltip
                      contentStyle={{
                        background: "#1e293b",
                        border: "1px solid #334155",
                        fontSize: 12,
                      }}
                      formatter={(v) => [`R$ ${Number(v).toFixed(2)}`, "Resultado"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="resultado"
                      stroke="oklch(0.78 0.17 65)"
                      strokeWidth={2}
                      fill="url(#replayGrad)"
                    />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
                    {replay.precoReferencia && (
                      <ReferenceLine
                        x={replay.precoReferencia}
                        stroke="rgba(255,255,255,0.4)"
                        strokeDasharray="4 4"
                        label={{
                          value: "spot",
                          fontSize: 10,
                          fill: "rgba(255,255,255,0.5)",
                          position: "top",
                        }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {replay.interpretacao && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {replay.interpretacao.resumo}
                </p>
              )}
            </Cartao>
          )}

          {replay.narrativa && <NarrativaEstrutura passos={[replay.narrativa]} />}

          {replay.alertas.length > 0 && (
            <Cartao titulo="Regras que esta decisão contrariava">
              <ul className="space-y-2">
                {replay.alertas.map((a, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-md border border-loss/40 bg-loss/10 p-3 text-xs"
                  >
                    <TriangleAlert size={14} className="mt-0.5 shrink-0 text-loss" />
                    <div>
                      <div className="font-semibold text-loss">
                        {a.regra} · {a.severidade}
                      </div>
                      <div className="mt-0.5 text-muted-foreground">{a.motivo}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </Cartao>
          )}
        </div>

        <div className="space-y-4">
          {replay.score !== null && (
            <Cartao titulo="Decision Score — processo">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold">{replay.score}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
              {replay.scoreLeitura && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {replay.scoreLeitura}
                </p>
              )}
              {replay.scoreItens && (
                <ul className="mt-3 space-y-2">
                  {replay.scoreItens.map((i) => (
                    <li key={i.chave}>
                      <div className="flex justify-between text-xs">
                        <span>{i.rotulo}</span>
                        <span className="font-mono text-muted-foreground">
                          {i.pts}/{i.max}
                        </span>
                      </div>
                      <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{ width: `${(i.pts / Math.max(1, i.max)) * 100}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Cartao>
          )}

          <Cartao titulo="Quem decidiu naquele dia">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Brain size={14} /> Estado
                </span>
                <span>{replay.emocao ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Scale size={14} /> Disciplina histórica
                </span>
                <span className="font-mono">
                  {replay.disciplinaHistorica !== null
                    ? `${replay.disciplinaHistorica.toFixed(0)}%`
                    : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Radar size={14} /> Regra aplicada
                </span>
                <span className="text-right text-xs">
                  {replay.seguiuRegra === null ? "—" : replay.seguiuRegra ? "✓ Seguiu" : "✗ Furou"}
                </span>
              </div>
            </div>
            {replay.padroes.length > 0 && (
              <div className="mt-3 border-t border-border pt-3">
                <div className="mb-1.5 text-[11px] uppercase text-muted-foreground">
                  Padrões ativos na época
                </div>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {replay.padroes.map((p) => (
                    <li key={p}>• {p}</li>
                  ))}
                </ul>
              </div>
            )}
          </Cartao>

          {replay.checklist && (
            <Cartao titulo="Checklist de decisão">
              <div className="mb-2 text-xs text-muted-foreground">
                {replay.checklist.marcados} de {replay.checklist.total} itens marcados
              </div>
              <ul className="space-y-1.5">
                {replay.checklist.itens.map((i) => (
                  <li key={i.chave} className="flex items-start gap-2 text-xs leading-snug">
                    {i.ok ? (
                      <Check size={13} className="mt-0.5 shrink-0 text-success" />
                    ) : (
                      <X size={13} className="mt-0.5 shrink-0 text-loss" />
                    )}
                    <span className={i.ok ? "" : "text-muted-foreground"}>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {i.chave}:
                      </span>{" "}
                      {i.ok ? "ok" : "em aberto"}
                    </span>
                  </li>
                ))}
              </ul>
            </Cartao>
          )}

          <Cartao titulo="O que o mercado dizia">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">IV ATM</div>
                <div className="font-mono">
                  {replay.ivAtm !== null ? `${replay.ivAtm.toFixed(1)}%` : "não registrado"}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">IV rank</div>
                <div className="font-mono">
                  {replay.ivRank !== null ? `percentil ${replay.ivRank}%` : "não registrado"}
                </div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Liquidez</div>
                <div>{replay.liquidityScore ?? "não registrado"}</div>
              </div>
              <div>
                <div className="text-[11px] uppercase text-muted-foreground">Eventos</div>
                <div>
                  {replay.eventsImminent === null
                    ? "não registrado"
                    : replay.eventsImminent
                      ? "próximos"
                      : "sem eventos"}
                </div>
              </div>
            </div>
            {replay.ivAtm === null && (
              <p className="mt-3 text-[11px] text-muted-foreground">
                Decisões antigas foram gravadas antes da captura de IV existir. Replays futuros
                trazem o mercado completo do dia.
              </p>
            )}
          </Cartao>
        </div>
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <ListChecks size={13} />
        Foi você — naquele dia. O replay não julga: ele devolve o instante para que a revisão seja
        possível.
      </p>
    </AppShell>
  );
}
