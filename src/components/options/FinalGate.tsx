/**
 * Y.3.9 — FINAL ANTI-RECOMMENDATION GATE
 *
 * Appears before any "save" or "confirm" action.
 * Explicitly declares that NO recommendation was made.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * This component IS the anti-recommendation declaration.
 * It explicitly states: "I presented facts. I made no recommendation. You are responsible."
 */

import { AlertTriangle } from "lucide-react";

interface Props {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function FinalGate({ onConfirm, onCancel, isLoading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-xl border border-warning/30 bg-card p-6 shadow-2xl">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
          <div>
            <h2 className="text-base font-semibold text-foreground">Confirmação Final</h2>
            <p className="text-xs text-muted-foreground mt-1">Revise antes de salvar</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <p className="text-muted-foreground">
            Este sistema <strong className="text-foreground">apresentou fatos</strong> — não fez{" "}
            <strong className="text-foreground">nenhuma recomendação</strong>.
          </p>

          <ul className="space-y-1.5 text-xs text-muted-foreground list-disc pl-4">
            <li>O sistema não sugeriu compra ou venda</li>
            <li>O sistema não avaliou se uma estratégia é "melhor"</li>
            <li>O sistema não afirmou que sua hipótese está "correta"</li>
            <li>Todas as decisões são exclusivamente suas</li>
          </ul>

          <div className="rounded-md border border-loss/20 bg-loss/5 p-3">
            <p className="text-xs text-loss font-medium">
              Você é totalmente responsável por qualquer decisão tomada com base nestas informações.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 rounded-md border border-border bg-card py-2.5 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50"
          >
            Voltar e Revisar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 rounded-md bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Entendi — Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
