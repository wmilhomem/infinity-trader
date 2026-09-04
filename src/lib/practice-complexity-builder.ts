/**
 * Y.4.4.1 — Context Complexity Builder
 *
 * Composes a MarketContext according to a target PracticeComplexity level.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Does NOT recommend direction, structure, or any trading decision
 * - Does NOT evaluate the user's interpretation
 * - Only adjusts WHAT DATA IS AVAILABLE, not what it means
 *
 * This module transforms context composition, not user decisions.
 */

import type { MarketContext } from "@/lib/market-context";
import type { PracticeComplexity } from "@/lib/practice-complexity-types";

export type ComplexityBuildOptions = {
  targetComplexity: PracticeComplexity;
  baseContext: MarketContext;
};

function withQualitySuspicious<T extends { quality?: { quality: string } }>(obj: T): T {
  return {
    ...obj,
    quality: { quality: "suspicious" },
  };
}

export function buildContextByComplexity(
  base: MarketContext,
  target: PracticeComplexity,
): MarketContext {
  switch (target) {
    case "simple":
      return buildSimpleContext(base);
    case "composed":
      return buildComposedContext(base);
    case "conflict":
      return buildConflictContext(base);
    case "uncertainty":
      return buildUncertaintyContext(base);
    case "structure":
      return buildStructureContext(base);
    case "explanation":
      return buildExplanationContext(base);
    default:
      return base;
  }
}

function buildSimpleContext(base: MarketContext): MarketContext {
  return {
    ...base,
    optionsChain: base.optionsChain
      ? {
          ...base.optionsChain,
          contracts: base.optionsChain.contracts?.slice(0, 2),
          representation: undefined,
        }
      : undefined,
  };
}

function buildComposedContext(base: MarketContext): MarketContext {
  return {
    ...base,
    optionsChain: base.optionsChain
      ? {
          ...base.optionsChain,
          representation: base.optionsChain.representation ?? {
            type: "standard",
          },
        }
      : undefined,
  };
}

function buildConflictContext(base: MarketContext): MarketContext {
  if (!base.optionsChain) return base;

  const contracts = base.optionsChain.contracts ?? [];
  if (contracts.length < 2) return base;

  const callContracts = contracts.filter((c) => c.type === "call");
  const putContracts = contracts.filter((c) => c.type === "put");

  const conflictingContracts = [
    ...callContracts.slice(0, 1).map((c) => ({
      ...c,
      impliedVolatility: {
        ...c.impliedVolatility,
        provenance: {
          ...c.impliedVolatility.provenance,
          note: "elevated IV on call — bullish signal",
        },
      },
    })),
    ...putContracts.slice(0, 1).map((p) => ({
      ...p,
      impliedVolatility: {
        ...p.impliedVolatility,
        provenance: {
          ...p.impliedVolatility.provenance,
          note: "elevated IV on put — bearish signal",
        },
      },
    })),
  ];

  return {
    ...base,
    optionsChain: {
      ...base.optionsChain,
      contracts: conflictingContracts,
    },
  };
}

function buildUncertaintyContext(base: MarketContext): MarketContext {
  if (!base.optionsChain) return base;

  return {
    ...base,
    optionsChain: {
      ...base.optionsChain,
      atm: base.optionsChain.atm
        ? {
            ...base.optionsChain.atm,
            determinedAt: null,
          }
        : null,
      impliedVolatilityAtm: base.optionsChain.impliedVolatilityAtm
        ? {
            ...base.optionsChain.impliedVolatilityAtm,
            provenance: withQualitySuspicious(
              base.optionsChain.impliedVolatilityAtm.provenance as { quality?: string },
            ) as (typeof base.optionsChain.impliedVolatilityAtm)["provenance"],
          }
        : null,
      contracts: base.optionsChain.contracts?.map((c) => ({
        ...c,
        volume: null,
        openInterest: null,
      })),
    },
  };
}

function buildStructureContext(base: MarketContext): MarketContext {
  return base;
}

function buildExplanationContext(base: MarketContext): MarketContext {
  return {
    ...base,
    optionsChain: base.optionsChain
      ? {
          ...base.optionsChain,
          requiresExplanation: true,
        }
      : undefined,
  };
}

export function getComplexityDescription(target: PracticeComplexity): string {
  switch (target) {
    case "simple":
      return "Observação direta — uma ou duas variáveis.";
    case "composed":
      return "Integração — múltiplas variáveis que se reforçam.";
    case "conflict":
      return "Contraste — evidências em direções opostas.";
    case "uncertainty":
      return "Incerteza — dados incompletos ou suspeitos.";
    case "structure":
      return "Estrutura — comparação entre estruturas.";
    case "explanation":
      return "Explicação — justifique seu raciocínio.";
    default:
      return "";
  }
}
