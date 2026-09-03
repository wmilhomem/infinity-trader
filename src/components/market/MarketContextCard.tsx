import type { MarketContext } from "@/lib/market-context";
import { deriveMarketObservations, type MarketObservation } from "@/lib/market-observations";
import { MarketDataQualityBadge } from "./MarketDataQuality";
import { MarketProvenanceInfo } from "./MarketProvenance";
import { MarketEventsCard } from "./MarketEventsCard";
import { MarketFactChip } from "./MarketFactChip";
import { Activity, BarChart2, Eye, HelpCircle } from "lucide-react";

interface Props {
  context: MarketContext;
  onUseFact?: (
    factText: string,
    usage: "evidencia" | "contraevidencia" | "contexto" | "irrelevante",
  ) => void;
}

function fmtCurrency(val?: number | null): string {
  if (val === undefined || val === null) return "Não observado";
  return `R$ ${val.toFixed(2)}`;
}

function fmtPct(val?: number | null): string {
  if (val === undefined || val === null) return "Não observada";
  return `${val.toFixed(1)}%`;
}

export function MarketContextCard({ context, onUseFact }: Props) {
  const obs = deriveMarketObservations(context);

  const q = context.quote;
  const ind = context.indicators;
  const vol = context.volatility;
  const liq = context.liquidity;
  const rep = context.representation;

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-sm">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-foreground">
              {context.instrument.symbol}
            </span>
            <span className="rounded bg-accent px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {context.instrument.market ?? "B3"}
            </span>
          </div>
          <div className="text-xs text-muted-foreground font-semibold tracking-wide uppercase mt-0.5">
            Contexto de Mercado Observado
          </div>
        </div>
        <MarketDataQualityBadge quality={context.quality} />
      </div>

      {/* Blocos de Dados Técnicos Observados */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {/* Preço */}
        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
          <div className="text-[11px] uppercase text-muted-foreground font-medium">
            Preço observado
          </div>
          <div className="font-mono text-base font-bold text-foreground mt-0.5">
            {fmtCurrency(q?.last)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            Abertura: {fmtCurrency(q?.open)}
          </div>
        </div>

        {/* Indicadores / VWAP */}
        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
          <div className="text-[11px] uppercase text-muted-foreground font-medium">VWAP</div>
          <div className="font-mono text-base font-bold text-foreground mt-0.5">
            {fmtCurrency(ind?.vwap)}
          </div>
          {ind?.movingAverages && ind.movingAverages.length > 0 && (
            <div className="text-[10px] text-muted-foreground mt-1 font-mono">
              {ind.movingAverages
                .map((m) => `M${m.period}: ${m.value !== null ? m.value.toFixed(2) : "-"}`)
                .join(" · ")}
            </div>
          )}
        </div>

        {/* Volatilidade */}
        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
          <div className="text-[11px] uppercase text-muted-foreground font-medium">
            Volatilidade (IV)
          </div>
          <div className="font-mono text-base font-bold text-foreground mt-0.5">
            {fmtPct(vol?.impliedVolatility)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 font-mono">
            {vol?.ivRank !== null && vol?.ivRank !== undefined
              ? `IV Rank: percentil ${vol.ivRank}%`
              : "IV Rank não observado"}
          </div>
        </div>

        {/* Representação / Liquidez */}
        <div className="rounded-lg border border-border/50 bg-background/50 p-3">
          <div className="text-[11px] uppercase text-muted-foreground font-medium">
            Representação
          </div>
          <div className="font-mono text-sm font-semibold text-foreground mt-0.5 capitalize">
            {rep?.type ?? "Candle"}
            {rep?.renko?.blockSize ? ` (${rep.renko.blockSize}pt)` : ""}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {q?.bid !== null && q?.ask !== null && q?.bid !== undefined && q?.ask !== undefined
              ? `Bid ${q.bid.toFixed(2)} / Ask ${q.ask.toFixed(2)}`
              : "Book não observado"}
          </div>
        </div>
      </div>

      {/* Observações Verificáveis (Fatos) com Chips Interativos */}
      {obs.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-primary">
            <span className="flex items-center gap-1.5">
              <Eye size={14} /> Fatos Observados (Verificáveis)
            </span>
            <span className="text-[11px] font-normal text-muted-foreground">
              Clique em um fato para usá-lo na análise
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {obs.map((o) => (
              <MarketFactChip key={o.id} observation={o} onUseFact={onUseFact} />
            ))}
          </div>
        </div>
      )}

      {/* Eventos se existirem */}
      <MarketEventsCard title="Eventos e Inteligência do Mercado" events={context.events} />

      {/* Proveniência */}
      <MarketProvenanceInfo provenance={context.provenance} />
    </div>
  );
}
