# Implementation Plan: Session Timer

## Overview

Adiciona um cronômetro de play/pause a cada `SessionCard` da dashboard. O estado dos timers é gerenciado por um Zustand store com persistência em `localStorage`. Um hook `useSessionTimer` encapsula a lógica de tick e expõe uma API simples para os componentes. A mudança na interface de `onComplete` é mínima e retrocompatível.

## Tasks

- [x] 1. Criar utilitário de formatação e tipos do timer
  - Criar `studyflow/src/lib/timer.ts` com a função pura `formatElapsedTime(seconds: number): string`
  - Definir e exportar os tipos `TimerStatus` e `TimerEntry` nesse mesmo arquivo
  - _Requirements: 2.1, 2.2_

  - [ ]* 1.1 Escrever property test para `formatElapsedTime`
    - **Property 2: Elapsed time format correctness**
    - **Validates: Requirements 2.1, 2.2**
    - Usar `fc.integer({ min: 0, max: 3599 })` → resultado bate com `/^\d{2}:\d{2}$/`
    - Usar `fc.integer({ min: 3600, max: 359999 })` → resultado bate com `/^\d{2}:\d{2}:\d{2}$/`

- [x] 2. Implementar `useTimerStore` (Zustand + persist)
  - Criar `studyflow/src/stores/timerStore.ts`
  - Implementar o store com `timers: Record<string, TimerEntry>` e as actions: `startTimer`, `pauseTimer`, `resetTimer`, `getElapsed`
  - `startTimer` deve pausar qualquer outro timer ativo antes de iniciar o novo (invariante de timer único)
  - Configurar middleware `persist` do Zustand com chave `"studyflow:timers"` e `localStorage`
  - Ao hidratar, se um timer estava `running`, ajustar `startedAt` para `Date.now()` mantendo `elapsedSeconds` acumulado
  - Tratar `localStorage` indisponível operando apenas em memória sem lançar erro
  - Tratar `startedAt` corrompido restaurando como `paused` com `elapsedSeconds` salvo
  - `getElapsed` deve retornar `Math.max(0, calculatedElapsed)` para evitar valores negativos/NaN
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 6.1, 6.2, 6.3_

  - [ ]* 2.1 Escrever property test para transições de estado do timer
    - **Property 1: Timer state machine transitions**
    - **Validates: Requirements 1.2, 1.4**
    - `fc.string()` como session id, `fc.constantFrom('idle', 'paused')` → após `startTimer`, `status === 'running'`
    - `fc.constantFrom('running')` → após `pauseTimer`, `status === 'paused'`

  - [ ]* 2.2 Escrever property test para persistência round-trip
    - **Property 3: Timer persistence round-trip**
    - **Validates: Requirements 3.1, 3.2**
    - `fc.record({ sessionId: fc.uuid(), status: fc.constantFrom('running', 'paused'), elapsedSeconds: fc.nat() })` → save + load retorna valores equivalentes

  - [ ]* 2.3 Escrever property test para limpeza do timer
    - **Property 4: Timer cleanup on session completion or skip**
    - **Validates: Requirements 3.3**
    - `fc.uuid()` como session id com estado salvo → após `resetTimer`, store não contém a chave

  - [ ]* 2.4 Escrever property test para invariante de timer único
    - **Property 7: Single active timer invariant**
    - **Validates: Requirements 6.2, 6.3**
    - `fc.array(fc.uuid(), { minLength: 2, maxLength: 10 })` → após qualquer sequência de `startTimer`, `Object.values(timers).filter(t => t.status === 'running').length <= 1`

- [x] 3. Checkpoint — Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 4. Implementar hook `useSessionTimer`
  - Criar `studyflow/src/hooks/useSessionTimer.ts`
  - O hook recebe `sessionId`, `onComplete: (id: string, elapsedSeconds?: number) => void` e `onSkip: (id: string) => void`
  - Gerenciar `setInterval` de 1 segundo internamente; o intervalo só existe quando `status === 'running'`
  - Expor: `status`, `elapsedSeconds`, `formattedTime`, `isRunning`, `handlePlay`, `handlePause`, `handleComplete`, `handleSkip`
  - `handleComplete`: pausar timer, chamar `onComplete(id, elapsedSeconds)` se elapsed > 0, ou `onComplete(id)` se elapsed === 0; chamar `resetTimer` após
  - `handleSkip`: chamar `resetTimer`, depois `onSkip(id)`
  - _Requirements: 1.2, 1.4, 2.3, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 4.1 Escrever property test para `elapsedSeconds` passado ao `onComplete`
    - **Property 5: Elapsed time forwarded on complete**
    - **Validates: Requirements 4.2**
    - `fc.uuid()` como session id, `fc.integer({ min: 1 })` como elapsed → `handleComplete` chama `onComplete` com o elapsed correto

- [x] 5. Atualizar `SessionCard` com controles de timer e indicador visual
  - Atualizar `studyflow/src/components/dashboard/SessionCard.tsx`
  - Adicionar `elapsedSeconds?: number` ao tipo de `onComplete` nas props
  - Usar `useSessionTimer` internamente para obter estado e handlers
  - Renderizar botão play (ícone + `aria-label="Iniciar cronômetro"`) quando `status === 'idle'` ou `'paused'` e sessão `pending`
  - Renderizar botão pause (ícone + `aria-label="Pausar cronômetro"`) quando `status === 'running'`
  - Não renderizar botões play/pause quando sessão é `done` ou `skipped`
  - Exibir `formattedTime` em elemento com `aria-live="polite"`; mostrar `00:00` no estado `idle`
  - Aplicar borda animada/destaque de cor quando `isRunning === true`
  - Exibir label "Em andamento" ao lado do elapsed time quando `isRunning === true`
  - Remover indicador visual quando `status` muda de `running` para `paused` ou `idle`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2, 5.3_

  - [ ]* 5.1 Escrever property test para indicador visual
    - **Property 6: Active visual indicator reflects running state**
    - **Validates: Requirements 5.1, 5.2, 5.3**
    - `fc.constantFrom('running', 'paused', 'idle')` como status → presença/ausência do indicador visual é consistente com o status

  - [ ]* 5.2 Escrever property test para ausência de controles em sessões concluídas
    - **Property 8: No timer controls for completed or skipped sessions**
    - **Validates: Requirements 1.6**
    - `fc.constantFrom('done', 'skipped')` como status da sessão → nenhum botão play/pause presente no DOM

- [x] 6. Atualizar `DailyView` e `WeeklyView` para passar `elapsedSeconds` ao `onComplete`
  - Atualizar `studyflow/src/components/dashboard/DailyView.tsx`: mudar `onComplete={(id) => completeSession.mutate(id)}` para `onComplete={(id, elapsed) => completeSession.mutate({ sessionId: id, elapsedSeconds: elapsed })}`
  - Verificar se `WeeklyView` também usa `SessionCard` e aplicar a mesma atualização
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 7. Atualizar `useCompleteSession` para aceitar `elapsedSeconds` opcional
  - Atualizar `studyflow/src/hooks/useSessions.ts`
  - Mudar `mutationFn` de `async (sessionId: string)` para `async ({ sessionId, elapsedSeconds }: { sessionId: string; elapsedSeconds?: number })`
  - O `elapsedSeconds` é recebido mas não precisa ser persistido no banco neste momento — apenas preparar a assinatura para futura lógica de XP bônus
  - Atualizar todas as chamadas a `completeSession.mutate(...)` no codebase para o novo formato
  - _Requirements: 4.2, 4.3_

- [x] 8. Checkpoint final — Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

## Notes

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Instalar `fast-check` como devDependency antes de escrever os property tests: `npm install -D fast-check`
- Cada property test deve ser anotado com `// Feature: session-timer, Property N: <texto>`
- Cada `fc.assert` deve usar `{ numRuns: 100 }` no mínimo
- O `localStorage` indisponível não deve quebrar o timer — apenas desabilitar persistência silenciosamente
