// Cadeia de Evidência — o registro do processo cognitivo que produziu a decisão.
//
// Estrutura persistida do caminho percorrido antes de decidir:
//
//   Representação → Observação → Interpretação → Hipótese → Evidências →
//   Contra-evidências → Regra → Risco → Decisão → Registro → Revisão
//
// REGRA FUNDAMENTAL — evidência descreve um FATO contextualizado, nunca
// carrega decisão implícita:
//
//   Bom:  "VWAP: preço acima da VWAP"
//   Ruim: "VWAP: preço acima da VWAP → sinal de compra"
//   Bom:  "Foram observados quatro blocos Renko consecutivos na mesma direção."
//   Ruim: "Quatro blocos Renko indicam entrada."
//
// A decisão é tomada pela pessoa na etapa `decisao`. O sistema lê a cadeia
// para dizer "esta decisão possui cadeia de evidência" — ou, para decisões
// antigas, "a cadeia de evidência não foi registrada nesta decisão".
// Decisões antigas nunca são reconstruídas artificialmente.
//
// Domínio puro: sem React, sem Supabase, sem IA, sem cálculo de mercado.

import type { Evidencia, RepresentacaoMercado } from "./market-reading";

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export const DECISOES_CADEIA = ["seguir", "nao-seguir", "observar", "simular"] as const;
export type DecisaoDaCadeia = (typeof DECISOES_CADEIA)[number];

export const DECISAO_LABELS: Record<DecisaoDaCadeia, string> = {
  seguir: "Seguir",
  "nao-seguir": "Não seguir",
  observar: "Observar",
  simular: "Simular",
};

export type CadeiaEvidencia = {
  representacao: RepresentacaoMercado;
  observacao: string;
  interpretacao: string;
  hipotese: string;
  evidencias: Evidencia[];
  contraEvidencias: Evidencia[];
  regra: string;
  risco: string;
  decisao: DecisaoDaCadeia;
};

export type ProblemaCadeia = {
  campo: string;
  indice?: number;
  motivo: string;
};

export type ValidacaoCadeia = {
  ok: boolean;
  problemas: ProblemaCadeia[];
};

/** As etapas da cadeia, no fluxo em que o usuário as percorre. */
export const ETAPAS_CADEIA: { etapa: string; pergunta: string }[] = [
  { etapa: "Representação", pergunta: "Qual lente você usou para olhar o mercado?" },
  { etapa: "Observação", pergunta: "O que você viu?" },
  { etapa: "Interpretação", pergunta: "O que isso significa para você?" },
  { etapa: "Hipótese", pergunta: "O que você acredita que está acontecendo?" },
  { etapa: "Evidências", pergunta: "O que sustenta sua hipótese?" },
  { etapa: "Contra-evidência", pergunta: "O que contradiz sua hipótese?" },
  { etapa: "Regra", pergunta: "O que sua própria regra exige?" },
  { etapa: "Risco", pergunta: "O que acontece se sua hipótese estiver errada?" },
  { etapa: "Decisão", pergunta: "Você segue, não segue, observa ou simula?" },
];

// ---------------------------------------------------------------------------
// Detecção de decisão implícita na evidência
// ---------------------------------------------------------------------------

type PadraoDecisao = { rotulo: string; re: RegExp };

/** Padrões prescritivos, sem acentos (o texto é normalizado antes de casar). */
const PADROES_DECISAO_IMPLICITA: PadraoDecisao[] = [
  { rotulo: "sinal de compra/venda/entrada", re: /\bsinal\s+de\s+(compra|venda|entrada|saida)\b/i },
  {
    rotulo: "indica/aponta compra ou venda",
    re: /\b(indicam?|apontam?|sugerem?)\s+(compra|venda|entrada|saida)\b/i,
  },
  { rotulo: "ordem de compra/venda", re: /\bordem\s+de\s+(compra|venda|entrada|saida)\b/i },
  { rotulo: "gatilho", re: /\bgatilho\b/i },
  { rotulo: "recomendação", re: /\brecomend/i },
  { rotulo: "hora de comprar/vender", re: /\bhora\s+de\s+(comprar|vender|entrar|sair|zerar)\b/i },
  { rotulo: "deve comprar/vender", re: /\bdeve\s+(comprar|vender|entrar|sair|zerar)\b/i },
  {
    rotulo: "oportunidade de compra/venda",
    re: /\boportunidade\s+de\s+(compra|venda|entrada|saida)\b/i,
  },
  {
    rotulo: "seta de conclusão (→ ação)",
    re: /\u2192\s*(comprar|vender|entrar|sair|operar|acumular|zerar|entrada|saida)\b/i,
  },
];

function semAcentos(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Negação próxima ao padrão (antes ou depois) anula a prescrição: "não é sinal de compra". */
function negada(texto: string, posicao: number, tamanho: number): boolean {
  const antes = texto.slice(Math.max(0, posicao - 30), posicao);
  const depois = texto.slice(posicao + tamanho, posicao + tamanho + 30);
  return /\b(nao|sem|nem)\b/i.test(antes) || /\b(nao|sem|nem)\b/i.test(depois);
}

/**
 * Verifica se uma descrição de evidência carrega decisão implícita.
 * Evidência descreve o que sustenta; a decisão é da pessoa, na etapa `decisao`.
 */
export function decisaoImplicitaNaEvidencia(descricao: string): {
  viola: boolean;
  trecho?: string;
} {
  const texto = semAcentos(descricao.trim());
  for (const p of PADROES_DECISAO_IMPLICITA) {
    const re = new RegExp(
      p.re.source,
      `${p.re.flags.includes("g") ? p.re.flags : `${p.re.flags}g`}`,
    );
    let m: RegExpExecArray | null;
    while ((m = re.exec(texto)) !== null) {
      if (!negada(texto, m.index, m[0].length)) {
        return { viola: true, trecho: descricao.slice(m.index, m.index + m[0].length) };
      }
    }
  }
  return { viola: false };
}

// ---------------------------------------------------------------------------
// Normalização
// ---------------------------------------------------------------------------

function chaveEvidencia(e: Evidencia): string {
  return `${e.camada}\u0000${e.descricao.trim()}`;
}

/**
 * Normaliza a cadeia: limpa espaços, remove evidências vazias e duplicadas
 * (mesma camada + descrição) dentro de cada lista.
 */
export function normalizarCadeiaEvidencia(cadeia: CadeiaEvidencia): CadeiaEvidencia {
  const limpar = (s: string) => s.replace(/\s+/g, " ").trim();
  const unicos = (lista: Evidencia[]) => {
    const vistos = new Set<string>();
    return lista.filter((e) => {
      if (!e.descricao.trim()) return false;
      const chave = chaveEvidencia(e);
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
  };
  return {
    representacao: cadeia.representacao,
    observacao: limpar(cadeia.observacao),
    interpretacao: limpar(cadeia.interpretacao),
    hipotese: limpar(cadeia.hipotese),
    evidencias: unicos(cadeia.evidencias),
    contraEvidencias: unicos(cadeia.contraEvidencias),
    regra: limpar(cadeia.regra),
    risco: limpar(cadeia.risco),
    decisao: cadeia.decisao,
  };
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

const CAMADAS_VALIDAS: Evidencia["camada"][] = ["tecnico", "fundamentalista", "derivativos"];

function validarEvidencia(
  e: Evidencia,
  campo: string,
  indice: number,
  problemas: ProblemaCadeia[],
): void {
  if (!e.descricao.trim()) {
    problemas.push({ campo, indice, motivo: "Evidência sem descrição." });
    return;
  }
  if (!CAMADAS_VALIDAS.includes(e.camada)) {
    problemas.push({ campo, indice, motivo: `Camada de evidência inválida: ${e.camada}.` });
  }
  const implicita = decisaoImplicitaNaEvidencia(e.descricao);
  if (implicita.viola) {
    problemas.push({
      campo,
      indice,
      motivo: `Evidência carrega decisão implícita (“${implicita.trecho}”). A evidência descreve o que sustenta; a decisão é da pessoa, na etapa “decisão”.`,
    });
  }
}

/**
 * Valida a cadeia inteira: etapas obrigatórias preenchidas, interpretação
 * distinta da observação, evidências sem decisão implícita, mesma evidência
 * não pode defender e contradizer ao mesmo tempo, e decisão coerente com o
 * que foi sustentado (seguir exige sustentação E contra-evidência considerada).
 */
export function validarCadeiaEvidencia(cadeia: CadeiaEvidencia): ValidacaoCadeia {
  const n = normalizarCadeiaEvidencia(cadeia);
  const problemas: ProblemaCadeia[] = [];

  const exigido = (campo: keyof CadeiaEvidencia, valor: string, rotulo: string) => {
    if (!valor) {
      problemas.push({
        campo,
        motivo: `A etapa “${rotulo}” precisa ser preenchida — é parte do processo que você registra.`,
      });
    }
  };

  exigido("observacao", n.observacao, "observação");
  exigido("interpretacao", n.interpretacao, "interpretação");
  exigido("hipotese", n.hipotese, "hipótese");
  exigido("regra", n.regra, "regra");
  exigido("risco", n.risco, "risco");

  if (
    n.observacao &&
    semAcentos(n.interpretacao).toLowerCase() === semAcentos(n.observacao).toLowerCase()
  ) {
    problemas.push({
      campo: "interpretacao",
      motivo:
        "Interpretação idêntica à observação: esta etapa exige o que o que você viu significa para você, não o que você viu.",
    });
  }

  n.evidencias.forEach((e, i) => validarEvidencia(e, "evidencias", i, problemas));
  n.contraEvidencias.forEach((e, i) => validarEvidencia(e, "contraEvidencias", i, problemas));

  const chavesSustentam = new Set(n.evidencias.map(chaveEvidencia));
  for (const c of n.contraEvidencias) {
    if (chavesSustentam.has(chaveEvidencia(c))) {
      problemas.push({
        campo: "contraEvidencias",
        motivo: `“${c.descricao}” aparece como sustentação E como contra-evidência — a mesma evidência não pode defender e contradizer ao mesmo tempo.`,
      });
    }
  }

  if (n.decisao === "seguir") {
    if (n.evidencias.length === 0) {
      problemas.push({
        campo: "evidencias",
        motivo: "Decidir seguir exige ao menos uma evidência que sustente a hipótese.",
      });
    }
    if (n.contraEvidencias.length === 0) {
      problemas.push({
        campo: "contraEvidencias",
        motivo:
          "Decidir seguir exige considerar o que contradiz a hipótese — mesmo que você a descarte depois.",
      });
    }
  }

  return { ok: problemas.length === 0, problemas };
}

// ---------------------------------------------------------------------------
// Construção
// ---------------------------------------------------------------------------

/**
 * Constrói a cadeia a partir da entrada bruta: normaliza e valida.
 * A validacao retornada é a fonte de verdade para a UI; a cadeia normalizada
 * é o que deve ser persistido quando a validacao for ok.
 */
export function construirCadeiaEvidencia(input: CadeiaEvidencia): {
  cadeia: CadeiaEvidencia;
  validacao: ValidacaoCadeia;
} {
  const cadeia = normalizarCadeiaEvidencia(input);
  const validacao = validarCadeiaEvidencia(cadeia);
  return { cadeia, validacao };
}

// ---------------------------------------------------------------------------
// Leitura segura (JSON → cadeia tipada)
// ---------------------------------------------------------------------------

function guardEvidencia(v: unknown): Evidencia | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;
  if (!CAMADAS_VALIDAS.includes(o.camada as Evidencia["camada"])) return null;
  const descricao = typeof o.descricao === "string" ? o.descricao.trim() : "";
  if (!descricao) return null;
  return { camada: o.camada as Evidencia["camada"], descricao };
}

function guardDecisao(v: unknown): DecisaoDaCadeia | null {
  return DECISOES_CADEIA.includes(v as DecisaoDaCadeia) ? (v as DecisaoDaCadeia) : null;
}

/**
 * Lê uma cadeia persistida (JSON) e devolve a versão tipada, ou null quando
 * ausente ou malformada. Nunca reconstitui uma cadeia que não foi registrada.
 */
export function lerCadeiaEvidencia(v: unknown): CadeiaEvidencia | null {
  if (!v || typeof v !== "object" || Array.isArray(v)) return null;
  const o = v as Record<string, unknown>;

  const representacao =
    o.representacao === "candle" || o.representacao === "renko" ? o.representacao : null;
  if (!representacao) return null;

  const texto = (s: unknown): string | null =>
    typeof s === "string" && s.trim() ? s.trim() : null;

  const observacao = texto(o.observacao);
  const interpretacao = texto(o.interpretacao);
  const hipotese = texto(o.hipotese);
  const regra = texto(o.regra);
  const risco = texto(o.risco);
  if (!observacao || !interpretacao || !hipotese || !regra || !risco) return null;

  const decisao = guardDecisao(o.decisao);
  if (!decisao) return null;

  const evidencias = Array.isArray(o.evidencias)
    ? o.evidencias.map(guardEvidencia).filter((e): e is Evidencia => e !== null)
    : [];
  const contraEvidencias = Array.isArray(o.contraEvidencias)
    ? o.contraEvidencias.map(guardEvidencia).filter((e): e is Evidencia => e !== null)
    : [];

  return {
    representacao,
    observacao,
    interpretacao,
    hipotese,
    evidencias,
    contraEvidencias,
    regra,
    risco,
    decisao,
  };
}
