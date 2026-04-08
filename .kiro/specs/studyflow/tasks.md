# Plano de Implementação: StudyFlow

## Visão Geral

Implementação incremental da plataforma StudyFlow em React + TypeScript + Supabase, começando pela fundação (tipos, banco, autenticação), passando pelos módulos de negócio (conteúdos, agenda, planejador) e finalizando com gamificação, dashboard e relatórios.

## Tarefas

- [x] 1. Configurar projeto e fundação
  - Inicializar projeto Vite + React + TypeScript com Tailwind CSS
  - Instalar dependências: `@supabase/supabase-js`, `zustand`, `@tanstack/react-query`, `react-hook-form`, `zod`, `recharts`
  - Criar `src/types/index.ts` com todas as interfaces TypeScript: `Content`, `Session`, `ScheduleDay`, `Category`, `XPTransaction`, `Achievement`, `AchievementKey`, `UserProfile`, `PlannerInput`, `PlannerOutput`, `AchievementCheckContext`
  - Criar `src/lib/supabase.ts` com o cliente Supabase configurado via variáveis de ambiente
  - Configurar `QueryClientProvider` e `AuthProvider` no `main.tsx`
  - _Requisitos: 1.1, 1.6, 13.5_

- [x] 2. Banco de dados e RLS
  - [x] 2.1 Criar migrations SQL para todas as tabelas
    - Criar tabelas: `schedules`, `categories`, `contents`, `sessions`, `xp_transactions`, `achievements`, `streaks`
    - Aplicar constraints de validação conforme esquema do design
    - _Requisitos: 2.2, 3.1, 7.1, 10.4_
  - [x] 2.2 Configurar RLS em todas as tabelas
    - Habilitar RLS e criar policy `users_own_*` em cada tabela
    - _Requisitos: 1.6, 13.5_
  - [x] 2.3 Criar triggers PostgreSQL para consistência transacional
    - `xp_on_session_complete()`: credita 50 XP ao marcar sessão como `done`
    - `check_content_completion()`: atualiza `completed_hours` e status do conteúdo; credita 200 XP se concluído; credita 100 XP adicional se antes do prazo
    - `update_streak()`: incrementa ou reseta streak após conclusão de sessão
    - `check_achievements()`: verifica e registra conquistas desbloqueadas
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 8.1, 8.2, 10.1, 10.2_

- [x] 3. Autenticação
  - [x] 3.1 Implementar `src/stores/authStore.ts` com Zustand
    - Estado: `user`, `session`; ações: `setUser`, `clearUser`
    - _Requisitos: 1.1, 1.5_
  - [x] 3.2 Implementar `src/hooks/useAuth.ts`
    - Funções: `signUp`, `signIn`, `signOut`
    - Listener `onAuthStateChange` para renovação automática de token
    - _Requisitos: 1.1, 1.2, 1.4, 1.5_
  - [x] 3.3 Criar componentes `src/components/auth/`
    - `Register.tsx`: formulário com validação Zod (e-mail + senha)
    - `Login.tsx`: formulário com mensagem de erro genérica sem revelar campo incorreto
    - `ProtectedRoute.tsx`: redireciona para login se não autenticado
    - _Requisitos: 1.1, 1.2, 1.3_

- [x] 4. Checkpoint — autenticação funcional
  - Garantir que cadastro, login, logout e renovação de token funcionam corretamente. Verificar que rotas protegidas redirecionam usuários não autenticados.

- [x] 5. Categorias
  - [x] 5.1 Implementar CRUD de categorias
    - Hook `src/hooks/useContents.ts` (seção categorias): `useCategories`, `createCategory`, `updateCategory`, `deleteCategory`
    - Componente `src/components/contents/CategoryForm.tsx` com validação: nome obrigatório (máx 50 chars), cor da paleta predefinida
    - _Requisitos: 12.1_
  - [ ]* 5.2 Escrever testes unitários para validação de categorias
    - Testar rejeição de nome vazio e nome acima de 50 caracteres
    - _Requisitos: 12.1_

- [x] 6. Conteúdos
  - [x] 6.1 Implementar `src/hooks/useContents.ts`
    - Queries: `useContents` (lista ativos), `useContent` (por id)
    - Mutations: `createContent` (credita 10 XP), `updateContent`, `archiveContent`
    - _Requisitos: 2.1, 2.4, 2.5_
  - [x] 6.2 Criar `src/components/contents/ContentForm.tsx`
    - Validação Zod: título obrigatório (máx 120), descrição opcional (máx 500), `estimatedHours` ≥ 0.5, prioridade obrigatória, prazo opcional (data futura), categoria opcional
    - Exibir erros de validação por campo
    - _Requisitos: 2.2, 2.3_
  - [x] 6.3 Criar `src/components/contents/ContentList.tsx` e `ContentCard.tsx`
    - Listar conteúdos ativos com barra de progresso (`completedHours / estimatedHours`)
    - Indicador visual de cor da categoria
    - Filtro por categoria
    - Alerta de sobrecarga quando total de horas estimadas excede capacidade da agenda
    - _Requisitos: 2.6, 2.7, 12.2, 12.3_
  - [ ]* 6.4 Escrever testes unitários para validação de conteúdos
    - Testar campos obrigatórios, limites de caracteres e `estimatedHours` < 0.5
    - _Requisitos: 2.2, 2.3_

- [x] 7. Agenda semanal
  - [x] 7.1 Implementar `src/hooks/useSchedule.ts`
    - Query: `useSchedule` (7 dias do usuário)
    - Mutation: `saveSchedule` (upsert dos 7 dias)
    - _Requisitos: 3.1, 3.2_
  - [x] 7.2 Criar `src/components/schedule/ScheduleConfig.tsx` e `DaySlot.tsx`
    - Toggle ativo/inativo por dia; input de horas (0.5–24) quando ativo
    - Validação: dia ativo sem horas definidas deve rejeitar envio
    - Exibir total de horas semanais disponíveis
    - _Requisitos: 3.1, 3.3, 3.4_
  - [ ]* 7.3 Escrever testes unitários para validação da agenda
    - Testar rejeição de dia ativo sem horas e horas fora do intervalo permitido
    - _Requisitos: 3.1, 3.3_

- [x] 8. Algoritmo do Planejador
  - [x] 8.1 Implementar `src/lib/planner.ts`
    - Função `generatePlan(input: PlannerInput): PlannerOutput`
    - Ordenação: prazo mais próximo → prioridade (alta > média > baixa) → menor horas restantes
    - Alocação respeitando limite diário da agenda; sem alocar mesmo conteúdo em dias consecutivos quando há alternativas
    - Horizonte padrão de 4 semanas
    - _Requisitos: 4.1, 4.2, 4.3, 4.4_
  - [x] 8.2 Implementar `rescheduleMissedSessions` em `planner.ts`
    - Reagendar sessões não concluídas para o próximo dia disponível nos próximos 7 dias
    - _Requisitos: 4.5_
  - [ ]* 8.3 Escrever testes de propriedade para o Planejador
    - **Propriedade 1: Respeito ao limite diário** — para qualquer entrada válida, a soma de `plannedHours` das sessões geradas em um mesmo dia nunca excede `availableHours` daquele dia
    - **Valida: Requisito 4.3**
  - [ ]* 8.4 Escrever testes de propriedade para ordenação do Planejador
    - **Propriedade 2: Prioridade de prazo** — conteúdos com prazo mais próximo recebem sessões antes de conteúdos com prazo mais distante ou sem prazo
    - **Valida: Requisito 4.2**
  - [ ]* 8.5 Escrever testes unitários para casos de borda do Planejador
    - Agenda vazia, conteúdos sem prazo, conteúdo único, redistribuição após conclusão
    - _Requisitos: 4.1, 4.4, 4.6_

- [x] 9. Checkpoint — planejador funcional
  - Garantir que `generatePlan` gera sessões corretas para diferentes combinações de conteúdos e agendas. Verificar que o limite diário nunca é ultrapassado.

- [x] 10. XP Engine e Níveis
  - [x] 10.1 Implementar `src/lib/xp-engine.ts`
    - Função `calculateLevel(totalXP: number)`: retorna `{ level, levelName, xpToNextLevel }` conforme tabela de níveis
    - Função `getLevelThresholds()`: retorna array com todos os limiares
    - _Requisitos: 7.2, 7.4_
  - [ ]* 10.2 Escrever testes de propriedade para o XP Engine
    - **Propriedade 3: Monotonicidade de nível** — para qualquer `xpA ≤ xpB`, `calculateLevel(xpA).level ≤ calculateLevel(xpB).level`
    - **Valida: Requisito 7.2**
  - [ ]* 10.3 Escrever testes unitários para limites de nível
    - Testar XP exatamente nos limiares (0, 500, 1500, 3500, 7500, 15000) e valores intermediários
    - _Requisitos: 7.2_

- [x] 11. Achievement Engine
  - [x] 11.1 Implementar `src/lib/achievement-engine.ts`
    - Função `checkAchievements(ctx: AchievementCheckContext): AchievementKey[]`
    - Verificar todas as 6 conquistas: `em_chamas`, `devorador_de_livros`, `maratonista`, `pontual`, `semana_perfeita`, `madrugador`
    - Retornar apenas conquistas ainda não desbloqueadas que agora atendem às condições
    - _Requisitos: 10.1, 10.3, 10.4_
  - [ ]* 11.2 Escrever testes unitários para cada conquista
    - Testar condição de desbloqueio e idempotência (não desbloquear duas vezes)
    - _Requisitos: 10.3, 10.4_

- [x] 12. Streak
  - [x] 12.1 Implementar `src/lib/streak.ts`
    - Lógica de incremento e reset de streak baseada em `last_study_date`
    - _Requisitos: 8.1, 8.2_
  - [x] 12.2 Implementar `src/hooks/useGamification.ts`
    - Query: `useUserProfile` (totalXP, level, levelName, xpToNextLevel, currentStreak, longestStreak)
    - Mutation: `recordDailyLogin` (credita 15 XP uma vez por dia via `xp_transactions`)
    - _Requisitos: 7.4, 7.5, 8.5_

- [x] 13. Componentes de gamificação
  - [x] 13.1 Criar `src/components/gamification/`
    - `XPBar.tsx`: barra de progresso XP com total, nível atual e nome do nível
    - `LevelBadge.tsx`: badge com nível e nome
    - `StreakCounter.tsx`: exibe streak atual em dias
    - `AchievementCard.tsx`: card de conquista (desbloqueada ou bloqueada)
    - _Requisitos: 7.3, 7.4, 8.5, 10.5_
  - [x] 13.2 Criar `src/stores/notificationStore.ts`
    - Estado: fila de notificações (XP ganho, subida de nível, conquista desbloqueada)
    - Componente `src/components/ui/Toast.tsx` para exibir notificações
    - _Requisitos: 6.6, 7.3, 10.2_

- [x] 14. Dashboard
  - [x] 14.1 Implementar `src/hooks/useSessions.ts`
    - Queries: `useTodaySessions`, `useWeeklySessions`
    - Mutations: `completeSession`, `skipSession`
    - Invalidação de queries após mutação para atualizar XP e streak via Realtime
    - _Requisitos: 5.1, 5.2, 6.1, 6.5_
  - [x] 14.2 Criar `src/components/dashboard/SessionCard.tsx`
    - Exibir título do conteúdo, horas planejadas, status
    - Botões "Concluir" e "Pular" com feedback visual de XP em < 300ms
    - _Requisitos: 5.1, 6.1, 6.5, 6.6, 13.2_
  - [x] 14.3 Criar `src/components/dashboard/DailyView.tsx`
    - Listar sessões do dia corrente; mensagem quando não há sessões
    - Exibir streak atual
    - _Requisitos: 5.1, 5.3, 8.5_
  - [x] 14.4 Criar `src/components/dashboard/WeeklyView.tsx`
    - Sessões dos 7 dias agrupadas por dia
    - Progresso da meta semanal (% horas concluídas / planejadas)
    - _Requisitos: 5.2, 5.4, 9.2_
  - [x] 14.5 Criar `src/pages/Dashboard.tsx`
    - Compor `DailyView`, `WeeklyView`, `XPBar`, `StreakCounter`
    - Configurar Supabase Realtime para invalidar queries de XP e streak
    - _Requisitos: 5.1, 5.2, 5.5, 7.4, 8.5_

- [x] 15. Checkpoint — fluxo principal funcional
  - Garantir que o fluxo completo funciona: cadastrar conteúdo → configurar agenda → gerar plano → marcar sessão como concluída → ver XP e streak atualizados no dashboard. Verificar que o feedback visual ocorre em < 300ms.

- [x] 16. Perfil e conquistas
  - [x] 16.1 Criar `src/pages/Profile.tsx`
    - Exibir `XPBar`, `LevelBadge`, `StreakCounter`
    - Grid de todas as conquistas com `AchievementCard` (desbloqueadas e bloqueadas)
    - _Requisitos: 7.4, 10.5_

- [x] 17. Relatório semanal
  - [x] 17.1 Implementar `src/hooks/useWeeklyReport.ts`
    - Query: `useWeeklyReport(weekStart: string)` — agrega horas estudadas, taxa de conclusão, XP ganho, evolução do streak para a semana selecionada
    - _Requisitos: 11.1, 11.3_
  - [x] 17.2 Criar `src/components/reports/HoursBarChart.tsx`
    - Gráfico de barras (Recharts) com horas estudadas por dia da semana
    - _Requisitos: 11.2_
  - [x] 17.3 Criar `src/components/reports/WeeklyReport.tsx` e `src/pages/Reports.tsx`
    - Exibir métricas da semana: total de horas, taxa de conclusão, XP ganho, streak
    - Navegação entre semanas anteriores
    - _Requisitos: 11.1, 11.3_

- [x] 18. Integração final e wiring
  - [x] 18.1 Conectar Planejador ao fluxo de salvamento de agenda e edição de conteúdo
    - Chamar `generatePlan` e persistir sessões geradas após `saveSchedule` e `updateContent`
    - Remover sessões futuras pendentes ao arquivar conteúdo
    - _Requisitos: 2.4, 2.5, 3.2, 4.6_
  - [x] 18.2 Conectar `Achievement_Engine` ao fluxo de conclusão de sessão
    - Após `completeSession`, chamar `checkAchievements` com contexto atualizado e persistir conquistas novas
    - Disparar notificação via `notificationStore`
    - _Requisitos: 10.1, 10.2, 10.3_
  - [x] 18.3 Configurar roteamento com `ProtectedRoute`
    - Rotas: `/` → Dashboard, `/contents` → Contents, `/schedule` → Schedule, `/profile` → Profile, `/reports` → Reports
    - _Requisitos: 1.2, 1.5_
  - [x] 18.4 Garantir responsividade e acessibilidade base
    - Verificar layout em viewport 360px
    - Navegação por teclado nos formulários e botões principais
    - _Requisitos: 13.3, 13.4_

- [x] 19. Checkpoint final — garantir que todos os testes passam
  - Garantir que todos os testes passam. Verificar fluxos de autenticação, planejamento, conclusão de sessões, XP, streak e conquistas. Perguntar ao usuário se há dúvidas antes de finalizar.

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia requisitos específicos para rastreabilidade
- Triggers PostgreSQL garantem atomicidade nas operações de XP, streak e conquistas
- O Planejador roda inteiramente no cliente sobre dados em cache do React Query
