import type { SnapshotCognitivoView } from "@/engines/decision-memory-reader";
import { BrainCircuit, ShieldAlert } from "lucide-react";
import { FONTE_MERCADO_LABEL } from "@/lib/mercado-snapshot";

/**
 * Snapshot cognitivo — o "estado do trader" no instante da decisão,
 * reconstruído do decision_memory gravado pelo Eixo 4. Vale ouro
 * meses depois: confiança, theta, regras quebradas, capital em risco,
 * e agora o que o usuário via (mercado) e qual era sua exposição (carteira).
 */

function brl(v: number) {
  return `R$ ${v.toFixed(2)}`;
}

function horario(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fonteRotulo(fonte: string | null) {
  if (!fonte) return null;
  return FONTE_MERCADO_LABEL[fonte as keyof typeof FONTE_MERCADO_LABEL] ?? fonte;
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

      {snap.mercado && (
        <div className="mt-2 border-t border-border pt-2">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            O que você via
          </div>
          <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {snap.mercado.fonte && (
              <div className="col-span-2">
                <dt className="text-muted-foreground">Fonte</dt>
                <dd className="font-medium">{fonteRotulo(snap.mercado.fonte)}</dd>
              </div>
            )}
            {snap.mercado.spot !== null && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Spot</dt>
                <dd className="font-mono font-semibold">{brl(snap.mercado.spot)}</dd>
              </div>
            )}
            {snap.mercado.ivAtm !== null && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">IV ATM</dt>
                <dd className="font-mono font-semibold">{snap.mercado.ivAtm.toFixed(1)}%</dd>
              </div>
            )}
            {snap.mercado.ivRank !== null && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">IV rank</dt>
                <dd className="font-mono font-semibold">{snap.mercado.ivRank}%</dd>
              </div>
            )}
            {snap.mercado.liquidityScore && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Liquidez</dt>
                <dd className="font-medium capitalize">{snap.mercado.liquidityScore}</dd>
              </div>
            )}
            {horario(snap.mercado.observadoEm) && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Observado às</dt>
                <dd className="font-mono">{horario(snap.mercado.observadoEm)}</dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {snap.portfolio && (
        <div className="mt-2 border-t border-border pt-2">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            Sua exposição no momento (estimada)
          </div>
          <dl className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            {snap.portfolio.netDelta !== null && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delta líquido</dt>
                <dd className="font-mono font-semibold">{snap.portfolio.netDelta.toFixed(2)}</dd>
              </div>
            )}
            {snap.portfolio.netTheta !== null && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Theta/dia</dt>
                <dd className="font-mono font-semibold">{brl(snap.portfolio.netTheta)}</dd>
              </div>
            )}
            {snap.portfolio.netVega !== null && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Vega</dt>
                <dd className="font-mono font-semibold">{brl(snap.portfolio.netVega)}</dd>
              </div>
            )}
            {snap.portfolio.marginUtilized !== null && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Margem estimada</dt>
                <dd className="font-mono font-semibold">{brl(snap.portfolio.marginUtilized)}</dd>
              </div>
            )}
          </dl>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Estimado pelo modelo no momento da decisão — não é valor oficial de corretora.
          </p>
        </div>
      )}

      <p className="mt-2 border-t border-border pt-2 text-[11px] text-muted-foreground">
        {snap.cadeiaEvidencia
          ? "Esta decisão possui cadeia de evidência."
          : "A cadeia de evidência não foi registrada nesta decisão."}
      </p>
    </div>
  );
}
