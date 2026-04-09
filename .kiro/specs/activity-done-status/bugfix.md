# Bugfix Requirements Document

## Introduction

Ao clicar no botão "feito" em uma atividade/conteúdo no StudyFlow, o status da atividade não muda — ela continua aparecendo como pendente na lista principal. O problema abrange dois aspectos: (1) o botão "feito" com diálogo de confirmação não existe no `ContentCard`, apenas um botão de arquivar genérico; e (2) não há área separada para visualizar e gerenciar atividades concluídas/arquivadas. O impacto é que o usuário não consegue registrar progresso nem organizar sua trilha de aprendizagem.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN o usuário clica no botão de ação de conclusão em um `ContentCard` THEN o sistema não exibe nenhum diálogo de confirmação — a ação é executada diretamente (arquivar) sem confirmação

1.2 WHEN o usuário confirma a intenção de marcar uma atividade como concluída THEN o sistema não altera o status do conteúdo para `"done"` — o status permanece `"active"`

1.3 WHEN uma atividade é marcada como concluída THEN o sistema não remove a atividade da lista principal de conteúdos ativos

1.4 WHEN o usuário acessa a página de Cursos & Módulos THEN o sistema não exibe nenhuma área ou seção para visualizar atividades concluídas/arquivadas

1.5 WHEN o usuário visualiza a área de atividades concluídas THEN o sistema não oferece opção para reabrir/desarquivar uma atividade de volta para o status ativo

### Expected Behavior (Correct)

2.1 WHEN o usuário clica no botão "feito" em um `ContentCard` THEN o sistema SHALL exibir um diálogo de confirmação perguntando se o usuário deseja marcar a atividade como concluída

2.2 WHEN o usuário confirma no diálogo de confirmação THEN o sistema SHALL atualizar o status do conteúdo para `"done"` no banco de dados via Supabase

2.3 WHEN o status de um conteúdo é atualizado para `"done"` THEN o sistema SHALL remover a atividade da lista principal (que exibe apenas conteúdos com status `"active"`)

2.4 WHEN o usuário acessa a página de Cursos & Módulos THEN o sistema SHALL exibir uma seção separada listando todas as atividades com status `"done"` ou `"archived"`

2.5 WHEN o usuário visualiza a seção de atividades concluídas THEN o sistema SHALL oferecer um botão para reabrir a atividade, alterando seu status de volta para `"active"`

### Unchanged Behavior (Regression Prevention)

3.1 WHEN o usuário cancela o diálogo de confirmação THEN o sistema SHALL CONTINUE TO manter o status da atividade inalterado e fechará o diálogo sem nenhuma modificação

3.2 WHEN o usuário clica no botão de editar em um `ContentCard` THEN o sistema SHALL CONTINUE TO abrir o formulário de edição normalmente, sem interferência do novo fluxo de conclusão

3.3 WHEN o usuário cria um novo conteúdo THEN o sistema SHALL CONTINUE TO criá-lo com status `"active"` e exibi-lo na lista principal

3.4 WHEN o usuário filtra conteúdos por categoria ou ordena por prioridade na lista principal THEN o sistema SHALL CONTINUE TO aplicar os filtros e ordenações corretamente sobre os conteúdos ativos

3.5 WHEN uma atividade é arquivada via o fluxo de arquivamento existente THEN o sistema SHALL CONTINUE TO remover as sessões futuras pendentes associadas a ela, conforme comportamento atual do `useArchiveContent`
