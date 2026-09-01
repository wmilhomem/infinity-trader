import type { MarketContextEvent } from "@/lib/market-context";
import { Calendar, AlertCircle } from "lucide-react";

interface Props {
  title?: string;
  events?: MarketContextEvent[];
}

export function MarketEventsCard({ title = "Eventos Observados", events }: Props) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground font-semibold">
        <Calendar size={14} className="text-primary" /> {title}
      </div>
      <div className="space-y-2">
        {events.map((evt, idx) => (
          <div key={evt.id ?? idx} className="rounded-md border border-border/60 bg-muted/20 p-2.5 text-xs">
            <div className="flex items-center justify-between font-medium text-foreground">
              <span>{evt.title}</span>
              {evt.category && (
                <span className="rounded bg-accent px-1.5 py-0.5 text-[10px] uppercase font-mono text-muted-foreground">
                  {evt.category}
                </span>
              )}
            </div>
            {evt.description && (
              <p className="mt-1 text-muted-foreground leading-relaxed text-[11px]">
                {evt.description}
              </p>
            )}
            <div className="mt-1.5 flex flex-wrap items-center justify-between text-[10px] text-muted-foreground">
              {evt.publishedAt && <span>Publicado: {new Date(evt.publishedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>}
              {evt.source && <span>Fonte: {evt.source}</span>}
              {evt.relevance && (
                <span className="flex items-center gap-1">
                  <AlertCircle size={10} /> Relevância contextual: {evt.relevance}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground italic leading-tight">
        Eventos trazem contexto ao mercado observado. Nenhum evento gera automaticamente interpretação direcional.
      </p>
    </div>
  );
}
