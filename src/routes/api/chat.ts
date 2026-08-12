import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { formatarGuiaParaPrompt } from "@/lib/plataforma-guia";
import { padronizarCaminho } from "@/lib/caminho";
import {
  formatOmniscientContextForPrompt,
  type OmniscientContext,
} from "@/engines/omniscient-context";

type Body = { threadId: string; messages: { role: "user" | "assistant"; content: string }[] };

const SYSTEM_PROMPT = `Você é o Copilot do "Zero ao Trade", um app educacional sobre decisão em mercados da B3 (opções e day trade de WIN/WDO).
 
REGRAS ABSOLUTAS (nunca quebre):
- Responda SOMENTE com base no conteúdo educacional do app, nas regras que o usuário definiu, ou no histórico registrado por ele.
- NUNCA dê recomendação de compra/venda de um ativo específico ("devo comprar essa call?" → redirecione: "Isso é conteúdo educacional, não recomendação de investimento. Posso te ajudar a analisar a estrutura, os riscos e verificar se ela respeita suas próprias regras.").
- Não invente dados de mercado. Se o usuário citar preços reais, trate como hipótese didática.
- Use as MESMAS analogias do guia sempre que possível: vale-ingresso (call), seguro de carro (put), iogurte (extrínseco/intrínseco), plano de celular com teto (rolagem), carro de corrida com limitador (trava de alta).

TOM:
- Português brasileiro, direto, sem jargão desnecessário.
- Curto por padrão (2-4 parágrafos). Use listas quando ajudar.
- Nunca use "eu recomendo" — use "o guia mostra que…", "as regras que você definiu dizem…".

QUANDO O USUÁRIO PERGUNTAR SOBRE UMA DECISÃO OU SIMULAÇÃO DELE:
- Reforce se ela respeita as regras pessoais registradas.
- Explique por que o lucro máximo, breakeven ou perda máxima têm aquele valor.
- Nunca julgue se "é uma boa operação" — só explique a mecânica.

LEITURA DE MERCADO (aplique em qualquer pergunta sobre gráfico, indicador ou padrão):
- O fluxo é: Contexto → Observação → Hipótese → Regra → Simulação → Decisão → Registro → Revisão.
- Padrões (pavio superior, corpo longo, rompimento) e indicadores (MM9/MM20/MM200, VWAP, retrações de Fibonacci) são OBSERVAÇÃO — úteis como contexto de uma decisão, NUNCA como gatilho ("cruzou a média" ou "tocou 61,8%" não é motivo para comprar ou vender).
- Quando o usuário descrever um gráfico, ajude-o a separar FATO (o que o indicador calcula/mostra) de INTERPRETAÇÃO (o que isso significa no regime atual) — e lembre do contra-exemplo (whiplash em lateralização, falso rompimento, níveis sem a régua declarada).
- Nunca transforme um padrão ou indicador citado pelo usuário em recomendação de operação.
`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authHeader = request.headers.get("authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return new Response("Unauthorized", { status: 401 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const body = (await request.json()) as Body;
        if (!body?.messages?.length) return new Response("messages required", { status: 400 });

        // Load user context (rules + recent diary) via admin client, but scoped to the caller
        const token = authHeader.slice(7);
        const { createClient } = await import("@supabase/supabase-js");
        const supabaseUser = createClient(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          {
            global: {
              fetch: (input, init) => {
                const h = new Headers(init?.headers);
                if (h.get("Authorization") === `Bearer ${process.env.SUPABASE_PUBLISHABLE_KEY}`)
                  h.delete("Authorization");
                h.set("apikey", process.env.SUPABASE_PUBLISHABLE_KEY!);
                h.set("Authorization", `Bearer ${token}`);
                return fetch(input, { ...init, headers: h });
              },
            },
            auth: { persistSession: false, autoRefreshToken: false },
          },
        );

        const [rulesRes, diaryRes, threadRes] = await Promise.all([
          supabaseUser.from("personal_rules").select("categoria,texto").eq("ativa", true),
          supabaseUser
            .from("diary_entries")
            .select("ativo,estrutura,motivo,seguiu_regra,resultado,status,created_at")
            .order("created_at", { ascending: false })
            .limit(10),
          supabaseUser
            .from("chat_threads")
            .select("id,user_id,context_type,contexto")
            .eq("id", body.threadId)
            .maybeSingle(),
        ]);

        if (!threadRes.data) return new Response("Thread not found", { status: 404 });
        const userId = threadRes.data.user_id;
        const { data: perfil } = await supabaseUser
          .from("profiles")
          .select("caminho")
          .eq("id", userId)
          .maybeSingle();
        const caminho = padronizarCaminho(perfil?.caminho);

        const rulesText =
          (rulesRes.data ?? []).map((r) => `- [${r.categoria}] ${r.texto}`).join("\n") ||
          "(nenhuma)";
        const diaryText =
          (diaryRes.data ?? [])
            .map(
              (d) =>
                `- ${d.ativo} ${d.estrutura} (${d.status}) resultado=${d.resultado ?? "?"} seguiu_regra=${d.seguiu_regra}${d.motivo ? ` motivo="${d.motivo}"` : ""}`,
            )
            .join("\n") || "(vazio)";

        const contextBlock = `\n\n===\nCAMINHO DO USUÁRIO: ${
          caminho === "futuros"
            ? "day trade (WIN/WDO) — mini índice e mini dólar. Prefira exemplos de futuros: valor do ponto (WIN R$0,20 / WDO R$10), tick, margem mínima, ajuste diário, pregão 9h-18h, dimensionamento por stop."
            : caminho === "opcoes"
              ? "opções — calls e puts da B3. Prefira exemplos com as analogias do guia."
              : "geral — opções e day trade. Use o exemplo que melhor encaixar na pergunta."
        }\nREGRAS PESSOAIS DO USUÁRIO:\n${rulesText}\n\nÚLTIMAS 10 DECISÕES DO DIÁRIO:\n${diaryText}\n===\n`;

        const omniscient = formatOmniscientContextForPrompt(
          threadRes.data.contexto as unknown as OmniscientContext | null,
        );
        const guiaPlataforma =
          threadRes.data.context_type && threadRes.data.context_type !== "geral"
            ? `\n\nGUIA DA PLATAFORMA ZERO AO TRADE\nResponda dúvidas sobre o funcionamento do app com base nestes fatos (não invente funcionalidades que não estão aqui):\n${formatarGuiaParaPrompt()}\n`
            : "";
        const contextualSystem =
          SYSTEM_PROMPT +
          contextBlock +
          guiaPlataforma +
          (omniscient
            ? `\n\nQUANDO O USUÁRIO PERGUNTAR SOBRE ESTA SIMULAÇÃO:\n- Use os valores do CONTEXTO abaixo (breakevens, lucro máximo, perda máxima, gregas, PoP) para explicar a mecânica — eles são hipótese didática, não dado real de mercado.\n- Explique POR QUE cada número tem aquele valor usando as analogias do guia (vale-ingresso, seguro de carro, iogurte, plano de celular, carro de corrida).\n- Se a estrutura violar uma regra pessoal do usuário ou gerar alerta, aponte de forma direta e educativa.\n\n${omniscient}\n`
            : "");

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3.6-flash");

        try {
          const result = await generateText({
            model,
            system: contextualSystem,
            messages: body.messages,
          });

          // persist both messages
          await supabaseUser.from("chat_messages").insert([
            {
              thread_id: body.threadId,
              user_id: userId,
              role: "user",
              content: body.messages[body.messages.length - 1].content,
            },
            {
              thread_id: body.threadId,
              user_id: userId,
              role: "assistant",
              content: result.text,
            },
          ]);
          await supabaseUser
            .from("chat_threads")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", body.threadId);

          return Response.json({ text: result.text });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          const queueFull = /503/.test(msg) || /request queue is full/i.test(msg);
          const status = /429/.test(msg) ? 429 : /402/.test(msg) ? 402 : queueFull ? 503 : 500;
          return new Response(
            status === 429
              ? "Muitas requisições. Tente novamente em instantes."
              : status === 402
                ? "Créditos de IA esgotados. Adicione créditos na sua workspace."
                : status === 503
                  ? "A fila de requisições de IA está cheia no momento. Tente novamente em instantes."
                  : msg,
            { status },
          );
        }
      },
    },
  },
});
