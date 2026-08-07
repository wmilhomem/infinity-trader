import { TriangleAlert } from "lucide-react";

type Props = {
  titulo: string;
  texto: string;
};

export function WarningCard({ titulo, texto }: Props) {
  return (
    <div className="rounded-2xl border-2 border-loss/60 bg-loss/10 p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-loss">
        <TriangleAlert size={16} /> Erro clássico
      </div>
      <h2 className="mt-4 text-xl font-bold md:text-2xl">{titulo}</h2>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed md:text-base">{texto}</p>
    </div>
  );
}
