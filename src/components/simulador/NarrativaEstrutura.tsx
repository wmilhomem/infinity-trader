import type { PassoNarrativa } from "@/engines/narrator";
import { BookOpen } from "lucide-react";

/**
 * Narrativa da estrutura — o simulador contando a história que ele mesmo
 * está montando. Cada passo chega pronto do Narrator Engine (via Bus);
 * este componente só renderiza a conversa, em ordem, destacando o último.
 */

const TOM_CLASSE: Record<PassoNarrativa["tom"], string> = {
  info: "border-border bg-background",
  bom: "border-success/40 bg-success/5",
  atencao: "border-loss/40 bg-loss/5",
};

const TOM_MARCA: Record<PassoNarrativa["tom"], string> = {
  info: "bg-muted-foreground",
  bom: "bg-success",
  atencao: "bg-loss",
};

const MAX_PASSOS = 6;

export function NarrativaEstrutura({ passos }: { passos: PassoNarrativa[] }) {
  if (passos.length === 0) return null;
  const visiveis = passos.slice(-MAX_PASSOS);
  const ultimo = visiveis.length - 1;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <BookOpen size={14} className="text-primary" /> O que está acontecendo
      </div>
      <div className="mt-4 space-y-3">
        {visiveis.map((passo, i) => (
          <div
            key={`${passo.titulo}-${i}`}
            className={`rounded-xl border p-4 transition-all ${
              i === ultimo ? TOM_CLASSE[passo.tom] : "border-border bg-background/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`size-1.5 shrink-0 rounded-full ${TOM_MARCA[passo.tom]}`} />
              <div className="text-sm font-semibold">{passo.titulo}</div>
            </div>
            <div className="mt-2 space-y-2">
              {passo.linhas.map((l, li) => (
                <p
                  key={li}
                  className={`text-sm leading-relaxed ${
                    i === ultimo ? "text-muted-foreground" : "text-muted-foreground/70"
                  }`}
                >
                  {l}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">
        Cada mudança na estrutura é explicada na hora. O copilot não decide por você — ele te mantém
        sabendo o que cada clique fez.
      </p>
    </div>
  );
}
