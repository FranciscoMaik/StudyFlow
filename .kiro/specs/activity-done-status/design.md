# Activity Done Status — Bugfix Design

## Overview

O bug impede que o usuário marque uma atividade como concluída. Atualmente, o `ContentCard` expõe apenas um botão de arquivar (sem confirmação), e não existe hook nem fluxo para atualizar o status para `"done"`. A correção envolve: (1) adicionar um hook `useMarkContentDone` em `useContents.ts`; (2) adicionar um botão "Feito" com diálogo de confirmação no `ContentCard`; (3) propagar o callback via `ContentList`; e (4) exibir uma seção de atividades concluídas/arquivadas na página `Contents.tsx` com opção de reabertura.

## Glossary

- **Bug_Condition (C)**: A condição que dispara o bug — quando o usuário tenta marcar uma atividade como concluída e o status não é alterado para `"done"`
- **Property (P)**: O comportamento correto esperado — o status do conteúdo deve ser atualizado para `"done"` no Supabase e a atividade deve sair da lista principal
- **Preservation**: O comportamento de edição, criação, arquivamento, filtros e ordenação que deve permanecer inalterado após a correção
- **`useMarkContentDone`**: Novo hook em `studyflow/src/hooks/useContents.ts` que atualiza o status do conteúdo para `"done"` e cancela sessões futuras pendentes
- **`useReopenContent`**: Novo hook em `studyflow/src/hooks/useContents.ts` que reverte o status de `"done"` ou `"archived"` para `"active"`
- **`useDoneContents`**: Novo hook em `studyflow/src/hooks/useContents.ts` que busca conteúdos com status `"done"` ou `"archived"`
- **`ContentCard`**: Componente em `studyflow/src/components/contents/ContentCard.tsx` que renderiza um card de conteúdo com ações
- **`ContentList`**: Componente em `studyflow/src/components/contents/ContentList.tsx` que lista conteúdos ativos com filtros
- **`Contents`**: Página em `studyflow/src/pages/Contents.tsx` que orquestra a listagem e o formulário de conteúdos
- **`status`**: Campo `"active" | "done" | "archived"` já existente no tipo `Content` e na tabela `contents` do Supabase

## Bug Details

### Bug Condition

O bug se manifesta quando o usuário tenta marcar uma atividade como concluída. O `ContentCard` não possui botão "Feito" — apenas um botão de arquivar que não exibe confirmação e não altera o status para `"done"`. Além disso, não existe hook para realizar essa operação nem seção para visualizar atividades concluídas.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input de tipo { contentId: string, action: "mark_done" }
  OUTPUT: boolean

  RETURN action = "mark_done"
         AND contentExists(contentId)
         AND content.status = "active"
         AND NOT statusUpdatedToDone(contentId)
END FUNCTION
```

### Examples

- Usuário clica no botão de ação em um `ContentCard` → esperado: diálogo de confirmação aparece; atual: nenhum diálogo, apenas arquivamento direto
- Usuário confirma a conclusão → esperado: status muda para `"done"` e card some da lista principal; atual: status muda para `"archived"` sem confirmação
- Usuário acessa "Cursos & Módulos" → esperado: seção de concluídos visível; atual: nenhuma seção de concluídos existe
- Usuário quer reabrir uma atividade concluída → esperado: botão "Reabrir" disponível; atual: não existe essa opção

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Clicar em "Cancelar" no diálogo de confirmação deve manter o status inalterado e fechar o diálogo sem modificações
- O botão de editar no `ContentCard` deve continuar abrindo o formulário de edição normalmente
- Novos conteúdos devem continuar sendo criados com status `"active"` e aparecer na lista principal
- Filtros por categoria e ordenação por prioridade devem continuar funcionando sobre os conteúdos ativos
- O fluxo de arquivamento existente (`useArchiveContent`) deve continuar removendo sessões futuras pendentes

**Scope:**
Todos os inputs que NÃO envolvem a ação de marcar como concluído devem ser completamente inalterados. Isso inclui:
- Cliques no botão de editar
- Criação de novos conteúdos
- Arquivamento via fluxo existente
- Aplicação de filtros e ordenações na lista principal

## Hypothesized Root Cause

Com base na análise do código, as causas são:

1. **Hook ausente**: Não existe `useMarkContentDone` em `useContents.ts` — não há mutação que atualize `status` para `"done"`

2. **Botão ausente no `ContentCard`**: O componente só recebe `onArchive` como prop de ação de conclusão; não há prop `onDone` nem renderização de botão "Feito"

3. **Callback não propagado**: `ContentList` chama `archiveMutation.mutate(id)` diretamente no `onArchive` do `ContentCard`; não há equivalente para `onDone`

4. **Seção de concluídos inexistente**: A página `Contents.tsx` não renderiza nenhuma seção para conteúdos com status `"done"` ou `"archived"`, e não existe hook `useDoneContents`

## Correctness Properties

Property 1: Bug Condition — Marcar Atividade como Concluída

_For any_ conteúdo onde `isBugCondition` retorna `true` (usuário confirma a ação "Feito" em um conteúdo ativo), a função `useMarkContentDone` corrigida SHALL atualizar o `status` do conteúdo para `"done"` no Supabase, remover o card da lista principal e cancelar sessões futuras pendentes associadas.

**Validates: Requirements 2.1, 2.2, 2.3**

Property 2: Preservation — Comportamentos Não Afetados

_For any_ input onde `isBugCondition` retorna `false` (edição, criação, arquivamento, filtros, cancelamento do diálogo), o código corrigido SHALL produzir exatamente o mesmo resultado que o código original, preservando todos os comportamentos existentes sem regressões.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

## Fix Implementation

### Changes Required

**Arquivo 1**: `studyflow/src/hooks/useContents.ts`

**Adições**:
1. **`useMarkContentDone`**: Nova mutação que:
   - Atualiza `status` para `"done"` na tabela `contents`
   - Deleta sessões futuras pendentes do conteúdo (mesmo padrão do `useArchiveContent`)
   - Invalida queries `["contents"]` e `["sessions"]` no `onSuccess`

2. **`useReopenContent`**: Nova mutação que:
   - Atualiza `status` para `"active"` na tabela `contents`
   - Invalida queries `["contents"]` e `["contents-done"]` no `onSuccess`

3. **`useDoneContents`**: Nova query que:
   - Busca conteúdos com `status IN ("done", "archived")` do usuário autenticado
   - Usa queryKey `["contents-done"]`

---

**Arquivo 2**: `studyflow/src/components/contents/ContentCard.tsx`

**Adições**:
1. **Prop `onDone?: (id: string) => void`** na interface `ContentCardProps`
2. **Botão "Feito"** renderizado quando `onDone` está presente — ícone `CheckCircle` da lucide-react, estilo verde, posicionado ao lado do botão de editar
3. **Estado local `showDoneDialog`** para controlar o `ConfirmDialog`
4. **`ConfirmDialog`** importado e renderizado condicionalmente com título "Marcar como concluído?" e descrição adequada

---

**Arquivo 3**: `studyflow/src/components/contents/ContentList.tsx`

**Adições**:
1. **Import de `useMarkContentDone`**
2. **Instância de `doneMutation = useMarkContentDone()`**
3. **Prop `onDone`** passada ao `ContentCard`: `onDone={(id) => doneMutation.mutate(id)}`

---

**Arquivo 4**: `studyflow/src/pages/Contents.tsx`

**Adições**:
1. **Seção "Concluídos & Arquivados"** abaixo do `ContentList` principal
2. **`useDoneContents`** para buscar os conteúdos concluídos/arquivados
3. **`useReopenContent`** para o botão de reabertura
4. **Cards simplificados** (ou reutilização do `ContentCard` sem `onEdit`/`onArchive`/`onDone`) com botão "Reabrir" que chama `reopenMutation.mutate(id)`

## Testing Strategy

### Validation Approach

A estratégia segue duas fases: primeiro, evidenciar o bug no código não corrigido com testes exploratórios; depois, verificar que a correção funciona e que nenhum comportamento existente foi quebrado.

### Exploratory Bug Condition Checking

**Goal**: Evidenciar contraexemplos que demonstrem o bug ANTES de implementar a correção. Confirmar ou refutar a análise de causa raiz.

**Test Plan**: Escrever testes que simulem a ação de marcar um conteúdo como concluído e verificar que o status NÃO é atualizado para `"done"` no código atual. Executar no código não corrigido para observar as falhas.

**Test Cases**:
1. **Hook ausente**: Verificar que `useMarkContentDone` não existe em `useContents.ts` (falha no código atual)
2. **Botão ausente**: Renderizar `ContentCard` e verificar que nenhum botão "Feito" é exibido (falha no código atual)
3. **Status não atualizado**: Simular clique no botão de ação e verificar que o status permanece `"active"` (falha no código atual)
4. **Seção ausente**: Renderizar `Contents` e verificar que nenhuma seção de concluídos é exibida (falha no código atual)

**Expected Counterexamples**:
- `useMarkContentDone` não existe → chamada resulta em erro de importação
- Nenhum botão com label "Feito" ou "Concluído" é encontrado no DOM do `ContentCard`

### Fix Checking

**Goal**: Verificar que para todos os inputs onde a condição de bug se aplica, a função corrigida produz o comportamento esperado.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := useMarkContentDone_fixed(input.contentId)
  ASSERT content.status = "done" IN supabase
  ASSERT content NOT IN activeContentsList
  ASSERT futurePendingSessions FOR content = []
END FOR
```

### Preservation Checking

**Goal**: Verificar que para todos os inputs onde a condição de bug NÃO se aplica, o código corrigido produz o mesmo resultado que o original.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalBehavior(input) = fixedBehavior(input)
END FOR
```

**Testing Approach**: Testes baseados em propriedades são recomendados para preservation checking porque:
- Geram muitos casos de teste automaticamente no domínio de entrada
- Capturam edge cases que testes unitários manuais podem perder
- Fornecem garantias fortes de que o comportamento é preservado para todos os inputs não-bugados

**Test Cases**:
1. **Cancelamento do diálogo**: Verificar que cancelar o `ConfirmDialog` não altera o status do conteúdo
2. **Edição preservada**: Verificar que o botão de editar continua abrindo o formulário normalmente após a correção
3. **Criação preservada**: Verificar que novos conteúdos são criados com status `"active"` e aparecem na lista principal
4. **Filtros preservados**: Verificar que filtros por categoria e ordenação por prioridade continuam funcionando

### Unit Tests

- Testar `useMarkContentDone`: verifica que o status é atualizado para `"done"` e sessões futuras são deletadas
- Testar `useReopenContent`: verifica que o status é revertido para `"active"`
- Testar `ContentCard` com prop `onDone`: verifica que o botão "Feito" é renderizado e o `ConfirmDialog` aparece ao clicar
- Testar que cancelar o diálogo não chama `onDone`
- Testar `ContentList`: verifica que `onDone` é propagado corretamente para cada `ContentCard`

### Property-Based Tests

- Gerar conteúdos aleatórios com status `"active"` e verificar que `useMarkContentDone` sempre atualiza para `"done"`
- Gerar inputs aleatórios não-bugados (edição, criação, filtros) e verificar que o comportamento é idêntico ao original
- Verificar que para qualquer conteúdo com status `"done"`, `useReopenContent` sempre reverte para `"active"`

### Integration Tests

- Fluxo completo: criar conteúdo → marcar como feito → verificar que aparece na seção de concluídos → reabrir → verificar que volta à lista principal
- Verificar que o arquivamento existente continua funcionando independentemente do novo fluxo de conclusão
- Verificar que filtros e ordenações na lista principal não são afetados após marcar um item como concluído
