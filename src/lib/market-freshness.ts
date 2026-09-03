import type { MarketDataQuality, MarketDataSource } from "./market-context";

/**
 * Avalia a temporalidade (freshness) de um dado observado.
 *
 * Regras:
 * - Se observedAt não for informado: "unknown"
 * - Para dados "delayed" por natureza (ex: cotações 15min atrasadas): "delayed"
 * - Para dados de mercado em tempo real:
 *   - < 2 minutos: "fresh"
 *   - 2 a 15 minutos: "delayed"
 *   - > 15 minutos: "stale"
 * - Para notícias e eventos macro: janela maior (ex: até 24h = "fresh")
 */

export function calculateMarketFreshness(
  observedAt?: string | null,
  currentTimeInput?: Date | string | null,
  sourceType: MarketDataSource = "unknown",
  isEvent: boolean = false,
): MarketDataQuality["freshness"] {
  if (!observedAt) return "unknown";

  if (sourceType === "delayed") return "delayed";

  const obsDate = new Date(observedAt);
  if (isNaN(obsDate.getTime())) return "unknown";

  const refDate = currentTimeInput ? new Date(currentTimeInput) : new Date();
  const diffMs = refDate.getTime() - obsDate.getTime();
  if (diffMs < 0) return "fresh"; // relógio ligeiramente desfasado

  const diffSec = diffMs / 1000;

  if (isEvent) {
    // Para notícias / macro
    if (diffSec <= 86400) return "fresh"; // até 24h
    if (diffSec <= 86400 * 7) return "delayed"; // até 7 dias
    return "stale";
  }

  // Para cotações / indicadores
  if (diffSec <= 120) return "fresh"; // até 2 min
  if (diffSec <= 900) return "delayed"; // 2 a 15 min
  return "stale";
}
