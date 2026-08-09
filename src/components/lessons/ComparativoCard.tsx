import { Scale } from "lucide-react";
import type { LessonComparativo } from "@/lib/lessons";

type Props = {
  comparativo: LessonComparativo;
};

export function ComparativoCard({ comparativo }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Scale size={14} /> Comparar estruturas
      </div>
      <h2 className="text-lg font-bold">{comparativo.titulo}</h2>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-border bg-accent/50">
              {comparativo.colunas.map((c, i) => (
                <th
                  key={i}
                  className={`px-4 py-2.5 text-left font-semibold ${i === 0 ? "w-44" : ""}`}
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparativo.linhas.map((linha) => (
              <tr key={linha.item} className="border-b border-border last:border-0">
                <td className="px-4 py-2.5 font-medium text-muted-foreground">{linha.item}</td>
                {linha.valores.map((v, j) => (
                  <td key={j} className="px-4 py-2.5 text-foreground/90">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
