import { Flag, Rocket } from "lucide-react";
import type { LessonMissao } from "@/lib/lessons";

type Props = {
  missao: LessonMissao;
  onPronto: () => void;
};

export function MissionCard({ missao, onPronto }: Props) {
  return (
    <div className="rounded-2xl border-2 border-primary/50 bg-primary/10 p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
        <Flag size={16} /> Missão
      </div>
      <h2 className="mt-4 text-2xl font-bold tracking-tight">{missao.titulo}</h2>
      <p className="mt-3 max-w-xl text-base leading-relaxed md:text-lg">{missao.texto}</p>
      <button
        onClick={onPronto}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Estou pronto — vamos ao quiz <Rocket size={16} />
      </button>
    </div>
  );
}
