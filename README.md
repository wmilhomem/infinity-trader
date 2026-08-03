# Option Navigator

Construa o MVP de um Decision Operating System chamado "Zero ao Trade" —

um app que ensina opções da B3 do zero até estratégias estruturadas

(travas, rolagem), e ajuda o usuário a definir, simular, registrar e

revisar suas próprias decisões de operação. Um copilot de IA atravessa

todo o produto, mas nunca decide por conta própria — ele informa, com

base no conteúdo ensinado, nas regras que o usuário definiu, e no

histórico que o usuário registrou.

## Visão do produto

Um loop contínuo — Aprender, Definir, Simular, Registrar, Revisar — que

serve dois públicos no mesmo produto: quem nunca operou (Níveis 1-3) e

quem já opera e quer estruturar operações de risco limitado (Nível 4).

O usuário sempre continua sendo quem decide; o produto organiza a

decisão, não a substitui.

## Usuários-alvo do MVP

1. Iniciante: nunca operou opções, mas já investe em ações

2. Avançado: já compra calls/puts diretas, quer aprender a rolar

   posições e montar travas para limitar risco

## Escopo funcional do MVP

1) ONBOARDING

   - Cadastro simples (e-mail ou Google)

   - Pergunta inicial: "você já operou opções?" — quem já opera pode

     pular direto pro Nível 4, mas o resto da trilha continua disponível

2) TRILHA — estágio "Aprender" (13 lições + 1 módulo bônus)

   Níveis 1-3 (guia original):

   - Lição 1: O que é uma opção (+ exercício americano vs. europeu)

   - Lição 2: Call vs Put (+ decifrando o código B3)

   - Lição 3: Como funciona na prática (+ custos reais)

   - Lição 4: Prêmio & Strike (intrínseco vs. extrínseco)

   - Lição 5: ITM / ATM / OTM

   - Lição 6: Vencimento e decaimento (Theta)

   - Lição 7: Gregas & Volatilidade Implícita

   - Lição 8: Estratégias básicas — call/put, covered call, cash-secured put

   Nível 4 (guia de Rolagem & Travas):

   - Lição 9: Rolagem (Roll Out, Roll Up, Roll Down, Roll Up and Out +

     a "armadilha da rolagem": máximo 1 roll por operação)

   - Lição 10: Trava de Alta / Bull Call Spread

   - Lição 11: Trava de Baixa / Bear Put Spread

   - Lição 12: Trava Lateral — Iron Condor vs. Iron Butterfly

   - Lição 13: Call Sozinha vs. Trava de Alta — framework de decisão

   Módulo bônus: Tributação (IR 15%/20%, sem isenção de R$20k, DARF 6015)

   Padrão de cada lição: texto curto + analogia do guia (vale-ingresso,

   seguro de carro, iogurte, carro de corrida, plano de celular com teto)

   + elemento interativo + quiz de 3-5 perguntas, 80%+ pra destravar a

   próxima.

3) REGRAS PESSOAIS — estágio "Definir" (NOVO)

   - Módulo onde o usuário escreve suas próprias regras de decisão, de

     forma estruturada e editável — específicas, não genéricas: "só

     compro opções com 45+ dias de vencimento", "nunca aloco mais que 2%

     numa única estrutura", "rolo no máximo 1x por operação"

   - As "regras de ouro" dos dois guias entram como sugestão inicial /

     template, mas o usuário edita e assume a autoria

   - Essas regras alimentam o estágio Monitorar na Fase 3 — o sistema

     avisa quando o mercado bate uma condição que O PRÓPRIO USUÁRIO

     definiu aqui, nunca uma opinião do copilot

4) SIMULADOR DE PAYOFF MULTI-PERNA — estágio "Simular"

   - Suporta até 4 pernas simultâneas (travas e iron condor usam 2-4

     pernas, não 1)

   - Usuário monta a estrutura e vê o payoff combinado no vencimento,

     com breakeven marcado

   - Usa os mesmos números dos dois guias (PETR4 a R$38) como cenário

     padrão — sem dado de mercado real nesta fase

5) DIÁRIO DE DECISÕES — estágio "Registrar" (NOVO)

   - Formulário simples: o que fez, em qual ativo/estrutura, por quê,

     qual regra pessoal aplicou, resultado (quando souber)

   - Puxa automaticamente da última simulação feita no simulador,

     reduzindo fricção de preenchimento

   - Não depende de dado de mercado real — funciona com o que o próprio

     usuário registra

6) REVISÃO / ANALYTICS — estágio "Revisar" (NOVO)

   - Painel sobre o PRÓPRIO histórico do usuário, construído em cima do

     diário: taxa de acerto por tipo de estratégia, retorno médio,

     comparação entre "vezes que segui minha regra" vs "vezes que não"

   - 100% baseado em dados que o usuário mesmo registrou — cabe no MVP,

     não precisa esperar dado de mercado real

7) COPILOT DE IA — interface conversacional dos seis estágios

   - Chat contextual disponível em qualquer lição, no simulador, nas

     regras pessoais e no diário — sabe em qual estágio o usuário está

   - Responde dúvidas de conceito usando as MESMAS analogias e exemplos

     dos guias

   - Explica erros de quiz de forma conversacional

   - Analisa a estratégia montada no simulador e as entradas do diário

     ("por que seu lucro máximo é R$290 aqui?", "por que essa rolagem

     aumentou seu breakeven?")

   - Implementação: sem necessidade de busca vetorial — a base de

     conteúdo são os 2 guias + as regras e o histórico do próprio

     usuário. Passe o contexto relevante direto na chamada de API

   - Prompt de sistema fixo: responde SOMENTE com base no que foi

     ensinado, nas regras do usuário, ou no histórico do usuário — nunca

     opinião independente sobre um ativo externo. Se perguntado sobre

     uma posição real ("devo comprar essa call agora?"), redireciona

     para "isso é conteúdo educacional, não é recomendação de operação"

   - API sugerida: Claude API (Anthropic)

8) GAMIFICAÇÃO

   - XP por lição completa, por acerto em quiz, por manter o diário em dia

   - 4 níveis espelhando a trilha

   - Streak diário

   - Badges: "Primeira Call", "Mestre das Gregas", "Trader Disciplinado",

     "Mestre das Travas", "Fiel às Regras" (10 decisões seguidas

     respeitando as regras pessoais)

   - Dois certificados: um ao completar Níveis 1-3, outro ao completar

     o Nível 4

   - Desafio semanal leve usando o simulador, checado automaticamente

## Modelo de dados sugerido

- usuarios (id, email, nome, nivel_atual, xp_total, streak_dias, ultima_atividade)

- licoes (id, ordem, nivel, titulo, secao_guia, tipo_conteudo)

- progresso_usuario (usuario_id, licao_id, completado_em, pontuacao_quiz, tentativas)

- perguntas_quiz (id, licao_id, pergunta, alternativas, resposta_correta, explicacao)

- badges (id, nome, descricao, criterio)

- usuario_badges (usuario_id, badge_id, conquistado_em)

- simulacoes (id, usuario_id, tipo_estrategia, pernas_json, criado_em)

- regras_pessoais (id, usuario_id, texto, categoria, ativa, criado_em)

- diario_decisoes (id, usuario_id, simulacao_id, ativo, estrutura, motivo, regra_aplicada_id, resultado, criado_em)

- copilot_interacoes (id, usuario_id, contexto_tipo, contexto_id, pergunta, resposta, criado_em)

## Stack sugerida (ajuste à experiência do seu time)

- Frontend: React + Tailwind, PWA

- Backend: Supabase (Postgres + Auth)

- Gráficos: Recharts (payoff de múltiplas pernas + gráficos de Revisar)

- IA: Claude API para o copilot

- Deploy: Vercel

## Direção visual

Reaproveite a identidade visual dos dois guias — tema escuro (#0f172a),

laranja (#f59e0b) para destaque, verde (#10b981) para ganho, vermelho

(#ef4444) para perda. O guia de Rolagem & Travas já usa navegação em

abas — reaproveite esse padrão dentro do Nível 4.

## Fora de escopo nesta fase (não construir agora)

- Dado de mercado real / grade de opções ao vivo (bloqueia só o

  estágio Monitorar — os outros 5 estágios não dependem disso)

- Paper trading conectado a corretora

- Calculadora de IR funcional (só o módulo educativo)

- Comunidade, leaderboard, comentários

- Pagamento/assinatura (mas já pense o copilot com limite de uso — ver nota abaixo)

- Notificação push nativa

- Copilot com acesso a posições reais ou dado de mercado ao vivo — ele

  opera só sobre guias, regras do usuário e histórico do usuário

## Métricas de sucesso do MVP

- % de usuários que completam Níveis 1-3 e o Nível 4, separadamente

- % de usuários que criam ao menos 3 regras pessoais em Definir

- % de usuários que registram ao menos 1 decisão no diário

- % de usuários que interagem com o copilot, e correlação com conclusão

- Tempo médio até completar cada nível, taxa de retorno D1 e D7

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://infinity-trader.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/21570d6c-9578-40a2-b3b4-1b35149e2937).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
