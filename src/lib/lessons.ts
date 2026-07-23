export type QuizQuestion = {
  pergunta: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
};

export type Lesson = {
  slug: string;
  ordem: number;
  nivel: 1 | 2 | 3 | 4 | 5;
  titulo: string;
  resumo: string;
  analogia: string;
  conteudo: string; // markdown
  quiz: QuizQuestion[];
};

export const LESSONS: Lesson[] = [
  {
    slug: "o-que-e-opcao",
    ordem: 1,
    nivel: 1,
    titulo: "Lição 1 — O que é uma opção",
    resumo: "O direito (não a obrigação) de comprar ou vender uma ação a um preço combinado.",
    analogia:
      "Pense num vale-ingresso pra um show: você paga um valor pequeno agora pra ter o direito de comprar o ingresso a R$100 no dia. Se o show bombar e o ingresso subir pra R$300, você exerce. Se ninguém quiser ir, você joga o vale fora.",
    conteudo: `
## O conceito

Uma opção é um **contrato** que dá o direito — nunca a obrigação — de comprar ou vender uma ação a um preço combinado até uma data.

- Você paga um **prêmio** pelo direito.
- Se o mercado for a seu favor, você exerce.
- Se não for, o máximo que perde é o prêmio pago.

## Americana vs Europeia

Na **B3**, quase todas as opções sobre ações são **americanas** (podem ser exercidas a qualquer momento até o vencimento). As opções de índice (IBOV) são **europeias** (só no vencimento).
    `,
    quiz: [
      {
        pergunta: "Qual das afirmações abaixo descreve corretamente uma opção?",
        alternativas: [
          "Obrigação de comprar a ação no vencimento",
          "Direito, mas não obrigação, de comprar ou vender a um preço fixo",
          "Empréstimo de ações da corretora",
          "Contrato futuro sem prêmio",
        ],
        correta: 1,
        explicacao: "Opção = direito. Você pode exercer ou não. O prêmio é o que você paga pelo direito.",
      },
      {
        pergunta: "Opções de ações na B3 são majoritariamente…",
        alternativas: ["Europeias", "Americanas", "Asiáticas", "Bermudianas"],
        correta: 1,
        explicacao: "Na B3, opções sobre ações são americanas — exercíveis até o vencimento.",
      },
      {
        pergunta: "Se você comprar uma opção e o mercado for contra você, sua perda máxima é:",
        alternativas: [
          "O valor total da ação",
          "Ilimitada",
          "O prêmio pago",
          "Zero",
        ],
        correta: 2,
        explicacao: "Comprador de opção tem perda limitada ao prêmio pago. É isso que a torna um seguro.",
      },
    ],
  },
  {
    slug: "call-vs-put",
    ordem: 2,
    nivel: 1,
    titulo: "Lição 2 — Call vs Put",
    resumo: "Call = direito de comprar. Put = direito de vender. Aprenda a decifrar o código B3.",
    analogia:
      "Call é o vale-ingresso (direito de comprar por preço fixo). Put é o seguro do carro (direito de vender por preço fixo mesmo se despencar).",
    conteudo: `
## Call
Direito de **comprar** a ação pelo strike. Você compra call quando **acredita que vai subir**.

## Put
Direito de **vender** a ação pelo strike. Você compra put quando **acredita que vai cair** — ou quer proteger uma posição comprada.

## Código B3
Ex: **PETRK38**
- **PETR** — ativo (Petrobras PN)
- **K** — mês e tipo (K = novembro Call; W = novembro Put)
- **38** — strike

| Letra | Mês (Call) | Mês (Put) |
|---|---|---|
| A / M | Jan | Jan |
| B / N | Fev | Fev |
| K / W | Nov | Nov |
| L / X | Dez | Dez |
    `,
    quiz: [
      {
        pergunta: "Você acha que PETR4 vai subir. Qual opção compra?",
        alternativas: ["Put", "Call", "Ação a descoberto", "Nenhuma"],
        correta: 1,
        explicacao: "Call = direito de comprar. Se subir, você exerce ou revende com lucro.",
      },
      {
        pergunta: "PETRK38 — o que significa o '38'?",
        alternativas: ["Data do vencimento", "Prêmio", "Strike (preço de exercício)", "Lote"],
        correta: 2,
        explicacao: "O número final do código é o strike — preço fixo do exercício.",
      },
      {
        pergunta: "Put serve para…",
        alternativas: [
          "Apostar em queda ou proteger posição comprada",
          "Alavancar em alta",
          "Receber dividendos",
          "Emprestar ações",
        ],
        correta: 0,
        explicacao: "Put dá direito de vender pelo strike — protege quem tem a ação e lucra em queda.",
      },
    ],
  },
  {
    slug: "premio-e-strike",
    ordem: 4,
    nivel: 2,
    titulo: "Lição 4 — Prêmio & Strike",
    resumo: "Valor intrínseco vs. extrínseco: onde mora o preço da opção.",
    analogia:
      "Iogurte: parte do preço é o iogurte em si (intrínseco), parte é o quanto falta pra vencer (extrínseco). Perto do vencimento, só sobra o iogurte.",
    conteudo: `
## Prêmio = intrínseco + extrínseco

- **Intrínseco**: quanto a opção já vale se exercida hoje.
  - Call: max(0, preço_ativo − strike)
  - Put:  max(0, strike − preço_ativo)
- **Extrínseco** (valor tempo + volatilidade): tudo o mais.

## Exemplo (PETR4 a R$38)
Call PETRK38 (strike 38) sendo negociada a R$1,50:
- Intrínseco: 0 (ATM)
- Extrínseco: R$1,50

Call PETRK36 (strike 36) sendo negociada a R$2,80:
- Intrínseco: 2,00
- Extrínseco: 0,80
    `,
    quiz: [
      {
        pergunta: "PETR4 = R$38. Call strike 35 cotada a R$3,50. Qual o valor intrínseco?",
        alternativas: ["R$0,00", "R$3,00", "R$3,50", "R$0,50"],
        correta: 1,
        explicacao: "Intrínseco de call = max(0, 38 − 35) = R$3,00. O restante (R$0,50) é extrínseco.",
      },
      {
        pergunta: "O que acontece com o valor extrínseco perto do vencimento?",
        alternativas: [
          "Aumenta muito",
          "Some (theta consome)",
          "Se transforma em dividendo",
          "Fica igual",
        ],
        correta: 1,
        explicacao: "Perto do vencimento, o extrínseco tende a zero — sobra só o intrínseco.",
      },
      {
        pergunta: "Uma opção com strike igual ao preço do ativo tem valor intrínseco…",
        alternativas: ["Positivo", "Negativo", "Zero", "Igual ao prêmio"],
        correta: 2,
        explicacao: "Strike = preço → intrínseco zero. É a definição de ATM (at-the-money).",
      },
    ],
  },
  {
    slug: "rolagem",
    ordem: 9,
    nivel: 4,
    titulo: "Lição 9 — Rolagem (Roll)",
    resumo: "Roll Out, Roll Up, Roll Down, Roll Up and Out — e a armadilha do rolar demais.",
    analogia:
      "Plano de celular com teto de dados: quando estoura, você paga pra prolongar (Roll Out) ou pra subir de plano (Roll Up). Fazer isso todo mês vira ralo.",
    conteudo: `
## O que é rolar

Encerrar uma opção que você já tem e **abrir outra** em seu lugar — com novo strike, novo vencimento, ou ambos.

| Tipo | O que muda |
|---|---|
| **Roll Out** | Mesmo strike, vencimento mais longe |
| **Roll Up** | Strike maior, mesmo vencimento |
| **Roll Down** | Strike menor, mesmo vencimento |
| **Roll Up and Out** | Strike maior + vencimento mais longe |

## A armadilha

Rolar uma operação é aceitar que **a tese original falhou** e apostar de novo com custo. Fazer isso repetidamente empilha prejuízo.

**Regra de ouro do guia:** no máximo **1 rolagem por operação**. Se falhou de novo, encerra.
    `,
    quiz: [
      {
        pergunta: "Você vendeu uma call strike 40. O ativo subiu pra 42 e você quer continuar posicionado. Qual roll faz sentido?",
        alternativas: ["Roll Down", "Roll Up (ou Up and Out)", "Encerrar sem rolar", "Roll Out sem mudar strike"],
        correta: 1,
        explicacao: "Subir o strike alivia o risco de exercício; mover o vencimento dá tempo.",
      },
      {
        pergunta: "Qual é o principal risco de rolar várias vezes?",
        alternativas: [
          "Perder isenção de IR",
          "Empilhar prejuízo negando que a tese falhou",
          "Ter a corretora bloqueada",
          "Ser tributado em dobro",
        ],
        correta: 1,
        explicacao: "Rolar demais é insistir num erro. O guia recomenda no máximo 1 roll por operação.",
      },
      {
        pergunta: "Roll Out significa:",
        alternativas: [
          "Mesmo strike, vencimento mais longe",
          "Strike maior, mesmo vencimento",
          "Zerar a operação",
          "Trocar de ativo",
        ],
        correta: 0,
        explicacao: "Roll Out = alongar o vencimento sem mexer no strike.",
      },
    ],
  },
  {
    slug: "trava-de-alta",
    ordem: 10,
    nivel: 4,
    titulo: "Lição 10 — Trava de Alta (Bull Call Spread)",
    resumo: "Compra uma call mais barata (ITM/ATM) + vende uma call mais cara (OTM). Risco e ganho limitados.",
    analogia:
      "Carro de corrida com limitador de velocidade: você ganha se andar rápido, mas o motor não passa de X. Em troca, o combustível (custo) é menor.",
    conteudo: `
## Montagem
- **Compra** call strike A (menor)
- **Vende** call strike B (maior)
- Mesmo vencimento

## Números (PETR4 a R$38)
- Compra PETRK38 por R$1,50
- Vende PETRK40 por R$0,60
- **Custo líquido**: R$0,90 por ação = R$90 no lote

## Payoff no vencimento
| Cenário | Resultado |
|---|---|
| PETR4 ≤ 38 | Perde os R$90 (prêmio líquido) |
| PETR4 = 40+ | Ganha (40 − 38) − 0,90 = R$1,10 → R$110 lucro máximo |

**Lucro máximo** = (B − A) − custo = (40 − 38) − 0,90 = R$1,10.
**Perda máxima** = custo = R$0,90.
**Breakeven** = A + custo = R$38,90.
    `,
    quiz: [
      {
        pergunta: "Numa trava de alta, o que limita o ganho?",
        alternativas: [
          "A call comprada",
          "A call vendida (strike superior)",
          "O vencimento",
          "A volatilidade",
        ],
        correta: 1,
        explicacao: "A call vendida no strike superior tampona o ganho — o preço de ter a estrutura mais barata.",
      },
      {
        pergunta: "Qual a perda máxima de uma trava de alta com custo líquido de R$0,90?",
        alternativas: ["Ilimitada", "R$0,90 por ação", "R$2,00 por ação", "Zero"],
        correta: 1,
        explicacao: "Perda máxima = custo líquido pago. É por isso que a trava é 'risco limitado'.",
      },
      {
        pergunta: "Compra call 38 e vende call 40, custo R$0,90. Qual o breakeven?",
        alternativas: ["R$37,10", "R$38,00", "R$38,90", "R$40,00"],
        correta: 2,
        explicacao: "Breakeven = strike comprado + custo = 38 + 0,90 = R$38,90.",
      },
    ],
  },
];

export function getLesson(slug: string) {
  return LESSONS.find((l) => l.slug === slug);
}

export const NIVEIS = {
  1: "Fundamentos",
  2: "Preço & Tempo",
  3: "Estratégias básicas",
  4: "Rolagem & Travas",
  5: "Tributação",
};
