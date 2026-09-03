import { createContext, useContext, useMemo, ReactNode } from "react";
import { MarketCache } from "./cache";
import { MockGateway } from "./gateway";
import type { Asset, OptionChain, YieldCurve, CorporateEvent } from "./types";

const defaultGateway = new MockGateway();
const defaultCache = new MarketCache(defaultGateway);

type MarketContextType = {
  getAsset: (ticker: string) => Promise<Asset>;
  getOptionChain: (underlying: string) => Promise<OptionChain>;
  getDICurve: () => Promise<YieldCurve>;
  getCorporateEvents: (ticker: string) => Promise<CorporateEvent[]>;
};

const MarketContext = createContext<MarketContextType | null>(null);

/**
 * Market Context
 * Provê à aplicação frontend a porta de entrada imaculada aos dados de mercado.
 * Nenhuma UI entra em contato com Gateway ou API bruta. Tudo trafega pelo Context.
 */
export function MarketProvider({
  children,
  cache = defaultCache,
}: {
  children: ReactNode;
  cache?: MarketCache;
}) {
  const value = useMemo<MarketContextType>(
    () => ({
      getAsset: (t: string) => cache.getAsset(t),
      getOptionChain: (u: string) => cache.getOptionChain(u),
      getDICurve: () => cache.getDICurve(),
      getCorporateEvents: (t: string) => cache.getCorporateEvents(t),
    }),
    [cache],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarketData() {
  const ctx = useContext(MarketContext);
  if (!ctx) throw new Error("useMarketData deve ser usado dentro de um MarketProvider");
  return ctx;
}
