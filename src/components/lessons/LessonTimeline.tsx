import { Map } from "lucide-react";

export type LessonTimelineStep = {
  rotulo: string;
  done: boolean;
  atual: boolean;
};

type Props = {
  etapas: LessonTimelineStep[];
  onJump?: (index: number) => void;
};

export function LessonTimeline({ etapas, onJump }: Props) {
  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Map size={14} /> O caminho desta lição
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {etapas.map((e, i) => (
          <button
            key={e.rotulo}
            onClick={() => onJump?.(i)}
            disabled={!e.done && !e.atual}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              e.atual
                ? "border-primary bg-primary/10 text-primary"
                : e.done
                  ? "border-success/40 bg-success/10 text-success"
                  : "cursor-default border-border text-muted-foreground/50"
            }`}
          >
            {e.done && !e.atual ? <span className="size-1 rounded-full bg-success" /> : null}
            {e.atual ? <span className="size-1 rounded-full bg-primary" /> : null}
            {e.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}
