# Implementation Plan

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Marcar Atividade como Concluída
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate the bug exists
  - **Scoped PBT Approach**: Escopo determinístico — testar que `useMarkContentDone` não existe em `useContents.ts` e que nenhum botão "Feito" é renderizado no `ContentCard`
  - Verificar que `useMarkContentDone` não é exportado de `studyflow/src/hooks/useContents.ts` (importação resulta em erro)
  - Renderizar `ContentCard` com `content.status = "active"` e verificar que nenhum botão com label "Feito" ou ícone `CheckCircle` está presente no DOM
  - Simular clique no botão de ação existente e verificar que o status do conteúdo permanece `"active"` (não muda para `"done"`)
  - Renderizar a página `Contents` e verificar que nenhuma seção de concluídos/arquivados é exibida
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the bug exists)
  - Document counterexamples found: `useMarkContentDone` não existe → erro de importação; nenhum botão "Feito" encontrado no DOM do `ContentCard`
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Comportamentos Não Afetados
  - **IMPORTANT**: Follow observation-first methodology
  - Observe: cancelar o `ConfirmDialog` de arquivamento não altera o status do conteúdo no código atual
  - Observe: clicar no botão de editar em `ContentCard` abre o formulário de edição normalmente
  - Observe: `useCreateContent` cria conteúdo com `status: "active"` e ele aparece na lista principal
  - Observe: filtros por categoria e ordenação por prioridade em `ContentList` funcionam corretamente sobre conteúdos ativos
  - Observe: `useArchiveContent` remove sessões futuras pendentes ao arquivar um conteúdo
  - Write property-based tests: para qualquer conteúdo ativo, clicar em "Cancelar" no diálogo não chama nenhuma mutação
  - Write property-based tests: para qualquer conteúdo ativo, o botão de editar sempre dispara `onEdit` com o conteúdo correto
  - Write property-based tests: para qualquer input de criação válido, o conteúdo é criado com `status = "active"`
  - Write property-based tests: para qualquer combinação de filtro de categoria e ordenação, a lista retorna apenas conteúdos ativos filtrados corretamente
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Fix para activity-done-status

  - [x] 3.1 Adicionar hooks `useMarkContentDone`, `useReopenContent` e `useDoneContents` em `useContents.ts`
    - Criar `useMarkContentDone`: mutação que atualiza `status` para `"done"` na tabela `contents` via Supabase e deleta sessões futuras pendentes do conteúdo (mesmo padrão do `useArchiveContent`)
    - Criar `useReopenContent`: mutação que atualiza `status` para `"active"` na tabela `contents` e invalida queries `["contents"]` e `["contents-done"]`
    - Criar `useDoneContents`: query que busca conteúdos com `status IN ("done", "archived")` do usuário autenticado, usando queryKey `["contents-done"]`
    - Ambas as mutações devem invalidar as queries relevantes no `onSuccess`
    - _Bug_Condition: isBugCondition(input) onde action = "mark_done" AND content.status = "active" AND NOT statusUpdatedToDone(contentId)_
    - _Expected_Behavior: content.status = "done" no Supabase; content NOT IN activeContentsList; futurePendingSessions para o content = []_
    - _Preservation: useArchiveContent e useCreateContent permanecem inalterados; useContents continua filtrando apenas status "active"_
    - _Requirements: 2.2, 2.3, 2.5, 3.3, 3.5_

  - [x] 3.2 Adicionar botão "Feito" com `ConfirmDialog` no `ContentCard`
    - Adicionar prop `onDone?: (id: string) => void` na interface `ContentCardProps`
    - Adicionar estado local `showDoneDialog: boolean` controlado por `useState(false)`
    - Importar `ConfirmDialog` de `../../components/ui/ConfirmDialog` e `CheckCircle` de `lucide-react`
    - Renderizar botão "Feito" (ícone `CheckCircle`, estilo verde) ao lado do botão de editar quando `onDone` está presente
    - Ao clicar no botão "Feito", setar `showDoneDialog(true)` — NÃO chamar `onDone` diretamente
    - Renderizar `ConfirmDialog` com `open={showDoneDialog}`, título "Marcar como concluído?", descrição adequada, `onConfirm` chamando `onDone(content.id)` e fechando o diálogo, `onCancel` apenas fechando o diálogo
    - _Bug_Condition: isBugCondition(input) onde action = "mark_done"_
    - _Expected_Behavior: diálogo de confirmação exibido ao clicar; status atualizado para "done" ao confirmar_
    - _Preservation: botão de editar e botão de arquivar permanecem inalterados; cancelar o diálogo não altera o status_
    - _Requirements: 2.1, 3.1, 3.2_

  - [x] 3.3 Propagar `onDone` via `ContentList`
    - Importar `useMarkContentDone` de `../../hooks/useContents`
    - Instanciar `doneMutation = useMarkContentDone()`
    - Passar prop `onDone={(id) => doneMutation.mutate(id)}` para cada `ContentCard` renderizado
    - _Requirements: 2.2, 2.3_

  - [x] 3.4 Adicionar seção "Concluídos & Arquivados" na página `Contents.tsx`
    - Importar `useDoneContents` e `useReopenContent` de `../hooks/useContents`
    - Buscar conteúdos concluídos/arquivados com `useDoneContents()`
    - Instanciar `reopenMutation = useReopenContent()`
    - Renderizar seção abaixo do `ContentList` principal com título "Concluídos & Arquivados"
    - Exibir cards simplificados (reutilizar `ContentCard` sem `onEdit`/`onArchive`/`onDone`) com botão "Reabrir" que chama `reopenMutation.mutate(id)`
    - Exibir estado vazio adequado quando não há conteúdos concluídos
    - _Requirements: 2.4, 2.5_

  - [x] 3.5 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Marcar Atividade como Concluída
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the expected behavior is satisfied
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms bug is fixed)
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 3.6 Verify preservation tests still pass
    - **Property 2: Preservation** - Comportamentos Não Afetados
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass
  - Garantir que todos os testes passam, perguntar ao usuário se surgirem dúvidas.
