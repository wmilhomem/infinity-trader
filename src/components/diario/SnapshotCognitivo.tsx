import type { SnapshotCognitivoView } from "@/engines/decision-memory-reader";
import { BrainCircuit, ShieldAlert } from "lucide-react";

/**
 * Snapshot cognitivo — o "estado do trader" no instante da decisão,
 * reconstruído do decision_memory gravado pelo Eixo 4. Vale ouro
 * meses depois: confiança, theta, regras quebradas, capital em risco.
 */

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

export function SnapshotCognitivo({ snap }: { snap: SnapshotCognitivoView }) {
  return (
    <div className="mt-2 rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <BrainCircuit size={12} className="text-primary" /> Como você decidiu
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {snap.score !== null && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Processo</dt>
            <dd className="font-mono font-semibold">{snap.score}/100</dd>
          </div>
        )}
        {snap.regrasQuebradas > 0 && (
          <div className="flex justify-between">
            <dt className="flex items-center gap-1 text-loss">
              <ShieldAlert size={11} /> Regras quebradas
            </dt>
            <dd className="font-mono font-semibold text-loss">{snap.regrasQuebradas}</dd>
          </div>
        )}
        {snap.regrasQuebradas === 0 && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Regras quebradas</dt>
            <dd className="font-mono font-semibold text-success">0</dd>
          </div>
        )}
        {snap.capitalEmRisco !== null && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Capital em risco</dt>
            <dd className="font-mono font-semibold">{brl(snap.capitalEmRisco)}</dd>
          </div>
        )}
        {snap.ivRank !== null && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">IV Rank</dt>
            <dd className="font-mono font-semibold">{snap.ivRank}</dd>
          </div>
        )}
        {snap.ivAtm !== null && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">IV ATM</dt>
            <dd className="font-mono font-semibold">{snap.ivAtm.toFixed(1)}%</dd>
          </div>
        )}
        {snap.emocao && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Estado</dt>
            <dd className="font-medium">{snap.emocao}</dd>
          </div>
        )}
        {snap.representacao && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Lente do movimento</dt>
            <dd className="font-medium">
              {snap.representacao === "renko"
                ? `Renko${snap.brickSize !== null ? ` · bloco ${brl(snap.brickSize)}` : ""}`
                : "Candle"}
            </dd>
          </div>
        )}
        {snap.resultado !== null && (
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Resultado</dt>
            <dd
              className={`font-mono font-semibold ${snap.resultado >= 0 ? "text-success" : "text-loss"}`}
            >
              {brl(snap.resultado)}
            </dd>
          </div>
        )}
      </dl>
      {snap.padroes.length > 0 && (
        <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
          Viés no momento: {snap.padroes.join(" · ")}
        </p>
      )}
      <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
        {snap.cadeiaEvidencia
          ? "Esta decisão possui cadeia de evidência."
          : "A cadeia de evidência não foi registrada nesta decisão."}
      </p>
    </div>
  );
}
