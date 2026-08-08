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
