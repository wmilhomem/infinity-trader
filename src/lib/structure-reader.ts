/**
 * Y.3.4 — STRUCTURE READER
 *
 * Lê estruturas possíveis da cadeia de opções como fatos.
 * NUNCA recomenda. Mostra strikes disponíveis para formar estruturas.
 */

import type { MarketContext, OptionContract } from "@/lib/market-context";
import type { Quality } from "@/lib/options-chain-types";

export type LegFact = {
  type: "CALL" | "PUT";
  strike: number;
  iv: number | null;
  bid: number | null;
  ask: number | null;
  delta: number | null;
};

export type StructureScenario = {
  id: string;
  name: string;
  description: string;
  legs: LegFact[];
  spot: number | null;
  quality: Quality;
};

let _id = 0;
function genId(prefix: string): string {
  return `${prefix}-${++_id}-${Date.now()}`;
}

function qualityFromContracts(contracts: OptionContract[]): Quality {
  const suspicious = contracts.some((c) => {
    const iv = c.impliedVolatility?.value;
    return iv !== null && iv !== undefined && (iv < 0.01 || iv > 5);
  });
  return suspicious ? "suspicious" : "valid";
}

function buildLeg(contract: OptionContract): LegFact {
  return {
    type: contract.type.toUpperCase() as "CALL" | "PUT",
    strike: contract.strike,
    iv: contract.impliedVolatility?.value ?? null,
    bid: contract.bid ?? null,
    ask: contract.ask ?? null,
    delta: contract.delta?.value ?? null,
  };
}

export function buildStructureScenarios(ctx: MarketContext | null): StructureScenario[] {
  if (!ctx) return [];

  const contracts = ctx.optionsChain?.contracts ?? [];
  if (contracts.length === 0) return [];

  const spot = ctx.quote?.last ?? null;
  const quality = qualityFromContracts(contracts);

  const calls = contracts.filter((c) => c.type === "call").sort((a, b) => a.strike - b.strike);
  const puts = contracts.filter((c) => c.type === "put").sort((a, b) => a.strike - b.strike);

  const scenarios: StructureScenario[] = [];

  if (calls.length >= 2) {
    for (let i = 0; i < calls.length - 1; i++) {
      for (let j = i + 1; j < calls.length; j++) {
        const lower = calls[i];
        const upper = calls[j];
        scenarios.push({
          id: genId("cs"),
          name: "Call Spread",
          description: `Call ${lower.strike.toFixed(2)} → ${upper.strike.toFixed(2)}`,
          legs: [buildLeg(lower), buildLeg(upper)],
          spot,
          quality,
        });
      }
    }
  }

  if (puts.length >= 2) {
    for (let i = 0; i < puts.length - 1; i++) {
      for (let j = i + 1; j < puts.length; j++) {
        const lower = puts[j];
        const upper = puts[i];
        scenarios.push({
          id: genId("ps"),
          name: "Put Spread",
          description: `Put ${upper.strike.toFixed(2)} → ${lower.strike.toFixed(2)}`,
          legs: [buildLeg(upper), buildLeg(lower)],
          spot,
          quality,
        });
      }
    }
  }

  if (calls.length >= 1 && puts.length >= 1) {
    const callAtm = calls.reduce((prev, curr) =>
      Math.abs(curr.strike - (spot ?? 0)) < Math.abs(prev.strike - (spot ?? 0)) ? curr : prev,
    );
    const putAtm = puts.reduce((prev, curr) =>
      Math.abs(curr.strike - (spot ?? 0)) < Math.abs(prev.strike - (spot ?? 0)) ? curr : prev,
    );

    scenarios.push({
      id: genId("str"),
      name: "Straddle",
      description: `ATM Straddle ${spot !== null ? spot.toFixed(2) : "—"}`,
      legs: [buildLeg(callAtm), buildLeg(putAtm)],
      spot,
      quality,
    });

    if (calls.length >= 2 && puts.length >= 2) {
      const callOtm = calls[calls.length - 1];
      const putOtm = puts[0];
      scenarios.push({
        id: genId("strg"),
        name: "Strangle",
        description: `OTM Strangle ${spot !== null ? spot.toFixed(2) : "—"}`,
        legs: [buildLeg(callOtm), buildLeg(putOtm)],
        spot,
        quality,
      });
    }
  }

  return scenarios;
}
