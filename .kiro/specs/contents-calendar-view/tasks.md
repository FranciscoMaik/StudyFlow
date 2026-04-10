# Implementation Plan: contents-calendar-view

## Overview

Implementar o calendário mensal na tela de Conteúdos do StudyFlow em TypeScript/React. A implementação segue a arquitetura em camadas: funções puras de lógica de calendário → hook de dados → componentes de UI → integração na página.

## Tasks

- [x] 1. Implementar funções puras de calendário em `src/lib/calendar.ts`
  - Criar o arquivo `studyflow/src/lib/calendar.ts` com as funções: `buildCalendarGrid`, `groupSessionsByDate`, `getDayIndicatorType`, `navigateMonth` e `getSessionsForDate`
  - `buildCalendarGrid(year, month)` retorna `(number | null)[][]` — matriz de semanas (Dom–Sáb), preenchendo com `null` antes do primeiro dia e após o último dia
  - `groupSessionsByDate(sessions)` retorna `Record<string, Session[]>` agrupando por `scheduledDate`
  - `getDayIndicatorType(sessions)` retorna `'done'` se todas as sessões são `done`, `'pending'` se há pelo menos uma `pending`, `null` para lista vazia
  - `navigateMonth(year, month, delta)` avança ou retrocede o mês com wrap correto (dez→jan do próximo ano, jan→dez do ano anterior)
  - `getSessionsForDate(date, sessions)` filtra sessões por `scheduledDate` exata
  - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.2, 2.3, 3.2, 3.3, 4.1, 4.3_

  - [ ]* 1.1 Escrever testes de propriedade para `buildCalendarGrid` (Properties 1 e 2)
    - **Property 1: Alinhamento da grade com o dia da semana**
    - **Validates: Requirements 1.1, 1.4, 1.5**
    - **Property 2: Cobertura completa dos dias do mês na grade**
    - **Validates: Requirements 1.1, 1.4, 1.5**
    - Criar `studyflow/src/lib/__tests__/calendar.property.test.ts` com `fc.tuple(fc.integer({min:0,max:11}), fc.integer({min:2000,max:2100}))` como gerador
    - Instalar `fast-check` como devDependency antes de criar o arquivo

  - [ ]* 1.2 Escrever testes de propriedade para `groupSessionsByDate` (Property 3)
    - **Property 3: Agrupamento de sessões por data**
    - **Validates: Requirements 2.1, 4.1**
    - Adicionar ao arquivo `calendar.property.test.ts` usando `fc.array(fc.record({scheduledDate: fc.string(), ...}))`

  - [ ]* 1.3 Escrever testes de propriedade para `getDayIndicatorType` (Property 4)
    - **Property 4: Tipo de indicador reflete status das sessões do dia**
    - **Validates: Requirements 2.1, 2.2, 2.3**
    - Adicionar ao arquivo `calendar.property.test.ts` usando `fc.array(fc.record({status: fc.constantFrom('pending','done')}), {minLength:1})`

  - [ ]* 1.4 Escrever testes de propriedade para `navigateMonth` (Property 5)
    - **Property 5: Navegação de mês preserva validade e wrap correto**
    - **Validates: Requirements 3.2, 3.3**
    - Adicionar ao arquivo `calendar.property.test.ts` verificando round-trip e wraps de dezembro→janeiro e janeiro→dezembro

  - [ ]* 1.5 Escrever testes de propriedade para `getSessionsForDate` (Property 6)
    - **Property 6: Filtragem de sessões por data exata**
    - **Validates: Requirements 4.1, 4.3**
    - Adicionar ao arquivo `calendar.property.test.ts` usando `fc.tuple(fc.string(), fc.array(fc.record({scheduledDate: fc.string(), ...})))`

- [x] 2. Implementar o hook `useMonthSessions` em `src/hooks/useMonthSessions.ts`
  - Criar `studyflow/src/hooks/useMonthSessions.ts` com `useMonthSessions(year, month)`
  - `queryKey: ["sessions", "month", year, month]`
  - Calcular `firstDay` e `lastDay` do mês para filtrar `scheduled_date`
  - Filtrar `user_id` do usuário autenticado via `useAuthStore`
  - Filtrar `status IN ('pending', 'done')` — sessões `skipped` não geram indicador
  - Reutilizar o `mapSession` de `useSessions.ts` (exportar a função ou duplicar localmente)
  - `enabled: !!user`
  - _Requirements: 2.1, 2.4, 2.5, 5.2, 5.3_

- [x] 3. Checkpoint — Garantir que as funções puras e o hook compilam sem erros
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [x] 4. Implementar os componentes de UI do calendário
  - [x] 4.1 Criar `DayEventItem` em `studyflow/src/components/contents/DayEventItem.tsx`
    - Props: `{ session: Session; contentTitle: string }`
    - Exibir título do conteúdo, horas planejadas e status da sessão
    - Fallback `"Conteúdo desconhecido"` quando `contentTitle` estiver vazio
    - _Requirements: 4.3_

  - [x] 4.2 Criar `DayEventList` em `studyflow/src/components/contents/DayEventList.tsx`
    - Props: `{ date: string; sessions: Session[]; contentTitles: Record<string, string> }`
    - Renderizar lista de `DayEventItem` para cada sessão do dia selecionado
    - _Requirements: 4.1, 4.3_

  - [x] 4.3 Criar `CalendarDay` em `studyflow/src/components/contents/CalendarDay.tsx`
    - Props: `{ day: number | null; dateStr: string | null; isToday: boolean; isSelected: boolean; indicatorType: 'done' | 'pending' | null; onClick: () => void }`
    - Célula clicável; renderiza vazia quando `day` é `null`
    - Destaque visual para `isToday` e `isSelected`
    - Ponto indicador colorido conforme `indicatorType` (`done` = verde, `pending` = amarelo/laranja)
    - _Requirements: 1.6, 2.1, 2.2, 2.3, 4.2_

  - [x] 4.4 Criar `CalendarGrid` em `studyflow/src/components/contents/CalendarGrid.tsx`
    - Props: `{ year: number; month: number; sessionsByDate: Record<string, Session[]>; selectedDay: string | null; onDayClick: (dateStr: string) => void }`
    - Renderizar cabeçalho com dias da semana abreviados (Dom, Seg, Ter, Qua, Qui, Sex, Sáb)
    - Usar `buildCalendarGrid` para gerar a grade e `getDayIndicatorType` para cada célula
    - Formatar `dateStr` como `YYYY-MM-DD` para cada dia não-nulo
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 4.5 Criar `MonthNavigator` em `studyflow/src/components/contents/MonthNavigator.tsx`
    - Props: `{ year: number; month: number; onPrev: () => void; onNext: () => void; onToday: () => void }`
    - Exibir nome do mês (em português) e ano
    - Botões "‹" (anterior), "›" (próximo) e "Hoje"
    - _Requirements: 1.2, 3.1, 3.4_

  - [x] 4.6 Criar `CalendarView` em `studyflow/src/components/contents/CalendarView.tsx`
    - Estado local: `currentMonth: { year, month }` inicializado com o mês atual; `selectedDay: string | null`
    - Usar `useMonthSessions(year, month)` para buscar sessões
    - Usar `useContents` (hook existente) para montar `contentTitles: Record<string, string>`
    - Usar `groupSessionsByDate` e `navigateMonth` das funções puras
    - Lógica de toggle: clicar no mesmo dia limpa `selectedDay`; clicar em dia sem sessões também limpa
    - Navegar de mês limpa `selectedDay`
    - Exibir spinner durante `isLoading`; mensagem de erro durante `isError`
    - Compor `MonthNavigator`, `CalendarGrid` e `DayEventList`
    - _Requirements: 1.6, 2.4, 2.5, 3.2, 3.3, 3.4, 4.1, 4.2, 4.4, 4.5, 4.6, 5.1, 5.4_

- [x] 5. Checkpoint — Garantir que todos os componentes renderizam sem erros de compilação
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [ ] 6. Escrever testes unitários para `CalendarView`
  - [ ]* 6.1 Criar `studyflow/src/components/contents/__tests__/CalendarView.test.tsx`
    - Testar: renderiza grade com dias corretos para um mês conhecido
    - Testar: exibe spinner quando `isLoading = true`
    - Testar: exibe mensagem de erro quando `isError = true`
    - Testar: clicar em dia com sessões define `selectedDay` e exibe `DayEventList`
    - Testar: clicar no mesmo dia novamente limpa `selectedDay` (toggle)
    - Testar: clicar em dia sem sessões não define `selectedDay`
    - Testar: botão "Próximo" avança o mês
    - Testar: botão "Anterior" retrocede o mês
    - Testar: botão "Hoje" retorna ao mês atual
    - Testar: navegar de mês limpa `selectedDay`
    - Testar: dia atual recebe destaque visual
    - Testar: `DayEventItem` exibe título, horas e status da sessão
    - _Requirements: 1.6, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.4, 4.5, 4.6_

- [x] 7. Integrar `CalendarView` na página `Contents.tsx`
  - Importar e renderizar `CalendarView` acima do componente `ContentList` na página `studyflow/src/pages/Contents.tsx`
  - Adicionar separador visual entre o calendário e a lista de módulos
  - _Requirements: 5.1, 5.3, 5.4_

- [x] 8. Checkpoint final — Garantir que todos os testes passam e a integração está funcional
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

## Notes

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia os requisitos específicos para rastreabilidade
- `fast-check` deve ser instalado como devDependency antes de criar os testes de propriedade (`npm install --save-dev fast-check` dentro de `studyflow/`)
- A função `mapSession` em `useSessions.ts` deve ser exportada ou replicada em `useMonthSessions.ts`
- O `queryKey` `["sessions", "month", year, month]` é coberto pelo prefixo `["sessions"]` nas invalidações existentes, garantindo atualização automática (Requirement 5.3)
- Os testes de propriedade devem rodar mínimo 100 iterações (padrão do fast-check)
