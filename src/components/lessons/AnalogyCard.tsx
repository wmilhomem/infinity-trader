import { Lightbulb } from "lucide-react";

export function AnalogyCard({ texto }: { texto: string }) {
  return (
    <div className="rounded-2xl border-2 border-chart-2/50 bg-chart-2/10 p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-chart-2">
        <Lightbulb size={16} /> A grande ideia
      </div>
      <p className="mt-5 max-w-xl text-xl leading-relaxed md:text-2xl">{texto}</p>
    </div>
  );
}
