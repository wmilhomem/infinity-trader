import type { EstadoMental } from "./intencao";

/**
 * RITUAL — o fechamento do dia.
 * O check abre o dia perguntando "por que você quer operar?"; o ritual
 * fecha perguntando "o que você levou?". Nada aqui é adivinhado: a
 * leitura de fechamento nasce de quatro fatos observáveis do dia.
 */

export type FechamentoRitual = {
  titulo: string;
  texto: string;
  tom: "verde" | "amarelo" | "vermelho" | "neutro";
};

export function fechamentoDoRitual(input: {
  estado: EstadoMental | null;
  operouHoje: boolean;
  registrouHoje: boolean;
  conteudo: string;
  checkHoje: boolean;
}): FechamentoRitual {
  const conteudoLimpo = (input.conteudo ?? "").trim();
  const estadoAlerta = input.estado === "frustrado" || input.estado === "eufórico";
  const estadoAviso = input.estado === "cansado" || input.estado === "ansioso";

  if (input.operouHoje && !input.registrouHoje) {
    return {
      titulo: "O ritual ainda não fechou.",
      texto:
        "Você operou hoje, mas a decisão ainda não tem nome no diário. Volte quando ela estiver registrada — o ritual só fecha com decisão registrada.",
      tom: "vermelho",
    };
  }

  if (input.operouHoje) {
    const partes: string[] = [];
    if (input.checkHoje) {
      partes.push(
        "Você abriu o dia com o check e fecha com o ritual: ciclo completo, e o sistema tem as duas pontas do dia.",
      );
    } else {
      partes.push(
        "Você registrou o que decidiu — é assim que um processo se constrói. Amanhã, abra o dia com o check de 60 segundos para fechar o ciclo.",
      );
    }
    if (conteudoLimpo) {
      partes.push(
        "E ainda levou uma reflexão do dia: isso é o que transforma operação em aprendizado.",
      );
    }
    if (estadoAlerta) {
      partes.push(
        "Você fechou o dia frustrado ou eufórico — não deixe esse estado escolher o tamanho da operação de amanhã.",
      );
    }
    return {
      titulo: "Dia fechado com decisão registrada.",
      texto: partes.join(" "),
      tom: estadoAlerta ? "amarelo" : "verde",
    };
  }

  const partes: string[] = [
    "Você não operou hoje — e registrou isso. Não operar também é decisão, e o mercado continua aqui amanhã.",
  ];
  if (conteudoLimpo) {
    partes.push("Guarde o que você levou do dia: ele já faz parte de quem você está se tornando.");
  } else {
    partes.push("Sem reflexão registrada — está tudo bem. Amanhã é outro dia.");
  }
  if (estadoAlerta) {
    partes.push(
      "E cuide do fechamento: frustração ou euforia não devem escolher a decisão de amanhã.",
    );
  }
  return {
    titulo: "Dia fechado em paz.",
    texto: partes.join(" "),
    tom: estadoAlerta ? "amarelo" : estadoAviso ? "verde" : "verde",
  };
}
