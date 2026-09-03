import type { MarketDataQuality, MarketDataSource } from "./market-context";

/**
 * POLÍTICA DE FONTES DE DADOS (MARKET SOURCE POLICY)
 *
 * Define a hierarquia de fontes de dados e mapeia a confiabilidade da fonte.
 * A prioridade nunca deve ser confundida com precisão absoluta; guarda-se
 * sempre a fonte efetivamente utilizada.
 */

export const SOURCE_PRIORITY_RANK: Record<MarketDataSource, number> = {
  live: 10,
  provider: 9,
  delayed: 7,
  replay: 6,
  manual: 5,
  model: 3,
  mock: 2,
  unknown: 0,
};

export function getSourceReliability(
  source: MarketDataSource,
): MarketDataQuality["sourceReliability"] {
  switch (source) {
    case "live":
      return "official";
    case "provider":
    case "delayed":
      return "provider";
    case "replay":
      return "secondary";
    case "manual":
      return "manual";
    case "model":
    case "mock":
    case "unknown":
    default:
      return "secondary";
  }
}

/**
 * Resolve conflito entre duas fontes distintas mantendo rastro explícito.
 */
export function resolveSourceCollision<T>(
  sourceA: { source: MarketDataSource; value: T },
  sourceB: { source: MarketDataSource; value: T },
): { chosen: { source: MarketDataSource; value: T }; hasCollision: boolean } {
  const rankA = SOURCE_PRIORITY_RANK[sourceA.source] ?? 0;
  const rankB = SOURCE_PRIORITY_RANK[sourceB.source] ?? 0;

  const hasCollision = sourceA.value !== sourceB.value;

  if (rankA >= rankB) {
    return { chosen: sourceA, hasCollision };
  } else {
    return { chosen: sourceB, hasCollision };
  }
}
