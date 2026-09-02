/**
 * Y.2.4 — PROVIDER (ponto de entrada principal)
 *
 * Re-exporta o contrato público + adapter Yahoo.
 * BOUNDARY B3: substituir por B3SourceAdapter sem alterar consumidores.
 */

export type { MarketDataProvider, MarketDataPackage } from "./types";
export { YahooSourceAdapter } from "./yahoo-source-adapter";
