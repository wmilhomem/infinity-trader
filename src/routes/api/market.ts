import { createFileRoute } from "@tanstack/react-router";
import { RealGateway } from "@/server/market/real-gateway";

/**
 * /api/market?ativo=PETR4
 * Único ponto de acesso do frontend ao mercado real. O servidor conversa com
 * as fontes (Yahoo/B3/BCB), monta o payload cru e o HttpGateway client-side
 * o consome — o Confidence Engine audita o que sair daqui.
 */
const gateway = new RealGateway();

export const Route = createFileRoute("/api/market")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const ativo = (url.searchParams.get("ativo") ?? "PETR4").trim();
        if (!/^[A-Za-z0-9.-]{2,12}$/.test(ativo)) {
          return new Response("ativo inválido", { status: 400 });
        }

        const [assetRes, chainRes, diRes, eventsRes] = await Promise.allSettled([
          gateway.fetchAsset(ativo),
          gateway.fetchOptionChain(ativo),
          gateway.fetchDICurve(),
          gateway.fetchCorporateEvents(ativo),
        ]);

        if (assetRes.status === "rejected") {
          return new Response(
            JSON.stringify({
              error:
                assetRes.reason instanceof Error ? assetRes.reason.message : "mercado indisponível",
            }),
            { status: 502 },
          );
        }
        if (chainRes.status === "rejected") {
          return new Response(
            JSON.stringify({
              error:
                chainRes.reason instanceof Error ? chainRes.reason.message : "mercado indisponível",
            }),
            { status: 502 },
          );
        }

        return new Response(
          JSON.stringify({
            asset: assetRes.value,
            chain: chainRes.value,
            diCurve: diRes.status === "fulfilled" ? diRes.value : null,
            events: eventsRes.status === "fulfilled" ? eventsRes.value : null,
            quoteTime: new Date().toISOString(),
          }),
          {
            headers: { "content-type": "application/json", "cache-control": "no-store" },
          },
        );
      },
    },
  },
});
