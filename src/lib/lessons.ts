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
  {
    slug: "trava-de-baixa",
    ordem: 11,
    nivel: 4,
    titulo: "Lição 11 — Trava de Baixa (Bear Put Spread)",
    resumo: "Compra put mais cara (ATM/ITM) + vende put mais barata (OTM). Aposta em queda com risco limitado.",
    analogia:
      "Guarda-chuva com franja: te protege se chover forte, mas se virar tempestade, a franja não segura tudo. Barato porque abre mão do extremo.",
    conteudo: `
## Montagem
- **Compra** put strike B (maior)
- **Vende** put strike A (menor)
- Mesmo vencimento

## Números (PETR4 a R$38)
- Compra PETRW38 por R$1,40
- Vende PETRW36 por R$0,50
- **Custo líquido**: R$0,90 por ação

## Payoff no vencimento
| Cenário | Resultado |
|---|---|
| PETR4 ≥ 38 | Perde os R$90 (prêmio pago) |
| PETR4 ≤ 36 | Ganha (38 − 36) − 0,90 = R$1,10 → R$110 lucro máx |

**Breakeven** = B − custo = R$37,10.
    `,
    quiz: [
      {
        pergunta: "Numa trava de baixa, o que garante que o risco é limitado?",
        alternativas: [
          "A put comprada de strike maior",
          "O custo líquido pago no início",
          "A put vendida",
          "A volatilidade implícita",
        ],
        correta: 1,
        explicacao: "A perda máxima é o débito pago — nada além disso, mesmo se o ativo disparar pra cima.",
      },
      {
        pergunta: "Compra put 38 e vende put 36, custo R$0,90. Qual o lucro máximo?",
        alternativas: ["R$0,90", "R$1,10", "R$2,00", "Ilimitado"],
        correta: 1,
        explicacao: "Lucro máx = (B − A) − custo = (38 − 36) − 0,90 = R$1,10 por ação.",
      },
      {
        pergunta: "Quando faz sentido montar trava de baixa em vez de comprar put pura?",
        alternativas: [
          "Quando espera queda extrema",
          "Quando espera queda moderada e quer pagar menos prêmio",
          "Quando não tem opinião de direção",
          "Nunca — put pura é sempre melhor",
        ],
        correta: 1,
        explicacao: "Trava barateia a aposta em queda em troca de tampar o ganho no extremo.",
      },
    ],
  },
  {
    slug: "rolagem-defensiva",
    ordem: 12,
    nivel: 4,
    titulo: "Lição 12 — Rolagem defensiva na prática",
    resumo: "Quando rolar salva a operação e quando é só empurrar prejuízo com o pé.",
    analogia:
      "Renegociar uma dívida: se te dá fôlego real pra pagar, vale. Se é só pra empurrar o boleto com juros maiores, tá cavando um buraco.",
    conteudo: `
## Critérios objetivos pra rolar

1. **A tese original ainda vale?** Se o motivo sumiu, encerra — não rola.
2. **O crédito líquido faz sentido?** Rolar com débito grande é pagar pra continuar errado.
3. **Você já rolou essa operação?** Se sim, encerra. **Máximo 1 rolagem.**

## Checklist antes de rolar
- [ ] Tese ainda intacta
- [ ] Rolagem gera crédito ou débito pequeno (< 30% do prêmio original)
- [ ] Novo vencimento cabe no seu prazo
- [ ] Ainda dentro do stop de perda definido nas regras

## Exemplo prático
Vendeu call PETRK40 por R$1,00. PETR4 subiu pra R$41.
- **Rolagem boa**: recompra por R$1,80, vende PETRL42 (próximo mês) por R$2,20 → crédito R$0,40 e mais tempo.
- **Rolagem ruim**: recompra por R$1,80, vende PETRK41 mesma série por R$0,50 → débito R$1,30 e sem tempo extra.
    `,
    quiz: [
      {
        pergunta: "Qual sinal indica que você NÃO deve rolar?",
        alternativas: [
          "A rolagem gera crédito",
          "Você já rolou essa mesma operação uma vez",
          "O vencimento ainda tem 20 dias",
          "O ativo mexeu 1%",
        ],
        correta: 1,
        explicacao: "Regra de ouro: no máximo 1 rolagem. Segunda tentativa é insistência, não estratégia.",
      },
      {
        pergunta: "Rolar com débito grande normalmente significa…",
        alternativas: [
          "Estratégia agressiva bem-executada",
          "Pagar pra continuar errado",
          "Que a corretora vai te cobrar menos IR",
          "Que o ativo vai voltar",
        ],
        correta: 1,
        explicacao: "Débito grande na rolagem é o mercado te dizendo que a nova aposta é cara — reavalie encerrar.",
      },
      {
        pergunta: "Antes de rolar, o primeiro item do checklist é:",
        alternativas: [
          "Ver se dá pra ganhar mais",
          "Confirmar se a tese original ainda vale",
          "Aumentar o tamanho da posição",
          "Trocar de ativo",
        ],
        correta: 1,
        explicacao: "Se a tese caiu, o certo é encerrar. Rolar só faz sentido quando o motivo original ainda existe.",
      },
    ],
  },
  {
    slug: "gestao-de-risco-travas",
    ordem: 13,
    nivel: 4,
    titulo: "Lição 13 — Gestão de risco em travas",
    resumo: "Position sizing, stop de perda e regra do 1% do patrimônio por operação.",
    analogia:
      "Cinto de segurança: você não usa esperando bater, mas quando bate, é ele que decide se você sai andando ou não.",
    conteudo: `
## Position sizing

Nunca arrisque mais de **1% do patrimônio líquido** por operação. Numa trava, o risco é o **débito pago** (ou a diferença entre strikes − crédito, se for trava de crédito).

## Exemplo
Patrimônio: R$50.000 → risco máximo por trade = R$500.

Trava de alta PETRK38/PETRK40 custa R$0,90 por ação = R$90 no lote (100).
- **Você pode montar até 5 lotes** (5 × R$90 = R$450, dentro do teto).

## Stop de perda

Defina no diário **antes de abrir**:
- Stop no prêmio (ex: se a trava valer 50% do custo, encerra).
- Stop no ativo (ex: se PETR4 furar R$36, encerra).
- Stop de tempo (ex: 5 dias pré-vencimento sem plano, encerra).

## Métrica que importa
**Expectativa matemática** = (prob acerto × ganho médio) − (prob erro × perda média). Se negativa, a operação é ruim mesmo quando dá certo às vezes.
    `,
    quiz: [
      {
        pergunta: "Regra do 1%: patrimônio de R$80.000, quanto arrisca no máximo por operação?",
        alternativas: ["R$80", "R$800", "R$8.000", "R$80.000"],
        correta: 1,
        explicacao: "1% de R$80.000 = R$800 de risco máximo por operação.",
      },
      {
        pergunta: "Numa trava de débito, o risco por lote é:",
        alternativas: [
          "A diferença entre strikes",
          "O débito líquido pago",
          "O valor total do ativo",
          "Ilimitado",
        ],
        correta: 1,
        explicacao: "Débito pago = perda máxima. Por isso trava de débito tem risco conhecido antes de abrir.",
      },
      {
        pergunta: "Uma operação com expectativa matemática negativa…",
        alternativas: [
          "Nunca dá lucro",
          "Pode dar lucro pontual, mas destrói o capital no longo prazo",
          "É boa se o setup for bonito",
          "Depende só da sorte",
        ],
        correta: 1,
        explicacao: "Expectativa negativa é insustentável — mesmo vitórias esporádicas não compensam a série de perdas.",
      },
    ],
  },
  {
    slug: "tributacao-basica",
    ordem: 14,
    nivel: 5,
    titulo: "Lição 14 — Tributação de opções (básico)",
    resumo: "15% sobre lucro líquido mensal (swing) e 20% em day trade. Opções não têm isenção dos R$20 mil.",
    analogia:
      "Aluguel de imóvel: todo mês você fecha as contas e paga o carnê. Não tem faixa de isenção como venda de ação — se lucrou, paga.",
    conteudo: `
## Alíquotas

| Tipo | Alíquota |
|---|---|
| Operação comum (swing) | **15%** sobre lucro líquido do mês |
| Day trade | **20%** sobre lucro líquido do mês |

## Sem isenção de R$20 mil

Diferente de ação à vista, **opções não têm isenção mensal**. Todo lucro é tributado.

## IRRF (imposto retido na fonte)
- Comum: **0,005%** sobre valor da venda ("dedo-duro")
- Day trade: **1%** sobre o lucro do dia

Serve pra Receita cruzar dados, mas você compensa no DARF mensal.

## Prejuízo compensa
Prejuízo de um mês **abate lucro futuro** — sem prazo de validade. Registre tudo no diário e no controle mensal.
    `,
    quiz: [
      {
        pergunta: "Lucrou R$3.000 em opções comuns no mês. Quanto de IR (fora IRRF)?",
        alternativas: ["R$150", "R$300", "R$450", "R$600"],
        correta: 2,
        explicacao: "15% × R$3.000 = R$450 de DARF, código 6015.",
      },
      {
        pergunta: "A isenção de R$20 mil/mês vale para opções?",
        alternativas: [
          "Sim, igual à venda de ações",
          "Não — opções são sempre tributadas",
          "Só em day trade",
          "Só em put",
        ],
        correta: 1,
        explicacao: "Isenção dos R$20 mil vale só pra ação à vista. Opções pagam a partir do primeiro real de lucro.",
      },
      {
        pergunta: "Alíquota de day trade em opções:",
        alternativas: ["15%", "17,5%", "20%", "22,5%"],
        correta: 2,
        explicacao: "Day trade = 20% sobre o lucro líquido mensal.",
      },
    ],
  },
  {
    slug: "darf-e-compensacao",
    ordem: 15,
    nivel: 5,
    titulo: "Lição 15 — DARF, compensação de prejuízo e controle mensal",
    resumo: "Como apurar, gerar DARF código 6015, e usar prejuízo pra abater lucro futuro sem prazo.",
    analogia:
      "Cartão de crédito da Receita: fecha dia último do mês, vence dia último do mês seguinte. Atrasou, pega multa e juros Selic.",
    conteudo: `
## Passo a passo mensal

1. **Some** lucros e prejuízos de cada operação encerrada no mês (separando swing de day trade).
2. **Compense** prejuízos acumulados de meses anteriores (mesma modalidade).
3. **Desconte** IRRF retido pela corretora.
4. **Gere DARF** no site da Receita (Sicalc), código **6015**.
5. **Pague até o último dia útil do mês seguinte.**

## Compensação de prejuízo
- Swing só compensa swing. Day trade só compensa day trade.
- **Sem prazo de validade** — prejuízo de 2019 ainda abate lucro de 2026.
- Precisa constar da declaração anual pra ser aceito.

## Exemplo
| Mês | Resultado | IRRF | A pagar |
|---|---|---|---|
| Jan | +R$1.000 | R$5 | 15%×1000 − 5 = R$145 |
| Fev | −R$800 | R$2 | Zero (acumula prejuízo R$800) |
| Mar | +R$1.500 | R$7 | 15%×(1500−800) − 7 = R$98 |

## Onde registrar
Planilha própria ou o **diário do Zero ao Trade** — os campos de resultado alimentam essa apuração.
    `,
    quiz: [
      {
        pergunta: "Prejuízo de swing pode compensar lucro de day trade?",
        alternativas: ["Sim, sempre", "Não — modalidades separadas", "Só no mesmo mês", "Só com autorização da Receita"],
        correta: 1,
        explicacao: "Compensação é estanque: swing com swing, day trade com day trade.",
      },
      {
        pergunta: "Qual o código do DARF de opções (swing)?",
        alternativas: ["6015", "8053", "0190", "4600"],
        correta: 0,
        explicacao: "6015 é o código pra ganhos líquidos em renda variável de pessoa física.",
      },
      {
        pergunta: "Prazo pra pagar o DARF do lucro de março:",
        alternativas: [
          "Até 31 de março",
          "Até o último dia útil de abril",
          "Até 30 de junho",
          "Só na declaração anual",
        ],
        correta: 1,
        explicacao: "Vence sempre no último dia útil do mês seguinte à apuração.",
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
