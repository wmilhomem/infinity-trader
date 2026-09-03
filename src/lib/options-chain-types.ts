/**
 * Y.3.0 — OPTIONS CHAIN READING TYPES
 *
 * Tipos para a experiência de leitura de cadeia de opções.
 * Separates fact from interpretation from hypothesis.
 */

import type { MarketContext } from "@/lib/market-context";
import type { FieldProvenance } from "@/lib/market-context";

export type Quality = "valid" | "suspicious" | "invalid" | "absent";

export type ProvenanceBadge = {
  origin: "observed" | "calculated" | "estimated";
  source?: string | null;
  method?: string | null;
  calculatedAt?: string | null;
};

export type FactType =
  | "spot"
  | "iv"
  | "ivRank"
  | "skew"
  | "expectedMove"
  | "dte"
  | "strike"
  | "bid"
  | "ask"
  | "volume"
  | "openInterest"
  | "delta"
  | "gamma"
  | "theta"
  | "vega"
  | "other";

export interface Fact {
  id: string;
  tipo: FactType;
  rotulo: string;
  valor: string;
  valorBruto: number | null;
  provenance: ProvenanceBadge;
  quality: Quality;
  reasons?: string[];
}

export interface Interpretation {
  id: string;
  texto: string;
  fatosReferenciados: string[];
  createdAt: string;
}

export interface Hypothesis {
  id: string;
  texto: string;
  interpretaçãoId: string;
  createdAt: string;
}

export interface Evidence {
  id: string;
  tipo: "evidencia" | "contraEvidencia";
  texto: string;
  hipóteseId: string;
  createdAt: string;
}

export type ChainReadingState = {
  facts: Fact[];
  interpretations: Interpretation[];
  hypotheses: Hypothesis[];
  evidences: Evidence[];
};

export function formatProvenance(p: ProvenanceBadge): string {
  const origin =
    p.origin === "observed" ? "Observado" : p.origin === "calculated" ? "Calculado" : "Estimado";
  if (p.method) return `${origin} · ${p.method}`;
  if (p.source) return `${origin} · ${p.source}`;
  return origin;
}

export function originLabel(origin: ProvenanceBadge["origin"]): string {
  return origin === "observed" ? "Observado" : origin === "calculated" ? "Calculado" : "Estimado";
}

export function qualityLabel(quality: Quality): { text: string; class: string } {
  switch (quality) {
    case "valid":
      return { text: "Válido", class: "text-success" };
    case "suspicious":
      return { text: "Suspeito", class: "text-warning" };
    case "invalid":
      return { text: "Inválido", class: "text-loss" };
    case "absent":
      return { text: "Ausente", class: "text-muted-foreground" };
  }
}
