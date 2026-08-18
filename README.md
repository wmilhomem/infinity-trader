# Infinity Trader — Zero ao Trade

Decision Operating System (DOS) que ensina opções e futuros da B3 do zero até
estratégias estruturadas, e ajuda o usuário a definir, simular, registrar e
revisar as próprias decisões de operação.

O princípio que atravessa todo o produto:

> **O copilot informa. O sistema contextualiza. O usuário decide.**

Nada no produto vira recomendação de compra ou venda. Padrões de gráfico são
observação, não sinal. Estruturas expressam hipóteses, nunca conselhos. A
decisão — e o processo em torno dela — é sempre do usuário.

## Princípios pedagógicos

- **Camada de leitura de mercado**: o fluxo é `Contexto → Observação → Hipótese
  → Regra → Simulação → Decisão → Registro → Revisão`. Padrão + contexto +
  regra pessoal + risco = evidência. Padrão sozinho nunca é sinal.
- **Anti-recomendação**: nenhuma lição prescreve "compre quando X" ou
  "use trava quando Y". O sistema não transforma estratégia em recomendação
  pessoal (validado por testes automatizados).
- **Processo, não resultado**: a revisão avalia se o processo foi seguido,
  independentemente do P&L. Lucro com processo ruim é sorte; perda dentro do
  plano pode ser ótima decisão.
- **Missões Observe → Interprete → Confronte → Simule → Explique**: cada lição
  pede que o usuário descreva um fato, interprete, confronte com a própria
  regra, simule o cenário errado e explique com as próprias palavras.

## O que está implementado

### Onboarding e perfil
- Cadastro simples (e-mail ou Google via Supabase Auth).
- Escolha do caminho da trilha (opções, futuros ou geral) persistida em
  `profiles.caminho`.
- No caminho de futuros, escolha do contrato de foco (WIN ou WDO) persistida em
  `profiles.foco_futuros`.

### Trilha de aprendizado (51 lições)
- 3 caminhos: `opcoes` (35 lições), `futuros` (16 lições) e `geral` (tudo).
- 6 níveis conceituais: Entender (1), Pensar (2), Construir (3), Comparar (4),
  Decidir (5) e Prática (transversal — tributação).
- 13 temas em seções expansíveis com progresso (TemaAccordion): Leitura de
  mercado → Indicadores e instrumentos → Representação do movimento →
  Fundamentos → Estratégias e estruturas → Comparação e decisão → Tributação →
  Mecânica do contrato → Pregão e dimensionamento → Execução e risco →
  Comparação → Decisão e fiscal → Aprofundamento.
- Camada de Leitura de Mercado (lições 1–6, tema "Leitura de mercado"):
  lendo-um-candle, a-história-do-pavio, força-e-sequência,
  congestão-e-expansão, tendência-e-lateralização e
  suporte-resistência-e-rompimento — sempre com contra-exemplo e a regra
  "candle descreve, nunca recomenda".
- Lições de indicadores e instrumentos (lições 7–9, tema "Indicadores e
  instrumentos"): medias-moveis, vwap e fibonacci — na mesma arquitetura de
  evidência: calculam um fato, dependem de contexto e nunca são gatilho
  ("cruzou a média" ou "tocou 61,8%" é registro, não ordem).
- Lições de representação do movimento (lições 49–51, tema "Representação do
  movimento"): renko-comparacao, renko-resolucao e renko-evidencia — Renko
  como lente do mesmo preço, não como mecanismo preditivo: a representação
  muda o que se enxerga (resolução do bloco), nunca a realidade; sequência de
  blocos é observação que entra na cadeia
  Renko → Observação → Contexto → Regra → Risco → Decisão, jamais gatilho.
- Lição com formato completo: problema → conceitos (com tabelas markdown) →
  analogia → na prática → missão interativa (opções com tom correta/quase/
  errada + feedback, termos de explicação, "ainda pratique") → transferência
  → quiz (3+ perguntas) → comparativo entre estruturas → 3 cenários
  (perda/neutro/ganho).
- Visuais interativos por lição (LessonVisual): anatomia clicável do candle,
  pavio e região rejeitada, força medida em reais, congestão vs expansão,
  tendência vs lateralização, rompimento com volume + checklist, médias
  móveis (tendência vs lateral), VWAP como referência da sessão, retrações de
  Fibonacci como regiões clicáveis, régua de moneyness, curva de theta, split
  de prêmio, dimensionamento, fluxo fiscal, pernas de travas, rolagem e regra
  do 1%.
- Rastreio de progresso, XP (+50 por lição concluída) e missão com explicação
  livre verificada por coerência com os termos da lição.

### Simulador
- **Opções**: payoff multi-perna (até 4 pernas), curva no vencimento com
  breakevens e resumo (lucro/perda máximos), presets por hipótese
  (alta, baixa, lateral, volatilidade, gestão).
- **Futuros WIN/WDO**: valor do ponto (R$ 0,20 / R$ 10), ticks, margem
  estimada, cálculo de contratos = risco ÷ (stop × valor do ponto), curvas de
  resultado, interpretação da posição e leitura de trades persistidos.

### Regras pessoais
- Módulo para o usuário escrever e editar as próprias regras de decisão
  (específicas, não genéricas), com templates de exemplo (incluindo regras
  sobre indicadores e padrões observados).
- As regras alimentam o copilot e a revisão — o sistema nunca sugere regras
  "do mercado", apenas organiza as do usuário.

### Diário de decisões
- Registro estruturado: o que fez, em qual ativo/estrutura, por quê, qual
  regra pessoal aplicou, emoção, interpretação, resultado (quando souber).
- Registra também a **lente de leitura do movimento** (Candle ou Renko, com o
  tamanho do bloco) no snapshot cognitivo — como observação do processo,
  nunca como sinal.
- Puxa a última simulação para reduzir fricção; cada entrada alimenta o
  Decision Score e os padrões de comportamento.

### Revisão cognitiva
- Painel sobre o próprio histórico: taxa por tipo de estratégia, retorno
  médio, comparação "segui minha regra vs não segui".
- Decision Score por entrada (processo, não resultado), padrões de
  comportamento detectados (behavior_patterns), revisões semanais e mensais e
  recomendações de aprendizado (learning_recommendations).

### Copilot de IA
- Chat contextual disponível em qualquer módulo (lição, simulador, regras,
  diário) — sabe em qual estágio o usuário está (MODULOS_COPILOT por rota).
- Cada conversa é uma thread com histórico persistido.
- Responde somente com base no conteúdo ensinado, nas regras do usuário e no
  histórico dele — com as mesmas analogias e números do conteúdo. Sempre que
  pedem opinião sobre um ativo real, redireciona: "conteúdo educacional, não
  recomendação de operação".

### Laboratório, História, Espelho e Replay
- Laboratório de estratégias: arena para explorar estruturas livremente.
- História: narrativa da jornada do usuário (timeline de eventos).
- Espelho ("Quem você está se tornando"): identidade em formação a partir do
  processo registrado.
- Replay: reviver decisões passadas com contexto completo (simulação, motivos,
  regra aplicada, emoção, resultado).

## Mapa de conteúdo

| Faixa de ordens | Tema | Caminho |
| --- | --- | --- |
| 1–6 | Leitura de mercado (candles, pavio, força, congestão, tendência, rompimento) | comum |
| 7–9 | Indicadores e instrumentos (médias móveis, VWAP, retrações de Fibonacci) | comum |
| 10–16 | Fundamentos (opção, call/put, vencimento, prêmio, moneyness, theta, IV) | opções |
| 17–27 | Estratégias e estruturas (a seco, coberta, proteção, travas, rolagem, straddle/strangle/condor, risco) | opções |
| 28–30 | Comparação e decisão (frameworks de escolha + ciclo de decisão) | opções |
| 31–32 | Tributação (15% swing, DARF 6015, compensação) | opções |
| 33–35 | Mecânica do contrato futuro (contrato, ponto/tick, margem/alavancagem) | futuros |
| 36–38 | Pregão e dimensionamento (sessão, stop e dimensionamento, day trade vs swing) | futuros |
| 39–41 | Execução e risco (slippage, ajuste diário, armadilha da alavancagem) | futuros |
| 42–43 | Comparação (WIN vs WDO, futuro vs opção) | futuros |
| 44–46 | Decisão e fiscal (decisão no day trade, tributação 20% e DARF) | futuros |
| 47–48 | Aprofundamento (WIN: Ibovespa e vencimentos; WDO: câmbio e referência) | futuros (segundo o foco) |
| 49–51 | Representação do movimento (Renko: lente vs realidade, resolução do bloco, evidência vs gatilho) | comum |

Distribuição por nível: Entender 10, Pensar 15, Construir 14, Comparar 6,
Decidir 3, Prática 3.

## Arquitetura e stack

- **Framework**: TanStack Start (React 19 + TanStack Router), SSR via Nitro
  com preset Cloudflare.
- **Estilo**: Tailwind CSS v4 + Radix UI (acordeões, dialogs, selects, tabs) +
  lucide-react + recharts (payoff e gráficos).
- **Markdown**: react-markdown + remark-gfm com componentes próprios —
  tabelas das lições renderizadas com bordas, cabeçalho e zebra em todos os
  pontos (ConceptCard, CopilotBubble, thread do copilot).
- **Backend**: Supabase (Auth + Postgres); núcleo de conteúdo 100% local em
  `src/lib/lessons.ts` (51 lições) — não depende de dado de mercado externo.
- **IA**: AI SDK com gateway openai-compatible (`src/lib/ai-gateway.server.ts`),
  prompt de sistema fixo com o conteúdo, as regras e o histórico do usuário.
- **Decision OS**: módulos em `src/lib/` — `market-reading.ts` (camada de
  leitura: ciclo de decisão, padrões e indicadores com contra-exemplo,
  `evidenciaDe` e `indicadorComoEvidencia` — indicador é contexto, nunca
  gatilho, representações de preço em `REPRESENTACOES` (candle e Renko como
  lentes da mesma realidade), checklist de rompimento), `payoff.ts` (curvas
  multi-perna), `futuros.ts` (contratos WIN/WDO, dimensionamento),
  `rule-templates.ts`, `strategy-read.ts`, `fichas-estrategias.ts`,
  `modulos-copilot.ts`, `voz.ts`.

### Modelo de dados (Supabase)

Principais tabelas: `profiles` (caminho, foco futuros, xp_total),
`lessons_progress`, `simulations` (pernas JSON), `diary_entries`
(interpretação, decision_score, checklist, emoção, lição aprendida),
`decision_memory`, `checklists`, `decision_scores`, `timeline_events`,
`badges`, `weekly_reviews`, `monthly_reviews`, `behavior_patterns`,
`learning_recommendations`, `personal_rules`, `chat_threads`/`chat_messages`.
Todas com RLS por `user_id`. Migrações em `supabase/migrations/`.

## Scripts

| Comando | Ação |
| --- | --- |
| `npm run dev` | Ambiente de desenvolvimento |
| `npm run build` | Build de produção (client + SSR + Nitro) |
| `npm run preview` | Preview do build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Desenvolvimento local

```sh
git clone https://github.com/wmilhomem/infinity-trader.git
cd infinity-trader
npm i
npm run dev
```

Você precisa de Node.js e npm — [instale com nvm](https://github.com/nvm-sh/nvm#installing-and-updating).
Variáveis de ambiente do Supabase e da API de IA são lidas de `.env` (client
`VITE_SUPABASE_*`; servidor `SUPABASE_SERVICE_ROLE_KEY` e a chave do gateway).

---

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://infinity-trader.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/21570d6c-9578-40a2-b3b4-1b35149e2937).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.