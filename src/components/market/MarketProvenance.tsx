import type { MarketDataProvenance } from "@/lib/market-context";
import { Database, CalendarClock } from "lucide-react";

interface Props {
  provenance: MarketDataProvenance;
}

const SOURCE_LABEL: Record<string, string> = {
  mock: "Ambiente didático (sandbox)",
  live: "Book ao vivo (B3)",
  delayed: "Cotações diferidas / 15 min",
  provider: "Provedor de mercado",
  model: "Dado calculado / modelo Black-Scholes",
  replay: "Recuperado de snapshot histórico",
  manual: "Entrada manual",
  unknown: "Não informada",
};

export function MarketProvenanceInfo({ provenance }: Props) {
  const label = SOURCE_LABEL[provenance.source] ?? SOURCE_LABEL.unknown;
  const timeStr = provenance.observedAt
    ? new Date(provenance.observedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Não observado";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-[11px] text-muted-foreground">
      <span className="flex items-center gap-1">
        <Database size={11} className="text-primary" /> Fonte:{" "}
        <strong className="font-normal text-foreground">{label}</strong>
        {provenance.provider ? ` (${provenance.provider})` : ""}
      </span>
      <span className="flex items-center gap-1 font-mono">
        <CalendarClock size={11} /> Observado às {timeStr}
      </span>
    </div>
  );
}
