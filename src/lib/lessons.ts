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
  /** Contrato específico da lição (só para futuros): win (mini índice) ou wdo (mini dólar). */
  instrumento?: "win" | "wdo";
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
    slug: "lendo-um-candle",
    ordem: 1,
    nivel: 1,
    titulo: "Lição 1 — Lendo um candle",
    resumo:
      "O candle resume um período de negociação: quem dominou, até onde o preço foi e onde fechou.",
    problema: {
      titulo: "O retângulo que ninguém explicou",
      texto:
        "Carlos abriu o gráfico pela primeira vez e viu uma fileira de retângulos com risquinhos saindo de cada um. A corretora não explica nada; a internet joga 47 siglas em cima dele. Ele sabe que o preço 'andou', mas não consegue dizer nem o que um único retângulo significa.",
      pergunta: "O que exatamente um candle mostra?",
    },
    conceitos: [
      {
        titulo: "A anatomia do candle",
        corpo: `
Cada candle resume **um período** de negociação (1 minuto, 5 minutos, 1 dia...). Ele guarda quatro preços:

- **Abertura** — o primeiro preço negociado do período.
- **Fechamento** — o último preço negociado do período.
- **Máxima** — o preço mais alto que o período alcançou.
- **Mínima** — o preço mais baixo que o período alcançou.

O **corpo** liga abertura e fechamento. Os **pavios** (ou sombras) ligam o corpo à máxima e à mínima.
        `,
      },
      {
        titulo: "Alta, baixa e o que fica no meio",
        corpo: `
Candle de **alta**: o fechamento ficou acima da abertura. Candle de **baixa**: o fechamento ficou abaixo da abertura. É isso — a cor é consequência dessa comparação.

O que o corpo conta: se abertura e fechamento estão distantes, um lado dominou o período. Se estão colados, o período foi uma disputa.

O que os pavios contam: até onde o preço **chegou** — e que não conseguiu segurar.

Um candle nunca diz o que vem depois. Ele diz **o que aconteceu** no período.
        `,
      },
    ],
    analogia:
      "Cada candle é a ata de um round de luta: o corpo mostra quem dominou e por quanto, os pavios mostram as investidas que não seguraram — e a ata nunca diz quem vence o próximo round.",
    naPratica: {
      titulo: "Antes de qualquer leitura",
      passos: [
        "Identifique a abertura e o fechamento do candle (o corpo).",
        "Veja até onde os pavios levaram o preço (máxima e mínima).",
        "Classifique: alta ou baixa? Corpo longo ou disputa?",
        "Responda em uma frase: o que aconteceu aqui?",
      ],
    },
    missao: {
      titulo: "Observe o candle",
      situacao:
        "Você abre o gráfico de 5 minutos e encontra um candle de alta com corpo longo e um pavio inferior visível: o preço abriu, cedeu um pouco, subiu com força e fechou perto da máxima do período.",
      pergunta: "O que aconteceu neste período?",
      opcoes: [
        {
          texto:
            "Abriu, os compradores dominaram o período e o fechamento ficou perto da máxima — houve força compradora no período.",
          tom: "correta",
          feedback:
            "Correto: corpo longo com fechamento perto da máxima é domínio comprador no período. Lembre que isso descreve o passado — decisão exige regra e risco.",
        },
        {
          texto:
            "Os compradores dominaram o período inteiro sem nenhuma pressão contrária — mas o pavio inferior mostra que o preço visitou níveis mais baixos antes de subir.",
          tom: "quase",
          feedback:
            "Quase: houve domínio comprador, mas o pavio inferior mostra uma visita a níveis baixos — pressão contrária existiu no início do período.",
        },
        {
          texto:
            "O preço vai subir no próximo período — o candle do período passado não prevê o futuro.",
          tom: "errada",
          feedback:
            "Não: um candle descreve o que aconteceu, nunca o que vai acontecer. Previsão é hipótese — e precisa de regra e risco.",
        },
        {
          texto:
            "Quem vendeu dominou o período — o fechamento acima da abertura indica o contrário.",
          tom: "errada",
          feedback:
            "Não: fechamento acima da abertura define um candle de alta — domínio comprador no período.",
        },
      ],
      termosExplicacao: ["abertura", "fechamento", "pavio", "corpo"],
      aindaPratique:
        "Abrir o gráfico de qualquer ativo e descrever o último candle em uma frase, sem olhar o que veio antes.",
      transferencia: {
        titulo: "O candle de baixa do fim do dia",
        situacao:
          "No fim do pregão, o último candle é de baixa, com corpo curto e um pavio superior visível: o preço tentou subir, voltou e fechou ligeiramente abaixo da abertura.",
        pergunta: "O que esse candle conta sobre o período?",
        opcoes: [
          {
            texto:
              "Quem vendeu ficou com a palavra final no período, mas a disputa foi acirrada — corpo curto é disputa, não domínio.",
            tom: "correta",
            feedback:
              "Correto: corpo curto significa abertura e fechamento colados — disputa. O vendedor só venceu por pouco, dentro do período.",
          },
          {
            texto:
              "O pavio superior mostra que o preço chegou a uma região mais alta e não ficou — a rejeição é uma hipótese a considerar.",
            tom: "quase",
            feedback:
              "Quase: o pavio mostra a visita à região alta, e a rejeição é uma hipótese razoável — mas ainda é interpretação, não fato.",
          },
          {
            texto:
              "É um sinal de que o mercado vai cair amanhã — um candle não prevê o próximo período.",
            tom: "errada",
            feedback:
              "Não: um candle descreve o passado. O amanhã é hipótese que exige contexto, regra e risco.",
          },
          {
            texto: "O período foi de forte domínio vendedor — um corpo curto não indica domínio.",
            tom: "errada",
            feedback:
              "Não: domínio exige corpo longo. Corpo curto é disputa, mesmo que a cor seja de baixa.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O que o corpo de um candle representa?",
        alternativas: [
          "A distância entre a máxima e a mínima do período",
          "A distância entre a abertura e o fechamento do período",
          "O volume negociado no período",
          "O tempo que o período levou",
        ],
        correta: 1,
        explicacao: "O corpo liga abertura e fechamento; os pavios é que vão da máxima à mínima.",
      },
      {
        pergunta: "Um candle é de alta quando...",
        alternativas: [
          "o fechamento fica acima da abertura",
          "a máxima é maior que o fechamento",
          "o pavio superior é maior que o inferior",
          "a cor do gráfico é verde",
        ],
        correta: 0,
        explicacao:
          "Alta é definida pela comparação abertura/fechamento; a cor é só consequência dessa comparação.",
      },
      {
        pergunta: "Pavios longos em um candle indicam que...",
        alternativas: [
          "o preço visitou regiões distantes do corpo e não segurou lá",
          "o próximo candle vai virar",
          "a tendência mudou",
          "a venda é obrigatória",
        ],
        correta: 0,
        explicacao:
          "Pavio mostra o alcance do preço no período — o que aconteceu, não o que vai acontecer.",
      },
    ],
  },
  {
    slug: "a-historia-do-pavio",
    ordem: 2,
    nivel: 1,
    titulo: "Lição 2 — A história do pavio",
    resumo:
      "O pavio mostra que o preço esteve numa região — sozinho, ele não determina o que fazer.",
    problema: {
      titulo: "O pavio que 'previu' a queda",
      texto:
        "Luciana viu um pavio superior longo e vendeu 'porque o mercado ia cair'. Caiu de fato, no dia seguinte — e ela passou a tratar todo pavio longo como ordem de venda. Até o dia em que o mesmo formato apareceu numa região de suporte: o preço subiu e subiu. O pavio não tinha 'previsto' nada — ele contava uma história que precisava de contexto.",
      pergunta: "O que um pavio sozinho realmente diz?",
    },
    conceitos: [
      {
        titulo: "O pavio é uma visita",
        corpo: `
O pavio superior longo diz um fato: o preço **esteve naquela região** e voltou para perto do corpo.

Interpretar isso como "rejeição" é uma hipótese — razoável, mas ainda uma hipótese. O mesmo formato pode aparecer:

- numa subida com força: pode ser apenas o alcance máximo do período, com o fechamento perto dele;
- numa queda: pode ser um teste de exaustão;
- numa região de suporte: pode ser o último retrocesso antes de o preço voltar a subir.

**Observação e interpretação são camadas diferentes.** Misturar as duas é onde a leitura vira superstição.
        `,
      },
      {
        titulo: "Sozinho, ele não decide nada",
        corpo: `
O pavio sozinho não diz:

- que o mercado vai cair;
- que a resistência está confirmada;
- que você deve vender.

O pavio + **região** + **tendência** + **sua regra** + **seu risco** é que podem formar uma evidência para uma decisão — se a sua regra permitir.
        `,
      },
    ],
    analogia:
      "Um pavio é como uma pegada na lama: ela prova que alguém passou por ali, não que vai voltar. A pegada em frente ao mercado diz uma coisa; a pegada no meio do mato, outra.",
    naPratica: {
      titulo: "Antes de tratar um pavio como rejeição",
      passos: [
        "Separe o fato (o preço esteve lá) da interpretação (houve rejeição).",
        "Pergunte em que região o pavio aconteceu.",
        "Pergunte se a tendência vinha perdendo força.",
        "Só então pergunte se a sua regra permite alguma ação — e qual o risco.",
      ],
    },
    missao: {
      titulo: "Confronte o pavio",
      situacao:
        "Depois de cinco candles seguidos de alta, um candle fecha com pavio superior longo, no fim da sessão, encostando numa região onde o preço já havia parado duas vezes.",
      pergunta: "O que o pavio superior pode representar?",
      opcoes: [
        {
          texto:
            "Compradores dominaram todo o período — se dominassem, o fechamento ficaria perto da máxima.",
          tom: "errada",
          feedback:
            "Não: se os compradores tivessem dominado, o fechamento ficaria próximo da máxima. O pavio conta outra história.",
        },
        {
          texto:
            "Houve rejeição daquela região — o preço esteve lá e não ficou; é uma hipótese que depende do contexto.",
          tom: "correta",
          feedback:
            "O pavio mostra que o preço esteve naquela região, mas sozinho não determina o que fazer. Rejeição é uma hipótese — depende do contexto para virar evidência.",
        },
        {
          texto: "Significa obrigatoriamente venda — padrão não é ordem.",
          tom: "errada",
          feedback:
            "Padrão não é ordem. O mesmo pavio pode ter leituras diferentes conforme a região e a regra pessoal.",
        },
        {
          texto:
            "Não é possível saber — parte é possível: o fato é que o preço esteve lá; a interpretação disso é que depende do contexto.",
          tom: "quase",
          feedback:
            "Quase: o fato (preço esteve lá e voltou) é observável. O que essa visita significa é que depende do contexto e da regra.",
        },
      ],
      termosExplicacao: ["pavio", "rejeição", "região"],
      aindaPratique:
        "Pegar o último gráfico que você viu e listar, separadamente, o que era fato e o que era interpretação.",
      transferencia: {
        titulo: "O pavio inferior no suporte",
        situacao:
          "Um ativo em queda encosta num suporte que já segurou o preço duas vezes. No candle do toque, o pavio inferior é longo e o fechamento vem acima da abertura.",
        pergunta: "O que é possível afirmar sobre esse período?",
        opcoes: [
          {
            texto:
              "O preço esteve naquela região de suporte e voltou — o que isso significa depende do contexto e da sua regra.",
            tom: "correta",
            feedback:
              "Correto: o fato é a visita ao suporte; o significado (força, exaustão, teste) depende do contexto e da regra.",
          },
          {
            texto:
              "A queda perdeu força no suporte — é uma hipótese razoável, mas ainda uma hipótese, não um fato.",
            tom: "quase",
            feedback:
              "Quase: é uma hipótese razoável de perda de força — mas hipótese a testar, não conclusão.",
          },
          {
            texto: "É uma ordem de compra — o padrão não decide por você.",
            tom: "errada",
            feedback: "Não: padrão não é ordem. Decisão exige regra e risco conhecido.",
          },
          {
            texto:
              "A mínima do período confirma a continuação da queda — o fechamento acima da abertura conta o contrário no período.",
            tom: "errada",
            feedback:
              "Não: o fechamento acima da abertura e o pavio inferior longo mostram disputa na região — não continuidade confirmada.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O que o pavio superior pode representar?",
        alternativas: [
          "Compradores dominaram todo o período",
          "Houve rejeição daquela região",
          "Significa obrigatoriamente venda",
          "Não é possível saber",
        ],
        correta: 1,
        explicacao:
          "O pavio mostra que o preço esteve naquela região, mas sozinho não determina o que fazer — rejeição é uma hipótese dependente de contexto.",
      },
      {
        pergunta: "Qual afirmação separa corretamente fato de interpretação?",
        alternativas: [
          "O fato é que o preço esteve na região do pavio; a rejeição é uma interpretação",
          "O fato é que haverá rejeição; a interpretação é que o preço subiu",
          "O pavio longo é um fato e a venda é uma interpretação óbvia",
          "Tudo num gráfico é interpretação",
        ],
        correta: 0,
        explicacao:
          "O alcance do preço é observável; o significado que você dá a ele é interpretação.",
      },
      {
        pergunta: "Um pavio superior longo na mesma região, em contextos diferentes...",
        alternativas: [
          "pode ter leituras diferentes — o contexto muda a interpretação",
          "tem sempre o mesmo significado",
          "é sempre um sinal de reversão",
          "invalida o gráfico",
        ],
        correta: 0,
        explicacao: "Padrão + contexto + regra + risco = evidência. Padrão sozinho não é sinal.",
      },
    ],
  },
  {
    slug: "forca-e-sequencia",
    ordem: 3,
    nivel: 1,
    titulo: "Lição 3 — Força e sequência",
    resumo: "Força não é a cor do candle: é o tamanho do corpo, a sequência e o contexto.",
    problema: {
      titulo: "Dois verdes e uma certeza",
      texto:
        "Dois candles de alta seguidos e Mariana já se sentia no direito de 'subir a aposta'. Mas o que ela estava chamando de força eram dois corpos curtos — disputa — num mercado parado. Força não é a cor do candle; é o tamanho do corpo, a sequência e o contexto.",
      pergunta: "Como reconhecer força (ou a falta dela) no gráfico?",
    },
    conceitos: [
      {
        titulo: "Magnitude: corpo longo ou disputa",
        corpo: `
A **magnitude** de um candle é a distância entre abertura e fechamento em relação ao tamanho dos períodos recentes.

- **Corpo longo** — um lado dominou o período; movimento decidido.
- **Corpo curto** — abertura e fechamento colados; o período foi uma disputa.

Magnitude é comparação: um corpo que é longo no gráfico de hoje pode ser curto se o mercado ficar mais agressivo amanhã.
        `,
      },
      {
        titulo: "Sequência: a série conta",
        corpo: `
Força não é um candle isolado. Observe a **sequência**:

- Vários corpos longos na mesma direção, com poucas correções → movimento sustentado.
- Corpos longos alternando direção → disputa, não direção.
- Corpos que vão encolhendo numa sequência → o movimento está perdendo força.

E o limite: mesmo uma sequência forte **não prevê** a próxima. Ela descreve o que está acontecendo — você ainda precisa de hipótese, regra e risco.
        `,
      },
    ],
    analogia:
      "Força é como um atleta: um dia de treino intenso é um corpo longo; dias seguidos de treino pesado são uma sequência. Treinar uma vez não é preparação — e nenhum treino garante a vitória da próxima.",
    naPratica: {
      titulo: "Lendo magnitude e sequência",
      passos: [
        "Meça o corpo do candle contra os últimos períodos (longo ou disputa?).",
        "Olhe os últimos 5 a 10 candles: há sequência ou alternância?",
        "Os corpos crescem ou encolhem ao longo da sequência?",
        "Escreva a observação sem previsão: o que está acontecendo, não o que 'vai' acontecer.",
      ],
    },
    missao: {
      titulo: "Interprete a sequência",
      situacao:
        "Você observa seis candles: três de alta com corpos longos e crescentes, um de baixa com corpo curto, e mais dois de alta com corpo longo. O preço avançou em degraus, sempre com corpos longos na direção do movimento.",
      pergunta: "Qual hipótese descreve melhor o que você está vendo?",
      opcoes: [
        {
          texto:
            "O movimento tem sustentação: corpos longos na direção, correção curta — hipótese de força que ainda precisa de regra e risco.",
          tom: "correta",
          feedback:
            "Correto: corpos longos alinhados com correção curta sustentam a hipótese de força. Ainda é hipótese — regra e risco vêm antes da decisão.",
        },
        {
          texto:
            "O movimento está perdendo força — mas os corpos estão crescendo, o oposto do encolhimento que indica perda de força.",
          tom: "quase",
          feedback:
            "Quase: os corpos crescem — o sinal de perda de força seria o encolhimento. A leitura aponta o contrário.",
        },
        {
          texto:
            "É garantia de que o próximo candle será de alta — nenhuma sequência prevê o próximo período.",
          tom: "errada",
          feedback:
            "Não: a sequência descreve o passado. O próximo período é incerto — por isso existe risco.",
        },
        {
          texto:
            "O mercado está em disputa — corpos longos e alinhados indicam domínio, não disputa.",
          tom: "errada",
          feedback:
            "Não: disputa é corpo curto. Corpos longos alinhados indicam domínio na direção.",
        },
      ],
      termosExplicacao: ["corpo", "sequência", "magnitude"],
      aindaPratique:
        "Encontrar no gráfico do seu ativo uma sequência de corpos longos e escrever o que ela descreve — sem prever o próximo candle.",
      transferencia: {
        titulo: "Corpos que encolhem",
        situacao:
          "Um ativo sobe por seis candles, mas os corpos de alta vão ficando cada vez menores — o último é quase um fio. O preço ainda está acima dos fechamentos anteriores.",
        pergunta: "O que a sequência sugere como hipótese?",
        opcoes: [
          {
            texto:
              "O movimento pode estar perdendo força — corpos que encolhem são uma hipótese a testar, não uma certeza.",
            tom: "correta",
            feedback:
              "Correto: encolhimento progressivo é leitura de perda de força — hipótese a verificar com regra e risco.",
          },
          {
            texto: "A subida continua forte — corpos encolhendo são o oposto de força crescente.",
            tom: "quase",
            feedback:
              "Quase: a continuação é possível, mas a leitura de magnitude aponta perda de força, não aceleração.",
          },
          {
            texto: "É o momento de vender — perda de força é hipótese, não ordem.",
            tom: "errada",
            feedback: "Não: observação não é ordem. Decisão exige regra, risco e simulação.",
          },
          {
            texto: "O próximo candle será de baixa — a sequência descreve o passado.",
            tom: "errada",
            feedback: "Não: a sequência descreve o que aconteceu; o futuro é hipótese incerta.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Um candle com corpo longo indica...",
        alternativas: [
          "que um lado dominou o período",
          "que o próximo período seguirá a mesma direção",
          "que o mercado está parado",
          "que a tendência mudou",
        ],
        correta: 0,
        explicacao:
          "Corpo longo = abertura e fechamento distantes = domínio no período. Não prevê o próximo.",
      },
      {
        pergunta: "Corpos que vão encolhendo numa sequência de alta sugerem...",
        alternativas: [
          "perda de força — uma hipótese a verificar",
          "aceleração do movimento",
          "que o mercado está em congestão",
          "nada, corpos não importam",
        ],
        correta: 0,
        explicacao:
          "Encolhimento progressivo é uma leitura de perda de força — hipótese, não certeza.",
      },
      {
        pergunta: "Por que uma sequência de corpos longos não é uma ordem de compra?",
        alternativas: [
          "porque a sequência descreve o que aconteceu, não o que vai acontecer",
          "porque corpos longos são raros",
          "porque sequência só vale no day trade",
          "porque o gráfico não importa para decisões",
        ],
        correta: 0,
        explicacao: "Observação alimenta hipótese; decisão exige regra e risco conhecido.",
      },
    ],
  },
  {
    slug: "congestao-e-expansao",
    ordem: 4,
    nivel: 1,
    titulo: "Lição 4 — Congestão e expansão",
    resumo: "Congestão é acumulação de decisões numa faixa — informação, nunca vazio.",
    problema: {
      titulo: "O mercado que ficou mudo",
      texto:
        "André passou uma tarde inteira vendo o preço andar de um lado para o outro num espaço apertado. 'Não está acontecendo nada', concluiu. Mas estava acontecendo muita coisa: o mercado estava se acumulando numa região — e essa região depois se mostrou importante.",
      pergunta: "O que significa quando o preço fica preso numa faixa?",
    },
    conceitos: [
      {
        titulo: "Regiões de congestão",
        corpo: `
**Congestão** é uma faixa onde o preço fica preso por vários períodos: corpos curtos, pavios dos dois lados, sem progressão.

O que ela é: uma **região de acordo** — compradores e vendedores aceitando preços parecidos, período após período.

O que ela não é: ausência de informação. Uma congestão longa e bem definida cria uma **região de referência** que o mercado costuma lembrar depois.
        `,
      },
      {
        titulo: "Expansão e contração",
        corpo: `
O preço alterna entre dois comportamentos:

- **Expansão** — corpos longos, direção definida, o preço sai da faixa.
- **Contração** — corpos curtos, disputa, o preço converge para uma faixa.

Uma congestão que encolhe (faixas cada vez menores) é uma hipótese de saída próxima — a energia acumulada tem que sair. Uma congestão que alarga é o preço buscando um novo acordo.

Ler congestão e expansão é ler **ritmo** — e ritmo não é sinal: é contexto para a sua hipótese.
        `,
      },
    ],
    analogia:
      "Congestão é um engarrafamento: ninguém anda, mas os carros estão todos ali, acumulados. Quando o trânsito solta, a avenida inteira anda de uma vez — a pergunta é para onde, e isso você decide com regra e risco.",
    naPratica: {
      titulo: "Lendo o ritmo",
      passos: [
        "Identifique a faixa: onde o preço andou de lado nas últimas horas ou dias.",
        "Descreva a congestão: longa, curta, encolhendo ou alargando?",
        "Identifique a expansão: quando o preço saiu da faixa, com que corpo?",
        "Use a faixa como região de referência — nunca como gatilho.",
      ],
    },
    missao: {
      titulo: "Observe o ritmo",
      situacao:
        "Um ativo passou a manhã preso entre R$ 10,00 e R$ 10,20, com corpos curtos e pavios dos dois lados. No fim da tarde, um candle de corpo longo fecha em R$ 10,40, fora da faixa, com os candles seguintes continuando longe dela.",
      pergunta: "O que aconteceu neste gráfico?",
      opcoes: [
        {
          texto:
            "O preço ficou em congestão pela manhã e depois expandiu, saindo da faixa — ritmo de contração seguido de expansão.",
          tom: "correta",
          feedback:
            "Correto: a manhã foi contração (faixa apertada) e a tarde expansão (corpo longo fora da faixa). O desfecho da expansão é hipótese.",
        },
        {
          texto:
            "A expansão indica que o preço vai continuar subindo — a expansão descreve o que aconteceu; a continuação é hipótese.",
          tom: "quase",
          feedback:
            "Quase: a expansão é o que aconteceu; a continuação é uma hipótese que precisa de regra e risco.",
        },
        {
          texto:
            "Nada aconteceu pela manhã — a congestão criou uma região de referência, que é informação.",
          tom: "errada",
          feedback:
            "Não: a congestão é informação — uma região de acordo que o mercado pode lembrar depois.",
        },
        {
          texto:
            "A congestão prova que o mercado estava vazio — congestão é acordo de preços, não ausência de participantes.",
          tom: "errada",
          feedback:
            "Não: congestão é acúmulo de decisões numa faixa — participação intensa, não vazio.",
        },
      ],
      termosExplicacao: ["congestão", "corpos curtos", "expansão"],
      aindaPratique:
        "Achar no seu ativo a última congestão e escrever onde ela começou e terminou — a faixa.",
      transferencia: {
        titulo: "A faixa que encolhe",
        situacao:
          "Você observa três faixas seguidas: o preço trava entre R$ 20,00 e R$ 20,40, depois entre R$ 20,20 e R$ 20,35, depois entre R$ 20,25 e R$ 20,30 — corpos cada vez mais curtos, faixas cada vez menores.",
        pergunta: "Qual hipótese o ritmo sugere?",
        opcoes: [
          {
            texto:
              "A contração está apertando — a energia acumulada tende a sair, mas para onde e quando é hipótese, não previsão.",
            tom: "correta",
            feedback:
              "Correto: faixas que encolhem acumulam energia. A saída é hipótese — direção e timing não são previsíveis.",
          },
          {
            texto:
              "O preço vai parar de se mover — contração costuma preceder expansão, não paralisia.",
            tom: "quase",
            feedback:
              "Quase: o padrão clássico é contração → expansão; a paralisia total contraria o ritmo.",
          },
          {
            texto: "É hora de comprar a faixa — ritmo não é gatilho.",
            tom: "errada",
            feedback: "Não: ritmo é contexto para a hipótese — nunca um gatilho de compra.",
          },
          {
            texto: "O mercado está distribuindo para cair — a faixa encolher não indica direção.",
            tom: "errada",
            feedback:
              "Não: contração não aponta direção. Energia acumulada pode sair para qualquer lado.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Uma região de congestão representa...",
        alternativas: [
          "uma faixa de acordo entre compradores e vendedores",
          "um mercado sem participantes",
          "uma ordem de compra",
          "o fim da tendência",
        ],
        correta: 0,
        explicacao: "Congestão é acumulação de decisões numa faixa — informação, não vazio.",
      },
      {
        pergunta: "Expansão se caracteriza por...",
        alternativas: [
          "corpos longos com direção definida",
          "corpos curtos alternando",
          "pavios dos dois lados iguais",
          "preço travado numa faixa",
        ],
        correta: 0,
        explicacao: "Expansão é o preço saindo da faixa com magnitude.",
      },
      {
        pergunta: "Faixas que vão encolhendo sucessivamente sugerem...",
        alternativas: [
          "acúmulo de energia — hipótese de saída",
          "que o mercado morreu",
          "que a direção é de queda",
          "que o volume sumiu",
        ],
        correta: 0,
        explicacao: "Contração que aperta é leitura de energia acumulada — o desfecho é hipótese.",
      },
    ],
  },
  {
    slug: "tendencia-e-lateralizacao",
    ordem: 5,
    nivel: 2,
    titulo: "Lição 5 — Tendência e lateralização",
    resumo: "Tendência é progressão de máximas e mínimas; lateralização é o preço sem progressão.",
    problema: {
      titulo: "A compra na queda que virou lateralização",
      texto:
        "Renato comprou porque 'estava caindo e ia voltar'. O preço não voltou: entrou num corredor estreito e ficou lá por semanas. Ele tinha lido uma queda como oportunidade — sem perguntar se havia tendência, lateralização ou transição. O gráfico responde à pergunta certa, se você fizer a pergunta certa.",
      pergunta: "Como distinguir tendência de lateralização?",
    },
    conceitos: [
      {
        titulo: "Tendência: progressão de máximas e mínimas",
        corpo: `
**Tendência de alta**: máximas crescentes **e** mínimas crescentes. Cada impulso supera o anterior, e as correções não devolvem o movimento.

**Tendência de baixa**: o oposto — mínimas e máximas decrescentes.

A tendência é formada por **impulsos** (movimento na direção) e **correções** (movimento contra, que não apaga o impulso). A pergunta não é "a cor de hoje"; é "as máximas e mínimas estão progredindo?"
        `,
      },
      {
        titulo: "Lateralização: o preço sem progressão",
        corpo: `
**Lateralização**: máximas e mínimas na mesma faixa, período após período. O preço se move — mas não progride.

O mesmo candle de alta pode significar coisas diferentes:

- dentro de uma tendência de alta: continuação plausível;
- no topo de uma lateralização: apenas mais um ciclo dentro da faixa;
- dentro de uma tendência de baixa: correção.

**Padrão não é sinal automático.** O contexto (tendência, região, sua regra) é que dá significado.

| Aspecto | Tendência | Lateralização |
|---|---|---|
| Máximas | crescentes ou decrescentes | na mesma faixa |
| Mínimas | acompanham as máximas | na mesma faixa |
| Impulso | progride | recicla |
| Leitura de um candle de alta | depende da tendência | mais um ciclo da faixa |
        `,
      },
    ],
    analogia:
      "Tendência é uma escada rolante: os degraus sempre avançam, mesmo quando alguém desce um degrau (correção). Lateralização é uma esteira: todo mundo anda, mas ninguém chega a lugar nenhum.",
    naPratica: {
      titulo: "Antes de chamar de tendência",
      passos: [
        "Marque as últimas máximas: elas progridem ou ficam na mesma faixa?",
        "Marque as últimas mínimas: acompanham?",
        "Classifique: tendência de alta, tendência de baixa ou lateralização?",
        "Depois é que você decide se a sua regra permite alguma coisa.",
      ],
    },
    missao: {
      titulo: "Interprete a estrutura",
      situacao:
        "Você observa um gráfico: máximas crescentes, mínimas crescentes, correções curtas que não devolvem o impulso anterior. No meio da sequência, um candle de baixa com corpo curto aparece num dia de corpos pequenos.",
      pergunta: "Qual descrição é a mais coerente com o que você está vendo?",
      opcoes: [
        {
          texto:
            "Tendência de alta com correção de baixa intensidade — máximas e mínimas progredindo, o candle de baixa é um ruído dentro da progressão.",
          tom: "correta",
          feedback:
            "Correto: a estrutura (máximas e mínimas crescentes) define a tendência; um corpo curto isolado não muda a estrutura.",
        },
        {
          texto:
            "A tendência acabou por causa do candle de baixa — um corpo curto não apaga a progressão das máximas e mínimas.",
          tom: "quase",
          feedback:
            "Quase: o candle de baixa é ruído; a progressão das máximas e mínimas continua valendo.",
        },
        {
          texto: "Lateralização — máximas e mínimas crescentes são o oposto de uma faixa.",
          tom: "errada",
          feedback:
            "Não: lateralização exige máximas e mínimas na mesma faixa — aqui elas progridem.",
        },
        {
          texto: "Tendência de baixa — o candle de baixa isolado não define a estrutura.",
          tom: "errada",
          feedback: "Não: a estrutura é de máximas e mínimas crescentes — tendência de alta.",
        },
      ],
      termosExplicacao: ["tendência", "lateralização", "máximas e mínimas"],
      aindaPratique:
        "Classificar o último gráfico que você viu em tendência de alta, tendência de baixa ou lateralização — e anotar o porquê.",
      transferencia: {
        titulo: "A faixa depois da tendência",
        situacao:
          "Um ativo subiu por semanas, sempre com máximas crescentes. Nas últimas três semanas, as máximas param de subir e o preço passa a oscilar entre R$ 30,00 e R$ 32,00, com corpos alternados.",
        pergunta: "O que mudou na estrutura?",
        opcoes: [
          {
            texto:
              "A tendência deu lugar a uma lateralização — as máximas pararam de progredir; a faixa é a nova região de referência.",
            tom: "correta",
            feedback:
              "Correto: sem progressão de máximas, a estrutura virou lateralização — a faixa passa a ser a referência.",
          },
          {
            texto:
              "A tendência de alta continua — máximas que param de subir não são mais progressão.",
            tom: "quase",
            feedback:
              "Quase: a progressão parou; continuar chamando de tendência é ignorar a estrutura.",
          },
          {
            texto: "É uma ordem de venda — a lateralização não é sinal de venda.",
            tom: "errada",
            feedback: "Não: lateralização é contexto, não gatilho de venda.",
          },
          {
            texto: "Nada mudou — a faixa de R$ 2,00 é um detalhe sem informação.",
            tom: "errada",
            feedback: "Não: a faixa é a nova região de referência — informação central do período.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O que caracteriza uma tendência de alta?",
        alternativas: [
          "máximas e mínimas crescentes",
          "máximas crescentes e mínimas na mesma faixa",
          "apenas candles de alta",
          "preço subindo num único dia",
        ],
        correta: 0,
        explicacao: "Tendência exige progressão das duas: máximas E mínimas.",
      },
      {
        pergunta: "Um candle de alta dentro de uma lateralização...",
        alternativas: [
          "pode ser apenas mais um ciclo da faixa",
          "é sempre o começo de uma tendência",
          "invalida a lateralização",
          "significa que a faixa acabou",
        ],
        correta: 0,
        explicacao:
          "O mesmo padrão muda de significado com o contexto — padrão não é sinal automático.",
      },
      {
        pergunta: "Correção em uma tendência é...",
        alternativas: [
          "movimento contra a tendência que não apaga o impulso anterior",
          "sinal de que a tendência acabou",
          "o mesmo que lateralização",
          "uma ordem para reduzir a posição",
        ],
        correta: 0,
        explicacao:
          "Impulso + correção formam a progressão; a correção é parte do movimento, não seu fim.",
      },
    ],
  },
  {
    slug: "suporte-resistencia-e-rompimento",
    ordem: 6,
    nivel: 2,
    titulo: "Lição 6 — Suporte, resistência e rompimento",
    resumo: "Regiões onde o preço parou antes — e o checklist que separa rompimento de armadilha.",
    problema: {
      titulo: "O rompimento que virou armadilha",
      texto:
        "O preço rompeu a resistência e Rafael comprou na hora, sem fazer nenhuma pergunta. O preço subiu três ticks e voltou para dentro da região. Ele não tinha observado o volume, não tinha regra para rompimentos e não tinha definido o risco se falhasse. O rompimento não era mentira — a leitura dele é que estava incompleta.",
      pergunta: "O que separa um rompimento de um falso rompimento?",
    },
    conceitos: [
      {
        titulo: "Suporte e resistência: regiões de memória",
        corpo: `
**Suporte**: região onde o preço parou de cair antes — compradores apareceram lá. **Resistência**: região onde o preço parou de subir antes — vendedores apareceram lá.

São **regiões**, não linhas de tinta: quanto mais toques e quanto mais tempo o preço passou lá, mais relevante a região tende a ser.

Suporte e resistência não preveem nada: são **regiões de referência** — lugares onde o mercado já mostrou comportamento.
        `,
      },
      {
        titulo: "Rompimento: continuação ou teste?",
        corpo: `
O rompimento atravessa a região. O que separa as leituras:

- **Com aumento de volume**: mais participantes empurrando — hipótese de continuação mais forte.
- **Sem volume**: o preço atravessou, mas sem participação — hipótese de teste.
- **Retorno à região**: o preço rompe, não continua e volta — **falso rompimento** (perda de força), o risco mais caro de ignorar.

O fluxo antes de qualquer decisão com rompimento:

1. Contexto — qual região e ela era consolidada?
2. Observação — houve aumento de volume?
3. Hipótese — continuação ou teste?
4. Regra — minha regra permite operar rompimentos?
5. Risco — o que acontece se falhar?
6. Simular — o cenário contrário está dimensionado?
7. Registrar — a tese está escrita antes do gatilho?
        `,
      },
    ],
    analogia:
      "Rompimento é como atravessar uma porta que estava trancada: se ela destrancou de vez (volume), a passagem é real; se foi só o vento (sem volume), a porta volta a fechar no seu dedo. A pergunta nunca é 'a porta abriu?' — é 'ela vai continuar aberta?'.",
    naPratica: {
      titulo: "Checklist do rompimento",
      passos: [
        "Desenhe a região: quantos toques? quanto tempo?",
        "Observe o volume no candle do rompimento: aumentou?",
        "Confronte a sua regra: ela permite essa operação?",
        "Defina o risco se o preço voltar para a região — antes do gatilho.",
      ],
    },
    missao: {
      titulo: "Confronte o rompimento",
      situacao:
        "O preço rompe uma resistência de três toques com um candle de corpo longo, e o volume dobra em relação aos períodos anteriores. Sua regra pessoal só permite operar rompimentos com volume e com risco de retorno definido. O preço ainda está 0,5% acima da região.",
      pergunta: "O que o seu processo manda fazer antes de qualquer coisa?",
      opcoes: [
        {
          texto:
            "Confrontar a regra: volume dobrou e o risco de retorno é definível — se a regra permite, simular e registrar a tese antes do gatilho.",
          tom: "correta",
          feedback:
            "Correto: o processo vem antes do gatilho — observar, confrontar a regra, dimensionar o risco e registrar a tese.",
        },
        {
          texto:
            "Comprar imediatamente — o rompimento com volume é uma condição, não uma ordem; o processo vem antes.",
          tom: "quase",
          feedback:
            "Quase: as condições favoráveis existem, mas comprar sem concluir o processo (regra, risco, registro) é pular o ciclo.",
        },
        {
          texto:
            "Ignorar, porque rompimento é sempre armadilha — a observação (volume + região consolidada) não é ignorável.",
          tom: "errada",
          feedback:
            "Não: ignorar uma observação válida é outro erro — o processo existe para avaliar, não para negar.",
        },
        {
          texto:
            "Vender a região — rompimento com volume é hipótese de continuação, não de reversão.",
          tom: "errada",
          feedback:
            "Não: a hipótese mais razoável com volume é continuação — vender contraria a própria observação.",
        },
      ],
      termosExplicacao: ["volume", "regra", "risco"],
      aindaPratique:
        "Encontrar um rompimento no seu ativo e responder às sete perguntas do checklist antes de decidir qualquer coisa.",
      transferencia: {
        titulo: "O rompimento sem volume",
        situacao:
          "O preço atravessa um suporte antigo num pregão de volume baixo, sem aumentar a participação, e no dia seguinte volta para cima da região. Você estava de fora.",
        pergunta: "O que a leitura do conjunto sugere?",
        opcoes: [
          {
            texto:
              "Falso rompimento provável — atravessou sem volume e retornou; a região continua sendo a referência.",
            tom: "correta",
            feedback:
              "Correto: atravessar sem volume e voltar é o roteiro do falso rompimento — a região permanece de referência.",
          },
          {
            texto: "A queda vai continuar — o retorno para a região contradiz a continuação.",
            tom: "quase",
            feedback:
              "Quase: o retorno indica perda de força — a continuação perdeu a principal evidência.",
          },
          {
            texto: "É hora de comprar o retorno — o retorno à região não é sinal de compra.",
            tom: "errada",
            feedback: "Não: o retorno é observação de perda de força — não um gatilho de compra.",
          },
          {
            texto:
              "O suporte deixou de existir — regiões continuam sendo regiões depois de um teste falho.",
            tom: "errada",
            feedback:
              "Não: a região sobrevive ao teste — foi visitada e rejeitada por falta de força.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O que fortalece a hipótese de que um rompimento é real?",
        alternativas: [
          "aumento de volume no rompimento",
          "um único candle curto atravessando",
          "o preço voltando para a região",
          "nenhum toque anterior na região",
        ],
        correta: 0,
        explicacao: "Volume é participação: sem ela, o atravessar é um teste, não uma continuação.",
      },
      {
        pergunta: "Um falso rompimento é...",
        alternativas: [
          "o preço atravessa a região, não continua e retorna",
          "o preço atravessa a região com volume e segue",
          "o preço para antes da região",
          "o preço encosta na região sem atravessar",
        ],
        correta: 0,
        explicacao: "Falso rompimento = atravessou + não continuou + voltou (perda de força).",
      },
      {
        pergunta: "Suporte e resistência são...",
        alternativas: [
          "regiões de referência onde o mercado mostrou comportamento",
          "linhas que preveem o futuro",
          "ordens automáticas de compra e venda",
          "o mesmo que médias móveis",
        ],
        correta: 0,
        explicacao:
          "São memória de comportamento — contexto para a hipótese, nunca gatilho sozinho.",
      },
    ],
  },
  {
    slug: "medias-moveis",
    ordem: 7,
    nivel: 2,
    titulo: "Lição 7 — Médias móveis: a memória recente do preço",
    resumo:
      "MM9, MM20 e MM200 resumem o passado recente do preço — e só isso. Cruzamento é observação, não ordem.",
    problema: {
      titulo: "A linha que virou oráculo",
      texto:
        "Lucas colocou uma média de 200 períodos no gráfico e passou a tratar qualquer cruzamento como sinal. Comprou quando o preço cruzou a média acima, vendeu quando cruzou de volta. Perdeu nas duas vezes: o mercado estava lateral. A média não estava errada — ele é que pediu a ela algo que ela não faz: prever.",
      pergunta: "O que uma média móvel pode fazer — e o que ela não pode?",
    },
    conceitos: [
      {
        titulo: "O que a média calcula",
        corpo: `
Uma **média móvel** (MM) é a média aritmética dos fechamentos das últimas N velas. Ela resume o passado recente — e contém **zero** informação sobre o próximo fechamento.

A escolha do período muda a régua:

| Aspecto | MM9 | MM20 | MM200 |
|---|---|---|---|
| O que resume | o trecho mais recente | as últimas semanas | a memória longa |
| Velocidade de reação | rápida | média | lenta |
| Sensibilidade a ruído | alta | média | baixa |

Quanto menor o período, mais perto do preço a média anda — e mais vezes ela é atravessada sem significado.
        `,
      },
      {
        titulo: "Cruzamento é registro, não ordem",
        corpo: `
Quando o **fechamento** fica acima da média, o preço recente está acima do preço médio recente — uma descrição de força relativa. Quando a MM9 cruza a MM20, o curto prazo ficou mais forte que o médio prazo — também é registro.

Em **tendência**, esses fatos costumam se sustentar. Em **lateralização**, eles vão e voltam (**whiplash**): cruza para cima, cruza para baixo, sem que nada tenha mudado de verdade.

A leitura completa junta o indicador ao **regime**: média acompanhando tendência = contexto de continuidade possível; média em congestão = ruído. O indicador nunca decide sozinho — ele descreve, o contexto interpreta e a regra autoriza.
        `,
      },
    ],
    analogia:
      "Uma média móvel é a média das suas notas no trimestre: ela resume o que você já fez — não diz quanto você vai tirar na próxima prova.",
    naPratica: {
      titulo: "Ler a média sem pedir previsão",
      passos: [
        "Abra o gráfico do seu ativo e desenhe MM9, MM20 e MM200.",
        "Escreva um fato: os fechamentos estão acima ou abaixo de cada média?",
        "Escreva a interpretação: em que regime esse fato se sustenta?",
        "Compare com o cruzamento anterior: o mesmo evento já aconteceu sem continuação?",
      ],
    },
    missao: {
      titulo: "Interprete o cruzamento",
      situacao:
        "O WIN (130.000 pontos) negocia há um mês entre 128.000 e 132.000. Hoje a MM9 cruzou a MM20 para cima pela quarta vez no período, e o preço fechou 50 pontos acima dela. Você está escrevendo seu processo antes de pensar em operar.",
      pergunta: "O que a média descreve nesse contexto?",
      opcoes: [
        {
          texto:
            "Cruzamento numa faixa lateral já aconteceu três vezes sem continuação — o fato atual é o mesmo registro, sem força nova descrita.",
          tom: "correta",
          feedback:
            "Correto: o indicador descreve o mesmo tipo de evento que falhou três vezes; o regime lateral é o contexto que muda a interpretação.",
        },
        {
          texto:
            "O cruzamento indica o começo de uma tendência — em faixa lateral, cruzamento roda sem virar tendência; é registro, não início.",
          tom: "quase",
          feedback:
            "Quase: o cruzamento descreve força curta recente, mas numa faixa isso já se repetiu sem virar movimento.",
        },
        {
          texto:
            "É ordem de compra — indicador descreve, nunca ordena; confronte o registro com o regime e com a sua regra.",
          tom: "errada",
          feedback:
            "Não: o cruzamento é observação; decisão exige contexto, regra pessoal e risco dimensionado.",
        },
        {
          texto:
            "A média está errada porque não previu os cruzamentos anteriores — a média resume; exigir previsão dela é o erro de leitura.",
          tom: "errada",
          feedback:
            "Não: a média nunca prometeu previsão — ela é um resumo do passado, e o erro está em quem pede o futuro.",
        },
      ],
      termosExplicacao: ["média", "MM9", "cruzamento", "regime"],
      aindaPratique:
        "Comparar, no seu ativo, como MM9 e MM200 se comportam em tendência e em lateralização — só no papel, só observando.",
      transferencia: {
        titulo: "A MM200 em tendência",
        situacao:
          "Em outro ativo, o preço vem fazendo máximas e mínimas crescentes há dois meses e a MM200 acompanha a alta sem ser cruzada. Uma correção trouxe o preço até a média, sem atravessá-la.",
        pergunta: "O que a leitura do conjunto sugere?",
        opcoes: [
          {
            texto:
              "A média descreve a memória longa do movimento — o toque sem cruzar é observação de sustentação, contexto para a hipótese.",
            tom: "correta",
            feedback:
              "Correto: tendência + MM longa inclinada na mesma direção = contexto de continuação possível; o toque é região de referência.",
          },
          {
            texto:
              "O toque na média é a prova de que a correção acabou — toque registra onde o preço encontrou atividade, não garante a virada.",
            tom: "quase",
            feedback:
              "Quase: o toque é registro relevante, mas a virada é hipótese — depende de volume, regime e regra.",
          },
          {
            texto:
              "Agora é hora de vender — o toque em média dentro de tendência é observação, não ordem de reversão.",
            tom: "errada",
            feedback:
              "Não: vender por um toque em média contraria a própria observação — o conjunto continua descrevendo tendência.",
          },
          {
            texto:
              "A média prevê que o preço vai voltar a subir — médias descrevem o passado; previsão é hipótese com regra e risco.",
            tom: "errada",
            feedback:
              "Não: a média não prevê; quem transforma média em previsão está lendo o segundo tempo de uma partida já encerrada.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O que uma média móvel descreve?",
        alternativas: [
          "a média dos últimos fechamentos — um resumo do passado",
          "o preço que vai fechar no próximo período",
          "o volume negociado no período",
          "a direção recomendada pelo mercado",
        ],
        correta: 0,
        explicacao: "Média aritmética dos fechamentos das últimas N velas: resumo, nunca previsão.",
      },
      {
        pergunta: "Cruzamento de MM9 e MM20 em mercado lateral...",
        alternativas: [
          "tende a se repetir sem continuação (whiplash)",
          "é sempre o início de uma tendência",
          "invalida a lateralização",
          "é ordem de saída",
        ],
        correta: 0,
        explicacao:
          "Sem regime de tendência, o cruzamento vai e volta — o registro se repete sem nova informação.",
      },
      {
        pergunta: "MM200 inclinada para cima em tendência de alta descreve...",
        alternativas: [
          "memória longa sustentando o movimento — contexto, não gatilho",
          "que a alta vai continuar para sempre",
          "uma ordem de compra na média",
          "que o mercado está parado",
        ],
        correta: 0,
        explicacao:
          "A média longa acompanhando o movimento é contexto de sustentação — evidência se completa com regime, regra e risco.",
      },
    ],
    exercicios: [
      {
        titulo: "Fato e interpretação",
        enunciado:
          "No ativo X, o fechamento está 0,3% acima da MM200 num mercado lateral de dois meses. Escreva o fato (o que a média mostra) e a interpretação possível (o que isso significa no regime).",
        gabarito:
          "Fato: fechamento acima da média longa. Interpretação: em mercado lateral, toques acima da MM200 são registros que já se repetiram; a interpretação depende do volume e da sua regra — a média sozinha não sustenta hipótese.",
      },
    ],
  },
  {
    slug: "vwap",
    ordem: 8,
    nivel: 2,
    titulo: "Lição 8 — VWAP: a referência média da sessão",
    resumo:
      "O preço médio ponderado pelo volume mostra onde a sessão negocia em média — acima ou abaixo dele é contexto, não sinal.",
    problema: {
      titulo: "A sessão que esqueceu o próprio preço médio",
      texto:
        "Marina viu o preço 'acima do VWAP' e segurou a posição a tarde inteira achando que o mercado estava forte. O VWAP subiu junto com o preço e ela não percebeu que a distância ficava pequena. O que ela usou de âncora não era uma opinião do mercado — era a média do que a própria sessão tinha negociado, recalculada a cada minuto.",
      pergunta: "O que significa dizer que o preço está acima do VWAP?",
    },
    conceitos: [
      {
        titulo: "Como o VWAP é calculado",
        corpo: `
O VWAP soma (preço × volume) de cada negócio da sessão e divide pelo volume total: é o **preço médio ponderado por participação**.

- Negócios **pesados** puxam mais a referência — volume grande pesa mais que preço sozinho.
- O VWAP **começa do zero a cada dia**: é a referência da sessão atual.

O VWAP não transita entre dias: se ontem o mercado fechou em um nível e hoje abriu em outro, o VWAP de hoje nasce do pregão de hoje.
        `,
      },
      {
        titulo: "Acima e abaixo: o que isso registra",
        corpo: `
Preço **acima do VWAP**: a sessão negocia, em média, acima do preço médio ponderado — quem comprou na referência está no azul hoje (força relativa do dia).

Preço **abaixo do VWAP**: o inverso — a sessão média está no vermelho.

| Relação com o VWAP | O que registra | O que não registra |
|---|---|---|
| Preço acima | sessão negociada, em média, acima da referência | continuação garantida |
| Preço abaixo | sessão negociada, em média, abaixo da referência | reversão garantida |
| Preço colado | sessão transacionando na própria média | quem vai sair na frente |

O que o lado não diz: quem vence o resto do dia. Ajustes institucionais carregam o preço para os dois lados sem intenção direcional — e o VWAP se move com o preço: a **distância** importa mais que o lado. Em regiões consolidadas, o VWAP vira referência da sessão: observe o que o preço faz nos dois lados dela.
        `,
      },
    ],
    analogia:
      "O VWAP é a nota média da turma até agora: mostra como a turma está, não a nota da sua próxima prova — e ela muda a cada prova nova (a cada negócio).",
    naPratica: {
      titulo: "Ler o VWAP em três perguntas",
      passos: [
        "Abra o gráfico intradiário com o VWAP e note onde o preço está em relação a ele.",
        "Meça a distância: o preço está colado ou afastado da referência?",
        "Confira o volume: a sessão participa do movimento ou o preço andou sozinho?",
        "Escreva o fato e a interpretação antes de qualquer hipótese.",
      ],
    },
    missao: {
      titulo: "Interprete a distância",
      situacao:
        "Numa sessão de volume baixo, o WIN sobe 300 pontos e encosta no VWAP vindo de baixo. O volume do movimento é fraco, e metade do pregão ainda não passou. Você só observa.",
      pergunta: "O que a leitura do conjunto descreve?",
      opcoes: [
        {
          texto:
            "O preço alcançou a referência média da sessão — sem volume, é mais um registro de aproximação do que de força; o dia ainda tem metade pela frente.",
          tom: "correta",
          feedback:
            "Correto: VWAP é referência da sessão; aproximação com volume fraco descreve teste da referência, não continuação.",
        },
        {
          texto:
            "A alta é forte porque o preço andou — movimento sem volume descreve pouca participação; a distância importa mais que o lado.",
          tom: "quase",
          feedback:
            "Quase: o andar sem volume é observação de pouca participação — falta a força que sustentaria a leitura.",
        },
        {
          texto:
            "É hora de comprar a cruzada do VWAP — cruzamento de indicador é registro, nunca ordem; confronte volume, regime e regra.",
          tom: "errada",
          feedback:
            "Não: indicador descreve; decisão exige contexto, regra e risco — o processo vem antes do gatilho.",
        },
        {
          texto:
            "O VWAP previu que o preço ia subir — o VWAP é a média da sessão; ele não prevê nada.",
          tom: "errada",
          feedback:
            "Não: pedir previsão ao VWAP é confundir registro com oráculo — o indicador só descreve onde a sessão está.",
        },
      ],
      termosExplicacao: ["VWAP", "volume", "referência"],
      aindaPratique:
        "Numa sessão ao vivo, anotar três horários com a posição do preço em relação ao VWAP e a distância — só observação, sem decisão.",
      transferencia: {
        titulo: "O preço colado",
        situacao:
          "O WDO passa a tarde inteira alternando 5 pontos para os dois lados, sempre em cima do VWAP, com volume constante e baixo. O mercado não escolheu lado.",
        pergunta: "O que a leitura sugere?",
        opcoes: [
          {
            texto:
              "A sessão transaciona na própria referência média — preço colado no VWAP com volume constante é observação de equilíbrio, contexto de mercado sem escolha.",
            tom: "correta",
            feedback:
              "Correto: preço colado no VWAP com volume constante = sessão equilibrada; leitura de equilíbrio, não de força.",
          },
          {
            texto:
              "É o momento de operar a volta do VWAP — equilíbrio é contexto, não gatilho; espere a sessão mostrar direção com volume.",
            tom: "quase",
            feedback:
              "Quase: a congestão sobre o VWAP é contexto rico — mas contexto não opera; regra e risco sim.",
          },
          {
            texto:
              "A lateralidade é sinal de venda — equilíbrio em cima da referência não é observação de queda.",
            tom: "errada",
            feedback:
              "Não: equilíbrio não aponta direção — ler venda onde há equilíbrio é inventar informação.",
          },
          {
            texto:
              "O VWAP está errado porque o preço não afastou — o preço colado é justamente o que o VWAP registra; não há erro no indicador.",
            tom: "errada",
            feedback:
              "Não: o indicador descreve a sessão — e a sessão está exatamente colada na própria média.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O VWAP é...",
        alternativas: [
          "o preço médio ponderado pelo volume da sessão",
          "o preço de fechamento do pregão anterior",
          "a média dos últimos 200 pregões",
          "uma linha de suporte mágica",
        ],
        correta: 0,
        explicacao: "Σ(preço × volume) ÷ Σ(volume) da sessão atual — começa do zero todo dia.",
      },
      {
        pergunta: "Preço acima do VWAP com volume forte descreve...",
        alternativas: [
          "a sessão negociando, em média, acima da referência com participação — contexto de força relativa",
          "que o restante do dia vai continuar subindo",
          "uma ordem de compra",
          "que os vendedores desapareceram",
        ],
        correta: 0,
        explicacao:
          "É registro de força relativa da sessão — hipótese possível, nunca garantia ou ordem.",
      },
      {
        pergunta: "Aproximação do preço ao VWAP com volume fraco...",
        alternativas: [
          "registra pouco apoio — teste da referência sem participação",
          "confirma a continuação da alta",
          "invalida o VWAP",
          "é motivo para vender",
        ],
        correta: 0,
        explicacao:
          "Sem volume, a aproximação descreve teste — a referência continua sendo referência.",
      },
    ],
    exercicios: [
      {
        titulo: "VWAP em reais",
        enunciado:
          "No WDO, o VWAP está em 5.412 e o preço em 5.424, com volume comum. Descreva o fato e a interpretação possível em uma frase cada.",
        gabarito:
          "Fato: o preço negocia 12 pontos acima do preço médio ponderado da sessão. Interpretação: a sessão está no azul em relação à própria referência — força relativa do dia, que vira hipótese só com regime, regra e risco.",
      },
    ],
  },
  {
    slug: "fibonacci",
    ordem: 9,
    nivel: 2,
    titulo: "Lição 9 — Retrações de Fibonacci: onde o movimento deixou marcas",
    resumo:
      "Frações de um movimento medido viram regiões de referência — o desenho depende do movimento que você escolhe medir.",
    problema: {
      titulo: "O nível que ninguém mediu do mesmo jeito",
      texto:
        "Dois operadores desenharam Fibonacci no mesmo gráfico: um mediu do fundo de junho ao topo de julho, o outro do fundo de julho ao topo de agosto. Cada um viu o seu 61,8% em um lugar diferente. Os dois esperavam o preço respeitar o nível — e nenhum dos dois tinha definido o que observaria se o preço atravessasse.",
      pergunta: "Por que os dois 61,8% estavam em lugares diferentes?",
    },
    conceitos: [
      {
        titulo: "Medir o movimento primeiro",
        corpo: `
Retrações de Fibonacci são frações de um **movimento medido**: 23,6%, 38,2%, 50% e 61,8% de volta de um swing (por exemplo, do mínimo ao máximo).

O desenho depende de **quem você mede**: swings diferentes geram níveis diferentes no mesmo gráfico. Uma retração de 50% do movimento A pode ser 38,2% do movimento B.

Por isso o indicador não é mágico: ele só ganha sentido com uma **escolha declarada** do movimento — e com a história de toques da região. Desenhar sem declarar a régua vira ruído com aparência de geometria.
        `,
      },
      {
        titulo: "Retração é região de referência",
        corpo: `
Quando o preço retrai um movimento, ele pode cruzar com **quem participou dele**: compradores da base segurando acima do fundo, vendedores do topo aceitando retornos mais favoráveis.

O valor pedagógico está nas **regiões**:

| Nível de retração | O que descreve | Pergunta para a observação |
|---|---|---|
| 23,6% | retração rasa | o impulso segue sem desaparecer? |
| 38,2% | retração média | os compradores do fundo seguem ativos? |
| 50% | metade do movimento | o mercado devolve metade do que andou? |
| 61,8% | retração profunda | quem entrou no topo segura a região? |

O que o preço faz nesses níveis é observação — e só vira hipótese com contexto (regime, volume, história de toques).
        `,
      },
      {
        titulo: "Indicador é contexto, nunca gatilho",
        corpo: `
Os três indicadores da camada seguem a mesma arquitetura: calculam um **fato**, dependem de **contexto** e terminam numa **evidência** — nunca num sinal.

- **Médias móveis**: descrevem a memória recente do preço.
- **VWAP**: descreve a referência média da sessão.
- **Fibonacci**: descreve regiões de retração de um movimento medido.

Qualquer um deles citado sozinho ("o preço tocou 61,8%" ou "a MM9 cruzou") é observação incompleta: falta o contexto, a regra pessoal e o risco. A evidência completa é padrão/indicador + contexto + regra + risco.
        `,
      },
    ],
    analogia:
      "Retrações de Fibonacci são as marcas de pneu de uma estrada: mostram por onde os carros passaram e onde eles frearam — não dizem para onde o próximo carro vai.",
    naPratica: {
      titulo: "Desenhar sem se enganar",
      passos: [
        "Escolha e declare o movimento que vai medir (fundo → topo ou topo → fundo).",
        "Desenhe 38,2%, 50% e 61,8% e anote os preços dos três níveis.",
        "Antes de observar toques, escreva o que você observaria se o preço atravessar cada nível.",
        "Confronte com a sua regra e o seu risco — níveis não são ordem.",
      ],
    },
    missao: {
      titulo: "Confronte o nível",
      situacao:
        "O PETR4 subiu de R$ 30,00 para R$ 36,00 em três semanas e agora recua. Você mediu o movimento e o preço acabou de tocar os 61,8% (R$ 32,29) num pregão de volume baixo. Nenhuma das suas regras menciona Fibonacci.",
      pergunta: "O que o processo manda fazer com esse toque?",
      opcoes: [
        {
          texto:
            "Registrar o toque como observação e confrontar a própria regra: sem regra que use Fibonacci, o nível é contexto, não condição de entrada.",
          tom: "correta",
          feedback:
            "Correto: o nível é região de referência; sem regra pessoal que o use, a observação alimenta o contexto — não autoriza nada.",
        },
        {
          texto:
            "Considerar o toque uma entrada automática — nível não é ordem; a regra pessoal decide se essa observação vira condição.",
          tom: "quase",
          feedback:
            "Quase: a observação está registrada, mas transformá-la em entrada exige regra própria — que você ainda não tem.",
        },
        {
          texto:
            "Vender porque o preço rejeitou o nível — rejeição em um nível é leitura possível, não ordem; exige contexto e regra.",
          tom: "errada",
          feedback:
            "Não: rejeição em nível descreve onde o preço parou — é observação, não autorização para operar.",
        },
        {
          texto:
            "Ignorar o gráfico todo — a retração de um movimento consolidado é informação; ignorar também é decidir sem processo.",
          tom: "errada",
          feedback:
            "Não: descartar observação válida é pular o ciclo — o processo existe para avaliar, não para negar.",
        },
      ],
      termosExplicacao: ["Fibonacci", "retração", "61,8", "regra"],
      aindaPratique:
        "Medir um movimento real do seu ativo, anotar os três níveis e acompanhar por uma semana só observando os toques.",
      transferencia: {
        titulo: "O mesmo gráfico, dois desenhos",
        situacao:
          "Você e outro operador desenham Fibonacci no mesmo gráfico e discordam sobre onde está o 50%. Os dois esperam o preço parar no seu nível.",
        pergunta: "O que essa discordância mostra?",
        opcoes: [
          {
            texto:
              "O desenho depende do movimento medido — a discordância é esperada; o processo exige declarar o movimento antes de desenhar.",
            tom: "correta",
            feedback:
              "Correto: o indicador não é objetivo — a escolha do swing é a escolha da régua; declará-la é parte do registro.",
          },
          {
            texto:
              "Um dos dois está errado — com réguas diferentes os dois podem estar certos; o problema é tratar nível como fato universal.",
            tom: "quase",
            feedback:
              "Quase: a régua é uma escolha declarada, não um fato — a discordância não torna nenhum dos dois 'errado'.",
          },
          {
            texto:
              "O indicador funciona: um dos níveis vai segurar — retração não prevê; regiões são referência, não previsão.",
            tom: "errada",
            feedback:
              "Não: esperar que um nível 'segure' é pedir previsão ao indicador — ele só marca regiões.",
          },
          {
            texto:
              "É hora de operar os dois níveis — operar níveis conflitantes sem regra é adivinhar duas vezes.",
            tom: "errada",
            feedback:
              "Não: sem regra pessoal, os dois níveis são só observação — operar neles é pular o processo.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Retrações de Fibonacci são...",
        alternativas: [
          "frações de um movimento medido — regiões de referência",
          "linhas que preveem o futuro",
          "médias de preço ponderadas por volume",
          "ordens automáticas de entrada",
        ],
        correta: 0,
        explicacao:
          "Frações (23,6% / 38,2% / 50% / 61,8%) de um swing escolhido por você — regiões, nunca previsão.",
      },
      {
        pergunta: "O mesmo gráfico pode gerar retrações diferentes porque...",
        alternativas: [
          "o desenho depende do movimento que você escolhe medir",
          "o gráfico muda de preço sozinho",
          "o indicador é aleatório",
          "existe apenas um nível correto",
        ],
        correta: 0,
        explicacao: "Swings diferentes → réguas diferentes. Declarar a régua é parte do processo.",
      },
      {
        pergunta: "Um toque em 61,8% de um movimento consolidado...",
        alternativas: [
          "é observação de uma região de referência — contexto para a hipótese",
          "é uma ordem de compra",
          "garante que o preço vai parar ali",
          "invalida a tendência anterior",
        ],
        correta: 0,
        explicacao:
          "O toque registra onde o preço encontrou atividade; a leitura completa junta contexto, regra e risco.",
      },
    ],
    exercicios: [
      {
        titulo: "A régua declarada",
        enunciado:
          "O ativo fez um fundo em R$ 40,00 e um topo em R$ 50,00. Calcule os preços de 38,2%, 50% e 61,8% de retração desse movimento.",
        gabarito:
          "Faixa do movimento = R$ 10,00. 61,8% → 50 − 6,18 = R$ 43,82; 50% → R$ 45,00; 38,2% → 50 − 3,82 = R$ 46,18. Os níveis são regiões: o que o preço fizer neles é a observação.",
      },
    ],
  },
  {
    slug: "o-que-e-opcao",
    ordem: 10,
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
    ordem: 11,
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
    ordem: 12,
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
    ordem: 13,
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
    ordem: 14,
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
    ordem: 15,
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
    ordem: 17,
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
    ordem: 18,
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
    ordem: 25,
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
    ordem: 20,
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
    ordem: 21,
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
    ordem: 26,
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
    ordem: 27,
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
    ordem: 16,
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
    ordem: 19,
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
| Resultado | Só ações | Ações + PUT |
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
    ordem: 22,
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

| Aspecto | Straddle |
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
    ordem: 23,
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
| Aspecto | Straddle | Strangle |
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
    ordem: 24,
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
| Aspecto | Strangle vendido (sem proteção) | Iron condor |
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
    ordem: 28,
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
| Aspecto | CALL comprada | Trava de alta | Venda coberta |
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
    ordem: 29,
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

| Aspecto | Compra de movimento | Venda de movimento |
|---|---|---|
| Lucro quando | O ativo anda mais que o custo | O ativo fica dentro do range |
| Inimigo | Theta e IV crush | Fuga do range (movimento grande) |
| Perda máxima | Prêmio pago | Largura − crédito |
        `,
      },
      {
        titulo: "As três estruturas lado a lado",
        corpo: `
| Aspecto | Straddle | Strangle | Iron condor |
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
    ordem: 30,
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
    ordem: 31,
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
    ordem: 32,
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
    ordem: 33,
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
    ordem: 34,
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
    ordem: 35,
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
    ordem: 36,
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
    ordem: 37,
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
    ordem: 38,
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
| Aspecto | Day trade | Swing |
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
    ordem: 39,
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
    ordem: 40,
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
    ordem: 41,
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
    ordem: 42,
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
| Aspecto | WIN (Mini Índice) | WDO (Mini Dólar) |
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
    ordem: 43,
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
| Aspecto | Futuro | Opção comprada |
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
    ordem: 44,
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
    ordem: 45,
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
    ordem: 46,
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
  {
    slug: "aprofundamento-win",
    ordem: 47,
    nivel: 4,
    dominio: "futuros",
    instrumento: "win",
    titulo: "Lição 15 — Mini Índice em profundidade",
    resumo:
      "O contrato que segue o Ibovespa: pontos, vencimento, liquidação financeira e o que move o índice.",
    problema: {
      titulo: "O índice que não é um ativo",
      texto:
        "Thiago operava o WIN 'achando que comprava o mercado inteiro'. Na verdade, ele comprava um contrato padronizado sobre o Ibovespa — um índice que reúne as ações mais negociadas da B3, e que não existe fora da tela. Quando o contrato venceu, ele esperava 'receber ações' e recebeu apenas o ajuste em reais. Entender o que está do outro lado do contrato é o que separa operar de apostar.",
      pergunta: "O que exatamente o WIN representa — e como ele termina?",
    },
    conceitos: [
      {
        titulo: "O ativo de referência",
        corpo: `
O **WIN** é um futuro padronizado do **Ibovespa**: o índice de ações mais negociadas da B3, ponderado pelo valor de mercado. O contrato segue os **pontos** do índice, não uma carteira real.

- **Preço**: cotado em pontos (ex.: 130.000). Cada ponto vale **R$ 0,20**; o tick mínimo é 5 pontos (R$ 1,00).
- **Exposição**: 1 contrato a 130.000 expõe R$ 26.000.
- **Referência**: o índice à vista durante o pregão; o ajuste diário usa o preço de ajuste da B3.
        `,
      },
      {
        titulo: "Vencimento e liquidação",
        corpo: `
- **Meses de vencimento**: pares (fev, abr, jun, ago, out, dez) — o contrato mais negociado é o do mês mais próximo.
- **Data de vencimento**: quarta-feira mais próxima do dia 15 do mês.
- **Liquidação 100% financeira**: no vencimento, a posição é liquidada em reais pelo índice de liquidação — não existe entrega de ações.
- **Rolagem**: quem quer manter exposição após o vencimento troca de série antes — pagando/levando o prêmio da diferença de pontos entre os vencimentos.

O "prêmio" entre vencimentos reflete a expectativa de juros e dividendos embutida no futuro — é por isso que o futuro raramente negocia exatamente no valor do índice à vista.
        `,
      },
      {
        titulo: "O que move o índice",
        corpo: `
- **Macro**: juros (Copom), inflação (IPCA), câmbio, cenário externo (Fed, Treasuries).
- **Fluxo**: entrada/saída de estrangeiro, eventos de book building, rebalanceamentos.
- **Calendário**: divulgações de resultados, dividendos, vencimento de opções e futuros (o dia do vencimento costuma ter volume e volatilidade maiores).

O WIN amplifica o índice: cada ponto de variação do Ibovespa vale R$ 0,20 por contrato — e a alavancagem decide quem aguenta a rota.
        `,
      },
    ],
    analogia:
      "O WIN é o velocímetro do mercado brasileiro: ele marca a velocidade (pontos do Ibovespa), não o carro. Quem segura o velocímetro até o fim do trajeto não recebe o carro — recebe o saldo da corrida em dinheiro.",
    naPratica: {
      titulo: "Antes de operar o WIN",
      passos: [
        "Qual é o vencimento do contrato que estou olhando? (série em vigor)",
        "Quantos pontos separam o futuro do índice à vista? (base)",
        "O ajuste diário do dia vai usar qual referência? (preço de ajuste da B3)",
        "Se o vencimento chegar com a posição aberta, eu sei que a liquidação é em reais?",
      ],
    },
    missao: {
      titulo: "O contrato que vence",
      situacao:
        "Faltam 2 dias para o vencimento do WIN e você ainda tem 2 contratos comprados a 130.000. O índice está em 129.800 e você não quer mais a exposição.",
      pergunta: "O que acontece se você não fizer nada?",
      opcoes: [
        {
          texto: "A posição é liquidada financeiramente no vencimento — sem entrega de ações",
          tom: "correta",
          feedback:
            "Boa decisão. O WIN liquida em reais pelo índice de liquidação: a exposição acaba sozinha no vencimento, mas o resultado final é o acumulado dos ajustes diários.",
        },
        {
          texto: "Você recebe ações equivalentes ao índice",
          tom: "errada",
          feedback: "Não existe entrega de ações no futuro de índice — a liquidação é financeira.",
        },
        {
          texto: "O contrato renova sozinho para o vencimento seguinte",
          tom: "errada",
          feedback: "Não há renovação automática: se não rolar, a posição liquida no vencimento.",
        },
        {
          texto: "A corretora mantém a posição aberta indefinidamente",
          tom: "errada",
          feedback:
            "O contrato tem data certa de vencimento — e a posição é zerada no último ajuste.",
        },
      ],
      termosExplicacao: ["liquidação", "financeira", "vencimento", "reais", "ajuste"],
      aindaPratique: "anotar a data do próximo vencimento do WIN e a série em vigor",
      transferencia: {
        titulo: "O futuro frente ao à vista",
        situacao:
          "O Ibovespa à vista está em 130.000 e o futuro com vencimento em dezembro negocia a 131.200.",
        pergunta: "O que explica a diferença de 1.200 pontos?",
        opcoes: [
          {
            texto: "Juros e dividendos esperados até o vencimento embutidos no futuro",
            tom: "correta",
            feedback:
              "Boa decisão. A base entre futuro e à vista reflete o custo de carrego (juros) e os dividendos esperados — não é 'adiantamento do gráfico'.",
          },
          {
            texto: "O mercado está prevendo alta de 1.200 pontos",
            tom: "errada",
            feedback:
              "A base é carrego, não previsão: por isso o futuro converge para o à vista conforme o vencimento se aproxima.",
          },
          {
            texto: "É o spread da corretora",
            tom: "errada",
            feedback: "Spread é custo de execução; a base é uma característica do contrato.",
          },
          {
            texto: "Erro de cotação da B3",
            tom: "errada",
            feedback: "A base é normal e converge ao longo do tempo — não é erro.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O WIN é um contrato sobre:",
        alternativas: [
          "Os pontos do Ibovespa",
          "Uma carteira real de ações",
          "O câmbio americano",
          "O CDI",
        ],
        correta: 0,
        explicacao: "O WIN segue os pontos do Ibovespa — o índice, não uma carteira física.",
      },
      {
        pergunta: "O vencimento do WIN ocorre:",
        alternativas: [
          "Nos meses pares, na quarta-feira mais próxima do dia 15",
          "No último dia útil de todo mês",
          "Na terceira sexta-feira do mês",
          "No dia 15 de todos os meses",
        ],
        correta: 0,
        explicacao: "Meses pares (G, J, M, Q, V, Z), quarta-feira mais próxima do dia 15.",
      },
      {
        pergunta: "No vencimento, a posição em WIN é:",
        alternativas: [
          "Liquidada financeiramente em reais",
          "Convertida em ações",
          "Renovada automaticamente",
          "Transformada em opção",
        ],
        correta: 0,
        explicacao: "Liquidação 100% financeira pelo índice de liquidação — sem entrega.",
      },
      {
        pergunta: "A diferença entre o futuro e o índice à vista reflete:",
        alternativas: [
          "Juros e dividendos esperados (carrego)",
          "A previsão do mercado",
          "O humor dos operadores",
          "A taxa da corretora",
        ],
        correta: 0,
        explicacao: "A base é o custo de carrego — e converge conforme o vencimento se aproxima.",
      },
    ],
    exercicios: [
      {
        titulo: "A série e a base",
        enunciado:
          "Hoje é 5 de agosto. O WIN vigente vence em agosto (meses pares). O índice está em 129.500 e o futuro em 130.100. (a) Qual a base? (b) Se você tem 3 contratos, qual a exposição total?",
        gabarito:
          "(a) Base = 600 pontos (130.100 − 129.500). (b) 130.100 × R$ 0,20 × 3 = R$ 78.060 de exposição.",
      },
    ],
  },
  {
    slug: "aprofundamento-wdo",
    ordem: 48,
    nivel: 4,
    dominio: "futuros",
    instrumento: "wdo",
    titulo: "Lição 16 — Mini Dólar em profundidade",
    resumo:
      "O contrato que segue o câmbio: dólar referência, vencimento, liquidação e o que move a taxa.",
    problema: {
      titulo: "O dólar que ninguém vê",
      texto:
        "Camila operava o WDO 'de olho no dólar do Google'. Mas o contrato segue o dólar comercial de referência do mercado brasileiro — e o número da internet nem sempre é o mesmo preço que o book negocia. Sem entender a referência, o vencimento e quem mexe no câmbio (o Banco Central), ela tomava decisões de um mercado e media o resultado em outro.",
      pergunta: "O que o WDO segue de verdade — e o que o move?",
    },
    conceitos: [
      {
        titulo: "O ativo de referência",
        corpo: `
O **WDO** é um futuro padronizado do **dólar americano** negociado em reais (USDBRL). Ele acompanha o câmbio comercial de referência — a taxa PTAX divulgada pelo Banco Central, apurada a partir do mercado interbancário.

- **Preço**: cotado em pontos (ex.: 5,4000 — com vírgula/4 casas). Cada ponto vale **R$ 10**; o tick é 0,5 ponto (R$ 5,00).
- **Exposição**: 1 contrato a 5,4000 expõe US$ 10.000 (R$ 54.000).
- **Referência**: dólar à vista durante o dia; o ajuste final usa a taxa de câmbio de referência da B3.
        `,
      },
      {
        titulo: "Vencimento e liquidação",
        corpo: `
- **Meses de vencimento**: todos os meses (código com letra do mês: F, G, H...).
- **Data de vencimento**: último dia útil do mês de vencimento.
- **Liquidação financeira**: a posição é liquidada em reais — ninguém entrega dólar físico.
- **Horário**: o WDO negocia de ~9h às 18h; o pregão dele acompanha a liquidez do câmbio brasileiro.

No vencimento, o ajuste final usa a taxa PTAX/ref do dia — o ponto de convergência entre futuro e à vista.
        `,
      },
      {
        titulo: "O que move o dólar",
        corpo: `
- **Juros**: o diferencial entre a taxa brasileira (Selic) e a americana (Fed) — o "carry" atrai ou afasta capital.
- **Banco Central**: atuação no câmbio via **swap cambial** e **leilões** de dólar à vista — o WDO reage aos anúncios.
- **Externos**: Fed, Treasuries, risco-país, commodities (o Brasil exporta muito), eleições e cenário fiscal.
- **Saúde**: feriados americanos mudam o fluxo; notícias de madrugada abrem gaps no pregão seguinte.

O dólar não tem "cota certa": tem fluxo — e o contrato mede o fluxo em pontos.
        `,
      },
    ],
    analogia:
      "O WDO é o termômetro do fluxo de dólares: quando dinheiro entra no país, o câmbio esfria (cai); quando sai, esquenta (sobe). O termômetro só mede — quem mexe no clima é o juro, o risco e o Banco Central com seus leilões.",
    naPratica: {
      titulo: "Antes de operar o WDO",
      passos: [
        "Qual a taxa de referência (PTAX) de hoje, e como o book está em relação a ela?",
        "Há evento de juros (Copom/Fed) ou leilão do BCB no radar?",
        "O contrato vigente vence quando? (último dia útil do mês)",
        "O spread de R$ 5 por volta está dentro do meu plano?",
      ],
    },
    missao: {
      titulo: "O contrato que converge",
      situacao:
        "Faltam 3 dias para o vencimento do WDO. O dólar comercial está em 5,3980 e o contrato em 5,4000 — você tem 1 contrato comprado a 5,3950.",
      pergunta: "O que tende a acontecer conforme o vencimento se aproxima?",
      opcoes: [
        {
          texto: "O futuro converge para a referência — e seu resultado já está no ajuste",
          tom: "correta",
          feedback:
            "Boa decisão. Próximo do vencimento, o futuro converge para a taxa de referência: a diferença de 20 pontos tende a se fechar no ajuste final.",
        },
        {
          texto: "O contrato renova sozinho para o mês seguinte",
          tom: "errada",
          feedback:
            "Sem rolagem, a posição liquida no vencimento — não existe renovação automática.",
        },
        {
          texto: "Você recebe US$ 10.000 na conta",
          tom: "errada",
          feedback: "A liquidação é financeira em reais — não há entrega de dólar físico.",
        },
        {
          texto: "O spread desaparece no vencimento",
          tom: "errada",
          feedback: "O spread segue existindo; o que converge é a base entre futuro e referência.",
        },
      ],
      termosExplicacao: ["convergência", "referência", "ajuste final", "5,3980", "liquidação"],
      aindaPratique: "comparar a PTAX do dia com o contrato vigente ao fechar o pregão",
      transferencia: {
        titulo: "O anúncio que move",
        situacao:
          "O Copom surpreende e corta a Selic mais do que o esperado. O diferencial de juros Brasil × EUA diminui.",
        pergunta: "Qual é o efeito típico sobre o câmbio?",
        opcoes: [
          {
            texto: "O real tende a se desvalorizar: menos carry atrai menos capital estrangeiro",
            tom: "correta",
            feedback:
              "Boa decisão. Juro menor encolhe o prêmio do carry: o fluxo de entrada enfraquece e o dólar tende a subir — sem garantia, claro.",
          },
          {
            texto: "O real tende a se valorizar automaticamente",
            tom: "errada",
            feedback: "Carry menor desestimula a entrada de capital — o efeito típico é o oposto.",
          },
          {
            texto: "O câmbio não reage a juros",
            tom: "errada",
            feedback: "O diferencial de juros é um dos motores centrais do câmbio.",
          },
          {
            texto: "A PTAX congela até o próximo vencimento",
            tom: "errada",
            feedback: "A PTAX é apurada todo dia útil — não congela.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "O WDO é um contrato sobre:",
        alternativas: [
          "O dólar americano em reais (USDBRL)",
          "O Ibovespa em pontos",
          "O euro",
          "O ouro",
        ],
        correta: 0,
        explicacao: "O WDO segue o câmbio dólar/real — a taxa de referência do mercado brasileiro.",
      },
      {
        pergunta: "O vencimento do WDO ocorre:",
        alternativas: [
          "No último dia útil do mês de vencimento",
          "Na quarta-feira mais próxima do dia 15",
          "Nos meses pares apenas",
          "No primeiro dia útil de cada semana",
        ],
        correta: 0,
        explicacao: "O dólar futuro vence no último dia útil do mês — todo mês.",
      },
      {
        pergunta: "No vencimento, o WDO é liquidado:",
        alternativas: [
          "Financeiramente, em reais",
          "Com entrega de dólar físico",
          "Com conversão em ações",
          "Com renovação automática",
        ],
        correta: 0,
        explicacao: "Liquidação financeira pela taxa de referência — sem entrega de moeda.",
      },
      {
        pergunta: "Uma atuação do Banco Central com swap cambial:",
        alternativas: [
          "Muda a oferta de proteção e influencia o preço do dólar futuro",
          "Garante lucro ao operador",
          "Congela a PTAX",
          "Só afeta o mercado de ações",
        ],
        correta: 0,
        explicacao:
          "Swaps e leilões do BCB alteram o fluxo e o prêmio — o WDO reage a esses anúncios.",
      },
    ],
    exercicios: [
      {
        titulo: "A exposição do WDO",
        enunciado:
          "WDO a 5,4000, com 2 contratos. (a) Qual a exposição em reais? (b) Se o dólar sobe 30 pontos, qual o resultado por contrato? (c) E com os 2 contratos?",
        gabarito:
          "(a) 5.400 × R$ 10 × 2 = R$ 108.000. (b) 30 × R$ 10 = R$ 300. (c) 30 × R$ 10 × 2 = R$ 600.",
      },
    ],
  },
  {
    slug: "renko-comparacao",
    ordem: 49,
    nivel: 2,
    titulo: "Lição 49 — O mercado não mudou. A representação mudou.",
    resumo:
      "Candle e Renko são lentes para o mesmo preço: uma guarda o tempo, a outra o filtra. A realidade é idêntica — o que muda é o que você enxerga.",
    problema: {
      titulo: "O gráfico que 'sumiu com o ruído'",
      texto:
        "Marina trocou o gráfico de candles por Renko e teve uma sensação estranha: o mercado parecia 'mais limpo', as entradas 'mais óbvias'. Ela achou que tinha encontrado um jeito melhor de prever. No fim do mês, o resultado era o mesmo de sempre. O Renko não mudou o mercado — mudou a lente. E ela não sabia que olhar por outra lente não é prever melhor.",
      pergunta: "O que exatamente mudou quando o gráfico virou Renko?",
    },
    conceitos: [
      {
        titulo: "O que o Renko desenha",
        corpo: `
**Renko** é uma representação de preço em blocos (tijolos): um novo bloco só nasce quando o preço desloca um **tamanho mínimo predefinido** (ex.: R$ 1,00 ou 50 pontos) a partir do bloco anterior.

| Aspecto | Candle | Renko |
|---|---|---|
| Base do desenho | intervalo de tempo (1min, 5min, 1 dia) | deslocamento mínimo de preço |
| Guarda o tempo | sim — cada vela é um período | não — só nasce quando o preço anda |
| Ruído | aparece em cada período | filtrado pela régua do bloco |
| Pergunta que responde | o que aconteceu neste período? | o movimento atravessou a régua? |

O tempo continua existindo no mercado — o Renko apenas **não o desenha**. Cada bloco pode nascer em 1 minuto ou em 1 hora: o gráfico não distingue.
        `,
      },
      {
        titulo: "Mesmo mercado, duas lentes",
        corpo: `
O preço é **um só**. O que muda é o filtro da lente:

- O **candle** pergunta: "o que o preço fez neste período de tempo?"
- O **Renko** pergunta: "o preço deslocou a régua mínima?"

Por isso uma sequência de velas pequenas laterais vira **um bloco só** no Renko — ou nenhum. E um movimento que demorou três horas para andar um bloco aparece **igual** a um que andou o mesmo bloco em três minutos.

A consequência pedagógica é central: **representação não é realidade**. O gráfico Renko é mais limpo, mas o mercado que ele descreve é o mesmo — com a mesma volatilidade, os mesmos participantes e o mesmo risco.
        `,
      },
      {
        titulo: "Representação é escolha, não previsão",
        corpo: `
Escolher a representação é escolher **o que observar**, não descobrir um atalho. A sequência de blocos descreve a manutenção da direção em blocos de tamanho fixo — uma **observação** com resolução diferente da dos candles.

Assim como os indicadores, a representação termina numa evidência: padrão + representação + contexto + regra + risco. Nenhuma lente, sozinha, transforma leitura em ordem.
        `,
      },
    ],
    analogia:
      "Ver o mesmo vale pela foto de satélite e pelo mapa topográfico: os dois descrevem o mesmo terreno. O mapa esconde árvores e casas (ruído), mas não muda a montanha — e nenhum dos dois te diz para onde caminhar.",
    naPratica: {
      titulo: "Trocar a lente sem se enganar",
      passos: [
        "Abra o mesmo trecho de preço em candle e em Renko, lado a lado.",
        "Escreva o fato que cada um mostra — o candle mostra período; o Renko mostra deslocamento.",
        "Pergunte: o que esta representação esconde de mim? (o tempo, no Renko; o ruído, no candle)",
        "Anote a conclusão: a realidade do preço é a mesma — só a lente mudou.",
      ],
    },
    missao: {
      titulo: "A mesma semana, duas leituras",
      situacao:
        "Numa semana, o WIN oscilou 200 pontos dentro de uma faixa e fechou quase onde abriu. No gráfico de candles são dezenas de velas pequenas alternadas; no Renko com bloco de 50 pontos, apenas dois blocos — um verde, um vermelho. Você está descrevendo o que vê antes de qualquer hipótese.",
      pergunta: "O que a diferença entre as duas representações descreve?",
      opcoes: [
        {
          texto:
            "O mesmo movimento sem direção: o candle mostra a agitação do tempo; o Renko mostra que nenhum deslocamento se sustentou.",
          tom: "correta",
          feedback:
            "Correto: as duas lentes descrevem o mesmo fato — mercado sem direção sustentada. A diferença é resolução, não conteúdo.",
        },
        {
          texto:
            "O Renko escondeu a volatilidade da semana — esconder não é remover: o risco da faixa continua lá, só não está desenhado.",
          tom: "quase",
          feedback:
            "Quase: o Renko filtra o desenho do ruído, mas a oscilação real continua existindo — é exatamente o que a lição alerta.",
        },
        {
          texto:
            "Dois blocos opostos indicam uma reversão iminente — dois blocos descrevem a ida e a volta; reversão é hipótese, não conclusão.",
          tom: "errada",
          feedback:
            "Não: verde e vermelho lado a lado descrevem o movimento de ida e volta dentro da faixa — ninguém 'prevê' o próximo bloco.",
        },
        {
          texto:
            "O candle é superior porque mostra mais informação — informação diferente não é informação melhor; cada lente responde outra pergunta.",
          tom: "errada",
          feedback:
            "Não: não existe lente superior — existe lente adequada à pergunta que você quer observar.",
        },
      ],
      termosExplicacao: ["representação", "Renko", "candle", "deslocamento", "faixa"],
      aindaPratique:
        "No seu ativo, comparar a última semana em candle e Renko e anotar qual pergunta cada lente responde melhor.",
      transferencia: {
        titulo: "O bloco que 'previu' a queda",
        situacao:
          "Você mostra para um amigo um gráfico Renko em que três blocos verdes foram seguidos por um vermelho, e ele diz: 'o Renko previu a queda'. O preço, de fato, caiu depois.",
        pergunta: "O que a sua leitura responde a ele?",
        opcoes: [
          {
            texto:
              "O bloco vermelho descreveu o que já aconteceu — a queda posterior é outra observação; descrever depois não é prever antes.",
            tom: "correta",
            feedback:
              "Correto: o bloco nasce depois do deslocamento — ele é registro do passado, como qualquer candle.",
          },
          {
            texto:
              "Ele tem razão: três verdes e um vermelho é um padrão confiável — sequência descreve direção passada; confiabilidade é regra pessoal a testar.",
            tom: "quase",
            feedback:
              "Quase: o padrão descreve o que aconteceu; chamá-lo de previsão é transformar observação em gatilho — o erro central da Rodada T.",
          },
          {
            texto:
              "O Renko só existe para quem opera curto — representação não tem contrato; Renko serve para qualquer mercado como lente.",
            tom: "errada",
            feedback:
              "Não: a lente independe do contrato — o que muda é o tamanho da régua que faz sentido.",
          },
          {
            texto:
              "Devemos passar a usar Renko para prever quedas — usar representação como oráculo reproduz o mesmo erro dos indicadores-gatilho.",
            tom: "errada",
            feedback: "Não: representação é fonte de observação, nunca mecanismo preditivo.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Um gráfico Renko nasce de:",
        alternativas: [
          "deslocamento mínimo de preço a partir do bloco anterior",
          "intervalos fixos de tempo",
          "volume acumulado da sessão",
          "sorteios da B3",
        ],
        correta: 0,
        explicacao:
          "O bloco só nasce quando o preço desloca o tamanho mínimo predefinido — o tempo não desenha o Renko.",
      },
      {
        pergunta: "Trocar candle por Renko:",
        alternativas: [
          "muda a lente, não a realidade do preço",
          "elimina a volatilidade real",
          "garante leituras mais fáceis de operar",
          "transforma o gráfico em previsão",
        ],
        correta: 0,
        explicacao:
          "A representação filtra o que você enxerga — o mercado, o risco e o preço continuam idênticos.",
      },
      {
        pergunta: "O tempo no gráfico Renko:",
        alternativas: [
          "existe no mercado, mas não é desenhado",
          "é congelado pelo tamanho do bloco",
          "é ignorado porque não importa",
          "vira o eixo horizontal do gráfico",
        ],
        correta: 0,
        explicacao:
          "O tempo continua passando e os preços continuam sendo feitos no tempo — o Renko só não o desenha.",
      },
    ],
    exercicios: [
      {
        titulo: "A lente e o fato",
        enunciado:
          "Escreva, em duas linhas, o fato que cada representação mostraria numa sessão de WIN que andou 180 pontos para cima em três horas e devolveu 160 em quarenta minutos: (a) no candle de 5min; (b) no Renko de 50 pontos.",
        gabarito:
          "(a) O candle mostra dezenas de velas, subida longa e queda rápida, com o tempo evidente em cada período. (b) O Renko mostra blocos verdes na subida e vermelhos na devolução — sem mostrar quanto tempo cada bloco levou. Os dois descrevem o mesmo movimento.",
      },
    ],
  },
  {
    slug: "renko-resolucao",
    ordem: 50,
    nivel: 2,
    titulo: "Lição 50 — O tamanho do bloco muda o que você enxerga",
    resumo:
      "Bloco pequeno desenha cada respiro; bloco grande só desenha movimentos grossos. Mudar a régua não muda a volatilidade — muda a resolução da observação.",
    problema: {
      titulo: "O slider que 'acalmou' o gráfico",
      texto:
        "Caio achou o gráfico Renko 'estressante' com bloco de 25 pontos e aumentou a régua para 150 pontos. O gráfico ficou lindo: quase nada se movia, só grandes blocos espaçados. Ele respirou aliviado — achou que o mercado tinha ficado mais calmo. O mercado não tinha mudado: ele só tinha trocado o zoom da lente. A ansiedade voltou no primeiro trade.",
      pergunta: "O que o tamanho do bloco realmente altera?",
    },
    conceitos: [
      {
        titulo: "Régua é resolução, não filtro de verdade",
        corpo: `
O tamanho do bloco define **o menor deslocamento que gera um novo bloco**. É uma régua de desenho:

- **Bloco pequeno** (ex.: 25 pontos no WIN): cada respiro vira bloco — o gráfico fica detalhado e sensível.
- **Bloco grande** (ex.: 150 pontos): só movimentos grossos desenham — o gráfico fica esparso, com poucos blocos.

O que acontece com a **volatilidade real** quando você aumenta a régua? Nada. A oscilação dos preços é a mesma; o que muda é quantos blocos a representação usa para contá-la.
        `,
      },
      {
        titulo: "A pergunta que a régua decide",
        corpo: `
A régua escolhe **que tipo de movimento você observa**:

| Régua | O que fica visível | O que fica escondido |
|---|---|---|
| Bloco pequeno | reações finas, micro-regiões | a árvore no meio dos galhos |
| Bloco grande | direções grossas, sequências longas | os respiros que não deslocaram a régua |

Nenhuma régua é 'certa': cada uma responde uma pergunta. O erro é achar que uma régua maior 'prova' que o mercado está calmo — ela só prova que você olhou de mais longe.
        `,
      },
      {
        titulo: "Metacognição: você mudou o gráfico, não o mercado",
        corpo: `
Quando o gráfico 'acalma', a sensação de controle melhora — mas o risco do ativo continua o mesmo. Essa é uma lição de **metacognição**: reconhecer que a emoção responde à representação, não à realidade.

A verificação é simples: coloque o mesmo trecho em duas réguas e compare o **deslocamento total** em reais. O total é idêntico — só o número de blocos muda. Resolução é zoom; zoom não muda a estrada.
        `,
      },
    ],
    analogia:
      "A régua do Renko é o zoom do satélite: com zoom alto você vê as árvores balançando; com zoom baixo, só o vale inteiro. O vento é o mesmo — você só decidiu o que cabe na tela.",
    naPratica: {
      titulo: "Escolher a régua com consciência",
      passos: [
        "Defina o tamanho do bloco antes de olhar — não depois de já ter desenhado.",
        "Anote quantos blocos o mesmo trecho gera em duas réguas (ex.: 25 e 100 pontos).",
        "Compare o deslocamento total em reais: é idêntico nas duas réguas?",
        "Declare qual pergunta a sua régua responde — e o que ela esconde de você.",
      ],
    },
    missao: {
      titulo: "O gráfico que 'desapareceu'",
      situacao:
        "Você aumentou o bloco de 50 para 200 pontos no WIN e o gráfico passou a mostrar apenas dois blocos verdes numa manhã inteira. Você sente que 'nada aconteceu' e pensa em operar 'com mais calma'.",
      pergunta: "O que é verdade nessa leitura?",
      opcoes: [
        {
          texto:
            "O mercado oscilou o dia todo em deslocamentos menores que 200 pontos — a régua não desenhou, mas o movimento existiu.",
          tom: "correta",
          feedback:
            "Correto: a régua grande escondeu os movimentos finos — o que você não vê continua existindo e continua sendo risco.",
        },
        {
          texto:
            "O mercado ficou menos volátil — a volatilidade é do preço, não da régua; aumentar o bloco só mudou o desenho.",
          tom: "quase",
          feedback:
            "Quase: a sensação de calma é real, mas ela descreve a lente, não o mercado — exatamente o erro da lição.",
        },
        {
          texto:
            "Dois blocos verdes confirmam que a compra é segura — sequência curta em régua grossa descreve pouco; segurança é hipótese com regra e risco.",
          tom: "errada",
          feedback:
            "Não: dois blocos em régua grossa dizem que houve dois deslocamentos de 200 pontos — nada além disso.",
        },
        {
          texto:
            "É melhor operar sempre com bloco grande para reduzir o estresse — a régua que acalma é a mesma que esconde o risco fino.",
          tom: "errada",
          feedback:
            "Não: escolher régua pelo conforto é trocar clareza por anestesia — o risco real continua lá.",
        },
      ],
      termosExplicacao: ["bloco", "régua", "resolução", "200 pontos", "volatilidade"],
      aindaPratique:
        "Desenhar o mesmo trecho de 1 hora em 3 réguas (25/100/200 pontos) e anotar quantos blocos cada uma gera.",
      transferencia: {
        titulo: "A régua do colega",
        situacao:
          "Um colega diz que 'no Renko de 10 pontos o WDO está num rali fortíssimo', enquanto o seu Renko de 50 pontos não mostra nada há uma hora. Os dois olham o mesmo ativo.",
        pergunta: "Como reconciliar as duas leituras?",
        opcoes: [
          {
            texto:
              "As réguas respondem perguntas diferentes: 10 pontos desenha cada respiro; 50 pontos só desenha movimentos grossos — não há contradição.",
            tom: "correta",
            feedback:
              "Correto: a divergência é de resolução, não de conteúdo — o preço é o mesmo para os dois.",
          },
          {
            texto:
              "Um dos dois está errado — com réguas diferentes os dois estão certos; a régua é uma escolha declarada, não um fato.",
            tom: "quase",
            feedback:
              "Quase: nenhuma régua é 'a certa' — cada uma mostra uma fatia do mesmo movimento.",
          },
          {
            texto:
              "A régua de 10 pontos prevê melhor o rali — régua menor desenha mais, não prevê mais.",
            tom: "errada",
            feedback:
              "Não: desenho detalhado é observação detalhada — previsão não entra na conta.",
          },
          {
            texto:
              "O WDO está travado — o Renko de 50 pontos escondeu o que o de 10 mostrou; 'travado' é conclusão de uma régua só.",
            tom: "errada",
            feedback:
              "Não: uma régua grossa não 'prova' paralisia — ela só não desenhou os respiros.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Aumentar o tamanho do bloco no Renko:",
        alternativas: [
          "muda a resolução da representação",
          "reduz a volatilidade real do ativo",
          "elimina o risco da operação",
          "torna o mercado mais previsível",
        ],
        correta: 0,
        explicacao:
          "A régua decide o que o gráfico desenha — a volatilidade do preço não sabe qual régua você escolheu.",
      },
      {
        pergunta: "Com bloco grande, os movimentos finos:",
        alternativas: [
          "continuam existindo, mas não são desenhados",
          "deixam de acontecer",
          "viram blocos vermelhos",
          "são convertidos em volume",
        ],
        correta: 0,
        explicacao:
          "O que a régua não desenha não deixa de existir — o risco fino continua presente no mercado.",
      },
      {
        pergunta: "Bloco pequeno é melhor que bloco grande porque:",
        alternativas: [
          "não existe régua melhor — cada uma responde uma pergunta",
          "mostra todas as oportunidades",
          "elimina falsos sinais",
          "é o padrão usado pelas corretoras",
        ],
        correta: 0,
        explicacao:
          "Não há régua 'certa': a escolha é qual pergunta você quer que a lente responda.",
      },
    ],
    exercicios: [
      {
        titulo: "A régua em números",
        enunciado:
          "Uma sessão do WIN deslocou 400 pontos no total, alternando subidas e descidas de 30–80 pontos. Quantos blocos aproximados essa sessão gera com régua de 25 pontos? E com régua de 200 pontos? O deslocamento total mudou?",
        gabarito:
          "Com 25 pontos, a sessão gera em torno de 16 blocos (400 ÷ 25); com 200 pontos, apenas 2 blocos (400 ÷ 200). O deslocamento total (400 pontos) é o mesmo — só a régua de desenho mudou.",
      },
    ],
  },
  {
    slug: "renko-evidencia",
    ordem: 51,
    nivel: 2,
    titulo: "Lição 51 — Renko é evidência, não gatilho",
    resumo:
      "Sequência de blocos na mesma direção descreve o que já aconteceu. Sozinha, ela não abre, segura ou fecha operação — falta contexto, regra e risco.",
    problema: {
      titulo: "Os cinco blocos verdes",
      texto:
        "Diego viu cinco blocos verdes seguidos no Renko e entrou comprado 'porque a tendência estava confirmada'. O preço virou na hora e ele tomou o stop. O Renko tinha mostrado a verdade: cinco deslocamentos de alta haviam acontecido. O erro não foi do gráfico — foi da pergunta: Diego pediu ao desenho do passado uma garantia de futuro.",
      pergunta: "O que a sequência de blocos realmente mostra — e o que ela não mostra?",
    },
    conceitos: [
      {
        titulo: "O que a sequência mostra",
        corpo: `
Uma sequência de blocos na mesma direção descreve fatos já realizados:

- **Direção**: os últimos deslocamentos foram na mesma direção.
- **Sequência**: a direção se sustentou por N blocos (régua fixa).
- **Deslocamento**: quanto o preço andou no total (N × tamanho do bloco).

Isso é observação pura: nada foi previsto, nada foi prometido. O próximo bloco pode ser da mesma cor — ou não. A representação não tem opinião sobre o futuro.
        `,
      },
      {
        titulo: "O que a sequência não diz",
        corpo: `
A sequência **não diz** que o preço vai continuar; **não diz** que existe uma entrada; **não diz** que a operação dará lucro. Pedir essas respostas ao Renko é transformar observação em oráculo — o mesmo erro que os indicadores da Rodada T enfrentam.

| Pergunta | Resposta do Renko |
|---|---|
| O que aconteceu? | uma sequência de N blocos na mesma direção |
| O que vai acontecer? | nenhuma resposta — ele não prevê |
| Devo operar? | nenhuma resposta — isso é decisão sua |
| A operação vai dar lucro? | nenhuma resposta — risco é seu |
        `,
      },
      {
        titulo: "A cadeia da evidência",
        corpo: `
O Renko entra no processo como **fonte de observação** — exatamente no primeiro elo da cadeia:

**Renko → Observação → Contexto → Regra → Risco → Decisão**

Exemplo de cadeia completa: "O Renko mostra uma sequência de 6 blocos verdes (observação). O contexto é de tendência com volume presente (contexto). Minha regra só opera continuação com confirmação e stop dimensionado (regra). Se falhar, perco 1% (risco). Decido operar — ou não."

Sem a cadeia, a sequência de blocos vira gatilho — e gatilho sem processo é aposta com gráfico bonito.
        `,
      },
    ],
    analogia:
      "Cinco blocos verdes são como cinco ônibus que passaram no mesmo sentido: descrevem o que passou. Nenhum deles garante que o próximo ônibus também vai passar — e decidir embarcar sem saber o destino é a pressa que a lição combate.",
    naPratica: {
      titulo: "Usar Renko sem pedir previsão",
      passos: [
        "Descreva o fato: quantos blocos, em que direção, com que régua.",
        "Nomeie o contexto: que estrutura o mercado mostra além do Renko?",
        "Confronte sua regra: a sua regra menciona sequência de blocos?",
        "Dimensione o risco: quanto você perde se o próximo bloco inverter?",
        "Registre tudo antes de decidir — a sequência sozinha não abre operação.",
      ],
    },
    missao: {
      titulo: "A sequência que não decide",
      situacao:
        "O Renko (régua de 50 pontos) mostra oito blocos verdes seguidos no WIN, num dia de volume baixo e com o ativo chegando a uma região de resistência que o segurou três vezes no mês. Nenhuma das suas regras menciona Renko.",
      pergunta: "O que o processo manda fazer com essa sequência?",
      opcoes: [
        {
          texto:
            "Registrar a sequência como observação e confrontar a própria regra: sem regra que use Renko, a sequência é contexto, não condição de entrada.",
          tom: "correta",
          feedback:
            "Correto: a sequência descreve o passado; sem regra própria que a use, ela alimenta o contexto — não autoriza nada.",
        },
        {
          texto:
            "Entrar comprado — oito blocos verdes 'confirmam' a tendência; confirmação é leitura, não ordem; falta contexto, regra e risco.",
          tom: "quase",
          feedback:
            "Quase: a observação está registrada, mas transformá-la em entrada exige regra própria — que você ainda não tem.",
        },
        {
          texto:
            "Vender porque a sequência está longa demais — 'longa demais' é interpretação sem régua declarada; inversão é hipótese, não ordem.",
          tom: "errada",
          feedback:
            "Não: sequência longa descreve o que já andou — vender por isso é operar uma hipótese que você não declarou.",
        },
        {
          texto:
            "Ignorar o gráfico inteiro — a sequência é informação real; ignorá-la é decidir sem processo, igual a segui-la sem regra.",
          tom: "errada",
          feedback:
            "Não: descartar observação válida é pular o ciclo — o processo existe para avaliar, não para negar.",
        },
      ],
      termosExplicacao: ["sequência", "bloco", "observação", "regra", "resistência"],
      aindaPratique:
        "Acompanhar um Renko real por uma semana anotando apenas fatos (blocos, direção, régua) — sem nenhuma intenção de operar.",
      transferencia: {
        titulo: "A regra que usa Renko",
        situacao:
          "Você quer escrever uma regra pessoal que use Renko como evidência, por exemplo: 'só considero tendência relevante com sequência de blocos Renko e o preço acima do VWAP'. O mercado não emite parecer sobre a regra.",
        pergunta: "Qual é o papel do sistema diante dessa regra?",
        opcoes: [
          {
            texto:
              "Registrar a regra como sua e perguntar se você a seguiu — o sistema organiza a sua regra, não a julga.",
            tom: "correta",
            feedback:
              "Correto: o DOS preserva a autoria da regra e cobra o processo — 'você a seguiu?' é a pergunta que ele faz.",
          },
          {
            texto:
              "Aprovar a regra porque usa Renko e VWAP juntos — combinar fontes não torna a regra boa; ela é sua, com suas consequências.",
            tom: "quase",
            feedback:
              "Quase: a regra é válida como escolha pessoal — mas a qualidade dela se prova na revisão, não na aprovação do sistema.",
          },
          {
            texto:
              "Bloquear a regra porque Renko não prevê — a regra usa Renko como evidência, não como previsão; evidência é uso legítimo.",
            tom: "errada",
            feedback:
              "Não: usar Renko como evidência é exatamente o uso permitido — o bloqueio seria confundir evidência com gatilho.",
          },
          {
            texto:
              "Sugerir que você troque Renko por um indicador melhor — representações não competem; a sua régua é uma escolha declarada.",
            tom: "errada",
            feedback: "Não: o sistema não elege lentes — ele registra as suas e cobra o processo.",
          },
        ],
      },
    },
    quiz: [
      {
        pergunta: "Uma sequência de blocos verdes no Renko mostra:",
        alternativas: [
          "deslocamentos de alta já realizados",
          "que a alta vai continuar",
          "uma ordem de compra",
          "que o mercado está calmo",
        ],
        correta: 0,
        explicacao:
          "O bloco nasce depois do deslocamento — a sequência é registro do passado, nada mais.",
      },
      {
        pergunta: "O que falta para uma sequência de blocos virar decisão?",
        alternativas: [
          "contexto, regra pessoal e risco dimensionado",
          "mais um bloco na mesma direção",
          "aprovação de outro operador",
          "nada — a sequência basta",
        ],
        correta: 0,
        explicacao:
          "A cadeia é Renko → Observação → Contexto → Regra → Risco → Decisão — a sequência é só o primeiro elo.",
      },
      {
        pergunta: "Uma regra pessoal que usa Renko como evidência:",
        alternativas: [
          "é válida e o sistema pergunta se você a seguiu",
          "é bloqueada por não ser preditiva",
          "só funciona com opções",
          "precisa de aprovação do mercado",
        ],
        correta: 0,
        explicacao:
          "Evidência é o uso legítimo de qualquer representação — a autoria da regra é sua e a cobrança do processo é do sistema.",
      },
    ],
    exercicios: [
      {
        titulo: "A cadeia completa",
        enunciado:
          "Escreva a cadeia completa (Renko → Observação → Contexto → Regra → Risco → Decisão) para: WDO com quatro blocos vermelhos seguidos em régua de 10 pontos, numa sessão de leilão do BCB, com a sua regra de 'só operar com 2% de risco'.",
        gabarito:
          "Observação: quatro deslocamentos de 10 pontos para baixo já realizados. Contexto: sessão com leilão do BCB (fluxo institucional). Regra: só operar com risco de 2% dimensionado antes. Risco: perda máxima de 2% se a leitura falhar. Decisão: operar (ou não) com a cadeia toda registrada — nunca pela sequência sozinha.",
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

/**
 * Lições do caminho com foco em um contrato de futuros (WIN ou WDO).
 * Lições sem instrumento são comuns aos dois; as específicas do outro contrato ficam de fora.
 */
export function liçõesDeFoco(caminho: CaminhoTrilha, foco: "win" | "wdo" | undefined): Lesson[] {
  const base = liçõesDe(caminho);
  if (caminho !== "futuros" || !foco) return base;
  return base.filter((l) => !l.instrumento || l.instrumento === foco);
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

/** Temas da Trilha: agrupam as lições do caminho em seções expansíveis (blocos contíguos de ordem). */
export type Tema = string;

export const TEMAS: Record<Tema, { nome: string; desc: string }> = {
  leitura: {
    nome: "Leitura de mercado",
    desc: "Observar e interpretar o que o preço conta — candle, força, congestão e rompimento — antes de qualquer hipótese.",
  },
  indicadores: {
    nome: "Indicadores e instrumentos",
    desc: "Médias móveis, VWAP e retrações de Fibonacci como evidência — indicador descreve, o contexto interpreta.",
  },
  representacao: {
    nome: "Representação do movimento",
    desc: "Candle e Renko como lentes do mesmo preço — a representação muda o que você enxerga, nunca a realidade.",
  },
  fundamentos: {
    nome: "Fundamentos",
    desc: "O que é uma opção, prêmio, strike, vencimento, o efeito do tempo e da volatilidade.",
  },
  estrategias: {
    nome: "Estratégias e estruturas",
    desc: "Comprar, vender, proteger, rolar e estruturas de movimento ou lateralização.",
  },
  decisao: {
    nome: "Comparação e decisão",
    desc: "Escolher entre estruturas e fechar o ciclo de decisão.",
  },
  fiscal: {
    nome: "Tributação",
    desc: "Imposto sobre o resultado e o DARF mensal.",
  },
  mecanica: {
    nome: "Mecânica do contrato",
    desc: "O contrato futuro, valor do ponto, margem e alavancagem.",
  },
  pregao: {
    nome: "Pregão e dimensionamento",
    desc: "A sessão de negociação, o stop com dimensionamento e day trade vs swing.",
  },
  risco: {
    nome: "Execução e risco",
    desc: "Slippage, ajuste diário e a armadilha da alavancagem.",
  },
  comparacao: {
    nome: "Comparação",
    desc: "WIN vs WDO e futuro vs opção.",
  },
  gestao: {
    nome: "Decisão e fiscal",
    desc: "A decisão no day trade, a tributação (6015) e o DARF na prática.",
  },
  aprofundamento: {
    nome: "Aprofundamento",
    desc: "O contrato que você escolheu estudar em profundidade.",
  },
  outros: {
    nome: "Geral",
    desc: "Lições sem tema específico.",
  },
};

export const TEMA_LICOES: Record<string, Tema> = {
  "lendo-um-candle": "leitura",
  "a-historia-do-pavio": "leitura",
  "forca-e-sequencia": "leitura",
  "congestao-e-expansao": "leitura",
  "tendencia-e-lateralizacao": "leitura",
  "suporte-resistencia-e-rompimento": "leitura",
  "medias-moveis": "indicadores",
  vwap: "indicadores",
  fibonacci: "indicadores",
  "renko-comparacao": "representacao",
  "renko-resolucao": "representacao",
  "renko-evidencia": "representacao",
  "o-que-e-opcao": "fundamentos",
  "call-vs-put": "fundamentos",
  "vencimento-e-exercicio": "fundamentos",
  "premio-e-strike": "fundamentos",
  moneyness: "fundamentos",
  "theta-e-tempo": "fundamentos",
  "volatilidade-e-vega": "fundamentos",
  "compra-a-seco": "estrategias",
  "venda-coberta": "estrategias",
  "protective-put": "estrategias",
  "trava-de-alta": "estrategias",
  "trava-de-baixa": "estrategias",
  rolagem: "estrategias",
  "rolagem-defensiva": "estrategias",
  "gestao-de-risco-travas": "estrategias",
  straddle: "estrategias",
  strangle: "estrategias",
  "iron-condor": "estrategias",
  "comparar-estruturas-de-alta": "decisao",
  "comparar-estruturas-neutras": "decisao",
  "gestao-da-decisao": "decisao",
  "tributacao-basica": "fiscal",
  "darf-e-compensacao": "fiscal",
  "o-que-e-um-futuro": "mecanica",
  "valor-do-ponto-e-tick": "mecanica",
  "margem-e-alavancagem": "mecanica",
  "pregao-e-sessao": "pregao",
  "stop-e-dimensionamento": "pregao",
  "day-trade-vs-swing": "pregao",
  "slippage-e-execucao": "risco",
  "ajuste-diario": "risco",
  "armadilha-da-alavancagem": "risco",
  "win-vs-wdo": "comparacao",
  "futuro-vs-opcao": "comparacao",
  "decisao-no-day-trade": "gestao",
  "tributacao-day-trade": "gestao",
  "darf-day-trade": "gestao",
  "aprofundamento-win": "aprofundamento",
  "aprofundamento-wdo": "aprofundamento",
};

export function temaDeLição(slug: string): Tema {
  return TEMA_LICOES[slug] ?? "outros";
}

/** Agrupa as lições por tema (temas na ordem do início da jornada; lições por ordem). */
export function liçõesPorTema(trilha: Lesson[]): { tema: Tema; lições: Lesson[] }[] {
  const grupos = new Map<Tema, Lesson[]>();
  for (const l of trilha) {
    const tema = temaDeLição(l.slug);
    const lista = grupos.get(tema);
    if (lista) lista.push(l);
    else grupos.set(tema, [l]);
  }
  return [...grupos.entries()]
    .map(([tema, lições]) => ({
      tema,
      lições: [...lições].sort((a, b) => a.ordem - b.ordem),
    }))
    .sort((a, b) => a.lições[0].ordem - b.lições[0].ordem);
}
