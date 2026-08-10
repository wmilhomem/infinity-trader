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

/** Tabela comparativa entre estruturas — a "ferramenta" da lição. */
export type LessonComparativo = {
  titulo: string;
  colunas: string[];
  linhas: { item: string; valores: string[] }[];
};

/** Cenários de comportamento da estrutura. */
export type LessonCenario = {
  titulo: string;
  tom: "perda" | "neutro" | "ganho";
  descricao: string;
};

export type MissaoOpcao = {
  texto: string;
  tom: "correta" | "quase" | "errada";
  feedback: string;
};

export type LessonTransferencia = {
  titulo: string;
  situacao: string;
  pergunta: string;
  opcoes: MissaoOpcao[];
};

export type LessonMissao = {
  titulo: string;
  situacao: string;
  pergunta: string;
  opcoes: MissaoOpcao[];
  termosExplicacao: string[];
  aindaPratique: string;
  transferencia: LessonTransferencia;
};

export type LessonNivel = 1 | 2 | 3 | 4 | 5 | "pratica";

export type Lesson = {
  slug: string;
  ordem: number;
  nivel: LessonNivel;
  dominio?: "futuros";
  titulo: string;
  resumo: string;
  problema: LessonProblema;
  conceitos: LessonConceito[];
  analogia: string;
  naPratica: LessonNaPratica;
  missao: LessonMissao;
  quiz: QuizQuestion[];
  exercicios?: Exercise[];
  comparativo?: LessonComparativo;
  cenarios?: LessonCenario[];
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
      titulo: "O que você comprou",
      situacao:
        "PETR4 está a R$38. Você paga R$1,20 por uma call de strike 38 que vence em 45 dias. Você acredita que a ação vai subir, mas não sabe quando.",
      pergunta: "O que você está comprando de verdade?",
      opcoes: [
        {
          texto: "Uma ação mais barata — se subir um pouco, lucra como se tivesse a ação",
          tom: "errada",
          feedback:
            "Opção não é ação barata: é um direito com prazo de validade. Se o movimento não vier no prazo, o prêmio vira zero mesmo que a ação suba depois.",
        },
        {
          texto: "O direito de comprar a ação a R$38 até o vencimento, com perda máxima de R$1,20",
          tom: "correta",
          feedback:
            "Boa decisão. Você identificou o que está comprando: direito, não obrigação. Perda máxima = prêmio. Se subir, você exerce ou revende o direito.",
        },
        {
          texto: "Um contrato que te obriga a comprar a ação no vencimento",
          tom: "errada",
          feedback:
            "Obrigação é o lado do vendedor. Você comprou o direito de escolher — pode exercer ou abandonar.",
        },
        {
          texto: "Um seguro que devolve seu dinheiro se o preço cair",
          tom: "quase",
          feedback:
            "Quase: a perda é limitada ao prêmio, mas ele não é reembolsável. Se o movimento não vier, você perde o prêmio inteiro — por isso só use dinheiro que aceita perder.",
        },
      ],
      termosExplicacao: ["direito", "prazo", "vencimento", "perda máxima", "perda maxima"],
      aindaPratique: "explicar por que uma opção não é uma ação com desconto",
      transferencia: {
        titulo: "A oferta boa demais",
        situacao:
          "PETR4 está a R$38. Um conhecido insiste: 'compra a call K38 por R$1,20 — é a ação com 97% de desconto'.",
        pergunta: "O que você responde?",
        opcoes: [
          {
            texto: "Que é um direito com prazo de validade, não a ação com desconto",
            tom: "correta",
            feedback:
              "Boa decisão. Você reconheceu a essência: opção é direito com prazo. 'Barata' só existe dentro do prazo — fora dele, vira pó.",
          },
          {
            texto: "Que aceita, afinal é a ação por menos",
            tom: "errada",
            feedback:
              "Essa é a armadilha da lição 1: opção não é ação barata — é um direito que expira.",
          },
          {
            texto: "Que só verifica a liquidez e compra",
            tom: "quase",
            feedback:
              "Quase: liquidez sempre importa, mas a oferta do conhecido ignora o prazo — o fator que define uma opção.",
          },
          {
            texto: "Que recusa porque opção é sempre furada",
            tom: "errada",
            feedback: "Opção não é furada: é o instrumento errado quando se trata como ação.",
          },
        ],
      },
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
      titulo: "Proteja a posição",
      situacao:
        "PETR4 está a R$38. Você tem 500 ações da Petrobras compradas a R$35 e está satisfeito, mas teme uma correção de 10% nas próximas semanas.",
      pergunta: "Qual operação protege sua posição?",
      opcoes: [
        {
          texto: "Comprar put de strike 38",
          tom: "correta",
          feedback:
            "Boa decisão. Put dá o direito de vender a R$38: se cair, seu risco deixa de ser ilimitado.",
        },
        {
          texto: "Comprar call de strike 38",
          tom: "errada",
          feedback:
            "Call é direito de comprar: protege quem está fora da ação, não quem já tem a posição.",
        },
        {
          texto: "Vender call de strike 38",
          tom: "errada",
          feedback:
            "Vender call coberta gera renda, mas limita seu ganho na alta e não protege nada na queda. Objetivo diferente.",
        },
        {
          texto: "Não fazer nada",
          tom: "quase",
          feedback:
            "Quase: ficar parado é uma decisão consciente — você aceita o risco total da queda. Válido se for deliberado; só não é proteção.",
        },
      ],
      termosExplicacao: ["put", "queda", "proteger", "vender", "direito de vender"],
      aindaPratique: "diferenciar quando usar call e quando usar put",
      transferencia: {
        titulo: "Lucro em papel, tese invertida",
        situacao:
          "Você comprou 500 VALE3 a R$60 e hoje valem R$80 (lucro de R$10.000). Sua tese virou baixista para as próximas semanas, mas vender agora significa pagar IR sobre o ganho.",
        pergunta: "Qual operação expressa sua nova tese sem realizar o lucro?",
        opcoes: [
          {
            texto: "Comprar puts da VALE3",
            tom: "correta",
            feedback:
              "Boa decisão. A put dá o direito de vender: se a ação cair, o prejuízo da carteira é compensado — e você não vendeu nada, então não há ganho a tributar.",
          },
          {
            texto: "Comprar calls da VALE3",
            tom: "errada",
            feedback:
              "Call é direito de comprar: lucra com a alta — a direção oposta da sua nova tese.",
          },
          {
            texto: "Vender as ações e recomprar depois da queda",
            tom: "quase",
            feedback:
              "Quase: funciona tecnicamente, mas você realiza o lucro de R$10.000 e paga 15% de IR agora. A put adia essa conta.",
          },
          {
            texto: "Não fazer nada, pois papel não dá prejuízo",
            tom: "errada",
            feedback:
              "Posição sem proteção em tese baixista é risco em aberto — o papel perde valor junto com o mercado.",
          },
        ],
      },
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
      titulo: "A saída antes do vencimento",
      situacao:
        "Você comprou uma call K38 por R$1,50. Faltam 3 dias para o vencimento. PETR4 está a R$39,50 e sua call vale R$2,10. Você ainda acredita na alta.",
      pergunta: "O que você verifica primeiro antes de decidir?",
      opcoes: [
        {
          texto: "A liquidez da série — volume e spread de hoje",
          tom: "correta",
          feedback:
            "Boa decisão. Com 3 dias de prazo, a saída é o risco: série sem contraparte vira prisão. Volume, número de negócios e spread decidem.",
        },
        {
          texto: "Se a call será exercida automaticamente",
          tom: "quase",
          feedback:
            "Quase: isso importa no vencimento se a opção estiver ITM. Antes dele, o problema real é conseguir sair a preço justo.",
        },
        {
          texto: "O preço de exercício da ação hoje",
          tom: "errada",
          feedback:
            "Você já sabe o strike (38) e o preço atual (39,50). Essa informação não muda a decisão.",
        },
        {
          texto: "O imposto sobre o lucro de R$0,60",
          tom: "errada",
          feedback:
            "Imposto vem na apuração do mês. Agora o risco é não conseguir vender a posição.",
        },
      ],
      termosExplicacao: ["liquidez", "volume", "spread", "saída", "saida"],
      aindaPratique: "checar liquidez e o ciclo de exercício antes do vencimento",
      transferencia: {
        titulo: "ITM sem caixa no vencimento",
        situacao:
          "Faltam 2 dias para o vencimento. Você comprou a call K40 por R$1,10 e PETR4 está a R$40,30 — sua opção está ITM por R$0,30. Você não tem R$4.000 para pagar as 100 ações e não quer ficar com elas.",
        pergunta: "O que você faz antes do fim do pregão?",
        opcoes: [
          {
            texto: "Vende a opção ainda nesta sessão",
            tom: "correta",
            feedback:
              "Boa decisão. Opção ITM no vencimento vira exercício automático — e você não quer (nem pode) receber as ações. Vender antes encerra tudo.",
          },
          {
            texto: "Nada: opção ITM sempre paga em dinheiro",
            tom: "errada",
            feedback:
              "Na B3 o exercício entrega ações, não dinheiro. Sem o valor para pagá-las, você pode levar a liquidação — por isso a saída antes.",
          },
          {
            texto: "Deposita o valor das 100 ações e recebe a K40",
            tom: "quase",
            feedback:
              "Quase: legítimo se você QUISESSE ficar com as ações. Mas você não quer — e ainda empata capital nisso.",
          },
          {
            texto: "Espera o vencimento e resolve na segunda",
            tom: "errada",
            feedback:
              "Segunda-feira o exercício já aconteceu. A decisão se toma antes do fim do pregão de vencimento.",
          },
        ],
      },
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
      titulo: "O preço da K36",
      situacao:
        "PETR4 está a R$38. A call K36 (ITM) custa R$2,80 e a call K38 (ATM) custa R$1,50. Mesmo vencimento, mesmo ativo.",
      pergunta: "Por que a K36 custa quase o dobro?",
      opcoes: [
        {
          texto: "Porque ela já vale R$2,00 se exercida hoje — valor intrínseco",
          tom: "correta",
          feedback:
            "Boa decisão. Intrínseco da K36 = max(0, 38 − 36) = R$2,00. O restante, R$0,80, é extrínseco — expectativa.",
        },
        {
          texto: "Porque a corretora cobra taxa maior nesse strike",
          tom: "errada",
          feedback: "Taxas não entram no prêmio. O prêmio é mercado: intrínseco + extrínseco.",
        },
        {
          texto: "Porque a K36 tem mais tempo até o vencimento",
          tom: "errada",
          feedback:
            "Mesmo vencimento, tempo igual. O que muda entre elas é o strike — e o valor intrínseco.",
        },
        {
          texto: "Porque a volatilidade da K36 é maior",
          tom: "quase",
          feedback:
            "Quase: volatilidade pesa no extrínseco, mas aqui a maior parte da diferença é intrínseco — a K36 já vale R$2,00.",
        },
      ],
      termosExplicacao: ["intrínseco", "intrinseco", "2,00", "2,0"],
      aindaPratique: "decompor o prêmio em intrínseco e extrínseco",
      transferencia: {
        titulo: "A put que parece cara",
        situacao:
          "VALE3 está a R$80. A put K84 custa R$5,20 e a put K80 (ATM) custa R$3,00. Mesmo vencimento, mesmo ativo.",
        pergunta: "Quanto do preço da K84 é valor intrínseco?",
        opcoes: [
          {
            texto: "R$4,00",
            tom: "correta",
            feedback:
              "Boa decisão. Put intrínseco = max(0, 84 − 80) = R$4,00. O restante (R$1,20) é extrínseco — expectativa.",
          },
          {
            texto: "R$1,20",
            tom: "quase",
            feedback:
              "Quase: R$1,20 é o extrínseco da K84 (R$5,20 − R$4,00). O intrínseco é strike menos ativo: R$4,00.",
          },
          {
            texto: "R$5,20",
            tom: "errada",
            feedback:
              "Esse é o prêmio total. Você precisa separar quanto é intrínseco (garantido) e quanto é extrínseco.",
          },
          {
            texto: "R$3,00",
            tom: "errada",
            feedback:
              "R$3,00 é o preço da K80 (ATM), que tem intrínseco zero. Não é o valor intrínseco da K84.",
          },
        ],
      },
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
      titulo: "O strike barato",
      situacao:
        "PETR4 está a R$38. Você espera alta de 5% em 60 dias. A call K44 (OTM) custa R$0,30 — parece um achado.",
      pergunta: "Por que a K44 é um risco disfarçado?",
      opcoes: [
        {
          texto: "Porque exige um movimento que o ativo raramente faz nesse prazo",
          tom: "correta",
          feedback:
            "Boa decisão. Barato reflete probabilidade baixa: o mercado cobra pouco porque paga pouco. Barato não é o mesmo que valor.",
        },
        {
          texto: "Porque a série não tem liquidez",
          tom: "quase",
          feedback:
            "Quase: liquidez sempre importa, mas o risco central da K44 é a distância do strike — não a contraparte.",
        },
        {
          texto: "Porque o vencimento é curto demais",
          tom: "errada",
          feedback:
            "O prazo (60 dias) foi a sua escolha. O problema da K44 é o strike: exige +15% para só virar ITM.",
        },
        {
          texto: "Porque a corretora cobra mais caro para OTM",
          tom: "errada",
          feedback:
            "Não: o preço baixo é o mercado. A K44 custa pouco porque a chance de terminar ITM é pequena.",
        },
      ],
      termosExplicacao: ["probabilidade", "movimento", "distância", "distancia", "strike"],
      aindaPratique: "classificar strikes pelo moneyness e pela probabilidade em qualquer situação",
      transferencia: {
        titulo: "Probabilidade em primeiro lugar",
        situacao:
          "PETR4 está a R$38. Você quer maximizar a chance de a call terminar no dinheiro e aceita pagar mais caro por isso.",
        pergunta: "Qual strike você compra?",
        opcoes: [
          {
            texto: "A call K36 (ITM)",
            tom: "correta",
            feedback:
              "Boa decisão. K36 já vale R$2,00 de intrínseco: para terminar ITM ela só precisa não cair 5%+ — a maior probabilidade das três.",
          },
          {
            texto: "A call K38 (ATM)",
            tom: "quase",
            feedback:
              "Quase: a ATM é mais barata, mas precisa de movimento para virar ITM. Probabilidade maior paga prêmio maior.",
          },
          {
            texto: "A call K44 (OTM)",
            tom: "errada",
            feedback:
              "K44 exige +15% no prazo: a menor probabilidade de todas. Barata por um motivo.",
          },
          {
            texto: "A mais barata do book",
            tom: "errada",
            feedback:
              "A mais barata é exatamente a mais distante do dinheiro — o oposto da sua meta.",
          },
        ],
      },
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
      titulo: "O relógio da posição",
      situacao:
        "Você comprou uma call K38 por R$1,50 com 20 dias de prazo. O balanço da empresa sai em 15 dias. O ativo está parado há uma semana.",
      pergunta: "Qual é o maior risco da sua posição agora?",
      opcoes: [
        {
          texto: "O theta: a opção derrete enquanto o ativo não anda",
          tom: "correta",
          feedback:
            "Boa decisão. Você paga aluguel de tempo todo dia. Com o ativo parado, o extrínseco cai — e a corrosão acelera perto do vencimento.",
        },
        {
          texto: "O balanço vir antes do vencimento",
          tom: "errada",
          feedback:
            "Seu vencimento (20 dias) é depois do balanço (15): você participa do evento. Isso está a seu favor.",
        },
        {
          texto: "A liquidez da série",
          tom: "quase",
          feedback:
            "Quase: liquidez sempre importa, mas aqui o vilão número um é o tempo — não a contraparte.",
        },
        {
          texto: "O imposto sobre o prêmio",
          tom: "errada",
          feedback: "Imposto existe, mas não é o risco de curto prazo de uma posição viva.",
        },
      ],
      termosExplicacao: ["theta", "tempo", "derrete", "corrosão", "corrosao"],
      aindaPratique: "explicar de que lado do theta você está em cada posição",
      transferencia: {
        titulo: "O vendedor e o relógio",
        situacao:
          "Você VENDEU uma call coberta e o ativo está parado há uma semana. Faltam 5 dias para o vencimento.",
        pergunta: "O que o tempo está fazendo com a sua posição?",
        opcoes: [
          {
            texto: "Corroendo a call vendida — cada dia parado aproxima o prêmio de ser seu",
            tom: "correta",
            feedback:
              "Boa decisão. Quem vende é o dono do tempo: o theta derrete a opção vendida todo dia. Sem movimento, o extrínseco cai — e o prêmio que você recebeu fica mais perto de ser inteiramente seu.",
          },
          {
            texto: "Corroendo sua posição — o tempo sempre trabalha contra você",
            tom: "errada",
            feedback:
              "Só contra o comprador. Vendedor coleta o theta; o tempo é o salário de quem vende.",
          },
          {
            texto: "Nada, porque o ativo está parado",
            tom: "quase",
            feedback:
              "Quase: o ativo parado é justamente o que deixa o theta agir — sem movimento, o extrínseco evapora todo dia.",
          },
          {
            texto: "O tempo não influencia posições já montadas",
            tom: "errada",
            feedback: "Theta atua todos os dias, do primeiro ao último, comprado ou vendido.",
          },
        ],
      },
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
    ordem: 8,
    nivel: 3,
    titulo: "Lição 8 — Compra a seco (call/put seca)",
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
    comparativo: {
      titulo: "Ação × CALL comprada",
      colunas: ["", "Compra da ação", "CALL comprada"],
      linhas: [
        {
          item: "Custo de entrada",
          valores: ["Preço da ação inteiro", "Prêmio (fração do preço)"],
        },
        { item: "Perda máxima", valores: ["A queda da ação", "O prêmio (vira pó)"] },
        { item: "Lucro máximo", valores: ["Ilimitado", "Ilimitado"] },
        { item: "Prazo", valores: ["Sem prazo", "Vence: o tempo corrói"] },
        { item: "Se o movimento demorar", valores: ["Aguarda", "Perde valor todos os dias"] },
      ],
    },
    cenarios: [
      {
        titulo: "O ativo cai",
        tom: "perda",
        descricao:
          "O ativo cai 10% e não volta no prazo. A call perde todo o prêmio; a ação perde 10% mas continua existindo. Ambas perderam — a call perdeu 100% do valor investido.",
      },
      {
        titulo: "O ativo fica parado",
        tom: "neutro",
        descricao:
          "O ativo anda 1% por semana. A ação oscila junto. A call sangra para o theta todos os dias — tempo passando sem movimento é prejuízo certo para o comprador.",
      },
      {
        titulo: "O ativo sobe forte",
        tom: "ganho",
        descricao:
          "O ativo sobe 15% em um mês. A call multiplica o retorno do prêmio (alavancagem); a ação sobe os 15%. A call entregou muito mais — se o movimento veio no prazo.",
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
      titulo: "Dimensione antes de clicar",
      situacao:
        "Você quer comprar uma call K38 por R$1,20 (lote de 100). Seu patrimônio é R$20.000 e sua regra é arriscar no máximo 1% por operação.",
      pergunta: "Quantos lotes cabem dentro da sua regra?",
      opcoes: [
        {
          texto: "1 lote (R$120)",
          tom: "correta",
          feedback:
            "Boa decisão. 1% de R$20.000 = R$200. 1 lote (R$120) respeita a regra; 2 lotes (R$240) a furariam.",
        },
        {
          texto: "2 lotes (R$240)",
          tom: "quase",
          feedback:
            "Quase: R$240 passa do teto de R$200. O prêmio é o risco — dimensione por ele, não pelo lucro imaginado.",
        },
        {
          texto: "5 lotes (R$600)",
          tom: "errada",
          feedback:
            "R$600 é 3% do patrimônio numa operação. Uma sequência normal de perdas com esse tamanho não deixa a conta voltar.",
        },
        {
          texto: "Quantos quiser, pois a perda é limitada",
          tom: "errada",
          feedback:
            "Perda limitada por trade não limita a sequência. É a frequência de perdas que destrói conta sem position sizing.",
        },
      ],
      termosExplicacao: ["1%", "risco", "lote", "200"],
      aindaPratique: "dimensionar pelo risco máximo, não pelo prêmio que cabe no bolso",
      transferencia: {
        titulo: "A mesma regra, outro instrumento",
        situacao:
          "Seu patrimônio é R$30.000 e sua regra é arriscar no máximo 1% por operação. A put K38 que você quer comprar custa R$1,00 (R$100 por lote).",
        pergunta: "Quantos lotes cabem na sua regra?",
        opcoes: [
          {
            texto: "3 lotes (R$300)",
            tom: "correta",
            feedback:
              "Boa decisão. 1% de R$30.000 = R$300. 3 lotes (R$300) usam exatamente o teto — a regra vale para qualquer instrumento.",
          },
          {
            texto: "2 lotes (R$200)",
            tom: "quase",
            feedback:
              "Quase: 2 lotes cabem, mas 3 também — o teto é R$300, e a regra não muda com o instrumento.",
          },
          {
            texto: "4 lotes (R$400)",
            tom: "errada",
            feedback: "R$400 > R$300: você furou a regra porque o prêmio era barato.",
          },
          {
            texto: "6 lotes, pois put é uma operação segura",
            tom: "errada",
            feedback:
              "A put é limitada, não segura: 6 lotes = R$600 = 2% do patrimônio numa única operação.",
          },
        ],
      },
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
    ordem: 9,
    nivel: 3,
    titulo: "Lição 9 — Venda coberta",
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
    comparativo: {
      titulo: "Só ações × Venda coberta",
      colunas: ["", "Só ações", "Venda coberta"],
      linhas: [
        { item: "Receita", valores: ["Nenhuma", "Prêmio recebido na venda da call"] },
        {
          item: "Perda máxima",
          valores: ["Toda a queda das ações", "Queda das ações − prêmio recebido"],
        },
        { item: "Lucro máximo", valores: ["Ilimitado", "Limitado (strike + prêmio)"] },
        { item: "Tempo", valores: ["Neutro", "A favor (coleta theta)"] },
        { item: "Risco de chamada", valores: ["Nenhum", "Entregar as ações no strike"] },
      ],
    },
    cenarios: [
      {
        titulo: "O ativo cai",
        tom: "perda",
        descricao:
          "O ativo cai 10%. A venda coberta perde na ação, mas o prêmio recebido amortece a queda — a perda é menor que ficar só com as ações.",
      },
      {
        titulo: "O ativo fica parado",
        tom: "ganho",
        descricao:
          "O ativo anda de lado. O prêmio da call expira e você embolsa o valor inteiro — a calmaria paga você, em vez de corroer a posição.",
      },
      {
        titulo: "O ativo sobe forte",
        tom: "neutro",
        descricao:
          "O ativo dispara e passa do strike. Você é chamado a entregar as ações: lucro no strike + prêmio, e o upside além disso fica com o comprador da call — o preço da receita.",
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
      titulo: "O preço da renda",
      situacao:
        "Você tem 100 PETR4 compradas a R$30. Alguém oferece R$0,90 pela call K33 (vence em 30 dias). Você acredita que a ação pode chegar a R$36.",
      pergunta: "Qual é a pergunta decisiva antes de vender?",
      opcoes: [
        {
          texto: '"Eu aceitaria vender minhas ações a R$33?"',
          tom: "correta",
          feedback:
            "Boa decisão. Se for exercido a R$33 e você não queria vender, o prêmio de R$0,90 não compensa. Strike = preço de venda aceito.",
        },
        {
          texto: '"É o maior prêmio do book?"',
          tom: "quase",
          feedback:
            "Quase: prêmio maior pode ser justamente o strike onde você menos quer vender. Primeiro o preço de exercício, depois o prêmio.",
        },
        {
          texto: '"A queda pode ser forte?"',
          tom: "errada",
          feedback:
            "O risco de queda continua todo com você de qualquer jeito — o prêmio só amortece R$0,90.",
        },
        {
          texto: '"A call vence em 30 dias?"',
          tom: "errada",
          feedback:
            "O vencimento você já definiu. A pergunta que decide é o strike que você aceita como venda.",
        },
      ],
      termosExplicacao: ["vender", "strike", "preço de venda", "preco de venda", "33"],
      aindaPratique: "saber o que acontece no exercício da venda coberta",
      transferencia: {
        titulo: "O dia em que exerceram",
        situacao:
          "Você vendeu a call K33 por R$0,90 e tem 100 PETR4 compradas a R$30. A ação sobe para R$34 e o comprador exerce a opção.",
        pergunta: "O que acontece com você?",
        opcoes: [
          {
            texto: "Entrega as ações a R$33 e mantém o prêmio — operação encerrada no lucro",
            tom: "correta",
            feedback:
              "Boa decisão. Na venda coberta o exercício é o fim planejado: lucro = (33 − 30) × 100 + R$90 = R$390. Nada de correr atrás da alta.",
          },
          {
            texto: "Precisa comprar 100 ações no mercado por R$34 para entregar",
            tom: "quase",
            feedback:
              "Quase: isso é a dor da call DESCOBERTA. Coberta, as ações já são suas — você só entrega o que tem.",
          },
          {
            texto: "Perde sem limite, pois a ação pode subir muito",
            tom: "errada",
            feedback:
              "Risco ilimitado é da venda descoberta. Na coberta, o pior caso é entregar as ações pelo strike.",
          },
          {
            texto: "Nada acontece, porque ainda faltam dias para o vencimento",
            tom: "errada",
            feedback:
              "Exercício antecipado existe: com a call ITM, o comprador pode exercer e você entrega as ações.",
          },
        ],
      },
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
    ordem: 16,
    nivel: 3,
    titulo: "Lição 16 — Rolagem (Roll)",
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
      titulo: "A call com 2 dias",
      situacao:
        "PETR4 está em R$38. Você comprou uma CALL de strike 38. Faltam 2 dias para o vencimento. Você continua acreditando na alta.",
      pergunta: "O que você faria com essa posição?",
      opcoes: [
        {
          texto: "Deixar vencer",
          tom: "errada",
          feedback:
            "Com 2 dias e a tese viva, deixar vencer é entregar o prêmio para o theta. O problema não é a tese — é o prazo.",
        },
        {
          texto: "Fazer Roll Out",
          tom: "correta",
          feedback:
            "Boa decisão. Você identificou que o problema não é necessariamente a tese, mas o tempo restante. Roll Out mantém o strike e aumenta o tempo da operação.",
        },
        {
          texto: "Fazer Roll Down",
          tom: "quase",
          feedback:
            "Quase. Você percebeu que a operação precisa ser ajustada, mas escolheu uma rolagem diferente. Roll Down abaixa o strike — é para quem a tese virou baixista. Quem continua acreditando na alta e só precisa de tempo faz Roll Out. Veja novamente a diferença entre Roll Out e Roll Down.",
        },
        {
          texto: "Encerrar",
          tom: "quase",
          feedback:
            "Quase: encerrar é sempre legítimo, mas você ainda acredita na alta — e o problema é só o prazo. Roll Out resolve com mais tempo. Se a tese tivesse caído, aí sim: encerra.",
        },
      ],
      termosExplicacao: ["out", "tempo", "strike", "vencimento", "rolar"],
      aindaPratique: "diferenciar Roll Out de Roll Down na prática",
      transferencia: {
        titulo: "CALL 40 presa no tempo",
        situacao:
          "Você possui uma CALL 40 com vencimento em agosto. Faltam 3 dias. Você mantém a tese, mas precisa de mais tempo para o movimento acontecer — e quer preservar o strike 40.",
        pergunta: "Qual ajuste preserva o strike e compra mais tempo?",
        opcoes: [
          {
            texto: "Rolar para setembro mantendo o strike 40 (Roll Out)",
            tom: "correta",
            feedback:
              "Boa decisão. Roll Out = mesmo strike + novo vencimento: a tese ganha o tempo que faltava sem mudar o preço-alvo.",
          },
          {
            texto: "Rolar para setembro com strike menor (Roll Down)",
            tom: "quase",
            feedback:
              "Quase: você ganhou tempo, mas mudou o strike — e a tese não mudou. Roll Down é para quando a tese perde força.",
          },
          {
            texto: "Encerrar e remontar depois",
            tom: "quase",
            feedback:
              "Quase: encerrar é legítimo, mas custa o theta já perdido e a reentrada. A tese segue viva — o problema é só o prazo.",
          },
          {
            texto: "Manter até o vencimento",
            tom: "errada",
            feedback: "Com 3 dias, manter é doar o resto do prêmio para o theta sem ganhar nada.",
          },
        ],
      },
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
    ordem: 11,
    nivel: 3,
    titulo: "Lição 11 — Trava de Alta (Bull Call Spread)",
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
    comparativo: {
      titulo: "CALL comprada × Trava de alta",
      colunas: ["", "CALL comprada", "Trava de alta"],
      linhas: [
        { item: "Custo", valores: ["Prêmio maior", "Débito menor (prêmio − prêmio)"] },
        { item: "Perda máxima", valores: ["O prêmio inteiro", "Só o débito"] },
        { item: "Lucro máximo", valores: ["Ilimitado", "Limitado (largura − débito)"] },
        { item: "Ponto de equilíbrio", valores: ["Strike + prêmio", "Strike comprado + débito"] },
        {
          item: "Sensibilidade ao tempo",
          valores: ["Perde mais (prêmio cheio)", "Perde menos (débito menor)"],
        },
      ],
    },
    cenarios: [
      {
        titulo: "Preço cai",
        tom: "perda",
        descricao:
          "PETR4 cai para R$36. A call comprada perde o prêmio inteiro (R$1,50). A trava perde só o débito (R$0,90). As duas perderam — a trava perdeu menos porque pagou menos.",
      },
      {
        titulo: "Preço fica próximo",
        tom: "neutro",
        descricao:
          "PETR4 fica em R$38,50. A call comprada já perdeu para o theta; a trava idem, mas sobre um custo menor. Resultado intermediário nas duas — sem movimento, o tempo cobra.",
      },
      {
        titulo: "Preço sobe bastante",
        tom: "ganho",
        descricao:
          "PETR4 dispara para R$44. A call comprada captura tudo (ilimitado). A trava para no strike vendido: lucro máximo de R$1,10. A call ganhou mais — a trava pagou menos por isso.",
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
      titulo: "Quantas travas?",
      situacao:
        "PETR4 está a R$38. Você monta uma trava de alta K38/K40 por R$0,90 (R$90 por lote). Seu patrimônio é R$20.000 e a regra do 1% vale para tudo.",
      pergunta: "Quantos lotes você monta?",
      opcoes: [
        {
          texto: "2 lotes (R$180)",
          tom: "correta",
          feedback:
            "Boa decisão. 1% de R$20.000 = R$200. 2 lotes (R$180) cabem; 3 lotes (R$270) já furariam o limite.",
        },
        {
          texto: "1 lote (R$90)",
          tom: "quase",
          feedback:
            "Quase: 1 lote é válido e conservador, mas 2 lotes ainda respeitam a regra — você não precisa operar no teto.",
        },
        {
          texto: "3 lotes (R$270)",
          tom: "errada",
          feedback:
            "R$270 > R$200: você trocou a regra pelo palpite. Risco se define pela perda, nunca pelo ganho.",
        },
        {
          texto: "10 lotes, pois a perda é limitada",
          tom: "errada",
          feedback:
            "Perda limitada não significa perda pequena: 10 lotes = R$900 = 4,5% do patrimônio numa só operação.",
        },
      ],
      termosExplicacao: ["1%", "risco", "lote", "200", "trava"],
      aindaPratique: "calcular o ganho máximo de uma trava de alta",
      transferencia: {
        titulo: "A trava que chegou no teto",
        situacao:
          "PETR4 subiu para R$41. Sua trava de alta K38/K40 custou R$0,90 por lote (diferença de strikes: R$2,00).",
        pergunta: "O que acontece com o seu resultado agora?",
        opcoes: [
          {
            texto: "Está no máximo: R$1,10 por lote (2,00 de diferença − 0,90 de custo)",
            tom: "correta",
            feedback:
              "Boa decisão. Acima da K40, a call vendida entrega o excesso da alta — é o preço do risco limitado. O ganho máximo da trava = largura − custo.",
          },
          {
            texto: "Continua subindo junto com a ação",
            tom: "quase",
            feedback:
              "Quase: só até a K40. Depois do strike vendido, o ganho para — a trava foi feita para lucrar entre os strikes.",
          },
          {
            texto: "É ilimitado, pois o ativo segue subindo",
            tom: "errada",
            feedback:
              "A call vendida (K40) corta o ganho além do strike. Ilimitado é call comprada a seco.",
          },
          {
            texto: "Agora você perde, porque a call vendida está ITM",
            tom: "errada",
            feedback:
              "A call vendida ITM limita o ganho, mas a comprada (K38) valoriza junto: juntas, a trava segura o lucro máximo.",
          },
        ],
      },
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
    ordem: 12,
    nivel: 3,
    titulo: "Lição 12 — Trava de Baixa (Bear Put Spread)",
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
    comparativo: {
      titulo: "PUT comprada × Trava de baixa",
      colunas: ["", "PUT comprada", "Trava de baixa"],
      linhas: [
        { item: "Custo", valores: ["Prêmio maior", "Débito menor"] },
        { item: "Perda máxima", valores: ["O prêmio inteiro", "Só o débito"] },
        {
          item: "Lucro máximo",
          valores: ["Ilimitado (até o ativo zerar)", "Limitado (largura − débito)"],
        },
        { item: "Ponto de equilíbrio", valores: ["Strike − prêmio", "Strike vendido − débito"] },
        { item: "Sensibilidade ao tempo", valores: ["Perde mais", "Perde menos"] },
      ],
    },
    cenarios: [
      {
        titulo: "O ativo sobe",
        tom: "perda",
        descricao:
          "O ativo sobe contra a hipótese. A put comprada perde o prêmio inteiro; a trava perde só o débito. As duas erraram a direção — a trava pagou menos pelo erro.",
      },
      {
        titulo: "O ativo fica parado",
        tom: "neutro",
        descricao:
          "Sem queda, o tempo corrói as duas — a trava sobre um custo menor. Resultado intermediário: a espera é mais barata na trava.",
      },
      {
        titulo: "O ativo cai forte",
        tom: "ganho",
        descricao:
          "O ativo despenca. A put comprada captura a queda inteira (até zerar); a trava para no strike comprado — lucro máximo conhecido desde o início.",
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
      titulo: "Queda moderada",
      situacao:
        "PETR4 está a R$38. Você espera uma queda moderada, de cerca de 5%. A put K38 pura custa R$1,40. A trava K38/K36 custa R$0,90.",
      pergunta: "Qual estrutura combina com a sua expectativa?",
      opcoes: [
        {
          texto: "Trava K38/K36 por R$0,90",
          tom: "correta",
          feedback:
            "Boa decisão. Queda moderada + prêmio menor: a trava barateia a aposta. Se esperasse queda forte, a put pura ganharia no extremo.",
        },
        {
          texto: "Put K38 pura por R$1,40",
          tom: "quase",
          feedback:
            "Quase: a put pura paga no extremo, mas custa mais. Para uma queda de 5%, o custo extra raramente compensa.",
        },
        {
          texto: "Vender put K36",
          tom: "errada",
          feedback: "Vender put é apostar que NÃO cai — direção contrária à sua tese.",
        },
        {
          texto: "Trava de alta K38/K40",
          tom: "errada",
          feedback: "Trava de alta lucra se o ativo subir: a direção oposta da sua aposta.",
        },
      ],
      termosExplicacao: ["moderada", "barateia", "custo", "trava"],
      aindaPratique: "saber quando a trava de baixa para de pagar",
      transferencia: {
        titulo: "A queda que veio forte",
        situacao:
          "Você montou uma destas estruturas: a put K38 pura (R$1,40) ou a trava K38/K36 (R$0,90). PETR4 despenca 20% num único pregão.",
        pergunta: "Qual estrutura agora vale muito mais?",
        opcoes: [
          {
            texto: "A put K38 pura",
            tom: "correta",
            feedback:
              "Boa decisão. No extremo, a trava para de ganhar na K36; a put pura acompanha a queda inteira. A trava é mais barata justamente porque não paga no extremo.",
          },
          {
            texto: "A trava K38/K36",
            tom: "quase",
            feedback:
              "Quase: ela lucra, mas está limitada a R$1,10 por lote (38 − 36 − 0,90). Quem pagou o prêmio maior (put pura) recebe mais no extremo.",
          },
          {
            texto: "As duas valem exatamente o mesmo",
            tom: "errada",
            feedback:
              "Não: a trava entrega a queda até a K36 e para; a put pura segue até o ativo zerar.",
          },
          {
            texto: "A call K40 vendida",
            tom: "errada",
            feedback:
              "Vender call também lucra com queda, mas ela não estava nas duas estruturas comparadas aqui.",
          },
        ],
      },
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
    ordem: 17,
    nivel: 3,
    titulo: "Lição 17 — Rolagem defensiva na prática",
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
      titulo: "A segunda rolagem",
      situacao:
        "Você vendeu a call K40 por R$1,00. PETR4 está a R$41,50 e a call vale R$1,80. Você já rolou essa operação uma vez no mês passado.",
      pergunta: "O que a regra de ouro manda fazer?",
      opcoes: [
        {
          texto: "Rolar de novo para o próximo mês",
          tom: "errada",
          feedback: "Máximo 1 rolagem por operação. A segunda rolagem é insistência, não gestão.",
        },
        {
          texto: "Encerrar a posição",
          tom: "correta",
          feedback:
            "Boa decisão. Você já rolou uma vez — a regra de ouro é 1 rolagem. Se falhou de novo, encerra.",
        },
        {
          texto: "Rolar com strike maior",
          tom: "quase",
          feedback:
            "Quase: mudar o strike não muda o fato de que você já rolou. A regra vale para a operação, não para o tipo de roll.",
        },
        {
          texto: "Não fazer nada",
          tom: "errada",
          feedback:
            "Ficar parado com a call ITM é decidir ser exercido por omissão — e com prejuízo de R$0,80 no papel.",
        },
      ],
      termosExplicacao: ["encerrar", "regra", "segunda", "uma vez", "rolagem"],
      aindaPratique: "distinguir rolar para gerir de rolar para adiar prejuízo",
      transferencia: {
        titulo: "A primeira rolagem",
        situacao:
          "Você vendeu a call K40 por R$1,00. Faltam 10 dias e PETR4 está a R$40,50 — a call está levemente ITM. Você ainda não rolou esta operação.",
        pergunta: "Quando a rolagem é legítima?",
        opcoes: [
          {
            texto: "Quando a tese segue viva e é a primeira rolagem",
            tom: "correta",
            feedback:
              "Boa decisão. Uma rolagem com tese viva é gestão; a segunda é insistência. A regra de ouro limita, não proíbe.",
          },
          {
            texto: "Sempre que o prejuízo estiver grande, para não realizá-lo",
            tom: "errada",
            feedback:
              "Essa é a armadilha: rolar para adiar o prejuízo não muda a tese — e o prejuízo continua lá, só que maior.",
          },
          {
            texto: "Quando a rolagem gerar crédito, mesmo sem tese",
            tom: "quase",
            feedback:
              "Quase: crédito bom é consequência, não critério. Sem tese, o caminho é encerrar.",
          },
          {
            texto: "Nunca — rolagem sempre é erro",
            tom: "errada",
            feedback:
              "Rolar uma vez com tese viva é prática padrão do mercado. A regra de ouro é o limite, não a proibição.",
          },
        ],
      },
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
    ordem: 18,
    nivel: 3,
    titulo: "Lição 18 — Gestão de risco em travas",
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
      titulo: "O setup perfeito",
      situacao:
        'Sua trava deu lucro em 3 de 5 operações. Agora você quer montar 8 lotes "porque o setup está perfeito". Patrimônio: R$50.000. A trava custa R$90 por lote.',
      pergunta: "O que a regra do 1% decide?",
      opcoes: [
        {
          texto: "Máximo 5 lotes (R$450 ≤ R$500)",
          tom: "correta",
          feedback:
            "Boa decisão. 1% de R$50.000 = R$500. 8 lotes = R$720 (1,4%): o setup bonito não muda a matemática da ruína.",
        },
        {
          texto: "8 lotes, porque a taxa de acerto é 60%",
          tom: "errada",
          feedback:
            "Acerto de 60% não compensa perdas maiores: com 8 lotes, uma sequência ruim derruba o mês. Expectativa decide, não otimismo.",
        },
        {
          texto: "Máximo 6 lotes (R$540)",
          tom: "quase",
          feedback: "Quase: R$540 ainda passa do teto de R$500. O limite é 5 lotes.",
        },
        {
          texto: "Qualquer tamanho, pois a perda é limitada",
          tom: "errada",
          feedback:
            "Perda limitada por operação não é risco aceitável. O limite é o capital, não a estrutura.",
        },
      ],
      termosExplicacao: ["1%", "lote", "risco", "500", "regra"],
      aindaPratique: "definir o ponto de saída antes de montar a estrutura",
      transferencia: {
        titulo: "A trava que virou refém",
        situacao:
          "Sua trava K40/K38 (crédito de R$0,90, perda máxima R$1,10 por lote) está contra você: PETR4 em R$45, bem além da tese inicial.",
        pergunta: "Qual é a decisão de risco correta?",
        opcoes: [
          {
            texto: "Honrar o stop definido antes: encerrar e aceitar a perda planejada",
            tom: "correta",
            feedback:
              "Boa decisão. Risco gerenciado é perda planejada: ponto de saída definido ANTES e honrado. 'Perda limitada' não é desculpa para virar refém da posição.",
          },
          {
            texto: "Aumentar os lotes, pois a perda é limitada",
            tom: "errada",
            feedback:
              "Perda limitada por lote × mais lotes = perda maior. Nunca aumentar contra a tese.",
          },
          {
            texto: "Esperar o vencimento custe o que custar",
            tom: "errada",
            feedback:
              "Segurar até o fim transforma risco planejado em aposta. O stop existe para ser cumprido.",
          },
          {
            texto: "Rolar a trava para o mês seguinte",
            tom: "quase",
            feedback:
              "Quase: rolar é opção se a tese seguisse viva — mas a R$45 ela quebrou. Com a tese morta, encerrar é a gestão honesta.",
          },
        ],
      },
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
    slug: "volatilidade-e-vega",
    ordem: 7,
    nivel: 2,
    titulo: "Lição 7 — Volatilidade e o preço da ansiedade",
    resumo:
      "Volatilidade não é direção: é tamanho do movimento que o mercado já espera. Entender isso muda o que você paga.",
    problema: {
      titulo: "A opção que derreteu sem o ativo andar",
      texto:
        "PETR4 ficou 3 dias parada, mas a sua call perdeu 30% do valor. O ativo não caiu — e mesmo assim você perdeu. Não foi sorte do mercado: o prêmio tem uma parte que não depende da direção.",
      pergunta: "O que desvalorizou a sua call se o ativo não andou?",
    },
    conceitos: [
      {
        titulo: "Volatilidade implícita: o tamanho do movimento esperado",
        corpo: `
A **volatilidade implícita (IV)** é o tamanho do movimento que o mercado está *esperando*, não a direção. IV alta = o mercado espera um movimento grande (para qualquer lado). IV baixa = mercado espera calmaria.

| IV alta | IV baixa |
|---|---|
| Prêmios caros | Prêmios baratos |
| Mercado espera movimento grande | Mercado espera calmaria |
| Depois do evento, costuma cair | Pode subir de repente (evento) |

Um prêmio caro pode ser apenas "o mercado já sabe do evento". Você não paga caro porque está comprando algo melhor — paga porque todos esperam um movimento grande.
        `,
      },
      {
        titulo: "Vega e o IV crush",
        corpo: `
**Vega** mede quanto o prêmio muda quando a IV muda. Depois de um evento (juros, balanço, dividendos), a IV costuma **cair de uma vez** — isso é o **IV crush**: o prêmio derrete mesmo que o ativo não ande.

**Regra prática:** comprar opção logo antes de um evento é comprar ansiedade no preço máximo. Esperar o evento passar é comprar quando a ansiedade já foi embora.
        `,
      },
    ],
    analogia:
      "Seguro de carro: o prêmio sobe quando o bairro fica perigoso — mesmo que o seu carro seja o mesmo. O mercado faz igual: quando todos esperam movimento grande, todo prêmio sobe.",
    naPratica: {
      titulo: "Antes de pagar o prêmio",
      passos: [
        "A sua tese é de DIREÇÃO ou de VOLATILIDADE? Se for só direção, cuidado com IV alta.",
        "O mercado já espera esse movimento? Se sim, o movimento pode acontecer e o prêmio só não derreter.",
        "Tem evento perto (juros, balanço, vencimento)? Comprar antes do evento é pagar o pico.",
        "Se a IV está alta e você não tem tese de volatilidade, prefira esperar o pico passar.",
      ],
    },
    missao: {
      titulo: "Comprar na véspera do evento",
      situacao:
        "Amanhã tem decisão de juros. A IV da PETR4 subiu de 28% para 62% em uma semana. Você quer comprar uma call porque acredita em alta.",
      pergunta: "O que fazer com essa call?",
      opcoes: [
        {
          texto: "Comprar agora, pois o prêmio ainda vai subir",
          tom: "errada",
          feedback:
            "O prêmio pode até subir, mas você está pagando a ansiedade no pico — e a direção que você quer não depende do evento. Se o juros sair 'neutro', o IV crush derrete a call mesmo sem o ativo andar.",
        },
        {
          texto: "Esperar o evento passar e avaliar a call de novo",
          tom: "correta",
          feedback:
            "Boa decisão. Depois do evento, a IV cai e o prêmio fica mais barato — você compra o movimento real com menos custo de ansiedade.",
        },
        {
          texto: "Comprar um strike mais OTM, que é mais barato",
          tom: "quase",
          feedback:
            "Quase: OTM barato continua exposto ao IV crush — a IV cai, o prêmio derrete e o movimento pequeno não cobre. Mais barato não é menos exposto.",
        },
        {
          texto: "Vender a opção, já que a IV está alta",
          tom: "quase",
          feedback:
            "Quase: vender IV alta é uma tese legítima — mas é uma tese de VOLATILIDADE, não de direção. Se a sua hipótese é alta, vender prêmio vai contra ela.",
        },
      ],
      termosExplicacao: ["volatilidade", "iv", "crush", "evento", "prêmio", "vega"],
      aindaPratique: "identificar quando o prêmio está caro por ansiedade e não por direção",
      transferencia: {
        titulo: "O prêmio barato demais",
        situacao:
          "A IV da VALE3 está em 18%, a menor do ano, e não há evento marcado. O prêmio das calls parece muito barato para a sua hipótese de alta.",
        pergunta: "O que o prêmio barato está dizendo?",
        opcoes: [
          {
            texto: "O mercado espera calmaria — o prêmio não vai derreter por ansiedade",
            tom: "correta",
            feedback:
              "Boa leitura. IV baixa = expectativa de calmaria: você paga pouco por ansiedade, e a direção é o que decide. O risco de IV crush é pequeno.",
          },
          {
            texto: "O prêmio barato garante lucro se o ativo subir",
            tom: "quase",
            feedback:
              "Quase: barato reduz o custo, mas o ativo ainda precisa subir a tempo. Prêmio barato não é garantia — é menos pagamento de ansiedade.",
          },
          {
            texto: "O prêmio barato significa que o mercado prevê queda",
            tom: "errada",
            feedback:
              "IV não é direção: IV baixa é tamanho de movimento pequeno esperado, não opinião de queda.",
          },
          {
            texto: "É o melhor momento para vender prêmio",
            tom: "errada",
            feedback:
              "Vender IV baixa é receber pouco por risco alto: se surgir um evento, o prêmio sobe contra você. Vender IV baixa é comprar risco barato demais.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O que a volatilidade implícita mede?",
        alternativas: [
          "A direção que o mercado espera",
          "O tamanho do movimento que o mercado espera, sem direção",
          "O lucro máximo da operação",
          "A probabilidade de exercício",
        ],
        correta: 1,
        explicacao:
          "IV é magnitude esperada, não direção. Alta = movimento grande (para qualquer lado).",
      },
      {
        pergunta: "O que é IV crush?",
        alternativas: [
          "A queda rápida da IV depois de um evento, derretendo o prêmio",
          "A subida do prêmio antes de um evento",
          "O vencimento de uma opção OTM",
          "A corrosão do theta na última semana",
        ],
        correta: 0,
        explicacao:
          "Depois do evento, a ansiedade some e a IV cai — o prêmio derrete mesmo sem o ativo andar.",
      },
      {
        pergunta: "IV em 65% e decisão de juros amanhã. Sua tese é de alta. O que isso indica?",
        alternativas: [
          "Ótimo momento para comprar call barata",
          "O prêmio já embute o evento — comprar agora é pagar a ansiedade no pico",
          "A call vai ser exercida amanhã",
          "O strike deve ser mais OTM",
        ],
        correta: 1,
        explicacao:
          "IV alta antes de evento = prêmio caro por expectativa. Depois do evento, o IV crush derruba o prêmio.",
      },
    ],
  },
  {
    slug: "protective-put",
    ordem: 10,
    nivel: 3,
    titulo: "Lição 10 — Protective Put (o seguro da posição)",
    resumo: "Ações + PUT comprada: você mantém a tese de alta e compra um piso para a queda.",
    problema: {
      titulo: "Medo de cair sem querer vender",
      texto:
        "Você comprou VALE3 a R$60 e ela está em R$75. A tese de alta segue viva, mas uma notícia ruim pode derrubar tudo — e você não quer vender agora (imposto, e a tese não mudou).",
      pergunta: "Como manter a posição e dormir com um piso debaixo?",
    },
    conceitos: [
      {
        titulo: "Montagem",
        corpo: `
O protective put é **ter as ações e comprar uma PUT** no strike que você não quer ver quebrado.

- **Já tem** as ações
- **Compra** put strike abaixo do preço atual
- Mesmo vencimento define o prazo da proteção

## Números (VALE3 a R$75)
- Ações compradas a R$60 (lucro de R$15)
- Compra put K70 por R$1,50
- **Piso**: se VALE3 cair, a partir de R$70 quem paga a queda é a put
- **Custo**: R$1,50 por ação = o preço do seguro
        `,
      },
      {
        titulo: "O que a proteção faz com o resultado",
        corpo: `
| | Só ações | Ações + PUT |
|---|---|---|
| Perda se cair | Toda a queda | Limitada até o strike do seguro |
| Lucro se subir | Todo o ganho | Ganho − prêmio do seguro |
| Custo | Zero | O prêmio da put |

**A pergunta certa não é "o prêmio é caro?"** — é "o que a queda que eu temo me custaria sem o seguro?".
        `,
      },
    ],
    comparativo: {
      titulo: "Só ações × ações com seguro",
      colunas: ["", "Só ações", "Ações + PUT"],
      linhas: [
        { item: "Custo de entrada", valores: ["Apenas as ações", "Ações + prêmio da put"] },
        {
          item: "Perda máxima",
          valores: ["Até o preço das ações", "Limitada ao strike do seguro"],
        },
        { item: "Lucro máximo", valores: ["Ilimitado", "Ilimitado − prêmio do seguro"] },
        { item: "Proteção contra queda", valores: ["Nenhuma", "Piso definido por você"] },
        { item: "Custo da proteção", valores: ["Zero", "O prêmio, que vira pó no vencimento"] },
      ],
    },
    cenarios: [
      {
        titulo: "O ativo cai forte",
        tom: "perda",
        descricao:
          "VALE3 despenca para R$58. Sem o seguro, você perde R$17. Com a put K70, a partir de R$70 quem cobre a queda é o seguro — a perda fica limitada ao custo da proteção.",
      },
      {
        titulo: "O ativo fica parado",
        tom: "neutro",
        descricao:
          "VALE3 continua em R$75. Você paga só o prêmio do seguro — o custo de ter dormido tranquilo durante a notícia ruim.",
      },
      {
        titulo: "O ativo sobe bastante",
        tom: "ganho",
        descricao:
          "VALE3 vai a R$95. Você embolsa o ganho da ação (R$35) e perde apenas o prêmio da put — o seguro não limitou o lado bom.",
      },
    ],
    analogia:
      "Seguro de casa: você espera que a casa não pegue fogo, mas paga a apólice mesmo assim. Não é pessimismo — é definir quanto da catástrofe você está disposto a pagar do próprio bolso.",
    naPratica: {
      titulo: "Antes de comprar a proteção",
      passos: [
        "Qual queda eu NÃO aguento assistir? Esse é o strike do seguro.",
        "O prêmio cabe no meu custo aceitável? Proteção boa é a que você não abandona na primeira semana.",
        "O prazo do seguro cobre o período de risco? Evento em 3 semanas → seguro até o vencimento.",
        "Se o seguro vencer e o risco continuar, eu renovo?",
      ],
    },
    missao: {
      titulo: "A notícia ruim que chega",
      situacao:
        "Você tem 100 ações de VALE3 a R$75 (comprou a R$60). Sai uma notícia que pode derrubar o setor. Você mantém a tese de alta de longo prazo.",
      pergunta: "Qual é a decisão mais alinhada ao protective put?",
      opcoes: [
        {
          texto: "Comprar uma put de strike R$70 com vencimento após o evento",
          tom: "correta",
          feedback:
            "Boa decisão. Você mantém a tese, define o piso (R$70) e cobre o período do evento. O prêmio é o custo da tranquilidade.",
        },
        {
          texto: "Vender todas as ações agora",
          tom: "quase",
          feedback:
            "Quase: vender é sempre legítimo, mas a tese não mudou — e você realiza imposto e perde o upside. O seguro existe para você não precisar vender.",
        },
        {
          texto: "Não fazer nada, pois o prêmio é 'caro'",
          tom: "quase",
          feedback:
            "Quase: o prêmio sempre parece caro até a queda. A pergunta certa é: quanto a queda temida custaria sem o seguro?",
        },
        {
          texto: "Comprar mais ações, já que estão 'baratas'",
          tom: "errada",
          feedback:
            "Você está aumentando a exposição à queda na pior hora — a notícia pode derrubar o setor. Isso é média no prejuízo, não gestão de risco.",
        },
      ],
      termosExplicacao: ["put", "strike", "piso", "prêmio", "seguro", "proteção"],
      aindaPratique:
        "escolher o strike do seguro pelo piso que você aceita, não pelo preço do prêmio",
      transferencia: {
        titulo: "O seguro que não foi usado",
        situacao:
          "Você comprou a put K70 e o evento passou sem queda. VALE3 está em R$78, a put vale pouco e faltam 20 dias.",
        pergunta: "O que fazer com o seguro?",
        opcoes: [
          {
            texto:
              "Avaliar se o risco passou: se sim, deixar o seguro expirar é pagar o custo da tranquilidade",
            tom: "correta",
            feedback:
              "Boa leitura. O seguro cumpriu o papel mesmo sem ser usado. Renovar sem risco presente é pagar prêmio sem necessidade.",
          },
          {
            texto: "Vender a put agora para recuperar parte do prêmio",
            tom: "quase",
            feedback:
              "Quase: vender a put recupera o que sobrou de valor — legítimo se o risco acabou. Só não renove sem risco.",
          },
          {
            texto: "Rolar o seguro para o próximo vencimento automaticamente",
            tom: "errada",
            feedback:
              "Rolar sem risco presente é comprar proteção que você não precisa. O custo da proteção deve existir enquanto o risco existir.",
          },
          {
            texto: "Vender as ações, já que o seguro 'não rendeu'",
            tom: "errada",
            feedback:
              "Seguro não rende: ele limita perda. Vender por frustração do prêmio é decidir pela emoção, não pela tese.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O que o protective put faz?",
        alternativas: [
          "Limita o lucro da posição",
          "Mantém a tese de alta e define um piso para a queda",
          "Elimina o custo das ações",
          "Protege contra o vencimento",
        ],
        correta: 1,
        explicacao: "Ações + put comprada: o upside fica e o downside ganha piso.",
      },
      {
        pergunta:
          "VALE3 a R$75, você compra put K70 por R$1,50. Se o ativo cair a R$60, qual sua perda por ação (ações a R$60)?",
        alternativas: ["R$15,00", "R$3,00", "R$6,50", "R$1,50"],
        correta: 2,
        explicacao:
          "Com a put K70, sua posição efetiva vende a R$70: perda = 70 − 60 = R$10 da ação, + R$1,50 do prêmio → R$11,50? Recalcule: você comprou a R$60 e o piso garante venda a R$70: ganho de R$10 na ação, menos R$1,50 do seguro = R$8,50 de lucro. Nunca perde abaixo do piso.",
      },
      {
        pergunta: "Qual a pergunta certa ao avaliar o prêmio do seguro?",
        alternativas: [
          "O prêmio está caro ou barato?",
          "Quanto a queda que eu temo me custaria sem o seguro?",
          "O seguro vai render no vencimento?",
          "A put está ITM?",
        ],
        correta: 1,
        explicacao: "Proteção se avalia pelo prejuízo evitado, não pelo preço do prêmio.",
      },
    ],
  },
  {
    slug: "straddle",
    ordem: 13,
    nivel: 3,
    titulo: "Lição 13 — Straddle (movimento grande, qualquer direção)",
    resumo:
      "Compra CALL + compra PUT no mesmo strike: você não escolhe direção — exige movimento grande.",
    problema: {
      titulo: "Amanhã muda tudo",
      texto:
        "Um evento pode mover a ação 10% — para cima OU para baixo. Você não sabe a direção, mas tem certeza de que vai andar muito. Se comprar só call e cair, perde. Se comprar só put e subir, perde.",
      pergunta: "Existe uma estrutura para 'vai andar, não sei pra onde'?",
    },
    conceitos: [
      {
        titulo: "Montagem",
        corpo: `
O straddle é **comprar uma CALL e uma PUT no mesmo strike e mesmo vencimento**.

- **Compra** call K38
- **Compra** put K38
- Custo total = prêmio das duas

## Números (PETR4 a R$38)
- Call K38: R$1,10 · Put K38: R$0,90
- **Custo total**: R$2,00 por ação
- **Breakevens**: R$36,00 e R$40,00
- Só lucra se o ativo andar **mais de R$2,00** para qualquer lado
        `,
      },
      {
        titulo: "O que o straddle está comprando",
        corpo: `
O straddle compra **movimento** — não direção. Ele perde para o tempo e para a queda de IV, e ganha quando o ativo anda mais do que o custo total.

| | Straddle |
|---|---|
| Hipótese | Movimento grande, direção incerta |
| Perda máxima | Prêmio total (as duas opções) |
| Lucro máximo | Ilimitado em qualquer lado (acima dos breakevens) |
| Breakevens | Strike ± custo total |
| Inimigos | Theta (tempo) e IV crush (depois do evento) |
        `,
      },
    ],
    comparativo: {
      titulo: "Straddle × Strangle",
      colunas: ["", "Straddle", "Strangle"],
      linhas: [
        {
          item: "Custo total",
          valores: ["Maior (ATM nos dois lados)", "Menor (OTM nos dois lados)"],
        },
        {
          item: "Movimento necessário",
          valores: ["Menor (strike ± custo)", "Maior (strikes + custo)"],
        },
        { item: "Perda máxima", valores: ["Prêmio total", "Prêmio total"] },
        {
          item: "Quando faz sentido",
          valores: ["Movimento médio esperado", "Movimento grande esperado"],
        },
      ],
    },
    cenarios: [
      {
        titulo: "O ativo não anda",
        tom: "perda",
        descricao:
          "O evento passou e o ativo andou 0,5%. As duas opções perdem para o theta — você perde o prêmio total. Straddle exige movimento, não apenas evento.",
      },
      {
        titulo: "O ativo anda moderado",
        tom: "neutro",
        descricao:
          "O ativo anda R$1,50 — menos que o custo de R$2,00. Uma perna valoriza, a outra derrete: resultado parcial, ainda negativo ou perto do zero.",
      },
      {
        titulo: "O ativo anda muito",
        tom: "ganho",
        descricao:
          "O ativo anda R$4,00 para qualquer lado. A perna certa valoriza mais que o custo das duas — e o lucro continua enquanto o ativo andar.",
      },
    ],
    analogia:
      "Pedir comida em dois restaurantes ao mesmo tempo: você paga os dois. Só compensa se o desconto (o movimento) for grande — se nenhum dos dois tiver promoção, o prejuízo é o custo dos dois pedidos.",
    naPratica: {
      titulo: "Antes de montar o straddle",
      passos: [
        "Movimento necessário = custo total. O evento que eu espero move isso?",
        "Estou pagando IV alta de véspera? Se sim, o próprio evento derrete o prêmio (IV crush).",
        "O vencimento cobre o evento?",
        "Se o movimento não vier, eu encerro quando? (Stop por tempo é obrigatório.)",
      ],
    },
    missao: {
      titulo: "A decisão de juros",
      situacao:
        "Amanhã sai a decisão de juros. A IV está em 28% (baixa). Você acredita que o mercado vai andar muito, mas não tem opinião de direção.",
      pergunta: "Qual estrutura expressa essa hipótese?",
      opcoes: [
        {
          texto: "Straddle (call + put no mesmo strike)",
          tom: "correta",
          feedback:
            "Boa decisão. IV baixa antes do evento = prêmio barato para comprar movimento, e o straddle não exige direção.",
        },
        {
          texto: "Comprar call, apostando na alta",
          tom: "quase",
          feedback:
            "Quase: você tem certeza de movimento, não de direção. Call comprada é direção — e se cair, você perde o evento inteiro.",
        },
        {
          texto: "Strangle (call + put OTM)",
          tom: "quase",
          feedback:
            "Quase: o strangle é a mesma tese com custo menor — mas exige movimento ainda maior. Se o evento for médio, o straddle alcança; o strangle, não.",
        },
        {
          texto: "Não operar, pois é 'aposta'",
          tom: "quase",
          feedback:
            "Quase: não operar é sempre legítimo. Mas com IV baixa e evento marcado, a hipótese de movimento tem preço barato — a estrutura existe para expressá-la.",
        },
      ],
      termosExplicacao: ["straddle", "call", "put", "strike", "movimento", "iv"],
      aindaPratique: "calcular os breakevens de um straddle (strike ± custo total)",
      transferencia: {
        titulo: "Depois do evento",
        situacao:
          "O juros saiu 'neutro'. O straddle perdeu valor para o IV crush, mas faltam 15 dias de vencimento e você acredita que o mercado ainda vai escolher um lado.",
        pergunta: "Qual é a decisão mais alinhada?",
        opcoes: [
          {
            texto: "Avaliar o que sobrou: encerrar ou aceitar o risco restante com stop",
            tom: "correta",
            feedback:
              "Boa gestão. O IV crush já cobrou a conta da véspera; o que sobra é decisão de processo: stop definido e tese clara.",
          },
          {
            texto: "Comprar outro straddle para o próximo vencimento",
            tom: "quase",
            feedback:
              "Quase: rolar para pagar prêmio de novo, sem evento novo, é insistir. Reavalie a hipótese antes de repor o custo.",
          },
          {
            texto: "Vender as duas pernas imediatamente para não perder mais",
            tom: "quase",
            feedback:
              "Quase: vender no pior momento do crush pode ser vender o fundo. A decisão deve seguir o stop definido, não o pânico.",
          },
          {
            texto: "Transformar em call comprada, pois 'agora a direção vai aparecer'",
            tom: "errada",
            feedback:
              "A direção não aparece com o vencimento: aparecer, aparecia antes. Mudar a estrutura para tentar 'recuperar' é a armadilha da média no prejuízo.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Qual hipótese o straddle expressa?",
        alternativas: [
          "Alta com força",
          "Movimento grande, direção incerta",
          "Queda com força",
          "Lateralização",
        ],
        correta: 1,
        explicacao:
          "Straddle compra movimento: ganha se o ativo andar mais que o custo total, em qualquer direção.",
      },
      {
        pergunta: "Straddle com call R$1,10 + put R$0,90 no strike 38. Quais os breakevens?",
        alternativas: [
          "R$37,10 e R$38,90",
          "R$36,00 e R$40,00",
          "R$38,00 e R$40,00",
          "R$35,00 e R$41,00",
        ],
        correta: 1,
        explicacao: "Custo total = R$2,00. Breakevens = 38 ± 2 = R$36 e R$40.",
      },
      {
        pergunta: "Qual o principal inimigo do straddle antes do evento?",
        alternativas: [
          "A regra do 1%",
          "O IV crush e o theta",
          "A liquidez da bolsa",
          "O imposto sobre o prêmio",
        ],
        correta: 1,
        explicacao:
          "Depois do evento a IV cai (crush) e o tempo corrói: o straddle precisa do movimento logo.",
      },
    ],
  },
  {
    slug: "strangle",
    ordem: 14,
    nivel: 3,
    titulo: "Lição 14 — Strangle (movimento maior, custo menor)",
    resumo:
      "CALL OTM + PUT OTM: a mesma aposta de movimento do straddle, mais barata — e exigindo mais.",
    problema: {
      titulo: "O straddle é caro demais",
      texto:
        "Você quer apostar em movimento grande, mas o straddle custa R$2,00 por ação — mais do que a sua regra permite. Existe uma versão mais barata da mesma tese? Sim. Mas nada é de graça.",
      pergunta: "O que o strangle cobra em troca do desconto?",
    },
    conceitos: [
      {
        titulo: "Montagem",
        corpo: `
O strangle é **comprar uma CALL OTM e uma PUT OTM** no mesmo vencimento.

- **Compra** call K40 (acima do preço)
- **Compra** put K36 (abaixo do preço)
- Custo menor que o straddle — por strikes mais longe

## Números (PETR4 a R$38)
- Call K40: R$0,40 · Put K36: R$0,30
- **Custo total**: R$0,70 por ação
- **Breakevens**: R$35,30 e R$40,70
- O ativo precisa andar **mais** do que no straddle para compensar
        `,
      },
      {
        titulo: "A troca que você faz",
        corpo: `
| | Straddle | Strangle |
|---|---|---|
| Custo | Maior | Menor |
| Movimento necessário | Menor | Maior |
| Perda máxima | Prêmio total | Prêmio total |
| Lucro máximo | Ilimitado | Ilimitado |

O strangle não é um straddle 'com defeito': é a mesma hipótese com **exigência maior e preço menor**. Ele lucra quando o movimento é grande de verdade.
        `,
      },
    ],
    comparativo: {
      titulo: "Straddle × Strangle",
      colunas: ["", "Straddle", "Strangle"],
      linhas: [
        { item: "Custo total", valores: ["R$2,00", "R$0,70"] },
        { item: "Movimento necessário", valores: ["R$2,00 (38 ± 2)", "R$2,70 (36 a 40 + custo)"] },
        { item: "Perda máxima", valores: ["R$2,00", "R$0,70"] },
        { item: "Sensibilidade ao tempo", valores: ["Maior (ATM)", "Menor (OTM)"] },
      ],
    },
    cenarios: [
      {
        titulo: "O ativo não anda",
        tom: "perda",
        descricao:
          "O ativo anda menos que R$0,70. As duas pernas OTM perdem para o theta — você perde o prêmio total, que é menor que o do straddle.",
      },
      {
        titulo: "O ativo anda moderado",
        tom: "neutro",
        descricao:
          "O ativo anda R$1,00: a call K40 ainda está OTM e a put K36 perdeu valor. Resultado parcial — o movimento ainda não chegou ao breakeven.",
      },
      {
        titulo: "O ativo anda muito",
        tom: "ganho",
        descricao:
          "O ativo anda R$4,00. Uma das pernas está bem ITM e valoriza mais que o custo total — o strangle ganha parecido com o straddle, pagando menos por isso.",
      },
    ],
    analogia:
      "O mesmo bilhete de loteria com menos números marcados: mais barato, mas a combinação precisa sair mais exata.",
    naPratica: {
      titulo: "Antes de montar o strangle",
      passos: [
        "O movimento que espero passa dos dois breakevens? (Strikes ± custo total)",
        "A IV está baixa? Strangle com IV alta derrete no crush.",
        "As duas pernas têm liquidez?",
        "Se o movimento não vier, encerro quando? Stop por tempo.",
      ],
    },
    missao: {
      titulo: "O balanço da empresa",
      situacao:
        "Balanço em 10 dias. A IV está baixa. Você espera um movimento grande (uns 6%), sem opinião de direção. O straddle custa R$2,00; o strangle (strikes a 6%) custa R$0,70.",
      pergunta: "Qual estrutura escolher?",
      opcoes: [
        {
          texto: "Strangle, pois o movimento esperado (6%) cobre os breakevens com folga",
          tom: "correta",
          feedback:
            "Boa decisão. Com movimento de 6% e breakevens mais estreitos que isso, o strangle expressa a hipótese pelo menor custo.",
        },
        {
          texto: "Straddle, pois é 'mais seguro'",
          tom: "quase",
          feedback:
            "Quase: o straddle precisa de menos movimento, mas custa quase 3× mais. Se a hipótese é 6%, o strangle cobre — o 'seguro' extra é prêmio pago sem necessidade.",
        },
        {
          texto: "Call comprada, pois balanço costuma subir",
          tom: "errada",
          feedback:
            "Você está apostando em direção com evento binário — se o balanço vier ruim, a call derrete. A hipótese era movimento, não direção.",
        },
        {
          texto: "Iron condor, para vender o movimento",
          tom: "errada",
          feedback:
            "Iron condor é hipótese de lateralização — o oposto da sua. Vender o que você espera que aconteça é ficar contra a própria tese.",
        },
      ],
      termosExplicacao: ["strangle", "otm", "breakeven", "movimento", "prêmio", "iv"],
      aindaPratique: "calcular os breakevens de um strangle e comparar com o movimento esperado",
      transferencia: {
        titulo: "O balanço veio forte",
        situacao:
          "O balanço veio bom e o ativo subiu 5%. Seu strangle tem a put K36 valendo quase nada, a call K40 parcialmente ITM e faltam 12 dias.",
        pergunta: "O que a sua hipótese original manda fazer?",
        opcoes: [
          {
            texto: "Encerrar a perna put (mortas) e avaliar a call com stop e alvo",
            tom: "correta",
            feedback:
              "Boa gestão. A hipótese era movimento: ela veio, e a perna que não andou virou custo. Gestão de perna é parte da gestão da posição.",
          },
          {
            texto: "Deixar as duas até o vencimento",
            tom: "quase",
            feedback:
              "Quase: deixar a put morrer é aceitar perda total nela; e a call OTM parcialmente ITM ainda luta contra o theta. Sem alvo/stop definido, vencimento é roleta.",
          },
          {
            texto: "Comprar mais puts para 'equilibrar'",
            tom: "errada",
            feedback:
              "Equilibrar uma perda comprando mais da perna perdedora é média no prejuízo. A tese de movimento já aconteceu.",
          },
          {
            texto: "Rolar o strangle para o próximo vencimento",
            tom: "errada",
            feedback:
              "Rolar sem hipótese nova é pagar prêmio de novo. O movimento veio; encerre o ciclo e registre o que aprendeu.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O que o strangle cobra em troca do custo menor que o straddle?",
        alternativas: [
          "Perda máxima maior",
          "Movimento necessário maior (strikes mais longe + custo)",
          "Lucro máximo limitado",
          "Vencimento mais curto",
        ],
        correta: 1,
        explicacao: "OTM nos dois lados: mais barato, mas o ativo precisa andar mais para lucrar.",
      },
      {
        pergunta: "Strangle call K40 (R$0,40) + put K36 (R$0,30). Qual o breakeven superior?",
        alternativas: ["R$40,00", "R$40,70", "R$41,00", "R$39,30"],
        correta: 1,
        explicacao: "Custo = R$0,70. BE superior = strike da call + custo = 40 + 0,70 = R$40,70.",
      },
      {
        pergunta: "Em qual cenário o strangle é preferível ao straddle?",
        alternativas: [
          "Movimento pequeno esperado",
          "Movimento grande esperado e capital limitado",
          "Hipótese de lateralização",
          "Quando a IV está no pico",
        ],
        correta: 1,
        explicacao:
          "Movimento grande + custo menor: o strangle entrega a mesma tese pagando menos — se o movimento cobrir os breakevens.",
      },
    ],
  },
  {
    slug: "iron-condor",
    ordem: 15,
    nivel: 3,
    titulo: "Lição 15 — Iron Condor (lateralização com risco limitado)",
    resumo:
      "Vender movimento nos dois lados com proteção: a estrutura para 'o mercado vai ficar dentro deste range'.",
    problema: {
      titulo: "O mercado vai ficar parado",
      texto:
        "Você acha que PETR4 vai passar as próximas 4 semanas andando de lado, entre R$37 e R$39. Você poderia simplesmente não operar — ou vender esse range usando o mercado a seu favor.",
      pergunta: "Existe uma estrutura que lucra com a calmaria?",
    },
    conceitos: [
      {
        titulo: "Montagem",
        corpo: `
O iron condor é **vender uma call e uma put OTM, cada uma protegida por uma compra mais OTM**.

- **Vende** call K40 e **compra** call K42 (proteção do lado de cima)
- **Vende** put K36 e **compra** put K34 (proteção do lado de baixo)
- Você recebe crédito e fica com o risco travado na largura

## Números (PETR4 a R$38)
- Crédito recebido: R$0,80 por ação
- Risco máximo: (largura − crédito) = R$1,20 por ação
- Lucro máximo: o crédito, se o ativo ficar entre K36 e K40
        `,
      },
      {
        titulo: "A troca que você faz",
        corpo: `
| | Strangle vendido (sem proteção) | Iron condor |
|---|---|---|
| Risco | Ilimitado (call) | Limitado (largura − crédito) |
| Colateral | Alto | Menor |
| Lucro máximo | O crédito | O crédito |
| Quando | Vendedor experiente | Vendedor que limita o risco |

O iron condor não é "vender volatilidade": é **expressar a hipótese de que o ativo fica dentro do range** — com a conta máxima conhecida antes de enviar.
        `,
      },
    ],
    comparativo: {
      titulo: "Strangle vendido × Iron Condor",
      colunas: ["", "Strangle vendido", "Iron Condor"],
      linhas: [
        { item: "Risco máximo", valores: ["Ilimitado em um lado", "Limitado (largura − crédito)"] },
        { item: "Lucro máximo", valores: ["Crédito", "Crédito"] },
        { item: "Colateral exigido", valores: ["Alto", "Menor"] },
        { item: "Hipótese", valores: ["Range apertado, aguenta risco", "Range + risco travado"] },
      ],
    },
    cenarios: [
      {
        titulo: "O ativo fica no range",
        tom: "ganho",
        descricao:
          "PETR4 passa o mês entre R$36 e R$40. As quatro opções expiram OTM e você embolsa o crédito inteiro — o lucro máximo da estrutura.",
      },
      {
        titulo: "O ativo encosta em um strike",
        tom: "neutro",
        descricao:
          "PETR4 chega a R$40,10. A call vendida começa a valorizar; a proteção K42 segura o lado. Resultado parcial — o crédito vai encolhendo.",
      },
      {
        titulo: "O ativo fura o range",
        tom: "perda",
        descricao:
          "PETR4 dispara para R$45. A call K40 vendida queima; a K42 comprada limita a perda na largura (R$2,00) − crédito recebido. A perda máxima é conhecida desde o início.",
      },
    ],
    analogia:
      "Cobrança de portaria de condomínio: você recebe a taxa (crédito) todo mês e o portão trava os dois lados — se alguém estourar o portão (furar o range), a perda é limitada pelo que a estrutura aguenta.",
    naPratica: {
      titulo: "Antes de montar o iron condor",
      passos: [
        "A hipótese é lateralização? Se espera movimento grande, o condor é o oposto da tese.",
        "O range vendeu (strikes vendidos) cobre onde o ativo 'vive'?",
        "Risco máximo = largura − crédito. Cabe na regra de risco?",
        "Liquidez nas quatro pernas? Perna ilíquida vira prisão.",
      ],
    },
    missao: {
      titulo: "O mês da calmaria",
      situacao:
        "PETR4 oscila entre R$37 e R$39 há 3 semanas. Você acredita que segue nesse range no próximo mês. O crédito de um condor K40/K42 + K36/K34 é R$0,80; a largura é R$2,00.",
      pergunta: "Qual decisão expressa a sua hipótese?",
      opcoes: [
        {
          texto: "Montar o iron condor, com risco máximo conhecido (largura − crédito)",
          tom: "correta",
          feedback:
            "Boa decisão. Hipótese de range + risco travado: você recebe o crédito se o range segurar e sabe a perda máxima antes de enviar.",
        },
        {
          texto: "Comprar straddle, pois o mercado 'pode sair do range'",
          tom: "errada",
          feedback:
            "Isso é apostar contra a sua própria hipótese. Se a tese é lateralização, a estrutura que a expressa vende o range — não compra movimento.",
        },
        {
          texto: "Vender só a call K40 e a put K36 (strangle a descoberto)",
          tom: "quase",
          feedback:
            "Quase: a hipótese é a mesma, mas o risco do lado vendido fica ilimitado. O condor existe para você não precisar aguentar uma fuga sem teto.",
        },
        {
          texto: "Não operar, pois range é 'falta de oportunidade'",
          tom: "quase",
          feedback:
            "Quase: não operar é legítimo. Mas a calmaria é uma hipótese como qualquer outra — e o condor é a estrutura feita para ela.",
        },
      ],
      termosExplicacao: ["condor", "crédito", "largura", "range", "risco", "lateral"],
      aindaPratique: "calcular o risco máximo de um condor (largura − crédito)",
      transferencia: {
        titulo: "O range furou",
        situacao:
          "PETR4 saiu do range e está a R$42,50. Sua call K40 vendida está ITM; a proteção K42 segura a largura. Faltam 10 dias.",
        pergunta: "O que a sua tese original manda fazer?",
        opcoes: [
          {
            texto:
              "Avaliar encerrar o lado ameaçado com a perda controlada — a tese de range morreu",
            tom: "correta",
            feedback:
              "Boa gestão. A hipótese (range) falhou: o que resta é executar a saída com a perda máxima conhecida, sem improviso.",
          },
          {
            texto: "Comprar mais calls K40 para 'empurrar o preço de volta'",
            tom: "errada",
            feedback:
              "Comprar contra a própria estrutura é dobrar o risco para defender uma tese morta.",
          },
          {
            texto: "Rolar as pernas vendidas para strikes mais longe",
            tom: "quase",
            feedback:
              "Quase: rolar é gestão — mas só com hipótese nova. Rolar porque 'a tese vai voltar' é insistir no erro.",
          },
          {
            texto: "Deixar vencer, pois 'ainda pode voltar'",
            tom: "quase",
            feedback:
              "Quase: a proteção segura a perda, mas deixar sem stop é transformar gestão em esperança. Defina o ponto de saída antes.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Qual hipótese o iron condor expressa?",
        alternativas: [
          "Movimento grande para qualquer lado",
          "Lateralização: o ativo fica dentro de um range",
          "Alta forte",
          "Queda forte",
        ],
        correta: 1,
        explicacao:
          "Vende o range dos dois lados: lucra se o ativo ficar entre os strikes vendidos.",
      },
      {
        pergunta: "Condor com crédito de R$0,80 e largura de R$2,00. Qual o risco máximo?",
        alternativas: ["R$0,80", "R$2,00", "R$1,20", "Ilimitado"],
        correta: 2,
        explicacao: "Risco máximo = largura − crédito = 2,00 − 0,80 = R$1,20 por ação.",
      },
      {
        pergunta: "Por que o iron condor protege as pernas vendidas?",
        alternativas: [
          "Para aumentar o crédito",
          "Para limitar o risco no caso de fuga do range",
          "Para evitar imposto",
          "Para reduzir o vencimento",
        ],
        correta: 1,
        explicacao: "A compra mais OTM trava a perda na largura: risco conhecido antes de enviar.",
      },
    ],
  },
  {
    slug: "comparar-estruturas-de-alta",
    ordem: 19,
    nivel: 4,
    titulo: "Lição 19 — Comparar: estruturas para hipótese de alta",
    resumo:
      "CALL comprada, trava de alta e venda coberta não são '3 jeitos de ganhar'. São 3 distribuições de risco e retorno para a mesma hipótese.",
    problema: {
      titulo: "Três respostas para a mesma pergunta",
      texto:
        "Sua hipótese: PETR4 sobe. Agora escolha: CALL comprada, trava de alta ou venda coberta. Cada uma diz 'sim' à alta — e 'não' a algo diferente. Escolher sem comparar é escolher no escuro.",
      pergunta: "O que cada estrutura troca para expressar a sua hipótese?",
    },
    conceitos: [
      {
        titulo: "Hipótese primeiro, estrutura depois",
        corpo: `
A regra central do Zero ao Trade: **estruturas expressam hipóteses** — cada uma tem uma distribuição própria de risco e retorno. Nenhuma é "a melhor para subir": cada uma responde a uma pergunta diferente.

**Perguntas que mudam a escolha:**
- Quanto posso perder se a alta não vier?
- Quanto da alta quero capturar?
- Quanto posso pagar (ou imobilizar) agora?
- O tempo joga contra ou a favor?

A resposta a essas perguntas — não a direção sozinha — escolhe a estrutura.
        `,
      },
      {
        titulo: "As três estruturas lado a lado",
        corpo: `
| | CALL comprada | Trava de alta | Venda coberta |
|---|---|---|---|
| Exige ter ações? | Não | Não | Sim |
| Perda máxima | Prêmio | Débito | A queda das ações − prêmio |
| Lucro máximo | Ilimitado | Limitado (largura) | Limitado (strike + prêmio) |
| Custo | Prêmio cheio | Débito menor | Recebe prêmio |
| Tempo | Contra (theta) | Contra (theta) | A favor (coleta theta) |

**Venda coberta não é "o mesmo" que comprar call barato**: é expressar alta moderada já tendo as ações — o prêmio recebido compensa parte da queda, em troca de desistir do upside acima do strike.
        `,
      },
    ],
    comparativo: {
      titulo: "CALL comprada × Trava de alta × Venda coberta",
      colunas: ["", "CALL comprada", "Trava de alta", "Venda coberta"],
      linhas: [
        {
          item: "Custo de entrada",
          valores: ["Prêmio inteiro", "Débito (prêmio − prêmio)", "Só as ações (recebe prêmio)"],
        },
        { item: "Perda máxima", valores: ["Prêmio", "Débito", "Queda das ações − prêmio"] },
        { item: "Lucro máximo", valores: ["Ilimitado", "Largura − débito", "Strike + prêmio"] },
        { item: "Breakeven", valores: ["Strike + prêmio", "Strike + débito", "Ações − prêmio"] },
        { item: "Sensibilidade ao tempo", valores: ["Perde", "Perde", "Ganha"] },
        { item: "Requisito", valores: ["Nenhum", "Nenhum", "Ter as ações"] },
      ],
    },
    cenarios: [
      {
        titulo: "Alta forte e rápida",
        tom: "ganho",
        descricao:
          "PETR4 dispara 15% em 2 semanas. A CALL comprada ganha mais que tudo (ilimitado). A trava para no strike vendido. A coberta é chamada e entrega as ações no strike.",
      },
      {
        titulo: "Alta lenta e moderada",
        tom: "neutro",
        descricao:
          "PETR4 sobe 3% devagar. A CALL comprada luta contra o theta e pode empatar. A trava captura parte do movimento. A coberta embolsa o prêmio e ainda ganha na ação.",
      },
      {
        titulo: "O ativo cai",
        tom: "perda",
        descricao:
          "PETR4 cai 8%. A CALL vira pó (perde o prêmio). A trava perde só o débito. A coberta perde na ação, mas o prêmio recebido amortece a queda.",
      },
    ],
    analogia:
      "Pedir delivery: pizza (call) é ótima se a fome for grande e imediata; o combo (trava) capa o preço e o tamanho; a marmita (coberta) você já tem a carne em casa e só paga o tempero.",
    naPratica: {
      titulo: "O algoritmo da escolha consciente",
      passos: [
        "Escrevo a hipótese: direção, força, prazo e capital disponível.",
        "Listo as estruturas que expressam essa hipótese.",
        "Comparo: perda máxima, lucro máximo, custo, breakeven, tempo.",
        "Escolho a que cabe nas minhas regras — não a 'que mais ganha'.",
      ],
    },
    missao: {
      titulo: "Capital limitado, alta moderada",
      situacao:
        "Sua hipótese: alta moderada de PETR4 nas próximas semanas. Você não tem ações, o capital é limitado e aceita abrir mão de parte do lucro potencial para reduzir o custo e o risco.",
      pergunta: "Qual estrutura faz mais sentido estudar e montar?",
      opcoes: [
        {
          texto: "Trava de alta (call comprada + call vendida)",
          tom: "correta",
          feedback:
            "Boa decisão. Alta moderada + capital limitado + aceitar lucro menor: a trava reduz o débito e trava a perda — exatamente a troca que a sua hipótese permite.",
        },
        {
          texto: "CALL comprada a seco",
          tom: "quase",
          feedback:
            "Quase: a call expressa a mesma direção, mas paga prêmio cheio por lucro ilimitado — que a sua hipótese de alta 'moderada' não vai usar, e o capital limitado pune.",
        },
        {
          texto: "Venda coberta",
          tom: "quase",
          feedback:
            "Quase: coleta theta e tem risco menor, mas exige ter as ações — que você não tem. Sem as ações, ela não é uma opção.",
        },
        {
          texto: "Qualquer uma, pois todas 'ganham com a alta'",
          tom: "errada",
          feedback:
            "Escolher pela direção sozinha é o erro que este nível existe para eliminar: cada estrutura distribui risco e retorno de um jeito — a direção não decide sozinha.",
        },
      ],
      termosExplicacao: ["trava", "débito", "largura", "breakeven", "risco", "capital"],
      aindaPratique: "comparar custo e perda máxima das três estruturas de alta antes de escolher",
      transferencia: {
        titulo: "A hipótese mudou de força",
        situacao:
          "Você montou uma trava de alta. Uma semana depois, os fundamentos melhoram e a hipótese vira alta forte — e você quer capturar mais.",
        pergunta: "Qual é a decisão mais alinhada ao processo?",
        opcoes: [
          {
            texto:
              "Avaliar se a trava ainda cabe: o upside virou o que importa — talvez a call a seco seja a estrutura da hipótese nova",
            tom: "correta",
            feedback:
              "Boa leitura. Hipótese nova pode pedir estrutura nova: comparar de novo (custo × upside) é o processo — decidir no piloto automático é o erro.",
          },
          {
            texto: "Manter a trava até o fim 'para não perder o que já investiu'",
            tom: "quase",
            feedback:
              "Quase: manter é legítimo se a regra manda, mas 'não perder o investido' é âncora, não critério. Reavalie com os números na mesa.",
          },
          {
            texto: "Somar uma call a seco por cima da trava",
            tom: "quase",
            feedback:
              "Quase: é uma possibilidade real de reexpressar a hipótese — mas precisa passar pela mesma comparação: novo custo, nova perda máxima, novo breakeven.",
          },
          {
            texto: "Vender a trava agora e comprar a call a seco sem comparar",
            tom: "errada",
            feedback:
              "Trocar de estrutura por empolgação é o impulso com roupagem de análise. Compare os números das duas antes de qualquer movimento.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Qual pergunta NÃO decide a escolha entre as estruturas de alta?",
        alternativas: [
          "Quanto posso perder se a alta não vier?",
          "Quanto da alta quero capturar?",
          "Qual estrutura 'vai dar mais certo'?",
          "Quanto posso pagar agora?",
        ],
        correta: 2,
        explicacao:
          "'Dar certo' é resultado, não critério. Critérios são distribuições: custo, perda, lucro, breakeven, tempo.",
      },
      {
        pergunta: "Sem ações na carteira, qual estrutura fica indisponível?",
        alternativas: ["CALL comprada", "Trava de alta", "Venda coberta", "CALL + trava"],
        correta: 2,
        explicacao: "Venda coberta exige ter as ações para vender a call contra elas.",
      },
      {
        pergunta:
          "Hipótese de alta moderada, capital limitado, aceita abrir mão do upside. Qual estrutura expressa melhor?",
        alternativas: ["CALL comprada a seco", "Trava de alta", "Venda coberta", "Iron condor"],
        correta: 1,
        explicacao:
          "A trava troca o upside ilimitado por débito menor e risco travado — alinhada a capital limitado e alta moderada.",
      },
    ],
  },
  {
    slug: "comparar-estruturas-neutras",
    ordem: 20,
    nivel: 4,
    titulo: "Lição 20 — Comparar: estruturas para hipótese neutra",
    resumo:
      "Straddle, strangle e iron condor: três maneiras diferentes de dizer 'o mercado vai se mover — ou não'.",
    problema: {
      titulo: "Neutro não é 'sem opinião'",
      texto:
        "Você acredita que PETR4 vai ficar lateral. 'Neutro' não é ausência de tese: é uma tese de magnitude. Straddle, strangle e condor respondem à MESMA tese de jeitos opostos — e escolher o errado é operar contra si mesmo.",
      pergunta: "O que separa comprar movimento de vender movimento?",
    },
    conceitos: [
      {
        titulo: "Duas famílias para a mesma lateralização",
        corpo: `
A hipótese neutra tem duas versões — e elas são opostas:

**1. Vai andar, não sei pra onde** (compra movimento): *straddle* e *strangle*.
**2. Vai ficar parado dentro de um range** (venda de movimento): *iron condor*.

| | Compra de movimento | Venda de movimento |
|---|---|---|
| Lucro quando | O ativo anda mais que o custo | O ativo fica dentro do range |
| Inimigo | Theta e IV crush | Fuga do range (movimento grande) |
| Perda máxima | Prêmio pago | Largura − crédito |
        `,
      },
      {
        titulo: "As três estruturas lado a lado",
        corpo: `
| | Straddle | Strangle | Iron condor |
|---|---|---|---|
| O que faz | Compra call + put ATM | Compra call + put OTM | Vende call/put OTM protegidas |
| Custo | Alto | Médio | Recebe crédito |
| Movimento necessário | Strike ± custo | Strikes ± custo | Que o ativo FIQUE no range |
| Perda máxima | Prêmio total | Prêmio total | Largura − crédito |
| Lucro máximo | Ilimitado | Ilimitado | O crédito |

A pergunta que separa tudo: **você espera movimento ou calmaria?** Compra movimento ou vende movimento — a partir daí, a escolha entre as duas estruturas de cada família é questão de custo e exigência.
        `,
      },
    ],
    comparativo: {
      titulo: "Straddle × Strangle × Iron Condor",
      colunas: ["", "Straddle", "Strangle", "Iron Condor"],
      linhas: [
        {
          item: "Hipótese",
          valores: [
            "Movimento grande",
            "Movimento grande, custo menor",
            "Range: movimento pequeno",
          ],
        },
        { item: "Custo", valores: ["Alto (ATM)", "Médio (OTM)", "Recebe crédito"] },
        { item: "Perda máxima", valores: ["Prêmio total", "Prêmio total", "Largura − crédito"] },
        { item: "Lucro máximo", valores: ["Ilimitado", "Ilimitado", "Crédito"] },
        {
          item: "Exigência",
          valores: ["Andar > custo", "Andar > strikes + custo", "Ficar dentro do range"],
        },
      ],
    },
    cenarios: [
      {
        titulo: "O ativo fica parado",
        tom: "ganho",
        descricao:
          "PETR4 anda 0,3% no mês. O condor embolsa o crédito (lucro máximo). Straddle e strangle perdem o prêmio para o theta — a compra de movimento errou a magnitude.",
      },
      {
        titulo: "O ativo anda moderado",
        tom: "neutro",
        descricao:
          "PETR4 anda 2,5%. O straddle talvez alcance o breakeven; o strangle ainda não; o condor vê o crédito encolher. Resultado intermediário para todos.",
      },
      {
        titulo: "O ativo anda muito",
        tom: "perda",
        descricao:
          "PETR4 anda 7%. Straddle e strangle lucram forte. O condor furou o range: perde até a largura − crédito — a perda máxima conhecida desde o início.",
      },
    ],
    analogia:
      "Aposta em campeonato: você pode apostar que 'vai ter gol na partida' (compra movimento) ou que 'a partida termina 0x0' (venda de movimento). São a mesma incerteza — com dinheiro apostado em lados opostos.",
    naPratica: {
      titulo: "O algoritmo da escolha consciente",
      passos: [
        "Minha hipótese é movimento OU range? (É aqui que tudo se decide.)",
        "Movimento: straddle (menos exigência) ou strangle (menos custo)?",
        "Range: o condor cobre o range onde o ativo vive?",
        "Em ambos: IV está baixa (compra) ou o crédito compensa o risco (venda)?",
      ],
    },
    missao: {
      titulo: "O gráfico de lado",
      situacao:
        "PETR4 está presa entre R$37 e R$39 há um mês. A IV está baixa. Você quer expressar essa lateralização — e seu capital é limitado.",
      pergunta: "Qual estrutura expressa a hipótese e respeita o capital?",
      opcoes: [
        {
          texto: "Iron condor (vender o range com proteção)",
          tom: "correta",
          feedback:
            "Boa decisão. Hipótese de range + IV baixa não favorece compra de movimento — e o condor recebe crédito por uma tese que você acredita.",
        },
        {
          texto: "Straddle, pois 'o mercado sempre anda'",
          tom: "errada",
          feedback:
            "Você está comprando movimento contra a própria hipótese de lateralização — e com IV baixa e range firme, é a estrutura que mais perde.",
        },
        {
          texto: "Strangle, pois é mais barato que o straddle",
          tom: "quase",
          feedback:
            "Quase: o strangle também compra movimento — a hipótese é o oposto. Barato contra a própria tese continua sendo contra.",
        },
        {
          texto: "Não operar, pois 'lateralização não paga'",
          tom: "quase",
          feedback:
            "Quase: não operar é legítimo. Mas o range firme é exatamente a hipótese do condor — a estrutura existe para ela.",
        },
      ],
      termosExplicacao: ["condor", "range", "crédito", "movimento", "iv", "lateral"],
      aindaPratique:
        "classificar uma hipótese como compra ou venda de movimento antes de escolher a estrutura",
      transferencia: {
        titulo: "O range que se apertou",
        situacao:
          "Você montou um iron condor. Duas semanas depois, um evento marca a agenda e a IV dispara — a calmaria que você esperava virou movimento.",
        pergunta: "O que a sua hipótese original manda fazer?",
        opcoes: [
          {
            texto:
              "Reavaliar a hipótese: se virou movimento, o condor é a estrutura errada — encerrar com a perda controlada",
            tom: "correta",
            feedback:
              "Boa gestão. A hipótese morreu: encerrar o condor (perda limitada conhecida) é honestidade com o processo — não é 'perder', é corrigir a tese.",
          },
          {
            texto: "Manter e torcer para o evento não andar",
            tom: "quase",
            feedback:
              "Quase: manter sem hipótese é esperança. Se o evento tem cara de movimento, a exposição correta é comprar movimento — não segurar a venda.",
          },
          {
            texto: "Rolar o condor para strikes mais longe",
            tom: "quase",
            feedback:
              "Quase: rolar é gestão se a tese de range seguir viva. Mas o evento mudou a IV: o crédito novo compensa o risco novo?",
          },
          {
            texto: "Comprar straddle por cima para 'proteger' o condor",
            tom: "errada",
            feedback:
              "Sobrepor compra e venda de movimento é pagar dois prêmios para ficar neutro — custo puro, sem tese.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Qual pergunta separa straddle/strangle do iron condor?",
        alternativas: [
          "A direção que eu espero",
          "Eu espero movimento grande ou calmaria (range)?",
          "O preço do ativo",
          "O vencimento que escolho",
        ],
        correta: 1,
        explicacao:
          "Compra de movimento (straddle/strangle) vs venda de movimento (condor): a magnitude esperada define a família.",
      },
      {
        pergunta: "Hipótese de range com IV baixa. Qual estrutura é a mais alinhada?",
        alternativas: ["Straddle", "Strangle", "Iron condor", "CALL comprada"],
        correta: 2,
        explicacao:
          "Range + IV baixa = vender o range: o condor recebe crédito por uma calmaria que você acredita.",
      },
      {
        pergunta: "O que o straddle e o strangle têm em comum?",
        alternativas: [
          "Os dois vendem movimento",
          "Os dois compram movimento com perda limitada ao prêmio",
          "Os dois têm lucro máximo limitado",
          "Os dois exigem ter ações",
        ],
        correta: 1,
        explicacao:
          "Ambos compram movimento (lucro ilimitado, perda = prêmio); diferem no custo e no movimento exigido.",
      },
    ],
  },
  {
    slug: "gestao-da-decisao",
    ordem: 21,
    nivel: 5,
    titulo: "Lição 21 — Gestão da decisão: o ciclo completo",
    resumo:
      "Hipótese → estratégias possíveis → comparação → risco → regras → simulação → tese → registro → revisão. O Academy é a primeira etapa do ciclo decisório.",
    problema: {
      titulo: "Saber as estruturas não é saber decidir",
      texto:
        "Você conhece call, put, travas, condor. Ainda assim, decide por impulso: entra sem hipótese, escolhe a estrutura 'da moda', não registra o porquê — e na revisão não sabe o que aconteceu. Conhecer as ferramentas não é o fim: é o vocabulário.",
      pergunta: "O que transforma conhecimento em decisão consciente?",
    },
    conceitos: [
      {
        titulo: "O ciclo da decisão",
        corpo: `
Estratégia é conhecimento; **decisão é aplicação desse conhecimento**. A sequência não é negociável:

**Hipótese → Estratégias possíveis → Comparação → Risco/retorno → Regras pessoais → Simulação → Decisão → Registro → Revisão**

| Etapa | Onde acontece | O que sai dela |
|---|---|---|
| Hipótese | Sua cabeça / o copilot | "Alta moderada, 3 semanas, R$300" |
| Estratégias possíveis | O laboratório de estratégias | CALL, trava, coberta |
| Comparação | As tabelas comparativas | Distribuições de risco/retorno |
| Risco | A regra do 1% | Tamanho da posição |
| Regras | Suas regras pessoais | "Se furar, encerro" |
| Simulação | O simulador | O payoff acontecendo |
| Decisão | O diário | A tese escrita |
| Revisão | A revisão | "A decisão foi boa, não o resultado" |
        `,
      },
      {
        titulo: "Estrutura é linguagem, não receita",
        corpo: `
**Nenhuma estrutura é "para ganhar dinheiro".** Cada estrutura expressa uma hipótese com uma distribuição própria de risco e retorno.

- Ninguém te diz "use trava porque vai subir" — você diz "minha hipótese de alta moderada, com capital limitado, pede risco travado".
- A comparação entre estruturas é sobre **distribuições**, nunca sobre "qual ganha mais".
- Se uma estrutura "não combina com a sua hipótese", o problema é o encaixe — não a estrutura.

Essa é a fronteira entre educação financeira e recomendação. O Zero ao Trade fica do lado da educação.
        `,
      },
    ],
    analogia:
      "Idioma: gramática (as estruturas) não é o mesmo que saber conversar (decidir). Você pode dominar tempos verbais e ainda assim não saber o que dizer na hora certa — o que transforma vocabulário em conversa é o processo de escolher a frase.",
    naPratica: {
      titulo: "O ritual de toda decisão",
      passos: [
        "Escreva a hipótese: direção, força, prazo, capital. Sem isso, não há estrutura.",
        "Liste as estruturas que expressam a hipótese e compare as distribuições.",
        "Aplique a regra de risco (1%) e as suas regras pessoais.",
        "Simule antes: veja o payoff, o theta e a perda máxima acontecendo.",
        "Registre a tese no diário: por que essa estrutura, e não as outras.",
        "Revise depois: a DECISÃO foi boa (processo) ou o resultado é que foi?",
      ],
    },
    missao: {
      titulo: "Ordenando o processo",
      situacao:
        "Você quer operar a alta da PETR4. Misturou as etapas do ciclo: já escolheu a trava de alta ANTES de escrever a hipótese, e pensa em pular a simulação 'porque é rápido'.",
      pergunta: "Qual é a ordem correta do processo?",
      opcoes: [
        {
          texto:
            "Hipótese → estruturas possíveis → comparação → risco → regras → simulação → decisão",
          tom: "correta",
          feedback:
            "Boa decisão. Hipótese primeiro; a estrutura aparece como resposta à comparação — nunca como ponto de partida.",
        },
        {
          texto: "Estrutura → hipótese → simulação → comparação",
          tom: "errada",
          feedback:
            "Começar pela estrutura é decidir pelo instrumento, não pela hipótese — o caminho inverso do processo. É como escolher a chave antes de saber a porta.",
        },
        {
          texto: "Hipótese → estrutura → decisão, sem simulação",
          tom: "quase",
          feedback:
            "Quase: a sequência começa certa, mas pular a simulação é abrir mão de ver o risco acontecendo antes do dinheiro.",
        },
        {
          texto: "Decisão → hipótese (escrever depois 'para confirmar')",
          tom: "errada",
          feedback:
            "Escrever a hipótese depois da decisão é racionalização: o processo existe para decidir antes de agir, não para justificar depois.",
        },
      ],
      termosExplicacao: ["hipótese", "comparação", "simulação", "regras", "processo", "ciclo"],
      aindaPratique: "rodar o ciclo completo para uma operação hipotética no simulador + diário",
      transferencia: {
        titulo: "O convite para pular etapas",
        situacao:
          "Um amigo mostra uma operação que 'deu muito certo' com iron condor e te convida a copiar a estrutura na próxima semana.",
        pergunta: "O que o processo manda fazer?",
        opcoes: [
          {
            texto:
              "Começar pela sua hipótese: o que EU espero do mercado? Só então comparar estruturas",
            tom: "correta",
            feedback:
              "Boa decisão. A estrutura do amigo nasceu da hipótese DELE. A sua só existe se a sua hipótese pedir.",
          },
          {
            texto: "Copiar a estrutura, já que funcionou",
            tom: "errada",
            feedback:
              "Copiar resultado sem hipótese é o padrão clássico de quem perde: o resultado do outro não diz nada sobre a sua distribuição de risco.",
          },
          {
            texto: "Copiar, mas com menos capital",
            tom: "quase",
            feedback:
              "Quase: reduzir tamanho não corrige a ausência de hipótese — é o mesmo erro com menos volume.",
          },
          {
            texto: "Pedir ao copilot 'essa estrutura é boa?'",
            tom: "quase",
            feedback:
              "Quase: o copilot pode explicar a estrutura — mas 'é boa' não é a pergunta. A pergunta é: a sua hipótese pede essa estrutura?",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Qual a primeira etapa do ciclo de decisão?",
        alternativas: [
          "Escolher a estrutura",
          "Escrever a hipótese",
          "Abrir o simulador",
          "Registrar a tese",
        ],
        correta: 1,
        explicacao:
          "Hipótese primeiro: direção, força, prazo e capital. A estrutura vem como resposta.",
      },
      {
        pergunta: "Estratégia, no Zero ao Trade, é:",
        alternativas: [
          "Uma receita para lucrar",
          "Uma linguagem para expressar uma hipótese, com distribuição própria de risco e retorno",
          "Uma recomendação do sistema",
          "Um atalho para não pensar",
        ],
        correta: 1,
        explicacao:
          "Estruturas expressam hipóteses. O sistema nunca transforma estratégia em recomendação pessoal.",
      },
      {
        pergunta: "O que a revisão avalia, na visão do Zero ao Trade?",
        alternativas: [
          "Se a operação deu lucro",
          "Se a decisão seguiu o processo — independente do resultado",
          "Se a estrutura era 'da moda'",
          "Se o mercado previu certo",
        ],
        correta: 1,
        explicacao: "Resultado é sorte com processo; processo é o que você controla e revisa.",
      },
    ],
  },
  {
    slug: "tributacao-basica",
    ordem: 22,
    nivel: "pratica",
    titulo: "Lição 22 — Tributação de opções (básico)",
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
      titulo: "Quanto é do governo",
      situacao:
        "No mês você lucrou R$3.000 em opções comuns (swing). A corretora reteve R$8 de IRRF. Você não fez day trade.",
      pergunta: "Quanto de IR incide sobre esse lucro (fora o IRRF retido)?",
      opcoes: [
        {
          texto: "R$450",
          tom: "correta",
          feedback:
            "Boa decisão. 15% × R$3.000 = R$450. Opções não têm isenção dos R$20 mil — todo lucro é tributado.",
        },
        {
          texto: "R$600",
          tom: "errada",
          feedback: "R$600 seria 20% — alíquota de day trade, não de operação comum.",
        },
        {
          texto: "R$150",
          tom: "errada",
          feedback: "R$150 seria 5%: não existe essa alíquota para opções.",
        },
        {
          texto: "R$0, porque lucrou menos de R$20 mil",
          tom: "quase",
          feedback:
            "Quase: a isenção de R$20 mil vale só para ação à vista. Opções pagam a partir do primeiro real de lucro.",
        },
      ],
      termosExplicacao: ["15%", "450", "swing"],
      aindaPratique: "diferenciar a alíquota de swing (15%) da de day trade (20%)",
      transferencia: {
        titulo: "Day trade tem outra conta",
        situacao:
          "No mês você lucrou R$2.000 fazendo day trade com opções. A corretora reteve o IRRF sobre os ganhos.",
        pergunta: "Quanto de IR você apura (fora o IRRF retido)?",
        opcoes: [
          {
            texto: "R$400 (20% sobre R$2.000)",
            tom: "correta",
            feedback:
              "Boa decisão. Day trade paga 20% sobre o lucro — a alíquota é diferente da operação comum (15%).",
          },
          {
            texto: "R$300 (15% sobre R$2.000)",
            tom: "quase",
            feedback: "Quase: 15% é a alíquota de swing. Day trade é 20% — a maior do mercado.",
          },
          {
            texto: "R$0, pois day trade é isento",
            tom: "errada",
            feedback: "Day trade não tem isenção — e paga a maior alíquota do mercado.",
          },
          {
            texto: "R$500 (25% sobre R$2.000)",
            tom: "errada",
            feedback: "Não existe alíquota de 25% para day trade. É 20%.",
          },
        ],
      },
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
    ordem: 23,
    nivel: "pratica",
    titulo: "Lição 23 — DARF, compensação de prejuízo e controle mensal",
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
      titulo: "Compensação em cadeia",
      situacao:
        "Tudo em swing: janeiro −R$1.500, fevereiro +R$400, março +R$2.000. Você não pagou DARF em janeiro nem fevereiro.",
      pergunta: "Quanto de DARF você paga em março?",
      opcoes: [
        {
          texto: "R$135",
          tom: "correta",
          feedback:
            "Boa decisão. O prejuízo de janeiro (−R$1.500) foi abatido por fevereiro (+R$400), sobrando R$1.100. 15% × (2.000 − 1.100) = R$135.",
        },
        {
          texto: "R$300",
          tom: "errada",
          feedback:
            "R$300 = 15% de R$2.000 cheio: você esqueceu de compensar o prejuízo acumulado de R$1.100.",
        },
        {
          texto: "R$135 + juros de janeiro",
          tom: "quase",
          feedback:
            "Quase: o DARF de março é R$135 — e janeiro não tinha DARF a pagar (prejuízo), então não há juros.",
        },
        {
          texto: "R$0, pois o prejuízo cobriu tudo",
          tom: "errada",
          feedback:
            "O prejuízo de R$1.500 abateu R$400 (fev) e R$1.100 (mar): sobra R$900 tributável → R$135.",
        },
      ],
      termosExplicacao: ["135", "compensa", "1.100", "prejuízo", "prejuizo"],
      aindaPratique: "encadear prejuízos e lucros mês a mês até zerar o acumulado",
      transferencia: {
        titulo: "Compensação parcial",
        situacao:
          "Tudo em swing: janeiro −R$800, fevereiro +R$1.500. Você não pagou DARF em janeiro.",
        pergunta: "Qual DARF você paga em fevereiro?",
        opcoes: [
          {
            texto: "R$105 (15% sobre R$700 de lucro líquido)",
            tom: "correta",
            feedback:
              "Boa decisão. A compensação é automática e obrigatória: lucro líquido = 1.500 − 800 = R$700 → 15% = R$105.",
          },
          {
            texto: "R$0, pois o prejuízo cobriu o lucro",
            tom: "quase",
            feedback:
              "Quase: o prejuízo (−R$800) foi menor que o lucro (+R$1.500): sobrou R$700 tributável.",
          },
          {
            texto: "R$225 (15% sobre R$1.500)",
            tom: "errada",
            feedback: "Você ignorou a compensação do prejuízo de janeiro.",
          },
          {
            texto: "R$135 (15% sobre R$900)",
            tom: "errada",
            feedback: "A conta não fecha: 1.500 − 800 = R$700 → R$105. Revise o saldo acumulado.",
          },
        ],
      },
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
  {
    slug: "o-que-e-um-futuro",
    ordem: 24,
    nivel: 1,
    dominio: "futuros",
    titulo: "Lição 1 — O que é um contrato futuro",
    resumo:
      "Um compromisso padronizado de comprar ou vender a um preço combinado, com ajuste todo dia.",
    problema: {
      titulo: "O cafezal e o preço de amanhã",
      texto:
        "Dona Rosa vende café e teme que o preço caia antes da colheita. O comprador teme que suba. Os dois querem travar o preço hoje — mas nenhum quer carregar a incerteza do outro. No mercado de futuros, os dois assinam um contrato padronizado: preço combinado hoje, liquidação no futuro.",
      pergunta: "O que exatamente você está assumindo quando compra um futuro?",
    },
    conceitos: [
      {
        titulo: "O conceito",
        corpo: `
Um **contrato futuro** é um compromisso padronizado de comprar (ou vender) um ativo por um preço combinado, com liquidação em uma data futura.

- **Compromisso, não direito**: ao contrário da opção, você tem a obrigação de cumprir o contrato.
- **Padronizado**: tamanho, vencimento e valor são fixos — no mini índice e no mini dólar, um contrato sempre vale a mesma coisa.
- **Ajuste diário**: a diferença do dia é liquidada no fim do pregão, como se o contrato fosse renegociado todo dia.
        `,
      },
      {
        titulo: "MINI índice e MINI dólar",
        corpo: `
Na B3, os contratos mais negociados são o **WIN** (mini índice) e o **WDO** (mini dólar). "Mini" significa tamanho pequeno: o contrato cheio vale 5x mais.

- **WIN** = contrato futuro sobre o índice Bovespa, valor de **R$ 0,20 por ponto**.
- **WDO** = contrato futuro sobre a taxa de câmbio dólar/real, valor de **R$ 10 por ponto**.
        `,
      },
    ],
    analogia:
      "Pense num contrato de futuro como um combinado com o hortifruti: você acerta hoje o preço da caixa de maçãs para receber daqui a um mês. A diferença dos futuros é que, todo fim de dia, o mercado olha o combinado e liquida a diferença — como se renegociasse tudo diariamente.",
    naPratica: {
      titulo: "Antes de operar qualquer contrato futuro",
      passos: [
        "Qual é o tamanho do contrato (quantos pontos x valor do ponto)?",
        "Qual é o vencimento do contrato que você está olhando?",
        "Quanto custa a margem para segurá-lo?",
        "Quanto você perde se o mercado andar 100 pontos contra você?",
      ],
    },
    missao: {
      titulo: "O compromisso que você assumiu",
      situacao:
        "Você comprou 1 contrato WIN (R$ 0,20 por ponto) porque acredita que o índice vai subir. O pregão fecha com o índice 100 pontos abaixo da sua entrada.",
      pergunta: "O que aconteceu de verdade com você ao final do dia?",
      opcoes: [
        {
          texto: "Nada — só no vencimento se sabe o resultado",
          tom: "errada",
          feedback:
            "No futuro, o resultado é liquidado todo dia no ajuste diário. Você já perdeu 100 x R$ 0,20 = R$ 20 na conta, no fim do pregão.",
        },
        {
          texto: "O ajuste diário debita R$ 20 — e isso pode acontecer todos os dias",
          tom: "correta",
          feedback:
            "Boa decisão. O ajuste diário marca a posição a mercado todo fim de pregão: 100 pontos x R$ 0,20 = R$ 20 de débito. O resultado acumula dia a dia, não só no vencimento.",
        },
        {
          texto: "Você tem o direito de desistir pagando uma multa",
          tom: "errada",
          feedback:
            "Futuro é compromisso, não direito. Sair da posição significa fechar o contrato (vender o que comprou), realizando o resultado do momento.",
        },
        {
          texto: "R$ 20 de lucro, porque o preço estava abaixo",
          tom: "errada",
          feedback:
            "Você comprou esperando alta; o índice caiu 100 pontos. O ajuste debita R$ 20, não credita.",
        },
      ],
      termosExplicacao: ["ajuste", "0,20", "20", "R$ 20", "pontos"],
      aindaPratique: "somar ajustes de vários dias até o fechamento da posição",
      transferencia: {
        titulo: "O mesmo dia, no WDO",
        situacao: "Você comprou 1 contrato WDO (R$ 10 por ponto) e o dólar subiu 30 pontos no dia.",
        pergunta: "Qual é o resultado do ajuste diário?",
        opcoes: [
          {
            texto: "R$ 300 de crédito (30 pontos x R$ 10)",
            tom: "correta",
            feedback:
              "Boa decisão. O WDO vale R$ 10 por ponto: 30 pontos x R$ 10 = R$ 300 creditados no ajuste. A cada ponto do dólar, R$ 10.",
          },
          {
            texto: "R$ 6 (30 x R$ 0,20)",
            tom: "errada",
            feedback:
              "R$ 0,20 é o valor do ponto do WIN (índice). No WDO (dólar), cada ponto vale R$ 10.",
          },
          {
            texto: "Nada até o vencimento",
            tom: "errada",
            feedback:
              "No futuro, o resultado é liquidado diariamente no ajuste, não apenas no vencimento.",
          },
          {
            texto: "R$ 300 de débito, porque subiu contra você",
            tom: "errada",
            feedback:
              "Você comprou esperando alta e o dólar subiu: o movimento foi a seu favor — crédito, não débito.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "A diferença central entre uma opção e um futuro é:",
        alternativas: [
          "Futuro é compromisso; opção é direito",
          "Opção é mais arriscada que futuro",
          "Futuro só existe na B3",
          "Não há diferença",
        ],
        correta: 0,
        explicacao:
          "No futuro você tem a obrigação de cumprir o contrato. Na opção, você compra um direito e pode simplesmente não exercer.",
      },
      {
        pergunta: "O ajuste diário faz com que:",
        alternativas: [
          "O resultado do dia seja liquidado no fim do pregão",
          "O contrato seja cancelado todo dia",
          "Só o vencimento importe",
          "A margem seja devolvida todo dia",
        ],
        correta: 0,
        explicacao:
          "A posição é marcada a mercado no fim de cada sessão e a diferença é creditada ou debitada da conta.",
      },
      {
        pergunta: "Quantos reais valem 100 pontos de WIN?",
        alternativas: ["R$ 20", "R$ 1.000", "R$ 0,20", "R$ 100"],
        correta: 0,
        explicacao: "WIN vale R$ 0,20 por ponto: 100 x R$ 0,20 = R$ 20.",
      },
    ],
    exercicios: [
      {
        titulo: "Traduza o contrato",
        enunciado:
          "Um contrato WIN vale R$ 0,20 por ponto. Quantos reais você ganha ou perde se o índice andar 50 pontos? E 1.000 pontos?",
        gabarito: "50 x 0,20 = R$ 10. 1.000 x 0,20 = R$ 200 por contrato.",
      },
      {
        titulo: "Repita no WDO",
        enunciado:
          "Um contrato WDO vale R$ 10 por ponto. Quantos reais você perde se o dólar andar 25 pontos contra você?",
        gabarito: "25 x 10 = R$ 250 por contrato.",
      },
    ],
  },
  {
    slug: "valor-do-ponto-e-tick",
    ordem: 25,
    nivel: 1,
    dominio: "futuros",
    titulo: "Lição 2 — Valor do ponto e tick",
    resumo: "Cada ponto do índice e do dólar tem um preço em reais — e o mercado anda em ticks.",
    problema: {
      titulo: "O preço do milímetro",
      texto:
        "Bruno olha a tela do WIN e vê o número 130.000. Em 5 minutos, virou 130.005. Ele sabe que 'subiu', mas não sabe: quanto isso valeu em reais? Cada movimento mínimo tem um tamanho — e um preço. Sem traduzir pontos em reais, o trader não sabe nem o tamanho da própria posição.",
      pergunta: "Quanto vale o menor movimento do contrato que você opera?",
    },
    conceitos: [
      {
        titulo: "Ponto e tick",
        corpo: `
**Ponto** é a unidade do preço do ativo (o índice em pontos, o dólar em centavos). **Tick** é o menor movimento que o mercado pode andar.

- **WIN**: ponto vale **R$ 0,20**. O mercado anda em ticks de **5 pontos** = **R$ 1,00**.
- **WDO**: ponto vale **R$ 10**. O mercado anda em ticks de **0,5 ponto** = **R$ 5,00**.

Um tick é a menor "moeda" do seu contrato: todo preço de entrada e de stop é múltiplo de tick.
        `,
      },
      {
        titulo: "Tradução rápida",
        corpo: `
| Contrato | 1 ponto | 1 tick | 10 pontos | 100 pontos |
|---|---|---|---|---|
| WIN | R$ 0,20 | R$ 1,00 | R$ 2,00 | R$ 20,00 |
| WDO | R$ 10 | R$ 5,00 | R$ 100 | R$ 1.000 |

O hábito do dia: sempre transformar pontos em reais antes de decidir. "O índice caiu 300 pontos" só ganha significado quando você vira "R$ 60 por contrato".
        `,
      },
    ],
    analogia:
      "Ponto e tick são como o pedágio de uma estrada: cada quilômetro (ponto) tem um valor por contrato. O tick é o troco: no WIN, o pedágio mínimo cobrado é de R$ 1,00 (5 pontos x R$ 0,20); no WDO, R$ 5,00 (0,5 ponto x R$ 10).",
    naPratica: {
      titulo: "Antes de operar qualquer contrato",
      passos: [
        "Quanto vale 1 ponto do meu contrato? E 1 tick?",
        "Quantos reais andam 10 pontos? E 100 pontos?",
        "Meu stop em pontos vira quantos reais por contrato?",
        "O preço que quero entrar é um múltiplo de tick válido?",
      ],
    },
    missao: {
      titulo: "O índice andou — e agora?",
      situacao:
        "O WIN estava em 130.000 e fechou o dia em 129.800. Você está comprado em 1 contrato desde a abertura.",
      pergunta: "Qual foi o impacto na sua conta?",
      opcoes: [
        {
          texto: "-R$ 40 (200 pontos x R$ 0,20)",
          tom: "correta",
          feedback:
            "Boa decisão. 200 pontos x R$ 0,20 = R$ 40 de prejuízo no ajuste diário. Pontos traduzidos em reais antes de qualquer outra conversa.",
        },
        {
          texto: "-R$ 40.000, porque o índice é 130.000",
          tom: "errada",
          feedback:
            "O índice em si não é o seu contrato: o WIN vale R$ 0,20 por ponto, não R$ 1 por ponto.",
        },
        {
          texto: "-R$ 200 (200 pontos x R$ 1,00)",
          tom: "errada",
          feedback: "R$ 1,00 é o valor de um tick (5 pontos) do WIN, não de um ponto.",
        },
        {
          texto: "-R$ 2.000 (200 pontos x R$ 10)",
          tom: "errada",
          feedback: "R$ 10 por ponto é o valor do WDO (dólar), não do WIN (índice).",
        },
      ],
      termosExplicacao: ["0,20", "40", "200 pontos", "R$ 0,20"],
      aindaPratique: "traduzir pontos de WDO e de WIN até virar automático",
      transferencia: {
        titulo: "O mesmo raciocínio no WDO",
        situacao: "O dólar andou 80 pontos contra você no dia. Você está comprado em 1 WDO.",
        pergunta: "Quanto isso custou no ajuste diário?",
        opcoes: [
          {
            texto: "-R$ 800 (80 pontos x R$ 10)",
            tom: "correta",
            feedback: "Boa decisão. WDO: R$ 10 por ponto -> 80 x R$ 10 = R$ 800 de débito.",
          },
          {
            texto: "-R$ 16 (80 x R$ 0,20)",
            tom: "errada",
            feedback: "R$ 0,20 é do WIN. No WDO, cada ponto vale R$ 10.",
          },
          {
            texto: "-R$ 400 (80 x R$ 5,00)",
            tom: "errada",
            feedback: "R$ 5,00 é o valor do tick do WDO (0,5 ponto), não do ponto inteiro.",
          },
          {
            texto: "-R$ 80, um real por ponto",
            tom: "errada",
            feedback: "Nenhum contrato mini vale R$ 1 por ponto: WIN R$ 0,20, WDO R$ 10.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Quantos reais vale um tick de WIN?",
        alternativas: ["R$ 1,00", "R$ 0,20", "R$ 5,00", "R$ 0,50"],
        correta: 0,
        explicacao: "Tick de WIN = 5 pontos x R$ 0,20 = R$ 1,00.",
      },
      {
        pergunta: "Quantos reais vale um tick de WDO?",
        alternativas: ["R$ 5,00", "R$ 10,00", "R$ 0,50", "R$ 1,00"],
        correta: 0,
        explicacao: "Tick de WDO = 0,5 ponto x R$ 10 = R$ 5,00.",
      },
      {
        pergunta: "O WIN andou 60 pontos. Em 2 contratos, isso vale:",
        alternativas: ["R$ 24 (60 x 0,20 x 2)", "R$ 12 (60 x 0,20)", "R$ 120 (60 x 2)", "R$ 60"],
        correta: 0,
        explicacao: "60 pontos x R$ 0,20 = R$ 12 por contrato; em 2 contratos, R$ 24.",
      },
    ],
    exercicios: [
      {
        titulo: "Tabela de tradução",
        enunciado:
          "Complete: (a) 250 pontos de WIN = R$ __; (b) 75 pontos de WDO = R$ __; (c) 40 ticks de WIN = R$ __; (d) 30 ticks de WDO = R$ __.",
        gabarito:
          "(a) 250 x 0,20 = R$ 50. (b) 75 x 10 = R$ 750. (c) 40 x 1,00 = R$ 40. (d) 30 x 5,00 = R$ 150.",
      },
    ],
  },
  {
    slug: "margem-e-alavancagem",
    ordem: 26,
    nivel: 1,
    dominio: "futuros",
    titulo: "Lição 3 — Margem e alavancagem",
    resumo:
      "Uma garantia pequena controla um contrato grande — a alavancagem amplia ganhos e perdas.",
    problema: {
      titulo: "O depósito do apartamento",
      texto:
        "O corretor cobra uma garantia de ~R$ 100 para você segurar um contrato WIN que vale ~R$ 26.000 de exposição. Parece ótimo: R$ 100 para controlar R$ 26 mil. Mas a pergunta que ninguém faz no primeiro dia: se o índice andar 1% contra você, quanto sai da sua conta?",
      pergunta: "O que a margem cobre — e o que ela NÃO cobre?",
    },
    conceitos: [
      {
        titulo: "Margem: a garantia, não o preço",
        corpo: `
**Margem mínima** é a garantia exigida para abrir a posição — não é o custo do contrato e não é o seu risco máximo.

- **WIN**: margem em torno de **R$ 100** por contrato.
- **WDO**: margem em torno de **R$ 150** por contrato.
- A margem cobre o **ajuste diário**: se você não tem saldo para o débito do dia, a posição pode ser liquidada.

O risco do dia não é a margem: é **quantos pontos o mercado pode andar contra você**.
        `,
      },
      {
        titulo: "Alavancagem real",
        corpo: `
A exposição de um contrato WIN é o valor do índice x R$ 0,20: com o índice em ~130.000 pontos, cerca de **R$ 26.000** por contrato. Com ~R$ 100 de margem, a alavancagem é de **~260 vezes**.

Traduzindo: **1% de movimento do índice** (~1.300 pontos) vale **R$ 260** na sua conta — mais que o dobro da margem. A alavancagem não faz o mercado andar menos; faz cada ponto valer mais na sua conta.
        `,
      },
    ],
    analogia:
      "Margem é como o depósito de segurança de um aluguel: você entrega um valor pequeno, mas responde pelo imóvel inteiro. Se o muro cair, o conserto sai do seu bolso, não do depósito.",
    naPratica: {
      titulo: "Antes de abrir posição",
      passos: [
        "Qual é a margem do contrato que vou operar?",
        "Qual é a exposição total (pontos x valor do ponto)?",
        "Se o mercado andar 1% contra, quanto isso custa?",
        "Meu capital aguenta o ajuste diário de vários dias seguidos contra?",
      ],
    },
    missao: {
      titulo: "O 1% que ninguém vê",
      situacao:
        "O índice está em 130.000. Você abre 2 contratos WIN com ~R$ 200 de margem total (R$ 100 cada). O mercado cai 1% no dia e o ajuste é debitado.",
      pergunta: "Quanto você perdeu nesse movimento?",
      opcoes: [
        {
          texto: "R$ 520 (1.300 pontos x R$ 0,20 x 2 contratos)",
          tom: "correta",
          feedback:
            "Boa decisão. 1% de 130.000 = 1.300 pontos x R$ 0,20 = R$ 260 por contrato; em 2 contratos, R$ 520. O ajuste diário cobra isso — e a margem de R$ 200 não cobre nem metade.",
        },
        {
          texto: "R$ 200, no máximo — a margem protege",
          tom: "errada",
          feedback:
            "A margem não é um limite de perda: é uma garantia. A perda é o movimento x valor do ponto x contratos.",
        },
        {
          texto: "R$ 2.600 (1% de R$ 260.000)",
          tom: "errada",
          feedback:
            "A exposição é 1.300 pontos x R$ 0,20 = R$ 260 por contrato, não R$ 1 por ponto.",
        },
        {
          texto: "Nada — a margem é recomposta no dia seguinte",
          tom: "errada",
          feedback:
            "O ajuste é liquidado no fim do pregão: o débito sai da conta. Sem saldo, a corretora encerra a posição.",
        },
      ],
      termosExplicacao: ["520", "1.300", "ajuste", "0,20"],
      aindaPratique: "calcular a perda de 1% nos dois contratos, com o índice em outros níveis",
      transferencia: {
        titulo: "O mesmo movimento, no WDO",
        situacao:
          "O dólar está em 5,4000. Você abre 1 WDO com ~R$ 150 de margem. O dólar sobe 1% (~54 pontos) contra você.",
        pergunta: "Quanto o ajuste debita?",
        opcoes: [
          {
            texto: "R$ 540 (54 pontos x R$ 10)",
            tom: "correta",
            feedback:
              "Boa decisão. 1% de 5,4000 = 54 pontos x R$ 10 = R$ 540 de débito — mais de três vezes a margem de R$ 150.",
          },
          {
            texto: "R$ 54 (54 x R$ 1)",
            tom: "errada",
            feedback: "O WDO vale R$ 10 por ponto, não R$ 1.",
          },
          {
            texto: "R$ 150 — limitado pela margem",
            tom: "errada",
            feedback:
              "A margem não limita a perda; o stop limita. Sem stop, o ajuste segue debitando.",
          },
          {
            texto: "R$ 10,80 (54 x R$ 0,20)",
            tom: "errada",
            feedback: "R$ 0,20 por ponto é o WIN; o WDO vale R$ 10 por ponto.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "A margem mínima de um contrato futuro é:",
        alternativas: [
          "Uma garantia para o ajuste diário, não um limite de perda",
          "O preço do contrato",
          "O valor máximo que você pode perder",
          "Uma taxa paga ao governo",
        ],
        correta: 0,
        explicacao:
          "A margem cobre os ajustes diários. Quem limita sua perda é o stop, definido por você.",
      },
      {
        pergunta: "Com o índice em 130.000, 1 contrato WIN expõe você a:",
        alternativas: ["~R$ 26.000 (130.000 x R$ 0,20)", "~R$ 130.000", "~R$ 100", "~R$ 260"],
        correta: 0,
        explicacao: "Exposição = valor do índice x valor do ponto = 130.000 x R$ 0,20 = R$ 26.000.",
      },
      {
        pergunta: "Se você não tem saldo para pagar o ajuste diário:",
        alternativas: [
          "A corretora pode liquidar sua posição",
          "O prejuízo fica para o vencimento",
          "A margem absorve tudo",
          "O contrato é cancelado sem custo",
        ],
        correta: 0,
        explicacao:
          "O ajuste é devido no fim do dia. Sem saldo, a posição é encerrada — geralmente no pior momento.",
      },
    ],
    exercicios: [
      {
        titulo: "O custo de 1%",
        enunciado:
          "Índice em 130.000, WIN (R$ 0,20/pt). Quanto custa uma queda de 1% em 1 contrato? E em 5? Se a sua regra é perder no máximo R$ 200 por dia, quantos contratos cabem nessa queda de 1%?",
        gabarito:
          "1% = 1.300 pts -> R$ 260/contrato; 5 contratos = R$ 1.300. Com limite de R$ 200, nem 1 contrato cabe nesse cenário: o stop precisa vir antes do 1%.",
      },
    ],
  },
  {
    slug: "pregao-e-sessao",
    ordem: 27,
    nivel: 2,
    dominio: "futuros",
    titulo: "Lição 4 — Pregão e sessão",
    resumo: "WIN e WDO vivem entre 9h e 18h — e a sessão muda de personalidade ao longo do dia.",
    problema: {
      titulo: "O cinema que abre às 9h e fecha às 18h",
      texto:
        "Camila entrou no WIN às 22h porque o mercado americano caía. Não havia tela — nem book, nem preço. Day trade de WIN/WDO só existe dentro do pregão. E dentro do pregão, os momentos não são iguais: a abertura tem volume, o meio do dia dorme e o fechamento decide.",
      pergunta: "O que muda dentro do horário de negociação — e fora dele?",
    },
    conceitos: [
      {
        titulo: "O horário é o palco",
        corpo: `
O pregão de **WIN e WDO vai das 9h às 18h** (horário de Brasília), em dias úteis.

- Fora desse intervalo **não há preço de referência** para day trade: o contrato que "pariu" depois das 18h é o vencimento do dia seguinte — outro instrumento.
- **9h–10h30**: abertura. Maior volume e maior volatilidade. É onde os movimentos grandes nascem.
- **11h–15h**: meio do dia. Menor liquidez, spreads abertos, falsos rompimentos.
- **15h–18h**: fechamento. Reação às notícias americanas e ajuste final.

Day trade é um esporte com horário marcado: a posição precisa ser encerrada dentro da sessão.
        `,
      },
      {
        titulo: "Sessão e vencimento",
        corpo: `
**Sessão** é o dia de negociação (9h–18h). **Vencimento** é o contrato que vence em determinada data (WIN com vencimento em cada mês, WDO idem).

- No **vencimento**, o contrato é liquidado e o próximo mês vira o principal.
- Operar na semana do vencimento muda o comportamento do contrato (convergência, liquidez migrando).

Sempre confira **qual vencimento** você está olhando antes de entrar.
        `,
      },
    ],
    analogia:
      "O pregão é como um cinema com sessão única: o WIN abre às 9h, fecha às 18h e não tem matinê. Quem perde o horário não assiste ao filme — e quem assiste precisa sair antes do fim da sessão (zerar a posição).",
    naPratica: {
      titulo: "Antes de operar qualquer dia",
      passos: [
        "Estou dentro do pregão (9h–18h)?",
        "Qual vencimento está no meu preço?",
        "Estou na abertura, no meio do dia ou no fechamento?",
        "Quanto tempo de sessão ainda resta para a minha tese acontecer?",
      ],
    },
    missao: {
      titulo: "O horário que decide",
      situacao:
        "São 14h30, o índice está lateral. Você vê um rompimento pequeno e entra comprado em WIN. Às 17h50, o rompimento não se confirmou e você está −R$ 30 no dia.",
      pergunta: "O que é coerente fazer às 17h50?",
      opcoes: [
        {
          texto: "Encerrar a posição — day trade zera antes das 18h",
          tom: "correta",
          feedback:
            "Boa decisão. A tese não se confirmou e a sessão está acabando: segurar até depois das 18h vira outra operação (overnight), sem a sua permissão.",
        },
        {
          texto: "Segurar até o vencimento do contrato",
          tom: "errada",
          feedback:
            "Segurar para o outro dia transforma o day trade em swing sem aviso — e sem o seu plano.",
        },
        {
          texto: "Dobrar a posição para recuperar antes das 18h",
          tom: "errada",
          feedback:
            "Recuperar prejuízo aumentando tamanho na última meia hora é a receita do estouro de conta.",
        },
        {
          texto: "Deixar a posição aberta, o ajuste cuida",
          tom: "errada",
          feedback:
            "O ajuste não decide por você: a posição continua com risco durante a noite e no dia seguinte.",
        },
      ],
      termosExplicacao: ["18h", "zerar", "encerrar", "sessão", "fechar"],
      aindaPratique: "respeitar o horário de fechamento mesmo com prejuízo pequeno",
      transferencia: {
        titulo: "A abertura como palco",
        situacao:
          "São 9h20 e o WIN abre com um gap de alta de 200 pontos, mas o volume parece baixo na primeira meia hora.",
        pergunta: "O que essa leitura sugere?",
        opcoes: [
          {
            texto: "Desconfiar: abertura com volume baixo costuma reverter",
            tom: "correta",
            feedback:
              "Boa decisão. Abertura sem volume sustenta pouco: movimentos de abertura precisam de liquidez para não serem varridos.",
          },
          {
            texto: "Entrar na direção do gap imediatamente",
            tom: "errada",
            feedback:
              "Gap não é ordem de compra: sem volume, o preço costuma retornar ao fechamento anterior.",
          },
          {
            texto: "Ignorar o volume — preço é preço",
            tom: "errada",
            feedback:
              "Volume é o que sustenta o preço. Movimento sem volume é rumor, não tendência.",
          },
          {
            texto: "Comprar 10 contratos porque o dia abre com notícia",
            tom: "errada",
            feedback:
              "Notícia abre a tela, não autoriza tamanho: o dimensionamento continua mandando.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O pregão de WIN e WDO acontece:",
        alternativas: [
          "Das 9h às 18h, em dias úteis",
          "24 horas por dia",
          "Só no vencimento",
          "Das 10h às 16h",
        ],
        correta: 0,
        explicacao: "WIN e WDO negociam das 9h às 18h (horário de Brasília), em dias úteis.",
      },
      {
        pergunta: "Uma posição de day trade aberta às 17h45 precisa ser:",
        alternativas: [
          "Encerrada até as 18h",
          "Rolada para o próximo vencimento",
          "Garantida com margem dobrada",
          "Mantida até virar lucro",
        ],
        correta: 0,
        explicacao:
          "Day trade é intra-sessão: a posição zera dentro do horário. Manter aberta vira outra operação.",
      },
      {
        pergunta: "O momento com maior volume e volatilidade costuma ser:",
        alternativas: [
          "A abertura (9h–10h30)",
          "O meio do dia (12h)",
          "O intervalo do almoço",
          "As 18h em ponto",
        ],
        correta: 0,
        explicacao: "A abertura concentra volume e define o tom do dia.",
      },
      {
        pergunta: "Qual vencimento você deve conferir antes de operar?",
        alternativas: [
          "O do contrato que está na tela",
          "O do mês seguinte, sempre",
          "O do ano",
          "Nenhum — vencimento não importa",
        ],
        correta: 0,
        explicacao:
          "Perto do vencimento, o contrato converge e a liquidez migra — o contrato da tela pode não ser o que você pensa.",
      },
    ],
    exercicios: [
      {
        titulo: "Mapa da sessão",
        enunciado:
          "Descreva em uma frase o que você espera de (a) 9h–10h30, (b) 11h–15h e (c) 15h–18h no WIN. Depois marque em qual janela a sua estratégia de day trade tem melhor liquidez.",
        gabarito:
          "Exemplo: (a) volume alto, movimentos definindo o dia; (b) liquidez baixa, falsos rompimentos; (c) reação às notícias dos EUA. A janela escolhida deve ser a de maior liquidez para o seu setup.",
      },
    ],
  },
  {
    slug: "stop-e-dimensionamento",
    ordem: 28,
    nivel: 2,
    dominio: "futuros",
    titulo: "Lição 5 — Stop e dimensionamento",
    resumo:
      "Contratos = risco ÷ (stop × valor do ponto): o tamanho da posição nasce do prejuízo que você aceita.",
    problema: {
      titulo: "O desfibrilador desligado",
      texto:
        "Diego entrou comprado em WIN com 5 contratos porque 'o lucro seria bom'. O mercado andou 300 pontos contra. 5 × 300 × R$ 0,20 = R$ 300 de prejuízo — o dobro do que ele aceitava perder. O stop existia na tela, mas estava a 600 pontos, para 'não ser pego'. O desfibrilador estava desligado.",
      pergunta: "Como definir stop e quantidade ANTES de entrar?",
    },
    conceitos: [
      {
        titulo: "A fórmula mecânica",
        corpo: `
O dimensionamento de futuros é uma equação, não um palpite:

**contratos = risco em R$ ÷ (stop em pontos × valor do ponto)**

Com R$ 200 de risco, stop de 200 pontos em WIN (R$ 0,20/pt):
- Contratos = 200 ÷ (200 × 0,20) = 200 ÷ 40 = **5 contratos**.

Se o stop precisa ser maior (400 pts), o número de contratos cai: 200 ÷ 80 = 2,5 → **2 contratos** (piso de 1).
        `,
      },
      {
        titulo: "O stop é decisão, não acidente",
        corpo: `
O stop é o ponto onde **a sua hipótese estaria errada** — não um número confortável.

- Stop curto demais: morre no ruído.
- Stop longo demais: a conta paga.
- **Mover o stop para longe depois da entrada** não é gestão: é eliminar a decisão. Se o stop está onde você não aceita perder, o tamanho é que muda — não o stop.

No simulador de futuros, contratos = risco ÷ (stop × valor do ponto), e o risco real é sempre conferido antes de salvar.
        `,
      },
    ],
    analogia:
      "O stop é o desfibrilador: a gente liga antes da emergência, não durante. No futuro, sem stop você não tem perda máxima — você tem uma margem que pode ser consumida e uma posição que a corretora pode liquidar no pior momento.",
    naPratica: {
      titulo: "Antes de entrar",
      passos: [
        "Quanto em R$ posso perder nesta operação (regra do 1%)?",
        "Onde o mercado provaria que estou errado (stop em pontos)?",
        "Contratos = risco ÷ (stop × valor do ponto)",
        "O risco real confere com o risco que aceitei?",
      ],
    },
    missao: {
      titulo: "O tamanho que nasce do risco",
      situacao:
        "Seu patrimônio é R$ 20.000 e sua regra é arriscar no máximo 1% por operação (R$ 200). Você quer operar WDO (R$ 10/pt) com stop de 50 pontos.",
      pergunta: "Quantos contratos cabem?",
      opcoes: [
        {
          texto: "0,4 → 0 contratos: o piso de 1 contrato já estoura o risco",
          tom: "errada",
          feedback:
            "Quase! 200 ÷ (50 × 10) = 0,4. Como o piso é 1 contrato, o mínimo (1 × 50 × 10 = R$ 500) excede o risco aceito: a conclusão coerente é não operar ou diminuir o stop.",
        },
        {
          texto: "1 contrato, pois é o mínimo possível — ciente de que estoura a regra",
          tom: "correta",
          feedback:
            "Boa decisão — com o aviso de que 1 contrato (R$ 500 de risco) estoura a regra dos R$ 200: ou o stop encolhe, ou a operação não existe. Dimensionar é também saber dizer não.",
        },
        {
          texto: "2 contratos, para compensar o risco",
          tom: "errada",
          feedback: "2 contratos = R$ 1.000 de risco com stop de 50 pts: cinco vezes o seu limite.",
        },
        {
          texto: "5 contratos — o lucro seria melhor",
          tom: "errada",
          feedback: "Tamanho nunca nasce do lucro possível. Nasce do prejuízo que você aceita.",
        },
      ],
      termosExplicacao: ["1", "piso", "50", "500", "R$ 200", "risco"],
      aindaPratique: "calcular contratos para os quatro stops dos presets do simulador",
      transferencia: {
        titulo: "Diminuindo o stop",
        situacao:
          "Mesmo capital (R$ 200 de risco máximo). Você reduz o stop do WDO para 20 pontos.",
        pergunta: "Quantos contratos agora?",
        opcoes: [
          {
            texto: "1 contrato: 200 ÷ (20 × 10) = 1 → risco real R$ 200",
            tom: "correta",
            feedback:
              "Boa decisão. 20 × 10 = R$ 200 por contrato = exatamente o limite. Piso respeitado e risco real conferido.",
          },
          {
            texto: "10 contratos: 200 ÷ 20 = 10",
            tom: "errada",
            feedback:
              "Faltou multiplicar o stop pelo valor do ponto (R$ 10): 20 pontos × R$ 10 = R$ 200 por contrato.",
          },
          {
            texto: "1 contrato, mas com stop de 50 movido depois",
            tom: "errada",
            feedback:
              "Mover o stop para longe depois de entrar elimina a decisão e o dimensionamento.",
          },
          {
            texto: "2 contratos, porque o stop é menor",
            tom: "errada",
            feedback: "2 × 20 × 10 = R$ 400 de risco: o dobro do limite.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "A fórmula de dimensionamento de futuros é:",
        alternativas: [
          "contratos = risco ÷ (stop × valor do ponto)",
          "contratos = stop ÷ risco",
          "contratos = valor do ponto ÷ stop",
          "contratos = risco × stop",
        ],
        correta: 0,
        explicacao: "O tamanho nasce do prejuízo aceito dividido pelo custo do stop por contrato.",
      },
      {
        pergunta: "Risco de R$ 300, stop de 300 pontos em WIN (R$ 0,20/pt):",
        alternativas: ["5 contratos", "1 contrato", "15 contratos", "3 contratos"],
        correta: 0,
        explicacao: "300 ÷ (300 × 0,20) = 300 ÷ 60 = 5 contratos.",
      },
      {
        pergunta: "O stop deve ficar onde:",
        alternativas: [
          "A sua hipótese estaria errada",
          "Você aguenta ver o prejuízo",
          "O gráfico parece bonito",
          "O lucro seria dobrado",
        ],
        correta: 0,
        explicacao:
          "O stop marca a invalidação da tese. O tamanho se ajusta ao stop, nunca o contrário.",
      },
      {
        pergunta: "A fórmula retorna 0,4 contrato. A decisão coerente é:",
        alternativas: [
          "Não operar, ou encolher o stop até caber",
          "Arredondar para 1 contrato sempre",
          "Arredondar para cima e ajustar depois",
          "Aumentar o risco para caber",
        ],
        correta: 0,
        explicacao:
          "O piso é 1 contrato: se o mínimo estoura o risco aceito, a operação não existe.",
      },
    ],
    exercicios: [
      {
        titulo: "Quatro cenários",
        enunciado:
          "Calcule os contratos: (a) R$ 150, stop 100 pts, WIN; (b) R$ 400, stop 80 pts, WDO; (c) R$ 90, stop 300 pts, WIN; (d) R$ 1.000, stop 25 pts, WDO. Indique quando o resultado pede 'não operar'.",
        gabarito:
          "(a) 150÷20 = 7. (b) 400÷800 = 0,5 → não opera. (c) 90÷60 = 1 (piso). (d) 1.000÷250 = 4.",
      },
      {
        titulo: "No simulador",
        enunciado:
          "Monte no simulador de futuros: risco R$ 200, stop 300 pts, WIN. Confira os contratos e o risco real. Depois dobre o stop e veja os contratos caírem.",
        gabarito:
          "300 pts × 0,20 = 60 → 200÷60 = 3 contratos; risco real R$ 180. Com stop 600: 1 contrato, R$ 120.",
      },
    ],
  },
  {
    slug: "day-trade-vs-swing",
    ordem: 29,
    nivel: 2,
    dominio: "futuros",
    titulo: "Lição 6 — Day trade vs swing",
    resumo:
      "Abrir e fechar na mesma sessão ou dormir com a posição: regras, riscos e impostos diferentes.",
    problema: {
      titulo: "O mesmo contrato, dois regimes",
      texto:
        "Eduardo operou o mesmo WIN de duas formas no mês: algumas operações zeradas no mesmo dia, outras mantidas de um dia para o outro. Na hora do imposto, ele descobriu que as duas modalidades não se misturam: uma paga 20%, a outra 15%, e o prejuízo de uma não compensa o lucro da outra.",
      pergunta: "Qual a diferença real entre day trade e swing no futuro?",
    },
    conceitos: [
      {
        titulo: "A definição que muda tudo",
        corpo: `
**Day trade** = abrir e encerrar a posição **no mesmo dia**, com o mesmo contrato (mesmo vencimento), na mesma instituição.

**Swing** = manter a posição aberta de um dia para o outro (ou mais).

No futuro, o swing convive com o **ajuste diário**: mesmo dormindo com a posição, seu resultado vai sendo liquidado todo fim de pregão.
        `,
      },
      {
        titulo: "Consequências práticas",
        corpo: `
| | Day trade | Swing |
|---|---|---|
| Alíquota | **20%** | **15%** |
| Compensação | day trade com day trade | swing com swing |
| Isenção de R$ 20 mil/mês | **não existe** | vigora |
| Ajuste diário | consolida o resultado do dia | também consolida, diariamente |

A modalidade é uma **decisão antes de entrar** — não uma descoberta depois de sair.
        `,
      },
    ],
    analogia:
      "Day trade é filme de cinema com sessão única: você entra, assiste e sai na mesma sessão. Swing é maratona de série: a história continua amanhã — e, nos futuros, a 'assinatura' (ajuste diário) é cobrada todos os dias, mesmo nos episódios que você não assistiu.",
    naPratica: {
      titulo: "Antes de entrar",
      passos: [
        "Esta operação é day trade ou swing?",
        "Eu consigo zerar antes das 18h se a tese falhar?",
        "A alíquota de 20% (day) ou 15% (swing) está no meu plano?",
        "Meu prejuízo de day trade vai compensar apenas lucro de day trade?",
      ],
    },
    missao: {
      titulo: "A modalidade que você escolhe",
      situacao:
        "Você comprou 2 WIN às 10h com intenção de day trade. São 17h50 e a tese não aconteceu: a posição está −R$ 80. Você resolve 'segurar para amanhã' para ver se recupera.",
      pergunta: "O que mudou ao segurar a posição?",
      opcoes: [
        {
          texto: "A operação virou swing: outra alíquota, outra compensação, outro risco",
          tom: "correta",
          feedback:
            "Boa decisão. Manter aberta após as 18h reclassifica a operação: swing (15%), ajuste diário continuando e a perda potencial deixando de ser limitada pelo dia.",
        },
        {
          texto: "Nada mudou — continua sendo a mesma operação",
          tom: "errada",
          feedback:
            "Mudou tudo: modalidade, alíquota, compensação e o risco de abrir o dia seguinte já devendo.",
        },
        {
          texto: "Vira day trade com ajuste dobrado",
          tom: "errada",
          feedback: "Ajuste não dobra; a modalidade é que muda de day trade para swing.",
        },
        {
          texto: "A corretora encerra automaticamente às 18h",
          tom: "errada",
          feedback:
            "O mercado fecha, mas sua posição segue aberta para o dia seguinte (a menos que sua corretora tenha regra própria de encerramento).",
        },
      ],
      termosExplicacao: ["swing", "modalidade", "20%", "15%", "ajuste"],
      aindaPratique: "definir a modalidade no diário antes de registrar a operação",
      transferencia: {
        titulo: "A compensação estanque",
        situacao:
          "No mês, você teve −R$ 300 em operações de day trade e +R$ 500 em operações de swing.",
        pergunta: "O que a Receita permite?",
        opcoes: [
          {
            texto: "Apurar separadamente: day trade compensa só day trade, swing só swing",
            tom: "correta",
            feedback:
              "Boa decisão. As modalidades são estanques: o prejuízo de day trade não abate o lucro de swing nem o contrário.",
          },
          {
            texto: "Compensar tudo junto: −300 + 500 = +200",
            tom: "errada",
            feedback: "A compensação cruzada entre modalidades não existe.",
          },
          {
            texto: "O prejuízo de day trade pode abater o lucro de swing",
            tom: "errada",
            feedback: "Só day trade compensa day trade; só swing compensa swing.",
          },
          {
            texto: "Nenhum prejuízo pode ser compensado",
            tom: "errada",
            feedback: "Prejuízos compensam lucros da MESMA modalidade.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Uma operação é day trade quando:",
        alternativas: [
          "É aberta e encerrada no mesmo dia",
          "Dura menos de uma hora",
          "É feita antes das 10h",
          "Termina no vencimento",
        ],
        correta: 0,
        explicacao: "Mesma sessão, mesma instituição: abriu e fechou no mesmo dia.",
      },
      {
        pergunta: "A alíquota do lucro de day trade em futuros é:",
        alternativas: ["20%", "15%", "27,5%", "Isenta até R$ 20 mil"],
        correta: 0,
        explicacao: "Day trade paga 20%; a isenção de R$ 20 mil não existe nessa modalidade.",
      },
      {
        pergunta: "Prejuízo de swing compensa lucro de day trade?",
        alternativas: [
          "Não — modalidades separadas",
          "Sim, sempre",
          "Só no mesmo mês",
          "Só com autorização",
        ],
        correta: 0,
        explicacao: "A compensação é estanque: swing com swing, day trade com day trade.",
      },
      {
        pergunta: "No swing de futuros, o ajuste diário:",
        alternativas: [
          "Segue liquidando o resultado todo fim de pregão",
          "Só ocorre no vencimento",
          "É opcional",
          "Vira isenção fiscal",
        ],
        correta: 0,
        explicacao:
          "O ajuste diário consolida o resultado todos os dias, mesmo com a posição aberta.",
      },
    ],
    exercicios: [
      {
        titulo: "Classifique",
        enunciado:
          "Classifique como day trade ou swing: (a) comprou 3 WDO às 9h30, vendeu às 10h15; (b) comprou 1 WIN às 16h, vendeu no dia seguinte às 11h; (c) comprou 2 WIN às 11h, zerou às 17h50.",
        gabarito:
          "(a) day trade. (b) swing (virou). (c) day trade — desde que tenha zerado de fato no mesmo dia.",
      },
    ],
  },
  {
    slug: "slippage-e-execucao",
    ordem: 30,
    nivel: 3,
    dominio: "futuros",
    titulo: "Lição 7 — Slippage e execução",
    resumo: "Entre o preço que você vê e o preço que executa existe o spread — e ele custa.",
    problema: {
      titulo: "O preço que nunca existiu",
      texto:
        "Flávia viu o WIN a 130.000 e mandou uma ordem a mercado. Executou a 130.005. 'Perdi 1 tick', ela pensou. O que ela ainda não sabe: na saída, o stop também vai executar 1 tick pior. O custo invisível das duas pontas é o spread — e o prejuízo teórico da simulação nunca bate com o real enquanto ele não estiver no plano.",
      pergunta: "Quanto o spread e o slippage custam em cada operação?",
    },
    conceitos: [
      {
        titulo: "Spread: o preço do outro lado",
        corpo: `
**Spread** é a distância entre a melhor oferta de compra e de venda. No WIN, costuma ser 1 tick (5 pontos = R$ 1,00); no WDO, 1 tick (0,5 ponto = R$ 5,00).

- Ordem **a mercado**: executa no melhor preço disponível — você paga o spread (compra no ask, vende no bid).
- Ordem **limitada**: executa no preço que você quer — ou não executa.

**Slippage** é a diferença entre o preço desejado e o executado: no stop, o mercado pode estar 'furado' e você sai pior que o limite.
        `,
      },
      {
        titulo: "O stop também paga",
        corpo: `
Um stop de venda executado a mercado paga o spread de saída — e, em movimento rápido, slippage extra.

Operação de WIN com spread de 1 tick: **custo de 2 ticks por volta** (1 na entrada, 1 na saída). Em reais, 2 × R$ 1,00 × contratos.

Um 'lucro teórico' de 5 ticks vira 3 ticks reais. A simulação sem custos mente sobre o seu edge.
        `,
      },
    ],
    analogia:
      "O spread é a comissão invisível do pedágio: você paga para entrar na estrada e paga para sair. Mesmo quando o mercado não se moveu, a volta completa já custou os dois pedágios.",
    naPratica: {
      titulo: "Antes de enviar a ordem",
      passos: [
        "Qual é o spread atual do contrato?",
        "Vou entrar a mercado (pago spread) ou com limite?",
        "Meu stop tolera o slippage da saída?",
        "O resultado esperado cobre os 2 ticks de custo por volta?",
      ],
    },
    missao: {
      titulo: "A volta que já custa",
      situacao:
        "O spread do WIN está em 1 tick (R$ 1,00). Você decide entrar e sair pelo stop no mesmo dia, sempre a mercado, com 3 contratos.",
      pergunta: "Quanto custam só as duas passagens pelo spread?",
      opcoes: [
        {
          texto: "R$ 6 (2 ticks × R$ 1,00 × 3 contratos)",
          tom: "correta",
          feedback:
            "Boa decisão. Entrada + saída = 2 ticks por contrato × R$ 1,00 × 3 = R$ 6 que a sua estratégia precisa superar antes de lucrar.",
        },
        {
          texto: "R$ 3 (1 tick × 3 contratos)",
          tom: "errada",
          feedback: "Uma volta completa paga o spread duas vezes: na entrada e na saída.",
        },
        {
          texto: "R$ 6 × 5 (cada tick vale 5 pontos)",
          tom: "errada",
          feedback: "No WIN, o tick vale R$ 1,00 — não R$ 5,00. R$ 5 é o tick do WDO.",
        },
        {
          texto: "Nada — o spread é do vendedor",
          tom: "errada",
          feedback:
            "Quem compra paga o ask; quem vende recebe o bid. O spread é custo seu nas duas pontas.",
        },
      ],
      termosExplicacao: ["spread", "2 ticks", "entrada", "saída", "R$ 6"],
      aindaPratique: "conferir o spread em momentos de baixa liquidez (meio do dia)",
      transferencia: {
        titulo: "O stop furado",
        situacao:
          "Uma notícia derruba o WIN 100 pontos em segundos. Seu stop de venda a 130.000 executou a 129.990.",
        pergunta: "O que aconteceu?",
        opcoes: [
          {
            texto: "Slippage: a execução saiu pior que o limite por causa do movimento",
            tom: "correta",
            feedback:
              "Boa decisão. Em movimento rápido, o book 'fura' e o stop executa pior que o preço limite. Isso não é defeito do stop: é a realidade do mercado.",
          },
          {
            texto: "Seu stop foi cancelado pela corretora",
            tom: "errada",
            feedback:
              "O stop executou — só que com slippage. Nenhuma corretora cancela stop por movimento.",
          },
          {
            texto: "O ajuste diário corrigiu o preço de volta",
            tom: "errada",
            feedback: "O ajuste não devolve slippage: ele consolida o resultado real da execução.",
          },
          {
            texto: "A ordem era limitada e virou mercado",
            tom: "errada",
            feedback:
              "O cenário descreve um stop comum (mercado): executou pior, sem mudar de tipo.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O spread é:",
        alternativas: [
          "A distância entre a melhor oferta de compra e de venda",
          "A taxa da corretora",
          "O imposto da operação",
          "A margem exigida",
        ],
        correta: 0,
        explicacao: "Spread é a distância entre bid e ask — o custo de atravessar o book.",
      },
      {
        pergunta: "Uma ordem a mercado:",
        alternativas: [
          "Executa no melhor preço disponível, pagando o spread",
          "Garante sempre o preço desejado",
          "Só executa no tick exato",
          "É mais barata que a limitada",
        ],
        correta: 0,
        explicacao:
          "A mercado compra no ask e vende no bid: você paga o spread para ter execução imediata.",
      },
      {
        pergunta: "Slippage é:",
        alternativas: [
          "A diferença entre o preço desejado e o executado",
          "Uma garantia da corretora",
          "O lucro de um tick",
          "O horário da execução",
        ],
        correta: 0,
        explicacao: "Slippage é o preço que o mercado te dá quando o book está em movimento.",
      },
      {
        pergunta: "Com spread de 1 tick no WIN e 2 contratos, a volta completa custa:",
        alternativas: ["R$ 4", "R$ 2", "R$ 8", "R$ 1"],
        correta: 0,
        explicacao: "2 ticks (entrada + saída) × R$ 1,00 × 2 contratos = R$ 4.",
      },
    ],
    exercicios: [
      {
        titulo: "O custo escondido",
        enunciado:
          "Seu setup no WIN lucra 10 ticks em média, mas paga 2 ticks de custo por volta. Qual é o lucro real médio por operação em reais, com 1 contrato? E com 5?",
        gabarito: "10 − 2 = 8 ticks × R$ 1,00 = R$ 8 por contrato. Com 5: R$ 40.",
      },
    ],
  },
  {
    slug: "ajuste-diario",
    ordem: 31,
    nivel: 3,
    dominio: "futuros",
    titulo: "Lição 8 — Ajuste diário",
    resumo: "Todo fim de pregão o mercado liquida a diferença — sua posição vale o que o dia fez.",
    problema: {
      titulo: "A conta de luz de todo dia",
      texto:
        "Gustavo comprou 2 WIN e 'esqueceu' da posição aberta. No dia seguinte, descobriu que o ajuste da noite tinha debitado R$ 160 da conta. Ele achava que o resultado só existiria no vencimento. No futuro, o medidor é lido todos os dias.",
      pergunta: "Como o ajuste diário consolida o seu resultado?",
    },
    conceitos: [
      {
        titulo: "Marcação a mercado diária",
        corpo: `
O **ajuste diário** é a liquidação financeira da variação do contrato entre um pregão e o seguinte.

- Ao fim de cada sessão, a posição é **marcada a mercado**: o ganho/perda do dia é creditado ou debitado na conta.
- O resultado total da posição = **soma dos ajustes diários** até o encerramento.
- A **margem** garante que o débito do dia seja pagável; sem saldo, a posição pode ser liquidada.

No day trade, você 'paga' o ajuste ao encerrar: o resultado do dia já está consolidado.
        `,
      },
      {
        titulo: "O que isso muda na sua decisão",
        corpo: `
- **Sem surpresa no vencimento**: quando o contrato vence, não existe 'resultado acumulado revelado' — ele já foi liquidado dia a dia.
- **Fluxo de caixa**: operar futuro é conviver com débitos/créditos diários na conta.
- **Psicologia**: uma posição no futuro 'cobra' todo dia — o que força a revisão diária da tese.

O ajuste não é taxa: é a mecânica de liquidação do contrato.
        `,
      },
    ],
    analogia:
      "O ajuste diário é a conta de luz com leitura todo fim do dia: o medidor (o preço do contrato) é lido às 18h e a diferença é cobrada ou devolvida na hora. Não existe 'deixar para pagar no fim do mês'.",
    naPratica: {
      titulo: "Com posição aberta (ou pensando em abrir)",
      passos: [
        "Se o pregão fechar contra mim hoje, quanto é debitado?",
        "Tenho saldo para o ajuste de vários dias seguidos contra?",
        "Minha regra exige zerar antes do fim da sessão?",
        "O diário registra o resultado consolidado do ajuste?",
      ],
    },
    missao: {
      titulo: "A noite que cobra",
      situacao:
        "Você comprou 3 WDO a 5,4000 e o dia fecha com o dólar a 5,4050. Cada ponto do WDO vale R$ 10.",
      pergunta: "O que o ajuste diário faz na sua conta?",
      opcoes: [
        {
          texto: "Credita R$ 1.500 (50 pontos × R$ 10 × 3 contratos)",
          tom: "correta",
          feedback:
            "Boa decisão. 50 pontos × R$ 10 = R$ 500 por contrato; × 3 = R$ 1.500 creditados no fechamento.",
        },
        {
          texto: "Credita R$ 150 (50 × R$ 3)",
          tom: "errada",
          feedback:
            "O valor do ponto do WDO é R$ 10 — e o total ainda multiplica pelos 3 contratos.",
        },
        {
          texto: "Nada — o resultado só existe no vencimento",
          tom: "errada",
          feedback: "No futuro, o resultado é liquidado todo dia pelo ajuste.",
        },
        {
          texto: "Debita R$ 1.500, porque o dólar subiu",
          tom: "errada",
          feedback:
            "Você comprou esperando alta e o dólar subiu: o movimento é a seu favor — crédito.",
        },
      ],
      termosExplicacao: ["1.500", "crédito", "ajuste", "50 pontos", "R$ 10"],
      aindaPratique: "acompanhar o saldo após o fechamento de uma posição real",
      transferencia: {
        titulo: "Dois dias seguidos",
        situacao:
          "1 contrato WIN comprado a 130.000. Dia 1: fecha a 129.900. Dia 2: fecha a 130.100.",
        pergunta: "Qual é o resultado acumulado dos dois ajustes?",
        opcoes: [
          {
            texto: "+R$ 20 acumulados (soma dos dois ajustes: −20 + 40)",
            tom: "correta",
            feedback:
              "Boa decisão. Dia 1 = −100 pts × 0,20 = −R$ 20; dia 2 = +200 pts × 0,20 = +R$ 40. Acumulado = +R$ 20.",
          },
          {
            texto: "+R$ 40, porque o último dia foi lucro",
            tom: "errada",
            feedback:
              "O dia 1 já foi liquidado (R$ 20 negativos). O total considera os dois ajustes.",
          },
          {
            texto: "−R$ 20, porque o ajuste nunca credita",
            tom: "errada",
            feedback: "O ajuste credita quando o movimento é a seu favor.",
          },
          {
            texto: "R$ 0, porque voltou perto da entrada",
            tom: "errada",
            feedback: "A posição terminou acima da entrada: acumulado de +R$ 20.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O ajuste diário é:",
        alternativas: [
          "A liquidação diária da variação do contrato",
          "Uma taxa da corretora",
          "Um imposto retido",
          "Uma garantia opcional",
        ],
        correta: 0,
        explicacao: "Ao fim do pregão, a diferença do dia é creditada ou debitada.",
      },
      {
        pergunta: "O resultado total de uma posição em futuros é:",
        alternativas: [
          "A soma dos ajustes diários",
          "O valor do vencimento menos a entrada",
          "O valor da margem",
          "A diferença entre os spreads",
        ],
        correta: 0,
        explicacao: "Cada dia é liquidado separadamente; o total é o somatório dos ajustes.",
      },
      {
        pergunta: "Se a conta não tem saldo para o ajuste:",
        alternativas: [
          "A posição pode ser liquidada",
          "O débito é adiado",
          "A margem cobre para sempre",
          "O contrato é cancelado sem custo",
        ],
        correta: 0,
        explicacao: "O débito é devido no fechamento; sem saldo, a corretora encerra a posição.",
      },
    ],
    exercicios: [
      {
        titulo: "Soma de ajustes",
        enunciado:
          "2 WIN comprados a 130.000. Fechamentos: 130.100, 129.950, 130.000. Calcule os três ajustes e o total.",
        gabarito:
          "D1: +100×0,20×2 = +R$ 40. D2: −150×0,20×2 = −R$ 60. D3: +50×0,20×2 = +R$ 20. Total: R$ 0 (voltou à entrada).",
      },
    ],
  },
  {
    slug: "armadilha-da-alavancagem",
    ordem: 32,
    nivel: 3,
    dominio: "futuros",
    titulo: "Lição 9 — A armadilha da alavancagem",
    resumo: "A margem mínima parece barata — o risco real da posição é o que ela pode perder.",
    problema: {
      titulo: "A margem que esconde a exposição",
      texto:
        "Larissa viu que o WIN 'só' exige cerca de R$ 100 de margem por contrato. Comprou 20 contratos com R$ 2.000 na conta — sem perceber que cada WIN a 130.000 expõe R$ 26.000. O mercado andou 100 pontos contra ela e a conta inteira virou pó. A margem não é o seu risco: é só a garantia.",
      pergunta: "Quanto risco uma posição realmente carrega?",
    },
    conceitos: [
      {
        titulo: "Exposição, não margem",
        corpo: `
Com o WIN a 130.000, cada contrato expõe **R$ 26.000** (130.000 × R$ 0,20) de ativo. Com a margem de R$ 100, a alavancagem real é de ~260x.

- **Margem** = garantia exigida para manter a posição.
- **Exposição** = valor do que você controla.
- **Risco** = quanto o ativo pode andar contra você (não é nem margem nem exposição).

Com a **regra do 1%**, o risco é calculado antes: 1% da conta por posição, transformado em pontos e contratos.
        `,
      },
      {
        titulo: "O limite diário que salva",
        corpo: `
O futuro tem um teto de perda por dia: quando o mercado derruba um contrato **acima do limite diário**, o pregão é suspenso.

- No WIN, o **limite diário** (10% do preço) gira em torno de 13.000 pontos: com 1 contrato, são cerca de R$ 2.600 de oscilação máxima por dia.
- Se 20 contratos dessem 260× de alavancagem, o limite diário sozinho destruiria R$ 52.000 — muito além de qualquer conta.

A alavancagem multiplica os pontos em direção ao limite: o risco real é a rota, não o pedágio.
        `,
      },
    ],
    analogia:
      "A margem é o aluguel de um carro de corrida. O valor da fiança (R$ 100) não tem nada a ver com o que acontece se você bater o carro (R$ 26.000 em exposição). Quem aluga 20 carros sem capital para a batida não tem 20 estratégias: tem um acidente.",
    naPratica: {
      titulo: "O cálculo antes de entrar",
      passos: [
        "Qual é 1% da minha conta? (ex.: conta R$ 10.000 → R$ 100)",
        "Quantos pontos de stop comportam esse valor? (ex.: R$ 100 ÷ R$ 1,00/pt = 100 pontos de WIN)",
        "Quantos contratos? (ex.: 2 WIN com stop de 50 pontos)",
        "A posição inteira cabe no meu limite diário de perda?",
      ],
    },
    missao: {
      titulo: "Contando exposição",
      situacao:
        "WDO a 5,4000 (R$ 10 por ponto). Você quer comprar 5 contratos, achando barato porque a margem total é baixa.",
      pergunta: "Qual é a exposição total da posição?",
      opcoes: [
        {
          texto: "R$ 270.000 (5.400 pontos × R$ 10 × 5)",
          tom: "correta",
          feedback:
            "Boa decisão. Cada WDO a 5,4000 = R$ 54.000; com 5 contratos, R$ 270.000 de exposição — o número que importa para o risco.",
        },
        {
          texto: "A margem somada dos 5 contratos",
          tom: "errada",
          feedback: "A margem é só a garantia — o risco vem da exposição.",
        },
        {
          texto: "R$ 54.000 (o valor de 1 contrato)",
          tom: "errada",
          feedback: "A conta considerou só um contrato; a posição tem 5.",
        },
        {
          texto: "R$ 50 (5 × R$ 10)",
          tom: "errada",
          feedback: "O ponto do WDO vale R$ 10, mas a exposição é pontos × R$ 10 × contratos.",
        },
      ],
      termosExplicacao: ["270.000", "exposição", "5 contratos", "margem"],
      aindaPratique: "calcular a exposição de toda posição antes de abrir",
      transferencia: {
        titulo: "O limite diário como teto",
        situacao:
          "O limite diário do WIN está em ~13.000 pontos. Você tem 10 contratos comprados quando o mercado trava na queda.",
        pergunta: "O que o limite diário significa para você?",
        opcoes: [
          {
            texto: "O pregão para e seu prejuízo é limitado à queda máxima do dia",
            tom: "correta",
            feedback:
              "Boa decisão. Com 10 contratos e ~13.000 pontos de teto, o risco máximo do dia é ~R$ 26.000 — número que precisa caber no seu capital ANTES de entrar.",
          },
          {
            texto: "O limite multiplica seu lucro no dia seguinte",
            tom: "errada",
            feedback: "O limite apenas pausa o pregão para evitar movimentos extremos.",
          },
          {
            texto: "O limite cancela seu ajuste diário",
            tom: "errada",
            feedback: "O ajuste do dia ainda é liquidado.",
          },
          {
            texto: "O limite só vale para opções",
            tom: "errada",
            feedback: "O limite diário vale para os contratos futuros.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "A margem mínima é:",
        alternativas: [
          "A garantia exigida para manter a posição",
          "O seu risco máximo",
          "O valor do ativo comprado",
          "O lucro garantido",
        ],
        correta: 0,
        explicacao: "Margem garante a posição; risco é outra história.",
      },
      {
        pergunta: "Com WIN a 130.000, a exposição de 1 contrato é:",
        alternativas: ["R$ 26.000", "R$ 100", "R$ 1.300", "R$ 13.000"],
        correta: 0,
        explicacao: "130.000 pontos × R$ 0,20 = R$ 26.000 por contrato.",
      },
      {
        pergunta: "A regra do 1% calcula o risco:",
        alternativas: [
          "Antes de entrar, em reais",
          "Depois do prejuízo",
          "Só no vencimento",
          "Pela margem mínima",
        ],
        correta: 0,
        explicacao: "1% da conta define o valor máximo em risco — e dali os pontos e contratos.",
      },
    ],
    exercicios: [
      {
        titulo: "Do risco à posição",
        enunciado:
          "Conta de R$ 10.000, stop de 100 pontos no WIN. Calcule: risco máximo (1%), número máximo de contratos e exposição com WIN a 130.000.",
        gabarito:
          "1% = R$ 100. Por contrato: 100 pts × R$ 0,20 = R$ 20 de risco → até 5 contratos. Exposição: 5 × R$ 26.000 = R$ 130.000.",
      },
    ],
  },
  {
    slug: "win-vs-wdo",
    ordem: 33,
    nivel: 4,
    dominio: "futuros",
    titulo: "Lição 10 — WIN vs WDO",
    resumo: "Dois contratos, duas personalidades: o índice e o dólar andam em ritmos diferentes.",
    problema: {
      titulo: "O mesmo botão, outra máquina",
      texto:
        "Pedro operava o WIN há meses e resolveu 'replicar o setup' no WDO. A estratégia que dava 20 pontos de alvo no índice se desfez no dólar: 20 pontos do WDO são 200% do alvo esperado, o spread custa 5× mais e o horário de maior ruído é outro. Não é o mesmo jogo com outro nome.",
      pergunta: "Quais as diferenças essenciais entre WIN e WDO?",
    },
    conceitos: [
      {
        titulo: "A tabela que resolve tudo",
        corpo: `
| | WIN (Mini Índice) | WDO (Mini Dólar) |
|---|---|---|
| Ativo | Ibovespa (pontos) | Dólar (pontos × R$ 0,10) |
| Valor do ponto | **R$ 0,20** | **R$ 10,00** |
| Tick | 5 pts = **R$ 1,00** | 0,5 pt = **R$ 5,00** |
| Margem mínima | ~R$ 100 | ~R$ 150 |
| Alvo típico | 50–200 pts | 10–40 pts |
| Horário de vida | 9h–18h | 9h–18h (com poucos minutos antes) |

O dólar anda em **pontos menores e reais maiores**: 1 ponto do WDO vale R$ 10; 50 pontos do WIN valem R$ 10. Confundir as unidades quebra o dimensionamento.
        `,
      },
      {
        titulo: "Por que a estratégia não se copia",
        corpo: `
- **Volatilidade relativa**: WDO costuma andar mais rápido em % do que o índice — os alvos de pontos são outros.
- **Abertura**: o WDO abre ~9h00 com alguns minutos de negociação antes do índice; o WIN só vive das 9h às 18h (mais horário de fechamento).
- **Slippage em reais**: 1 tick de WDO custa R$ 5 contra R$ 1 do WIN — 5× mais caro errar a execução.
- **Correlação**: em momentos de aversão ao risco, os dois andam juntos; em cenários de juros e fluxo, se descolam.

Setup não se transporta: se recalcula.
        `,
      },
    ],
    analogia:
      "WIN e WDO são o mesmo console com jogos diferentes: os botões são iguais (comprar/vender/stop), mas os mapas, as moedas e os chefes mudam. Quem joga com o tutorial do WIN no mundo do WDO leva hit gratuita.",
    naPratica: {
      titulo: "Ao mudar de contrato",
      passos: [
        "Valor do ponto e do tick do NOVO contrato estão na cabeça?",
        "Meu alvo em pontos continua fazendo sentido em reais?",
        "O spread custa quanto por volta, em reais?",
        "Os horários de entrada ainda batem com a minha rotina?",
      ],
    },
    missao: {
      titulo: "O setup transportado",
      situacao:
        "Seu setup no WIN alvo 50 pontos, stop 25. Você leva o mesmo 'alvo 50, stop 25' para o WDO.",
      pergunta: "O que acontece em reais?",
      opcoes: [
        {
          texto: "O risco saltou: 25 pts de WDO = R$ 250 vs 25 pts de WIN = R$ 5",
          tom: "correta",
          feedback:
            "Boa decisão. O mesmo número de pontos custa 50× mais reais no WDO. Setup não se copia — recalcula o dimensionamento.",
        },
        {
          texto: "Nada muda: 50 pontos é 50 pontos",
          tom: "errada",
          feedback: "Os pontos são unidades de contratos diferentes; o dinheiro em jogo é outro.",
        },
        {
          texto: "O WDO é mais barato porque o contrato é menor",
          tom: "errada",
          feedback: "O ponto do WDO (R$ 10) vale 50× o do WIN (R$ 0,20).",
        },
        {
          texto: "O spread compensa o valor do ponto",
          tom: "errada",
          feedback: "Pelo contrário: o spread do WDO é R$ 5 por volta contra R$ 1 do WIN.",
        },
      ],
      termosExplicacao: ["WDO", "R$ 250", "50×", "dimensionamento"],
      aindaPratique: "cotar os dois contratos na mesma hora e comparar o tick em reais",
      transferencia: {
        titulo: "A leitura do contrato",
        situacao:
          "Você comprou 3 WDO e o dólar subiu 20 pontos. O WIN andou 100 pontos no mesmo período.",
        pergunta: "Quem te rendeu mais reais, com 3 WDO vs 3 WIN?",
        opcoes: [
          {
            texto: "WDO: 20 × R$ 10 × 3 = R$ 600 vs WIN: 100 × R$ 0,20 × 3 = R$ 60",
            tom: "correta",
            feedback:
              "Boa decisão. Os reais não acompanham os pontos: WDO converteu 20 pontos em R$ 600; WIN, 100 pontos em R$ 60.",
          },
          {
            texto: "WIN: mais pontos é mais dinheiro",
            tom: "errada",
            feedback: "Pontos de contratos diferentes não se comparam — só reais.",
          },
          {
            texto: "Iguais, porque os dois são futuros",
            tom: "errada",
            feedback: "O valor do ponto difere 50× entre os contratos.",
          },
          {
            texto: "WDO: 20 × R$ 0,20 = R$ 12",
            tom: "errada",
            feedback: "O ponto do WDO vale R$ 10 — essa conta é do WIN.",
          },
        ],
      },
    },
    cenarios: [
      {
        titulo: "Movimento forte no horário de vida",
        tom: "ganho",
        descricao:
          "O WIN anda 300 pontos no início da tarde. Em reais, 300 × R$ 0,20 = R$ 60 por contrato. No mesmo dia, o WDO anda 30 pontos: R$ 300 por contrato. O mesmo 'setup direcional' rende 5× mais reais no dólar — se o dimensionamento acompanhou.",
      },
      {
        titulo: "Market making fino",
        tom: "neutro",
        descricao:
          "Pregão parado, spread de 1 tick nos dois contratos. No WIN, a volta custa R$ 2 por contrato; no WDO, R$ 10. A estratégia que vive de muitos trades pequenos migrou do zero ao negativo sem ninguém perceber.",
      },
      {
        titulo: "Abertura descolada",
        tom: "perda",
        descricao:
          "O dólar abre com gap de 40 pontos e o índice nem acompanha. Quem carregou o setup 'de índice' no WDO pela manhã recebeu o ajuste na contramão: 40 × R$ 10 = R$ 400 por contrato de prejuízo, com a tese do WIN intacta.",
      },
    ],
    comparativo: {
      titulo: "WIN vs WDO em uma tabela",
      colunas: ["", "WIN", "WDO"],
      linhas: [
        { item: "Valor do ponto", valores: ["R$ 0,20", "R$ 10,00"] },
        { item: "Tick", valores: ["5 pts = R$ 1,00", "0,5 pt = R$ 5,00"] },
        { item: "Margem mínima", valores: ["~R$ 100", "~R$ 150"] },
        { item: "Alvo típico", valores: ["50–200 pts", "10–40 pts"] },
        { item: "Spread típico", valores: ["1 tick = R$ 1", "1 tick = R$ 5"] },
        { item: "Horário", valores: ["9h–18h", "9h–18h (abre antes)"] },
      ],
    },
    quiz: [
      {
        pergunta: "O valor do ponto do WDO é:",
        alternativas: ["R$ 10,00", "R$ 0,20", "R$ 5,00", "R$ 1,00"],
        correta: 0,
        explicacao: "WDO = R$ 10/ponto; WIN = R$ 0,20/ponto.",
      },
      {
        pergunta: "Um tick do WIN vale:",
        alternativas: ["R$ 1,00 (5 pontos)", "R$ 5,00", "R$ 0,20", "R$ 10,00"],
        correta: 0,
        explicacao: "5 pontos × R$ 0,20 = R$ 1,00 por tick de WIN.",
      },
      {
        pergunta: "50 pontos de WIN equivalem, em reais, a quantos pontos de WDO?",
        alternativas: ["1 ponto", "5 pontos", "50 pontos", "0,5 ponto"],
        correta: 0,
        explicacao: "50 × R$ 0,20 = R$ 10 = 1 ponto de WDO.",
      },
    ],
    exercicios: [
      {
        titulo: "Conversão de contratos",
        enunciado:
          "Converta para reais: (a) 200 pts de WIN; (b) 15 pts de WDO; (c) 1.300 pts de WIN; (d) 30 pts de WDO com 2 contratos.",
        gabarito: "(a) R$ 40. (b) R$ 150. (c) R$ 260. (d) 30 × R$ 10 × 2 = R$ 600.",
      },
    ],
  },
  {
    slug: "futuro-vs-opcao",
    ordem: 34,
    nivel: 4,
    dominio: "futuros",
    titulo: "Lição 11 — Futuro vs opção",
    resumo:
      "O futuro te obriga a honrar a posição todos os dias; a opção limita sua perda ao prêmio.",
    problema: {
      titulo: "A mesa redonda das duas pernas",
      texto:
        "Renata comprou uma opção de compra sobre o índice 'para não ter que escolher entre risco e oportunidade'. No dia seguinte, percebeu que não sabia nem em que mesa estava: o futuro cobra ajuste todo dia e exige margem; a opção só cobra o prêmio na compra. Duas ferramentas que parecem fazer a mesma pergunta — 'pra onde vai o mercado?' — com respostas e riscos diferentes.",
      pergunta: "Em que situações cada um faz sentido?",
    },
    conceitos: [
      {
        titulo: "A régua do risco",
        corpo: `
| | Futuro | Opção comprada |
|---|---|---|
| Perda máxima | a posição (pode ser enorme) | o prêmio pago |
| Margem | exigida todo dia | só na venda |
| Ajuste diário | sim | não (prêmio a vista) |
| Exigência de decisão | gestão diária da posição | decide se exerce até o vencimento |
| Vencimento | pode rolar | pode expirar sem valor |

O futuro é um compromisso contínuo; a opção comprada é um bilhete com custo limitado — e com tempo para dar errado.
        `,
      },
      {
        titulo: "Quando cada um brilha",
        corpo: `
- **Futuro**: direção clara, quer resultado linear com o movimento, aceita o ajuste diário e tem capital para a margem e o risco.
- **Opção comprada**: quer participar do movimento com **perda limitada**, sem margem, e está disposto a pagar o prêmio — aceitando que o tempo (theta) trabalha contra.
- **Venda de opção**: coleta prêmio, mas assume margem e risco de direção — o que exige o mesmo cuidado de dimensionamento do futuro.

Ferramentas não têm lado bom: têm **condições de uso**.
        `,
      },
    ],
    analogia:
      "O futuro é alugar um imóvel com pagamento todo mês (ajuste diário e margem). A opção comprada é comprar uma entrada de cinema válida por X dias: custa fixo, e se o filme não acontecer, você perde só o ingresso. Nenhum dos dois é melhor — um é compromisso, o outro é bilhete.",
    naPratica: {
      titulo: "Escolhendo a mesa",
      passos: [
        "Minha tese é de direção com gestão diária? → futuro.",
        "Quero risco limitado ao prêmio e fôlego para o tempo? → opção comprada.",
        "Estou pagando prêmio demais pelo movimento esperado? → repensar.",
        "O ajuste diário cabe no meu fluxo de caixa e na minha rotina?",
      ],
    },
    missao: {
      titulo: "A mesa certa para a tese",
      situacao:
        "Sua tese: o índice vai subir até o fim do mês, mas pode oscilar bastante no caminho. Você tem R$ 600 disponíveis para o risco total da ideia.",
      pergunta: "Qual instrumento encaixa melhor, se a opção custa R$ 300?",
      opcoes: [
        {
          texto: "Opção comprada: perda máxima R$ 300 e sem margem nem ajuste",
          tom: "correta",
          feedback:
            "Boa decisão. Para uma tese mensal com oscilação no caminho, o bilhete (opção) limita a perda ao prêmio e não exige gestão diária de margem.",
        },
        {
          texto: "Futuro: sem pagar prêmio, fico com tudo do movimento",
          tom: "errada",
          feedback:
            "Futuro não cobra prêmio, mas cobra ajuste diário, margem e risco total da posição — incompatível com 'só tenho R$ 600'.",
        },
        {
          texto: "Os dois: futuro + opção no mesmo lado",
          tom: "errada",
          feedback:
            "Combinar as mesas multiplica exposição e margem — só se a tese exigir, não por padrão.",
        },
        {
          texto: "Vender a opção de compra do mesmo strike",
          tom: "errada",
          feedback:
            "Vender opção inverte o risco: perda ilimitada e margem — o oposto da sua limitação de R$ 600.",
        },
      ],
      termosExplicacao: ["prêmio", "margem", "ajuste diário", "perda máxima"],
      aindaPratique: "desenhar o gráfico de risco das duas mesas antes de operar",
      transferencia: {
        titulo: "O vencimento chegando",
        situacao:
          "Faltam 3 dias para o vencimento da opção que você comprou. A tese ainda não aconteceu e a opção caiu 60%.",
        pergunta: "O que a gestão de decisão (sua) sugere?",
        opcoes: [
          {
            texto: "Revisar a tese: tempo curto + queda de 60% pedem corte, não espera",
            tom: "correta",
            feedback:
              "Boa decisão. A perda máxima é o prêmio, mas 'máxima' não é convite: manter os 40% restantes por teimosia é decisão nova, com outra tese.",
          },
          {
            texto: "Segurar até o vencimento porque a perda já é 'máxima'",
            tom: "errada",
            feedback:
              "A perda máxima é o prêmio total; segurar os 40% restantes é nova decisão, não espera neutra.",
          },
          {
            texto: "Comprar mais para baixar o preço médio",
            tom: "errada",
            feedback:
              "Adicionar com tese vencida é escalada — dobra a aposta sem dobrar a informação.",
          },
          {
            texto: "Rolar para o vencimento seguinte sem revisar a tese",
            tom: "errada",
            feedback: "Rolar recompra tempo — só faz sentido com tese ainda válida.",
          },
        ],
      },
    },
    cenarios: [
      {
        titulo: "O movimento veio",
        tom: "ganho",
        descricao:
          "O índice sobe 2.000 pontos em duas semanas. O futuro entrega os R$ 400 por contrato integralmente; a opção comprada também lucra — menos se o tempo já corroeu o prêmio. As duas mesas ganharam; o futuro ganhou de forma linear.",
      },
      {
        titulo: "O mercado travou",
        tom: "neutro",
        descricao:
          "Duas semanas de lateralização. O futuro devolve oscilações pequenas, dia a dia, com ajuste; a opção comprada sangra o theta todos os dias. A mesma 'não-decisão' custou R$ 0 ao futuro e boa parte do prêmio à opção.",
      },
      {
        titulo: "O movimento foi o contrário",
        tom: "perda",
        descricao:
          "O índice cai 1.500 pontos. O futuro perde R$ 300 por contrato e ainda exige margem para aguentar; a opção comprada perde, no máximo, o prêmio. O risco da posição definiu a diferença — e a margem definiu quem aguentou ficar.",
      },
    ],
    comparativo: {
      titulo: "Futuro × Opção",
      colunas: ["", "Futuro", "Opção comprada"],
      linhas: [
        { item: "Perda máxima", valores: ["posição inteira", "o prêmio"] },
        { item: "Margem", valores: ["exigida", "não (na compra)"] },
        { item: "Ajuste diário", valores: ["sim", "não"] },
        { item: "Custo do tempo", valores: ["não existe (linear)", "theta corrói"] },
        { item: "Vencimento", valores: ["rola ou liquida", "expira ou exerce"] },
      ],
    },
    quiz: [
      {
        pergunta: "A perda máxima de quem COMPRA uma opção é:",
        alternativas: ["O prêmio pago", "A posição inteira", "A margem", "Ilimitada"],
        correta: 0,
        explicacao: "O comprador perde, no máximo, o prêmio. Risco limitado é a marca da compra.",
      },
      {
        pergunta: "Quem exige ajuste diário?",
        alternativas: ["O futuro", "A opção comprada", "A opção vendida sem margem", "Nenhum"],
        correta: 0,
        explicacao: "O ajuste diário é mecânica do contrato futuro — opções liquidam pelo prêmio.",
      },
      {
        pergunta: "Uma tese de alta mensal com pouca tolerância a oscilação no caminho favorece:",
        alternativas: ["Opção comprada", "Futuro", "Venda de opção", "Margem máxima"],
        correta: 0,
        explicacao: "Bilhete com perda limitada ao prêmio para tese com prazo e oscilação.",
      },
    ],
    exercicios: [
      {
        titulo: "As duas mesas",
        enunciado:
          "Desenhe mentalmente: (a) risco máximo de comprar 1 WIN a 130.000 com stop de 500 pts; (b) risco máximo de comprar uma opção por R$ 150; (c) qual dos dois exige margem?",
        gabarito: "(a) stop honrado = R$ 100 (ou a posição sem stop). (b) R$ 150. (c) o futuro.",
      },
    ],
  },
  {
    slug: "decisao-no-day-trade",
    ordem: 35,
    nivel: 5,
    dominio: "futuros",
    titulo: "Lição 12 — A decisão no day trade",
    resumo:
      "O ciclo completo: check, hipótese, stop, dimensionamento e decisão — em menos de um segundo.",
    problema: {
      titulo: "O segundo que decide",
      texto:
        "Marina perdeu o melhor setup do mês porque 'não conseguiu decidir'. Na verdade, ela não tinha decidido NADA antes: o plano parava na hipótese. Quando o gatilho apareceu, faltava o que fazer, onde era o stop, quanto arriscar. A decisão no day trade não acontece na hora — acontece antes.",
      pergunta: "O que precisa estar pronto antes de o gatilho disparar?",
    },
    conceitos: [
      {
        titulo: "O ciclo completo da decisão",
        corpo: `
No day trade, cada setup percorre um ciclo antes de existir:

1. **Check do contexto**: tendência, notícias, horário, liquidez.
2. **Hipótese falsável**: 'se o WIN perder 129.800 com volume, abro venda com alvo 129.600'.
3. **Stop definido**: em pontos, no mesmo momento da hipótese.
4. **Dimensionamento**: contratos = risco em reais ÷ (pontos de stop × valor do ponto).
5. **Decisão pronta**: gatilho acionou? Executa o que foi escrito. Não acionou? Não existe trade.

Uma operação com tese fraca que deu lucro **não** foi uma boa decisão — e uma perda dentro do plano pode ter sido uma ótima.
        `,
      },
      {
        titulo: "O preço da decisão errada",
        corpo: `
- **Reagir a mercado** sem check: pagar o movimento contra você.
- **Mudar o stop no meio**: transformar plano em torcida.
- **Aumentar contratos para 'recuperar'**: transformar perda em acidente.
- **Duvidar do gatilho**: deixar o setup acontecer sem você.

Decisão não é pressentimento: é a execução de um plano que já incluiu o pior caso.
        `,
      },
    ],
    analogia:
      "O day trade é um zagueiro em cobrança de pênalti: o vencedor não é o mais rápido — é o que decidiu o canto antes da bola sair. Decidir depois do chute é o erro que custa o jogo.",
    naPratica: {
      titulo: "Montando o ciclo antes do pregão",
      passos: [
        "Liste os setups que você VAI operar hoje (com gatilho, stop e alvo).",
        "Defina o risco máximo do dia em reais.",
        "Calcule os contratos de cada setup.",
        "Comprometa-se: gatilho fora do plano = não operar.",
      ],
    },
    missao: {
      titulo: "O gatilho acionado",
      situacao:
        "Seu plano: 'WDO perdeu 5,3950 com volume → venda com alvo 5,3930 e stop 5,3965.' O preço perdeu o nível e está voltando — você ainda não entrou porque 'quis confirmar mais um candle'.",
      pergunta: "Qual a melhor decisão?",
      opcoes: [
        {
          texto: "Executar o plano como escrito — ou aceitar que a entrada passou",
          tom: "correta",
          feedback:
            "Boa decisão. Se o gatilho valeu, executa; se o preço já voltou, o setup passou. Os dois caminhos são plano — 'esperar confirmação extra' é decisão nova não escrita.",
        },
        {
          texto: "Entrar agora mesmo, sem olhar stop nem contratos",
          tom: "errada",
          feedback: "Entrar sem o ciclo pronto é reação, não decisão.",
        },
        {
          texto: "Comprar no rebote porque 'o mercado sempre volta'",
          tom: "errada",
          feedback: "Essa não é a hipótese que você validou — é outra operação sem check.",
        },
        {
          texto: "Entrar com o dobro de contratos para compensar a demora",
          tom: "errada",
          feedback: "Dimensionamento muda só com nova conta de risco, nunca por compensação.",
        },
      ],
      termosExplicacao: ["gatilho", "plano", "5.3930", "1%", "decisão"],
      aindaPratique: "registrar no diário a diferença entre operar o plano e reagir ao mercado",
      transferencia: {
        titulo: "O lucro que não era decisão",
        situacao:
          "Você comprou 2 WIN 'na emoção' depois de ver uma vela forte. Deu +R$ 40. Na semana seguinte, repetiu o mesmo gesto e perdeu R$ 120.",
        pergunta: "Qual o aprendizado correto?",
        opcoes: [
          {
            texto: "As duas foram a mesma decisão errada — o lucro não valida o processo",
            tom: "correta",
            feedback:
              "Boa decisão. Processo ruim com lucro é sorte cobrada depois. A avaliação é da decisão (antes), não do resultado (depois).",
          },
          {
            texto: "A primeira foi certa porque deu lucro",
            tom: "errada",
            feedback: "Avaliar pelo resultado ensina a repetir erros que, um dia, dão prejuízo.",
          },
          {
            texto: "O problema é que você aumentou o tamanho da segunda",
            tom: "errada",
            feedback: "O problema é o processo: sem plano, qualquer tamanho é acidente.",
          },
          {
            texto: "Você deve operar só vela forte",
            tom: "errada",
            feedback: "O setup em si não é o erro — é a falta de check, stop e dimensionamento.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "A ordem correta do ciclo de decisão é:",
        alternativas: [
          "Check → hipótese → stop → dimensionamento → decisão",
          "Decisão → hipótese → check → stop",
          "Gatilho → contratos → reza",
          "Stop → hipótese → check → decisão",
        ],
        correta: 0,
        explicacao: "O contexto vem antes da hipótese; stop e tamanho antes de decidir executar.",
      },
      {
        pergunta: "Um trade com tese fraca que deu lucro foi:",
        alternativas: [
          "Uma decisão ruim com resultado favorável",
          "Uma boa decisão validada",
          "Um erro que se anulou",
          "Um sinal do mercado",
        ],
        correta: 0,
        explicacao: "Resultado não valida processo: a decisão se julga antes, não depois.",
      },
      {
        pergunta: "O dimensionamento é feito:",
        alternativas: [
          "Antes do gatilho, com risco em reais e pontos de stop",
          "Depois da entrada, se o trade der certo",
          "Pela margem mínima da corretora",
          "No momento de recuperar perda",
        ],
        correta: 0,
        explicacao: "Contratos = risco ÷ (stop × valor do ponto), tudo antes do gatilho.",
      },
    ],
    exercicios: [
      {
        titulo: "Escreva seu ciclo",
        enunciado:
          "Escreva o ciclo completo de um setup que você operaria amanhã no WIN ou WDO: contexto, hipótese falsável com nível, stop em pontos, risco em reais (1% da conta) e número de contratos.",
        gabarito:
          "Conferir se todos os 5 passos têm resposta numérica e se contratos = risco ÷ (stop × valor do ponto).",
      },
    ],
  },
  {
    slug: "tributacao-day-trade",
    ordem: 36,
    nivel: 5,
    dominio: "futuros",
    titulo: "Lição 13 — Tributação do day trade",
    resumo:
      "Day trade de futuros: 20% sobre o lucro, com IRRF de 1% na fonte e sem isenção de R$ 20 mil.",
    problema: {
      titulo: "O mês que cobra 20%",
      texto:
        "Otávio teve um mês excepcional: R$ 2.000 de lucro em day trade de WIN. Ouviu falar da 'isenção de R$ 20 mil' e nem guardou o dinheiro do imposto. Na declaração, descobriu que a isenção não existe para day trade — e que o DARF era devido mês a mês, com 20% sobre o lucro.",
      pergunta: "Quanto o day trade de futuros paga de imposto, e quando?",
    },
    conceitos: [
      {
        titulo: "A regra do day trade",
        corpo: `
- **Alíquota**: 20% sobre o lucro líquido do mês (day trade), apurada mês a mês.
- **IRRF**: 1% retido na fonte sobre cada operação — valor que **abate** o imposto devido.
- **Isenção de R$ 20 mil/mês**: **não existe** para day trade (vale para vendas de ações/swing até o limite).
- **Compensação**: prejuízo de day trade compensa só lucro de day trade — não swing.
- **Vencimento**: DARF com código 6015 até o último dia útil do mês seguinte.

O swing (15%, com isenção de R$ 20 mil) segue regra separada.
        `,
      },
      {
        titulo: "A conta na prática",
        corpo: `
Lucro do mês em day trade: R$ 1.000.

- IRRF retido no mês (1% das operações): R$ 10.
- Imposto devido: 20% × R$ 1.000 = R$ 200.
- **DARF a pagar**: R$ 200 − R$ 10 = **R$ 190**.

Sem IRRF suficiente, paga a diferença; se o IRRF superar o devido (prejuízo), vira compensação/restituição na declaração. O ajuste diário consolida o resultado de cada dia — o que facilita apurar o mês.
        `,
      },
    ],
    analogia:
      "O imposto do day trade é a gorjeta de garçom 'na conta': 1% já vem retido em cada operação como entrada da comissão (IRRF), e no fim do mês você acerta o restante dos 20% com o DARF. Esquecer o acerto mensal é jantar caro no ano seguinte.",
    naPratica: {
      titulo: "Todo mês, com day trade",
      passos: [
        "Somar o lucro líquido de day trade do mês.",
        "Somar o IRRF retido (1% de cada operação).",
        "Calcular 20% do lucro e abater o IRRF.",
        "Emitir o DARF (6015) até o último dia útil do mês seguinte.",
      ],
    },
    missao: {
      titulo: "A conta do mês",
      situacao: "Seu mês: +R$ 1.500 em day trade de WIN, com R$ 15 de IRRF retido na fonte.",
      pergunta: "Quanto você paga de DARF?",
      opcoes: [
        {
          texto: "R$ 285 (20% de 1.500 − 15)",
          tom: "correta",
          feedback:
            "Boa decisão. 20% × R$ 1.500 = R$ 300; menos os R$ 15 de IRRF = R$ 285 de DARF.",
        },
        {
          texto: "R$ 300 (20% de 1.500, sem abater o IRRF)",
          tom: "errada",
          feedback: "O IRRF retido abate o imposto devido — senão você pagaria 21% no total.",
        },
        {
          texto: "R$ 15 (o IRRF é o imposto final)",
          tom: "errada",
          feedback: "O IRRF é antecipação; os 20% são o imposto final sobre o lucro do mês.",
        },
        {
          texto: "R$ 0 — lucro abaixo de R$ 20 mil é isento",
          tom: "errada",
          feedback: "A isenção de R$ 20 mil não existe para day trade.",
        },
      ],
      termosExplicacao: ["DARF", "20%", "IRRF", "6015", "mês seguinte"],
      aindaPratique: "abrir o extrato de corretagem e conferir o IRRF retido",
      transferencia: {
        titulo: "O prejuízo que salva",
        situacao: "Janeiro: −R$ 400 em day trade. Fevereiro: +R$ 700 em day trade.",
        pergunta: "O que a compensação permite?",
        opcoes: [
          {
            texto: "Compensar: imposto de 20% sobre R$ 300 no mês do lucro",
            tom: "correta",
            feedback:
              "Boa decisão. O prejuízo de day trade compensa lucro de day trade: fevereiro paga 20% sobre R$ 700 − R$ 400 = R$ 300.",
          },
          {
            texto: "Compensar com lucros de swing do mesmo período",
            tom: "errada",
            feedback: "A compensação não cruza modalidades: day trade com day trade apenas.",
          },
          {
            texto: "Não compensar nada, cada mês é independente",
            tom: "errada",
            feedback:
              "Prejuízos de day trade são compensáveis com lucros futuros da mesma modalidade.",
          },
          {
            texto: "Pagar 20% sobre R$ 700 inteiro",
            tom: "errada",
            feedback:
              "O prejuízo anterior reduz a base de cálculo — esse é o objetivo da compensação.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "A alíquota do lucro de day trade em futuros é:",
        alternativas: ["20%", "15%", "27,5%", "Isenta até R$ 20 mil"],
        correta: 0,
        explicacao: "Day trade: 20%; swing: 15% com isenção de R$ 20 mil.",
      },
      {
        pergunta: "O IRRF de 1% retido nas operações:",
        alternativas: [
          "Abate o imposto devido no DARF",
          "É o imposto final",
          "É devolvido integralmente",
          "Só vale para swing",
        ],
        correta: 0,
        explicacao: "IRRF é antecipação: entra como crédito no cálculo do DARF.",
      },
      {
        pergunta: "O DARF de day trade (6015) vence:",
        alternativas: [
          "Até o último dia útil do mês seguinte",
          "Só na declaração anual",
          "No dia do trade",
          "Nunca, se houver IRRF",
        ],
        correta: 0,
        explicacao: "É mês a mês, até o último dia útil do mês seguinte.",
      },
    ],
    exercicios: [
      {
        titulo: "O DARF da semana",
        enunciado:
          "Mês com: day trade +R$ 900 (IRRF R$ 9) e swing +R$ 400 (IRRF R$ 4). Calcule os DARFs separados de cada modalidade.",
        gabarito:
          "Day: 20% × 900 − 9 = R$ 171. Swing: 15% × 400 − 4 = R$ 56. Dois DARFs, modalidades separadas.",
      },
    ],
  },
  {
    slug: "darf-day-trade",
    ordem: 37,
    nivel: "pratica",
    dominio: "futuros",
    titulo: "Lição 14 — DARF na prática",
    resumo: "Emitir, preencher e pagar o DARF de day trade: o passo a passo sem mistério.",
    problema: {
      titulo: "O código que ninguém explica",
      texto:
        "No fim do mês lucrativo, Caio abriu o site do Banco Central para emitir o DARF e travou: qual código? Day trade de futuros usa o **6015**. Já o swing, o 6015 com alíquota de 15%? Não: swing de futuros também é 6015 — a diferença está na apuração (15% vs 20%). Sem o passo a passo, até o código certo parece errado.",
      pergunta: "Como emitir e pagar o DARF de day trade corretamente?",
    },
    conceitos: [
      {
        titulo: "O passo a passo do DARF",
        corpo: `
1. Acesse o **Banco Central** → Emissão de DARF (ou o programa da Receita para valores altos).
2. Preencha: **CPF**, período de apuração (mês) e código **6015**.
3. Informe o **valor do imposto** (20% do lucro de day trade − IRRF retido).
4. Gere e pague até o **último dia útil do mês seguinte** (via banco, como qualquer boleto).
5. Conserve o comprovante junto ao diário: a Receita cruza o IRRF da corretora com o seu DARF.

Valores mensais iguais ou superiores a R$ 10 (no código 6015, o piso é R$ 10) exigem DARF; abaixo, pode levar o saldo para o mês seguinte.
        `,
      },
      {
        titulo: "O cruzamento que não perdoa",
        corpo: `
- A corretora **informa à Receita** o IRRF de 1% de cada operação.
- O ajuste diário deixa o resultado mensal registrado — e auditável.
- Se o DARF não bater com o lucro apurado, a diferença vira multa e juros.
- Manter o **diário de operações** (entrada, saída, pontos, custos) é a sua defesa em qualquer retificação.

Não é burocracia: é a continuação da sua gestão — o dinheiro do imposto é separado do risco.
        `,
      },
    ],
    analogia:
      "O DARF é o carnê do armário de verdade: se você paga mês a mês (20% do lucro de day trade), dezembro chega leve. Quem empurra para 'ver no ano que vem' encontra o carnê com juros, multa e a corretora apontando o dedo.",
    naPratica: {
      titulo: "Todo mês, dia do DARF",
      passos: [
        "Separar, no fechamento do mês, os lucros de day trade e de swing.",
        "Apurar o imposto de cada modalidade (20% / 15%), abatendo o IRRF.",
        "Emitir o DARF 6015 no site do Banco Central.",
        "Pagar até o último dia útil do mês seguinte e arquivar.",
      ],
    },
    missao: {
      titulo: "O mês que chegou",
      situacao:
        "Mês fechado: R$ 800 de lucro em day trade, R$ 8 de IRRF retido. Você decide emitir o DARF hoje.",
      pergunta: "Qual o caminho correto?",
      opcoes: [
        {
          texto: "Banco Central → código 6015 → R$ 152 (20% × 800 − 8)",
          tom: "correta",
          feedback:
            "Boa decisão. 20% × R$ 800 = R$ 160; menos R$ 8 de IRRF = R$ 152, código 6015, até o fim do mês seguinte.",
        },
        {
          texto: "Banco Central → código 6015 → R$ 160 sem abater o IRRF",
          tom: "errada",
          feedback: "O IRRF retido abate o DARF — pagar R$ 160 é pagar 21% do lucro.",
        },
        {
          texto: "Programa da Receita → código 6123 → R$ 152",
          tom: "errada",
          feedback: "O código de day trade de futuros é o 6015.",
        },
        {
          texto: "Esperar a declaração anual e pagar tudo junto",
          tom: "errada",
          feedback: "O DARF é mensal; o atraso gera multa e juros.",
        },
      ],
      termosExplicacao: ["6015", "Banco Central", "152", "mês seguinte"],
      aindaPratique: "simular a emissão do DARF sem pagar, só para ver o formulário",
      transferencia: {
        titulo: "O DARF do mês do prejuízo",
        situacao: "Mês com prejuízo de R$ 250 em day trade. Nenhum DARF a pagar.",
        pergunta: "O que você registra para não perder o direito à compensação?",
        opcoes: [
          {
            texto: "Guardo o prejuízo apurado: ele abate lucros futuros de day trade",
            tom: "correta",
            feedback:
              "Boa decisão. Prejuízo não apurado vira dinheiro esquecido; registrado, compensa lucros de day trade dos meses seguintes.",
          },
          {
            texto: "Emito um DARF de R$ 0 para registrar",
            tom: "errada",
            feedback:
              "Não existe DARF sem imposto devido — o registro do prejuízo é no seu controle.",
          },
          {
            texto: "O prejuízo compensa qualquer lucro, de qualquer modalidade",
            tom: "errada",
            feedback: "Só day trade compensa day trade.",
          },
          {
            texto: "O prejuízo pode abater o IRRF de outros meses",
            tom: "errada",
            feedback: "A compensação de prejuízo é com lucro da mesma modalidade, não com IRRF.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O código do DARF para day trade de futuros é:",
        alternativas: ["6015", "6123", "3302", "8015"],
        correta: 0,
        explicacao: "Day trade de renda variável (incluindo futuros) usa o código 6015.",
      },
      {
        pergunta: "O DARF de day trade deve ser pago:",
        alternativas: [
          "Todo mês, até o último dia útil do mês seguinte",
          "Uma vez por ano",
          "A cada operação",
          "Somente no vencimento do contrato",
        ],
        correta: 0,
        explicacao: "Apuração mensal, vencimento no último dia útil do mês seguinte.",
      },
      {
        pergunta: "O prejuízo de day trade não compensado:",
        alternativas: [
          "Abate lucros de day trade de meses seguintes",
          "Expira no fim do ano",
          "Vira IRRF",
          "Só compensa no swing",
        ],
        correta: 0,
        explicacao: "Compensa lucros futuros da MESMA modalidade.",
      },
    ],
    exercicios: [
      {
        titulo: "O fluxo completo",
        enunciado:
          "Simule o mês: +R$ 1.200 de day trade (IRRF R$ 12). Preencha: imposto bruto, IRRF a abater, DARF a pagar, código, prazo de vencimento.",
        gabarito:
          "20% × 1.200 = R$ 240; − R$ 12 = R$ 228; código 6015; último dia útil do mês seguinte.",
      },
    ],
  },
];

export function getLesson(slug: string) {
  return LESSONS.find((l) => l.slug === slug);
}

export type CaminhoTrilha = "opcoes" | "futuros" | "geral";

/** Lições visíveis para o caminho do usuário (segmentação por mercado). */
export function liçõesDe(caminho: CaminhoTrilha): Lesson[] {
  if (caminho === "futuros") return LESSONS.filter((l) => l.dominio === "futuros");
  if (caminho === "opcoes") return LESSONS.filter((l) => l.dominio !== "futuros");
  return LESSONS;
}

export const NIVEIS: Record<LessonNivel, string> = {
  1: "Entender",
  2: "Pensar",
  3: "Construir",
  4: "Comparar",
  5: "Decidir",
  pratica: "Prática",
};

export const NIVEIS_DESC: Record<LessonNivel, string> = {
  1: "O que são opções, prêmio, strike, vencimento, comprador e vendedor.",
  2: "Alta, baixa, lateralização, tempo, volatilidade e risco.",
  3: "As estruturas que expressam cada hipótese — risco e retorno sempre conhecidos antes.",
  4: "Tenho uma hipótese: qual estrutura a expressa melhor?",
  5: "Regras → simulação → risco → tese → registro → revisão.",
  pratica: "Tributação é uma trilha transversal à decisão — não um estágio dela.",
};

export function nivelLabel(nivel: LessonNivel): string {
  return nivel === "pratica" ? "Prática" : `Nível ${nivel}`;
}
