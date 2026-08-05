import type { DecisionContext } from "@/engines/decision-context";
import { Gauge } from "lucide-react";

/**
 * OS Status Bar — o painel de sinais do Sistema Operacional.
 * Deriva 3 sinais do DecisionContext (a moeda) — a UI não recalcula nada:
 * - ESTRUTURA 🟢/🟡/🔴 — coerência da montagem com o clima de volatilidade
 * - TEMPO 🟢/🟡/🔴 — janela temporal (Theta) da estrutura
 * - RISCO 🟢/🟡/🔴 — alertas de regra + perfil de risco da estrutura
 */

type Sinal = { rotulo: string; status: "🟢" | "🟡" | "🔴"; detalhe: string };

function sinalClasse(status: Sinal["status"]) {
  return status === "🟢"
    ? "border-success/40 bg-success/5"
    : status === "🟡"
      ? "border-primary/40 bg-primary/10"
      : "border-loss/40 bg-loss/5";
}

function SinalCard({ sinal }: { sinal: Sinal }) {
  return (
    <div className={`flex items-start gap-3 rounded-xl border p-4 ${sinalClasse(sinal.status)}`}>
      <span className="text-lg leading-none">{sinal.status}</span>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          {sinal.rotulo}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{sinal.detalhe}</p>
      </div>
    </div>
  );
}

export function OsStatusBar({ contexto }: { contexto: DecisionContext }) {
  const t = contexto.technical;
  const c = contexto.cognitive;

  const estrutura: Sinal =
    t.riskRegime === "explosivo"
      ? {
          rotulo: "Estrutura",
          status: "🔴",
          detalhe: `Regime explosivo: ${t.strategy.interpretacao.objetivoLabel.toLowerCase()} num chão de volatilidade agressivo.`,
        }
      : t.riskRegime === "incerto"
        ? {
            rotulo: "Estrutura",
            status: "🟡",
            detalhe: `Regime incerto: a leitura de volatilidade não fecha uma direção clara.`,
          }
        : {
            rotulo: "Estrutura",
            status: "🟢",
            detalhe: `Regime tranquilo: ${t.strategy.interpretacao.nome} no chão atual.`,
          };

  const tempo: Sinal = t.greeks.tempo.status.includes("Crítico")
    ? {
        rotulo: "Tempo",
        status: "🔴",
        detalhe: `${t.greeks.tempo.status}: ${t.greeks.tempo.mecanica}`,
      }
    : t.greeks.tempo.status.includes("Acelerando")
      ? {
          rotulo: "Tempo",
          status: "🟡",
          detalhe: `${t.greeks.tempo.status}: ${t.greeks.tempo.mecanica}`,
        }
      : {
          rotulo: "Tempo",
          status: "🟢",
          detalhe: `${t.greeks.tempo.status}: ${t.greeks.tempo.mecanica}`,
        };

  const regraCritica = c.rules.some((a) => a.severidade === "critico");
  const regraAviso = c.rules.some((a) => a.severidade === "aviso");
  const risco: Sinal = regraCritica
    ? {
        rotulo: "Risco",
        status: "🔴",
        detalhe: `Regra crítica quebrada: ${c.rules.find((a) => a.severidade === "critico")?.regra}`,
      }
    : regraAviso
      ? {
          rotulo: "Risco",
          status: "🟡",
          detalhe: `Aviso de regra: ${c.rules.find((a) => a.severidade === "aviso")?.regra}`,
        }
      : {
          rotulo: "Risco",
          status: "🟢",
          detalhe: `Perfil ${t.strategy.interpretacao.risco} · nenhuma regra quebrada.`,
        };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Gauge size={14} className="text-primary" /> Sinais do sistema
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SinalCard sinal={estrutura} />
        <SinalCard sinal={tempo} />
        <SinalCard sinal={risco} />
      </div>
    </div>
  );
}
