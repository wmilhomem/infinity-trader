import ReactMarkdown from "react-markdown";
import type { LessonConceito } from "@/lib/lessons";

type Props = {
  conceito: LessonConceito;
  i: number;
  total: number;
};

export function ConceptCard({ conceito, i, total }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Conceito {i + 1} de {total}
        </span>
      </div>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">{conceito.titulo}</h2>
      <div className="mt-4 max-w-xl">
        <article className="prose prose-invert max-w-none prose-headings:font-semibold prose-p:text-[16px] prose-p:leading-relaxed prose-li:text-[16px] prose-strong:text-foreground prose-table:text-sm prose-table:overflow-hidden">
          <ReactMarkdown>{conceito.corpo}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
