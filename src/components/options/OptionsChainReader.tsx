/**
 * Y.3.0 — OPTIONS CHAIN READER COMPONENT
 *
 * Experience: look at a real options chain → observe → interpret → formulate hypothesis.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * This component displays FACTS only. It does NOT:
 * - Suggest buying/selling
 * - Rank "best" options
 * - Generate directional signals
 * - Recommend strategies
 *
 * The user decides what the data means within their own plan.
 */

import { useState, useMemo } from "react";
import type { MarketContext } from "@/lib/market-context";
import {
  buildFactsFromMarketContext,
  buildInitialState,
  addInterpretation,
  addHypothesis,
  addEvidence,
  removeInterpretation,
  type ChainReadingState,
  type Fact,
} from "@/lib/options-chain-reader";
import { originLabel, qualityLabel } from "@/lib/options-chain-types";
import { MoneynessVisual } from "@/components/options/MoneynessVisual";
import { VolatilityContext } from "@/components/options/VolatilityContext";
import {
  Eye,
  Brain,
  Lightbulb,
  Shield,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  AlertTriangle,
} from "lucide-react";

interface Props {
  context: MarketContext | null;
  onSaveReading?: (state: ChainReadingState) => void;
}

function ProvenanceBadge({ fact }: { fact: Fact }) {
  const origin = originLabel(fact.provenance.origin);
  const source =
    fact.provenance.source === "yahoo-finance" ? "Yahoo Finance" : (fact.provenance.source ?? "—");
  const time = fact.provenance.calculatedAt
    ? new Date(fact.provenance.calculatedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;
  const ql = qualityLabel(fact.quality);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
      <span className={ql.class}>[{ql.text}]</span>
      <span>
        <strong className="font-normal text-foreground">{origin}</strong>
        {source !== "—" ? ` · ${source}` : ""}
      </span>
      {time && <span>· {time}</span>}
      {fact.provenance.method && <span>· {fact.provenance.method}</span>}
    </div>
  );
}

function FactCard({ fact }: { fact: Fact }) {
  const [expanded, setExpanded] = useState(false);
  const ql = qualityLabel(fact.quality);

  return (
    <div className="rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground">{fact.rotulo}</span>
          {fact.quality === "suspicious" && (
            <span className="flex items-center gap-1 rounded bg-warning/15 px-1.5 py-0.5 text-[10px] text-warning">
              <AlertTriangle size={10} /> {ql.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-semibold text-foreground">{fact.valor}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </button>
      {expanded && (
        <div className="border-t border-border px-3 pb-3 pt-2">
          <ProvenanceBadge fact={fact} />
          {fact.reasons && fact.reasons.length > 0 && (
            <div className="mt-1 text-[10px] text-warning">{fact.reasons.join(" · ")}</div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: typeof Eye; title: string }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
      <Icon size={14} />
      {title}
    </div>
  );
}

function InterpretationEntry({
  interp,
  onDelete,
}: {
  interp: ChainReadingState["interpretations"][0];
  onDelete: () => void;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-foreground flex-1">{interp.texto}</p>
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 text-muted-foreground hover:text-loss"
        >
          <Trash2 size={13} />
        </button>
      </div>
      {interp.fatosReferenciados.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {interp.fatosReferenciados.map((fid) => (
            <span
              key={fid}
              className="rounded bg-accent px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {fid}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function HypothesisEntry({
  hyp,
  onDelete,
}: {
  hyp: ChainReadingState["hypotheses"][0];
  onDelete: () => void;
}) {
  return (
    <div className="rounded-md border border-primary/30 bg-primary/5 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-foreground flex-1 italic">"{hyp.texto}"</p>
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 text-muted-foreground hover:text-loss"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

function EvidenceEntry({
  ev,
  onDelete,
}: {
  ev: ChainReadingState["evidences"][0];
  onDelete: () => void;
}) {
  const isContra = ev.tipo === "contraEvidencia";
  return (
    <div
      className={`rounded-md border p-3 ${isContra ? "border-loss/30 bg-loss/5" : "border-success/30 bg-success/5"}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase text-muted-foreground mb-1">
            {isContra ? "Contra-evidência" : "Evidência"}
          </div>
          <p className="text-sm text-foreground">{ev.texto}</p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 text-muted-foreground hover:text-loss"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

export function OptionsChainReader({ context, onSaveReading }: Props) {
  const facts = useMemo(() => buildFactsFromMarketContext(context), [context]);

  const [state, setState] = useState<ChainReadingState>(() =>
    context
      ? buildFactsFromMarketContext(context).length > 0
        ? { ...buildInitialState(), facts }
        : buildInitialState()
      : buildInitialState(),
  );

  const [interpText, setInterpText] = useState("");
  const [hypText, setHypText] = useState("");
  const [evText, setEvText] = useState("");
  const [evType, setEvType] = useState<"evidencia" | "contraEvidencia">("evidencia");
  const [selectedInterpId, setSelectedInterpId] = useState<string | null>(null);

  const spotFact = facts.find((f) => f.tipo === "spot");
  const volatilityFacts = facts.filter((f) =>
    ["iv", "ivRank", "skew", "expectedMove"].includes(f.tipo),
  );
  const chainFacts = facts.filter((f) =>
    ["bid", "ask", "volume", "openInterest", "delta", "gamma", "theta", "vega"].includes(f.tipo),
  );
  const ivFacts = facts.filter((f) => f.tipo === "iv");

  function handleAddInterpretation() {
    if (!interpText.trim()) return;
    setState((s) => addInterpretation(s, interpText.trim(), []));
    setInterpText("");
  }

  function handleAddHypothesis() {
    if (!hypText.trim() || !selectedInterpId) return;
    setState((s) => addHypothesis(s, hypText.trim(), selectedInterpId));
    setHypText("");
  }

  function handleAddEvidence() {
    if (!evText.trim()) return;
    const hypId = state.hypotheses[0]?.id ?? "no-hypothesis";
    setState((s) => addEvidence(s, evType, evText.trim(), hypId));
    setEvText("");
  }

  if (!context) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Contexto de mercado não disponível.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <div className="font-mono text-lg font-bold text-foreground">
              {context.instrument.symbol}
            </div>
            {spotFact && (
              <div className="text-sm text-muted-foreground mt-0.5">
                Spot:{" "}
                <span className="font-mono font-semibold text-foreground">{spotFact.valor}</span>
              </div>
            )}
          </div>
          {context.optionsChain?.expirationDate && (
            <div className="text-right text-xs text-muted-foreground">
              <div>
                Vencimento:{" "}
                {new Date(context.optionsChain.expirationDate).toLocaleDateString("pt-BR")}
              </div>
              {context.optionsChain.daysToExpiration && (
                <div>DTE: {context.optionsChain.daysToExpiration} dias</div>
              )}
            </div>
          )}
        </div>

        <div className="rounded bg-primary/10 border border-primary/20 p-3 text-xs text-muted-foreground flex items-start gap-2">
          <Shield size={14} className="text-primary shrink-0 mt-0.5" />
          <span>
            <strong className="text-primary font-normal">Regra central:</strong> Este componente
            exibe fatos observados e calculados. Nunca transforma uma interpretação em recomendação
            operacional.
          </span>
        </div>
      </div>

      {context.optionsChain?.contracts && context.optionsChain.contracts.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <MoneynessVisual context={context} />
        </div>
      )}

      {context.optionsChain?.impliedVolatilityAtm && (
        <div className="rounded-xl border border-border bg-card p-5">
          <VolatilityContext context={context} />
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <SectionHeader icon={Brain} title="O que você observa?" />
            <p className="text-xs text-muted-foreground">
              Descreva o que você vê nos dados acima. Separe fato de interpretação.
            </p>
            <textarea
              value={interpText}
              onChange={(e) => setInterpText(e.target.value)}
              placeholder="Ex: A IV das puts está maior que a das calls, indicando skew negativo..."
              rows={3}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm resize-none"
            />
            <button
              type="button"
              onClick={handleAddInterpretation}
              disabled={!interpText.trim()}
              className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Registrar observação
            </button>
            {state.interpretations.length > 0 && (
              <div className="space-y-2 mt-3">
                {state.interpretations.map((i) => (
                  <InterpretationEntry
                    key={i.id}
                    interp={i}
                    onDelete={() => setState((s) => removeInterpretation(s, i.id))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-4">
            <SectionHeader icon={Lightbulb} title="Qual é sua hipótese?" />
            <p className="text-xs text-muted-foreground">
              Formule uma hipótese a partir da sua observação. Uma hipótese não é uma decisão.
            </p>
            {state.interpretations.length > 0 && (
              <select
                value={selectedInterpId ?? ""}
                onChange={(e) => setSelectedInterpId(e.target.value || null)}
                className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm"
              >
                <option value="">Selecione uma observação...</option>
                {state.interpretations.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.texto.slice(0, 50)}...
                  </option>
                ))}
              </select>
            )}
            <textarea
              value={hypText}
              onChange={(e) => setHypText(e.target.value)}
              placeholder="Ex: O mercado pode estar precificando maior demanda por proteção..."
              rows={2}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm resize-none"
            />
            <button
              type="button"
              onClick={handleAddHypothesis}
              disabled={!hypText.trim()}
              className="w-full rounded-md bg-primary py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Registrar hipótese
            </button>
            {state.hypotheses.length > 0 && (
              <div className="space-y-2 mt-3">
                {state.hypotheses.map((h) => (
                  <HypothesisEntry
                    key={h.id}
                    hyp={h}
                    onDelete={() =>
                      setState((s) => ({
                        ...s,
                        hypotheses: s.hypotheses.filter((x) => x.id !== h.id),
                      }))
                    }
                  />
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <SectionHeader icon={Shield} title="Evidências" />
            <p className="text-xs text-muted-foreground">
              Liste evidências a favor e contra sua hipótese.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEvType("evidencia")}
                className={`flex-1 rounded-md border py-1.5 text-xs font-medium ${evType === "evidencia" ? "border-success bg-success/10 text-success" : "border-border text-muted-foreground"}`}
              >
                Evidência
              </button>
              <button
                type="button"
                onClick={() => setEvType("contraEvidencia")}
                className={`flex-1 rounded-md border py-1.5 text-xs font-medium ${evType === "contraEvidencia" ? "border-loss bg-loss/10 text-loss" : "border-border text-muted-foreground"}`}
              >
                Contra-evidência
              </button>
            </div>
            <textarea
              value={evText}
              onChange={(e) => setEvText(e.target.value)}
              placeholder="Ex: Volume de calls aumentando na mesma faixa..."
              rows={2}
              className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm resize-none"
            />
            <button
              type="button"
              onClick={handleAddEvidence}
              disabled={!evText.trim()}
              className="w-full rounded-md bg-accent py-2 text-sm font-medium text-foreground hover:bg-accent/80 disabled:opacity-50"
            >
              <Plus size={13} className="inline mr-1" /> Adicionar
            </button>
            {state.evidences.length > 0 && (
              <div className="space-y-2 mt-3">
                {state.evidences.map((e) => (
                  <EvidenceEntry
                    key={e.id}
                    ev={e}
                    onDelete={() =>
                      setState((s) => ({
                        ...s,
                        evidences: s.evidences.filter((x) => x.id !== e.id),
                      }))
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {onSaveReading && state.interpretations.length > 0 && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => onSaveReading(state)}
            className="rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Salvar leitura
          </button>
        </div>
      )}
    </div>
  );
}
