/**
 * Y.2 — REPLAY MARKET CONTEXT COM PROVENANCE
 *
 * Versão enriquecida do ReplayMarketContext que exibe provenance por campo.
 * Mostra a natureza epistemológica de cada dado:
 *   "ATM IV: 28,7% — Observado — Yahoo Finance — 14:32:04"
 *   "Expected Move: ±R$ 1,83 — Calculado — IV × Spot × √T — DTE 17"
 */

import type { MercadoObservadoComProvenance } from "@/lib/market-data/mercado-observado-provenance";
import { History, ShieldAlert, AlertTriangle, HelpCircle } from "lucide-react";

interface Props {
  mercado: MercadoObservadoComProvenance;
}

const ORIGIN_LABEL: Record<string, string> = {
  observed: "Observado",
  calculated: "Calculado",
  estimated: "Estimado",
};

const QUALITY_LABEL: Record<string, { text: string; class: string }> = {
  valid: { text: "Válido", class: "text-success" },
  suspicious: { text: "Suspeito", class: "text-warning" },
  invalid: { text: "Inválido", class: "text-loss" },
  absent: { text: "Ausente", class: "text-muted-foreground" },
};

function ProvenanceBadge({ provenance, quality }: { provenance: { origin: string; source?: string | null; method?: string | null; calculatedAt?: string | null }; quality: string }) {
  const originLabel = ORIGIN_LABEL[provenance.origin] ?? provenance.origin;
  const sourceLabel = provenance.source === "yahoo-finance" ? "Yahoo Finance" : provenance.source ?? "desconhecida";
  const timeStr = provenance.calculatedAt
    ? new Date(provenance.calculatedAt).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : null;
  const qualityInfo = QUALITY_LABEL[quality] ?? QUALITY_LABEL.absent;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
      <span className={qualityInfo.class}>
        [{qualityInfo.text}]
      </span>
      <span>
        <strong className="font-normal text-foreground">{originLabel}</strong>
        {" · "}
        {sourceLabel}
        {timeStr && ` · ${timeStr}`}
        {provenance.method && ` · ${provenance.method}`}
      </span>
    </div>
  );
}

function FactLine({
  label,
  value,
  envelope,
  formatter,
}: {
  label: string;
  value: unknown;
  envelope: { provenance: { origin: string; source?: string | null; method?: string | null; calculatedAt?: string | null }; quality: string };
  formatter?: (v: unknown) => string;
}) {
  if (value === null || value === undefined) {
    return (
      <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
        <span className="text-[11px] text-muted-foreground">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground italic">não observado</span>
          <ProvenanceBadge provenance={envelope.provenance} quality={envelope.quality} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-foreground">
          {formatter ? formatter(value) : String(value)}
        </span>
        <ProvenanceBadge provenance={envelope.provenance} quality={envelope.quality} />
      </div>
    </div>
  );
}

function QualityWarning({ reasons }: { reasons?: string[] }) {
  if (!reasons || reasons.length === 0) return null;
  return (
    <div className="flex items-start gap-1.5 rounded bg-warning/10 border border-warning/30 p-2 text-[10px] text-warning mt-2">
      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
      <div>
        <div className="font-semibold">Qualidade suspeita</div>
        <div className="text-muted-foreground">{reasons.join(" · ")}</div>
      </div>
    </div>
  );
}

export function ReplayMarketContextY2({ mercado }: Props) {
  const spot = mercado.spot;
  const ivAtm = mercado.ivAtm;
  const ivRank = mercado.ivRank;
  const expectedMove = mercado.expectedMove;
  const skew = mercado.skew;
  const liquidity = mercado.liquidityScore;
  const events = mercado.eventsImminent;
  const observadoEm = mercado.observadoEm;

  const hasQualityIssues =
    spot?.quality === "suspicious" ||
    ivAtm?.quality === "suspicious" ||
    ivRank?.quality === "suspicious" ||
    expectedMove?.quality === "suspicious";

  return (
    <div className="rounded-lg border border-primary/30 bg-card p-4 space-y-3">
      <div className="flex items-center justify-between text-xs font-semibold text-primary uppercase tracking-wide">
        <span className="flex items-center gap-1.5">
          <History size={14} /> Contexto Observado Naquele Instante
        </span>
        {observadoEm?.value && (
          <span className="text-[11px] text-muted-foreground font-mono">
            {new Date(observadoEm.value).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      <div className="rounded bg-primary/10 border border-primary/20 p-2.5 text-[11px] text-muted-foreground leading-snug flex items-start gap-2">
        <ShieldAlert size={14} className="text-primary shrink-0 mt-0.5" />
        <span>
          Este contexto representa o que estava registrado no momento da decisão e não é atualizado com dados atuais. Cada campo carrega sua origem e qualidade.
        </span>
      </div>

      {hasQualityIssues && (
        <div className="flex items-start gap-1.5 rounded bg-warning/10 border border-warning/30 p-2 text-[10px] text-warning">
          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
          <span>Alguns dados deste snapshot têm qualidade suspeita — ver detalhes abaixo.</span>
        </div>
      )}

      <div className="space-y-0">
        <FactLine
          label="Preço (spot)"
          value={spot?.value}
          envelope={spot ?? { provenance: { origin: "observed" }, quality: "absent" }}
          formatter={(v) => `R$ ${Number(v).toFixed(2)}`}
        />

        <FactLine
          label="IV ATM"
          value={ivAtm?.value}
          envelope={ivAtm ?? { provenance: { origin: "observed" }, quality: "absent" }}
          formatter={(v) => `${Number(v).toFixed(1)}%`}
        />

        <FactLine
          label="IV Rank"
          value={ivRank?.value}
          envelope={ivRank ?? { provenance: { origin: "observed" }, quality: "absent" }}
          formatter={(v) => `percentil ${Number(v)}%`}
        />

        {expectedMove?.value && (
          <>
            <FactLine
              label="Expected Move (±1σ)"
              value={expectedMove.value.value}
              envelope={expectedMove}
              formatter={(v) => `±R$ ${Number(v).toFixed(2)}`}
            />
            {expectedMove.value.lowerBound !== null && expectedMove.value.upperBound !== null && (
              <div className="flex items-center justify-between py-1 border-b border-border/30">
                <span className="text-[11px] text-muted-foreground ml-4">Faixa</span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  R$ {expectedMove.value.lowerBound.toFixed(2)} → R$ {expectedMove.value.upperBound.toFixed(2)}
                </span>
              </div>
            )}
          </>
        )}

        {skew?.value && (
          <FactLine
            label="Skew (put - call)"
            value={skew.value.slope}
            envelope={skew}
            formatter={(v) => `${Number(v).toFixed(2)} pts`}
          />
        )}

        <FactLine
          label="Liquidez"
          value={liquidity?.value}
          envelope={liquidity ?? { provenance: { origin: "observed" }, quality: "absent" }}
          formatter={(v) => {
            if (v === "alta") return "Alta";
            if (v === "media") return "Média";
            if (v === "baixa") return "Baixa";
            return String(v);
          }}
        />

        <FactLine
          label="Eventos corporativos"
          value={events?.value}
          envelope={events ?? { provenance: { origin: "observed" }, quality: "absent" }}
          formatter={(v) => (v ? "próximos" : "nenhum")}
        />
      </div>

      {(spot?.reasons?.length || ivAtm?.reasons?.length || ivRank?.reasons?.length) && (
        <QualityWarning
          reasons={[
            ...(spot?.reasons ?? []),
            ...(ivAtm?.reasons ?? []),
            ...(ivRank?.reasons ?? []),
          ]}
        />
      )}

      <div className="pt-2 border-t border-border/50">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <HelpCircle size={11} />
          <span>
            Dados marcados como &quot;ausentes&quot; não estavam disponíveis na fonte naquele momento.
            Nunca são preenchidos com estimativas retroativas.
          </span>
        </div>
      </div>
    </div>
  );
}
