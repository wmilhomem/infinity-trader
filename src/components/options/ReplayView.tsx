/**
 * Y.3.8 — REPLAY VIEW COMPONENT
 *
 * Shows saved readings in temporal order for review.
 * User identifies patterns themselves — system does not diagnose.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - No "bias detected" or "cognitive pattern identified"
 * - No evaluation of whether user "learned" or "improved"
 * - Pure temporal presentation of saved readings
 */

import { useState } from "react";
import type { SavedReading } from "@/lib/replay-reader";
import { buildReplayComparison, type ReplayComparison } from "@/lib/replay-reader";
import {
  History,
  Calendar,
  Eye,
  Lightbulb,
  Shield,
  ShieldOff,
  ArrowRight,
  Info,
} from "lucide-react";

interface Props {
  readings: SavedReading[];
}

function ReadingCard({ reading, index }: { reading: SavedReading; index: number }) {
  const date = new Date(reading.timestamp).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const time = new Date(reading.timestamp).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {index + 1}
          </span>
          <span className="text-xs font-mono font-semibold text-foreground">{reading.symbol}</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-muted-foreground">{date}</div>
          <div className="text-[10px] text-muted-foreground/70">{time}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5">
          <Eye size={11} className="text-muted-foreground" />
          <span className="text-muted-foreground">Observações:</span>
          <span className="font-semibold text-foreground">{reading.interpretationCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Lightbulb size={11} className="text-muted-foreground" />
          <span className="text-muted-foreground">Hipóteses:</span>
          <span className="font-semibold text-foreground">{reading.hypothesisCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Shield size={11} className="text-muted-foreground" />
          <span className="text-muted-foreground">Evidências:</span>
          <span className="font-semibold text-foreground">{reading.evidenceCount}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ShieldOff size={11} className="text-muted-foreground" />
          <span className="text-muted-foreground">Contra:</span>
          <span className="font-semibold text-foreground">{reading.contraEvidenceCount}</span>
        </div>
      </div>

      {reading.spot !== null && (
        <div className="mt-2 rounded bg-muted px-2 py-1 text-center text-[11px] font-mono text-muted-foreground">
          Spot: R$ {reading.spot.toFixed(2)}
        </div>
      )}
    </div>
  );
}

function TemporalGapRow({ gap }: { gap: { from: string; to: string; days: number } }) {
  const fromDate = new Date(gap.from).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
  const toDate = new Date(gap.to).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

  return (
    <div className="flex items-center gap-2 py-1.5 text-xs">
      <Calendar size={11} className="text-muted-foreground shrink-0" />
      <span className="text-muted-foreground">
        {fromDate} → {toDate}
      </span>
      <ArrowRight size={10} className="text-muted-foreground/50" />
      <span className="font-semibold text-foreground">{gap.days} dias</span>
    </div>
  );
}

function ConceptNote() {
  return (
    <div className="flex items-start gap-2 rounded border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
      <Info size={13} className="mt-0.5 shrink-0 text-info" />
      <p>
        <strong className="text-foreground">Replay</strong> mostra suas leituras passadas em ordem
        temporal. Identificar padrões é exercício seu — o sistema apenas apresenta os fatos.
      </p>
    </div>
  );
}

export function ReplayView({ readings }: Props) {
  const comparison = buildReplayComparison(readings);

  if (readings.length === 0) {
    return (
      <div className="space-y-4">
        <ConceptNote />
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <History size={24} className="mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">Nenhuma leitura salva ainda.</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Suas leituras aparecerão aqui após salvar.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ConceptNote />

      {comparison.observation && (
        <div className="rounded-md border border-border bg-card p-3 text-xs text-muted-foreground">
          {comparison.observation}
        </div>
      )}

      {comparison.temporalGaps.length > 0 && (
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Intervalos entre Leituras
          </div>
          {comparison.temporalGaps.map((gap, i) => (
            <TemporalGapRow key={i} gap={gap} />
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Leituras ({comparison.readings.length})
        </div>
        {comparison.readings.map((reading, index) => (
          <ReadingCard key={reading.id} reading={reading} index={index} />
        ))}
      </div>
    </div>
  );
}
