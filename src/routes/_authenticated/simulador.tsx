import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import {
  AlertTriangle,
  BookOpen,
  MessageCircle,
  Plus,
  Trash2,
} from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import type { Perna } from "@/lib/payoff";
import { payoffCurve, summary } from "@/lib/payoff";
import { interpretar } from "@/engines/simulation-interpreter";
import { explicarRiscos } from "@/engines/risk-explainer";
import { validarRegras, regrasQuePedemConfirmacao, type Regra } from "@/engines/rule-engine";
import { calcularDecisionScore, disciplina } from "@/engines/decision-engine";
import type { DiaryEntry } from "@/engines/types";

export const Route = createFileRoute("/_authenticated/simulador")({
  head: () => ({
    meta: [
      { title: "Simulador de decisão · Zero ao Trade" },
      {
        name: "description",
        content:
          "Simule travas e opções da B3, entenda o risco em reais e valide a operação contra as suas próprias regras antes de decidir.",
      },
      { property: "og:title", content: "Simulador de decisão · Zero ao Trade" },
      {
        property: "og:description",
        content: "Payoff, risco explicado e checagem de regras antes de você clicar em comprar.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Simulador,
});

const PRESETS: Record<string, { ativo: string; centro: number; pernas: Perna[] }> = {
  "trava-alta": {
    ativo: "PETR4",
    centro: 38,
    pernas: [
      { tipo: "call", acao: "compra", strike: 38, premio: 1.5, quantidade: 100 },
      { tipo: "call", acao: "venda", strike: 40, premio: 0.6, quantidade: 100 },
    ],
  },
  "call-sozinha": {
    ativo: "PETR4",
    centro: 38,
    pernas: [{ tipo: "call", acao: "compra", strike: 38, premio: 1.5, quantidade: 100 }],
  },
  "trava-baixa": {
    ativo: "PETR4",
    centro: 38,
    pernas: [
      { tipo: "put", acao: "compra", strike: 38, premio: 1.3, quantidade: 100 },
      { tipo: "put", acao: "venda", strike: 36, premio: 0.5, quantidade: 100 },
    ],
  },
  "iron-condor": {
    ativo: "PETR4",
    centro: 38,
    pernas: [
      { tipo: "put", acao: "compra", strike: 34, premio: 0.2, quantidade: 100 },
      { tipo: "put", acao: "venda", strike: 36, premio: 0.5, quantidade: 100 },
      { tipo: "call", acao: "venda", strike: 40, premio: 0.6, quantidade: 100 },
      { tipo: "call", acao: "compra", strike: 42, premio: 0.2, quantidade: 100 },
    ],
  },
};

const CHECKLIST = [
  { k: "perda", label: "Sei exatamente quanto posso perder nesta operação" },
  { k: "tese", label: "Tenho uma tese escrita, não um palpite" },
  { k: "saida", label: "Sei em que ponto eu saio se der errado" },
  { k: "tamanho", label: "O tamanho da posição cabe no meu capital" },
  { k: "regra", label: "Minha regra permite esta operação" },
];

function Simulador() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [preset, setPreset] = useState<keyof typeof PRESETS>("trava-alta");
  const [ativo, setAtivo] = useState("PETR4");
  const [centro, setCentro] = useState(38);
  const [pernas, setPernas] = useState<Perna[]>(PRESETS["trava-alta"].pernas);
  const [tese, setTese] = useState("");
  const [explicar, setExplicar] = useState(false);
  const [check, setCheck] = useState<Record<string, boolean>>({});
  const [confirmacoes, setConfirmacoes] = useState<Record<string, boolean>>({});

  function loadPreset(k: keyof typeof PRESETS) {
    setPreset(k);
    setAtivo(PRESETS[k].ativo);
    setCentro(PRESETS[k].centro);
    setPernas(PRESETS[k].pernas.map((p) => ({ ...p })));
  }

  function updatePerna(i: number, patch: Partial<Perna>) {
    setPernas(pernas.map((p, j) => (i === j ? { ...p, ...patch } : p)));
  }

  const curve = useMemo(() => payoffCurve(pernas, centro, 0.3, 61), [pernas, centro]);
  const stats = useMemo(() => summary(pernas, centro), [pernas, centro]);
  const leitura = useMemo(() => interpretar(pernas, centro, ativo), [pernas, centro, ativo]);
  const riscos = useMemo(
    () => explicarRiscos(pernas, centro, ativo, leitura),
    [pernas, centro, ativo, leitura],
  );

  const regras = useQuery({
    queryKey: ["rules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("personal_rules")
        .select("id, texto, nome, categoria, ativa, tipo, parametros_json");
      return (data as unknown as Regra[]) ?? [];
    },
  });

  const historico = useQuery({
    queryKey: ["diary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("diary_entries")
        .select("*")
        .order("created_at", { ascending: false });
      return (data as unknown as DiaryEntry[]) ?? [];
    },
  });

  const pedemConfirmacao = useMemo(
    () => regrasQuePedemConfirmacao(regras.data ?? []),
    [regras.data],
  );

  const alertas = useMemo(
    () => validarRegras(pernas, regras.data ?? [], leitura, { confirmacoes }),
    [pernas, regras.data, leitura, confirmacoes],
  );

  const disciplinaHistorica = useMemo(() => disciplina(historico.data ?? []), [historico.data]);

  const score = useMemo(
    () =>
      calcularDecisionScore({
        simulou: true,
        tese,
        checklist: Object.fromEntries(CHECKLIST.map((c) => [c.k, !!check[c.k]])),
        alertas,
        interpretacao: leitura,
        disciplinaHistorica,
      }),
    [tese, check, alertas, leitura, disciplinaHistorica],
  );

  const checkOk = CHECKLIST.every((c) => check[c.k]);

  async function perguntarCopilot() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({
        user_id: u.user.id,
        context_type: "simulacao",
        titulo: `${leitura.nome} · ${ativo}`,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["threads"] });
    navigate({ to: "/copilot/$threadId", params: { threadId: data.id } });
  }

  async function salvar() {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { data, error } = await supabase
      .from("simulations")
      .insert({
        user_id: u.user.id,
        tipo_estrategia: leitura.nome,
        ativo,
        preco_atual: centro,
        pernas: pernas as any,
      })
      .select()
      .single();
    if (error) return toast.error(error.message);

    await supabase.from("checklists").insert({
      user_id: u.user.id,
      simulation_id: data.id,
      respostas: Object.fromEntries(CHECKLIST.map((c) => [c.k, !!check[c.k]])) as any,
      completo: checkOk,
    });
    await supabase.from("timeline_events").insert({
      user_id: u.user.id,
      tipo: "simulacao",
      titulo: `Simulou ${leitura.nome} em ${ativo}`,
      descricao: leitura.resumo,
      meta: { simulation_id: data.id, score: score.score, risco: leitura.risco } as any,
    });

    try {
      sessionStorage.setItem(
        `sim-tese:${data.id}`,
        JSON.stringify({ tese, checklist: Object.fromEntries(CHECKLIST.map((c) => [c.k, !!check[c.k]])) }),
      );
    } catch {
      /* sessionStorage indisponível — o diário pede a tese novamente */
    }

    toast.success("Simulação registrada — feche a decisão no diário.");
    qc.invalidateQueries();
    navigate({ to: "/diario", search: { sim: data.id } as any });
  }

  return (
    <AppShell title="Simulador de decisão">
      <div className="flex flex-wrap gap-2 mb-4">
        {(Object.keys(PRESETS) as (keyof typeof PRESETS)[]).map((k) => (
          <button
            key={k}
            onClick={() => loadPreset(k)}
            className={`rounded-full border px-3 py-1 text-xs ${preset === k ? "border-primary bg-primary/20 text-primary" : "border-border hover:bg-accent"}`}
          >
            {k.replaceAll("-", " ")}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <label className="text-xs text-muted-foreground">
              Ativo
              <input
                value={ativo}
                onChange={(e) => setAtivo(e.target.value.toUpperCase())}
                className="ml-2 w-24 rounded-md border border-border bg-input px-2 py-1 text-sm font-mono"
              />
            </label>
            <label className="text-xs text-muted-foreground">
              Preço atual
              <input
                type="number"
                step="0.1"
                value={centro}
                onChange={(e) => setCentro(+e.target.value || 0)}
                className="ml-2 w-24 rounded-md border border-border bg-input px-2 py-1 text-sm font-mono"
              />
            </label>
          </div>

          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={curve}>
                <defs>
                  <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0.6} />
                    <stop offset="50%" stopColor="oklch(0.72 0.18 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="preco" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
                <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.6)" }} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155", fontSize: 12 }}
                  formatter={(v: number) => [`R$ ${v.toFixed(2)}`, "Resultado"]}
                  labelFormatter={(l) => `Preço: R$ ${l}`}
                />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
                <ReferenceLine
                  x={centro}
                  stroke="oklch(0.78 0.17 65)"
                  strokeDasharray="4 4"
                  label={{ value: "atual", position: "top", fill: "oklch(0.78 0.17 65)", fontSize: 10 }}
                />
                {stats.breakevens.map((b) => (
                  <ReferenceLine
                    key={b}
                    x={b}
                    stroke="rgba(255,255,255,0.35)"
                    strokeDasharray="2 2"
                    label={{ value: `BE ${b}`, position: "insideTopRight", fontSize: 10, fill: "rgba(255,255,255,0.6)" }}
                  />
                ))}
                <Area type="monotone" dataKey="resultado" stroke="oklch(0.72 0.18 155)" fill="url(#pg)" baseValue={0} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">Lucro máximo</div>
              <div className="mt-1 font-mono font-bold text-success">
                {leitura.lucroLimitado ? `R$ ${stats.lucroMax.toFixed(2)}` : "ilimitado"}
              </div>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">Capital em risco</div>
              <div className="mt-1 font-mono font-bold text-loss">
                {leitura.perdaLimitada ? `R$ ${leitura.capitalEmRisco.toFixed(2)}` : "sem teto"}
              </div>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <div className="text-xs text-muted-foreground">Capital comprometido</div>
              <div className="mt-1 font-mono font-bold">R$ {leitura.capitalComprometido.toFixed(2)}</div>
            </div>
          </div>

          {/* Leitura da estratégia */}
          <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-primary">
                Leitura da estratégia
              </div>
              <div className="flex gap-2">
                <span className="rounded-full bg-accent px-2 py-0.5 text-xs text-muted-foreground">
                  {leitura.complexidade}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    leitura.risco === "baixo"
                      ? "bg-success/15 text-success"
                      : leitura.risco === "medio"
                        ? "bg-primary/20 text-primary"
                        : "bg-loss/15 text-loss"
                  }`}
                >
                  Risco {leitura.risco === "medio" ? "médio" : leitura.risco}
                </span>
              </div>
            </div>

            <div className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <Campo label="Estratégia detectada" valor={leitura.nome} />
              <Campo label="Perfil" valor={leitura.perfil} />
              <Campo label="Objetivo" valor={leitura.objetivoLabel} />
              <Campo
                label="Breakeven"
                valor={leitura.breakevens.length ? leitura.breakevens.map((b) => b.toFixed(2)).join(" / ") : "—"}
              />
            </div>

            <p className="mt-4 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
              {leitura.resumo}
            </p>

            <div className="mt-3 border-t border-border pt-3">
              <div className="text-xs uppercase text-muted-foreground">O que pode acontecer</div>
              <ul className="mt-2 space-y-2 text-sm">
                {riscos.map((r, i) => (
                  <li key={i} className="leading-snug">
                    <span
                      className={
                        r.tom === "ruim" ? "text-loss" : r.tom === "bom" ? "text-success" : "text-muted-foreground"
                      }
                    >
                      {r.cenario}
                    </span>
                    <span className="text-muted-foreground"> — {r.consequencia}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <div className="text-xs uppercase text-muted-foreground">O que acompanhar</div>
              <ul className="mt-1 space-y-1 text-sm text-muted-foreground">
                {leitura.acompanhar.map((a) => (
                  <li key={a}>• {a}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setExplicar((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
              >
                <BookOpen size={13} /> Entenda esta estratégia
              </button>
              <button
                onClick={perguntarCopilot}
                className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
              >
                <MessageCircle size={13} /> Perguntar ao Copilot
              </button>
            </div>

            {explicar && (
              <div className="mt-3 rounded-md border border-border bg-card p-3 text-sm leading-relaxed text-muted-foreground">
                {leitura.analogia}
                <div className="mt-2">
                  <Link
                    to={leitura.licaoSlug ? "/licao/$slug" : "/trilha"}
                    params={leitura.licaoSlug ? { slug: leitura.licaoSlug } : undefined}
                    className="text-xs text-primary hover:underline"
                  >
                    Ver a lição correspondente na trilha →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {pedemConfirmacao.length > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-card p-4">
              <div className="text-xs uppercase text-muted-foreground">Confirmações técnicas das suas regras</div>
              <div className="mt-2 space-y-2">
                {pedemConfirmacao.map((r) => (
                  <label key={r.id} className="flex cursor-pointer items-start gap-2 text-sm leading-snug">
                    <input
                      type="checkbox"
                      checked={!!confirmacoes[r.id]}
                      onChange={(e) => setConfirmacoes({ ...confirmacoes, [r.id]: e.target.checked })}
                      className="mt-0.5 accent-[oklch(0.78_0.17_65)]"
                    />
                    <span className={confirmacoes[r.id] ? "text-foreground" : "text-muted-foreground"}>
                      {r.nome ? `${r.nome} — ` : ""}
                      {r.texto}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {alertas.length > 0 && (
            <div className="mt-4 rounded-lg border border-loss/40 bg-loss/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-loss">
                <AlertTriangle size={15} /> Atenção às suas regras
              </div>
              <ul className="mt-2 space-y-2 text-sm">
                {alertas.map((a, i) => (
                  <li key={i}>
                    <div className="italic">
                      “{a.regra}”
                      {a.severidade === "critico" && (
                        <span className="ml-2 rounded bg-loss/20 px-1.5 py-0.5 text-[10px] uppercase not-italic text-loss">
                          crítico
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{a.motivo}</div>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                O copilot não decide por você — mas registra que você foi avisado.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {pernas.map((p, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase text-muted-foreground">Perna {i + 1}</div>
                <button onClick={() => setPernas(pernas.filter((_, j) => j !== i))}>
                  <Trash2 size={14} className="text-muted-foreground hover:text-loss" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <select
                  value={p.acao}
                  onChange={(e) => updatePerna(i, { acao: e.target.value as any })}
                  className="rounded border border-border bg-input px-2 py-1"
                >
                  <option value="compra">Compra</option>
                  <option value="venda">Venda</option>
                </select>
                <select
                  value={p.tipo}
                  onChange={(e) => updatePerna(i, { tipo: e.target.value as any })}
                  className="rounded border border-border bg-input px-2 py-1"
                >
                  <option value="call">Call</option>
                  <option value="put">Put</option>
                </select>
                <label>
                  Strike
                  <input
                    type="number"
                    step="0.5"
                    value={p.strike}
                    onChange={(e) => updatePerna(i, { strike: +e.target.value || 0 })}
                    className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
                  />
                </label>
                <label>
                  Prêmio
                  <input
                    type="number"
                    step="0.05"
                    value={p.premio}
                    onChange={(e) => updatePerna(i, { premio: +e.target.value || 0 })}
                    className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
                  />
                </label>
                <label className="col-span-2">
                  Qtd
                  <input
                    type="number"
                    step="100"
                    value={p.quantidade}
                    onChange={(e) => updatePerna(i, { quantidade: +e.target.value || 0 })}
                    className="w-full rounded border border-border bg-input px-2 py-1 font-mono"
                  />
                </label>
              </div>
            </div>
          ))}
          <button
            onClick={() =>
              pernas.length < 4 &&
              setPernas([...pernas, { tipo: "call", acao: "compra", strike: centro, premio: 1, quantidade: 100 }])
            }
            disabled={pernas.length >= 4}
            className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-border py-2 text-xs text-muted-foreground hover:bg-accent disabled:opacity-40"
          >
            <Plus size={14} /> Nova perna ({pernas.length}/4)
          </button>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs uppercase text-muted-foreground">Sua tese</div>
            <textarea
              value={tese}
              onChange={(e) => setTese(e.target.value)}
              rows={4}
              placeholder="Por que esta operação faz sentido agora? O que precisa acontecer para você estar certo?"
              className="mt-2 w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">
              {tese.trim().length} caracteres {tese.trim().length < 40 && "· mínimo 40 para pontuar"}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-3">
            <div className="text-xs uppercase text-muted-foreground">Checklist de decisão</div>
            <div className="mt-2 space-y-2">
              {CHECKLIST.map((c) => (
                <label key={c.k} className="flex cursor-pointer items-start gap-2 text-xs leading-snug">
                  <input
                    type="checkbox"
                    checked={!!check[c.k]}
                    onChange={(e) => setCheck({ ...check, [c.k]: e.target.checked })}
                    className="mt-0.5 accent-[oklch(0.78_0.17_65)]"
                  />
                  <span className={check[c.k] ? "text-foreground" : "text-muted-foreground"}>{c.label}</span>
                </label>
              ))}
            </div>
          </div>

          <ScorePanel score={score} />

          <button
            onClick={salvar}
            disabled={!checkOk}
            className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            Levar esta decisão para o Diário
          </button>
          {!checkOk && (
            <p className="text-center text-xs text-muted-foreground">
              Responda o checklist inteiro para registrar a decisão.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}

export function ScorePanel({
  score,
}: {
  score: { score: number; leitura: string; itens: { chave: string; label: string; pontos: number; max: number; ok: boolean }[] };
}) {
  const cor =
    score.score >= 85 ? "text-success" : score.score >= 65 ? "text-primary" : score.score >= 40 ? "text-primary" : "text-loss";
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-baseline justify-between">
        <div className="text-xs uppercase text-muted-foreground">Decision Score</div>
        <div className={`font-mono text-2xl font-bold ${cor}`}>{score.score}</div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-accent">
        <div
          className={`h-full rounded-full ${score.score >= 65 ? "bg-success" : score.score >= 40 ? "bg-primary" : "bg-loss"}`}
          style={{ width: `${score.score}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-snug text-muted-foreground">{score.leitura}</p>
      <ul className="mt-3 space-y-1 border-t border-border pt-2 text-xs">
        {score.itens.map((i) => (
          <li key={i.chave} className="flex items-center justify-between gap-2">
            <span className={i.ok ? "text-foreground" : "text-muted-foreground"}>{i.label}</span>
            <span className="font-mono text-muted-foreground">
              {i.pontos}/{i.max}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Esta nota mede o seu processo, não o seu lucro.
      </p>
    </div>
  );
}

function Campo({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="font-medium">{valor}</div>
    </div>
  );
}
