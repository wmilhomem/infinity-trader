/**
 * Y.3.4 — STRUCTURE COMPARISON COMPONENT
 *
 * Experience: see possible structures from the options chain.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Shows available strikes and combinations, NOT "best strategy"
 * - User formulates which structure expresses their hypothesis
 * - No recommendation language
 */

import { useMemo, useState } from "react";
import type { MarketContext } from "@/lib/market-context";
import { buildStructureScenarios, type StructureScenario } from "@/lib/structure-reader";
import { qualityLabel } from "@/lib/options-chain-types";
import { Info, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  context: MarketContext | null;
}

function QualityBadge({ quality }: { quality: string }) {
  if (quality === "valid") return null;
  const ql = qualityLabel(quality as any);
  return (
    <span className={`flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] ${ql.class}`}>
      <AlertTriangle size={10} />
      {ql.text}
    </span>
  );
}

function ScenarioCard({ scenario }: { scenario: StructureScenario }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-md border border-border bg-card">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">{scenario.name}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-mono">
            {scenario.description}
          </span>
          <QualityBadge quality={scenario.quality} />
        </div>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
      {expanded && (
        <div className="border-t border-border px-3 pb-3 pt-2 space-y-1">
          <div className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">
            Strikes
          </div>
          {scenario.legs.map((leg, i) => (
            <div key={i} className="flex items-center gap-3 text-[11px]">
              <span
                className={`w-8 rounded px-1.5 py-0.5 text-[10px] font-bold ${leg.type === "CALL" ? "bg-success/10 text-success" : "bg-loss/10 text-loss"}`}
              >
                {leg.type}
              </span>
              <span className="font-mono font-semibold text-foreground">
                {leg.strike.toFixed(2)}
              </span>
              {leg.iv !== null && (
                <span className="text-muted-foreground">
                  IV: <span className="font-mono">{(leg.iv * 100).toFixed(1)}%</span>
                </span>
              )}
              {leg.delta !== null && (
                <span className="text-muted-foreground">
                  Δ: <span className="font-mono">{leg.delta.toFixed(3)}</span>
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ConceptNote() {
  return (
    <div className="flex items-start gap-2 rounded border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
      <Info size={13} className="mt-0.5 shrink-0 text-info" />
      <p>
        <strong className="text-foreground">Estruturas</strong> são combinações de strikes da cadeia
        disponível. Cada card mostra os strikes de cada perna. O sistema não sugere qual estrutura
        expressa melhor uma hipótese — isso é decisão sua.
      </p>
    </div>
  );
}

export function StructureComparison({ context }: Props) {
  const scenarios = useMemo(() => buildStructureScenarios(context), [context]);

  if (!context || scenarios.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Estruturas não disponíveis — cadeia de opções com menos de 2 strikes.
      </div>
    );
  }

  const byType: Record<string, StructureScenario[]> = {};
  for (const s of scenarios) {
    if (!byType[s.name]) byType[s.name] = [];
    byType[s.name].push(s);
  }

  return (
    <div className="space-y-4">
      <ConceptNote />

      <div className="grid gap-6 lg:grid-cols-3">
        {Object.entries(byType).map(([type, items]) => (
          <div key={type} className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {type}
              <span className="ml-2 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] normal-case">
                {items.length} combinação{items.length > 1 ? "ões" : ""}
              </span>
            </h3>
            <div className="space-y-2">
              {items.slice(0, 6).map((s) => (
                <ScenarioCard key={s.id} scenario={s} />
              ))}
              {items.length > 6 && (
                <div className="text-center text-[10px] text-muted-foreground py-2">
                  +{items.length - 6} mais combinações
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
