/**
 * Y.3.1 — MONEYNESS CALCULATOR
 *
 * Funções puras para calcular moneyness de opções.
 * NUNCA gera recomendação. Apenas fatos calculados com provenance.
 */

import type { MarketContext } from "@/lib/market-context";
import type { OptionContract, AtmDefinition } from "@/lib/market-context";
import type { Quality } from "@/lib/options-chain-types";

export type Moneyness = "ITM" | "ATM" | "OTM";

export type OptionMoneynessFact = {
  optionType: "CALL" | "PUT";
  strike: number;
  spot: number;
  moneyness: Moneyness;
  distanceAbs: number;
  distancePct: number;
  atmStrike: number;
  atmMethod: AtmDefinition["method"];
  provenance: ProvenanceBadge;
};

export type ProvenanceBadge = {
  origin: "observed" | "calculated" | "estimated";
  source?: string | null;
  method?: string | null;
  calculatedAt?: string | null;
};

export type ExpirationFact = {
  expiration: string;
  dte: number;
  contractCount: number;
  quality: Quality;
  provenance: ProvenanceBadge;
};

function computeMoneyness(
  strike: number,
  spot: number,
  type: "call" | "put",
  atmStrike: number,
): Moneyness {
  if (strike === atmStrike) return "ATM";
  if (type === "call") {
    return strike < spot ? "ITM" : "OTM";
  } else {
    return strike > spot ? "ITM" : "OTM";
  }
}

function computeDistance(strike: number, spot: number): { abs: number; pct: number } {
  const abs = strike - spot;
  const pct = spot !== 0 ? (abs / spot) * 100 : 0;
  return { abs, pct };
}

function q(quality: string | undefined): Quality {
  if (quality === "suspicious") return "suspicious";
  if (quality === "invalid") return "invalid";
  if (quality === "absent") return "absent";
  return "valid";
}

export function calculateMoneynessFacts(
  contracts: OptionContract[],
  spot: number | null,
  atm: AtmDefinition | null,
  timestamp: string,
  source?: string,
): OptionMoneynessFact[] {
  if (spot === null || atm === null) return [];
  if (!contracts || contracts.length === 0) return [];

  const facts: OptionMoneynessFact[] = [];

  for (const c of contracts) {
    if (c.strike === null || c.strike === undefined) continue;

    const moneyness = computeMoneyness(c.strike, spot, c.type, atm.strike);
    const distance = computeDistance(c.strike, spot);

    facts.push({
      optionType: c.type.toUpperCase() as "CALL" | "PUT",
      strike: c.strike,
      spot,
      moneyness,
      distanceAbs: distance.abs,
      distancePct: distance.pct,
      atmStrike: atm.strike,
      atmMethod: atm.method,
      provenance: {
        origin: "calculated",
        method: "moneyness-from-spot",
        source: source ?? null,
        calculatedAt: timestamp,
      },
    });
  }

  return facts;
}

export function calculateExpirationFacts(
  contracts: OptionContract[],
  timestamp: string,
  source?: string,
): ExpirationFact[] {
  if (!contracts || contracts.length === 0) return [];

  const byExpiration: Record<string, OptionContract[]> = {};
  for (const c of contracts) {
    if (!c.expiration) continue;
    if (!byExpiration[c.expiration]) byExpiration[c.expiration] = [];
    byExpiration[c.expiration].push(c);
  }

  const facts: ExpirationFact[] = [];
  const now = new Date(timestamp);

  for (const [expiration, exContracts] of Object.entries(byExpiration)) {
    const expDate = new Date(expiration);
    const dte = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const hasSuspicious = exContracts.some((c) => {
      const iv = c.impliedVolatility;
      return iv?.value !== null && iv?.value !== undefined && (iv.value < 0.01 || iv.value > 5);
    });

    facts.push({
      expiration,
      dte,
      contractCount: exContracts.length,
      quality: hasSuspicious ? "suspicious" : "valid",
      provenance: {
        origin: "calculated",
        method: "expiration-from-contracts",
        source: source ?? null,
        calculatedAt: timestamp,
      },
    });
  }

  return facts.sort((a, b) => a.dte - b.dte);
}

export function buildMoneynessVisual(ctx: MarketContext | null): {
  facts: OptionMoneynessFact[];
  expirations: ExpirationFact[];
  spot: number | null;
  atmStrike: number | null;
} {
  if (!ctx) {
    return { facts: [], expirations: [], spot: null, atmStrike: null };
  }

  const spot = ctx.quote?.last ?? null;
  const atm = ctx.optionsChain?.atm ?? null;
  const contracts = ctx.optionsChain?.contracts ?? [];
  const timestamp = ctx.timestamp ?? new Date().toISOString();
  const source = ctx.provenance?.source ?? undefined;

  const facts = calculateMoneynessFacts(contracts, spot, atm, timestamp, source);
  const expirations = calculateExpirationFacts(contracts, timestamp, source);

  return {
    facts,
    expirations,
    spot,
    atmStrike: atm?.strike ?? null,
  };
}
