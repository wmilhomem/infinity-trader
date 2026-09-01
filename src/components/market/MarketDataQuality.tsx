import type { MarketDataQuality } from "@/lib/market-context";
import { ShieldCheck, Clock, Layers } from "lucide-react";

interface Props {
  quality: MarketDataQuality;
}

const FRESHNESS_LABEL: Record<MarketDataQuality["freshness"], { text: string; class: string }> = {
  fresh: { text: "Atualizado", class: "bg-success/15 text-success border-success/30" },
  delayed: { text: "Atrasado (15 min)", class: "bg-warning/15 text-warning border-warning/30" },
  stale: { text: "Desatualizado", class: "bg-loss/15 text-loss border-loss/30" },
  unknown: { text: "Não verificado", class: "bg-muted text-muted-foreground border-border" },
};

const COMPLETENESS_LABEL: Record<MarketDataQuality["completeness"], string> = {
  complete: "Completo",
  partial: "Parcial",
  minimal: "Mínimo",
  unknown: "Não verificado",
};

const RELIABILITY_LABEL: Record<MarketDataQuality["sourceReliability"], string> = {
  official: "Fonte oficial",
  provider: "Provider (Provedor de mercado)",
  secondary: "Fonte secundária",
  manual: "Manual",
  unknown: "Não informada",
};

export function MarketDataQualityBadge({ quality }: Props) {
  const fresh = FRESHNESS_LABEL[quality.freshness] ?? FRESHNESS_LABEL.unknown;

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium ${fresh.class}`}>
        <Clock size={12} /> {fresh.text}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-muted-foreground">
        <Layers size={12} /> Dados: {COMPLETENESS_LABEL[quality.completeness]}
      </span>
      <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-0.5 text-muted-foreground">
        <ShieldCheck size={12} /> {RELIABILITY_LABEL[quality.sourceReliability]}
      </span>
    </div>
  );
}
