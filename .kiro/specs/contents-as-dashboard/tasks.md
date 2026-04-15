# Plano de Implementação: contents-as-dashboard

## Visão Geral

Consolidar as páginas Dashboard (`/`) e Conteúdos (`/contents`) em uma única página unificada acessível pela rota raiz `/`. A implementação consiste em expandir `Contents.tsx` para absorver os comportamentos de `Dashboard.tsx`, atualizar o roteamento em `App.tsx`, atualizar a `NavBar`, remover `Dashboard.tsx` e atualizar os testes existentes.

## Tasks

- [x] 1. Expandir `Contents.tsx` para incorporar o Progress Panel
  - Adicionar imports de `useUserProfile`, `useRecordDailyLogin` de `../hooks/useGamification`
  - Adicionar imports de `XPBar` de `../components/gamification/XPBar`
  - Adicionar imports de `DailyView` e `WeeklyView` de `../components/dashboard/`
  - Adicionar imports de `motion` e `AnimatePresence` de `framer-motion`
  - Adicionar imports de `useQueryClient` de `@tanstack/react-query`, `supabase` de `../lib/supabase` e `useAuthStore` de `../stores/authStore`
  - Adicionar estado local `activeTab: 'hoje' | 'semana'` com valor inicial `'hoje'`
  - Chamar `useUserProfile()` e `useRecordDailyLogin()` no corpo do componente
  - Adicionar `useEffect` para chamar `recordDailyLogin.mutate()` uma vez na montagem
  - Adicionar `useEffect` para assinatura Realtime do Supabase em `xp_transactions` e `streaks`, invalidando `userProfile` no cache
  - Renderizar spinner acessível (`aria-live="polite"`) enquanto `isLoading` for `true`
  - Renderizar `XPBar` com `totalXP`, `level`, `levelName` e `xpToNextLevel` do `userProfile` acima do conteúdo principal
  - Renderizar controle de abas "Missão Diária" / "Visão Semanal" com animação `motion` e `layoutId="activeTabBadge"`
  - Renderizar `DailyView` (com `streak={userProfile?.currentStreak ?? 0}`) ou `WeeklyView` conforme `activeTab`, com `AnimatePresence mode="wait"`
  - Passar `weeklyCapacityHours` para `ContentList` (obtido via `useSchedule` ou equivalente, se disponível; caso contrário, omitir por ora)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 6.1, 6.2, 6.3_

- [x] 2. Atualizar `App.tsx` para refletir a nova estrutura de rotas
  - Remover o import de `Dashboard` de `./pages/Dashboard`
  - Alterar a rota `path="/"` para renderizar `<Contents />` em vez de `<Dashboard />`
  - Remover a rota `path="/contents"` (o fallback `path="*"` já redireciona para `/`)
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. Atualizar `NavBar.tsx` para refletir a nova estrutura de navegação
  - Alterar o array `NAV_LINKS`: substituir `{ to: "/", label: "Dashboard", end: true }` por `{ to: "/", label: "Conteúdos", end: true }`
  - Remover o item `{ to: "/contents", label: "Conteúdos" }` do array
  - Manter todos os demais itens (`/categories`, `/schedule`, `/profile`, `/reports`) sem alteração
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 4. Remover `Dashboard.tsx` e artefatos exclusivos do Dashboard antigo
  - Deletar o arquivo `src/pages/Dashboard.tsx`
  - Verificar que `DailyView`, `WeeklyView` e `SessionCard` permanecem em `src/components/dashboard/` (não remover — são reutilizados pela New_Dashboard)
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 5. Atualizar testes existentes que referenciam `Dashboard.tsx`
  - Em `src/__tests__/dashboard-bug-condition.test.tsx`: verificar se há imports ou referências diretas a `Dashboard.tsx` e atualizar para `Contents.tsx` se necessário (o arquivo atual usa apenas `useContents` e `useSessions`, sem import direto de `Dashboard` — confirmar e ajustar se necessário)
  - Em `src/__tests__/dashboard-preservation.test.tsx`: mesma verificação — o arquivo atual usa apenas `useContents` e `useSessions`; confirmar que não há referências quebradas após a remoção de `Dashboard.tsx`
  - Verificar `src/__tests__/bug-condition-exploration.test.tsx` e `src/__tests__/preservation-property.test.tsx` para referências a `Dashboard.tsx`
  - _Requirements: 5.4_

- [x] 6. Checkpoint — Garantir que a aplicação compila e os testes passam
  - Executar `npm run build` (ou `tsc -b`) para verificar que não há erros de TypeScript
  - Executar `npm run test` para verificar que todos os testes existentes continuam passando
  - Garantir que não há imports quebrados após a remoção de `Dashboard.tsx`
  - Perguntar ao usuário se há dúvidas antes de prosseguir.

- [x] 7. Escrever testes de componente para `Contents.tsx` (New_Dashboard)
  - [x] 7.1 Implementar testes de componente para `Contents.tsx`
    - Renderiza `XPBar` quando `useUserProfile` retorna dados válidos
    - Exibe spinner acessível quando `isLoading` é `true`
    - Renderiza abas "Missão Diária" e "Visão Semanal"; clicar em "Visão Semanal" exibe `WeeklyView`
    - Chama `useRecordDailyLogin` exatamente uma vez na montagem (não em re-renders)
    - Renderiza `CalendarView` e `ContentList` abaixo do Progress Panel
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 6.2_

  - [ ]* 7.2 Escrever property test para Property 1 — XPBar exibe dados consistentes com userProfile
    - **Property 1: XPBar exibe dados consistentes com o perfil do usuário**
    - Usar `fc.record` com `totalXP`, `level`, `levelName`, `xpToNextLevel`, `currentStreak`, `longestStreak` para gerar perfis arbitrários
    - Mockar `useUserProfile` para retornar o perfil gerado
    - Verificar que `XPBar` exibe `profile.totalXP` e `profile.level` sem transformação
    - Verificar que `DailyView` recebe `streak={profile.currentStreak}`
    - Mínimo 100 iterações (`numRuns: 100`)
    - **Validates: Requirements 2.1, 2.3, 6.3**

  - [ ]* 7.3 Escrever property test para Property 2 — Content Catalog sem perda ou duplicação
    - **Property 2: Content Catalog exibe todos os conteúdos ativos sem perda ou duplicação**
    - Usar `fc.array(fc.record({ id: fc.uuid(), title: fc.string(...), status: fc.constant('active'), ... }))` para gerar listas arbitrárias de conteúdos
    - Mockar `useContents` para retornar a lista gerada
    - Verificar que o número de `ContentCard`s renderizados é igual a `contents.length`
    - Verificar que cada `content.id` aparece exatamente uma vez no DOM
    - Mínimo 100 iterações (`numRuns: 100`)
    - **Validates: Requirements 3.1, 3.5**

- [x] 8. Escrever testes de componente para `NavBar.tsx`
  - [x] 8.1 Implementar testes de componente para `NavBar.tsx`
    - Exibe o item "Conteúdos" com `href="/"`
    - Não exibe nenhum item com texto "Dashboard"
    - Marca "Conteúdos" como ativo quando a rota ativa é `/`
    - Mantém Categorias, Agenda, Perfil e Relatórios com suas rotas originais
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 9. Escrever testes de roteamento para `App.tsx`
  - [x] 9.1 Implementar testes de roteamento
    - A rota `/` renderiza o componente `Contents`
    - Rotas desconhecidas (ex: `/foo`, `/contents`) redirecionam para `/`
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 10. Escrever property test para Property 3 — Alerta de sobrecarga
  - [ ]* 10.1 Escrever property test para Property 3
    - **Property 3: Alerta de sobrecarga aparece se e somente se horas estimadas excedem capacidade semanal**
    - Usar `fc.float({ min: 0, max: 200 })` para `totalHorasEstimadas` e `fc.float({ min: 0.5, max: 168 })` para `capacidadeSemanal`
    - Renderizar `ContentList` com `weeklyCapacityHours=capacidade` e conteúdos cujas `estimatedHours` somam `totalHoras`
    - Se `totalHoras > capacidade`: verificar que o alerta (`role="alert"`) está presente no DOM
    - Se `totalHoras <= capacidade`: verificar que o alerta está ausente
    - Mínimo 100 iterações (`numRuns: 100`)
    - **Validates: Requirements 3.6**

- [x] 11. Checkpoint final — Garantir que todos os testes passam
  - Executar `npm run test` para verificar que todos os testes (existentes e novos) passam
  - Executar `npm run build` para confirmar que não há erros de TypeScript ou build
  - Perguntar ao usuário se há dúvidas antes de encerrar.

## Notas

- Tasks marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada task referencia os requisitos específicos para rastreabilidade
- Os componentes `DailyView`, `WeeklyView` e `SessionCard` **não são removidos** — permanecem em `src/components/dashboard/` e são reutilizados pela New_Dashboard
- A biblioteca de property-based testing é `fast-check` (já compatível com Vitest; instalar com `npm install -D fast-check` se ainda não estiver no projeto)
- O alerta de sobrecarga em `ContentList` já está implementado via prop `weeklyCapacityHours` — a task 1 apenas precisa passar esse valor corretamente
