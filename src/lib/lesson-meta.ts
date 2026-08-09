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
  "volatilidade-e-vega": {
    objetivo: "Separar o preço da direção do preço da ansiedade antes de pagar um prêmio.",
    tempoMin: 8,
    erroComum: {
      titulo: "Achar que prêmio caro é direção certa",
      texto:
        "Prêmio caro costuma ser IV alta: o mercado já sabe do evento. Depois do evento, o IV crush derrete o prêmio mesmo com o ativo parado.",
    },
    resumoPontos: [
      "IV mede tamanho do movimento esperado, não direção",
      "Comprar antes do evento é pagar a ansiedade no pico",
      "IV crush derrete o prêmio depois do evento",
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
  "protective-put": {
    objetivo: "Manter a tese de alta e comprar um piso para a queda com uma put.",
    tempoMin: 8,
    erroComum: {
      titulo: "Avaliar o prêmio do seguro pelo preço, não pelo prejuízo evitado",
      texto:
        "Proteção se avalia pela queda que ela evita, não pelo custo do prêmio. Seguro caro é melhor que catástrofe sem teto.",
    },
    resumoPontos: [
      "Ações + put comprada = piso definido",
      "O upside continua ilimitado (menos o prêmio)",
      "O strike do seguro é a queda que você não aguenta",
    ],
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
  straddle: {
    objetivo: "Montar uma compra de movimento sem opinião de direção, sabendo o custo total.",
    tempoMin: 8,
    erroComum: {
      titulo: "Comprar straddle na véspera de evento com IV alta",
      texto:
        "O straddle compra movimento; antes do evento você paga a ansiedade no pico e o IV crush derruba o prêmio mesmo se o ativo andar.",
    },
    resumoPontos: [
      "Compra call + put no mesmo strike",
      "Breakevens = strike ± custo total",
      "Exige movimento maior que o custo, em qualquer direção",
    ],
  },
  strangle: {
    objetivo:
      "Expressar a mesma hipótese de movimento do straddle com custo menor — e exigência maior.",
    tempoMin: 8,
    erroComum: {
      titulo: "Achar que strangle é um straddle 'com desconto'",
      texto:
        "Não é: exige movimento maior. Se o movimento for médio, o straddle alcança e o strangle não.",
    },
    resumoPontos: [
      "Compra call + put OTM",
      "Custo menor, breakevens mais longe",
      "Compensa quando o movimento é grande de verdade",
    ],
  },
  "iron-condor": {
    objetivo: "Vender um range com risco travado quando a hipótese é lateralização.",
    tempoMin: 8,
    erroComum: {
      titulo: "Montar condor esperando movimento grande",
      texto:
        "O condor é venda de movimento: lucra com calmaria. Se a sua hipótese é fuga do range, o condor é a estrutura errada — mesmo com crédito bom.",
    },
    resumoPontos: [
      "Vende call/put OTM com proteção de cada lado",
      "Lucro máximo = crédito; perda máxima = largura − crédito",
      "Hipótese: o ativo fica dentro do range",
    ],
  },
  "comparar-estruturas-de-alta": {
    objetivo: "Escolher entre CALL, trava e coberta comparando distribuições — não direção.",
    tempoMin: 9,
    erroComum: {
      titulo: "Escolher pela direção sozinha",
      texto:
        "'Vai subir' não escolhe estrutura: custo, perda máxima, upside e tempo escolhem. Sem comparar as três, você escolhe no escuro.",
    },
    resumoPontos: [
      "Hipótese primeiro, estrutura depois",
      "CALL: upside ilimitado, prêmio cheio",
      "Trava: débito menor, lucro limitado",
      "Coberta: exige ações, coleta theta, abre mão do extremo",
    ],
  },
  "comparar-estruturas-neutras": {
    objetivo: "Distinguir compra de movimento (straddle/strangle) de venda de movimento (condor).",
    tempoMin: 9,
    erroComum: {
      titulo: "Tratar todas as estruturas neutras como iguais",
      texto:
        "Straddle/strangle e condor apostam em lados opostos da mesma incerteza: movimento versus calmaria. Escolher o errado é operar contra a própria hipótese.",
    },
    resumoPontos: [
      "Straddle: compra movimento, custo alto",
      "Strangle: compra movimento, custo menor, exige mais",
      "Iron condor: vende movimento, recebe crédito, risco travado",
    ],
  },
  "gestao-da-decisao": {
    objetivo:
      "Rodar o ciclo completo: hipótese → estratégias → comparação → risco → regras → simulação → decisão → registro → revisão.",
    tempoMin: 9,
    erroComum: {
      titulo: "Começar pela estrutura",
      texto:
        "Escolher a chave antes de conhecer a porta: estrutura sem hipótese é receita, não decisão. A hipótese vem primeiro.",
    },
    resumoPontos: [
      "Estratégia é conhecimento; decisão é aplicação",
      "Estruturas expressam hipóteses — nunca recomendações",
      "A revisão avalia o processo, não o resultado",
    ],
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
  number | "pratica",
  { accent: string; bg: string; border: string; ring: string; nome: string }
> = {
  1: {
    accent: "text-success",
    bg: "bg-success/10",
    border: "border-success/40",
    ring: "bg-success",
    nome: "Entender",
  },
  2: {
    accent: "text-chart-2",
    bg: "bg-chart-2/10",
    border: "border-chart-2/40",
    ring: "bg-chart-2",
    nome: "Pensar",
  },
  3: {
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    ring: "bg-primary",
    nome: "Construir",
  },
  4: {
    accent: "text-loss",
    bg: "bg-loss/10",
    border: "border-loss/40",
    ring: "bg-loss",
    nome: "Comparar",
  },
  5: {
    accent: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    ring: "bg-primary",
    nome: "Decidir",
  },
  pratica: {
    accent: "text-chart-3",
    bg: "bg-chart-3/10",
    border: "border-chart-3/40",
    ring: "bg-chart-3",
    nome: "Prática",
  },
};
