# ADR-009: Y.3 — Options Decision Experience

**Data:** 2026-09-03
**Status:** Accepted
**Decisão:** Estabelecer arquitetura e contratos para Y.3 Options Decision Experience

---

## Contexto

Y.2 entregou infraestrutura de Market Data com provenance granular, null-safe e auditável. Y.3 agora transforma essa infraestrutura em experiência de decisão de opções, sem nunca transformar o sistema em recomendador.

A pergunta central de Y.3 é:

> Como transformar uma cadeia de opções real em aprendizado e processo de decisão, sem transformar o sistema em sinalizador?

---

## Arquitetura Conceitual

```
MarketContext (Y.2)
     │
     ├── Options Chain Reader
     │        │
     │        ├── Fato (observado/calculado)
     │        ├── Interpretação (usuário)
     │        ├── Hipótese (usuário)
     │        ├── Evidências (usuário)
     │        ├── Contra-evidências (usuário)
     │        ├── Estruturas possíveis
     │        ├── Simulação
     │        ├── Risco
     │        └── Regras pessoais
     │
     └── Decisão do usuário
              │
              ├── Snapshot
              └── Replay
```

---

## Contratos de Frontreira

### Regra Central (Anti-Recomendação)

```
O sistema apresenta fatos observados e calculados.
O sistema pode ajudar o usuário a organizar interpretações e hipóteses.
O sistema NUNCA transforma automaticamente uma interpretação em recomendação operacional.
```

### Separação Semântica

| Conceito | Origem | Exemplo |
|----------|--------|---------|
| **Fato** | Observado ou calculado | "IV da put 37 = 31,2%" |
| **Interpretação** | Usuário | "A IV da put está acima da call comparável" |
| **Hipótese** | Usuário | "O mercado pode estar precificando maior demanda por proteção" |
| **Decisão** | Usuário | "Quero investigar/simular esta hipótese" |

### O que NÃO é

```
Fato ≠ "IV alta → compre put"
Fato ≠ "Skew negativo → bearish"
Fato ≠ "Delta alto → direcional"
Hipótese ≠ Recomendação
Interpretação ≠ Sinal
```

---

## Componentes Y.3

### Y.3.0 — Options Chain Reading
- Visualização de cadeia de opções com provenance
- Spot, vencimento, DTE, strikes
- ATM / ITM / OTM
- Bid / Ask / Spread
- Volume / Open Interest
- IV por strike
- ATM IV, Skew, Expected Move
- **Foco:** ensinar a observar e interpretar

### Y.3.1 — Moneyness & Expiration Experience
- Definição de ATM/ITM/OTM
- Seleção de vencimento
- DTE context

### Y.3.2 — IV / Skew / Expected Move
- Contexto de volatilidade
- Leitura de skew
- Expected Move calculado vs observado

### Y.3.3 — Greeks in Context
- Greeks por strike
- Delta, Gamma, Theta, Vega
- Contexto operacional

### Y.3.4 — Structure Comparison
- Comparar estruturas possíveis
- Payoff visual

### Y.3.5 — Evidence Chain Integration
- Vincular evidências à hipótese
- Contra-evidências

### Y.3.6 — Risk & Personal Rules
- Risco por estrutura
- Aplicar regras pessoais

### Y.3.7 — Decision Snapshot Integration
- Registrar decisão
- Snapshot com provenance

### Y.3.8 — Replay / Cognitive Review
- Reviver decisões passadas
- Análise cognitiva

### Y.3.9 — Anti-Recommendation Contract Gate
- Testes de fronteira
- Verificar que nenhumaRecommendation é gerada automaticamente

---

## Regras de Dados (herdadas de Y.2)

```typescript
// Null semantics
null  = ausência (não disponível na fonte)
0     = valor legítimo zero

// Proveniência
observed   = lido direto da fonte
calculated = derivado de fórmula explícita
estimated  = aproximação

// Qualidade
valid      = dado integra
suspicious = verificado com cautela
invalid    = não utilizado como válido
absent     = não disponível
```

---

## Contrato de Interface: OptionsChainReader

```typescript
type Fact = {
  id: string;
  tipo: "spot" | "iv" | "skew" | "ivRank" | "dte" | "strike" | "volume" | "openInterest" | "expectedMove" | "other";
  valor: string; // representação formatada
  valorBruto: number | null;
  provenance: ProvenanceBadge;
  quality: Quality;
};

type Interpretation = {
  id: string;
  texto: string;
  fatosReferenciados: string[]; // IDs de Facts
  createdAt: string;
};

type Hypothesis = {
  id: string;
  texto: string;
  interpretaçãoId: string;
  createdAt: string;
};

type Evidence = {
  id: string;
  tipo: "evidencia" | "contraEvidencia";
  texto: string;
  hipóteseId: string;
  createdAt: string;
};
```

---

## Descrição de Tela: OptionsChainReader

```
┌─────────────────────────────────────────┐
│ PETR4                                    │
│ Spot: R$ 38,47 — Observado · Yahoo      │
│ Vencimento: 18/09/2026 · DTE 15        │
├─────────────────────────────────────────┤
│ CALLS       STRIKE       PUTS            │
│ IV 27,1%  36,00        IV 34,2%       │
│ IV 27,8%  37,00        IV 32,1%       │
│ IV 28,7%  38,50 ATM    IV 31,2%       │
│ IV 29,4%  40,00        IV 30,8%       │
│                         IV 30,1%       │
├─────────────────────────────────────────┤
│ CONTEXTO                                 │
│ ATM IV: 28,7% — Observado              │
│ Expected Move: ±R$ 1,83 — Calculado     │
│ Skew: +3,0 pts — Calculado              │
├─────────────────────────────────────────┤
│ ▶ O QUE VOCÊ OBSERVA?                  │
│ [ textarea para interpretação ]          │
│                                         │
│ ▶ QUAL SUA HIPÓTESE?                    │
│ [ textarea para hipótese ]               │
│                                         │
│ ▶ EVIDÊNCIAS                           │
│ [ lista de evidências ]                  │
│ [ + adicionar ]                         │
│                                         │
│ ▶ CONTRA-EVIDÊNCIAS                     │
│ [ lista de contra-evidências ]           │
│ [ + adicionar ]                          │
│                                         │
│ [ Simular ]                             │
└─────────────────────────────────────────┘
```

---

## O que Y.3.0 NÃO inclui

- Scanner de opções
- Rankings de "melhores" calls/puts
- Probabilidade de direção
- "Bullish/bearish" automático
- Estratégias sugeridas
- Alertas de entrada
- Execução de ordens
- Integração com corretora

---

## Decisões Abertas

1. Onde o OptionsChainReader será exposto? (Simulador? Diário? Laboratório?)
2. Como a cadeia de evidências se conecta ao Decision Snapshot?
3. Formato de persistência das interpretações/hipóteses

---

## Resultado Esperado

Ao final de Y.3.9:

- Usuário consegue olhar uma cadeia de opções real e descrever o que vê
- Sistema nunca recomenda, apenas contextualiza
- Decisões são registradas com provenance completa
- Replay permite revisão cognitiva

---

---

## Y.3.1 — Moneyness & Expiration Experience

### Objetivo

Responder visualmente: "Onde estou em relação ao preço atual e quanto tempo existe até o vencimento?"

### Contratos de Moneyness

```typescript
type Moneyness = "ITM" | "ATM" | "OTM";

type OptionMoneynessFact = {
  optionType: "CALL" | "PUT";
  strike: number;
  spot: number;
  moneyness: Moneyness;
  distanceAbs: number;      // strike - spot (sinal preservado)
  distancePct: number;     // (strike - spot) / spot * 100
  atmStrike: number;       // ATM strike do contexto
  atmMethod: "nearest-strike" | "delta-neutral";
  provenance: ProvenanceBadge;
};

type ExpirationFact = {
  expiration: string;       // ISO date
  dte: number;             // dias até vencimento
  contractCount: number;   // quantidade de strikes disponíveis
  quality: Quality;
  provenance: ProvenanceBadge;
};
```

### Regras de Cálculo

| Situação | CALL | PUT |
|----------|------|-----|
| strike < spot | ITM | OTM |
| strike = ATM | ATM | ATM |
| strike > spot | OTM | ITM |

### Regras Nulas

- `spot = null` → `moneyness = null`
- `strike = null` → `moneyness = null`
- `spot = 0` → `moneyness` calculado (0 é valor válido)
- `atmStrike = null` → não calcular moneyness
- `expiration = null` → não inventar DTE

### Anti-Recomendação Y.3.1

Frases proibidas em qualquer label, tooltip ou descrição:
- "melhor", "mais interessante", "favorável", "oportunidade"
- "CALL ITM é melhor"
- "OTM oferece mais oportunidade"
- "vencimento mais longo é melhor"
- "escolha o vencimento X"
- "essa opção é mais interessante"

---

## Y.3.2 — IV / Skew / Expected Move Experience

### Objetivo

Ensinar a ler volatilidade implícita, skew e expected move como contexto — não como previsão.

### Contratos

```typescript
type IVFact = {
  label: "ATM IV" | string;
  value: number | null;      // em % (0.287 = 28.7%)
  strike: number | null;
  origin: "observed" | "calculated" | "estimated";
  source: string | null;
  method?: string | null;
  quality: Quality;
  provenance: ProvenanceBadge;
};

type SkewFact = {
  putIvOtm: number | null;
  callIvOtm: number | null;
  slope: number | null;
  putStrike: number | null;
  callStrike: number | null;
  otmDistance: number | null;
  origin: "observed" | "calculated" | "estimated";
  quality: Quality;
  provenance: ProvenanceBadge;
};

type ExpectedMoveFact = {
  sigma1Brl: number | null;
  lowerBound: number | null;
  upperBound: number | null;
  ivUsed: number | null;
  spotUsed: number | null;
  dteUsed: number | null;
  dteBase: "calendar" | "trading" | null;
  formula: string | null;
  origin: "observed" | "calculated" | "estimated";
  quality: Quality;
  provenance: ProvenanceBadge;
};
```

### Regras de Leitura

| Campo | Valor | Comportamento |
|-------|-------|---------------|
| IV | null | Exibe "—" sem calcular |
| Skew | null | Não inventa |
| Expected Move | null | Não inventa |
| DTE base | calendar/trading | Preservado |
| Formula | string | Exibida literalmente |

### Anti-Recomendação Y.3.2

Frases proibidas:
- "IV alta → compre"
- "skew positivo → queda"
- "expected move → alvo de preço"
- "máxima/mínima prevista"
- "volatilidade elevada é oportunidade"
- "vencimento X é melhor"
- "espera-se queda/alta"
- Qualquer derivação automática de direção

---

## Y.3.3 — Greeks in Context

### Objetivo

Ler Delta, Gamma, Theta e Vega como fatos contextuais — não como sinais operacionais.

### Contratos

```typescript
type GreekFact = {
  greek: "delta" | "gamma" | "theta" | "vega";
  label: string;
  value: number | null;
  valueFormatted: string;
  unit: string;
  strike: number | null;
  optionType: "CALL" | "PUT" | null;
  origin: "observed" | "calculated" | "estimated";
  quality: Quality;
};

type GreeksReading = {
  facts: GreekFact[];
  spot: number | null;
  dte: number | null;
};
```

### Regras de Leitura

| Greek | Unit | Significado factual |
|-------|------|--------------------|
| Delta | — | Variação do prêmio por R$1 no ativo base |
| Gamma | — | Taxa de variação do delta por R$1 |
| Theta | R$/dia | Sangria de tempo diária |
| Vega | R$/1% IV | Sensibilidade a mudança de 1% na IV |

### Anti-Recomendação Y.3.3

Frases proibidas:
- "delta alto = direcional"
- "gamma alto = aceleração do movimento"
- "theta mata o prêmio"
- "vega alto = risco de volatilidade"
- "grega X indica entrada"
- "grega Y indica saída"
- "este greek é bom"
- "este greek é ruim"

---

## Y.3.4 — Structure Comparison

### Objetivo

Comparar estruturas (combinações de pernas) como fatos — não como recomendação.

### Conceito

Uma estrutura é expressa por:
- Tipo (call spread, put spread, straddle, strangle, iron condor, etc.)
- Strikes envolvidos
- Net debit / net credit
- Max profit / max loss
- Breakeven(s)

O sistema mostra os fatos de cada estrutura — o usuário avalia.

### Contratos

```typescript
type StructureScenario = {
  id: string;
  name: string;
  type: string;
  legs: LegFact[];
  netDebit: number | null;
  netCredit: number | null;
  maxProfit: number | null;
  maxLoss: number | null;
  breakevens: number[];
  spot: number | null;
  quality: Quality;
};

type LegFact = {
  type: "call" | "put";
  direction: "buy" | "sell";
  strike: number;
  premium: number | null;
  quantity: number;
};
```

### Anti-Recomendação Y.3.4

Frases proibidas:
- "esta estrutura é melhor"
- "estratégia X é recomendada"
- "combinaçãoideal"
- "montar esta posição"
- "operação recomendada"
- "melhor para este cenário"

---

## Y.3.5 — Evidence Chain

### Objetivo

Conectar observações, hipóteses e evidências já registradas pelo usuário em uma cadeia lógica — Fact → Interpretation → Hypothesis → Evidence.

### Conceito

O sistema não gera evidência. O usuário registra evidências manualmente a partir dos fatos observados nas seções anteriores. A cadeia de evidência mostra:
- Quais observações apoiaram quais hipóteses
- Quais evidências favorecem ou contradizem cada hipótese
- Nenhuma conclusão automática — apenas apresentação da链条

### Contratos

```typescript
type EvidenceNode = {
  id: string;
  type: "observation" | "hypothesis" | "evidence" | "contra-evidence";
  texto: string;
  linkedTo: string | null;
  timestamp: string;
};

type EvidenceChain = {
  nodes: EvidenceNode[];
  hypothesisSupports: Record<string, string[]>;
  hypothesisContradicts: Record<string, string[]>;
};
```

### Anti-Recomendação Y.3.5

Frases proibidas:
- "evidência forte"
- "prova definitiva"
- "confirmação da tendência"
- "hipótese validada"
- "dado concreto" (quando é interpretação)
- "fato comprovado" (quando é hipótese)

---

## Y.3.6 — Risk & Personal Rules

### Objetivo

Mostrar as regras pessoais de risco do trader como fatos — não como validação.

### Conceito

O trader documenta suas regras pessoais de risco (ex: "não opero com mais de 2% de perda por operação", "IV > 40% é filtro de exclusão"). O sistema mostra essas regras como fatos declarados, não como recomendações.

### Contratos

```typescript
type PersonalRiskRule = {
  id: string;
  texto: string;
  tipo: "stop-loss" | "position-size" | "iv-filter" | "dte-filter" | "other";
  active: boolean;
  createdAt: string;
};

type RiskCheck = {
  ruleId: string;
  applicable: boolean;
  status: "ok" | "violated" | "na";
  observation: string | null;
};
```

### Anti-Recomendação Y.3.6

Frases proibidas:
- "regra de proteção"
- "gestão conservative"
- "risco acceptable"
- "posição segura"
- "risco controlado"
- "stop garantido"

---

## Y.3.7 — Decision Snapshot

### Objetivo

Capturar o ponto de decisão — todos os fatos, interpretações, hipóteses, evidências e regras declaradas pelo usuário em um timestamp.

### Conceito

O snapshot é um registro de tudo que o usuário observou e declarou antes de tomar uma decisão. Não é uma recomendação. Não é uma conclusão. É um registro do estado mental do trader no momento da leitura.

### Contratos

```typescript
type DecisionSnapshot = {
  id: string;
  symbol: string;
  spot: number | null;
  timestamp: string;
  context: {
    moneyness: MoneynessReading | null;
    volatility: VolatilityReading | null;
    greeks: GreeksReading | null;
    structures: StructureScenario[];
  };
  state: ChainReadingState;
  rules: PersonalRiskRule[];
};
```

### Anti-Recomendação Y.3.7

Frases proibidas:
- "decisão tomada"
- "opinião formada"
- "conclusão"
- "veredicto"
- "posicionamento decidido"

---

## Y.3.8 — Replay & Cognitive Review

### Objetivo

Comparar readings salvos para identificar padrões de pensamento e possíveis vieses cognitivos — sem recomendar.

### Conceito

O usuário carrega readings anteriores e os compara lado a lado. O sistema mostra:
- Evolução das observações ao longo do tempo
- Contraste entre interpretações passadas e atuais
- Possíveis padrões (ex: "você frequentemente observa IV antes de estruturar")

O sistema NÃO diz "você tem viés de confirmação" — apenas mostra os fatos para que o usuário reflita.

### Contratos

```typescript
type SavedReading = {
  id: string;
  symbol: string;
  timestamp: string;
  spot: number | null;
  interpretationCount: number;
  hypothesisCount: number;
  evidenceCount: number;
  notes?: string;
};

type ReplayComparison = {
  readings: SavedReading[];
  temporalGaps: { from: string; to: string; days: number }[];
  patternObservations: string[];
};
```

### Anti-Recomendação Y.3.8

Frases proibidas:
- "você tem viés de confirmação"
- "padrão de comportamento"
- "tendencia identficada"
- "erro comum"
- "você sempre erra"
- "você nunca aprende"

---

## Referências

- ADR-001: Market Data Infrastructure (Y.2)
- ADR-002: Null-Safe Contract
- ADR-003: Provenance Model
