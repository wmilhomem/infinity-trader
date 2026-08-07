import { ArrowLeft, ArrowRight, Pause } from "lucide-react";

type Props = {
  onVoltar: () => void;
  onProximo: () => void;
  onPausar: () => void;
  rotulo: string;
  proximoLabel?: string;
  proximoDisabled?: boolean;
  voltarDisabled?: boolean;
};

export function LessonNavigator({
  onVoltar,
  onProximo,
  onPausar,
  rotulo,
  proximoLabel = "Próximo",
  proximoDisabled = false,
  voltarDisabled = false,
}: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:pl-64">
      <div className="mx-auto flex max-w-2xl items-center gap-2 md:gap-3">
        <button
          onClick={onVoltar}
          disabled={voltarDisabled}
          className="rounded-lg border border-border p-3 text-muted-foreground transition-colors hover:bg-accent disabled:opacity-30"
          aria-label="Voltar"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="min-w-0 flex-1 truncate text-center text-xs font-medium text-muted-foreground md:text-sm">
          {rotulo}
        </span>
        <button
          onClick={onPausar}
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-accent sm:flex"
        >
          <Pause size={13} /> Continuar depois
        </button>
        <button
          onClick={onProximo}
          disabled={proximoDisabled}
          className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 md:flex-1"
        >
          {proximoLabel} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
