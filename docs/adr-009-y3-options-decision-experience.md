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

## Referências

- ADR-001: Market Data Infrastructure (Y.2)
- ADR-002: Null-Safe Contract
- ADR-003: Provenance Model
