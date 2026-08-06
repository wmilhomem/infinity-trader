/**
 * INTENÇÃO — a pergunta mais importante do Check de 60 segundos.
 * "Por que você quer operar hoje?" Intenção precede comportamento: a pessoa
 * pode não perceber a própria emoção, mas sabe perfeitamente por que abriu
 * o aplicativo. Cada resposta vira um sinal de risco + uma mensagem humana.
 */

export type EstadoMental = "tranquilo" | "cansado" | "ansioso" | "frustrado" | "eufórico";

export type MotivoIntencao = "oportunidade" | "rotina" | "recuperar" | "tedio" | "fomo" | "outro";

export type Severidade = "ok" | "aviso" | "alerta";

export type SinalIntencao = {
  severidade: Severidade;
  rotulo: string;
  mensagem: string;
};

const ESTADOS: Record<EstadoMental, SinalIntencao> = {
  tranquilo: {
    severidade: "ok",
    rotulo: "Calmo",
    mensagem: "Cabeça tranquila. É o melhor estado para decidir com processo.",
  },
  cansado: {
    severidade: "aviso",
    rotulo: "Cansado",
    mensagem: "Mente cansada subestima riscos. Considere reduzir o tamanho ou adiar.",
  },
  ansioso: {
    severidade: "aviso",
    rotulo: "Ansioso",
    mensagem: "Ansiedade antecipa decisões. Verifique se a hipótese existe de verdade.",
  },
  frustrado: {
    severidade: "alerta",
    rotulo: "Frustrado",
    mensagem: "Frustração vira vingança com facilidade. É o estado mais perigoso para operar.",
  },
  eufórico: {
    severidade: "alerta",
    rotulo: "Eufórico",
    mensagem:
      "Euforia confunde sorte com método. O excesso de confiança precede os maiores prejuízos.",
  },
};

const MOTIVOS: Record<MotivoIntencao, SinalIntencao> = {
  oportunidade: {
    severidade: "ok",
    rotulo: "Oportunidade",
    mensagem:
      "Você viu algo no mercado. Ótimo começo — agora coloque a hipótese no papel antes de agir.",
  },
  rotina: {
    severidade: "aviso",
    rotulo: "Rotina",
    mensagem: "Operar por rotina não é hipótese. Pergunte-se: o que o mercado te mostrou hoje?",
  },
  recuperar: {
    severidade: "alerta",
    rotulo: "Recuperação agressiva",
    mensagem:
      "Operar para recuperar perda é o caminho mais curto para perder mais. Reduza o tamanho ou não opere hoje.",
  },
  tedio: {
    severidade: "alerta",
    rotulo: "Tédio",
    mensagem: "Tédio faz a mão apertar o gatilho sem razão. Sem hipótese, não há decisão.",
  },
  fomo: {
    severidade: "alerta",
    rotulo: "Medo de ficar de fora",
    mensagem: "Entrar porque todo mundo está comprando é o padrão clássico de comprar o topo.",
  },
  outro: {
    severidade: "aviso",
    rotulo: "Sem classificação",
    mensagem: "Antes de operar, escreva exatamente o que você espera que aconteça.",
  },
};

export function avaliarEstadoMental(estado: EstadoMental): SinalIntencao {
  return ESTADOS[estado];
}

export function avaliarIntencao(motivo: MotivoIntencao): SinalIntencao {
  return MOTIVOS[motivo];
}
