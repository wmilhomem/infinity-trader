/**
 * Y.3.6 — RISK RULES COMPONENT
 *
 * Personal risk rules as declared facts.
 * User documents their rules — system shows them without evaluation.
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Rules are stated facts, NOT "protection" or "safety"
 * - No evaluation language (safe, risky, dangerous, etc.)
 * - User decides how to apply their rules to their plan
 */

import { useState } from "react";
import type { MarketContext } from "@/lib/market-context";
import { createRiskRule, checkRulesAgainstContext, type PersonalRiskRule } from "@/lib/risk-rules";
import { Shield, Plus, Trash2, AlertTriangle, CheckCircle2, XCircle, Info } from "lucide-react";

interface Props {
  context: MarketContext | null;
}

const TIPO_LABELS: Record<PersonalRiskRule["tipo"], string> = {
  "stop-loss": "Stop Loss",
  "position-size": "Tamanho de Posição",
  "iv-filter": "Filtro de IV",
  "dte-filter": "Filtro de DTE",
  other: "Outra",
};

const TIPO_COLORS: Record<PersonalRiskRule["tipo"], string> = {
  "stop-loss": "bg-loss/10 text-loss border-loss/20",
  "position-size": "bg-primary/10 text-primary border-primary/20",
  "iv-filter": "bg-info/10 text-info border-info/20",
  "dte-filter": "bg-warning/10 text-warning border-warning/20",
  other: "bg-muted text-muted-foreground border-border",
};

function RuleCard({ rule, onDelete }: { rule: PersonalRiskRule; onDelete: () => void }) {
  return (
    <div className={`flex items-start gap-2 rounded-md border p-3 ${TIPO_COLORS[rule.tipo]}`}>
      <Shield size={12} className="mt-0.5 shrink-0 opacity-60" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {TIPO_LABELS[rule.tipo]}
          </span>
        </div>
        <p className="text-xs leading-relaxed">{rule.texto}</p>
      </div>
      <button
        type="button"
        onClick={onDelete}
        className="shrink-0 rounded p-1 opacity-50 hover:opacity-100 hover:bg-background/20"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}

function RuleCheckRow({
  check,
}: {
  check: {
    ruleTexto: string;
    tipo: PersonalRiskRule["tipo"];
    applicable: boolean;
    status: "ok" | "violated" | "na";
    observation: string | null;
  };
}) {
  if (!check.applicable) return null;

  const icons = {
    ok: <CheckCircle2 size={11} className="text-success" />,
    violated: <AlertTriangle size={11} className="text-loss" />,
    na: <XCircle size={11} className="text-muted-foreground" />,
  };

  return (
    <div className="flex items-start gap-2 py-1.5 border-b border-border/50 last:border-0">
      {icons[check.status]}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-foreground">{check.ruleTexto}</p>
        {check.observation && (
          <p className="text-[10px] text-muted-foreground mt-0.5">{check.observation}</p>
        )}
      </div>
    </div>
  );
}

function ConceptNote() {
  return (
    <div className="flex items-start gap-2 rounded border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
      <Info size={13} className="mt-0.5 shrink-0 text-info" />
      <p>
        <strong className="text-foreground">Regras pessoais</strong> são declarações suas — o
        sistema não avalia se elas são "certas" ou "seguras". Você é responsável por aplicá-las ao
        seu plano.
      </p>
    </div>
  );
}

export function RiskRules({ context }: Props) {
  const [rules, setRules] = useState<PersonalRiskRule[]>([]);
  const [newRuleText, setNewRuleText] = useState("");
  const [newRuleTipo, setNewRuleTipo] = useState<PersonalRiskRule["tipo"]>("other");

  const checks = checkRulesAgainstContext(rules, context);

  function handleAddRule() {
    if (!newRuleText.trim()) return;
    setRules((prev) => [...prev, createRiskRule(newRuleText.trim(), newRuleTipo)]);
    setNewRuleText("");
  }

  function handleDeleteRule(id: string) {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="space-y-4">
      <ConceptNote />

      <div className="space-y-2">
        {rules.length > 0 ? (
          <div className="space-y-2">
            {rules.map((rule) => (
              <RuleCard key={rule.id} rule={rule} onDelete={() => handleDeleteRule(rule.id)} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Nenhuma regra pessoal registrada.
          </div>
        )}
      </div>

      {rules.length > 0 && context && checks.length > 0 && (
        <div className="rounded-md border border-border bg-card p-3">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Verificação contra contexto atual
          </div>
          {checks.map((check) => (
            <RuleCheckRow key={check.ruleId} check={check} />
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <select
          value={newRuleTipo}
          onChange={(e) => setNewRuleTipo(e.target.value as PersonalRiskRule["tipo"])}
          className="rounded-md border border-border bg-input px-2 py-1.5 text-xs"
        >
          {Object.entries(TIPO_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={newRuleText}
          onChange={(e) => setNewRuleText(e.target.value)}
          placeholder="Descreva sua regra..."
          className="flex-1 rounded-md border border-border bg-input px-3 py-1.5 text-xs"
        />
        <button
          type="button"
          onClick={handleAddRule}
          disabled={!newRuleText.trim()}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          <Plus size={12} /> Adicionar
        </button>
      </div>
    </div>
  );
}
