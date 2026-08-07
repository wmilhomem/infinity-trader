import { ArrowRight, Check, Clock, Target } from "lucide-react";
import type { Lesson } from "@/lib/lessons";
import type { LessonMeta } from "@/lib/lesson-meta";
import { LessonTimeline, type LessonTimelineStep } from "@/components/lessons/LessonTimeline";

type Props = {
  lesson: Lesson;
  meta: LessonMeta;
  total: number;
  tema: { accent: string; bg: string; border: string; nome: string };
  timeline: LessonTimelineStep[];
  onJump?: (index: number) => void;
  onComecar: () => void;
};

export function LessonHero({ lesson, meta, total, tema, timeline, onJump, onComecar }: Props) {
  const titulo = lesson.titulo.replace(/^Lição \d+ — /, "");
  const aprendizados = meta.resumoPontos ?? lesson.conceitos.map((c) => c.titulo);

  return (
    <div className="text-center">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest ${tema.border} ${tema.accent}`}
        >
          Nível {lesson.nivel} · {tema.nome}
        </span>
        <span className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Lição {lesson.ordem} de {total}
        </span>
      </div>

      <div
        className={`mx-auto mt-6 grid size-16 place-items-center rounded-2xl ${tema.bg} ${tema.accent}`}
      >
        <Target size={28} />
      </div>

      <h1 className="mt-5 text-3xl font-bold tracking-tight md:text-4xl">{titulo}</h1>
      <p className="mx-auto mt-3 max-w-lg text-base text-muted-foreground md:text-lg">
        {lesson.resumo}
      </p>

      <div className={`mt-8 rounded-2xl border p-6 text-left md:p-8 ${tema.border} ${tema.bg}`}>
        <div className={`text-[11px] font-semibold uppercase tracking-widest ${tema.accent}`}>
          O que você vai aprender
        </div>
        <ul className="mt-4 space-y-3">
          {aprendizados.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[15px]">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/20">
                <Check className="text-success" size={13} />
              </span>
              {p}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock size={14} /> Tempo médio: {meta.tempoMin} minutos
        </div>
      </div>

      <button
        onClick={onComecar}
        className="mt-6 inline-flex w-full max-w-md items-center justify-center gap-2 rounded-xl bg-primary px-6 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Começar <ArrowRight size={18} />
      </button>

      <LessonTimeline etapas={timeline} onJump={onJump} />
    </div>
  );
}
