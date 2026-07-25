export const RULE_TEMPLATES: { categoria: string; texto: string }[] = [
  { categoria: "risco", texto: "Nunca aloco mais que 2% do capital em uma única estrutura." },
  { categoria: "risco", texto: "Toda operação com opção tem risco 100% limitado (só compradas ou travas)." },
  { categoria: "tempo", texto: "Só compro opções com 45+ dias corridos até o vencimento." },
  { categoria: "rolagem", texto: "Rolo no máximo 1x por operação. Se falhar, encerro." },
  { categoria: "disciplina", texto: "Registro toda operação no diário no mesmo dia." },
  { categoria: "disciplina", texto: "Antes de abrir posição, escrevo qual tese e qual regra estou seguindo." },
  { categoria: "trava", texto: "Prefiro trava de alta a call sozinha quando extrínseco > 30% do prêmio." },
];

// ---------- Structured rules (indicadores técnicos + padrões de barras) ----------

export type IndicadorNome = "Média Móvel" | "VWAP" | "RSI" | "outro";
export type TimeframeUnidade = "minutos" | "horas" | "diário";

export interface IndicadorTecnicoParams {
  indicador: IndicadorNome;
  periodo?: number;
  timeframe?: TimeframeUnidade;
}

export interface PadraoBarrasParams {
  condicao: string;
  descricao?: string;
}

export type StructuredRuleTemplate =
  | {
      tipo: "indicador_tecnico";
      nome: string;
      categoria: string;
      parametros: IndicadorTecnicoParams;
    }
  | {
      tipo: "padrao_barras";
      nome: string;
      categoria: string;
      parametros: PadraoBarrasParams;
    };

export const INDICADOR_TEMPLATES: StructuredRuleTemplate[] = [
  {
    tipo: "indicador_tecnico",
    nome: "Média Móvel 200",
    categoria: "tendência longo prazo",
    parametros: { indicador: "Média Móvel", periodo: 200, timeframe: "diário" },
  },
  {
    tipo: "indicador_tecnico",
    nome: "Média Móvel 20",
    categoria: "tendência médio prazo",
    parametros: { indicador: "Média Móvel", periodo: 20, timeframe: "horas" },
  },
  {
    tipo: "indicador_tecnico",
    nome: "Média Móvel 9",
    categoria: "tendência curto prazo",
    parametros: { indicador: "Média Móvel", periodo: 9, timeframe: "minutos" },
  },
  {
    tipo: "indicador_tecnico",
    nome: "VWAP",
    categoria: "referência institucional",
    parametros: { indicador: "VWAP" },
  },
];

export const PADRAO_BARRAS_TEMPLATES: StructuredRuleTemplate[] = [
  {
    tipo: "padrao_barras",
    nome: "Verde com verde / vermelho com vermelho",
    categoria: "confirmação de direção",
    parametros: {
      condicao: "verde_com_verde",
      descricao:
        "Só confirmo direção quando a barra seguinte tem a mesma cor da anterior.",
    },
  },
  {
    tipo: "padrao_barras",
    nome: "Confirmação por volume",
    categoria: "confirmação de volume",
    parametros: {
      condicao: "confirmar_volume",
      descricao: "Confirmar se o movimento é verdadeiro ou falso pelo volume.",
    },
  },
  {
    tipo: "padrao_barras",
    nome: "Volume da 2ª barra < 1ª",
    categoria: "leitura de exaustão",
    parametros: {
      condicao: "volume_2a_menor_que_1a",
      descricao:
        "Volume da segunda barra menor que o volume da primeira barra sinaliza perda de força.",
    },
  },
];

export const STRUCTURED_TEMPLATES: StructuredRuleTemplate[] = [
  ...INDICADOR_TEMPLATES,
  ...PADRAO_BARRAS_TEMPLATES,
];
