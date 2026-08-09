import type { LessonCenario } from "@/lib/lessons";
import type { HipoteseEstrategia } from "@/lib/presets-estrategias";

export const FLOW_LAB_KEY = "flow-lab";

export type FichaCenario = LessonCenario;

export type FichaEstrategia = {
  id: string;
  nome: string;
  hipotese: HipoteseEstrategia;
  natureza: "debito" | "credito" | "mista";
  resumo: string;
  expressa: string;
  perfilRisco: string;
  gregas: string[];
  alertas: string[];
  regras: string[];
  licaoSlug: string;
  preset: string;
  cenarios: FichaCenario[];
};

export const FICHAS_ESTRATEGIAS: FichaEstrategia[] = [
  {
    id: "call-seca",
    nome: "Compra de call (a seco)",
    hipotese: "alta",
    natureza: "debito",
    resumo:
      "Uma call comprada dá o direito de comprar o ativo por um preço travado até o vencimento. Você paga o prêmio inteiro na entrada.",
    expressa:
      "Expressa uma hipótese de alta forte e dentro do prazo: o lucro cresce à medida que o preço sobe, sem teto — e se a alta não acontecer a tempo, o prêmio vira zero.",
    perfilRisco:
      "Perda limitada ao prêmio pago (100% do investimento) e lucro teoricamente ilimitado. O tempo é o inimigo: cada dia perto do vencimento derruba o valor da opção.",
    gregas: [
      "Delta: alto, direcional para cima",
      "Theta: negativo e acelerando perto do vencimento",
      "Vega: ganha se a volatilidade subir",
      "Gamma: concentra o resultado perto do strike",
    ],
    alertas: [
      "O preço pode andar na direção certa e o prêmio não acompanhar (o tempo come o lucro)",
      "Se a hipótese não acontecer dentro do prazo, a perda é de 100% do prêmio",
      "Liquidez da série: sair quando quiser exige negociação ativa",
    ],
    regras: [
      "Defina antes quanto do seu capital pode virar zero nesta operação",
      "Estabeleça um prazo mínimo de validade da hipótese antes de comprar",
      "Nunca adicione em uma call que já está caindo para 'abaixar o preço médio'",
    ],
    licaoSlug: "compra-a-seco",
    preset: "call-sozinha",
    cenarios: [
      {
        tom: "perda",
        titulo: "Alta não vem",
        descricao:
          "O preço fica abaixo do strike até o vencimento: o prêmio inteiro vira zero. A perda é total e conhecida desde o início.",
      },
      {
        tom: "neutro",
        titulo: "Alta tímida",
        descricao:
          "O preço sobe um pouco, mas o tempo e a queda da volatilidade comem o valor: resultado próximo de zero mesmo com o ativo subindo.",
      },
      {
        tom: "ganho",
        titulo: "Alta forte e rápida",
        descricao:
          "O preço dispara dentro do prazo: o lucro acompanha cada centavo acima do breakeven, sem teto.",
      },
    ],
  },
  {
    id: "put-seca",
    nome: "Compra de put (a seco)",
    hipotese: "baixa",
    natureza: "debito",
    resumo:
      "Uma put comprada dá o direito de vender o ativo por um preço travado até o vencimento. Você paga o prêmio inteiro na entrada.",
    expressa:
      "Expressa uma hipótese de queda forte e dentro do prazo: o lucro cresce à medida que o preço cai, sem teto — e se a queda não acontecer a tempo, o prêmio vira zero.",
    perfilRisco:
      "Perda limitada ao prêmio pago (100% do investimento) e lucro teoricamente ilimitado até o ativo zerar. O tempo corrói a posição a cada dia.",
    gregas: [
      "Delta: alto, direcional para baixo",
      "Theta: negativo e acelerando",
      "Vega: ganha se a volatilidade subir",
      "Gamma: concentra o resultado perto do strike",
    ],
    alertas: [
      "Uma queda pequena pode não pagar o custo total da posição",
      "Se a hipótese não acontecer dentro do prazo, a perda é de 100% do prêmio",
      "O ativo pode cair menos do que o mercado já espera (a queda 'custa' o prêmio)",
    ],
    regras: [
      "Defina antes quanto do seu capital pode virar zero nesta operação",
      "Estabeleça um prazo mínimo de validade da hipótese antes de comprar",
      "Registre o motivo da queda esperada antes de entrar",
    ],
    licaoSlug: "compra-a-seco",
    preset: "put-sozinha",
    cenarios: [
      {
        tom: "perda",
        titulo: "Queda não vem",
        descricao:
          "O preço fica acima do strike até o vencimento: o prêmio inteiro vira zero. A perda é total e conhecida desde o início.",
      },
      {
        tom: "neutro",
        titulo: "Queda tímida",
        descricao:
          "O preço cai um pouco, mas o tempo come o valor: resultado próximo de zero mesmo com o ativo caindo.",
      },
      {
        tom: "ganho",
        titulo: "Queda forte e rápida",
        descricao:
          "O preço despenca dentro do prazo: o lucro cresce a cada centavo abaixo do breakeven, sem teto.",
      },
    ],
  },
  {
    id: "venda-coberta",
    nome: "Venda coberta",
    hipotese: "alta",
    natureza: "credito",
    resumo:
      "Você tem o ativo e vende uma call acima do preço. Recebe o prêmio hoje; em troca, abre mão de parte da alta futura.",
    expressa:
      "Expressa uma hipótese de alta suave (ou estabilidade com leve alta): você recebe o prêmio enquanto o ativo não disparar. Se a alta for forte, o lucro é cortado no strike vendido.",
    perfilRisco:
      "Risco é o ativo cair (a call vendida não protege a queda da ação). Lucro limitado: prêmio + alta até o strike. É uma estrutura de renda, não de alavancagem.",
    gregas: [
      "Delta: positivo (o ativo manda)",
      "Theta: positivo enquanto a venda rende",
      "Vega: perde se a volatilidade cair forte",
      "Risco concentrado na queda do ativo",
    ],
    alertas: [
      "Em queda forte do ativo, a venda da call não protege nada — o prejuízo é da posição em ações",
      "A alta forte além do strike não é sua: você cedeu esse pedaço",
      "Exercício: o comprador pode exercer e você entrega as ações",
    ],
    regras: [
      "Só monte sobre ativo que você aceita manter mesmo caindo",
      "Escolha um strike cuja venda você aceitaria receber de volta",
      "Defina um nível de perda na ação em que a posição inteira é encerrada",
    ],
    licaoSlug: "venda-coberta",
    preset: "venda-coberta",
    cenarios: [
      {
        tom: "perda",
        titulo: "Ação cai",
        descricao:
          "O ativo cai forte: o prêmio recebido não cobre a queda. A perda é da posição em ações, com um pequeno colchão do prêmio.",
      },
      {
        tom: "neutro",
        titulo: "Ação estável",
        descricao:
          "O preço fica parado ou sobe leve: você fica com o prêmio inteiro e mantém o ativo.",
      },
      {
        tom: "ganho",
        titulo: "Alta moderada",
        descricao:
          "O ativo sobe até o strike vendido: você ganha a alta da ação mais o prêmio — e o lucro para aí.",
      },
    ],
  },
  {
    id: "protective-put",
    nome: "Protective put",
    hipotese: "baixa",
    natureza: "debito",
    resumo:
      "Você tem o ativo e compra uma put como seguro: se o preço cair, a put compensa a queda a partir do strike.",
    expressa:
      "Expressa a hipótese de queda possível sobre uma posição que você quer manter: a estrutura não prevê lucro com a queda — ela limita o prejuízo da posição que você já tem.",
    perfilRisco:
      "Perda limitada ao custo do prêmio mais a distância entre o preço e o strike do seguro. Lucro ilimitado para cima (menos o custo do seguro).",
    gregas: [
      "Delta: menos negativo que a posição sozinha",
      "Theta: negativo (o seguro custa tempo)",
      "Vega: o seguro fica mais caro com volatilidade alta",
      "Proteção total abaixo do strike",
    ],
    alertas: [
      "O seguro tem validade: vence e precisa ser renovado ou reavaliado",
      "Se o preço subir, você pagou um prêmio que não se recuperou",
      "Com volatilidade alta, o seguro fica caro — o momento do prêmio importa",
    ],
    regras: [
      "Defina qual queda a posição não pode sofrer — esse é o strike do seguro",
      "Decida com que antecedência o seguro será reavaliado",
      "Não compre o seguro depois que a queda já começou a ser cobrada no prêmio",
    ],
    licaoSlug: "protective-put",
    preset: "protective-put",
    cenarios: [
      {
        tom: "perda",
        titulo: "Ação cai e o seguro cobre",
        descricao:
          "A queda acontece: a put compensa o que a posição perdeu abaixo do strike. O prejuízo fica limitado ao custo do seguro.",
      },
      {
        tom: "neutro",
        titulo: "Ação estável",
        descricao:
          "O preço não anda: você perde apenas o prêmio pago pelo seguro, mantendo a posição intacta.",
      },
      {
        tom: "ganho",
        titulo: "Ação sobe",
        descricao:
          "A alta acontece: o lucro da posição é inteiro, descontado o custo do seguro que não precisou ser acionado.",
      },
    ],
  },
  {
    id: "trava-alta",
    nome: "Trava de alta",
    hipotese: "alta",
    natureza: "debito",
    resumo:
      "Compra de uma call e venda de outra com strike acima. Você paga menos na entrada e o risco fica travado; em troca, o lucro tem teto.",
    expressa:
      "Expressa uma hipótese de alta moderada com prazo: se a alta acontecer até o vencimento, o resultado máximo acontece no strike vendido — e o que você pode perder é conhecido no primeiro dia.",
    perfilRisco:
      "Perda limitada ao débito líquido (prêmio pago menos prêmio recebido). Lucro limitado à largura entre os strikes menos o débito. O teto é o trade-off de pagar menos.",
    gregas: [
      "Delta: positivo (menor que call seca)",
      "Theta: negativo, mas menor que call seca",
      "Vega: exposição reduzida à volatilidade",
      "Gamma: pico de sensibilidade entre os strikes",
    ],
    alertas: [
      "Acima do strike vendido, o lucro não cresce mais — não espere 'mais um pouco'",
      "Se a alta for muito forte, uma call seca teria capturado mais (custo da redução de risco)",
      "O débito pequeno não significa risco pequeno proporcionalmente",
    ],
    regras: [
      "A largura entre os strikes define o risco: use a largura que você aceita perder",
      "Defina o prazo de validade da hipótese antes de montar",
      "Regra de saída: feche quando o resultado chegar perto do teto ou o prazo acabar",
    ],
    licaoSlug: "trava-de-alta",
    preset: "trava-alta",
    cenarios: [
      {
        tom: "perda",
        titulo: "Alta não vem",
        descricao:
          "O preço fica abaixo do strike comprado até o vencimento: a perda é o débito pago, conhecida desde o início.",
      },
      {
        tom: "neutro",
        titulo: "Alta parcial",
        descricao:
          "O preço sobe, mas pouco: o resultado cobre parte do débito — depende de quanto o preço andou e de quanto tempo passou.",
      },
      {
        tom: "ganho",
        titulo: "Alta até o teto",
        descricao:
          "O preço fecha no strike vendido ou acima: o lucro máximo é a largura da trava menos o débito. Não há mais o que capturar acima disso.",
      },
    ],
  },
  {
    id: "trava-baixa",
    nome: "Trava de baixa",
    hipotese: "baixa",
    natureza: "debito",
    resumo:
      "Compra de uma put e venda de outra com strike abaixo. Você barateia o seguro e o risco fica travado; em troca, o lucro tem piso.",
    expressa:
      "Expressa uma hipótese de queda moderada com prazo: se a queda acontecer até o vencimento, o resultado máximo acontece no strike vendido — e a perda possível é conhecida no primeiro dia.",
    perfilRisco:
      "Perda limitada ao débito líquido. Lucro limitado à largura entre os strikes menos o débito. É a versão defensiva da hipótese de baixa: paga menos, ganha menos.",
    gregas: [
      "Delta: negativo (menor que put seca)",
      "Theta: negativo, mas menor que put seca",
      "Vega: exposição reduzida à volatilidade",
      "Gamma: pico de sensibilidade entre os strikes",
    ],
    alertas: [
      "Abaixo do strike vendido, o lucro não cresce mais",
      "Se a queda for violenta, uma put seca teria capturado mais (custo da redução de risco)",
      "O prêmio vendido pode exercer se o preço passar do strike — atenção ao papel de vendedor",
    ],
    regras: [
      "A largura entre os strikes define o risco: use a largura que você aceita perder",
      "Defina o prazo de validade da hipótese antes de montar",
      "Regra de saída: feche quando o resultado chegar perto do piso ou o prazo acabar",
    ],
    licaoSlug: "trava-de-baixa",
    preset: "trava-baixa",
    cenarios: [
      {
        tom: "perda",
        titulo: "Queda não vem",
        descricao:
          "O preço fica acima do strike comprado até o vencimento: a perda é o débito pago, conhecida desde o início.",
      },
      {
        tom: "neutro",
        titulo: "Queda parcial",
        descricao:
          "O preço cai, mas pouco: o resultado cobre parte do débito — depende de quanto o preço andou e de quanto tempo passou.",
      },
      {
        tom: "ganho",
        titulo: "Queda até o piso",
        descricao:
          "O preço fecha no strike vendido ou abaixo: o lucro máximo é a largura da trava menos o débito. Não há mais o que capturar abaixo disso.",
      },
    ],
  },
  {
    id: "straddle",
    nome: "Straddle",
    hipotese: "volatilidade",
    natureza: "debito",
    resumo:
      "Compra de uma call e de uma put no mesmo strike. Você paga pelos dois lados — e ganha se o movimento for forte para qualquer direção.",
    expressa:
      "Expressa uma hipótese de movimento grande sem direção definida: lucra se o preço sair de um corredor, para cima ou para baixo. Se o preço ficar parado, o tempo consome os dois prêmios.",
    perfilRisco:
      "Perda limitada ao custo dos dois prêmios (100% do investimento). Lucro potencial ilimitado nos dois lados, a partir de dois breakevens.",
    gregas: [
      "Delta: neutro na montagem (cancela a direção)",
      "Theta: negativo dobrado (dois prêmios correndo)",
      "Vega: ganha forte se a volatilidade subir",
      "Gamma: explode se o movimento acontecer",
    ],
    alertas: [
      "O movimento precisa vencer o custo dos dois prêmios — não basta 'andar'",
      "Perto do vencimento, o tempo come o valor com força",
      "Se a volatilidade cair (IV crush), os dois lados perdem valor mesmo com movimento",
    ],
    regras: [
      "Defina o tamanho do movimento necessário antes de montar (breakevens como alvo)",
      "Compre com tempo suficiente: o theta não espera",
      "Decida de antemão o que fazer se um dos lados estiver no lucro e o outro não",
    ],
    licaoSlug: "straddle",
    preset: "straddle",
    cenarios: [
      {
        tom: "perda",
        titulo: "Preço parado",
        descricao:
          "O preço fica dentro do corredor até o vencimento: os dois prêmios viram zero. O tempo é o adversário.",
      },
      {
        tom: "neutro",
        titulo: "Movimento pequeno",
        descricao:
          "O preço anda, mas menos que o custo dos dois prêmios: o resultado cobre parte do débito, dependendo do tempo que passou.",
      },
      {
        tom: "ganho",
        titulo: "Explosão para um lado",
        descricao:
          "O preço rompe um dos breakevens: o lucro é grande no lado do movimento, sem teto.",
      },
    ],
  },
  {
    id: "strangle",
    nome: "Strangle",
    hipotese: "volatilidade",
    natureza: "debito",
    resumo:
      "Compra de uma call e de uma put fora do dinheiro. Custa menos que o straddle, mas exige um movimento maior para lucrar.",
    expressa:
      "Expressa uma hipótese de movimento grande e distante do preço atual: o custo menor é o trade-off por precisar de um movimento maior até o breakeven.",
    perfilRisco:
      "Perda limitada ao custo dos dois prêmios (menor que o straddle). Lucro potencial ilimitado nos dois lados, com breakevens mais distantes.",
    gregas: [
      "Delta: neutro na montagem",
      "Theta: negativo, mas menor que o straddle (prêmios menores)",
      "Vega: ganha se a volatilidade subir",
      "Gamma: menor perto do preço atual — movimento maior para engrenar",
    ],
    alertas: [
      "Os breakevens são a régua: o preço precisa chegar neles para o resultado virar positivo",
      "Movimento pequeno não paga o custo — o strangle não é para 'quase'",
      "IV crush derruba os dois lados antes de qualquer movimento",
    ],
    regras: [
      "Meça a distância até os breakevens e compare com o tamanho da onda que você espera",
      "Compre com tempo suficiente para o movimento acontecer",
      "Estabeleça um ponto de parada no lado sem movimento",
    ],
    licaoSlug: "strangle",
    preset: "strangle",
    cenarios: [
      {
        tom: "perda",
        titulo: "Preço no meio",
        descricao:
          "O preço fica entre os strikes até o vencimento: os dois prêmios viram zero, mas o custo foi menor que no straddle.",
      },
      {
        tom: "neutro",
        titulo: "Movimento médio",
        descricao: "O preço anda, mas não chega aos breakevens: o resultado cobre parte do débito.",
      },
      {
        tom: "ganho",
        titulo: "Movimento grande",
        descricao:
          "O preço rompe um dos breakevens com folga: o lucro é grande no lado do movimento, sem teto.",
      },
    ],
  },
  {
    id: "iron-condor",
    nome: "Iron condor",
    hipotese: "lateral",
    natureza: "credito",
    resumo:
      "Venda de uma call e de uma put, com proteções compradas em cada lado. Você recebe um crédito hoje — e lucra se o preço ficar dentro do corredor.",
    expressa:
      "Expressa a hipótese de que o preço fica dentro de um corredor até o vencimento: o crédito é o lucro se nada de grande acontecer. A perda existe se o preço romper o corredor com força, mas é limitada.",
    perfilRisco:
      "Risco limitado à largura das asas menos o crédito recebido. Lucro limitado ao crédito total. Estrutura de venda de volatilidade: lucra com preço parado e sofre com movimento forte.",
    gregas: [
      "Delta: neutro no centro do corredor",
      "Theta: positivo (o tempo trabalha a favor)",
      "Vega: negativo (IV alta derruba o valor)",
      "Risco concentrado no rompimento das asas",
    ],
    alertas: [
      "O lucro máximo é pequeno comparado ao risco máximo — o dimensionamento manda",
      "Rompimento de uma asa: a perda começa a crescer até a proteção",
      "Gestão é tudo: decidir antes onde cortar se o corredor for rompido",
    ],
    regras: [
      "A largura do corredor deve refletir o range que sua hipótese considera 'parado'",
      "Defina com que antecedência do vencimento você vai fechar ou rolar",
      "Aceite perder no máximo o valor que você definiu para a perda na asa rompida",
    ],
    licaoSlug: "iron-condor",
    preset: "iron-condor",
    cenarios: [
      {
        tom: "perda",
        titulo: "Rompimento forte",
        descricao:
          "O preço rompe uma das asas: a perda cresce até a proteção comprada — limitada, mas maior que o crédito recebido.",
      },
      {
        tom: "neutro",
        titulo: "Rompimento parcial",
        descricao:
          "O preço encosta na asa ou a ultrapassa um pouco: parte do crédito é devolvida, o resultado fica próximo de zero.",
      },
      {
        tom: "ganho",
        titulo: "Preço dentro do corredor",
        descricao:
          "O preço fica entre as asas até o vencimento: o crédito inteiro é seu — o lucro máximo conhecido desde o início.",
      },
    ],
  },
  {
    id: "rolagem",
    nome: "Rolagem",
    hipotese: "gestao",
    natureza: "mista",
    resumo:
      "Rolar é encerrar a estrutura que você tem e montar outra, com prazo ou strikes diferentes — não é uma nova entrada, é uma decisão de gestão sobre a hipótese.",
    expressa:
      "Expressa uma revisão da hipótese: você rola quando a estrutura atual deixou de expressar o que você acredita, e uma nova versão (outro prazo, outro strike) expressa melhor — mantendo as regras e o risco definidos.",
    perfilRisco:
      "O risco muda de forma: rolar para frente compra tempo (e paga por ele); rolar para outro strike troca o ponto de vista. Nunca some os custos sem comparar com o custo de fechar e recomeçar.",
    gregas: [
      "Theta: rolar para frente compra tempo — e paga por ele",
      "Delta: mudar o strike muda a direção da aposta",
      "Custo de rolagem: o que você devolve hoje por ter mais tempo",
      "Vega: rolar em volatilidade alta custa caro nas compradas",
    ],
    alertas: [
      "Rolar não é 'não perder': é trocar a estrutura que se provou errada por outra",
      "Rolagens repetidas acumulam custo e viram teimosia",
      "A regra de saída original continua valendo — a rolagem não a cancela",
    ],
    regras: [
      "Rolle apenas quando a hipótese foi revisada, não para adiar a perda",
      "Limite de rolagens por operação: defina quantas vezes você aceita rolar a mesma estrutura",
      "Só role se a nova estrutura respeitar as mesmas regras de risco da original",
    ],
    licaoSlug: "rolagem",
    preset: "trava-alta",
    cenarios: [
      {
        tom: "perda",
        titulo: "Rolagem para adiar",
        descricao:
          "Rolar sem revisar a hipótese: os custos se acumulam e o limite de perda original foi desrespeitado em silêncio.",
      },
      {
        tom: "neutro",
        titulo: "Rolagem compensada",
        descricao:
          "Rolar para frente devolve parte do valor perdido e compra tempo: o resultado final depende do que o novo prazo trouxer.",
      },
      {
        tom: "ganho",
        titulo: "Rolagem com hipótese revisada",
        descricao:
          "A nova estrutura expressa a hipótese atual com o mesmo risco definido: o tempo comprado é usado e a operação se recupera dentro das regras.",
      },
    ],
  },
];

export function getFicha(id: string): FichaEstrategia | undefined {
  return FICHAS_ESTRATEGIAS.find((f) => f.id === id);
}

export function fichasPorHipotese(hipotese: HipoteseEstrategia | "todas"): FichaEstrategia[] {
  if (hipotese === "todas") return FICHAS_ESTRATEGIAS;
  return FICHAS_ESTRATEGIAS.filter((f) => f.hipotese === hipotese);
}
