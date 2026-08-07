// Metadados de experiência por lição: objetivo, tempo, erro comum, resumo e
// qual visual interativo cada capítulo usa. Fica separado do conteúdo para
// manter src/lib/lessons.ts focado em texto/quiz.

export type LessonVisualKind =
  | "callput"
  | "moneyness"
  | "theta"
  | "travas"
  | "fiscal"
  | "premio"
  | "direito"
  | "vencimento"
  | "sizing"
  | "coberta"
  | "roll"
  | "risco"
  | "none";

export type LessonMeta = {
  objetivo: string;
  tempoMin: number;
  erroComum?: { titulo: string; texto: string };
  resumoPontos?: string[];
  visual?: LessonVisualKind;
  /** Sugestão de montagem no simulador ao final da lição. */
  simulador?: string;
};

const DEFAULT_META: LessonMeta = {
  objetivo: "Entender o conceito e conseguir aplicar numa decisão real.",
  tempoMin: 6,
  visual: "none",
};

export const LESSON_META: Record<string, Partial<LessonMeta>> = {
  "o-que-e-opcao": {
    objetivo: "Explicar, com suas palavras, o que você compra quando compra uma opção.",
    tempoMin: 5,
    visual: "direito",
    erroComum: {
      titulo: "Achar que opção é ação barata",
      texto:
        "Opção não é uma ação mais barata: é um direito com prazo de validade. Se o movimento não vier a tempo, o direito expira e o prêmio vira zero.",
    },
    resumoPontos: [
      "Opção é direito, nunca obrigação",
      "Você paga um prêmio pelo direito",
      "Perda máxima do comprador = prêmio pago",
      "Na B3, opções de ações são americanas",
    ],
  },
  "call-vs-put": {
    objetivo: "Escolher entre call e put a partir da direção que você espera.",
    tempoMin: 6,
    visual: "callput",
    erroComum: {
      titulo: "Comprar put achando que 'aposta na queda' é mais seguro",
      texto:
        "Put também é direito com prazo. Se a queda não vier no tempo certo, o prêmio derrete igual — direção certa e prazo errado ainda é prejuízo.",
    },
    resumoPontos: [
      "Call = direito de comprar",
      "Put = direito de vender",
      "Direção certa + prazo errado = prejuízo",
    ],
    simulador: "Compare uma call e uma put no mesmo strike.",
  },
  "vencimento-e-exercicio": {
    objetivo: "Saber o que acontece com sua posição na data de vencimento.",
    tempoMin: 6,
    visual: "vencimento",
    erroComum: {
      titulo: "Esquecer a data de vencimento",
      texto:
        "Toda posição tem um relógio. Decidir na véspera, sob pressão, é onde nascem os piores trades.",
    },
  },
  "premio-e-strike": {
    objetivo: "Separar valor intrínseco de valor extrínseco antes de pagar por uma opção.",
    tempoMin: 7,
    visual: "premio",
    erroComum: {
      titulo: "Pagar caro por valor extrínseco",
      texto:
        "O extrínseco é a parte do prêmio que evapora com o tempo. Quanto mais você paga por expectativa, mais o relógio joga contra você.",
    },
    resumoPontos: [
      "Prêmio = intrínseco + extrínseco",
      "Intrínseco nunca é negativo",
      "O extrínseco vira zero no vencimento",
    ],
  },
  moneyness: {
    objetivo: "Escolher o strike a partir da probabilidade — não do preço da opção.",
    tempoMin: 7,
    visual: "moneyness",
    erroComum: {
      titulo: "Comprar OTM só porque está barato",
      texto:
        "Barato não significa vantajoso. O mercado cobra pouco justamente porque a probabilidade também é pequena.",
    },
    resumoPontos: [
      "ITM: mais caro, mais chance, menos alavancagem",
      "ATM: maior extrínseco e maior sensibilidade ao tempo",
      "OTM: barata, alavancada, alta chance de virar pó",
      "Barato ≠ bom negócio",
    ],
    simulador: "Monte a mesma call em três strikes: ITM, ATM e OTM.",
  },
  "theta-e-tempo": {
    objetivo: "Enxergar quanto a passagem dos dias custa na sua posição.",
    tempoMin: 7,
    visual: "theta",
    erroComum: {
      titulo: "Segurar a opção 'esperando virar'",
      texto:
        "A corrosão acelera na última semana. Esperar mais é pagar aluguel de tempo justamente quando ele está mais caro.",
    },
    resumoPontos: [
      "Theta corrói o extrínseco",
      "A queda acelera perto do vencimento",
      "Comprador luta contra o tempo",
    ],
  },
  "compra-a-seco": {
    objetivo: "Definir quanto do seu capital pode virar pó numa compra a seco.",
    tempoMin: 7,
    visual: "sizing",
    erroComum: {
      titulo: "Dobrar a aposta depois de perder",
      texto:
        "Compra a seco tem alta taxa de perda total. Dobrar após perder é como tentar recuperar no cassino.",
    },
  },
  "venda-coberta": {
    objetivo: "Entender o que você troca ao vender uma call contra suas ações.",
    tempoMin: 7,
    visual: "coberta",
    erroComum: {
      titulo: "Vender call em ação que você não quer vender",
      texto:
        "Se o ativo disparar, você é chamado a entregar as ações no strike. Aceite esse desfecho antes de montar.",
    },
  },
  rolagem: {
    objetivo: "Reconhecer quando rolar é gestão e quando é fuga do prejuízo.",
    tempoMin: 8,
    visual: "travas",
    erroComum: {
      titulo: "Rolar para não realizar prejuízo",
      texto: "Rolagem sem tese nova é só adiar a dor — e normalmente aumentando o risco.",
    },
  },
  "trava-de-alta": {
    objetivo: "Montar uma trava sabendo, antes de enviar, o ganho e a perda máximos.",
    tempoMin: 8,
    visual: "travas",
    erroComum: {
      titulo: "Montar trava sem olhar a liquidez da ponta vendida",
      texto:
        "Perna ilíquida vira prisão: você entra fácil e sai caro. Confira o book das duas pernas.",
    },
    resumoPontos: [
      "Ganho e perda são limitados e conhecidos",
      "Custo menor que a compra a seco",
      "Depende de liquidez nas duas pernas",
    ],
    simulador: "Monte a trava de alta e veja o payoff limitado dos dois lados.",
  },
  "trava-de-baixa": {
    objetivo: "Estruturar uma aposta de queda com risco travado.",
    tempoMin: 8,
    visual: "travas",
    erroComum: {
      titulo: "Montar trava para esperar queda extrema",
      texto:
        "A trava de baixa limita o ganho no strike inferior. Se a sua tese exige uma queda de 20%, a trava não é o instrumento: o ganho para cedo e a queda continua acontecendo sem você.",
    },
    simulador: "Monte a trava de baixa com puts.",
  },
  "rolagem-defensiva": {
    objetivo: "Aplicar um checklist antes de rolar uma posição perdedora.",
    tempoMin: 8,
    visual: "roll",
    erroComum: {
      titulo: "Rolar sempre para o mesmo strike",
      texto: "Rolar mantendo o mesmo strike costuma só empurrar o problema com custo adicional.",
    },
  },
  "gestao-de-risco-travas": {
    objetivo: "Dimensionar a posição pela regra de 1% antes de pensar em lucro.",
    tempoMin: 8,
    visual: "risco",
    erroComum: {
      titulo: "Dimensionar pelo lucro possível",
      texto: "Tamanho de posição se define pela perda aceitável, nunca pelo ganho imaginado.",
    },
  },
  "tributacao-basica": {
    objetivo: "Saber quanto do seu lucro é do governo antes de comemorar.",
    tempoMin: 6,
    visual: "fiscal",
    erroComum: {
      titulo: "Contar o lucro bruto como ganho",
      texto: "Sem descontar imposto e custos, seu resultado é ficção.",
    },
  },
  "darf-e-compensacao": {
    objetivo: "Fechar o mês sabendo se tem DARF a pagar e quanto.",
    tempoMin: 7,
    visual: "fiscal",
    erroComum: {
      titulo: "Achar que prejuízo compensa qualquer coisa",
      texto:
        "Compensação é estanque: swing só compensa swing, day trade só compensa day trade. E sem registro no diário e na declaração anual, o prejuízo não é aceito pela Receita.",
    },
    resumoPontos: [
      "Código 6015",
      "Vence no último dia útil do mês seguinte",
      "Prejuízo compensa lucro futuro",
    ],
  },
};

export function getLessonMeta(slug: string): LessonMeta {
  return { ...DEFAULT_META, ...(LESSON_META[slug] ?? {}) };
}

/** Identidade visual por nível — cada capítulo tem sua própria cor. */
export const NIVEL_THEME: Record<
  number,
  { accent: string; bg: string; border: string; ring: string; nome: string }
> = {
  1: {
    accent: "text-success",
    bg: "bg-success/10",
    border: "border-success/40",
    ring: "bg-success",
    nome: "Fundamentos",
  },
  2: {
    accent: "text-chart-2",
    bg: "bg-chart-2/10",
    border: "border-chart-2/40",
    ring: "bg-chart-2",
    nome: "Mecânica",
  },
  3: {
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    ring: "bg-primary",
    nome: "Operação",
  },
  4: {
    accent: "text-loss",
    bg: "bg-loss/10",
    border: "border-loss/40",
    ring: "bg-loss",
    nome: "Estruturas",
  },
  5: {
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    ring: "bg-primary",
    nome: "Tributação",
  },
};
