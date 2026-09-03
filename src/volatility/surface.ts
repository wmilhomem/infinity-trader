import type { TermStructureState, SkewState } from "./types";

/**
 * Term Structure (Estrutura Termo)
 * Backwardation indica que o risco primário está imediato (pânico de curto prazo),
 * superando o risco do tempo infinito normal do mercado.
 */
export function analyzeTermStructure(frontIV: number, backIV: number): TermStructureState {
  const diff = frontIV - backIV;
  // Threshold de 2 pts genérico, refinar conforme ativo se necessário.
  if (diff > 2) return "backwardation";
  if (diff < -2) return "contango";
  return "flat";
}

/**
 * Volatility Skew e Smile
 * Avalia a diferença de prêmio pago por proteção de queda (Puts) vs especulação de alta (Calls).
 * Na B3/Ações, um put_heavy moderado é normal. Valores agudos indicam medo desproporcional.
 */
export function analyzeSkew(putIV: number, callIV: number, atmIV: number): SkewState {
  const diff = putIV - callIV;
  // Limites puramente em Vol pts para o MVP.
  if (diff > 3) return "put_heavy";
  if (diff < -1.5) return "call_heavy";
  return "balanced";
}
