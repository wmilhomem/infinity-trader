import type { MarketContext } from "@/lib/market-context";
import { MarketDataQualityBadge } from "@/components/market/MarketDataQuality";
import { MarketProvenanceInfo } from "@/components/market/MarketProvenance";
import { History, ShieldAlert } from "lucide-react";

interface Props {
  context: MarketContext | null | undefined;
}

export function ReplayMarketContext({ context }: Props) {
  if (!context) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
        <p>Contexto de mercado canônico não registrado nesta decisão antiga.</p>
      </div>
    );
  }

  const q = context.quote;
  const ind = context.indicators;
  const vol = context.volatility;
  const rep = context.representation;

  return (
    <div className="rounded-lg border border-primary/30 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wide">
        <span className="flex items-center gap-1.5">
          <History size={14} /> Contexto Observado Naquele Instante
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {context.instrument.symbol}
        </span>
      </div>

      <div className="rounded bg-primary/10 border border-primary/20 p-2.5 text-[11px] text-muted-foreground leading-snug flex items-start gap-2">
        <ShieldAlert size={14} className="text-primary shrink-0 mt-0.5" />
        <span>
          Este contexto representa o que estava registrado no momento da decisão e não é atualizado
          com dados atuais.
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
        <div className="rounded border border-border/50 bg-background/50 p-2">
          <div className="text-[10px] text-muted-foreground font-sans uppercase">
            Preço registrado
          </div>
          <div className="font-bold text-foreground">
            {q?.last !== null && q?.last !== undefined
              ? `R$ ${q.last.toFixed(2)}`
              : "não registrado"}
          </div>
        </div>

        <div className="rounded border border-border/50 bg-background/50 p-2">
          <div className="text-[10px] text-muted-foreground font-sans uppercase">VWAP</div>
          <div className="font-bold text-foreground">
            {ind?.vwap !== null && ind?.vwap !== undefined
              ? `R$ ${ind.vwap.toFixed(2)}`
              : "não registrada"}
          </div>
        </div>

        <div className="rounded border border-border/50 bg-background/50 p-2">
          <div className="text-[10px] text-muted-foreground font-sans uppercase">IV ATM</div>
          <div className="font-bold text-foreground">
            {vol?.impliedVolatility !== null && vol?.impliedVolatility !== undefined
              ? `${vol.impliedVolatility.toFixed(1)}%`
              : "não registrada"}
          </div>
        </div>

        <div className="rounded border border-border/50 bg-background/50 p-2">
          <div className="text-[10px] text-muted-foreground font-sans uppercase">Representação</div>
          <div className="font-bold text-foreground capitalize">
            {rep?.type ?? "Candle"}
            {rep?.renko?.sequence ? ` (${rep.renko.sequence} blocos)` : ""}
          </div>
        </div>
      </div>

      <MarketProvenanceInfo provenance={context.provenance} />
    </div>
  );
}
