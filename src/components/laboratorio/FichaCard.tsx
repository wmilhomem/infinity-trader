import { BookOpen, FlaskConical } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { FichaEstrategia } from "@/lib/fichas-estrategias";
import { getLesson } from "@/lib/lessons";
import { cn } from "@/lib/utils";

export type StatsFicha = { lucroMax: number; perdaMax: number; breakevens: number[] };

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

const NATUREZA_LABEL = {
  debito: "Débito",
  credito: "Crédito",
  mista: "Mista",
} as const;

export function FichaCard({
  ficha,
  stats,
  onAbrir,
  onSimular,
}: {
  ficha: FichaEstrategia;
  stats: StatsFicha;
  onAbrir: () => void;
  onSimular: () => void;
}) {
  const licao = getLesson(ficha.licaoSlug);
  const risco = Math.abs(Math.min(0, stats.perdaMax));
  const lucroTeto =
    Number.isFinite(stats.lucroMax) && stats.lucroMax < 1e6
      ? brl(Math.max(0, stats.lucroMax))
      : "Ilimitado";
  const breakeven = stats.breakevens.length ? stats.breakevens.map((b) => brl(b)).join(" · ") : "—";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/50">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold leading-tight">{ficha.nome}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{ficha.resumo}</p>
        </div>
        <FlaskConical size={16} className="mt-0.5 shrink-0 text-primary" />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
          {NATUREZA_LABEL[ficha.natureza]}
        </span>
        <span className="rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[10px] text-primary">
          {ficha.hipotese}
        </span>
        {licao && (
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            Lição {licao.ordem}
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-accent/40 p-3">
        <div>
          <div className="text-[10px] text-muted-foreground">Perda máx</div>
          <div className="font-mono text-xs font-semibold text-loss">{brl(risco)}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">Lucro máx</div>
          <div className="font-mono text-xs font-semibold text-success">{lucroTeto}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">Breakeven</div>
          <div className="font-mono text-xs font-semibold">{breakeven}</div>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-foreground/80">{ficha.expressa}</p>

      <div className="mt-auto flex flex-wrap items-center gap-2">
        <button
          onClick={onAbrir}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent transition-colors"
        >
          Abrir ficha
        </button>
        {licao && (
          <Link
            to="/licao/$slug"
            params={{ slug: ficha.licaoSlug }}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-accent transition-colors"
          >
            <BookOpen size={13} /> Lição
          </Link>
        )}
        <button
          onClick={onSimular}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
            "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          Simular
        </button>
      </div>
    </div>
  );
}
