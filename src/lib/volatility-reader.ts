/**
 * Y.3.2 — VOLATILITY READER
 *
 * Lê volatilidade do MarketContext Y.2 como fato.
 * NUNCA recalcula. Apenas extrai e expõe.
 * NUNCA transforma IV/Skew/ExpectedMove em previsão de direção.
 */

import type { MarketContext } from "@/lib/market-context";
import type { Quality } from "@/lib/options-chain-types";

export type IVFact = {
  label: string;
  value: number | null;
  valueFormatted: string;
  strike: number | null;
  origin: "observed" | "calculated" | "estimated";
  source: string | null;
  method: string | null;
  quality: Quality;
};

export type SkewFact = {
  putIvOtm: number | null;
  callIvOtm: number | null;
  slope: number | null;
  putStrike: number | null;
  callStrike: number | null;
  otmDistance: number | null;
  origin: "observed" | "calculated" | "estimated";
  quality: Quality;
};

export type ExpectedMoveFact = {
  sigma1Brl: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  ivUsed: number | null;
  spotUsed: number | null;
  dteUsed: number | null;
  dteBase: "calendar" | "trading" | null;
  formula: string | null;
  origin: "observed" | "calculated" | "estimated";
  quality: Quality;
};

export type VolatilityReading = {
  atmIv: IVFact | null;
  skew: SkewFact | null;
  expectedMove: ExpectedMoveFact | null;
  spot: number | null;
};

function pct(v: number | null): string {
  if (v === null) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function brl(v: number | null): string {
  if (v === null) return "—";
  return `R$ ${v.toFixed(2)}`;
}

function originOf(p: { origin: string }): "observed" | "calculated" | "estimated" {
  if (p.origin === "observed") return "observed";
  if (p.origin === "calculated") return "calculated";
  return "estimated";
}

function qualityOf(value: number | null, p: { origin: string }): Quality {
  if (value === null) return "absent";
  if (p.origin === "estimated") return "valid";
  if (value < 0.01 || value > 5) return "suspicious";
  return "valid";
}

export function buildVolatilityReading(ctx: MarketContext | null): VolatilityReading {
  if (!ctx) {
    return { atmIv: null, skew: null, expectedMove: null, spot: null };
  }

  const spot = ctx.quote?.last ?? null;
  const chain = ctx.optionsChain;

  const atmIv: IVFact | null =
    chain?.impliedVolatilityAtm?.value !== undefined && chain?.impliedVolatilityAtm?.value !== null
      ? {
          label: "ATM IV",
          value: chain.impliedVolatilityAtm.value,
          valueFormatted: pct(chain.impliedVolatilityAtm.value),
          strike: chain.impliedVolatilityAtm.atmStrikeUsed ?? null,
          origin: originOf(chain.impliedVolatilityAtm.provenance),
          source: chain.impliedVolatilityAtm.provenance.source ?? null,
          method: chain.impliedVolatilityAtm.provenance.method ?? null,
          quality: qualityOf(
            chain.impliedVolatilityAtm.value,
            chain.impliedVolatilityAtm.provenance,
          ),
        }
      : null;

  const skew: SkewFact | null = chain?.skew
    ? {
        putIvOtm: chain.skew.putIvOtm,
        callIvOtm: chain.skew.callIvOtm,
        slope: chain.skew.slope,
        putStrike: chain.skew.putStrikeUsed ?? null,
        callStrike: chain.skew.callStrikeUsed ?? null,
        otmDistance: chain.skew.otmDistanceUsed ?? null,
        origin: originOf(chain.skew.provenance),
        quality: qualityOf(chain.skew.slope, chain.skew.provenance),
      }
    : null;

  const expectedMove: ExpectedMoveFact | null = chain?.expectedMove
    ? {
        sigma1Brl: chain.expectedMove.sigma1Brl,
        lowerBound: chain.expectedMove.lowerBound1Sigma,
        upperBound: chain.expectedMove.upperBound1Sigma,
        ivUsed: chain.expectedMove.ivUsed ?? null,
        spotUsed: chain.expectedMove.spotUsed ?? null,
        dteUsed: chain.expectedMove.dteUsed ?? null,
        dteBase: chain.expectedMove.dteBase ?? null,
        formula: chain.expectedMove.formula ?? null,
        origin: originOf(chain.expectedMove.provenance),
        quality: qualityOf(chain.expectedMove.sigma1Brl, chain.expectedMove.provenance),
      }
    : null;

  return { atmIv, skew, expectedMove, spot };
}
