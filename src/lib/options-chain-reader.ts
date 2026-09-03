/**
 * Y.3.0 — OPTIONS CHAIN READER
 *
 * Consome MarketContext (Y.2) e produz Facts estruturados com provenance.
 * NUNCA transforma fato em recomendação.
 */

import type { MarketContext } from "@/lib/market-context";
import type { FieldProvenance } from "@/lib/market-context";
import type {
  Fact,
  ProvenanceBadge,
  Quality,
  ChainReadingState,
  FactType,
} from "./options-chain-types";

let _idCounter = 0;
function genId(prefix: string): string {
  return `${prefix}-${++_idCounter}-${Date.now()}`;
}

function provenanceToBadge(p: FieldProvenance): ProvenanceBadge {
  return {
    origin: p.origin,
    source: p.source,
    method: p.method,
    calculatedAt: p.calculatedAt,
  };
}

function fieldQualityToQuality(q: string | undefined): Quality {
  if (q === "suspicious") return "suspicious";
  if (q === "invalid") return "invalid";
  if (q === "absent") return "absent";
  return "valid";
}

function formatTimestamp(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return "—";
  }
}

function buildSpotFacts(ctx: MarketContext): Fact[] {
  const facts: Fact[] = [];
  const q = ctx.quote;
  const prov = ctx.provenance;

  if (q?.last !== null && q?.last !== undefined) {
    facts.push({
      id: genId("fact"),
      tipo: "spot",
      rotulo: "Spot",
      valor: `R$ ${q.last.toFixed(2)}`,
      valorBruto: q.last,
      provenance: {
        origin: prov.source === "live" ? "observed" : "observed",
        source: prov.source,
        calculatedAt: ctx.timestamp,
      },
      quality: "valid",
    });
  }

  return facts;
}

function buildVolatilityFacts(ctx: MarketContext): Fact[] {
  const facts: Fact[] = [];
  const chain = ctx.optionsChain;

  if (chain?.impliedVolatilityAtm) {
    const iv = chain.impliedVolatilityAtm;
    facts.push({
      id: genId("fact"),
      tipo: "iv",
      rotulo: "ATM IV",
      valor: iv.value !== null ? `${(iv.value * 100).toFixed(1)}%` : "—",
      valorBruto: iv.value !== null ? iv.value * 100 : null,
      provenance: provenanceToBadge(iv.provenance),
      quality: fieldQualityToQuality(iv.value === null ? "absent" : undefined),
    });
  }

  if (chain?.skew) {
    const skew = chain.skew;
    facts.push({
      id: genId("fact"),
      tipo: "skew",
      rotulo: "Skew (put - call)",
      valor: skew.slope !== null ? `${skew.slope.toFixed(2)} pts` : "—",
      valorBruto: skew.slope,
      provenance: provenanceToBadge(skew.provenance),
      quality: fieldQualityToQuality(skew.slope === null ? "absent" : undefined),
    });
  }

  if (chain?.expectedMove) {
    const em = chain.expectedMove;
    const label = em.sigma1Brl !== null ? `±R$ ${em.sigma1Brl.toFixed(2)}` : "—";
    facts.push({
      id: genId("fact"),
      tipo: "expectedMove",
      rotulo: "Expected Move (±1σ)",
      valor: label,
      valorBruto: em.sigma1Brl,
      provenance: provenanceToBadge(em.provenance),
      quality: fieldQualityToQuality(em.sigma1Brl === null ? "absent" : undefined),
    });
  }

  return facts;
}

function buildChainFacts(ctx: MarketContext): Fact[] {
  const facts: Fact[] = [];
  const chain = ctx.optionsChain;

  if (!chain?.contracts || chain.contracts.length === 0) return facts;

  const atm = chain.atm?.strike;
  const spot = ctx.quote?.last ?? 0;

  for (const c of chain.contracts) {
    const moneyness = c.strike < atm! ? "OTM" : c.strike > atm! ? "ITM" : "ATM";
    const prefix = c.type === "call" ? "call" : "put";

    if (c.bid !== undefined && c.bid !== null) {
      facts.push({
        id: genId("fact"),
        tipo: "bid",
        rotulo: `${prefix.toUpperCase()} ${c.strike} bid`,
        valor: c.bid > 0 ? `R$ ${c.bid.toFixed(4)}` : "R$ 0,00",
        valorBruto: c.bid,
        provenance: { origin: "observed", source: "yahoo-finance" },
        quality: c.bid === 0 ? "suspicious" : "valid",
        reasons: c.bid === 0 ? ["zero-price"] : [],
      });
    }

    if (c.ask !== undefined && c.ask !== null) {
      facts.push({
        id: genId("fact"),
        tipo: "ask",
        rotulo: `${prefix.toUpperCase()} ${c.strike} ask`,
        valor: c.ask > 0 ? `R$ ${c.ask.toFixed(4)}` : "R$ 0,00",
        valorBruto: c.ask,
        provenance: { origin: "observed", source: "yahoo-finance" },
        quality: c.ask === 0 ? "suspicious" : "valid",
        reasons: c.ask === 0 ? ["zero-price"] : [],
      });
    }

    if (c.impliedVolatility) {
      const iv = c.impliedVolatility;
      facts.push({
        id: genId("fact"),
        tipo: "iv",
        rotulo: `${prefix.toUpperCase()} ${c.strike} IV`,
        valor: iv.value !== null ? `${(iv.value * 100).toFixed(1)}%` : "—",
        valorBruto: iv.value !== null ? iv.value * 100 : null,
        provenance: provenanceToBadge(iv.provenance),
        quality: fieldQualityToQuality(iv.value === null ? "absent" : undefined),
      });
    }

    if (c.volume !== undefined && c.volume !== null) {
      facts.push({
        id: genId("fact"),
        tipo: "volume",
        rotulo: `${prefix.toUpperCase()} ${c.strike} volume`,
        valor: c.volume > 0 ? c.volume.toLocaleString("pt-BR") : "0",
        valorBruto: c.volume,
        provenance: { origin: "observed", source: "yahoo-finance" },
        quality: "valid",
      });
    }

    if (c.openInterest !== undefined && c.openInterest !== null) {
      facts.push({
        id: genId("fact"),
        tipo: "openInterest",
        rotulo: `${prefix.toUpperCase()} ${c.strike} OI`,
        valor: c.openInterest > 0 ? c.openInterest.toLocaleString("pt-BR") : "0",
        valorBruto: c.openInterest,
        provenance: { origin: "observed", source: "yahoo-finance" },
        quality: "valid",
      });
    }

    if (c.delta) {
      facts.push({
        id: genId("fact"),
        tipo: "delta",
        rotulo: `${prefix.toUpperCase()} ${c.strike} Δ`,
        valor: c.delta.value !== null ? c.delta.value.toFixed(3) : "—",
        valorBruto: c.delta.value,
        provenance: provenanceToBadge(c.delta.provenance),
        quality: fieldQualityToQuality(c.delta.value === null ? "absent" : undefined),
      });
    }
  }

  return facts;
}

export function buildFactsFromMarketContext(ctx: MarketContext | null): Fact[] {
  if (!ctx) return [];
  return [...buildSpotFacts(ctx), ...buildVolatilityFacts(ctx), ...buildChainFacts(ctx)];
}

export function buildInitialState(): ChainReadingState {
  return {
    facts: [],
    interpretations: [],
    hypotheses: [],
    evidences: [],
  };
}

export function addInterpretation(
  state: ChainReadingState,
  texto: string,
  fatosReferenciados: string[],
): ChainReadingState {
  const interp: Interpretation = {
    id: genId("interp"),
    texto,
    fatosReferenciados,
    createdAt: new Date().toISOString(),
  };
  return {
    ...state,
    interpretations: [...state.interpretations, interp],
  };
}

export function addHypothesis(
  state: ChainReadingState,
  texto: string,
  interpretaçãoId: string,
): ChainReadingState {
  const hyp: Hypothesis = {
    id: genId("hyp"),
    texto,
    interpretaçãoId,
    createdAt: new Date().toISOString(),
  };
  return {
    ...state,
    hypotheses: [...state.hypotheses, hyp],
  };
}

export function addEvidence(
  state: ChainReadingState,
  tipo: "evidencia" | "contraEvidencia",
  texto: string,
  hipóteseId: string,
): ChainReadingState {
  const ev: Evidence = {
    id: genId("ev"),
    tipo,
    texto,
    hipóteseId,
    createdAt: new Date().toISOString(),
  };
  return {
    ...state,
    evidences: [...state.evidences, ev],
  };
}

export function removeInterpretation(state: ChainReadingState, id: string): ChainReadingState {
  const affectedHypIds = state.hypotheses.filter((h) => h.interpretaçãoId === id).map((h) => h.id);
  return {
    ...state,
    interpretations: state.interpretations.filter((i) => i.id !== id),
    hypotheses: state.hypotheses.filter((h) => h.interpretaçãoId !== id),
    evidences: state.evidences.filter((e) => !affectedHypIds.includes(e.hipóteseId)),
  };
}
