import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BookOpen, PlayCircle, Scale, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import type { FichaEstrategia } from "@/lib/fichas-estrategias";
import { getLesson } from "@/lib/lessons";
import { cn } from "@/lib/utils";
import type { StatsFicha } from "@/components/laboratorio/FichaCard";

const NATUREZA_LABEL = {
  debito: "Débito",
  credito: "Crédito",
  mista: "Mista",
} as const;

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

type Linha = { rotulo: string; valor: (f: FichaEstrategia, s: StatsFicha) => ReactNode };

const LINHAS: Linha[] = [
  {
    rotulo: "Hipótese que expressa",
    valor: (f) => <span className="font-medium text-primary">{f.hipotese}</span>,
  },
  {
    rotulo: "Natureza",
    valor: (f) => NATUREZA_LABEL[f.natureza],
  },
  {
    rotulo: "Perda máxima (lote 100)",
    valor: (_f, s) => (
      <span className="font-mono text-loss">{brl(Math.abs(Math.min(0, s.perdaMax)))}</span>
    ),
  },
  {
    rotulo: "Lucro máximo (lote 100)",
    valor: (_f, s) => (
      <span className="font-mono text-success">
        {Number.isFinite(s.lucroMax) && s.lucroMax < 1e6
          ? brl(Math.max(0, s.lucroMax))
          : "Ilimitado"}
      </span>
    ),
  },
  {
    rotulo: "Breakevens",
    valor: (_f, s) => (
      <span className="font-mono">
        {s.breakevens.length ? s.breakevens.map((b) => brl(b)).join(" · ") : "—"}
      </span>
    ),
  },
  {
    rotulo: "Gregas dominantes",
    valor: (f) => (
      <ul className="space-y-1">
        {f.gregas.slice(0, 2).map((g) => (
          <li key={g} className="text-xs leading-snug text-foreground/80">
            {g}
          </li>
        ))}
      </ul>
    ),
  },
  {
    rotulo: "Perfil de risco",
    valor: (f) => <span className="text-xs leading-snug text-foreground/80">{f.perfilRisco}</span>,
  },
  {
    rotulo: "O que vigiar",
    valor: (f) => (
      <ul className="space-y-1">
        {f.alertas.slice(0, 2).map((a) => (
          <li key={a} className="text-xs leading-snug text-foreground/80">
            {a}
          </li>
        ))}
      </ul>
    ),
  },
];

export function CompararFichas({
  fichas,
  stats,
  aberta,
  onFechar,
  onAbrirFicha,
  onSimular,
}: {
  fichas: FichaEstrategia[];
  stats: Record<string, StatsFicha>;
  aberta: boolean;
  onFechar: () => void;
  onAbrirFicha: (id: string) => void;
  onSimular: (id: string) => void;
}) {
  return (
    <Sheet open={aberta} onOpenChange={(o) => !o && onFechar()}>
      <SheetContent side="right" className="w-full overflow-y-auto border-border sm:max-w-3xl">
        <SheetHeader className="flex-row items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="grid size-9 place-items-center rounded-lg bg-primary/20 text-primary">
              <Scale size={18} />
            </div>
            <SheetTitle className="text-lg font-bold">Comparação lado a lado</SheetTitle>
          </div>
          <SheetClose className="rounded-md p-1 text-muted-foreground hover:bg-accent">
            <X size={16} />
          </SheetClose>
        </SheetHeader>

        {fichas.length < 2 ? (
          <p className="text-sm text-muted-foreground">
            Selecione pelo menos 2 fichas para comparar.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-muted-foreground">
              A comparação organiza fatos — risco, retorno, breakevens e perfil de cada estrutura
              sobre o mesmo exemplo (lote 100, PETR4 R$ 38,00). Nenhuma coluna é recomendação: a
              escolha é sua.
            </p>

            <div
              className={cn(
                "grid gap-px overflow-hidden rounded-xl border border-border bg-border",
              )}
              style={{
                gridTemplateColumns: `minmax(130px, 0.8fr) repeat(${fichas.length}, minmax(0, 1fr))`,
              }}
            >
              <div className="bg-card p-3" />
              {fichas.map((f) => (
                <div key={f.id} className="bg-card p-3">
                  <div className="text-sm font-bold leading-tight">{f.nome}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      {f.hipotese}
                    </span>
                    <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {NATUREZA_LABEL[f.natureza]}
                    </span>
                  </div>
                </div>
              ))}

              {LINHAS.map((linha) => (
                <LinhaComparacao
                  key={linha.rotulo}
                  rotulo={linha.rotulo}
                  fichas={fichas}
                  stats={stats}
                  render={linha.valor}
                />
              ))}

              <div className="bg-card p-3" />
              {fichas.map((f) => {
                const licao = getLesson(f.licaoSlug);
                return (
                  <div key={f.id} className="space-y-2 bg-card p-3">
                    <button
                      onClick={() => onSimular(f.id)}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-2 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      <PlayCircle size={13} /> Simular
                    </button>
                    {licao && (
                      <Link
                        to="/licao/$slug"
                        params={{ slug: f.licaoSlug }}
                        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-2 py-2 text-xs font-semibold hover:bg-accent transition-colors"
                      >
                        <BookOpen size={13} /> Lição {licao.ordem}
                      </Link>
                    )}
                    <button
                      onClick={() => onAbrirFicha(f.id)}
                      className="w-full rounded-lg border border-border px-2 py-2 text-xs font-semibold hover:bg-accent transition-colors"
                    >
                      Abrir ficha
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function LinhaComparacao({
  rotulo,
  fichas,
  stats,
  render,
}: {
  rotulo: string;
  fichas: FichaEstrategia[];
  stats: Record<string, StatsFicha>;
  render: (f: FichaEstrategia, s: StatsFicha) => ReactNode;
}) {
  return (
    <>
      <div className="bg-card p-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {rotulo}
      </div>
      {fichas.map((f) => (
        <div key={f.id} className="bg-card p-3 text-sm">
          {render(f, stats[f.id])}
        </div>
      ))}
    </>
  );
}
