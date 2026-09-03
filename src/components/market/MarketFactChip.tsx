import { useState } from "react";
import type { MarketObservation } from "@/lib/market-observations";
import { Plus, Check, HelpCircle } from "lucide-react";

interface Props {
  observation: MarketObservation;
  onUseFact?: (
    factText: string,
    usage: "evidencia" | "contraevidencia" | "contexto" | "irrelevante",
  ) => void;
}

export function MarketFactChip({ observation, onUseFact }: Props) {
  const [open, setOpen] = useState(false);
  const [selectedUsage, setSelectedUsage] = useState<string | null>(null);

  function handleSelect(usage: "evidencia" | "contraevidencia" | "contexto" | "irrelevante") {
    setSelectedUsage(usage);
    if (onUseFact) {
      onUseFact(observation.fact, usage);
    }
    setOpen(false);
  }

  return (
    <div className="relative inline-block m-1">
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-all ${
          selectedUsage
            ? "border-primary bg-primary/20 text-primary font-medium"
            : "border-border bg-card text-foreground hover:border-primary/50 hover:bg-accent"
        }`}
      >
        <span className="font-mono text-[11px]">{observation.fact}</span>
        {selectedUsage ? (
          <Check size={12} className="text-primary" />
        ) : (
          <Plus size={12} className="text-muted-foreground" />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 w-64 rounded-lg border border-border bg-popover p-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground mb-2">
            <span>Usar na minha análise</span>
            <button
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground text-[10px]"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug mb-2.5">
            Como &quot;{observation.fact}&quot; entra na sua hipótese?
          </p>
          <div className="space-y-1.5">
            <button
              onClick={() => handleSelect("evidencia")}
              className="w-full text-left rounded-md px-2.5 py-1.5 text-xs border border-success/30 bg-success/10 text-success hover:bg-success/20 transition-colors flex items-center justify-between"
            >
              <span>Evidência a favor</span>
              <span className="text-[10px]">Sustenta</span>
            </button>
            <button
              onClick={() => handleSelect("contraevidencia")}
              className="w-full text-left rounded-md px-2.5 py-1.5 text-xs border border-loss/30 bg-loss/10 text-loss hover:bg-loss/20 transition-colors flex items-center justify-between"
            >
              <span>Contraevidência</span>
              <span className="text-[10px]">Enfraquece</span>
            </button>
            <button
              onClick={() => handleSelect("contexto")}
              className="w-full text-left rounded-md px-2.5 py-1.5 text-xs border border-border bg-accent/40 text-foreground hover:bg-accent transition-colors flex items-center justify-between"
            >
              <span>Apenas contexto</span>
              <span className="text-[10px]">Informativo</span>
            </button>
            <button
              onClick={() => handleSelect("irrelevante")}
              className="w-full text-left rounded-md px-2.5 py-1.5 text-xs border border-transparent text-muted-foreground hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span>Não é relevante</span>
              <span className="text-[10px]">Descartar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
