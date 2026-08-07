import { Check, X } from "lucide-react";
import type { QuizQuestion } from "@/lib/lessons";

type Props = {
  q: QuizQuestion;
  i: number;
  total: number;
  value?: number;
  revealed: boolean;
  onAnswer: (j: number) => void;
  onConfirm: () => void;
  onNext: () => void;
  isLast: boolean;
};

export function QuizCard({
  q,
  i,
  total,
  value,
  revealed,
  onAnswer,
  onConfirm,
  onNext,
  isLast,
}: Props) {
  const acertou = value === q.correta;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          Questão {i + 1} de {total}
        </span>
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: total }).map((_, j) => (
            <span
              key={j}
              className={`h-1.5 w-5 rounded-full ${j < i ? "bg-success" : j === i ? "bg-primary" : "bg-muted"}`}
            />
          ))}
        </div>
      </div>

      <h2 className="mt-4 text-xl font-semibold leading-snug md:text-2xl">{q.pergunta}</h2>

      <div className="mt-5 space-y-2">
        {q.alternativas.map((a, j) => {
          const chosen = value === j;
          const isRight = j === q.correta;
          const cls = revealed
            ? isRight
              ? "border-success bg-success/15"
              : chosen
                ? "border-loss bg-loss/15"
                : "border-border opacity-60"
            : chosen
              ? "border-primary bg-primary/10"
              : "border-border hover:bg-accent";
          return (
            <button
              key={j}
              disabled={revealed}
              onClick={() => onAnswer(j)}
              className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left text-[15px] transition-colors ${cls}`}
            >
              <span className="font-mono text-xs text-muted-foreground">
                {String.fromCharCode(65 + j)}
              </span>
              <span className="flex-1">{a}</span>
              {revealed && isRight && <Check size={16} className="text-success" />}
              {revealed && chosen && !isRight && <X size={16} className="text-loss" />}
            </button>
          );
        })}
      </div>

      {revealed ? (
        <div className="mt-4 space-y-3">
          <div
            className={`rounded-xl border p-4 text-sm ${acertou ? "border-success/50 bg-success/10" : "border-loss/50 bg-loss/10"}`}
          >
            <div className="font-semibold">
              {acertou ? "Isso aí." : "Ainda não — olha o porquê:"}
            </div>
            <p className="mt-1 text-muted-foreground">{q.explicacao}</p>
          </div>
          <button
            onClick={onNext}
            className="w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {isLast ? "Ver meu resultado" : "Próxima pergunta"}
          </button>
        </div>
      ) : (
        <button
          disabled={value === undefined}
          onClick={onConfirm}
          className="mt-4 w-full rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          Confirmar resposta
        </button>
      )}
    </div>
  );
}
