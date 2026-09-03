import type { DecisionScore } from "@/engines/decision-engine";

export function ScorePanel({ score }: { score: DecisionScore }) {
  const cor = score.score >= 85 ? "text-success" : score.score >= 40 ? "text-primary" : "text-loss";
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-baseline justify-between">
        <div className="text-xs uppercase text-muted-foreground">Decision Score</div>
        <div className={`font-mono text-2xl font-bold ${cor}`}>{score.score}</div>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-accent">
        <div
          className={`h-full rounded-full ${score.score >= 65 ? "bg-success" : score.score >= 40 ? "bg-primary" : "bg-loss"}`}
          style={{ width: `${score.score}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-snug text-muted-foreground">{score.leitura}</p>
      <ul className="mt-3 space-y-1 border-t border-border pt-2 text-xs">
        {score.itens.map((i) => (
          <li key={i.chave} className="flex items-center justify-between gap-2">
            <span className={i.ok ? "text-foreground" : "text-muted-foreground"}>{i.label}</span>
            <span className="font-mono text-muted-foreground">
              {i.pontos}/{i.max}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
        Esta nota mede o seu processo, não o seu lucro.
      </p>
    </div>
  );
}
