# Requirements Document

## Introduction

O StudyFlow atualmente permite associar categorias a módulos/conteúdos durante o cadastro, mas não oferece uma interface dedicada para gerenciar essas categorias. Esta feature adiciona uma página de gerenciamento de categorias onde o usuário pode criar, visualizar, editar e excluir categorias vinculadas a módulos, com feedback visual de cor e indicação de quantos módulos estão associados a cada categoria.

## Glossary

- **Category_Manager**: O sistema responsável pela página e operações de gerenciamento de categorias
- **Category**: Entidade com nome (máx. 50 caracteres) e cor (selecionada de paleta predefinida), pertencente a um usuário autenticado
- **Module**: Conteúdo/módulo de estudo que pode ter uma categoria associada (entidade `Content` no sistema)
- **CategoryForm**: Componente de formulário existente para criação e edição de categorias
- **Palette**: Conjunto fixo de 10 cores hexadecimais disponíveis para categorias
- **User**: Usuário autenticado no sistema StudyFlow

---

## Requirements

### Requirement 1: Página dedicada de gerenciamento de categorias

**User Story:** Como um usuário, quero uma página dedicada para gerenciar minhas categorias, para que eu possa criar, visualizar, editar e excluir categorias sem precisar acessar o formulário de módulos.

#### Acceptance Criteria

1. THE Category_Manager SHALL exibir uma página acessível pela rota `/categories` na navegação principal
2. THE Category_Manager SHALL listar todas as categorias pertencentes ao User autenticado
3. WHEN nenhuma categoria existe, THE Category_Manager SHALL exibir uma mensagem informando que não há categorias cadastradas
4. WHEN as categorias estão sendo carregadas, THE Category_Manager SHALL exibir um indicador de carregamento

---

### Requirement 2: Visualização de categorias com informações de uso

**User Story:** Como um usuário, quero ver quantos módulos estão associados a cada categoria, para que eu possa entender o uso de cada categoria antes de editá-la ou excluí-la.

#### Acceptance Criteria

1. THE Category_Manager SHALL exibir o nome e a cor de cada Category na listagem
2. THE Category_Manager SHALL exibir a contagem de Modules associados a cada Category
3. WHEN uma Category não possui Modules associados, THE Category_Manager SHALL exibir a contagem como zero

---

### Requirement 3: Criação de categorias

**User Story:** Como um usuário, quero criar novas categorias diretamente na página de gerenciamento, para que eu possa organizar meus módulos sem sair da tela de categorias.

#### Acceptance Criteria

1. THE Category_Manager SHALL disponibilizar um botão para abrir o formulário de criação de Category
2. WHEN o User submete o formulário com nome válido (1–50 caracteres) e cor da Palette selecionada, THE Category_Manager SHALL persistir a nova Category no banco de dados associada ao User
3. WHEN a criação é concluída com sucesso, THE Category_Manager SHALL atualizar a listagem exibindo a nova Category
4. IF ocorrer um erro na criação, THEN THE Category_Manager SHALL exibir uma mensagem de erro descritiva ao User

---

### Requirement 4: Edição de categorias

**User Story:** Como um usuário, quero editar o nome e a cor de uma categoria existente, para que eu possa corrigir ou atualizar as informações sem precisar excluir e recriar a categoria.

#### Acceptance Criteria

1. THE Category_Manager SHALL disponibilizar uma ação de edição para cada Category listada
2. WHEN o User aciona a edição de uma Category, THE Category_Manager SHALL exibir o CategoryForm preenchido com os dados atuais da Category
3. WHEN o User submete o formulário de edição com dados válidos, THE Category_Manager SHALL persistir as alterações no banco de dados
4. WHEN a edição é concluída com sucesso, THE Category_Manager SHALL atualizar a listagem refletindo os dados alterados
5. IF ocorrer um erro na edição, THEN THE Category_Manager SHALL exibir uma mensagem de erro descritiva ao User

---

### Requirement 5: Exclusão de categorias

**User Story:** Como um usuário, quero excluir categorias que não utilizo mais, para que eu possa manter minha lista de categorias organizada.

#### Acceptance Criteria

1. THE Category_Manager SHALL disponibilizar uma ação de exclusão para cada Category listada
2. WHEN o User aciona a exclusão de uma Category, THE Category_Manager SHALL solicitar confirmação antes de prosseguir
3. WHEN o User confirma a exclusão, THE Category_Manager SHALL remover a Category do banco de dados
4. WHEN a exclusão é concluída com sucesso, THE Category_Manager SHALL remover a Category da listagem
5. IF a Category possui Modules associados, THEN THE Category_Manager SHALL exibir um aviso informando que os Modules perderão a associação com a Category
6. IF ocorrer um erro na exclusão, THEN THE Category_Manager SHALL exibir uma mensagem de erro descritiva ao User

---

### Requirement 6: Navegação para a página de categorias

**User Story:** Como um usuário, quero acessar o gerenciamento de categorias pela barra de navegação principal, para que eu possa encontrar a funcionalidade facilmente.

#### Acceptance Criteria

1. THE Category_Manager SHALL ser acessível por um link na NavBar do sistema
2. THE Category_Manager SHALL aplicar o estilo de link ativo quando a rota `/categories` estiver selecionada
3. THE Category_Manager SHALL ser protegida por autenticação, redirecionando usuários não autenticados para a tela de login
