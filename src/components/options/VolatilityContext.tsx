/**
 * Y.3.2 — VOLATILITY CONTEXT COMPONENT
 *
 * Experience: read IV / Skew / Expected Move as facts.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Shows volatility context, NOT prediction
 * - No "IV high → buy", "skew → direction", "expected move → target"
 * - ConceptNote explains what each metric does NOT mean
 */

import { useMemo } from "react";
import type { MarketContext } from "@/lib/market-context";
import { buildVolatilityReading, type VolatilityReading } from "@/lib/volatility-reader";
import { qualityLabel } from "@/lib/options-chain-types";
import { TrendingUp, Minus, Info, AlertTriangle } from "lucide-react";

interface Props {
  context: MarketContext | null;
}

function ProvenanceLabel({
  reading,
}: {
  reading:
    VolatilityReading["atmIv"] | VolatilityReading["skew"] | VolatilityReading["expectedMove"];
}) {
  if (!reading) return null;
  const originText =
    reading.origin === "observed"
      ? "Observado"
      : reading.origin === "calculated"
        ? "Calculado"
        : "Estimado";
  const source = reading.origin === "observed" ? "Yahoo Finance" : null;
  return (
    <span className="text-[10px] text-muted-foreground">
      {originText}
      {source && ` · ${source}`}
      {reading.origin === "calculated" &&
        reading.origin !== "estimated" &&
        ` · ${(reading as any).method ?? ""}`}
    </span>
  );
}

function QualityBadge({ quality }: { quality: string }) {
  const ql = qualityLabel(quality as any);
  if (quality === "valid") return null;
  return (
    <span className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] ${ql.class}`}>
      <AlertTriangle size={9} />
      {ql.text}
    </span>
  );
}

function IvBlock({ atmIv, spot }: { atmIv: VolatilityReading["atmIv"]; spot: number | null }) {
  if (!atmIv) {
    return (
      <div className="rounded-md border border-border bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Volatilidade Implícita
        </div>
        <div className="text-sm text-muted-foreground">IV ATM não disponível.</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Volatilidade Implícita
        </span>
        <QualityBadge quality={atmIv.quality} />
      </div>

      <div className="flex items-end gap-3">
        <div>
          <div className="font-mono text-3xl font-bold text-foreground">{atmIv.valueFormatted}</div>
          <div className="text-[10px] text-muted-foreground mt-0.5">ATM IV</div>
        </div>
        {atmIv.strike !== null && (
          <div className="border-l border-border pl-3">
            <div className="font-mono text-lg font-semibold text-foreground">
              {atmIv.strike.toFixed(2)}
            </div>
            <div className="text-[10px] text-muted-foreground">strike ATM</div>
          </div>
        )}
      </div>

      {spot !== null && (
        <div className="pt-1 border-t border-border">
          <div className="text-[10px] text-muted-foreground">
            Spot: <span className="font-mono text-foreground">R$ {spot.toFixed(2)}</span>
          </div>
        </div>
      )}

      <ProvenanceLabel reading={atmIv} />
    </div>
  );
}

function SkewBlock({ skew }: { skew: VolatilityReading["skew"] }) {
  if (!skew) {
    return (
      <div className="rounded-md border border-border bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Skew
        </div>
        <div className="text-sm text-muted-foreground">Skew não disponível.</div>
      </div>
    );
  }

  const slopeSign = skew.slope !== null ? (skew.slope >= 0 ? "+" : "") : null;

  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Skew
        </span>
        <QualityBadge quality={skew.quality} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="font-mono text-xl font-bold text-foreground">
            {skew.putIvOtm !== null ? `${(skew.putIvOtm * 100).toFixed(1)}%` : "—"}
          </div>
          <div className="text-[10px] text-muted-foreground">Put OTM</div>
          {skew.putStrike !== null && (
            <div className="text-[9px] text-muted-foreground font-mono">
              strike {skew.putStrike.toFixed(2)}
            </div>
          )}
        </div>
        <div>
          <div className="font-mono text-xl font-bold text-foreground">
            {skew.callIvOtm !== null ? `${(skew.callIvOtm * 100).toFixed(1)}%` : "—"}
          </div>
          <div className="text-[10px] text-muted-foreground">Call OTM</div>
          {skew.callStrike !== null && (
            <div className="text-[9px] text-muted-foreground font-mono">
              strike {skew.callStrike.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {skew.slope !== null && (
        <div className="rounded bg-muted/50 p-2 flex items-center gap-2">
          <Minus size={12} className="text-muted-foreground shrink-0" />
          <div className="flex-1">
            <span className="font-mono text-sm font-bold text-foreground">
              {slopeSign}
              {skew.slope.toFixed(2)} pts
            </span>
            <div className="text-[9px] text-muted-foreground">IV Put OTM − IV Call OTM</div>
          </div>
        </div>
      )}

      {skew.otmDistance !== null && (
        <div className="text-[9px] text-muted-foreground">
          Distância OTM: {(skew.otmDistance * 100).toFixed(1)}%
        </div>
      )}

      <ProvenanceLabel reading={skew} />
    </div>
  );
}

function ExpectedMoveBlock({
  em,
  spot,
}: {
  em: VolatilityReading["expectedMove"];
  spot: number | null;
}) {
  if (!em) {
    return (
      <div className="rounded-md border border-border bg-card p-4">
        <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
          Expected Move
        </div>
        <div className="text-sm text-muted-foreground">Expected Move não disponível.</div>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Expected Move · 1σ
        </span>
        <QualityBadge quality={em.quality} />
      </div>

      <div className="text-center">
        {spot !== null && (
          <div className="font-mono text-lg font-bold text-foreground">R$ {spot.toFixed(2)}</div>
        )}
        {em.sigma1Brl !== null && (
          <div className="font-mono text-2xl font-bold text-primary">
            ± R$ {em.sigma1Brl.toFixed(2)}
          </div>
        )}
      </div>

      {em.lowerBound !== null && em.upperBound !== null && (
        <div className="rounded bg-muted/50 p-3 space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Inferior (1σ)</span>
            <span className="font-mono font-semibold text-foreground">
              R$ {em.lowerBound.toFixed(2)}
            </span>
          </div>
          <div className="relative h-3 rounded bg-border overflow-hidden">
            <div className="absolute inset-y-0 left-1/2 w-px bg-primary" />
            <div className="absolute inset-y-0 right-0 bg-success/20" />
            <div className="absolute inset-y-0 left-0 bg-loss/20" />
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center">
              <div className="h-3 w-px bg-primary" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted-foreground">Superior (1σ)</span>
            <span className="font-mono font-semibold text-foreground">
              R$ {em.upperBound.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {(em.ivUsed !== null || em.dteUsed !== null || em.dteBase !== null) && (
        <div className="border-t border-border pt-2 space-y-0.5">
          <div className="text-[9px] text-muted-foreground font-semibold uppercase">Inputs</div>
          {em.ivUsed !== null && (
            <div className="text-[10px] text-muted-foreground">
              IV: <span className="font-mono text-foreground">{(em.ivUsed * 100).toFixed(1)}%</span>
            </div>
          )}
          {em.dteUsed !== null && (
            <div className="text-[10px] text-muted-foreground">
              DTE: <span className="font-mono text-foreground">{em.dteUsed} dias</span>
              {em.dteBase && <span className="text-muted-foreground/60"> ({em.dteBase})</span>}
            </div>
          )}
        </div>
      )}

      {em.formula && <div className="text-[9px] text-muted-foreground italic">{em.formula}</div>}

      <ProvenanceLabel reading={em} />
    </div>
  );
}

function ConceptNote() {
  return (
    <div className="flex items-start gap-2 rounded border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
      <Info size={13} className="mt-0.5 shrink-0 text-info" />
      <p>
        <strong className="text-foreground">IV</strong> descreve volatilidade implícita — o que o
        mercado precifica em termos de amplitude. <strong className="text-foreground">Skew</strong>{" "}
        descreve a diferença entre IVs de puts e calls.{" "}
        <strong className="text-foreground">Expected Move</strong> descreve uma amplitude
        estatística. Nenhum deles determina a direção do mercado — não são previsão de alta, queda,
        máxima ou mínima.
      </p>
    </div>
  );
}

export function VolatilityContext({ context }: Props) {
  const reading = useMemo(() => buildVolatilityReading(context), [context]);

  if (!context) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Contexto de mercado não disponível.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ConceptNote />

      <div className="grid gap-4 lg:grid-cols-3">
        <IvBlock atmIv={reading.atmIv} spot={reading.spot} />
        <SkewBlock skew={reading.skew} />
        <ExpectedMoveBlock em={reading.expectedMove} spot={reading.spot} />
      </div>
    </div>
  );
}
