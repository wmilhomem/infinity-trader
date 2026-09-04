/**
 * Y.3.7 — DECISION SNAPSHOT COMPONENT
 *
 * Shows a read-only summary of the complete decision point:
 * - Market context facts at time of reading
 * - Chain reading state (interpretations, hypotheses, evidences)
 * - This is a RECORD, not a recommendation
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Snapshot is a factual record, NOT a "decision" or "conclusion"
 * - No "posicionamento decidido" or "decisão tomada"
 * - User still has full agency after seeing the snapshot
 */

import type { MarketContext } from "@/lib/market-context";
import type { ChainReadingState } from "@/lib/options-chain-types";
import { buildDecisionSnapshot } from "@/lib/decision-snapshot";
import {
  Camera,
  Eye,
  Lightbulb,
  Shield,
  ShieldOff,
  ShieldCheck,
  Clock,
  TrendingUp,
} from "lucide-react";

interface Props {
  context: MarketContext | null;
  state: ChainReadingState;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: typeof Eye;
  label: string;
  value: string | number;
  sublabel?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border bg-card p-3">
      <Icon size={14} className="text-muted-foreground shrink-0" />
      <div>
        <div className="text-xs font-semibold text-foreground">{value}</div>
        <div className="text-[10px] text-muted-foreground">{label}</div>
        {sublabel && <div className="text-[10px] text-muted-foreground/70">{sublabel}</div>}
      </div>
    </div>
  );
}

function ConceptNote() {
  return (
    <div className="flex items-start gap-2 rounded border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
      <Camera size={13} className="mt-0.5 shrink-0 text-info" />
      <p>
        <strong className="text-foreground">Snapshot</strong> registra o que você observou até
        agora. Não é uma decisão — você ainda pode refletir antes de agir.
      </p>
    </div>
  );
}

export function DecisionSnapshot({ context, state }: Props) {
  if (!context && state.interpretations.length === 0) {
    return null;
  }

  const snapshot = buildDecisionSnapshot(context, state, []);

  const date = new Date(snapshot.timestamp).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-4">
      <ConceptNote />

      <div className="rounded-md border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={13} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">{date}</span>
          <span className="text-xs text-muted-foreground/50">·</span>
          <span className="text-xs font-mono text-muted-foreground">{snapshot.symbol}</span>
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Contexto de Mercado
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard
                icon={TrendingUp}
                label="Spot"
                value={snapshot.spot !== null ? `R$ ${snapshot.spot.toFixed(2)}` : "—"}
              />
              <StatCard
                icon={TrendingUp}
                label="IV ATM"
                value={snapshot.ivAtm !== null ? `${(snapshot.ivAtm * 100).toFixed(1)}%` : "—"}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Cadeia de Leitura
            </div>
            <div className="grid grid-cols-2 gap-2">
              <StatCard icon={Eye} label="Observações" value={snapshot.interpretationCount} />
              <StatCard icon={Lightbulb} label="Hipóteses" value={snapshot.hypothesisCount} />
              <StatCard icon={Shield} label="Evidências" value={snapshot.evidenceCount} />
              <StatCard
                icon={ShieldOff}
                label="Contra-evidências"
                value={snapshot.contraEvidenceCount}
              />
            </div>
          </div>
        </div>
      </div>

      {state.interpretations.length > 0 && (
        <div className="rounded-md border border-dashed border-border p-4 text-center">
          <p className="text-xs text-muted-foreground">
            Reveja suas observações acima antes de salvar ou tomar uma decisão.
          </p>
        </div>
      )}
    </div>
  );
}
