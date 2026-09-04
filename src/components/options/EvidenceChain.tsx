/**
 * Y.3.5 — EVIDENCE CHAIN COMPONENT
 *
 * Read-only view of the logical chain:
 * Observation → Hypothesis → Evidence / Contra-Evidence
 *
 * ANTI-RECOMMENDATION CONTRACT:
 * - Shows connections as facts, NOT as "proof" or "confirmation"
 * - No evaluation of strength or quality of evidence
 * - No conclusion language
 */

import type { ChainReadingState } from "@/lib/options-chain-types";
import { buildEvidenceChain, type EvidenceChainNode } from "@/lib/evidence-chain";
import { Eye, Lightbulb, Shield, ShieldOff, ArrowRight } from "lucide-react";

interface Props {
  state: ChainReadingState;
}

function NodeCard({ node }: { node: EvidenceChainNode }) {
  const config = {
    observation: {
      icon: Eye,
      label: "Observação",
      class: "border-border bg-card",
      labelClass: "text-muted-foreground",
    },
    hypothesis: {
      icon: Lightbulb,
      label: "Hipótese",
      class: "border-primary/30 bg-primary/5",
      labelClass: "text-primary",
    },
    evidence: {
      icon: Shield,
      label: "Evidência",
      class: "border-success/30 bg-success/5",
      labelClass: "text-success",
    },
    "contra-evidence": {
      icon: ShieldOff,
      label: "Contra-evidência",
      class: "border-loss/30 bg-loss/5",
      labelClass: "text-loss",
    },
  };

  const { icon: Icon, label, class: cardClass, labelClass } = config[node.type];
  const date = new Date(node.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`rounded-md border p-3 ${cardClass}`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <Icon size={11} className={labelClass} />
        <span className={`text-[10px] font-semibold uppercase tracking-wider ${labelClass}`}>
          {label}
        </span>
      </div>
      <p className="text-xs text-foreground leading-relaxed">{node.texto}</p>
      <span className="text-[10px] text-muted-foreground mt-1 block">{date}</span>
    </div>
  );
}

function ConceptNote() {
  return (
    <div className="rounded border border-info/30 bg-info/5 p-3 text-xs text-muted-foreground">
      <strong className="text-foreground">Cadeia de evidência</strong> mostra como suas observações,
      hipóteses e evidências se conectam. O sistema não avalia se a证据 é forte ou fraca — isso é
      julgamento seu.
    </div>
  );
}

export function EvidenceChain({ state }: Props) {
  const chain = buildEvidenceChain(state);

  if (chain.nodes.length === 0) {
    return null;
  }

  const observations = chain.nodes.filter((n) => n.type === "observation");
  const hypotheses = chain.nodes.filter((n) => n.type === "hypothesis");

  return (
    <div className="space-y-4">
      <ConceptNote />

      {observations.map((obs) => {
        const hypIds = chain.observationHypotheses[obs.id] ?? [];
        const hyps = chain.nodes.filter((n) => hypIds.includes(n.id));

        return (
          <div key={obs.id} className="space-y-2">
            <NodeCard node={obs} />

            {hyps.map((hyp) => {
              const supportingIds = chain.hypothesisSupports[hyp.id] ?? [];
              const contradictingIds = chain.hypothesisContradicts[hyp.id] ?? [];
              const supporting = chain.nodes.filter((n) => supportingIds.includes(n.id));
              const contradicting = chain.nodes.filter((n) => contradictingIds.includes(n.id));

              return (
                <div key={hyp.id} className="ml-6 space-y-2">
                  <div className="flex items-center gap-2">
                    <ArrowRight size={12} className="text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <NodeCard node={hyp} />
                    </div>
                  </div>

                  {(supporting.length > 0 || contradicting.length > 0) && (
                    <div className="ml-6 space-y-1.5">
                      {supporting.map((ev) => (
                        <div key={ev.id} className="flex items-center gap-2">
                          <ArrowRight size={10} className="text-success shrink-0" />
                          <NodeCard node={ev} />
                        </div>
                      ))}
                      {contradicting.map((ev) => (
                        <div key={ev.id} className="flex items-center gap-2">
                          <ArrowRight size={10} className="text-loss shrink-0" />
                          <NodeCard node={ev} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
