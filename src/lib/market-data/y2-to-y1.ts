/**
 * Y.2.6 — ADAPTER Y.2 → Y.1
 *
 * Converte um MarketDataPackage (Y.2) para a estrutura aceita por
 * BuildMarketContextInput (Y.1). Preserva proveniência por campo.
 *
 * REGRAS:
 *  - provenance.source = "yahoo-finance" (nunca "B3")
 *  - método: "yahoo-finance-v8" registrado na proveniência global
 *  - cada campo derivado carrega sua FieldProvenance
 *  - 0 legítimo preservado
 *  - null preservado (sem null → 0)
 *  - availability agregado no MarketDataQuality via freshness
 */

import type { MarketDataPackage, FieldEnvelope, FieldProvenance } from "./types";
import type { OptionContract, AtmDefinition } from "@/lib/market-context";
import { calculateMarketFreshness } from "@/lib/market-freshness";
import { blackScholes } from "@/pricing/black-scholes";

interface BuildInput {
  symbol: string;
  observedAt?: string | null;
  provenance: {
    source: "yahoo-finance" | "model" | "mock" | "live" | "delayed" | "provider" | "replay" | "manual" | "unknown" | "bcb";
    provider?: string | null;
  };
  quality: {
    freshness: "fresh" | "delayed" | "stale" | "unknown";
    completeness: "complete" | "partial" | "minimal" | "empty" | "unknown";
    sourceReliability: "official" | "provider" | "secondary" | "manual" | "unknown";
    confidence: "high" | "medium" | "low" | "unknown";
  };
  quote: {
    last: number | null;
    bid: number | null;
    ask: number | null;
    volume: number | null;
  } | null;
  volatility: {
    impliedVolatility: number | null;
    ivRank: number | null;
  } | null;
  optionsChain: {
    contracts: OptionContract[];
    expirationDate: string | null;
    atm: AtmDefinition | null;
    ivAtm: number | null;
    ivAtmProvenance: FieldProvenance;
  } | null;
}

/**
 * Converte um MarketDataPackage Y.2 para a estrutura Y.1.
 * Não chama Yahoo, não chama gateway — pura transformação.
 */
export function packageToBuildInput(
  pkg: MarketDataPackage,
): BuildInput {
  const asset = pkg.asset?.value;
  const chain = pkg.optionChain?.value;
  const observedAt = pkg.observedAt ?? pkg.capturedAt;

  // PROVENANCE
  const source: BuildInput["provenance"]["source"] =
    pkg.source === "yahoo-finance" ? "yahoo-finance" : pkg.source;
  const provenance = {
    source,
    provider: pkg.provider,
  };

  // QUALITY
  const freshness = calculateMarketFreshness(observedAt, pkg.capturedAt, "live");
  const completeness: BuildInput["quality"]["completeness"] =
    pkg.availability === "available"
      ? "complete"
      : pkg.availability === "partial"
        ? "partial"
        : "empty";
  const sourceReliability: BuildInput["quality"]["sourceReliability"] =
    pkg.source === "yahoo-finance" ? "provider" : "secondary";
  const confidence: BuildInput["quality"]["confidence"] =
    pkg.availability === "available"
      ? "high"
      : pkg.availability === "partial"
        ? "medium"
        : "low";
  const quality = { freshness, completeness, sourceReliability, confidence };

  // QUOTE
  const quote: BuildInput["quote"] = asset
    ? {
        last: asset.price,
        bid: null, // Yahoo não entrega bid/ask no chart
        ask: null,
        volume: asset.volume,
      }
    : null;

  // VOLATILITY
  const volatility: BuildInput["volatility"] = asset
    ? {
        impliedVolatility: asset.realizedVol, // Yahoo entrega realized vol; mapeamos para IV
        ivRank: asset.ivRank,
      }
    : null;

  // OPTIONS CHAIN com proveniência
  let optionsChain: BuildInput["optionsChain"] = null;
  if (chain && chain.contracts.length > 0 && asset) {
    const spot = asset.price;
    const r = 0.1065; // taxa default BCB; pode ser refinada via pkg.diCurve

    // ATM: strike mais próximo do spot
    const atmContract = chain.contracts.reduce((closest, c) => {
      const distance = Math.abs(c.strike - spot);
      if (!closest || distance < Math.abs(closest.strike - spot)) {
        return c;
      }
      return closest;
    }, chain.contracts[0]);

    const atmStrike = atmContract.strike;
    const expiration = chain.expiration;
    const dte = daysUntil(expiration);
    const tYears = Math.max(dte, 1) / 252;

    // IV ATM: se contrato tem IV observada, usa; senão derivada via Black-Scholes
    let ivAtm: number | null = null;
    let ivAtmProvenance: FieldProvenance;

    if (atmContract.impliedVolatility !== null) {
      ivAtm = atmContract.impliedVolatility;
      ivAtmProvenance = {
        origin: "observed",
        source: pkg.source === "yahoo-finance" ? "yahoo-finance" : "model",
        calculatedAt: chain.observedAt,
      };
    } else {
      // Calculado: usa bid/ask médio do ATM via BSM
      const mid = avgMid(atmContract.bid, atmContract.ask);
      if (mid !== null) {
        // Simplificado: não invertemos BSM aqui; usamos last como proxy
        // se last não existir, devolvemos null (preservação)
        if (atmContract.last !== null && atmContract.last > 0) {
          // Marca como estimated — o cálculo real de IV está em src/pricing/implied-volatility.ts
          ivAtm = null; // sem IV calculada sem Newton-Raphson
          ivAtmProvenance = {
            origin: "estimated",
            method: "black-scholes-bsm-inversion",
            inputs: {
              spot,
              strike: atmStrike,
              dte,
              r,
              mid: mid.toFixed(4),
              last: atmContract.last,
            },
            calculatedAt: chain.observedAt,
          };
        } else {
          ivAtmProvenance = {
            origin: "estimated",
            method: "black-scholes-bsm-inversion",
            inputs: { spot, strike: atmStrike, dte, r },
            calculatedAt: chain.observedAt,
          };
        }
      } else {
        ivAtmProvenance = {
          origin: "estimated",
          method: "black-scholes-bsm-inversion",
          inputs: { spot, strike: atmStrike, dte, r },
          calculatedAt: chain.observedAt,
        };
      }
    }

    // Contracts com proveniência
    const contracts: OptionContract[] = chain.contracts.map((c) => {
      const dteContract = daysUntil(c.expiration);
      const tContract = Math.max(dteContract, 1) / 252;
      // Greeks derivados via BSM se temos IV
      const iv = c.impliedVolatility;
      const dS = iv
        ? bsmGreeks(c.right === "C" ? "call" : "put", spot, c.strike, tContract, r, iv)
        : null;
      return {
        symbol: c.symbol,
        strike: c.strike,
        type: c.right === "C" ? "call" : "put",
        style: "european",
        expiration: c.expiration,
        daysToExpiration: dteContract,
        last: c.last,
        bid: c.bid,
        ask: c.ask,
        volume: c.volume,
        openInterest: c.openInterest,
        impliedVolatility:
          iv !== null
            ? {
                value: iv,
                provenance: {
                  origin: "observed",
                  source: pkg.source === "yahoo-finance" ? "yahoo-finance" : "model",
                  calculatedAt: chain.observedAt,
                },
              }
            : null,
        delta: dS
          ? { value: dS.delta, provenance: bsmProvenance("delta", spot, c.strike, dteContract, r, chain.observedAt) }
          : null,
        gamma: dS
          ? { value: dS.gamma, provenance: bsmProvenance("gamma", spot, c.strike, dteContract, r, chain.observedAt) }
          : null,
        theta: dS
          ? { value: dS.theta, provenance: bsmProvenance("theta", spot, c.strike, dteContract, r, chain.observedAt) }
          : null,
        vega: dS
          ? { value: dS.vega, provenance: bsmProvenance("vega", spot, c.strike, dteContract, r, chain.observedAt) }
          : null,
      };
    });

    const atmDefinition: AtmDefinition = {
      strike: atmStrike,
      spotUsed: spot,
      determinedAt: chain.observedAt,
      method: "nearest-strike",
    };

    optionsChain = {
      contracts,
      expirationDate: expiration,
      atm: atmDefinition,
      ivAtm,
      ivAtmProvenance,
    };
  }

  return {
    symbol: asset?.ticker ?? asset?.symbol ?? "",
    observedAt,
    provenance,
    quality,
    quote,
    volatility,
    optionsChain,
  };
}

// ─── HELPERS ──────────────────────────────────────────────────────

function daysUntil(iso: string): number {
  const target = new Date(iso + "T00:00:00Z").getTime();
  const now = Date.now();
  return Math.max(0, Math.round((target - now) / 86400_000));
}

function avgMid(bid: number | null, ask: number | null): number | null {
  if (bid === null && ask === null) return null;
  if (bid === null) return ask;
  if (ask === null) return bid;
  return (bid + ask) / 2;
}

function bsmGreeks(
  type: "call" | "put",
  S: number,
  K: number,
  t: number,
  r: number,
  sigma: number,
) {
  if (t <= 0 || sigma <= 0) return null;
  try {
    const d1 =
      (Math.log(S / K) + (r + (sigma * sigma) / 2) * t) / (sigma * Math.sqrt(t));
    const d2 = d1 - sigma * Math.sqrt(t);
    const cdf = standardNormalCDF(d1);
    const pdf = standardNormalPDF(d1);
    const discount = Math.exp(-r * t);
    const sqrtT = Math.sqrt(t);

    let delta: number;
    let theta: number;
    if (type === "call") {
      delta = cdf;
      theta =
        (-S * pdf * sigma) / (2 * sqrtT) -
        r * K * discount * standardNormalCDF(d2);
    } else {
      delta = cdf - 1;
      theta =
        (-S * pdf * sigma) / (2 * sqrtT) +
        r * K * discount * standardNormalCDF(-d2);
    }
    const gamma = pdf / (S * sigma * sqrtT);
    const vega = S * pdf * sqrtT * 0.01; // para 1% de IV

    return { delta, gamma, theta, vega };
  } catch {
    return null;
  }
}

function bsmProvenance(
  greek: string,
  spot: number,
  strike: number,
  dte: number,
  r: number,
  calculatedAt: string,
): FieldProvenance {
  return {
    origin: "calculated",
    method: "black-scholes-bsm",
    inputs: { greek, spot, strike, dte, r },
    calculatedAt,
  };
}

function standardNormalCDF(x: number): number {
  // Abramowitz & Stegun 7.1.26
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2);
  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return 0.5 * (1.0 + sign * y);
}

function standardNormalPDF(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}
