import type { DiaryEntry } from "./types";
import { obj, txt } from "./decision-memory-reader";

/**
 * PERSONAL KNOWLEDGE GRAPH — a memória vira um grafo.
 * Conceitos, estruturas, emoções, regras e desfechos se conectam pela
 * frequência com que apareceram juntos nas suas decisões. Theta se
 * relaciona com Iron Condor, que se relaciona com o erro recorrente, que
 * se relaciona com o medo, que se relaciona com a quebra da sua regra.
 * O grafo permite explicações que listas não permitem.
 */

export type NoTipo = "estrategia" | "emocao" | "regra" | "desfecho" | "conceito";

export type GrafoNo = {
  id: string;
  rotulo: string;
  tipo: NoTipo;
  peso: number;
};

export type GrafoLigacao = {
  de: string;
  para: string;
  peso: number;
};

export type GrafoPessoal = {
  nos: GrafoNo[];
  ligacoes: GrafoLigacao[];
  caminho: { id: string; rotulo: string; tipo: NoTipo }[];
  explicacao: string;
};

const CONCEITO_POR_SLUG: Record<string, string> = {
  "compra-a-seco": "Compra de opção a seco",
  "venda-coberta": "Venda coberta",
  "trava-de-alta": "Travas de alta",
  "trava-de-baixa": "Travas de baixa",
  "rolagem-defensiva": "Rolagem defensiva",
  "theta-e-tempo": "Theta e tempo",
  "gestao-de-risco-travas": "Gestão de risco",
};

const TIPO_LABEL: Record<NoTipo, string> = {
  estrategia: "estratégia",
  emocao: "emoção",
  regra: "regra",
  desfecho: "desfecho",
  conceito: "conceito",
};

function nomeEstrategia(e: DiaryEntry): string {
  const i = obj(e.interpretacao);
  const n = txt(i?.nome);
  if (n) return n;
  return e.estrutura || "estrutura não informada";
}

function slugLicao(e: DiaryEntry): string | null {
  const i = obj(e.interpretacao);
  const s = txt(i?.licaoSlug);
  if (s && CONCEITO_POR_SLUG[s]) return s;
  const t = (e.estrutura ?? "").toLowerCase();
  if (
    t.includes("iron condor") ||
    t.includes("borboleta") ||
    t.includes("straddle") ||
    t.includes("strangle")
  )
    return "theta-e-tempo";
  if (t.includes("compra") && (t.includes("call") || t.includes("put"))) return "compra-a-seco";
  if (t.includes("trava")) return t.includes("baixa") ? "trava-de-baixa" : "trava-de-alta";
  const l = (e.licao_aprendida ?? "").toLowerCase();
  if (l.includes("theta") || l.includes("tempo") || l.includes("vencimento"))
    return "theta-e-tempo";
  if (l.includes("tamanho") || l.includes("risco")) return "gestao-de-risco-travas";
  return null;
}

export function construirGrafo(
  entries: DiaryEntry[],
  rules: { id: string; texto: string }[],
): GrafoPessoal | null {
  if (entries.length === 0) return null;

  const nos = new Map<string, GrafoNo>();
  const ligacoes = new Map<string, number>();

  const addNo = (id: string, rotulo: string, tipo: NoTipo) => {
    if (!nos.has(id)) nos.set(id, { id, rotulo, tipo, peso: 0 });
    nos.get(id)!.peso++;
  };

  const link = (a: string | null, b: string | null) => {
    if (!a || !b || a === b) return;
    const chave = a < b ? `${a}¦${b}` : `${b}¦${a}`;
    ligacoes.set(chave, (ligacoes.get(chave) ?? 0) + 1);
  };

  const ruleTexto = new Map(rules.map((r) => [r.id, r.texto]));

  for (const e of entries) {
    const estrategia = nomeEstrategia(e);
    const idEstr = `estr:${estrategia}`;
    addNo(idEstr, estrategia, "estrategia");

    const emocao = e.emocao;
    let idEmo: string | null = null;
    if (emocao) {
      idEmo = `emo:${emocao}`;
      addNo(idEmo, emocao, "emocao");
    }

    let idRegra: string | null = e.rule_id ? `regra:${e.rule_id}` : null;
    if (idRegra) {
      const textoRegra = ruleTexto.get(e.rule_id as string) ?? "regra aplicada";
      addNo(idRegra, textoRegra, "regra");
    } else if (e.seguiu_regra === false) {
      idRegra = "regra:nao-identificada";
      addNo(idRegra, "Regra quebrada (não identificada)", "regra");
    }

    const temResultado = e.status === "encerrada" && e.resultado !== null && e.resultado !== 0;
    const idDesfecho: string | null = temResultado
      ? e.resultado! > 0
        ? "res:lucro"
        : "res:prejuizo"
      : null;
    if (idDesfecho) {
      addNo(idDesfecho, idDesfecho === "res:lucro" ? "Lucro" : "Prejuízo", "desfecho");
    }

    const slug = slugLicao(e);
    const idConceito: string | null = slug ? `con:${slug}` : null;
    if (idConceito) {
      addNo(idConceito, CONCEITO_POR_SLUG[slug as string], "conceito");
    }

    link(idEstr, idEmo);
    link(idEstr, idRegra);
    link(idEstr, idDesfecho);
    link(idEstr, idConceito);
    link(idEmo, idRegra);
    link(idEmo, idDesfecho);
    link(idRegra, idDesfecho);
    link(idRegra, idConceito);
  }

  const arestas = [...ligacoes.entries()].map(([chave, peso]) => {
    const [a, b] = chave.split("¦");
    return { de: a, para: b, peso };
  });

  const pesoEntre = (a: string, b: string) =>
    arestas.find((l) => (l.de === a && l.para === b) || (l.de === b && l.para === a))?.peso ?? 0;

  const vizinhosMaisForte = (id: string, exceto: Set<string>) =>
    arestas
      .filter((l) => (l.de === id || l.para === id) && !exceto.has(l.de === id ? l.para : l.de))
      .map((l) => ({ id: l.de === id ? l.para : l.de, peso: l.peso }))
      .sort((x, y) => y.peso - x.peso)[0] ?? null;

  // Caminho principal: começa na estratégia mais ligada a prejuízo.
  const estrategia = [...nos.values()].find(
    (n) => n.tipo === "estrategia" && pesoEntre(n.id, "res:prejuizo") > 0,
  );
  const inicio =
    estrategia ??
    [...nos.values()].filter((n) => n.tipo === "estrategia").sort((a, b) => b.peso - a.peso)[0];

  const caminho: GrafoPessoal["caminho"] = [];
  if (inicio) {
    const visitados = new Set<string>();
    let atual = inicio;
    caminho.push({ id: atual.id, rotulo: atual.rotulo, tipo: atual.tipo });
    visitados.add(atual.id);

    const desejo: NoTipo[] = ["emocao", "regra", "desfecho", "conceito"];
    for (let passo = 0; passo < 5; passo++) {
      const v = vizinhosMaisForte(atual.id, visitados);
      if (!v) break;
      const no = nos.get(v.id)!;
      visitados.add(v.id);
      caminho.push({ id: no.id, rotulo: no.rotulo, tipo: no.tipo });
      atual = no;
    }
  }

  const explicacao =
    caminho.length >= 2
      ? `Na sua história, ${caminho
          .map((n, i) =>
            i === 0
              ? n.rotulo
              : `${i === caminho.length - 1 ? "e" : "e depois"} ${n.rotulo} (${TIPO_LABEL[n.tipo]})`,
          )
          .join(
            " ",
          )}. Este é o caminho mais frequente que o sistema enxergou nos seus registros — nenhuma explicação vinda de uma lista caberia assim.`
      : "Continue registrando decisões: o grafo começa a revelar os caminhos escondidos entre suas emoções, regras e estruturas.";

  return {
    nos: [...nos.values()].sort((a, b) => b.peso - a.peso),
    ligacoes: arestas.sort((a, b) => b.peso - a.peso),
    caminho,
    explicacao,
  };
}
