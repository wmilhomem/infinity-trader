import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, ChevronDown, Clock } from "lucide-react";
import { getLessonMeta } from "@/lib/lesson-meta";
import { nivelLabel, type Lesson } from "@/lib/lessons";
import { FOCO_INFO, type FocoFuturos } from "@/lib/foco";

type Props = {
  indice: number;
  nome: string;
  desc: string;
  lições: Lesson[];
  done: Set<string>;
  foco?: FocoFuturos;
  abertoInicial?: boolean;
};

export function TemaAccordion({
  indice,
  nome,
  desc,
  lições,
  done,
  foco,
  abertoInicial = false,
}: Props) {
  const [aberto, setAberto] = useState(abertoInicial);
  const concluidas = lições.filter((l) => done.has(l.slug)).length;

  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-border bg-card">
      <button
        onClick={() => setAberto((a) => !a)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50"
      >
        <div className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/20 font-mono text-sm font-bold text-primary">
          {indice}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold">{nome}</h2>
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {concluidas}/{lições.length} concluídas
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground">{desc}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden h-1.5 w-24 overflow-hidden rounded-full bg-muted sm:block">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(concluidas / lições.length) * 100}%` }}
            />
          </div>
          <ChevronDown
            size={18}
            className={`text-muted-foreground transition-transform ${aberto ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {aberto && (
        <div className="grid gap-2 border-t border-border p-4">
          {lições.map((l) => {
            const isDone = done.has(l.slug);
            const meta = getLessonMeta(l.slug);
            return (
              <Link
                key={l.slug}
                to="/licao/$slug"
                params={{ slug: l.slug }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/60"
              >
                <div
                  className={`grid size-8 shrink-0 place-items-center rounded-full ${isDone ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
                >
                  {isDone ? <Check size={16} /> : <span className="text-sm">{l.ordem}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{l.titulo}</div>
                  <div className="truncate text-xs text-muted-foreground">{l.resumo}</div>
                </div>
                <span className="hidden shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground md:inline">
                  {nivelLabel(l.nivel)}
                </span>
                {l.instrumento && (
                  <span
                    className={`hidden shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold sm:inline ${
                      l.instrumento === foco
                        ? "border-primary/60 bg-primary/10 text-primary"
                        : "border-border bg-muted text-muted-foreground"
                    }`}
                  >
                    {FOCO_INFO[l.instrumento].curto}
                  </span>
                )}
                <div className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:flex">
                  <Clock size={12} /> {meta.tempoMin} min
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
