import { Check, ClipboardCheck } from "lucide-react";

type Props = {
  titulo: string;
  passos: string[];
};

export function DecisionCard({ titulo, passos }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-primary">
        <ClipboardCheck size={16} /> Na prática · como decidir
      </div>
      <h2 className="mt-4 text-xl font-bold tracking-tight md:text-2xl">{titulo}</h2>
      <ul className="mt-5 space-y-3">
        {passos.map((p) => (
          <li
            key={p}
            className="flex items-start gap-3 rounded-xl border border-border bg-background/60 p-4 text-[15px]"
          >
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-success/20">
              <Check className="text-success" size={13} />
            </span>
            {p}
          </li>
        ))}
      </ul>
      <p className="mt-5 text-sm text-muted-foreground">
        Essas respostas viram as suas <strong>Regras</strong> no Zero ao Trade — registre antes de
        operar.
      </p>
    </div>
  );
}
