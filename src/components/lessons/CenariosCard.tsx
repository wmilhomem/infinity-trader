import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { LessonCenario } from "@/lib/lessons";

type Props = {
  cenarios: LessonCenario[];
};

const TOM: Record<
  LessonCenario["tom"],
  { border: string; bg: string; text: string; icon: typeof TrendingDown }
> = {
  perda: {
    border: "border-loss/40",
    bg: "bg-loss/10",
    text: "text-loss",
    icon: TrendingDown,
  },
  neutro: {
    border: "border-chart-2/40",
    bg: "bg-chart-2/10",
    text: "text-chart-2",
    icon: Minus,
  },
  ganho: {
    border: "border-success/40",
    bg: "bg-success/10",
    text: "text-success",
    icon: TrendingUp,
  },
};

export function CenariosCard({ cenarios }: Props) {
  return (
    <section className="space-y-4">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Comportamento em cenários
        </div>
        <h2 className="mt-1 text-lg font-bold">O que acontece em cada cenário</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A estrutura não decide por você: ela define a distribuição de cada caminho.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {cenarios.map((c) => {
          const t = TOM[c.tom];
          const Icone = t.icon;
          return (
            <div key={c.titulo} className={`rounded-xl border ${t.border} ${t.bg} p-4`}>
              <div className={`flex items-center gap-2 text-sm font-semibold ${t.text}`}>
                <Icone size={15} /> {c.titulo}
              </div>
              <p className="mt-2 text-xs leading-relaxed text-foreground/85">{c.descricao}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
