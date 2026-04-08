# Plano de Implementação: Category Management

## Visão Geral

Implementação incremental da página de gerenciamento de categorias (`/categories`), criando os novos componentes (`CategoryCard`, `ConfirmDialog`, `Categories`), integrando com hooks existentes e conectando à navegação.

## Tarefas

- [x] 1. Criar componente `ConfirmDialog`
  - Criar `src/components/ui/ConfirmDialog.tsx` com a interface `ConfirmDialogProps` definida no design
  - Implementar modal acessível com `role="dialog"`, `aria-modal`, `aria-labelledby` e `aria-describedby`
  - Renderizar `warning` opcional quando fornecido
  - Suportar estado `isLoading` no botão de confirmação
  - _Requirements: 5.2, 5.5_

- [x] 2. Criar componente `CategoryCard`
  - Criar `src/components/categories/CategoryCard.tsx` com a interface `CategoryCardProps` definida no design
  - Exibir swatch de cor (círculo com `backgroundColor`), nome da categoria e contagem de módulos
  - Renderizar botões de editar e excluir com `aria-label` descritivos
  - _Requirements: 2.1, 2.2, 2.3, 4.1, 5.1_

  - [ ]* 2.1 Escrever testes de propriedade para `CategoryCard`
    - **Property 2: Nome e cor de cada categoria são exibidos**
    - **Validates: Requirements 2.1**
    - **Property 3: Contagem de módulos é exibida corretamente**
    - **Validates: Requirements 2.2, 2.3**
    - **Property 4: Cada categoria possui ações de editar e excluir**
    - **Validates: Requirements 4.1, 5.1**
    - Usar `fc.record` com `fc.string` e cores da paleta para gerar categorias arbitrárias
    - Usar `fc.integer({ min: 0, max: 50 })` para contagens de módulos

- [x] 3. Criar página `Categories`
  - Criar `src/pages/Categories.tsx` com o tipo `PageState` definido no design
  - Usar `useCategories()` para listar categorias e `useContents()` para derivar contagens via `useMemo`
  - Renderizar `CategoryCard` para cada categoria, passando `moduleCount` derivado
  - Exibir estado vazio quando `categories.length === 0` e estado de carregamento enquanto `isLoading`
  - Controlar abertura dos modais de criação, edição e exclusão via `PageState`
  - Renderizar `CategoryForm` em modal para criação e edição
  - Renderizar `ConfirmDialog` para exclusão, incluindo `warning` quando `moduleCount > 0`
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

  - [ ]* 3.1 Escrever testes de propriedade para a página `Categories`
    - **Property 1: Todas as categorias do usuário são exibidas**
    - **Validates: Requirements 1.2**
    - **Property 5: Formulário de edição é pré-preenchido com dados da categoria**
    - **Validates: Requirements 4.2**
    - **Property 6: Submissão de criação chama a mutation com dados corretos**
    - **Validates: Requirements 3.2**
    - **Property 7: Submissão de edição chama a mutation com dados corretos**
    - **Validates: Requirements 4.3**
    - **Property 8: Confirmação de exclusão chama a mutation com o id correto**
    - **Validates: Requirements 5.3**
    - **Property 9: Aviso de módulos associados aparece quando moduleCount > 0**
    - **Validates: Requirements 5.5**
    - Usar `fc.array(categoryArb)` para listas arbitrárias de categorias
    - Mockar `useCategories`, `useContents`, `useDeleteCategory` nos testes

  - [ ]* 3.2 Escrever testes de exemplo para a página `Categories`
    - Smoke test: rota `/categories` renderiza a página (Requirement 1.1)
    - Estado vazio exibe mensagem correta (Requirement 1.3)
    - Estado de carregamento exibe indicador (Requirement 1.4)
    - Botão "Nova categoria" está presente (Requirement 3.1)
    - Erro de criação exibe mensagem descritiva (Requirement 3.4)
    - Erro de edição exibe mensagem descritiva (Requirement 4.5)
    - Clicar em excluir abre diálogo de confirmação (Requirement 5.2)
    - Erro de exclusão exibe mensagem descritiva (Requirement 5.6)

- [x] 4. Checkpoint — Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

- [ ] 5. Integrar rota e navegação
  - [x] 5.1 Adicionar rota `/categories` em `src/App.tsx`
    - Importar `Categories` e adicionar `<Route path="/categories" element={<Categories />} />` dentro do bloco `ProtectedRoute > AppLayout`
    - _Requirements: 1.1, 6.3_

  - [x] 5.2 Adicionar link "Categorias" em `src/components/ui/NavBar.tsx`
    - Inserir `{ to: "/categories", label: "Categorias" }` no array `NAV_LINKS`
    - _Requirements: 6.1, 6.2_

  - [ ]* 5.3 Escrever testes de exemplo para navegação
    - NavBar contém link para `/categories` (Requirement 6.1)
    - Link ativo recebe estilo correto na rota `/categories` (Requirement 6.2)
    - Rota redireciona para `/login` sem autenticação (Requirement 6.3)

- [x] 6. Checkpoint final — Garantir que todos os testes passam
  - Garantir que todos os testes passam, perguntar ao usuário se houver dúvidas.

## Notas

- Tarefas marcadas com `*` são opcionais e podem ser puladas para um MVP mais rápido
- Cada tarefa referencia os requisitos específicos para rastreabilidade
- A contagem de módulos é derivada client-side dos dados em cache do `useContents` — sem query adicional ao banco
- O `CategoryForm` existente é reutilizado sem alterações; recebe `category` para edição e `onSuccess` para fechar o modal
- Testes de propriedade usam fast-check com mínimo de 100 iterações por propriedade
- Cada teste de propriedade deve incluir o comentário: `// Feature: category-management, Property N: <texto>`
