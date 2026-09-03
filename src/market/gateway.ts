/**
 * Market Gateway
 * Responsável exclusivo por realizar chamadas HTTP/Sockets externas.
 * Retorna os dados em estado bruto (raw), que serão limpos depois pelo Normalizer.
 */
export interface IMarketGateway {
  fetchAsset(ticker: string): Promise<any>;
  fetchOptionChain(underlying: string): Promise<any>;
  fetchDICurve(): Promise<any>;
  fetchCorporateEvents(ticker?: string): Promise<any>;
}

// Dummy/Mock Gateway inicial até a integração B3 real ser construída.
export class MockGateway implements IMarketGateway {
  async fetchAsset(ticker: string) {
    return { ticker, price: 38.5, lastUpdate: Date.now() };
  }

  async fetchOptionChain(underlying: string) {
    return {
      underlying,
      timestamp: Date.now(),
      contracts: [
        {
          symbol: `${underlying}K400`,
          strikePrice: 40.0,
          right: "C",
          ask: 1.2,
          bid: 1.1,
          expiration: "2026-10-15T00:00:00Z",
        },
      ],
    };
  }

  async fetchDICurve() {
    return [
      { days: 30, rate: 0.1065 },
      { days: 360, rate: 0.108 },
    ];
  }

  async fetchCorporateEvents(ticker?: string) {
    return [
      { ticker: ticker || "PETR4", type: "DIVIDEND", value: 0.5, exDate: "2026-09-01T00:00:00Z" },
    ];
  }
}
