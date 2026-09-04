/**
 * Y.3.3 — GREEKS READER
 *
 * Lê gregas do MarketContext Y.2 como fatos.
 * NUNCA recalcula. Apenas extrai e expõe.
 * NUNCA transforma grega em sinal operacional.
 */

import type { MarketContext, OptionContract, GreekField } from "@/lib/market-context";
import type { Quality } from "@/lib/options-chain-types";

export type GreekType = "delta" | "gamma" | "theta" | "vega";

export type GreekFact = {
  greek: GreekType;
  label: string;
  value: number | null;
  valueFormatted: string;
  unit: string;
  strike: number;
  optionType: "CALL" | "PUT";
  origin: "observed" | "calculated" | "estimated";
  quality: Quality;
};

export type GreeksReading = {
  facts: GreekFact[];
  spot: number | null;
  dte: number | null;
};

function qualityOf(value: number | null, origin: string): Quality {
  if (value === null) return "absent";
  if (origin === "estimated") return "valid";
  if (value < -10 || value > 10) return "suspicious";
  return "valid";
}

function originOf(p: { origin: string }): "observed" | "calculated" | "estimated" {
  if (p.origin === "observed") return "observed";
  if (p.origin === "calculated") return "calculated";
  return "estimated";
}

function formatDelta(v: number | null): string {
  if (v === null) return "—";
  return v.toFixed(3);
}

function formatGreek(v: number | null, unit: string): string {
  if (v === null) return "—";
  const sign = v >= 0 ? "+" : "";
  if (unit === "R$/dia") return `${sign}R$ ${Math.abs(v).toFixed(4)}/dia`;
  if (unit === "R$/1%") return `${sign}R$ ${Math.abs(v).toFixed(4)}/1%`;
  return v.toFixed(4);
}

function buildGreekFact(
  type: GreekType,
  field: GreekField | null | undefined,
  contract: OptionContract,
  unit: string,
): GreekFact | null {
  if (!field || field.value === null || field.value === undefined) return null;

  const labels: Record<GreekType, string> = {
    delta: "Delta",
    gamma: "Gamma",
    theta: "Theta",
    vega: "Vega",
  };

  return {
    greek: type,
    label: labels[type],
    value: field.value,
    valueFormatted: type === "delta" ? formatDelta(field.value) : formatGreek(field.value, unit),
    unit,
    strike: contract.strike,
    optionType: contract.type.toUpperCase() as "CALL" | "PUT",
    origin: originOf(field.provenance),
    quality: qualityOf(field.value, field.provenance.origin),
  };
}

export function buildGreeksReading(ctx: MarketContext | null): GreeksReading {
  if (!ctx) {
    return { facts: [], spot: null, dte: null };
  }

  const spot = ctx.quote?.last ?? null;
  const dte = ctx.optionsChain?.daysToExpiration ?? null;
  const contracts = ctx.optionsChain?.contracts ?? [];

  const facts: GreekFact[] = [];

  for (const c of contracts) {
    const delta = buildGreekFact("delta", c.delta, c, "—");
    if (delta) facts.push(delta);

    const gamma = buildGreekFact("gamma", c.gamma, c, "—");
    if (gamma) facts.push(gamma);

    const theta = buildGreekFact("theta", c.theta, c, "R$/dia");
    if (theta) facts.push(theta);

    const vega = buildGreekFact("vega", c.vega, c, "R$/1%");
    if (vega) facts.push(vega);
  }

  return { facts, spot, dte };
}
