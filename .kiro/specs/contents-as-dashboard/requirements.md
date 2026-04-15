# Requirements Document

## Introduction

O StudyFlow atualmente possui duas áreas separadas: **Dashboard** (rota `/`) e **Conteúdos** (rota `/contents`). O Dashboard exibe o progresso do usuário (XP, streak, missões diárias e visão semanal), enquanto Conteúdos gerencia o catálogo de módulos/cursos com calendário, lista e seção de arquivados.

Esta feature consolida as duas áreas em uma única página principal. A página de Conteúdos passa a ser a nova dashboard do app — a rota raiz `/` — incorporando os widgets de progresso (XP, streak, missões) que antes existiam apenas no Dashboard. A página de Dashboard separada e seus componentes exclusivos são removidos.

O objetivo é reduzir a fragmentação da navegação, colocando o contexto de progresso do usuário junto ao catálogo de conteúdos, que é o núcleo do fluxo de estudo.

---

## Glossary

- **App**: A aplicação StudyFlow (React + TypeScript + Supabase).
- **Dashboard**: A área que atualmente existe na rota `/` com XP, streak e missões. Será removida como área separada.
- **Contents_Page**: A página de Conteúdos atual (rota `/contents`), que se tornará a nova página principal.
- **New_Dashboard**: A nova página principal unificada, acessível pela rota `/`, que incorpora os elementos do Dashboard antigo dentro da estrutura da Contents_Page.
- **Progress_Panel**: O bloco de widgets de progresso do usuário (XPBar, StreakCounter, missões diárias e visão semanal) que atualmente existe no Dashboard.
- **Content_Catalog**: A seção de listagem, filtro e gerenciamento de módulos/cursos de estudo.
- **Calendar_View**: O componente de calendário mensal que exibe sessões de estudo por dia.
- **Session**: Uma sessão de estudo planejada, com status `pending`, `done` ou `skipped`.
- **XPBar**: Componente que exibe o nível, XP total e progresso até o próximo nível.
- **StreakCounter**: Componente que exibe a sequência de dias consecutivos de estudo.
- **NavBar**: Barra de navegação principal do app.
- **DailyView**: Componente que lista as sessões de estudo do dia atual.
- **WeeklyView**: Componente que lista as sessões de estudo da semana atual com barra de progresso.

---

## Requirements

### Requirement 1: Rota principal aponta para a New_Dashboard

**User Story:** Como usuário, quero que ao acessar a raiz do app eu já veja meu progresso e meus conteúdos juntos, para não precisar navegar entre duas áreas separadas.

#### Acceptance Criteria

1. THE App SHALL servir a New_Dashboard na rota `/`.
2. WHEN o usuário acessa qualquer rota desconhecida, THE App SHALL redirecionar para `/`.
3. THE App SHALL remover a rota `/dashboard` (ou qualquer rota dedicada ao Dashboard antigo) do roteador.

---

### Requirement 2: New_Dashboard incorpora o Progress_Panel

**User Story:** Como usuário, quero ver meu XP, streak e missões do dia diretamente na página principal, para ter contexto do meu progresso sem sair da área de conteúdos.

#### Acceptance Criteria

1. WHEN a New_Dashboard é carregada, THE New_Dashboard SHALL exibir a XPBar com o nível, XP total e progresso até o próximo nível do usuário.
2. WHEN a New_Dashboard é carregada, THE New_Dashboard SHALL registrar o login diário do usuário para acúmulo de XP (comportamento atualmente em `useRecordDailyLogin`).
3. WHEN a New_Dashboard é carregada, THE New_Dashboard SHALL exibir as missões do dia atual via DailyView, incluindo o StreakCounter.
4. THE New_Dashboard SHALL oferecer alternância entre DailyView e WeeklyView por meio de abas ou controle equivalente.
5. WHILE os dados de perfil do usuário estão sendo carregados, THE New_Dashboard SHALL exibir um indicador de carregamento acessível.
6. THE New_Dashboard SHALL manter a assinatura de Realtime do Supabase para invalidar o cache de `userProfile` quando `xp_transactions` ou `streaks` do usuário forem alterados.

---

### Requirement 3: New_Dashboard mantém o Content_Catalog completo

**User Story:** Como usuário, quero continuar gerenciando meus módulos de estudo na mesma página principal, para que o fluxo de adicionar e acompanhar conteúdos não seja interrompido.

#### Acceptance Criteria

1. THE New_Dashboard SHALL exibir o Content_Catalog com filtro por categoria e ordenação por prioridade.
2. THE New_Dashboard SHALL exibir o Calendar_View com navegação mensal e eventos de sessão por dia.
3. THE New_Dashboard SHALL permitir criar novos módulos via formulário inline (ContentForm).
4. THE New_Dashboard SHALL permitir editar módulos existentes via formulário inline.
5. THE New_Dashboard SHALL exibir a seção de conteúdos concluídos e arquivados com opção de reabrir.
6. IF o total de horas estimadas dos conteúdos ativos exceder a capacidade semanal configurada, THEN THE New_Dashboard SHALL exibir um alerta de sobrecarga visível.

---

### Requirement 4: NavBar atualizada para refletir a nova estrutura

**User Story:** Como usuário, quero que a navegação do app reflita a nova estrutura sem links duplicados ou quebrados, para que eu possa navegar com clareza.

#### Acceptance Criteria

1. THE NavBar SHALL exibir o item "Conteúdos" apontando para `/` como a rota principal do app.
2. THE NavBar SHALL remover o item "Dashboard" da lista de links de navegação.
3. WHEN o usuário está na rota `/`, THE NavBar SHALL marcar o item "Conteúdos" como ativo.
4. THE NavBar SHALL manter todos os demais itens de navegação existentes (Categorias, Agenda, Perfil, Relatórios) sem alteração de rota ou comportamento.

---

### Requirement 5: Remoção dos artefatos do Dashboard antigo

**User Story:** Como desenvolvedor, quero que os arquivos e componentes exclusivos do Dashboard antigo sejam removidos do projeto, para evitar código morto e confusão de manutenção.

#### Acceptance Criteria

1. THE App SHALL remover o arquivo `src/pages/Dashboard.tsx` após a migração dos seus comportamentos para a New_Dashboard.
2. THE App SHALL remover os componentes `src/components/dashboard/DailyView.tsx`, `src/components/dashboard/WeeklyView.tsx` e `src/components/dashboard/SessionCard.tsx` caso não sejam reutilizados diretamente pela New_Dashboard.
3. IF os componentes `DailyView`, `WeeklyView` ou `SessionCard` forem reutilizados pela New_Dashboard sem modificação, THEN THE App SHALL mantê-los em seus caminhos atuais ou movê-los para um diretório compartilhado, preservando as importações.
4. THE App SHALL remover ou atualizar quaisquer testes existentes que referenciem `Dashboard.tsx` ou seus componentes exclusivos para refletir a nova estrutura.

---

### Requirement 6: Preservação da experiência de gamificação

**User Story:** Como usuário, quero que minha sequência de dias, XP e conquistas continuem funcionando normalmente após a mudança, para não perder meu progresso.

#### Acceptance Criteria

1. WHEN o usuário completa uma sessão na New_Dashboard, THE New_Dashboard SHALL atualizar o XP e o streak do usuário em tempo real via Realtime do Supabase.
2. WHEN o usuário acessa a New_Dashboard pela primeira vez no dia, THE New_Dashboard SHALL registrar o login diário exatamente uma vez por sessão de montagem do componente.
3. THE New_Dashboard SHALL exibir o XP ganho e o nível atual do usuário de forma consistente com os dados retornados por `useUserProfile`.
