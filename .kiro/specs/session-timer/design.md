# Design Document — Session Timer

## Overview

O Session Timer adiciona um cronômetro de play/pause a cada `SessionCard` da dashboard do StudyFlow. O objetivo é medir o tempo real de estudo por sessão, persistir esse estado entre reloads de página via `localStorage`, e passar o tempo cronometrado ao fluxo de conclusão de sessão para futura influência no XP.

A funcionalidade é inteiramente client-side: nenhuma nova coluna de banco de dados é necessária para o estado do timer em si. O tempo efetivo só é enviado ao backend no momento em que o usuário conclui a sessão.

Decisões de design principais:
- **Estado global via Zustand store** (`useTimerStore`) para garantir o invariante de "no máximo um timer ativo por vez" e centralizar a persistência no `localStorage`.
- **Hook `useSessionTimer`** encapsula a lógica de tick (via `setInterval`) e expõe uma API simples para os componentes.
- **`SessionCard` recebe props de timer** em vez de gerenciar estado interno, mantendo o componente controlado e testável.
- **`onComplete` recebe `elapsedSeconds` opcional** — mudança mínima na interface existente para suportar o tempo cronometrado.

---

## Architecture

```mermaid
graph TD
    subgraph "Dashboard (DailyView / WeeklyView)"
        SC[SessionCard]
    end

    subgraph "Timer Layer"
        UST[useSessionTimer hook]
        UTS[useTimerStore - Zustand]
        LS[(localStorage)]
    end

    subgraph "Session Layer"
        USS[useSessions hooks]
        SB[(Supabase)]
    end

    SC -->|play/pause/complete/skip| UST
    UST -->|read/write timer state| UTS
    UTS <-->|persist/restore| LS
    UST -->|onComplete(id, elapsed)| USS
    USS -->|update status| SB
```

Fluxo de dados:
1. `DailyView`/`WeeklyView` renderizam `SessionCard` passando handlers do `useSessionTimer`.
2. `useSessionTimer` lê e escreve no `useTimerStore` (Zustand).
3. `useTimerStore` persiste automaticamente no `localStorage` via middleware `persist`.
4. Ao completar, `useSessionTimer` chama `onComplete(id, elapsedSeconds)` que chega ao `useCompleteSession`.

---

## Components and Interfaces

### `TimerState` (tipo)

```typescript
type TimerStatus = 'idle' | 'running' | 'paused';

interface TimerEntry {
  status: TimerStatus;
  elapsedSeconds: number;
  startedAt: number | null; // timestamp ms quando o timer foi iniciado/retomado
}
```

### `useTimerStore` (Zustand + persist)

```typescript
interface TimerStore {
  timers: Record<string, TimerEntry>; // keyed by session id
  startTimer: (sessionId: string) => void;   // pausa qualquer outro ativo
  pauseTimer: (sessionId: string) => void;
  resetTimer: (sessionId: string) => void;   // usado no skip/complete
  getElapsed: (sessionId: string) => number; // calcula elapsed atual (inclui tempo desde startedAt)
  restoreTimers: () => void;                 // ajusta startedAt após reload
}
```

Persistência: Zustand `persist` middleware com `localStorage`, chave `"studyflow:timers"`.

Ao restaurar, se um timer estava `running`, `startedAt` é ajustado para `Date.now()` e `elapsedSeconds` já contém o acumulado até o último save — o tick continuará a partir daí.

### `useSessionTimer` (hook)

```typescript
interface UseSessionTimerReturn {
  status: TimerStatus;
  elapsedSeconds: number;
  formattedTime: string;       // MM:SS ou HH:MM:SS
  isRunning: boolean;
  handlePlay: () => void;
  handlePause: () => void;
  handleComplete: () => void;  // pausa timer, chama onComplete(id, elapsed)
  handleSkip: () => void;      // reseta timer, chama onSkip(id)
}

function useSessionTimer(
  sessionId: string,
  onComplete: (id: string, elapsedSeconds?: number) => void,
  onSkip: (id: string) => void,
): UseSessionTimerReturn
```

O hook gerencia o `setInterval` de 1 segundo internamente. O intervalo só existe quando `status === 'running'`.

### `SessionCard` (atualizado)

Props adicionadas:

```typescript
interface SessionCardProps {
  session: Session;
  contentTitle: string;
  onComplete: (id: string, elapsedSeconds?: number) => void; // elapsedSeconds adicionado
  onSkip: (id: string) => void;
}
```

O `SessionCard` usa `useSessionTimer` internamente para obter o estado do timer e renderizar os controles.

### `formatElapsedTime` (função pura utilitária)

```typescript
// lib/timer.ts
function formatElapsedTime(seconds: number): string
// seconds < 3600  → "MM:SS"
// seconds >= 3600 → "HH:MM:SS"
```

---

## Data Models

### Timer Entry (localStorage)

```typescript
// Estrutura salva em localStorage["studyflow:timers"]
{
  "timers": {
    "<session-id>": {
      "status": "running" | "paused" | "idle",
      "elapsedSeconds": number,
      "startedAt": number | null  // epoch ms
    }
  }
}
```

Nenhuma alteração no schema do Supabase é necessária. O `elapsedSeconds` ao completar pode ser passado como parâmetro extra ao `useCompleteSession` para futura lógica de XP bônus — a mutation atual aceita apenas `sessionId`, então a assinatura será estendida opcionalmente:

```typescript
// useSessions.ts — useCompleteSession
mutationFn: async ({ sessionId, elapsedSeconds }: { sessionId: string; elapsedSeconds?: number }) => { ... }
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Timer state machine transitions

*For any* session id and any timer entry in `idle` or `paused` state, calling `startTimer` SHALL result in `status === 'running'`; and for any entry in `running` state, calling `pauseTimer` SHALL result in `status === 'paused'`.

**Validates: Requirements 1.2, 1.4**

### Property 2: Elapsed time format correctness

*For any* non-negative integer `t`, `formatElapsedTime(t)` SHALL return a string matching `MM:SS` when `t < 3600`, and `HH:MM:SS` when `t >= 3600`, where each segment is zero-padded to its minimum width.

**Validates: Requirements 2.1, 2.2**

### Property 3: Timer persistence round-trip

*For any* session id, timer status (`running` or `paused`), and elapsed time value, saving the timer state to the store and then loading it back SHALL produce an equivalent `TimerEntry` (same status and elapsedSeconds).

**Validates: Requirements 3.1, 3.2**

### Property 4: Timer cleanup on session completion or skip

*For any* session id that has a saved timer entry in the store, after that session transitions to `done` or `skipped`, the store SHALL not contain a timer entry for that session id.

**Validates: Requirements 3.3**

### Property 5: Elapsed time forwarded on complete

*For any* session id and any elapsed time `t > 0`, when `handleComplete` is called, the `onComplete` callback SHALL be invoked with `(sessionId, t)` where `t` equals the accumulated `elapsedSeconds` at the moment of completion.

**Validates: Requirements 4.2**

### Property 6: Active visual indicator reflects running state

*For any* session id, when the timer status is `running`, the `SessionCard` SHALL render the active visual indicator and the "Em andamento" label; when the status is `paused` or `idle`, neither SHALL be present.

**Validates: Requirements 5.1, 5.2, 5.3**

### Property 7: Single active timer invariant

*For any* sequence of `startTimer` calls across multiple session ids, at most one timer SHALL have `status === 'running'` in the store at any point in time.

**Validates: Requirements 6.2, 6.3**

### Property 8: No timer controls for completed or skipped sessions

*For any* session with `status === 'done'` or `status === 'skipped'`, the `SessionCard` SHALL not render any play or pause button.

**Validates: Requirements 1.6**

---

## Error Handling

| Cenário | Comportamento |
|---|---|
| `localStorage` indisponível (modo privado, quota excedida) | `useTimerStore` opera apenas em memória; o timer funciona normalmente na sessão atual mas não persiste entre reloads. Nenhum erro é exibido ao usuário. |
| `startedAt` corrompido no localStorage | Ao restaurar, se `startedAt` não for um número válido, o timer é restaurado como `paused` com o `elapsedSeconds` salvo, evitando valores negativos ou NaN. |
| `elapsedSeconds` negativo ou NaN no store | `getElapsed` retorna `Math.max(0, calculatedElapsed)` para garantir que o display nunca mostre valores inválidos. |
| Sessão concluída/pulada enquanto timer está rodando | `handleComplete`/`handleSkip` sempre chamam `resetTimer` antes do callback, garantindo limpeza mesmo em condições de race. |
| `onComplete` / `onSkip` lançam exceção | O timer já foi pausado/resetado antes da chamada; o erro propaga normalmente para o React Query sem deixar o timer em estado inconsistente. |

---

## Testing Strategy

### Abordagem dual

- **Testes unitários (Vitest + Testing Library)**: exemplos concretos, casos de borda, interações de UI.
- **Testes de propriedade (fast-check)**: propriedades universais com mínimo de 100 iterações cada.

### Testes unitários (exemplos e casos de borda)

- Renderização do botão play para sessão `pending` (Req 1.1)
- Renderização do botão pause quando `running` (Req 1.3)
- Renderização do botão play quando `paused` (Req 1.5)
- Display `00:00` no estado `idle` (Req 2.4)
- Atualização do display a cada segundo com fake timers (Req 2.3)
- `aria-live="polite"` no container do elapsed time (Req 2.5)
- Restauração de timer `running` com ajuste de tempo decorrido desde o save (Req 3.4)
- Auto-pause ao clicar "Feito!" com timer ativo (Req 4.1)
- `onComplete` chamado sem `elapsedSeconds` quando elapsed = 0 (Req 4.3)
- Timer resetado ao clicar "Pular" (Req 4.4)
- Verificação de existência de outro Active_Timer ao iniciar (Req 6.1)

### Testes de propriedade (fast-check, mínimo 100 iterações)

Cada teste de propriedade deve ser anotado com o tag:
`// Feature: session-timer, Property N: <texto da propriedade>`

**Property 1** — `fc.string()` como session id, `fc.constantFrom('idle', 'paused')` como estado inicial → após `startTimer`, `status === 'running'`; `fc.constantFrom('running')` → após `pauseTimer`, `status === 'paused'`.

**Property 2** — `fc.integer({ min: 0, max: 3599 })` → resultado bate com `/^\d{2}:\d{2}$/`; `fc.integer({ min: 3600, max: 359999 })` → resultado bate com `/^\d{2}:\d{2}:\d{2}$/`.

**Property 3** — `fc.record({ sessionId: fc.uuid(), status: fc.constantFrom('running', 'paused'), elapsedSeconds: fc.nat() })` → save + load retorna valores equivalentes.

**Property 4** — `fc.uuid()` como session id com estado salvo → após `resetTimer` (chamado em done/skip), store não contém a chave.

**Property 5** — `fc.uuid()` como session id, `fc.integer({ min: 1 })` como elapsed → `handleComplete` chama `onComplete` com o elapsed correto.

**Property 6** — `fc.uuid()` como session id, `fc.constantFrom('running', 'paused', 'idle')` como status → presença/ausência do indicador visual é consistente com o status.

**Property 7** — `fc.array(fc.uuid(), { minLength: 2, maxLength: 10 })` como lista de session ids → após qualquer sequência de `startTimer`, `Object.values(timers).filter(t => t.status === 'running').length <= 1`.

**Property 8** — `fc.constantFrom('done', 'skipped')` como status da sessão → nenhum botão play/pause presente no DOM.

### Configuração

```typescript
// vitest.config.ts — já existente no projeto
// Adicionar fast-check: npm install -D fast-check
// Cada teste de propriedade: fc.assert(fc.property(...), { numRuns: 100 })
```
