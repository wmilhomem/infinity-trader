export type ModuloCopilot = {
  id: string;
  rotulo: string;
  padrao: RegExp;
  sugestoes: string[];
  sugestoesProvenance?: string[];
  ocultarBubble?: boolean;
};

export const MODULOS_COPILOT: ModuloCopilot[] = [
  {
    id: "inicio",
    rotulo: "Início",
    padrao: /^\/home/,
    sugestoes: [
      "O que é o check cognitivo e quando ele bloqueia?",
      "O que o painel 'Hoje' considera na minha prontidão?",
      "Como o ritual de fechamento ajuda minha disciplina?",
    ],
  },
  {
    id: "trilha",
    rotulo: "Trilha",
    padrao: /^\/trilha/,
    sugestoes: [
      "Por que o quiz exige 80% para liberar a próxima lição?",
      "O que é a missão da lição e a pergunta de transferência?",
      "Como meu progresso na trilha é medido?",
    ],
  },
  {
    id: "licao",
    rotulo: "Lição",
    padrao: /^\/licao/,
    sugestoes: [
      "O que preciso fazer para concluir uma lição?",
      "Posso refazer o quiz da lição?",
      "O que o domínio da lição (reconheceu, aplicou, explicou) significa?",
    ],
  },
  {
    id: "laboratorio",
    rotulo: "Laboratório de Estratégias",
    padrao: /^\/laboratorio/,
    sugestoes: [
      "Como o laboratório transforma minha hipótese em estruturas?",
      "Por que nenhuma ficha do laboratório é recomendação?",
      "Qual a diferença entre uma trava e uma estrutura sozinha?",
      "Como levo uma ficha do laboratório para o simulador?",
    ],
  },
  {
    id: "simulador",
    rotulo: "Simulador",
    padrao: /^\/simulador/,
    sugestoes: [
      "O que essa estrutura significa?",
      "Qual o breakeven da estrutura que montei?",
      "Qual o risco máximo e onde colocar meu stop?",
    ],
    sugestoesProvenance: [
      "Como sei se o IV que estou vendo foi observado ou calculado?",
      "Esse Expected Move foi calculado com qual IV?",
      "Por que este dado está marcado como 'suspeito'?",
      "Qual era a qualidade dos dados quando registrei esta decisão?",
    ],
  },
  {
    id: "regras",
    rotulo: "Regras",
    padrao: /^\/regras/,
    sugestoes: [
      "Como criar uma regra que eu consiga seguir?",
      "Os templates de regras valem para mim?",
      "Como o simulador e o diário usam minhas regras?",
    ],
  },
  {
    id: "diario",
    rotulo: "Diário",
    padrao: /^\/diario/,
    sugestoes: [
      "O que devo registrar no diário?",
      "O que o snapshot cognitivo captura?",
      "Por que registrar a emoção junto com a decisão?",
    ],
    sugestoesProvenance: [
      "O que significa 'dado observado' vs 'dado calculado'?",
      "Como a provenance dos dados afeta minha decisão?",
      "Por que alguns dados estão ausentes e outros não?",
    ],
  },
  {
    id: "revisao",
    rotulo: "Revisão",
    padrao: /^\/revisao/,
    sugestoes: ["Como o grafo pessoal é construído?", "O que as métricas de disciplina medem?"],
  },
  {
    id: "espelho",
    rotulo: "Espelho",
    padrao: /^\/espelho/,
    sugestoes: ["O que o espelho mostra sobre minha evolução?", "O espelho julga minhas decisões?"],
  },
  {
    id: "historia",
    rotulo: "História",
    padrao: /^\/historia/,
    sugestoes: [
      "O que aparece na minha linha do tempo?",
      "Como a história usa meus marcos de disciplina?",
    ],
  },
  {
    id: "replay",
    rotulo: "Replay",
    padrao: /^\/replay/,
    sugestoes: ["O que o replay mostra sobre uma decisão?", "Para que serve reviver uma decisão?"],
    sugestoesProvenance: [
      "O que a provenance dos dados no replay significa?",
      "Por que alguns dados antigos não têm provenance?",
      "Qual a diferença entre dado observado e calculado no replay?",
      "Este replay foi feito com dados reais ou reconstruídos?",
    ],
  },
  {
    id: "copilot",
    rotulo: "Copilot",
    padrao: /^\/copilot/,
    sugestoes: [],
    ocultarBubble: true,
  },
  {
    id: "onboarding",
    rotulo: "Onboarding",
    padrao: /^\/onboarding/,
    sugestoes: [],
    ocultarBubble: true,
  },
];

export const SUGESTOES_GLOBAIS = [
  "Como funciona a conversa por voz?",
  "O copilot dá recomendação de investimento?",
];

export const SUGESTOES_PROVENANCE_GLOBAIS = [
  "O que significa quando um dado é 'observado'?",
  "Qual a diferença entre dado 'calculado' e 'estimado'?",
  "Por que vejo 'dado suspeito' às vezes?",
  "O que é a proveniência de um dado de mercado?",
  "Como sei se posso confiar neste dado?",
];

export function sugestoesProvenance(modulo: ModuloCopilot | undefined): string[] {
  return modulo?.sugestoesProvenance ?? SUGESTOES_PROVENANCE_GLOBAIS;
}

export function moduloAtual(pathname: string): ModuloCopilot | undefined {
  return MODULOS_COPILOT.find((m) => m.padrao.test(pathname));
}
