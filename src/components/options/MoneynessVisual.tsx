/**
 * Y.3.1 — MONEYNESS VISUAL COMPONENT
 *
 * Mostra moneyness e expiração como fatos, não como recomendação.
 * Separa: FATO (aqui está) vs INTERPRETAÇÃO (você decide o que isso significa).
 */

import { useMemo } from "react";
import type { MarketContext } from "@/lib/market-context";
import {
  buildMoneynessVisual,
  type OptionMoneynessFact,
  type ExpirationFact,
} from "@/lib/moneyness-calculator";
import { qualityLabel } from "@/lib/options-chain-types";
import { Clock, AlertTriangle, Info } from "lucide-react";

interface Props {
  context: MarketContext | null;
}

function MoneynessBadge({ moneyness }: { moneyness: OptionMoneynessFact["moneyness"] }) {
  const styles = {
    ITM: "bg-success/15 text-success border border-success/30",
    ATM: "bg-primary/15 text-primary border border-primary/30",
    OTM: "bg-muted text-muted-foreground border border-border",
  };
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-bold tracking-wider ${styles[moneyness]}`}
    >
      {moneyness}
    </span>
  );
}

function DistanceChip({ abs, pct }: { abs: number; pct: number }) {
  const sign = abs >= 0 ? "+" : "";
  return (
    <span className="font-mono text-[10px] text-muted-foreground">
      {sign}
      {abs.toFixed(2)} ({sign}
      {pct.toFixed(1)}%)
    </span>
  );
}

function ProvenanceChip({ fact }: { fact: OptionMoneynessFact }) {
  return (
    <span className="text-[9px] text-muted-foreground">
      {fact.atmMethod === "nearest-strike" ? "nearest-strike" : fact.atmMethod} · ATM{" "}
      {fact.atmStrike}
    </span>
  );
}

function ExpirationCard({ exp }: { exp: ExpirationFact }) {
  const ql = qualityLabel(exp.quality);
  return (
    <div
      className={`rounded-md border p-3 ${exp.quality === "suspicious" ? "border-warning/40 bg-warning/5" : "border-border bg-card"}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={12} className="text-muted-foreground" />
          <span className="font-mono text-sm font-semibold">
            {new Date(exp.expiration).toLocaleDateString("pt-BR")}
          </span>
          {exp.quality === "suspicious" && (
            <span className="flex items-center gap-0.5 rounded bg-warning/15 px-1.5 py-0.5 text-[9px] text-warning">
              <AlertTriangle size={9} />
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="font-mono text-lg font-bold text-foreground">
            {exp.dte}
            <span className="ml-1 text-[10px] font-normal text-muted-foreground">dias</span>
          </div>
        </div>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
        <span>{exp.contractCount} strikes disponíveis</span>
        <span className={ql.class}>{ql.text}</span>
      </div>
    </div>
  );
}

function StrikeLine({ fact }: { fact: OptionMoneynessFact }) {
  return (
    <div className="flex items-center gap-3 rounded border border-border bg-card px-3 py-2">
      <div className="flex w-16 items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {fact.optionType}
        </span>
        <span className="font-mono text-sm font-bold text-foreground">
          {fact.strike.toFixed(2)}
        </span>
      </div>
      <MoneynessBadge moneyness={fact.moneyness} />
      <DistanceChip abs={fact.distanceAbs} pct={fact.distancePct} />
      <div className="ml-auto flex flex-col items-end">
        <ProvenanceChip fact={fact} />
      </div>
    </div>
  );
}

function SpotLine({ spot }: { spot: number }) {
  return (
    <div className="flex items-center gap-3 rounded border border-primary/30 bg-primary/5 px-3 py-2">
      <div className="flex w-16 items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary">SPOT</span>
        <span className="font-mono text-sm font-bold text-primary">R$ {spot.toFixed(2)}</span>
      </div>
      <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
        REFERÊNCIA
      </span>
    </div>
  );
}

function PriceAxis({ facts, spot }: { facts: OptionMoneynessFact[]; spot: number }) {
  const sorted = [...facts].sort((a, b) => a.strike - b.strike);
  if (sorted.length === 0) return null;

  const minStrike = sorted[0].strike;
  const maxStrike = sorted[sorted.length - 1].strike;
  const range = maxStrike - minStrike || 1;

  function pos(strike: number): number {
    return ((strike - minStrike) / range) * 100;
  }

  function spotPos(): number {
    if (spot < minStrike) return -5;
    if (spot > maxStrike) return 105;
    return pos(spot);
  }

  const visible = sorted.filter((f) => Math.abs(pos(f.strike) - spotPos()) > 8);

  return (
    <div className="relative h-16 rounded border border-border bg-card px-3">
      <div className="absolute inset-x-3 top-1/2 h-px bg-border" />
      <div
        className="absolute top-1/2 h-4 w-px bg-primary"
        style={{ left: `${spotPos()}%`, transform: "translateX(-50%)" }}
      />
      <div
        className="absolute top-1/2 -translate-y-1/2 text-[9px] font-mono text-primary"
        style={{ left: `${spotPos()}%`, transform: "translateX(-50%)" }}
      >
        R$ {spot.toFixed(2)}
      </div>
      {visible.map((f) => (
        <div
          key={`${f.optionType}-${f.strike}`}
          className="absolute top-1/2 -translate-y-1/2 text-[9px] font-mono text-muted-foreground"
          style={{ left: `${pos(f.strike)}%`, transform: "translateX(-50%)" }}
        >
          {f.strike.toFixed(0)}
        </div>
      ))}
    </div>
  );
}

function ConceptNote() {
  return (
    <div className="flex items-start gap-2 rounded border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
      <Info size={13} className="mt-0.5 shrink-0 text-info" />
      <p>
        <strong className="text-foreground">Moneyness</strong> é uma fotografia da relação entre
        strike e spot.
        <strong className="ml-1 text-foreground">DTE</strong> é a dimensão temporal. A mesma
        hipótese de mercado pode se comportar de maneira diferente em vencimentos distintos — mas
        isso é algo que você avalia, não o sistema.
      </p>
    </div>
  );
}

export function MoneynessVisual({ context }: Props) {
  const { facts, expirations, spot, atmStrike } = useMemo(
    () => buildMoneynessVisual(context),
    [context],
  );

  if (!context || spot === null) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Dados de mercado não disponíveis para calcular moneyness.
      </div>
    );
  }

  const sorted = [...facts].sort((a, b) => a.strike - b.strike);

  const calls = sorted.filter((f) => f.optionType === "CALL");
  const puts = sorted.filter((f) => f.optionType === "PUT");

  return (
    <div className="space-y-4">
      <ConceptNote />

      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Posição Relativa ao Spot
        </h3>
        {atmStrike !== null && <PriceAxis facts={facts} spot={spot} />}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Calls
          </h3>
          <SpotLine spot={spot} />
          {calls.map((f) => (
            <StrikeLine key={`call-${f.strike}`} fact={f} />
          ))}
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Puts
          </h3>
          <SpotLine spot={spot} />
          {puts.map((f) => (
            <StrikeLine key={`put-${f.strike}`} fact={f} />
          ))}
        </div>
      </div>

      {expirations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Vencimentos Disponíveis
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {expirations.map((e) => (
              <ExpirationCard key={e.expiration} exp={e} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
