# ADR-010: Y.4 — Practice Session Model

**Data:** 2026-09-04
**Status:** Proposed
**Decisão:** Estabelecer o modelo conceitual e contratos para Y.4 — Practice Session

---

## 1. Contexto e Problema

Y.3 tornou possível estruturar uma decisão de mercado: o usuário observa, interpreta, formula hipótese, registra evidência e contra-evidência, define risco e registra uma escolha. O problema seguinte é transformar essa capacidade em **prática deliberada recorrente** — sem criar um sistema de sinais, previsão de direção, ou avaliação de performance.

O Infinity Trader não deve treinar o usuário para prever o mercado. Deve ajudá-lo a praticar o processo pelo qual transforma contexto em decisão consciente.

O risco central de Y.4 é transformar prática em gamificação: score de trader, níveis de habilidade, ranking de desempenho. Isso é incompatível com o posicionamento construído até Y.3.

---

## 2. Princípio Central

> **Y.4 não treina o usuário para prever o mercado. Treina o usuário para praticar o processo pelo qual transforma contexto em decisão consciente.**

Este princípio é o filtro para qualquer decisão de implementação dentro de Y.4. Se uma feature ou comportamento pode ser interpretado como "ajudar o usuário a prever", está fora de Y.4.

---

## 3. Unidade: Practice Session

**Definição:** Sessão curta e deliberada na qual o usuário percorre uma cadeia de decisão sobre um contexto de mercado congelado.

| Atributo | Valor |
|----------|-------|
| Duração-alvo | 5–10 minutos |
| Natureza | Prática deliberada |
| Não é | Operação / aula / estratégia / teste de acerto |
| Frequência | Definida pelo usuário |

A Practice Session reutiliza a infraestrutura de Y.3 (Observação → Interpretação → Hipótese → Evidência → Contra-evidência → Risco → Escolha → Registro) como protocolo, sem modificação. Y.4 adiciona o **protocolo de uso** — quando o usuário entra, o que vê, o que faz, o que sai.

---

## 4. Protocolo

```
CONTEXTO
    ↓
OBSERVAR
    ↓
INTERPRETAR
    ↓
HIPÓTESE
    ↓
EVIDÊNCIA
    ↓
CONTRA-EVIDÊNCIA
    ↓
RISCO
    ↓
ESCOLHA
    ↓
REGISTRO
```

### Escolha como estado terminal

A escolha pode ser:

- **Observar** — registrar que a situação não exige ação
- **Simular** — leva ao simulador com o contexto carregado
- **Seguir** — registrar intenção de operar
- **Não seguir** — registrar que optou por não agir

Todas são **escolhas completas**. "Não seguir" não é ausência de decisão — é uma decisão deliberada e válida.

O estado terminal da sessão é registado como `choice: "observe" | "simulate" | "follow" | "do-not-follow"`.

---

## 5. Contexto da Prática

Duas origens iniciais:

### B. Historical Frozen Context

Um contexto de mercado real do passado, apresentado **sem revelar o desfecho**. O usuário recebe APENAS aquilo que estaria disponível no momento da decisão original.

Propriedade pedagógica: o usuário não pode confundir conhecimento do futuro com conhecimento disponível no momento da decisão. Isso preserva **integridade epistemológica** do processo.

### C. Laboratory Context

Uma situação que o usuário encontrou no Laboratory e decidiu transformar em prática. Ele pode congelar o estado atual do Laboratory e usá-lo como contexto de Practice Session.

```
Laboratory
    ↓
"Quero praticar esta situação"
    ↓
Frozen Practice Context
    ↓
Practice Session
    ↓
Snapshot
    ↓
[tempo]
    ↓
Replay + Reflection
```

### A. Prepared Scenario (futuro)

Um cenário criado especificamente para treinamento. **Não implementado em Y.4.1**. Depende de provar que a Practice Session básica funciona.

---

## 6. Integridade Temporal

**Regra absoluta:** O contexto histórico nunca vaza o desfecho para o usuário antes da decisão.

```
Market Context (real)
    ↓
Frozen Practice Context (sem desfecho)
    ↓
Practice Session
    ↓
Decision Snapshot (estado no momento)
    ↓
[tempo passa]
    ↓
Replay
    ↓
Reflection
    ↓
SÓ ENTÃO: desfecho revelado
```

**Nunca:**
```
Resultado posterior
    ↓
Alteração retroativa
    ↓
Decisão original reavaliada
```

Isso preserva a mesma integridade epistemológica que Y.2/Y.3 construíram. A decisão original é avaliada no contexto em que foi tomada, não à luz do que aconteceu depois.

---

## 7. Métricas

### O que o sistema NÃO registra

- Score de trader
- Qualidade da decisão
- Taxa de acerto
- Performance da sessão
- Ranking entre sessões ou usuários
- Nível do usuário
- Avaliação se a decisão estava "certa"

### O que o sistema registra

- Etapas percorridas
- Ponto em que o processo terminou
- Conteúdo produzido em cada etapa (texto do usuário)

### Formato preferido

Em vez de:

> "3/9 etapas"

Preferir:

> "Observou → interpretou → formulou hipótese → não registrou contra-evidência → escolheu observar."

Isso é mais fiel ao objetivo pedagógico: o processo é o foco, não a contagem.

---

## 8. Progressão

A complexidade é uma **propriedade interna do sistema**. O usuário não vê níveis, ranks ou scores.

O sistema apresenta sessões com complexidade progressivamente maior:

| Nível | Descrição |
|-------|-----------|
| 1 | Contexto simples — poucas variáveis |
| 2 | Contexto composto — preço + moneyness + volatilidade |
| 3 | Conflito — evidências em direções diferentes |
| 4 | Incerteza — informação relevante ausentes ou suspicious |
| 5 | Estrutura — comparação entre estruturas |
| 6 | Explicação — usuário precisa justificar sua escolha |

**Regra:** O usuário não vê "nível 3". Ele simplesmente encontra sessões progressivamente mais complexas. Se o usuário souber que está em "nível 3", começará a jogar para o nível em vez de praticar o processo.

---

## 9. Timing da Revisão

### No encerramento da sessão

O sistema pergunta:

> "Deseja registrar esta sessão para revisar depois?"

Se sim, a revisão é **agendada** — não exigida naquele momento.

### Em momento apropriado (revisão postergada)

```
O que você sabia naquele momento?
    ↓
O que aconteceu depois?
    ↓
O que mudou?
    ↓
O que você faria novamente?
    ↓
O que aprendeu sobre seu processo?
    ↓
Alguma regra pessoal precisa ser revista?
```

**Não** abrir reflexão profunda imediatamente após a decisão — especialmente após situações emocionalmente carregadas (ganho ou perda). O timing da revisão importa tanto quanto o conteúdo.

---

## 10. Fronteiras

### Y.4 não pode

- Sugerir direção (alta/baixa)
- Sugerir contrato específico
- Sugerir strike
- Sugerir vencimento
- Sugerir estrutura
- Gerar sinais
- Ranckear oportunidades
- Avaliar se a decisão estava "certa"
- Transformar resultado financeiro em nota
- Mostrar "nível" ao usuário
- Criar score de trader

---

## 11. Arquitetura de Dados

### Frozen Practice Context

```typescript
type FrozenPracticeContext = {
  id: string;
  origin: "historical" | "laboratory";
  frozenAt: string; // timestamp do congelamento
  context: MarketContext; // MarketContext Y.2 (sem desfecho)
  outcomeRevealed: boolean;
};
```

### Practice Session

```typescript
type PracticeSession = {
  id: string;
  contextId: string;
  startedAt: string;
  endedAt: string | null;
  protocolSteps: {
    step: "context" | "observe" | "interpret" | "hypothesize" | "evidence" | "contra-evidence" | "risk" | "choice" | "register";
    completed: boolean;
    content: string | null; // texto do usuário
  }[];
  terminationStep: string | null; // em que passo terminou
  choice: "observe" | "simulate" | "follow" | "do-not-follow" | null;
  practiceSnapshot: DecisionSnapshot | null; // Snapshot no momento da escolha
  reflectionScheduled: boolean;
  reflectionCompleted: boolean;
};
```

### Practice Reflection

```typescript
type PracticeReflection = {
  id: string;
  sessionId: string;
  completedAt: string | null;
  questions: {
    whatDidYouKnow: string | null;
    whatHappened: string | null;
    whatChanged: string | null;
    whatWouldYouDoAgain: string | null;
    whatDidYouLearn: string | null;
    ruleChangeNeeded: string | null;
  };
};
```

---

## 12. Ciclo de Vida

```
[User enters Practice]
    ↓
[Select or receive context]
    ↓
[Practice Session]
    ↓
[Choice made — observe/simulate/follow/do-not-follow]
    ↓
[Ask: register for later reflection?]
    ↓
    ├─ No → Session closed
    └─ Yes → Schedule reflection
              ↓
        [Time passes]
              ↓
        [Reflection opens]
              ↓
        [User reflects]
              ↓
        [Reflection completed]
              ↓
        [Optional: update personal rules]
              ↓
        [Session closed]
```

---

## 13. Relação com Módulos Existentes

| Módulo | Relação |
|--------|---------|
| Academy | Prática deliberada é consolidação da aprendizagem |
| Laboratory | Laboratory Context → Practice Session (fluxo nativo) |
| Y.3 / Options Chain Reader | Protocolo reutilizado tal cual |
| Diary | Reflection habita o Diary como instrumento de formação |
| Replay | Practice Replay usa a mesma cadeia de Replay; desfecho revelado após replay |

---

## 14. Dependências

- Y.4.1 depende de: ADR-010 (este documento), Y.3 infrastructure completa
- Y.4.2 (Historical Frozen Context) depende de: Y.4.1, infraestrutura de storage de contextos
- Y.4.3 (Laboratory → Practice) depende de: Y.4.1, Laboratory

---

## 15. Statusword

- **Proposed:** este documento
- **Accepted:** após validação com time de produto
- **Implemented:** quando Y.4.1 estiver shipped e contratos testados

---

## Referências

- ADR-009: Y.3 — Options Decision Experience
- ADR-002: Null-Safe Contract
- ADR-003: Provenance Model
