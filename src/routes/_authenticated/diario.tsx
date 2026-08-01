import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { Check, X } from "lucide-react";
import type { Perna } from "@/lib/payoff";
import { interpretar } from "@/engines/simulation-interpreter";
import { validarRegras, type Regra } from "@/engines/rule-engine";
import { calcularDecisionScore, disciplina } from "@/engines/decision-engine";
import { detectarPadroes } from "@/engines/behavior-engine";
import type { DiaryEntry } from "@/engines/types";
import { ScorePanel } from "./simulador";

export const Route = createFileRoute("/_authenticated/diario")({
  head: () => ({
    meta: [
      { title: "Diário de decisões · Zero ao Trade" },
      {
        name: "description",
        content:
          "Registre cada operação com tese, regra aplicada, emoção e nota de processo — e veja os padrões do seu comportamento.",
      },
      { property: "og:title", content: "Diário de decisões · Zero ao Trade" },
      {
        property: "og:description",
        content: "Transforme operações em decisões auditáveis: tese, regra, emoção e Decision Score.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: z.object({ sim: z.string().optional() }),
  component: Diario,
});

const CHECKLIST = [
  { k: "perda", label: "Sei exatamente quanto posso perder nesta operação" },
  { k: "tese", label: "Tenho uma tese escrita, não um palpite" },
  { k: "saida", label: "Sei em que ponto eu saio se der errado" },
  { k: "tamanho", label: "O tamanho da posição cabe no meu capital" },
  { k: "regra", label: "Minha regra permite esta operação" },
];

const EMOCOES = ["tranquilo", "confiante", "ansioso", "com pressa", "com medo", "eufórico"];

function Diario() {
  const { sim } = Route.useSearch();
  const qc = useQueryClient();

  const entries = useQuery({
    queryKey: ["diary"],
    queryFn: async () => {
      const { data } = await supabase
        .from("diary_entries")
        .select("*, personal_rules(texto,categoria)")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const rules = useQuery({
    queryKey: ["rules"],
    queryFn: async () => {
      const { data } = await supabase
        .from("personal_rules")
        .select("id, texto, nome, categoria, ativa, tipo, parametros_json");
      return (data as unknown as Regra[]) ?? [];
    },
  });
  const preSim = useQuery({
    queryKey: ["pre-sim", sim],
    enabled: !!sim,
    queryFn: async () => {
      const { data } = await supabase.from("simulations").select("*").eq("id", sim!).maybeSingle();
      return data;
    },
  });

  const [ativo, setAtivo] = useState("");
  const [estrutura, setEstrutura] = useState("");
  const [motivo, setMotivo] = useState("");
  const [ruleId, setRuleId] = useState<string>("");
  const [seguiu, setSeguiu] = useState<boolean | null>(null);
  const [resultado, setResultado] = useState<string>("");
  const [status, setStatus] = useState<"aberta" | "encerrada">("aberta");
  const [emocao, setEmocao] = useState<string>("");
  const [licao, setLicao] = useState("");
  const [check, setCheck] = useState<Record<string, boolean>>({});
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!preSim.data) return;
    setAtivo(preSim.data.ativo ?? "");
    setEstrutura(preSim.data.tipo_estrategia ?? "");
    try {
      const raw = sessionStorage.getItem(`sim-tese:${preSim.data.id}`);
      if (raw) {
        const parsed = JSON.parse(raw) as { tese?: string; checklist?: Record<string, boolean> };
        if (parsed.tese) setMotivo(parsed.tese);
        if (parsed.checklist) setCheck(parsed.checklist);
      }
    } catch {
      /* sem tese pré-carregada */
    }
  }, [preSim.data]);

  const pernas = useMemo<Perna[] | null>(() => {
    const p = preSim.data?.pernas;
    return Array.isArray(p) ? (p as unknown as Perna[]) : null;
  }, [preSim.data]);

  const interpretacao = useMemo(
    () =>
      pernas && pernas.length
        ? interpretar(pernas, Number(preSim.data?.preco_atual ?? 0) || 1, ativo || "o ativo")
        : null,
    [pernas, preSim.data, ativo],
  );

  const alertas = useMemo(
    () => (pernas && interpretacao ? validarRegras(pernas, rules.data ?? [], interpretacao) : []),
    [pernas, rules.data, interpretacao],
  );

  const historico = (entries.data ?? []) as unknown as DiaryEntry[];
  const disciplinaHistorica = useMemo(() => disciplina(historico), [historico]);
  const padroes = useMemo(() => detectarPadroes(historico), [historico]);

  const score = useMemo(
    () =>
      calcularDecisionScore({
        simulou: !!sim,
        tese: motivo,
        checklist: Object.fromEntries(CHECKLIST.map((c) => [c.k, !!check[c.k]])),
        alertas,
        interpretacao,
        disciplinaHistorica,
      }),
    [sim, motivo, check, alertas, interpretacao, disciplinaHistorica],
  );

  async function save() {
    if (!ativo || !estrutura) return toast.error("Preencha ativo e estrutura");
    setSalvando(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const respostas = Object.fromEntries(CHECKLIST.map((c) => [c.k, !!check[c.k]]));
      const { data: entry, error } = await supabase
        .from("diary_entries")
        .insert({
          user_id: u.user.id,
          simulation_id: sim ?? null,
          ativo,
          estrutura,
          motivo,
          rule_id: ruleId || null,
          seguiu_regra: seguiu,
          resultado: resultado ? +resultado : null,
          status,
          emocao: emocao || null,
          licao_aprendida: licao || null,
          checklist: respostas as any,
          decision_score: score.score,
          interpretacao: interpretacao as any,
        })
        .select()
        .single();
      if (error) return toast.error(error.message);

      await Promise.all([
        supabase.from("decision_scores").insert({
          user_id: u.user.id,
          diary_entry_id: entry.id,
          score: score.score,
          breakdown: { itens: score.itens, leitura: score.leitura, alertas } as any,
        }),
        supabase.from("checklists").insert({
          user_id: u.user.id,
          diary_entry_id: entry.id,
          simulation_id: sim ?? null,
          respostas: respostas as any,
          completo: CHECKLIST.every((c) => check[c.k]),
        }),
        supabase.from("decision_memory").insert({
          user_id: u.user.id,
          diary_entry_id: entry.id,
          simulation_id: sim ?? null,
          estrategia: interpretacao?.nome ?? estrutura,
          motivo,
          contexto: { ativo, alertas, risco: interpretacao?.risco ?? null } as any,
          resultado: resultado ? +resultado : null,
          emocao: emocao || null,
          licao_aprendida: licao || null,
        }),
        supabase.from("timeline_events").insert({
          user_id: u.user.id,
          tipo: "decisao",
          titulo: `Registrou ${estrutura} em ${ativo}`,
          descricao: score.leitura,
          meta: { diary_entry_id: entry.id, score: score.score, seguiu_regra: seguiu } as any,
        }),
      ]);

      toast.success(`Decisão registrada — Decision Score ${score.score}/100`);
      setAtivo("");
      setEstrutura("");
      setMotivo("");
      setRuleId("");
      setSeguiu(null);
      setResultado("");
      setStatus("aberta");
      setEmocao("");
      setLicao("");
      setCheck({});
      qc.invalidateQueries();
    } finally {
      setSalvando(false);
    }
  }

  return (
    <AppShell title="Diário de decisões">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="text-xs uppercase text-muted-foreground mb-3">Nova entrada</div>
            {sim && interpretacao && (
              <div className="mb-3 rounded-md border border-primary/40 bg-primary/10 p-3 text-xs leading-snug">
                <div className="font-semibold text-primary">{interpretacao.nome}</div>
                <p className="mt-1 text-muted-foreground">{interpretacao.resumo}</p>
              </div>
            )}
            <div className="space-y-3">
              <input
                placeholder="Ativo (ex: PETR4)"
                value={ativo}
                onChange={(e) => setAtivo(e.target.value.toUpperCase())}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm font-mono"
              />
              <input
                placeholder="Estrutura (ex: trava-alta 38/40)"
                value={estrutura}
                onChange={(e) => setEstrutura(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              />
              <textarea
                placeholder="Por quê? (sua tese — mínimo 40 caracteres para pontuar)"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              />
              <select
                value={ruleId}
                onChange={(e) => setRuleId(e.target.value)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="">— Qual regra aplicou? —</option>
                {(rules.data ?? [])
                  .filter((r) => r.ativa)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.categoria ?? "geral"}] {r.texto}
                    </option>
                  ))}
              </select>
              <div className="flex gap-2">
                <button
                  onClick={() => setSeguiu(true)}
                  className={`flex-1 rounded-md border px-3 py-2 text-xs ${seguiu === true ? "border-success bg-success/10 text-success" : "border-border"}`}
                >
                  <Check size={12} className="inline mr-1" /> Segui a regra
                </button>
                <button
                  onClick={() => setSeguiu(false)}
                  className={`flex-1 rounded-md border px-3 py-2 text-xs ${seguiu === false ? "border-loss bg-loss/10 text-loss" : "border-border"}`}
                >
                  <X size={12} className="inline mr-1" /> Furei a regra
                </button>
              </div>

              <div>
                <div className="text-xs uppercase text-muted-foreground">Como você estava ao decidir?</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {EMOCOES.map((e) => (
                    <button
                      key={e}
                      onClick={() => setEmocao(emocao === e ? "" : e)}
                      className={`rounded-full border px-3 py-1 text-xs ${emocao === e ? "border-primary bg-primary/20 text-primary" : "border-border hover:bg-accent"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div>
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

              <div className="flex gap-2">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="rounded-md border border-border bg-input px-3 py-2 text-sm"
                >
                  <option value="aberta">Aberta</option>
                  <option value="encerrada">Encerrada</option>
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Resultado R$ (opcional)"
                  value={resultado}
                  onChange={(e) => setResultado(e.target.value)}
                  className="flex-1 rounded-md border border-border bg-input px-3 py-2 text-sm font-mono"
                />
              </div>

              {status === "encerrada" && (
                <textarea
                  placeholder="O que você aprendeu com esta operação?"
                  value={licao}
                  onChange={(e) => setLicao(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
                />
              )}

              {alertas.length > 0 && (
                <div className="rounded-md border border-loss/40 bg-loss/10 p-3 text-xs">
                  <div className="font-semibold text-loss">Esta decisão contraria regras suas</div>
                  <ul className="mt-1 space-y-1 text-muted-foreground">
                    {alertas.map((a, i) => (
                      <li key={i}>• {a.motivo}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={save}
                disabled={salvando}
                className="w-full rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {salvando ? "Registrando…" : "Registrar decisão"}
              </button>
            </div>
          </div>

          <ScorePanel score={score} />
        </div>

        <div className="space-y-3">
          {padroes.length > 0 && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="text-xs uppercase text-muted-foreground">O que o seu histórico mostra</div>
              <ul className="mt-2 space-y-2 text-sm">
                {padroes.map((p) => (
                  <li key={p.key}>
                    <div className={p.severidade === "alerta" ? "font-medium text-loss" : "font-medium"}>
                      {p.titulo}
                    </div>
                    <div className="text-xs text-muted-foreground">{p.descricao}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="text-xs uppercase text-muted-foreground mb-1">Histórico</div>
          {(entries.data ?? []).map((e: any) => (
            <div key={e.id} className="rounded-md border border-border bg-card p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <div className="font-mono font-semibold">
                  {e.ativo} · {e.estrutura}
                </div>
                <div className="flex items-center gap-2">
                  {typeof e.decision_score === "number" && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-mono ${
                        e.decision_score >= 65
                          ? "bg-success/15 text-success"
                          : e.decision_score >= 40
                            ? "bg-primary/20 text-primary"
                            : "bg-loss/15 text-loss"
                      }`}
                    >
                      {e.decision_score}
                    </span>
                  )}
                  <span className={`text-xs ${e.status === "encerrada" ? "text-muted-foreground" : "text-primary"}`}>
                    {e.status}
                  </span>
                </div>
              </div>
              {e.motivo && <div className="mt-1 text-xs text-muted-foreground">{e.motivo}</div>}
              {e.personal_rules && (
                <div className="mt-2 text-xs text-primary">
                  [{e.personal_rules.categoria}] {e.personal_rules.texto}
                </div>
              )}
              {e.emocao && <div className="mt-1 text-xs text-muted-foreground">Estado: {e.emocao}</div>}
              {e.licao_aprendida && (
                <div className="mt-1 text-xs italic text-muted-foreground">“{e.licao_aprendida}”</div>
              )}
              <div className="mt-2 flex items-center justify-between text-xs">
                <span
                  className={
                    e.seguiu_regra ? "text-success" : e.seguiu_regra === false ? "text-loss" : "text-muted-foreground"
                  }
                >
                  {e.seguiu_regra === true ? "✓ Seguiu" : e.seguiu_regra === false ? "✗ Furou" : "—"}
                </span>
                {e.resultado !== null && (
                  <span className={`font-mono font-semibold ${e.resultado >= 0 ? "text-success" : "text-loss"}`}>
                    R$ {Number(e.resultado).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
          {(entries.data ?? []).length === 0 && (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhuma decisão registrada ainda.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
