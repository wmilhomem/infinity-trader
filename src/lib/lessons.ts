export type QuizQuestion = {
  pergunta: string;
  alternativas: string[];
  correta: number;
  explicacao: string;
};

export type Exercise = {
  titulo: string;
  enunciado: string;
  dica?: string;
  gabarito: string;
};

export type LessonProblema = {
  titulo: string;
  texto: string;
  pergunta: string;
};

export type LessonConceito = {
  titulo: string;
  corpo: string;
};

export type LessonNaPratica = {
  titulo: string;
  passos: string[];
};

export type LessonMissao = {
  titulo: string;
  texto: string;
};

export type Lesson = {
  slug: string;
  ordem: number;
  nivel: 1 | 2 | 3 | 4 | 5;
  titulo: string;
  resumo: string;
  problema: LessonProblema;
  conceitos: LessonConceito[];
  analogia: string;
  naPratica: LessonNaPratica;
  missao: LessonMissao;
  quiz: QuizQuestion[];
  exercicios?: Exercise[];
};

export const LESSONS: Lesson[] = [
  {
    slug: "o-que-e-opcao",
    ordem: 1,
    nivel: 1,
    titulo: "Lição 1 — O que é uma opção",
    resumo: "O direito (não a obrigação) de comprar ou vender uma ação a um preço combinado.",
    problema: {
      titulo: "O show que lota em minutos",
      texto:
        "Ana quer garantir o direito de comprar o ingresso do show do ano a R$100 — mesmo que ele dispare para R$300. Só que ela não quer obrigação: se ninguém quiser ir, ela prefere perder só o que pagou pelo direito, não o ingresso inteiro.",
      pergunta: "Como garantir um preço no futuro sem se comprometer a comprar?",
    },
    conceitos: [
      {
        titulo: "O conceito",
        corpo: `
Uma opção é um **contrato** que dá o direito — nunca a obrigação — de comprar ou vender uma ação a um preço combinado até uma data.

- Você paga um **prêmio** pelo direito.
- Se o mercado for a seu favor, você exerce.
- Se não for, o máximo que perde é o prêmio pago.
        `,
      },
      {
        titulo: "Americana vs Europeia",
        corpo: `
Na **B3**, quase todas as opções sobre ações são **americanas** (podem ser exercidas a qualquer momento até o vencimento). As opções de índice (IBOV) são **europeias** (só no vencimento).
        `,
      },
    ],
    analogia:
      "Pense num vale-ingresso pra um show: você paga um valor pequeno agora pra ter o direito de comprar o ingresso a R$100 no dia. Se o show bombar e o ingresso subir pra R$300, você exerce. Se ninguém quiser ir, você joga o vale fora.",
    naPratica: {
      titulo: "Antes de comprar qualquer opção",
      passos: [
        "Qual é o preço combinado (strike)?",
        "Até quando o direito vale (vencimento)?",
        "Quanto custa o direito (prêmio)?",
        "Quanto estou disposto a perder inteiro?",
      ],
    },
    missao: {
      titulo: "Garanta a compra",
      texto:
        "Você tem R$1.000 e quer garantir o direito de comprar PETR4 a R$38 em qualquer dia do próximo mês — sem se obrigar a comprar. Em uma frase: o que você precisa comprar e quanto perde no máximo se desistir?",
    },
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
        explicacao:
          "Opção = direito. Você pode exercer ou não. O prêmio é o que você paga pelo direito.",
      },
      {
        pergunta: "Opções de ações na B3 são majoritariamente…",
        alternativas: ["Europeias", "Americanas", "Asiáticas", "Bermudianas"],
        correta: 1,
        explicacao: "Na B3, opções sobre ações são americanas — exercíveis até o vencimento.",
      },
      {
        pergunta: "Se você comprar uma opção e o mercado for contra você, sua perda máxima é:",
        alternativas: ["O valor total da ação", "Ilimitada", "O prêmio pago", "Zero"],
        correta: 2,
        explicacao:
          "Comprador de opção tem perda limitada ao prêmio pago. É isso que a torna um seguro.",
      },
    ],
  },
  {
    slug: "call-vs-put",
    ordem: 2,
    nivel: 1,
    titulo: "Lição 2 — Call vs Put",
    resumo: "Call = direito de comprar. Put = direito de vender. Aprenda a decifrar o código B3.",
    problema: {
      titulo: "Duas amigas, duas apostas",
      texto:
        "PETR4 está a R$38. Você lê que o petróleo vai subir e acha que a ação vai atrás. Sua amiga acha que o preço já subiu demais e vai corrigir. As duas querem operar opções para apostar na própria direção.",
      pergunta: "Qual instrumento cada uma usa — e o que cada direito permite fazer?",
    },
    conceitos: [
      {
        titulo: "Call",
        corpo: `
Direito de **comprar** a ação pelo strike. Você compra call quando **acredita que vai subir**.
        `,
      },
      {
        titulo: "Put",
        corpo: `
Direito de **vender** a ação pelo strike. Você compra put quando **acredita que vai cair** — ou quer proteger uma posição comprada.
        `,
      },
      {
        titulo: "Código B3",
        corpo: `
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
      },
    ],
    analogia:
      "Call é o vale-ingresso (direito de comprar por preço fixo). Put é o seguro do carro (direito de vender por preço fixo mesmo se despencar).",
    naPratica: {
      titulo: "Da direção ao instrumento",
      passos: [
        "Espera alta → compra call.",
        "Espera queda → compra put.",
        "Tem ações e teme queda → put de proteção (não vende as ações).",
        "Confere o código B3: ativo + letra (mês/tipo) + strike.",
      ],
    },
    missao: {
      titulo: "Escolha a perna certa",
      texto:
        "PETR4 a R$38. Você espera que o preço suba. Em uma frase: qual série você compra (K38 ou W38) e o que essa opção te dá o direito de fazer?",
    },
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
        explicacao:
          "Put dá direito de vender pelo strike — protege quem tem a ação e lucra em queda.",
      },
    ],
  },
  {
    slug: "vencimento-e-exercicio",
    ordem: 3,
    nivel: 1,
    titulo: "Lição 3 — Vencimento, exercício e liquidez",
    resumo:
      "Como funciona a data de vencimento na B3, exercício automático e o risco de ficar preso.",
    problema: {
      titulo: "O relógio que não avisa",
      texto:
        "Você comprou uma call, o ativo subiu exatamente como você previu — mas o vencimento chegou e passou. O direito que valia ouro na sexta virou pó na segunda. E na hora de sair, ninguém queria comprar sua opção a preço justo.",
      pergunta:
        "O que exatamente acontece na data de vencimento — e por que a liquidez pode te prender antes dela?",
    },
    conceitos: [
      {
        titulo: "Quando vence",
        corpo: `
Na B3, opções sobre ações vencem na **terceira sexta-feira** do mês (se for feriado, no dia útil seguinte). Depois disso, o contrato deixa de existir.
        `,
      },
      {
        titulo: "Exercício",
        corpo: `
- **ITM (dentro do dinheiro)** no vencimento → normalmente exercida automaticamente pela corretora.
- **OTM (fora do dinheiro)** → vira pó. Você perde o prêmio pago.

Se você **vendeu** a opção e ela vira ITM, você pode ser exercido: precisa entregar (call) ou comprar (put) as ações.
        `,
      },
      {
        titulo: "Liquidez: o risco silencioso",
        corpo: `
Estar certo na direção não basta se não houver contraparte. Antes de entrar, olhe:

- Volume negociado no dia
- Número de negócios (não só o volume financeiro)
- Spread entre compra e venda

Regra prática: opções com strike próximo do preço atual e vencimento mais curto costumam ter mais liquidez. Séries distantes viram armadilha.
        `,
      },
    ],
    analogia:
      "O vale-ingresso tem prazo. Passou a data, virou papel. E se ninguém quiser comprar seu vale antes, você só tem duas saídas: usar ou perder.",
    naPratica: {
      titulo: "Check de 30 segundos antes de entrar",
      passos: [
        "Volume do dia na série (existe negócio?).",
        "Número de negócios — não só o volume financeiro.",
        "Spread menor que ~10% do prêmio.",
        "Strike próximo do preço e vencimento líquido.",
      ],
    },
    missao: {
      titulo: "Saia quando quiser",
      texto:
        "Você quer operar a série PETRK38. Em 3 passos, como você confirma, antes de entrar, que vai conseguir sair dela a preço justo?",
    },
    quiz: [
      {
        pergunta: "Quando vencem as opções sobre ações na B3?",
        alternativas: [
          "Último dia útil do mês",
          "Terceira sexta-feira do mês",
          "Primeira segunda-feira do mês",
          "Todo dia 15",
        ],
        correta: 1,
        explicacao: "Vencimento é na terceira sexta-feira (ou no dia útil seguinte, se feriado).",
      },
      {
        pergunta: "Você comprou uma call que terminou OTM no vencimento. O que acontece?",
        alternativas: [
          "É exercida automaticamente",
          "Vira pó e você perde o prêmio",
          "Rola para o mês seguinte",
          "Vira ação na sua carteira",
        ],
        correta: 1,
        explicacao: "Opção OTM no vencimento expira sem valor. A perda é o prêmio pago.",
      },
      {
        pergunta: "Por que liquidez importa tanto em opções?",
        alternativas: [
          "Porque define o strike",
          "Porque sem contraparte você não consegue sair da posição a preço justo",
          "Porque reduz o imposto",
          "Porque aumenta o valor intrínseco",
        ],
        correta: 1,
        explicacao: "Sem liquidez, o spread engole o lucro e você pode ficar preso na posição.",
      },
    ],
    exercicios: [
      {
        titulo: "Checagem de liquidez",
        enunciado:
          "Antes da próxima simulação, escolha uma série de opção e anote: volume do dia, número de negócios e spread compra/venda. Decida se você entraria.",
        dica: "Spread maior que 10% do prêmio já é um sinal amarelo forte.",
        gabarito:
          "Não existe número mágico, mas: negócios abaixo de ~50 no dia e spread acima de 10% do prêmio geralmente indicam série ruim para operar. Prefira strikes próximos do preço atual e o vencimento mais líquido do momento.",
      },
    ],
  },
  {
    slug: "premio-e-strike",
    ordem: 4,
    nivel: 2,
    titulo: "Lição 4 — Prêmio & Strike",
    resumo: "Valor intrínseco vs. extrínseco: onde mora o preço da opção.",
    problema: {
      titulo: "Por que a K36 custa o dobro?",
      texto:
        "PETR4 está a R$38. A call K38 custa R$1,50 e a call K36 custa R$2,80. Quase o dobro pelo mesmo ativo, mesmo vencimento. Você vai pagar a mais sem saber o que está comprando?",
      pergunta: "De onde vem essa diferença de R$1,30 no prêmio?",
    },
    conceitos: [
      {
        titulo: "Prêmio = intrínseco + extrínseco",
        corpo: `
- **Intrínseco**: quanto a opção já vale se exercida hoje.
  - Call: max(0, preço_ativo − strike)
  - Put:  max(0, strike − preço_ativo)
- **Extrínseco** (valor tempo + volatilidade): tudo o mais.
        `,
      },
      {
        titulo: "Exemplo (PETR4 a R$38)",
        corpo: `
Call PETRK38 (strike 38) sendo negociada a R$1,50:

- Intrínseco: 0 (ATM)
- Extrínseco: R$1,50

Call PETRK36 (strike 36) sendo negociada a R$2,80:

- Intrínseco: 2,00
- Extrínseco: 0,80
        `,
      },
    ],
    analogia:
      "Iogurte: parte do preço é o iogurte em si (intrínseco), parte é o quanto falta pra vencer (extrínseco). Perto do vencimento, só sobra o iogurte.",
    naPratica: {
      titulo: "Antes de pagar qualquer prêmio",
      passos: [
        "Calcule o intrínseco com a fórmula (o que a opção já vale hoje).",
        "O restante é extrínseco — expectativa de tempo e volatilidade.",
        "Pergunte: estou pagando pelo que já existe ou pelo que pode acontecer?",
      ],
    },
    missao: {
      titulo: "Separe o preço",
      texto:
        "PETR4 a R$38. Call K36 a R$2,80. Em uma frase: quanto desse prêmio é o que a opção já vale hoje, e quanto é expectativa?",
    },
    quiz: [
      {
        pergunta: "PETR4 = R$38. Call strike 35 cotada a R$3,50. Qual o valor intrínseco?",
        alternativas: ["R$0,00", "R$3,00", "R$3,50", "R$0,50"],
        correta: 1,
        explicacao:
          "Intrínseco de call = max(0, 38 − 35) = R$3,00. O restante (R$0,50) é extrínseco.",
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
    slug: "moneyness",
    ordem: 5,
    nivel: 2,
    titulo: "Lição 5 — Moneyness: ITM, ATM e OTM",
    resumo:
      "Onde o strike está em relação ao preço — e como isso muda risco, custo e probabilidade.",
    problema: {
      titulo: "O strike que parece um achado",
      texto:
        "Você quer apostar que PETR4 sobe. A call K44 custa R$0,30 — parece um achado comparado aos R$4,50 da K34. 'Se subir um pouquinho, multiplico.' Será que o mercado está te dando dinheiro?",
      pergunta: "Por que a barata é barata — e o que ela te obriga a acertar?",
    },
    conceitos: [
      {
        titulo: "Os três estados",
        corpo: `
Para uma **call** com o ativo a R$38:

| Strike | Estado | Prêmio | Chance de virar pó |
|---|---|---|---|
| 34 | ITM (dentro) | alto | baixa |
| 38 | ATM (no dinheiro) | médio | média |
| 44 | OTM (fora) | baixo | alta |

Para uma **put**, é o inverso: strike acima do preço é ITM.
        `,
      },
      {
        titulo: "O trade-off que ninguém conta",
        corpo: `
- **OTM barata** = alta alavancagem, alta probabilidade de perder 100%.
- **ITM cara** = menos alavancagem, comportamento mais parecido com a ação.
- **ATM** = maior valor extrínseco e maior sensibilidade ao tempo.

O erro clássico do iniciante é comprar OTM muito distante porque "está barato". Barato não é o mesmo que ter valor esperado positivo.
        `,
      },
    ],
    analogia:
      "Comprar OTM é bilhete de loteria barato: quase sempre vira pó, mas paga muito quando acerta. Comprar ITM é comprar a ação com desconto alavancado: caro, porém com mais chance.",
    naPratica: {
      titulo: "Escolha o strike pela probabilidade",
      passos: [
        "Qual movimento eu espero (direção)?",
        "De quanto (magnitude)?",
        "Em quanto tempo (prazo)?",
        "Esse movimento acontece com frequência nesse prazo? Se não, a operação já nasce perdida.",
      ],
    },
    missao: {
      titulo: "Elimine um strike",
      texto:
        "PETR4 a R$38. Você espera +5% em 30 dias. Entre a K34 (ITM), a K38 (ATM) e a K44 (OTM), qual strike você descarta na hora — e por quê (uma frase)?",
    },
    quiz: [
      {
        pergunta: "Ativo a R$38. Uma call de strike 44 está…",
        alternativas: ["ITM", "ATM", "OTM", "Exercida"],
        correta: 2,
        explicacao: "Call com strike acima do preço está fora do dinheiro (OTM).",
      },
      {
        pergunta: "Por que opções OTM distantes são perigosas para iniciantes?",
        alternativas: [
          "Porque têm imposto maior",
          "Porque são baratas mas exigem movimentos improváveis e viram pó com frequência",
          "Porque não podem ser vendidas",
          "Porque não têm valor extrínseco",
        ],
        correta: 1,
        explicacao: "O preço baixo reflete a baixa probabilidade. Barato ≠ bom negócio.",
      },
      {
        pergunta: "Ativo a R$38. Put de strike 42 está…",
        alternativas: ["OTM", "ITM", "ATM", "Sem valor"],
        correta: 1,
        explicacao: "Put com strike acima do preço tem intrínseco: 42 − 38 = R$4,00. É ITM.",
      },
    ],
    exercicios: [
      {
        titulo: "Classifique os strikes",
        enunciado:
          "Ativo a R$25,00. Classifique como ITM/ATM/OTM: (a) call 22, (b) call 25, (c) call 28, (d) put 22, (e) put 28.",
        gabarito: "(a) ITM · (b) ATM · (c) OTM · (d) OTM · (e) ITM.",
      },
    ],
  },
  {
    slug: "theta-e-tempo",
    ordem: 6,
    nivel: 2,
    titulo: "Lição 6 — Theta: o tempo corrói o comprador",
    resumo:
      "Por que a opção perde valor mesmo com o ativo parado — e o que isso muda na sua decisão.",
    problema: {
      titulo: "O dinheiro que sumiu no fim de semana",
      texto:
        "Você comprou uma call na sexta-feira. Na segunda, o ativo não mexeu nada — mas sua opção vale menos. Ninguém vendeu nada, nenhuma notícia, só o calendário virou a página.",
      pergunta: "Para onde foi o dinheiro?",
    },
    conceitos: [
      {
        titulo: "O que é theta",
        corpo: `
**Theta** mede quanto de prêmio a opção perde por dia só pela passagem do tempo. É negativo para quem compra e positivo para quem vende.
        `,
      },
      {
        titulo: "A curva não é linear",
        corpo: `
A perda de valor extrínseco acelera nas últimas semanas antes do vencimento. Uma opção que perde R$0,02/dia a 60 dias do vencimento pode perder R$0,10/dia na última semana.
        `,
      },
      {
        titulo: "Consequências práticas",
        corpo: `
1. **Comprador precisa de movimento e de prazo.** Estar certo tarde demais é o mesmo que estar errado.
2. **Vencimento muito curto** é atrativo pelo preço e letal pelo theta.
3. **Vendedor lucra com o tempo**, mas assume risco assimétrico — por isso venda descoberta não é operação de iniciante.
        `,
      },
      {
        titulo: "Regra de bolso",
        corpo: `
Se sua tese depende de um evento com data (balanço, decisão de juros), escolha um vencimento com folga depois da data. Comprar a opção que vence antes do evento é pagar para não participar dele.
        `,
      },
    ],
    analogia:
      "Opção é gelo no sol. Todo dia derrete um pouco, e nos últimos dias derrete muito mais rápido.",
    naPratica: {
      titulo: "Antes de comprar, responda",
      passos: [
        "Quanto o theta tira da minha opção por dia?",
        "Meu vencimento tem folga depois do evento da minha tese?",
        "Se o ativo ficar parado, eu aguento a corrosão?",
        "Se 'estar certo tarde demais é estar errado', qual é a minha data-limite?",
      ],
    },
    missao: {
      titulo: "Escolha o prazo com folga",
      texto:
        "O balanço da PETR4 sai em 20 dias. A call de 10 dias custa metade da de 30 dias. Qual você compra — e qual é o motivo em uma frase?",
    },
    quiz: [
      {
        pergunta: "O theta é favorável a quem?",
        alternativas: [
          "Ao comprador da opção",
          "Ao vendedor da opção",
          "A ninguém",
          "Depende do strike apenas",
        ],
        correta: 1,
        explicacao: "O tempo destrói o extrínseco: prejudica o comprador e beneficia o vendedor.",
      },
      {
        pergunta: "Como se comporta a perda por theta perto do vencimento?",
        alternativas: [
          "Constante todos os dias",
          "Acelera nas últimas semanas",
          "Desacelera",
          "Vira positiva",
        ],
        correta: 1,
        explicacao: "A corrosão do extrínseco acelera perto do vencimento.",
      },
      {
        pergunta: "Sua tese depende de um balanço daqui a 20 dias. O que faz sentido?",
        alternativas: [
          "Comprar opção que vence em 10 dias porque é mais barata",
          "Escolher vencimento com folga após o balanço",
          "Comprar OTM muito distante",
          "Vender opção descoberta",
        ],
        correta: 1,
        explicacao:
          "Prazo insuficiente faz você pagar prêmio e não participar do evento que sustenta a tese.",
      },
    ],
    exercicios: [
      {
        titulo: "Estime a corrosão",
        enunciado:
          "Uma call ATM custa R$1,20 e faltam 30 dias corridos para o vencimento. O ativo fica parado. Estime o prêmio a 15 dias e a 3 dias do vencimento.",
        dica: "A queda não é linear: pense em cerca de 30% do extrínseco na primeira metade e o restante acelerando.",
        gabarito:
          "Ordem de grandeza: ~R$0,80 a 15 dias e ~R$0,25 a 3 dias. O ponto não é o número exato — é perceber que ficar parado já é prejuízo para o comprador.",
      },
      {
        titulo: "Regra pessoal de prazo",
        enunciado:
          "Escreva uma regra do tipo: 'Não compro opção com menos de N dias para o vencimento'.",
        gabarito:
          "Exemplo de regra válida: 'Só compro opção seca com no mínimo 20 dias corridos até o vencimento, e com folga de pelo menos 5 dias após qualquer evento agendado da minha tese'. Cadastre em Regras.",
      },
    ],
  },
  {
    slug: "compra-a-seco",
    ordem: 7,
    nivel: 3,
    titulo: "Lição 7 — Compra a seco (call/put seca)",
    resumo:
      "A estratégia mais simples e a que mais quebra iniciante. Como usar com risco definido.",
    problema: {
      titulo: "Nenhuma perda era grande",
      texto:
        "R$500 na conta. A call custa R$1,20. 'Aposta pequena, perda pequena.' A primeira vira pó. A segunda também. Dezoito operações depois — nenhuma perda individual era grande — a conta está vazia.",
      pergunta: "Se cada perda era pequena, onde foi parar o dinheiro?",
    },
    conceitos: [
      {
        titulo: "O que é",
        corpo: `
Comprar uma call (ou put) isolada, sem nenhuma outra perna.

- **Risco máximo:** o prêmio pago (conhecido desde o início).
- **Ganho máximo:** teoricamente ilimitado na call.
- **Breakeven da call:** strike + prêmio.
- **Breakeven da put:** strike − prêmio.
        `,
      },
      {
        titulo: "Por que quebra tanta gente",
        corpo: `
O risco não está na perda máxima — está na **frequência**. Você pode perder 100% do valor investido em cada operação, várias vezes seguidas. Sem controle de tamanho de posição, dez tentativas erradas zeram a conta.
        `,
      },
    ],
    analogia:
      "É apostar num pênalti: perda limitada ao valor da aposta, mas a maioria dos chutes vai pra fora.",
    naPratica: {
      titulo: "Como usar com processo",
      passos: [
        "Defina o tamanho: no máximo 1% do capital por operação.",
        "Defina a tese: qual movimento, de quanto, até quando.",
        "Defina a saída: alvo de lucro e stop no prêmio (ex.: sair a −50%).",
        "Registre no diário antes de entrar.",
      ],
    },
    missao: {
      titulo: "Dimensione antes de entrar",
      texto:
        "Capital de R$20.000, regra do 1%, call a R$0,80 (lote de 100). Em uma frase: quantos lotes cabem — e qual é a sua saída combinada antes de enviar a ordem?",
    },
    quiz: [
      {
        pergunta: "Call strike 40 comprada por R$1,50. Qual o breakeven no vencimento?",
        alternativas: ["R$38,50", "R$40,00", "R$41,50", "R$43,00"],
        correta: 2,
        explicacao: "Breakeven da call = strike + prêmio = 40 + 1,50 = R$41,50.",
      },
      {
        pergunta: "Qual o principal risco prático da compra a seco?",
        alternativas: [
          "Perda ilimitada",
          "Chamada de margem",
          "Alta frequência de perdas totais do prêmio",
          "Impossibilidade de sair antes do vencimento",
        ],
        correta: 2,
        explicacao:
          "A perda é limitada, mas acontece com muita frequência — o que destrói contas mal dimensionadas.",
      },
      {
        pergunta: "Qual controle é indispensável na compra a seco?",
        alternativas: [
          "Comprar sempre OTM distante",
          "Tamanho de posição limitado por operação",
          "Rolar sempre no vencimento",
          "Operar só no dia do vencimento",
        ],
        correta: 1,
        explicacao: "Position sizing é o que impede que uma sequência normal de perdas vire ruína.",
      },
    ],
    exercicios: [
      {
        titulo: "Dimensione a operação",
        enunciado:
          "Capital de R$20.000, risco máximo de 1% por operação. A call custa R$0,80 (lote de 100). Quantos lotes cabem?",
        gabarito:
          "1% de R$20.000 = R$200. Cada lote custa 100 × R$0,80 = R$80. Cabem 2 lotes (R$160). O terceiro lote estouraria o limite.",
      },
      {
        titulo: "Monte no simulador",
        enunciado:
          "Simule uma call seca e escreva a tese no diário antes de considerar a operação real.",
        gabarito:
          "Tese completa contém: direção, magnitude esperada, prazo, breakeven calculado, alvo e stop no prêmio. Se faltar algum item, a operação ainda não está pronta.",
      },
    ],
  },
  {
    slug: "venda-coberta",
    ordem: 8,
    nivel: 3,
    titulo: "Lição 8 — Venda coberta",
    resumo:
      "Gerar renda com ações que você já tem — e entender o que você está vendendo de verdade.",
    problema: {
      titulo: "O aluguel que pode virar venda",
      texto:
        "Você tem 100 ações da Petrobras e quer ganhar algo com elas. Alguém te oferece R$90 agora — em troca, você aceita vender suas ações por R$33 se o preço subir até lá. Parece aluguel. Mas é?",
      pergunta: "O que você está vendendo de verdade quando recebe esse dinheiro?",
    },
    conceitos: [
      {
        titulo: "Como funciona",
        corpo: `
Você tem 100 ações e **vende uma call** sobre elas.

- Recebe o prêmio imediatamente.
- Se no vencimento o ativo estiver abaixo do strike: fica com as ações e com o prêmio.
- Se estiver acima: é exercido e vende as ações pelo strike.
        `,
      },
      {
        titulo: "O que você realmente vendeu",
        corpo: `
Você vendeu a **alta acima do strike**. Em troca, recebeu um prêmio fixo. Isso significa:

- **Ganho limitado**: strike + prêmio − preço de compra da ação.
- **Proteção parcial na queda**: apenas o valor do prêmio.
- O risco de queda da ação continua todo com você.
        `,
      },
      {
        titulo: "Escolha do strike",
        corpo: `
- Strike próximo do preço: prêmio maior, chance alta de ser exercido.
- Strike distante: prêmio pequeno, mais chance de manter as ações.
        `,
      },
    ],
    analogia:
      "É alugar seu imóvel com opção de compra: você recebe o aluguel agora, mas aceita vender pelo preço combinado se o inquilino quiser.",
    naPratica: {
      titulo: "Antes de vender a call",
      passos: [
        "Você aceitaria vender a ação nesse strike? Se não, não venda a call.",
        "Quanto o prêmio protege da queda? (Só o prêmio — o resto é seu.)",
        "Se o ativo disparar, qual é o desfecho aceito por você?",
        "Nada de 'rolar para não ser exercido' — isso vira ralo.",
      ],
    },
    missao: {
      titulo: "Escolha o strike",
      texto:
        "Você comprou a ação a R$30 e quer prêmio. A call K33 paga R$0,90; a K36 paga R$0,30. Em uma frase: qual strike você vende — e em que preço você aceita vender a ação de verdade?",
    },
    quiz: [
      {
        pergunta: "Na venda coberta, o que limita o seu ganho?",
        alternativas: [
          "O prêmio recebido apenas",
          "O strike da call vendida",
          "O vencimento",
          "Nada, o ganho é ilimitado",
        ],
        correta: 1,
        explicacao: "Acima do strike você é exercido: o ganho para em strike + prêmio.",
      },
      {
        pergunta: "Qual proteção a venda coberta oferece em uma queda forte do ativo?",
        alternativas: [
          "Proteção total",
          "Proteção equivalente ao prêmio recebido",
          "Proteção até o strike",
          "Nenhuma proteção",
        ],
        correta: 1,
        explicacao:
          "O prêmio amortece a queda apenas no valor recebido. O resto do risco continua seu.",
      },
      {
        pergunta: "Qual critério correto para escolher o strike da venda coberta?",
        alternativas: [
          "O que pagar o maior prêmio, sempre",
          "Um strike no qual você aceitaria vender a ação",
          "O mais distante possível",
          "O do vencimento mais curto",
        ],
        correta: 1,
        explicacao:
          "Se você não aceita vender naquele preço, a operação vira uma armadilha de rolagens caras.",
      },
    ],
    exercicios: [
      {
        titulo: "Calcule o resultado",
        enunciado:
          "Você comprou a ação a R$30,00 e vendeu call strike 33 por R$0,90. Qual o resultado se no vencimento o ativo estiver a (a) R$28, (b) R$32, (c) R$36?",
        gabarito:
          "(a) −R$2,00 na ação + R$0,90 = −R$1,10 por ação. (b) +R$2,00 + R$0,90 = +R$2,90. (c) exercido: +R$3,00 (30→33) + R$0,90 = +R$3,90 — teto do ganho, mesmo com o ativo a R$36.",
      },
      {
        titulo: "Regra de venda coberta",
        enunciado: "Escreva uma regra pessoal definindo em que strike você aceita ser exercido.",
        gabarito:
          "Exemplo: 'Só vendo call coberta em strike pelo menos 8% acima do meu preço médio, e aceito o exercício sem rolar'. Cadastre em Regras.",
      },
    ],
  },
  {
    slug: "rolagem",
    ordem: 9,
    nivel: 4,
    titulo: "Lição 9 — Rolagem (Roll)",
    resumo: "Roll Out, Roll Up, Roll Down, Roll Up and Out — e a armadilha do rolar demais.",
    problema: {
      titulo: "A call que ficou contra você",
      texto:
        "Você vendeu uma call K40 por R$1,20. O ativo subiu para R$41,50 e o vencimento está a 8 dias. Se não fizer nada, você é exercido e entrega as ações. A mesa de opções da sua corretora sugere: 'rola pro próximo mês que resolve'.",
      pergunta: "Rolar resolve — ou só adia?",
    },
    conceitos: [
      {
        titulo: "O que é rolar",
        corpo: `
Encerrar uma opção que você já tem e **abrir outra** em seu lugar — com novo strike, novo vencimento, ou ambos.

| Tipo | O que muda |
|---|---|
| **Roll Out** | Mesmo strike, vencimento mais longe |
| **Roll Up** | Strike maior, mesmo vencimento |
| **Roll Down** | Strike menor, mesmo vencimento |
| **Roll Up and Out** | Strike maior + vencimento mais longe |
        `,
      },
      {
        titulo: "A armadilha",
        corpo: `
Rolar uma operação é aceitar que **a tese original falhou** e apostar de novo com custo. Fazer isso repetidamente empilha prejuízo.

**Regra de ouro do guia:** no máximo **1 rolagem por operação**. Se falhou de novo, encerra.
        `,
      },
    ],
    analogia:
      "Plano de celular com teto de dados: quando estoura, você paga pra prolongar (Roll Out) ou pra subir de plano (Roll Up). Fazer isso todo mês vira ralo.",
    naPratica: {
      titulo: "Antes de rolar, responda",
      passos: [
        "A tese original ainda vale? Se o motivo sumiu, encerra — não rola.",
        "Já rolei essa operação? Se sim, encerra. Máximo 1 rolagem.",
        "A rolagem sai a crédito ou a débito pequeno (< 30% do prêmio original)?",
        "Se falhar de novo, eu encerro mesmo?",
      ],
    },
    missao: {
      titulo: "O limite é uma regra",
      texto:
        "Sua call já foi rolada uma vez e estourou de novo. Em uma frase: o que você faz agora — e qual regra do guia te dá essa resposta?",
    },
    quiz: [
      {
        pergunta:
          "Você vendeu uma call strike 40. O ativo subiu pra 42 e você quer continuar posicionado. Qual roll faz sentido?",
        alternativas: [
          "Roll Down",
          "Roll Up (ou Up and Out)",
          "Encerrar sem rolar",
          "Roll Out sem mudar strike",
        ],
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
        explicacao:
          "Rolar demais é insistir num erro. O guia recomenda no máximo 1 roll por operação.",
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
    exercicios: [
      {
        titulo: "Diagnóstico de rolagem",
        enunciado:
          "Você vendeu uma call PETRK40 por R$1,20. Faltam 8 dias pro vencimento e PETR4 está a R$41,50. A call agora vale R$1,80. Rolar Up and Out pra PETRL42 (próximo mês) sai a débito de R$0,30. Deve rolar? Justifique com os 3 critérios da lição.",
        dica: "Tese ainda vale? Débito é pequeno? Já rolou antes?",
        gabarito:
          "Rolagem aceitável: débito baixo (< 30% do prêmio original de R$1,20), primeira rolagem, e Up and Out reduz risco de exercício. Se a tese de estabilidade em PETR4 caiu, encerra ao invés de rolar.",
      },
      {
        titulo: "Registro no diário",
        enunciado:
          "Abra o Diário e registre uma operação hipotética com estrutura 'venda coberta', ativo VALE3, marque 'seguiu a regra' e escreva no motivo: 'rolei uma vez, dentro do limite'. Depois vá em Revisão e confira se a linha aparece.",
        gabarito:
          "Fluxo esperado: Diário → nova entrada → Revisão mostra a operação na coluna 'seguiu regra'.",
      },
    ],
  },
  {
    slug: "trava-de-alta",
    ordem: 10,
    nivel: 4,
    titulo: "Lição 10 — Trava de Alta (Bull Call Spread)",
    resumo:
      "Compra uma call mais barata (ITM/ATM) + vende uma call mais cara (OTM). Risco e ganho limitados.",
    problema: {
      titulo: "Custo de R$150 é demais",
      texto:
        "Você quer a alta da PETR4, mas a call K38 custa R$1,50 — R$150 inteiros de risco no lote. Para ganhar, o ativo precisa andar. E se der para pagar só R$90 pela mesma aposta? Aí vem a letra miúda.",
      pergunta: "O que a segunda perna tira de você em troca do desconto?",
    },
    conceitos: [
      {
        titulo: "Montagem",
        corpo: `
- **Compra** call strike A (menor)
- **Vende** call strike B (maior)
- Mesmo vencimento

## Números (PETR4 a R$38)
- Compra PETRK38 por R$1,50
- Vende PETRK40 por R$0,60
- **Custo líquido**: R$0,90 por ação = R$90 no lote
        `,
      },
      {
        titulo: "Payoff no vencimento",
        corpo: `
| Cenário | Resultado |
|---|---|
| PETR4 ≤ 38 | Perde os R$90 (prêmio líquido) |
| PETR4 = 40+ | Ganha (40 − 38) − 0,90 = R$1,10 → R$110 lucro máximo |

**Lucro máximo** = (B − A) − custo = (40 − 38) − 0,90 = R$1,10.
**Perda máxima** = custo = R$0,90.
**Breakeven** = A + custo = R$38,90.
        `,
      },
    ],
    analogia:
      "Carro de corrida com limitador de velocidade: você ganha se andar rápido, mas o motor não passa de X. Em troca, o combustível (custo) é menor.",
    naPratica: {
      titulo: "Antes de montar a trava",
      passos: [
        "Perda máxima = custo líquido. Cabe no seu 1%?",
        "As DUAS pernas têm liquidez? (Perna ilíquida vira prisão.)",
        "Breakeven = strike comprado + custo. O ativo chega lá no prazo?",
        "Conheça o ganho máximo antes de enviar — e aceite-o.",
      ],
    },
    missao: {
      titulo: "Leia a trava",
      texto:
        "Trava de alta K38/K40 por R$0,90 com PETR4 a R$38. Em uma frase: em que preço você para de ganhar, e qual é a sua perda máxima?",
    },
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
        explicacao:
          "A call vendida no strike superior tampona o ganho — o preço de ter a estrutura mais barata.",
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
    exercicios: [
      {
        titulo: "Monte no simulador",
        enunciado:
          "Abra o Simulador, escolha 'Trava de Alta' e adicione duas pernas: compra call strike 38 a R$1,50 e venda call strike 40 a R$0,60. Confirme visualmente no gráfico: onde está o breakeven, o lucro máximo e a perda máxima?",
        gabarito:
          "Breakeven em R$38,90; lucro máximo R$1,10/ação a partir de R$40; perda máxima R$0,90/ação até R$38.",
      },
      {
        titulo: "Ajuste de risco",
        enunciado:
          "Você tem R$20.000 de patrimônio e a regra do 1%. Quantos lotes dessa trava (custo R$0,90/ação, lote 100) pode montar sem furar o limite?",
        dica: "1% do patrimônio ÷ risco por lote.",
        gabarito: "Risco máx = R$200. Cada lote arrisca R$90. Máximo 2 lotes (2×R$90 = R$180).",
      },
    ],
  },
  {
    slug: "trava-de-baixa",
    ordem: 11,
    nivel: 4,
    titulo: "Lição 11 — Trava de Baixa (Bear Put Spread)",
    resumo:
      "Compra put mais cara (ATM/ITM) + vende put mais barata (OTM). Aposta em queda com risco limitado.",
    problema: {
      titulo: "A queda que pode ser só 5%",
      texto:
        "Você espera que a PETR4 corrija, mas a put K38 custa R$1,40 — e o mercado já descontou muita coisa. Se a queda for moderada, a put pura engole seu prêmio. Existe um jeito de apostar na queda pagando menos?",
      pergunta: "O que você abre mão para pagar R$0,90 em vez de R$1,40?",
    },
    conceitos: [
      {
        titulo: "Montagem",
        corpo: `
- **Compra** put strike B (maior)
- **Vende** put strike A (menor)
- Mesmo vencimento

## Números (PETR4 a R$38)
- Compra PETRW38 por R$1,40
- Vende PETRW36 por R$0,50
- **Custo líquido**: R$0,90 por ação
        `,
      },
      {
        titulo: "Payoff no vencimento",
        corpo: `
| Cenário | Resultado |
|---|---|
| PETR4 ≥ 38 | Perde os R$90 (prêmio pago) |
| PETR4 ≤ 36 | Ganha (38 − 36) − 0,90 = R$1,10 → R$110 lucro máx |

**Breakeven** = B − custo = R$37,10.
        `,
      },
    ],
    analogia:
      "Guarda-chuva com franja: te protege se chover forte, mas se virar tempestade, a franja não segura tudo. Barato porque abre mão do extremo.",
    naPratica: {
      titulo: "Antes de montar a trava de baixa",
      passos: [
        "Perda máxima = débito pago. Cabe no 1%?",
        "A queda que você espera cobre o breakeven (B − custo)?",
        "As duas pernas têm liquidez?",
        "Se a queda for extrema, a trava para de ganhar — aceite o teto.",
      ],
    },
    missao: {
      titulo: "Leia a trava de baixa",
      texto:
        "Trava K38/K36 por R$0,90 com PETR4 a R$38. Em uma frase: a partir de que preço do ativo você começa a lucrar, e onde o lucro para?",
    },
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
        explicacao:
          "A perda máxima é o débito pago — nada além disso, mesmo se o ativo disparar pra cima.",
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
    exercicios: [
      {
        titulo: "Simule a trava de baixa",
        enunciado:
          "No Simulador, monte: compra put strike 38 a R$1,40 e venda put strike 36 a R$0,50. Qual o lucro máximo em reais no lote (100 ações) e a que preço do ativo ele acontece?",
        gabarito: "Lucro máx = R$110 por lote, atingido a partir de PETR4 ≤ R$36.",
      },
      {
        titulo: "Comparação com put pura",
        enunciado:
          "Compare no papel: comprar put strike 38 pura por R$1,40 vs. a trava por R$0,90 líquidos. Se PETR4 cair pra R$30, qual estrutura ganha mais? E se cair só pra R$37?",
        dica: "Na trava, ganho para depois do strike inferior.",
        gabarito:
          "Cair pra R$30: put pura ganha R$8,00 − R$1,40 = R$6,60; trava ganha R$1,10 (teto). Cair pra R$37: put pura ganha R$1,00 − R$1,40 = −R$0,40; trava ganha R$1,00 − R$0,90 = R$0,10.",
      },
    ],
  },
  {
    slug: "rolagem-defensiva",
    ordem: 12,
    nivel: 4,
    titulo: "Lição 12 — Rolagem defensiva na prática",
    resumo: "Quando rolar salva a operação e quando é só empurrar prejuízo com o pé.",
    problema: {
      titulo: "O vendedor que só queria comissão",
      texto:
        "Você vendeu a call K40 por R$1,00 e PETR4 está a R$41, subindo. O atendente da corretora te liga: 'rola pro próximo mês que a gente resolve'. Você já rolou uma vez esse mês. Ele não mencionou nada disso.",
      pergunta: "Como decidir, em 30 segundos, se essa rolagem é gestão ou fuga?",
    },
    conceitos: [
      {
        titulo: "Critérios objetivos pra rolar",
        corpo: `
1. **A tese original ainda vale?** Se o motivo sumiu, encerra — não rola.
2. **O crédito líquido faz sentido?** Rolar com débito grande é pagar pra continuar errado.
3. **Você já rolou essa operação?** Se sim, encerra. **Máximo 1 rolagem.**
        `,
      },
      {
        titulo: "Exemplo prático",
        corpo: `
Vendeu call PETRK40 por R$1,00. PETR4 subiu pra R$41.

- **Rolagem boa**: recompra por R$1,80, vende PETRL42 (próximo mês) por R$2,20 → crédito R$0,40 e mais tempo.
- **Rolagem ruim**: recompra por R$1,80, vende PETRK41 mesma série por R$0,50 → débito R$1,30 e sem tempo extra.
        `,
      },
    ],
    analogia:
      "Renegociar uma dívida: se te dá fôlego real pra pagar, vale. Se é só pra empurrar o boleto com juros maiores, tá cavando um buraco.",
    naPratica: {
      titulo: "Checklist antes de rolar",
      passos: [
        "Tese ainda intacta.",
        "Rolagem gera crédito ou débito pequeno (< 30% do prêmio original).",
        "Novo vencimento cabe no seu prazo.",
        "Ainda dentro do stop de perda definido nas regras.",
      ],
    },
    missao: {
      titulo: "Reconheça a fuga",
      texto:
        "Rolar a mesma call pela segunda vez, com débito de R$1,30 e sem tempo extra. Em uma frase: por que isso é quase sempre erro — e o que a regra do guia manda fazer?",
    },
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
        explicacao:
          "Regra de ouro: no máximo 1 rolagem. Segunda tentativa é insistência, não estratégia.",
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
        explicacao:
          "Débito grande na rolagem é o mercado te dizendo que a nova aposta é cara — reavalie encerrar.",
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
        explicacao:
          "Se a tese caiu, o certo é encerrar. Rolar só faz sentido quando o motivo original ainda existe.",
      },
    ],
    exercicios: [
      {
        titulo: "Classifique a rolagem",
        enunciado:
          "Para cada caso, decida: rolar ou encerrar?\nA) Vendeu call por R$1,00, ativo estourou strike, rolagem gera crédito R$0,20 e é a primeira.\nB) Comprou trava de alta, tese caiu (empresa anunciou prejuízo), rolagem custa débito de R$0,80.\nC) Já rolou uma vez essa mesma operação, agora quer rolar de novo.",
        gabarito: "A) Rolar. B) Encerrar (tese caiu). C) Encerrar (limite de 1 rolagem).",
      },
      {
        titulo: "Regra pessoal",
        enunciado:
          "Vá em Regras e crie a regra: 'Máximo 1 rolagem por operação; se falhar de novo, encerro'. Marque como ativa. Depois, no Diário, ao registrar uma operação, confirme que a regra aparece na lista pra vincular.",
        gabarito:
          "Regra criada na categoria 'gestão' e disponível como opção ao registrar entrada no diário.",
      },
    ],
  },
  {
    slug: "gestao-de-risco-travas",
    ordem: 13,
    nivel: 4,
    titulo: "Lição 13 — Gestão de risco em travas",
    resumo: "Position sizing, stop de perda e regra do 1% do patrimônio por operação.",
    problema: {
      titulo: "O setup perfeito que quebrou o mês",
      texto:
        "A trava deu certo três vezes seguidas. Na quarta, você monta 10 lotes 'porque o setup está perfeito'. O ativo não anda, o theta corrói e o mês inteiro de lucro foi embora numa única operação.",
      pergunta: "O que define o tamanho de uma operação: a chance de lucro ou o tamanho da perda?",
    },
    conceitos: [
      {
        titulo: "Position sizing",
        corpo: `
Nunca arrisque mais de **1% do patrimônio líquido** por operação. Numa trava, o risco é o **débito pago** (ou a diferença entre strikes − crédito, se for trava de crédito).

## Exemplo
Patrimônio: R$50.000 → risco máximo por trade = R$500.

Trava de alta PETRK38/PETRK40 custa R$0,90 por ação = R$90 no lote (100).

- **Você pode montar até 5 lotes** (5 × R$90 = R$450, dentro do teto).
        `,
      },
      {
        titulo: "Stop de perda",
        corpo: `
Defina no diário **antes de abrir**:

- Stop no prêmio (ex: se a trava valer 50% do custo, encerra).
- Stop no ativo (ex: se PETR4 furar R$36, encerra).
- Stop de tempo (ex: 5 dias pré-vencimento sem plano, encerra).
        `,
      },
      {
        titulo: "Métrica que importa",
        corpo: `
**Expectativa matemática** = (prob acerto × ganho médio) − (prob erro × perda média). Se negativa, a operação é ruim mesmo quando dá certo às vezes.
        `,
      },
    ],
    analogia:
      "Cinto de segurança: você não usa esperando bater, mas quando bate, é ele que decide se você sai andando ou não.",
    naPratica: {
      titulo: "O ritual antes de qualquer operação",
      passos: [
        "Risco por lote = débito (ou diferença de strikes − crédito).",
        "Lotagem = (1% do patrimônio) ÷ risco por lote.",
        "Os 3 stops escritos no diário ANTES de abrir: prêmio, ativo, tempo.",
        "Expectativa negativa? Não opero, mesmo com setup bonito.",
      ],
    },
    missao: {
      titulo: "Dimensione a operação",
      texto:
        "Patrimônio de R$80.000, trava a R$2,00/ação (lote de 100). Em uma frase: quantos lotes você monta no máximo — e qual número você verifica antes de enviar a ordem?",
    },
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
        explicacao:
          "Débito pago = perda máxima. Por isso trava de débito tem risco conhecido antes de abrir.",
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
        explicacao:
          "Expectativa negativa é insustentável — mesmo vitórias esporádicas não compensam a série de perdas.",
      },
    ],
    exercicios: [
      {
        titulo: "Calcule position sizing",
        enunciado:
          "Patrimônio R$120.000, regra do 1%. Uma trava custa R$1,40/ação (lote 100). Quantos lotes você pode montar? Se aumentar o custo pra R$3,00/ação, quantos lotes cabem?",
        gabarito: "R$1.200 de risco máx. A R$140/lote → 8 lotes. A R$300/lote → 4 lotes.",
      },
      {
        titulo: "Expectativa matemática",
        enunciado:
          "Estratégia com 60% de acerto, ganho médio R$150, perda média R$250. Qual a expectativa por trade? Você deve operar?",
        dica: "EM = (P_acerto × ganho) − (P_erro × perda).",
        gabarito: "EM = 0,6×150 − 0,4×250 = 90 − 100 = −R$10. Negativa: não operar.",
      },
      {
        titulo: "Defina seus 3 stops",
        enunciado:
          "No Diário, ao registrar sua próxima operação (real ou hipotética), escreva no campo motivo os 3 stops: prêmio, ativo e tempo. Ex: 'Encerro se trava valer 50%, se PETR4 furar R$36, ou 5 dias antes do vencimento.'",
        gabarito: "Todo trade registrado com os 3 stops explícitos antes de abrir.",
      },
    ],
  },
  {
    slug: "tributacao-basica",
    ordem: 14,
    nivel: 5,
    titulo: "Lição 14 — Tributação de opções (básico)",
    resumo:
      "15% sobre lucro líquido mensal (swing) e 20% em day trade. Opções não têm isenção dos R$20 mil.",
    problema: {
      titulo: "O lucro que não era todo seu",
      texto:
        "Seu mês fechou com R$3.000 de lucro em opções. A corretora reteve R$8 de IRRF. Você já contou os R$3.000 como 'seus'. O governo tem outra visão — e ela é maior do que os R$8.",
      pergunta: "Quanto desse lucro realmente sobra depois do imposto?",
    },
    conceitos: [
      {
        titulo: "Alíquotas",
        corpo: `
| Tipo | Alíquota |
|---|---|
| Operação comum (swing) | **15%** sobre lucro líquido do mês |
| Day trade | **20%** sobre lucro líquido do mês |
        `,
      },
      {
        titulo: "Sem isenção de R$20 mil",
        corpo: `
Diferente de ação à vista, **opções não têm isenção mensal**. Todo lucro é tributado.
        `,
      },
      {
        titulo: "IRRF (imposto retido na fonte)",
        corpo: `
- Comum: **0,005%** sobre valor da venda ("dedo-duro")
- Day trade: **1%** sobre o lucro do dia

Serve pra Receita cruzar dados, mas você compensa no DARF mensal.
        `,
      },
      {
        titulo: "Prejuízo compensa",
        corpo: `
Prejuízo de um mês **abate lucro futuro** — sem prazo de validade. Registre tudo no diário e no controle mensal.
        `,
      },
    ],
    analogia:
      "Aluguel de imóvel: todo mês você fecha as contas e paga o carnê. Não tem faixa de isenção como venda de ação — se lucrou, paga.",
    naPratica: {
      titulo: "Apuração em 4 passos",
      passos: [
        "Some os resultados por modalidade: swing separado de day trade.",
        "Compense prejuízos acumulados (mesma modalidade, sem prazo).",
        "Desconte o IRRF retido pela corretora.",
        "Gere DARF código 6015 e pague até o último dia útil do mês seguinte.",
      ],
    },
    missao: {
      titulo: "Feche o mês",
      texto:
        "Mês com swing de +R$1.200, +R$800 e −R$600, IRRF de R$8. Em uma frase: quanto vai de DARF?",
    },
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
        explicacao:
          "Isenção dos R$20 mil vale só pra ação à vista. Opções pagam a partir do primeiro real de lucro.",
      },
      {
        pergunta: "Alíquota de day trade em opções:",
        alternativas: ["15%", "17,5%", "20%", "22,5%"],
        correta: 2,
        explicacao: "Day trade = 20% sobre o lucro líquido mensal.",
      },
    ],
    exercicios: [
      {
        titulo: "Apure o mês",
        enunciado:
          "Em maio você fez três operações comuns de opções: +R$1.200, +R$800 e −R$600. IRRF retido no mês: R$8. Quanto vai de DARF?",
        dica: "Lucro líquido × 15% − IRRF.",
        gabarito: "Lucro líquido = R$1.400. IR = 15%×1400 = R$210. DARF = R$210 − R$8 = R$202.",
      },
      {
        titulo: "Swing vs day trade",
        enunciado:
          "No mesmo mês: swing +R$500 e day trade em opções +R$400. Some tudo e calcule o IR devido (ignore IRRF).",
        gabarito:
          "Modalidades separadas. Swing: 15%×500 = R$75. Day: 20%×400 = R$80. Total = R$155.",
      },
    ],
  },
  {
    slug: "darf-e-compensacao",
    ordem: 15,
    nivel: 5,
    titulo: "Lição 15 — DARF, compensação de prejuízo e controle mensal",
    resumo:
      "Como apurar, gerar DARF código 6015, e usar prejuízo pra abater lucro futuro sem prazo.",
    problema: {
      titulo: "O mês que parecia injusto",
      texto:
        "Janeiro deu lucro e você pagou DARF. Fevereiro deu prejuízo e você achou que o dinheiro estava perdido. Março voltou a lucrar — e você pagou imposto sobre o lucro cheio, sem abater o prejuízo de fevereiro.",
      pergunta: "O governo devolve o prejuízo de fevereiro?",
    },
    conceitos: [
      {
        titulo: "Passo a passo mensal",
        corpo: `
1. **Some** lucros e prejuízos de cada operação encerrada no mês (separando swing de day trade).
2. **Compense** prejuízos acumulados de meses anteriores (mesma modalidade).
3. **Desconte** IRRF retido pela corretora.
4. **Gere DARF** no site da Receita (Sicalc), código **6015**.
5. **Pague até o último dia útil do mês seguinte.**
        `,
      },
      {
        titulo: "Compensação de prejuízo",
        corpo: `
- Swing só compensa swing. Day trade só compensa day trade.
- **Sem prazo de validade** — prejuízo de 2019 ainda abate lucro de 2026.
- Precisa constar da declaração anual pra ser aceito.
        `,
      },
      {
        titulo: "Exemplo",
        corpo: `
| Mês | Resultado | IRRF | A pagar |
|---|---|---|---|
| Jan | +R$1.000 | R$5 | 15%×1000 − 5 = R$145 |
| Fev | −R$800 | R$2 | Zero (acumula prejuízo R$800) |
| Mar | +R$1.500 | R$7 | 15%×(1500−800) − 7 = R$98 |
        `,
      },
      {
        titulo: "Onde registrar",
        corpo: `
Planilha própria ou o **diário do Zero ao Trade** — os campos de resultado alimentam essa apuração.
        `,
      },
    ],
    analogia:
      "Cartão de crédito da Receita: fecha dia último do mês, vence dia último do mês seguinte. Atrasou, pega multa e juros Selic.",
    naPratica: {
      titulo: "Checklist do fechamento mensal",
      passos: [
        "Feche a apuração por modalidade (swing / day trade).",
        "Compense prejuízos acumulados — só da mesma modalidade.",
        "Desconte o IRRF retido.",
        "Gere o DARF 6015 e pague até o último dia útil do mês seguinte.",
        "Confira o diário: sem registro, não há prejuízo aceito.",
      ],
    },
    missao: {
      titulo: "Compense em cadeia",
      texto:
        "Tudo swing: Jan −R$1.500, Fev +R$400, Mar +R$2.000. Em uma frase: quanto de IR você paga em fevereiro e quanto em março?",
    },
    quiz: [
      {
        pergunta: "Prejuízo de swing pode compensar lucro de day trade?",
        alternativas: [
          "Sim, sempre",
          "Não — modalidades separadas",
          "Só no mesmo mês",
          "Só com autorização da Receita",
        ],
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
    exercicios: [
      {
        titulo: "Compensação em cadeia",
        enunciado:
          "Jan: −R$1.500 (swing). Fev: +R$400 (swing). Mar: +R$2.000 (swing). Quanto de IR paga em cada mês?",
        gabarito:
          "Jan: 0 (prejuízo R$1.500 acumulado). Fev: 0 (compensa R$400, sobra R$1.100 de prejuízo). Mar: 15%×(2000−1100) = R$135.",
      },
      {
        titulo: "Simule seu DARF",
        enunciado:
          "Vá em Revisão e some seus resultados registrados no diário no mês corrente. Aplique 15% (swing) ou 20% (day trade). Esse valor é o DARF estimado. Verifique se bate com o que sua corretora envia.",
        gabarito: "Fluxo: Revisão → total do mês × alíquota da modalidade − IRRF = DARF a pagar.",
      },
      {
        titulo: "Regra de disciplina fiscal",
        enunciado:
          "Crie no menu Regras a regra: 'Todo dia 1º do mês, fecho a apuração e gero o DARF antes do dia 20'. Categoria: gestão.",
        gabarito: "Regra ativa que aparece automaticamente na revisão mensal.",
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
