import type { DecisionContext, DecisionContextInput } from "./decision-context";
import { buildDecisionContext } from "./decision-context";
import type { Perna } from "@/lib/payoff";

// ===================================
// EVENTOS (O que aconteceu e foi consolidado)
// ===================================
export type OSEvent =
  | { type: "CONTEXT_READY"; payload: DecisionContext }
  | { type: "RULE_BROKEN"; payload: { brokenRuleCount: number } }
  | { type: "CONFIDENCE_DEGRADED"; payload: { score: number; reason: string } }
  | { type: "THETA_CRITICAL"; payload: { dailyBleed: number } };

// ===================================
// AÇÕES (Intenções despachadas pela Interface - Ex: Sliders)
// ===================================
export type OSAction =
  | { type: "TIME_TRAVEL_REQUESTED"; payload: { targetDTE: number } } // Slider temporal de simulação
  | { type: "IV_LEVEL_REQUESTED"; payload: { targetIV: number } } // Slider de volatilidade implícita
  | { type: "LEGS_UPDATED"; payload: { pernas: Perna[] } } // Mudança no Board de pernas do Simulador
  | { type: "CAPITAL_ALLOCATED"; payload: { amount: number } };

type Subscriber<T> = (data: T) => void;

/**
 * INTELLIGENCE BUS (Pub/Sub)
 * Barramento central nervoso do Infinity Trader.
 * Os Motores reagem às `OSActions` (viagens no tempo, edição de pernas).
 * A UI e a inteligência artificial apenas escutam os `OSEvents` e os renderizam.
 * Zero acoplamento de lógica dentro dos componentes React.
 */
export class IntelligenceBus {
  private static instance: IntelligenceBus;

  private eventSubscribers = new Set<Subscriber<OSEvent>>();
  private actionSubscribers = new Set<Subscriber<OSAction>>();

  private constructor() {}

  static getInstance(): IntelligenceBus {
    if (!IntelligenceBus.instance) IntelligenceBus.instance = new IntelligenceBus();
    return IntelligenceBus.instance;
  }

  // A UI emite intenções.
  dispatchAction(action: OSAction) {
    this.actionSubscribers.forEach((sub) => sub(action));
  }

  // Os Motores publicam verdades absolutas.
  publishEvent(event: OSEvent) {
    this.eventSubscribers.forEach((sub) => sub(event));
  }

  subscribeToAction(sub: Subscriber<OSAction>) {
    this.actionSubscribers.add(sub);
    return () => this.actionSubscribers.delete(sub); // unsubscribe
  }

  subscribeToEvent(sub: Subscriber<OSEvent>) {
    this.eventSubscribers.add(sub);
    return () => this.eventSubscribers.delete(sub); // unsubscribe
  }
}

// Singleton export para importação cross-app
export const osBus = IntelligenceBus.getInstance();

/**
 * CASCATA (Pricing → Greeks → Volatility → Behavior → Decision)
 * O Motor único que consome as entradas do simulador, recalcula o mundo
 * e publica o novo quadro no Bus. A UI apenas escuta CONTEXT_READY.
 */
export function runSimulationPipeline(
  bus: IntelligenceBus,
  input: DecisionContextInput,
): DecisionContext {
  const ctx = buildDecisionContext(input);
  bus.publishEvent({ type: "CONTEXT_READY", payload: ctx });
  return ctx;
}
