export type VerbetesGuia = { topico: string; pergunta: string; resposta: string }[];

export const GUIA_PLATAFORMA: VerbetesGuia = [
  {
    topico: "Proposta",
    pergunta: "O que é o Zero ao Trade?",
    resposta:
      "É um app educacional para opções da B3 que treina decisão, não recomendação. O fluxo central é: aprender na Academy (lições), aplicar no simulador, registrar decisões no diário, revisar no grafo e refletir com o copilot. O objetivo é que o usuário tome decisões melhores antes de arriscar dinheiro real.",
  },
  {
    topico: "Onboarding",
    pergunta: "Como começo no app?",
    resposta:
      "No primeiro acesso o onboarding pergunta se você já operou opções e define seu perfil inicial. Depois, a trilha sugere começar pela Lição 1 (O que é uma opção).",
  },
  {
    topico: "Trilha",
    pergunta: "Como funciona a trilha de lições?",
    resposta:
      "São 15 lições organizadas em 5 níveis, do básico ao avançado (opções, prêmio, vencimento, estratégias, rolagem, gestão de risco e tributação). Cada nível desbloqueia o próximo; a trilha mostra onde você parou.",
  },
  {
    topico: "Lição",
    pergunta: "O que preciso fazer para concluir uma lição?",
    resposta:
      "A lição tem 11 partes: problema, conceitos com diagramas, a grande ideia, erro clássico, na prática, missão (decisão com situação), pergunta de transferência (aplicação em outro cenário), quiz de 3 questões e resumo. Concluir exige acertar pelo menos 80% do quiz; o botão de avanço da missão só libera depois de confirmar a decisão e a aplicação.",
  },
  {
    topico: "Quiz",
    pergunta: "Por que o quiz exige 80% para liberar a próxima lição?",
    resposta:
      "Para garantir que o conhecimento foi demonstrado, não apenas visto. Se ficou abaixo de 80%, a lição não é marcada como concluída e o resumo oferece refazer o quiz — errar no app é treino, não prejuízo.",
  },
  {
    topico: "Missão",
    pergunta: "O que é a missão da lição e a pergunta de transferência?",
    resposta:
      "A missão apresenta uma situação real e pergunta qual decisão você tomaria (A, B, C, D), com explicação opcional. Depois do feedback, a pergunta de transferência muda o cenário para verificar se você aplica o conceito em outra situação. O resumo mostra o domínio: reconheceu, aplicou e explicou — sem nota.",
  },
  {
    topico: "Simulador",
    pergunta: "Como funciona o simulador?",
    resposta:
      "Você monta uma estrutura por pernas (comprar/vender call ou put com strike e vencimento). O simulador calcula preço, gregas (delta, gamma, theta, vega), probabilidade (PoP), expected move, breakevens, lucro e perda máximos, e mostra o payoff no vencimento e ao longo do tempo. É hipótese didática, não dado real de mercado.",
  },
  {
    topico: "Simulador · Copilot",
    pergunta: "O que o copilot sabe sobre minha simulação?",
    resposta:
      "Ao clicar em 'perguntar ao copilot' no simulador, ele recebe o contexto completo da estrutura: breakevens, lucro/perda máxima, gregas, PoP e alertas contra suas regras pessoais. Ele explica a mecânica — nunca diz se a operação é boa ou recomendada.",
  },
  {
    topico: "Regras",
    pergunta: "Como criar uma boa regra?",
    resposta:
      "Regras devem ser objetivas e mensuráveis (ex.: 'risco máximo de 1% do patrimônio por operação'). O app oferece templates estruturados e as regras ativas são usadas pelo simulador (alertas), pelo diário e pelo copilot para checar suas decisões.",
  },
  {
    topico: "Diário",
    pergunta: "O que devo registrar no diário?",
    resposta:
      "Cada decisão: tese, estrutura, checklist emocional, regra aplicada e resultado. O app captura um snapshot cognitivo (emoção, disciplina, processo) usado depois na revisão. Quanto mais honesto o registro, melhor o grafo pessoal.",
  },
  {
    topico: "Revisão",
    pergunta: "Como o grafo pessoal é construído?",
    resposta:
      "O grafo une suas decisões do diário com as regras: nós de estratégia, emoção, regra, desfecho e conceito, com ligações ponderadas. A revisão mostra padrões — por exemplo, se você seguiu a regra ou se a emoção pesou — e as métricas de disciplina.",
  },
  {
    topico: "Espelho",
    pergunta: "O que o espelho mostra?",
    resposta:
      "Uma narrativa de quem você está se tornando como operador, gerada a partir do mesmo grafo e da evolução das suas decisões — sem julgamento, apenas padrões observáveis.",
  },
  {
    topico: "História",
    pergunta: "O que aparece na minha linha do tempo?",
    resposta:
      "Os marcos da sua jornada: lições concluídas, regras criadas, decisões registradas, revisões feitas e sequências de disciplina — ordenados no tempo para você ver a evolução.",
  },
  {
    topico: "Replay",
    pergunta: "O que é o replay de decisão?",
    resposta:
      "É reviver o instante exato de uma decisão passada: o payoff da estrutura, a volatilidade, a emoção registrada, o contexto e as regras da época. Serve para reconhecer padrões repetidos sem o custo de uma nova operação.",
  },
  {
    topico: "Copilot",
    pergunta: "Como o copilot funciona?",
    resposta:
      "Cada conversa é uma thread com contexto: dúvida de lição, análise de simulação ou revisão do diário. O copilot responde somente com base no conteúdo educacional, nas suas regras e no seu histórico — nunca com recomendação de compra ou venda de ativo específico.",
  },
  {
    topico: "Copilot · Limites",
    pergunta: "O copilot dá recomendação de investimento?",
    resposta:
      "Não. Se você perguntar 'devo comprar essa call?', ele redireciona: ajuda a analisar a estrutura, os riscos e a checar se ela respeita suas próprias regras — conteúdo educacional, não recomendação.",
  },
  {
    topico: "Voz",
    pergunta: "Como usar a conversa por voz?",
    resposta:
      "No chat do copilot, segure o botão do microfone ou a tecla Espaço para falar (Chrome/Edge). Com o modo 'conversa por voz' ativo, sua pergunta é enviada sozinha e a resposta é lida em voz alta. Se o navegador não suportar, o microfone não aparece e o texto continua funcionando.",
  },
  {
    topico: "Voz · Leitura",
    pergunta: "Posso ouvir uma resposta específica?",
    resposta:
      "Sim: cada resposta do copilot tem um botão de alto-falante que lê ou para a leitura daquela mensagem, com pronúncia de valores como 'R$450' (lido como 'quatrocentos e cinquenta reais').",
  },
  {
    topico: "Progresso",
    pergunta: "Como o progresso e o nível funcionam?",
    resposta:
      "Concluir uma lição (80%+ no quiz) dá 50 XP. O perfil tem nível atual e sequência de dias ativos; o painel 'Hoje' mostra prontidão e marcos. Progresso não é nota de conhecimento — é disciplina demonstrada.",
  },
  {
    topico: "Tributação",
    pergunta: "Quanto pago de IR sobre opções?",
    resposta:
      "Operações comuns (swing) pagam 15% sobre o lucro líquido do mês, via DARF código 6015; day trade paga 20%. Não há isenção de R$20 mil para opções. Prejuízos compensam lucros futuros da mesma modalidade, mês a mês, até zerar o acumulado. O IRRF retido é compensável.",
  },
  {
    topico: "Pausa",
    pergunta: "Posso pausar uma lição e continuar depois?",
    resposta:
      "Sim: o botão de pausa leva à trilha e seu progresso fica salvo (a trilha mostra 'continue de onde parou'). Missão, transferência e quiz da lição voltam exatamente de onde ficaram.",
  },
];

export function formatarGuiaParaPrompt(): string {
  return GUIA_PLATAFORMA.map((g) => `P: ${g.pergunta}\nR: ${g.resposta}`).join("\n\n");
}
