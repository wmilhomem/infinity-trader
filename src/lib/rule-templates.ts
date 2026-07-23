export const RULE_TEMPLATES: { categoria: string; texto: string }[] = [
  { categoria: "risco", texto: "Nunca aloco mais que 2% do capital em uma única estrutura." },
  { categoria: "risco", texto: "Toda operação com opção tem risco 100% limitado (só compradas ou travas)." },
  { categoria: "tempo", texto: "Só compro opções com 45+ dias corridos até o vencimento." },
  { categoria: "rolagem", texto: "Rolo no máximo 1x por operação. Se falhar, encerro." },
  { categoria: "disciplina", texto: "Registro toda operação no diário no mesmo dia." },
  { categoria: "disciplina", texto: "Antes de abrir posição, escrevo qual tese e qual regra estou seguindo." },
  { categoria: "trava", texto: "Prefiro trava de alta a call sozinha quando extrínseco > 30% do prêmio." },
];
