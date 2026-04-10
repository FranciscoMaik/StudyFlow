# Design Document — contents-calendar-view

## Overview

Adicionar um componente `CalendarView` na tela de Conteúdos do StudyFlow que exibe uma grade mensal com indicadores visuais nos dias que possuem sessões de estudo agendadas. O usuário pode navegar entre meses e clicar em um dia para ver os eventos daquele dia.

A feature é puramente front-end: não requer novas tabelas ou migrações no banco. Ela consome a tabela `sessions` já existente, filtrando por `user_id` e pelo intervalo de datas do mês exibido.

**Stack:** React 19 + TypeScript, TailwindCSS v4, TanStack Query v5, Supabase JS v2, Vitest + Testing Library.

---

## Architecture

O calendário é composto por três camadas:

```
Pages/Contents.tsx
  └── CalendarView (componente orquestrador)
        ├── MonthNavigator (cabeçalho + navegação)
        ├── CalendarGrid (grade de dias)
        │     └── CalendarDay (célula individual)
        └── DayEventList (lista de eventos do dia selecionado)
              └── DayEventItem (item de sessão)
```

**Fluxo de dados:**

1. `CalendarView` mantém o estado `currentMonth: { year, month }` e `selectedDay: string | null`.
2. O hook `useMonthSessions(year, month)` busca no Supabase todas as sessões do usuário no intervalo do mês.
3. A função pura `buildCalendarGrid(year, month)` gera a grade de semanas.
4. A função pura `groupSessionsByDate(sessions)` produz um `Record<string, Session[]>` para lookup O(1).
5. `CalendarGrid` renderiza as células, passando os indicadores calculados por `getDayIndicatorType`.
6. Ao clicar em um dia, `CalendarView` atualiza `selectedDay` e `DayEventList` exibe as sessões filtradas.

---

## Components and Interfaces

### `useMonthSessions(year: number, month: number)`

Hook TanStack Query que busca sessões do mês no Supabase.

```typescript
// studyflow/src/hooks/useMonthSessions.ts
export function useMonthSessions(year: number, month: number): UseQueryResult<Session[]>
```

- `queryKey: ["sessions", "month", year, month]`
- Filtra `scheduled_date` entre o primeiro e último dia do mês (inclusive).
- Filtra `user_id` do usuário autenticado.
- Filtra `status IN ('pending', 'done')` — sessões skipped não geram indicador.
- Retorna `Session[]` usando o `mapSession` já existente em `useSessions.ts`.

### `buildCalendarGrid(year: number, month: number): (number | null)[][]`

Função pura que retorna uma matriz de semanas. Cada semana é um array de 7 posições (Dom–Sáb). Posições sem dia do mês são `null`.

```typescript
// studyflow/src/lib/calendar.ts
export function buildCalendarGrid(year: number, month: number): (number | null)[][]
```

### `groupSessionsByDate(sessions: Session[]): Record<string, Session[]>`

Função pura que agrupa sessões por `scheduledDate`.

```typescript
export function groupSessionsByDate(sessions: Session[]): Record<string, Session[]>
```

### `getDayIndicatorType(sessions: Session[]): 'done' | 'pending' | null`

Função pura que determina o tipo de indicador para um dia.

- `null` se não há sessões.
- `'done'` se todas as sessões do dia têm `status === 'done'`.
- `'pending'` se há pelo menos uma sessão com `status === 'pending'`.

```typescript
export function getDayIndicatorType(sessions: Session[]): 'done' | 'pending' | null
```

### `navigateMonth(year: number, month: number, delta: 1 | -1): { year: number; month: number }`

Função pura que avança ou retrocede o mês, com wrap correto (dezembro → janeiro do próximo ano, janeiro → dezembro do ano anterior).

```typescript
export function navigateMonth(year: number, month: number, delta: 1 | -1): { year: number; month: number }
```

### `getSessionsForDate(date: string, sessions: Session[]): Session[]`

Função pura que filtra sessões por data exata.

```typescript
export function getSessionsForDate(date: string, sessions: Session[]): Session[]
```

### `CalendarView`

Componente orquestrador. Gerencia estado local de `currentMonth` e `selectedDay`.

```typescript
// studyflow/src/components/contents/CalendarView.tsx
export function CalendarView(): JSX.Element
```

Props: nenhuma (lê usuário do `authStore` via hook).

### `MonthNavigator`

```typescript
interface MonthNavigatorProps {
  year: number;
  month: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}
```

### `CalendarGrid`

```typescript
interface CalendarGridProps {
  year: number;
  month: number;
  sessionsByDate: Record<string, Session[]>;
  selectedDay: string | null;
  onDayClick: (dateStr: string) => void;
}
```

### `CalendarDay`

```typescript
interface CalendarDayProps {
  day: number | null;
  dateStr: string | null;
  isToday: boolean;
  isSelected: boolean;
  indicatorType: 'done' | 'pending' | null;
  onClick: () => void;
}
```

### `DayEventList`

```typescript
interface DayEventListProps {
  date: string;
  sessions: Session[];
  contentTitles: Record<string, string>;
}
```

### `DayEventItem`

```typescript
interface DayEventItemProps {
  session: Session;
  contentTitle: string;
}
```

---

## Data Models

Nenhuma nova tabela ou migração é necessária. A feature consome a tabela `sessions` existente:

```sql
sessions (
  id            uuid PRIMARY KEY,
  user_id       uuid REFERENCES auth.users,
  content_id    uuid REFERENCES contents,
  scheduled_date date,
  planned_hours  numeric,
  status         text CHECK (status IN ('pending', 'done', 'skipped')),
  completed_at   timestamptz
)
```

**Query do hook `useMonthSessions`:**

```sql
SELECT * FROM sessions
WHERE user_id = :userId
  AND scheduled_date >= :firstDay
  AND scheduled_date <= :lastDay
  AND status IN ('pending', 'done')
ORDER BY scheduled_date ASC;
```

**Integração com React Query:**

O `queryKey` `["sessions", "month", year, month]` é invalidado automaticamente quando as mutations existentes (`useCreateContent`, `useUpdateContent`, `useArchiveContent`, `useMarkContentDone`) chamam `queryClient.invalidateQueries({ queryKey: ["sessions"] })` — pois o prefixo `["sessions"]` cobre todos os sub-keys.

**Estado local do `CalendarView`:**

```typescript
const [currentMonth, setCurrentMonth] = useState<{ year: number; month: number }>(() => {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() };
});
const [selectedDay, setSelectedDay] = useState<string | null>(null);
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Alinhamento da grade com o dia da semana

*For any* mês e ano válidos, a função `buildCalendarGrid` deve retornar uma grade onde o índice (0–6) do primeiro dia não-nulo na primeira semana é igual ao `dayOfWeek` (0=Dom, 6=Sáb) do dia 1 daquele mês, e o índice do último dia não-nulo na última semana é igual ao `dayOfWeek` do último dia daquele mês.

**Validates: Requirements 1.1, 1.4, 1.5**

### Property 2: Cobertura completa dos dias do mês na grade

*For any* mês e ano válidos, a função `buildCalendarGrid` deve retornar uma grade cujos valores não-nulos formam exatamente o conjunto `{1, 2, ..., N}` onde N é o número de dias daquele mês, sem repetições e sem omissões.

**Validates: Requirements 1.1, 1.4, 1.5**

### Property 3: Agrupamento de sessões por data

*For any* lista de sessões, a função `groupSessionsByDate` deve retornar um mapa onde cada chave é uma `scheduledDate` presente na lista, e o valor é exatamente o subconjunto de sessões com aquela data — sem perda e sem duplicação.

**Validates: Requirements 2.1, 4.1**

### Property 4: Tipo de indicador reflete status das sessões do dia

*For any* lista não-vazia de sessões de um dia, a função `getDayIndicatorType` deve retornar `'done'` se e somente se todas as sessões têm `status === 'done'`; deve retornar `'pending'` se há pelo menos uma sessão com `status === 'pending'`; deve retornar `null` para lista vazia.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 5: Navegação de mês preserva validade e wrap correto

*For any* mês (0–11) e ano válido, aplicar `navigateMonth` com delta `+1` seguido de delta `-1` deve retornar ao mês e ano originais (round-trip). Adicionalmente, navegar de dezembro com `+1` deve resultar em janeiro do ano seguinte, e navegar de janeiro com `-1` deve resultar em dezembro do ano anterior.

**Validates: Requirements 3.2, 3.3**

### Property 6: Filtragem de sessões por data exata

*For any* data e lista de sessões, a função `getSessionsForDate` deve retornar exatamente as sessões cuja `scheduledDate` é igual à data fornecida — sem incluir sessões de outras datas e sem omitir sessões da data correta.

**Validates: Requirements 4.1, 4.3**

---

## Error Handling

| Cenário | Comportamento |
|---|---|
| Falha na busca de sessões (`useMonthSessions` retorna `isError`) | `CalendarView` exibe mensagem de erro inline: "Não foi possível carregar as sessões." |
| Sessão sem `content_id` correspondente no mapa de títulos | `DayEventItem` exibe "Conteúdo desconhecido" como fallback |
| Usuário não autenticado | Hook retorna `enabled: false`; calendário não renderiza (protegido por `ProtectedRoute`) |
| Mês com 28, 29, 30 ou 31 dias | `buildCalendarGrid` lida corretamente com todos os casos via `new Date(year, month + 1, 0).getDate()` |

---

## Testing Strategy

### Abordagem dual

- **Testes unitários (example-based):** cobrem comportamentos específicos de UI, estados de loading/error, interações de clique e casos de borda.
- **Testes de propriedade (property-based):** cobrem as funções puras de lógica de calendário com entradas geradas aleatoriamente.

### Biblioteca de property-based testing

Usar **`fast-check`** (já compatível com Vitest). Instalar como devDependency:

```bash
npm install --save-dev fast-check
```

Cada teste de propriedade deve rodar mínimo **100 iterações** (padrão do fast-check).

### Testes de propriedade

Arquivo: `studyflow/src/lib/__tests__/calendar.property.test.ts`

Cada teste referencia a propriedade do design com o tag:
`// Feature: contents-calendar-view, Property N: <texto>`

| Propriedade | Teste |
|---|---|
| Property 1 | `fc.tuple(fc.integer({min:0,max:11}), fc.integer({min:2000,max:2100}))` → verificar alinhamento do primeiro e último dia |
| Property 2 | Mesmo gerador → verificar que valores não-nulos == `{1..N}` |
| Property 3 | `fc.array(fc.record({scheduledDate, ...}))` → verificar agrupamento sem perda |
| Property 4 | `fc.array(fc.record({status: fc.constantFrom('pending','done')}), {minLength:1})` → verificar tipo de indicador |
| Property 5 | `fc.tuple(fc.integer({min:0,max:11}), fc.integer({min:2000,max:2100}))` → verificar round-trip e wraps |
| Property 6 | `fc.tuple(fc.string(), fc.array(fc.record({scheduledDate,...})))` → verificar filtragem exata |

### Testes unitários

Arquivo: `studyflow/src/components/contents/__tests__/CalendarView.test.tsx`

- Renderiza grade com dias corretos para um mês conhecido
- Exibe spinner quando `isLoading = true`
- Exibe mensagem de erro quando `isError = true`
- Clicar em dia com sessões define `selectedDay` e exibe `DayEventList`
- Clicar no mesmo dia novamente limpa `selectedDay` (toggle)
- Clicar em dia sem sessões não define `selectedDay`
- Botão "Próximo" avança o mês
- Botão "Anterior" retrocede o mês
- Botão "Hoje" retorna ao mês atual
- Navegar de mês limpa `selectedDay`
- Dia atual recebe destaque visual
- `DayEventItem` exibe título, horas e status da sessão
