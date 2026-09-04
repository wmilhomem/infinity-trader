/**
 * Y.3.3 — GREEKS VISUAL COMPONENT
 *
 * Experience: read Delta, Gamma, Theta, Vega as facts.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Shows what each greek measures, NOT what to do about it
 * - No "high delta = directional", "gamma = acceleration", etc.
 * - ConceptNote explains what each greek does NOT mean
 */

import { useMemo } from "react";
import type { MarketContext } from "@/lib/market-context";
import { buildGreeksReading, type GreekFact, type GreekType } from "@/lib/greeks-reader";
import { qualityLabel } from "@/lib/options-chain-types";
import { AlertTriangle, Info } from "lucide-react";

interface Props {
  context: MarketContext | null;
}

function QualityBadge({ quality }: { quality: string }) {
  if (quality === "valid") return null;
  const ql = qualityLabel(quality as any);
  return (
    <span className={`flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] ${ql.class}`}>
      <AlertTriangle size={9} />
    </span>
  );
}

function GreekCell({ fact }: { fact: GreekFact }) {
  const ql = qualityLabel(fact.quality);
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="font-mono text-sm font-semibold text-foreground">{fact.valueFormatted}</span>
      <QualityBadge quality={fact.quality} />
    </div>
  );
}

function GreekHeader({ type, unit }: { type: GreekType; unit: string }) {
  const labels: Record<GreekType, string> = {
    delta: "Δ Delta",
    gamma: "Γ Gamma",
    theta: "Θ Theta",
    vega: "ν Vega",
  };
  const descriptions: Record<GreekType, string> = {
    delta: "R$1 base",
    gamma: "R$1 base",
    theta: "por dia",
    vega: "1% IV",
  };
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-[10px] font-bold text-foreground">{labels[type]}</span>
      <span className="text-[9px] text-muted-foreground">{descriptions[type]}</span>
    </div>
  );
}

function ConceptNote() {
  return (
    <div className="flex items-start gap-2 rounded border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
      <Info size={13} className="mt-0.5 shrink-0 text-info" />
      <p>
        <strong className="text-foreground">Delta</strong> mede sensibilidade do prêmio ao preço do
        ativo base. <strong className="text-foreground">Gamma</strong> mede a taxa de variação do
        delta. <strong className="text-foreground">Theta</strong> mede a sangria de tempo diária.{" "}
        <strong className="text-foreground">Vega</strong> mede sensibilidade a mudanças na
        volatilidade implícita. Gregas descrevem comportamento do prêmio — não determinam direção,
        aceleração ou oportunidade.
      </p>
    </div>
  );
}

export function GreeksVisual({ context }: Props) {
  const { facts, spot, dte } = useMemo(() => buildGreeksReading(context), [context]);

  if (!context || facts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Gregas não disponíveis.
      </div>
    );
  }

  const sorted = [...facts].sort((a, b) => {
    if (a.optionType !== b.optionType) return a.optionType === "CALL" ? -1 : 1;
    return a.strike - b.strike;
  });

  const calls = sorted.filter((f) => f.optionType === "CALL");
  const puts = sorted.filter((f) => f.optionType === "PUT");

  const greekTypes: GreekType[] = ["delta", "gamma", "theta", "vega"];
  const units: Record<GreekType, string> = {
    delta: "R$1 base",
    gamma: "R$1 base",
    theta: "por dia",
    vega: "1% IV",
  };

  function renderTable(rows: GreekFact[], title: string) {
    return (
      <div className="space-y-2">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1 pr-3 font-semibold text-muted-foreground">Strike</th>
                {greekTypes.map((g) => (
                  <th key={g} className="text-center px-2">
                    <GreekHeader type={g} unit={units[g]} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const byGreek = (g: GreekType) =>
                  rows.filter((f) => f.greek === g && f.strike === row.strike)[0];
                const deltas = rows.filter((f) => f.greek === "delta" && f.strike === row.strike);
                const strikeRows = [
                  ...new Set(rows.filter((f) => f.strike === row.strike).map((f) => f.strike)),
                ];
                if (strikeRows.indexOf(row.strike) !== 0) return null;
                const delt = byGreek("delta");
                const gamm = byGreek("gamma");
                const thet = byGreek("theta");
                const veg = byGreek("vega");
                return (
                  <tr
                    key={`${row.optionType}-${row.strike}-${i}`}
                    className="border-b border-border/50"
                  >
                    <td className="py-1.5 pr-3">
                      <span className="font-mono font-semibold">{row.strike.toFixed(2)}</span>
                    </td>
                    <td className="text-center px-2">{delt && <GreekCell fact={delt} />}</td>
                    <td className="text-center px-2">{gamm && <GreekCell fact={gamm} />}</td>
                    <td className="text-center px-2">{thet && <GreekCell fact={thet} />}</td>
                    <td className="text-center px-2">{veg && <GreekCell fact={veg} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const callStrikes = [...new Set(calls.map((f) => f.strike))];
  const putStrikes = [...new Set(puts.map((f) => f.strike))];

  return (
    <div className="space-y-4">
      <ConceptNote />

      <div className="grid gap-6 lg:grid-cols-2">
        {calls.length > 0 && (
          <div className="rounded-md border border-border bg-card p-4">
            {renderTable(calls, "Calls")}
          </div>
        )}
        {puts.length > 0 && (
          <div className="rounded-md border border-border bg-card p-4">
            {renderTable(puts, "Puts")}
          </div>
        )}
      </div>

      {(spot !== null || dte !== null) && (
        <div className="flex gap-4 text-[10px] text-muted-foreground">
          {spot !== null && (
            <span>
              Spot: <strong className="text-foreground font-mono">R$ {spot.toFixed(2)}</strong>
            </span>
          )}
          {dte !== null && (
            <span>
              DTE: <strong className="text-foreground font-mono">{dte} dias</strong>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
