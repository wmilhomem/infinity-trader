// Camada de Leitura de Mercado e Contexto.
//
// Princípio: o gráfico é mais uma fonte de observação dentro do processo
// decisório — nunca um "guru" que dá sinais. O fluxo pedagógico é:
//
//   Contexto → Observação → Hipótese → Regra → Simulação → Decisão → Registro → Revisão
//
// Copilot informa. O sistema contextualiza. O usuário decide.

/** Camadas de evidência que uma decisão pode combinar. */
export type CamadaEvidencia = "tecnico" | "fundamentalista" | "derivativos";

export type Evidencia = {
  camada: CamadaEvidencia;
  descricao: string;
};

/** O que se vê (fato) e o que se conclui (interpretação) — mantidos separados de propósito. */
export type Observacao = {
  fato: string;
  interpretacao?: string;
};

export type EstruturaDeMercado =
  "tendencia-alta" | "tendencia-baixa" | "lateralizacao" | "transicao";

/** Contexto mínimo antes de qualquer interpretação. */
export type ContextoDeMercado = {
  estrutura: EstruturaDeMercado;
  regioes: string[];
  volumePresente?: boolean;
};

export type Hipotese = {
  descricao: string;
  falsavel: string;
};

export type RegraPessoal = {
  descricao: string;
};

export type RiscoConhecido = {
  piorCenario: string;
  perdaMaxima: string;
};

/** Ciclo completo de decisão — o esqueleto do Decision OS. */
export type CicloDeDecisao = {
  contexto: ContextoDeMercado;
  observacao: Observacao;
  hipotese: Hipotese;
  regra: RegraPessoal;
  risco: RiscoConhecido;
  simulacao: string;
  decisao: string;
  revisao: string;
};

export const CICLO_DECISAO: { rotulo: string; pergunta: string }[] = [
  { rotulo: "Contexto", pergunta: "O que o mercado está fazendo?" },
  { rotulo: "Observação", pergunta: "O que eu estou vendo (fato)?" },
  { rotulo: "Hipótese", pergunta: "Qual interpretação descreve melhor o movimento?" },
  { rotulo: "Regra", pergunta: "Minha regra permite essa decisão?" },
  { rotulo: "Simulação", pergunta: "O que acontece se eu estiver errado?" },
  { rotulo: "Decisão", pergunta: "A decisão é coerente com o que vejo e com a minha regra?" },
  { rotulo: "Registro", pergunta: "A tese está escrita antes do gatilho?" },
  { rotulo: "Revisão", pergunta: "O processo foi seguido — independente do resultado?" },
];

/** Formato das missões da leitura de mercado (evolução de Reconhece → Aplica → Explica). */
export const ETAPAS_MISSAO = ["Observe", "Interprete", "Confronte", "Simule", "Explique"] as const;

/** Padrão + contexto + regra + risco = evidência. Padrão sozinho nunca é sinal. */
export type Padrao = {
  nome: string;
  oQueSeVe: string;
  dependeDe: string;
  interpretacaoPossivel: string;
  contraExemplo: string;
};

export const PADROES: Padrao[] = [
  {
    nome: "Pavio superior longo",
    oQueSeVe: "O preço subiu até uma região e fechou longe dela.",
    dependeDe:
      "Em que região o pavio aconteceu, se a tendência vinha perdendo força e o que o volume dizia.",
    interpretacaoPossivel:
      "Houve rejeição naquela região — uma hipótese a testar, não uma ordem de venda.",
    contraExemplo:
      "O mesmo pavio numa região de suporte consolidado pode significar exaustão da queda, não continuidade.",
  },
  {
    nome: "Corpo longo",
    oQueSeVe: "Um período com abertura e fechamento distantes.",
    dependeDe:
      "Se a série vinha na mesma direção, se o corpo cresce ou encolhe e em que região ele termina.",
    interpretacaoPossivel:
      "Movimento decidido naquele período — magnitude é observação, não previsão.",
    contraExemplo:
      "Um corpo longo no fim de uma sequência de corpos longos pode ser o último impulso antes da perda de força.",
  },
  {
    nome: "Rompimento",
    oQueSeVe: "O preço atravessa uma região onde parou antes.",
    dependeDe:
      "Se houve aumento de participação (volume), se a região era consolidada e o risco de retorno.",
    interpretacaoPossivel:
      "Rompimento com volume é hipótese de continuação; sem volume, pode ser teste.",
    contraExemplo:
      "Falso rompimento: o preço atravessa, não encontra continuação e volta para a região — o risco precisa estar previsto.",
  },
];

/** Combina padrão + contexto numa evidência — nunca num sinal. */
export function evidenciaDe(padrao: Padrao, contexto: ContextoDeMercado): Evidencia {
  return {
    camada: "tecnico",
    descricao: `${padrao.nome}: ${padrao.oQueSeVe} Em contexto de ${contexto.estrutura}, a leitura possível é: ${padrao.interpretacaoPossivel}.`,
  };
}

/** Quiz pedagógico do pavio superior — reforça que observação não determina ação. */
export const QUIZ_PAVIO_SUPERIOR = {
  pergunta: "O que o pavio superior pode representar?",
  opcoes: [
    {
      rotulo: "A",
      texto: "Compradores dominaram todo o período",
      correta: false,
      feedback:
        "Não: se os compradores tivessem dominado, o fechamento ficaria próximo da máxima. O pavio conta outra história.",
    },
    {
      rotulo: "B",
      texto: "Houve rejeição daquela região",
      correta: true,
      feedback:
        "O pavio mostra que o preço esteve naquela região, mas sozinho não determina o que fazer. Rejeição é uma hipótese — depende do contexto para virar evidência.",
    },
    {
      rotulo: "C",
      texto: "Significa obrigatoriamente venda",
      correta: false,
      feedback:
        "Padrão não é ordem. O mesmo pavio pode ter leituras diferentes conforme a região e a regra pessoal.",
    },
    {
      rotulo: "D",
      texto: "Não é possível saber",
      correta: false,
      feedback:
        "Saber é possível em parte: o fato é que o preço esteve lá e voltou. A interpretação disso é que depende do contexto.",
    },
  ],
  conclusao:
    "O pavio mostra que o preço esteve naquela região, mas sozinho não determina o que fazer.",
} as const;

/** Checklist do rompimento — o fluxo da especificação Contexto → Evidência → Regra → Decisão. */
export const CHECKLIST_ROMPIMENTO = [
  { passo: "Contexto", pergunta: "Qual região o preço atravessou e ela era consolidada?" },
  { passo: "Observação", pergunta: "O rompimento aconteceu com aumento de volume?" },
  { passo: "Hipótese", pergunta: "Qual hipótese descreve o rompimento (continuação ou teste)?" },
  { passo: "Regra", pergunta: "Minha regra permite operar rompimentos?" },
  { passo: "Risco", pergunta: "Qual é o risco se o rompimento falhar?" },
  { passo: "Simulação", pergunta: "Simulei o cenário contrário?" },
  { passo: "Registro", pergunta: "A tese está registrada antes de decidir?" },
] as const;
