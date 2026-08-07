import { Clock } from "lucide-react";

type Props = {
  nivel: number;
  nivelNome: string;
  ordem: number;
  total: number;
  posInNivel: number;
  totalInNivel: number;
  pct: number;
  etapa: string;
  tempoMin: number;
};

export function LessonProgress({
  nivel,
  nivelNome,
  ordem,
  total,
  posInNivel,
  totalInNivel,
  pct,
  etapa,
  tempoMin,
}: Props) {
  const boxes = 10;
  const filled = Math.max(1, Math.round((posInNivel / totalInNivel) * boxes));

  return (
    <div className="sticky top-0 z-20 -mx-1 mb-6 bg-background/90 px-1 pb-3 pt-1 backdrop-blur">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-widest text-primary">
            Nível {nivel} · {nivelNome}
          </span>
          <span className="hidden gap-[3px] sm:flex" aria-hidden>
            {Array.from({ length: boxes }).map((_, i) => (
              <span
                key={i}
                className={`h-2.5 w-1.5 rounded-[2px] ${i < filled ? "bg-primary" : "bg-muted"}`}
              />
            ))}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Lição {ordem} de {total}
          </span>
          <span className="hidden items-center gap-1 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground md:flex">
            <Clock size={12} /> {tempoMin} min
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">{etapa}</span>
      </div>
    </div>
  );
}
