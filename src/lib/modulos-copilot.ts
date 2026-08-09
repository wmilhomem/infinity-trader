export type ModuloCopilot = {
  id: string;
  rotulo: string;
  padrao: RegExp;
  sugestoes: string[];
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
    id: "simulador",
    rotulo: "Simulador",
    padrao: /^\/simulador/,
    sugestoes: [
      "O que essa estrutura significa?",
      "Qual o breakeven da estrutura que montei?",
      "Qual o risco máximo e onde colocar meu stop?",
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

export function moduloAtual(pathname: string): ModuloCopilot | undefined {
  return MODULOS_COPILOT.find((m) => m.padrao.test(pathname));
}
