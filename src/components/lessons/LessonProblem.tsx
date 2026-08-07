import { HelpCircle } from "lucide-react";
import type { LessonProblema } from "@/lib/lessons";

export function LessonProblem({ problema }: { problema: LessonProblema }) {
  return (
    <div className="rounded-2xl border-2 border-primary/50 bg-primary/10 p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
        <HelpCircle size={16} /> Comece pelo problema
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">{problema.titulo}</h2>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground/90 md:text-lg">
        {problema.texto}
      </p>
      <div className="mt-6 rounded-xl border border-primary/40 bg-card p-5">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Sua pergunta
        </div>
        <p className="mt-2 text-lg font-semibold leading-snug">{problema.pergunta}</p>
      </div>
    </div>
  );
}
