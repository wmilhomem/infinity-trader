import { ArrowDown, ArrowUp, FlaskConical, MoveRight, RefreshCw, Waves } from "lucide-react";
import type { HipoteseEstrategia } from "@/lib/presets-estrategias";
import { cn } from "@/lib/utils";

export type FiltroHipotese = HipoteseEstrategia | "todas";

const MAPA: {
  id: FiltroHipotese;
  nome: string;
  desc: string;
  icone: typeof ArrowUp;
  classe: string;
}[] = [
  {
    id: "todas",
    nome: "Todas as fichas",
    desc: "O laboratório inteiro, sem filtro de hipótese.",
    icone: FlaskConical,
    classe: "hover:border-primary/60 hover:bg-primary/5",
  },
  {
    id: "alta",
    nome: "Hipótese de alta",
    desc: "Você acredita que o preço sobe dentro do prazo.",
    icone: ArrowUp,
    classe: "hover:border-success/60 hover:bg-success/5",
  },
  {
    id: "baixa",
    nome: "Hipótese de baixa",
    desc: "Você acredita que o preço cai — ou precisa se proteger de uma queda.",
    icone: ArrowDown,
    classe: "hover:border-loss/60 hover:bg-loss/5",
  },
  {
    id: "lateral",
    nome: "Hipótese lateral",
    desc: "Você acredita que o preço fica dentro de um corredor.",
    icone: MoveRight,
    classe: "hover:border-chart-2/60 hover:bg-chart-2/5",
  },
  {
    id: "volatilidade",
    nome: "Hipótese de movimento",
    desc: "Você acredita em onda forte, sem saber para qual lado.",
    icone: Waves,
    classe: "hover:border-primary/60 hover:bg-primary/5",
  },
  {
    id: "gestao",
    nome: "Gestão",
    desc: "Você já tem estrutura e precisa decidir o que fazer com ela.",
    icone: RefreshCw,
    classe: "hover:border-border hover:bg-accent",
  },
];

export function HipoteseMap({
  selecionada,
  contagens,
  onChange,
}: {
  selecionada: FiltroHipotese;
  contagens: Record<string, number>;
  onChange: (h: FiltroHipotese) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {MAPA.map((m) => {
        const Icone = m.icone;
        const ativa = selecionada === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onChange(m.id)}
            className={cn(
              "flex flex-col gap-1 rounded-xl border border-border bg-card p-3 text-left transition-colors",
              m.classe,
              ativa && "border-primary bg-primary/10",
            )}
          >
            <div className="flex items-center justify-between">
              <Icone size={16} className="text-muted-foreground" />
              <span className="rounded-full bg-accent px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                {contagens[m.id] ?? 0}
              </span>
            </div>
            <div className="text-xs font-semibold leading-tight">{m.nome}</div>
            <div className="text-[11px] leading-snug text-muted-foreground">{m.desc}</div>
          </button>
        );
      })}
    </div>
  );
}
