# Documento de Requisitos

## Introdução

O **StudyFlow** é uma plataforma web de gerenciamento de estudos que permite ao usuário cadastrar conteúdos, configurar sua disponibilidade semanal e receber um plano de estudos personalizado gerado automaticamente. O sistema distribui as sessões de estudo com base em prioridade, prazo e horas disponíveis, e mantém o engajamento por meio de um sistema de gamificação com XP, níveis e conquistas.

A stack é composta por React + Vite + TypeScript no frontend, Tailwind CSS para estilização, Zustand para estado global, Supabase (Auth + PostgreSQL + Realtime) como backend, React Query para data fetching, React Hook Form + Zod para formulários, Recharts para gráficos e deploy na Vercel.

---

## Glossário

- **StudyFlow**: O sistema web descrito neste documento.
- **Usuário**: Pessoa autenticada que utiliza a plataforma.
- **Conteúdo**: Item de estudo cadastrado pelo Usuário, com título, descrição, carga horária estimada, prioridade, prazo e categoria.
- **Sessão**: Bloco de estudo alocado pelo Planejador para um dia específico, vinculado a um Conteúdo.
- **Agenda**: Configuração semanal do Usuário indicando quais dias e quantas horas por dia estão disponíveis para estudo.
- **Planejador**: Módulo responsável por distribuir os Conteúdos em Sessões nos dias disponíveis da Agenda.
- **Dashboard**: Tela principal que exibe as Sessões do dia e da semana corrente.
- **Streak**: Contador de dias consecutivos em que o Usuário concluiu ao menos uma Sessão.
- **XP**: Pontos de experiência acumulados pelo Usuário ao realizar ações no sistema.
- **Nível**: Classificação do Usuário baseada no total de XP acumulado.
- **Conquista**: Recompensa desbloqueada ao atingir marcos específicos de uso.
- **Categoria**: Agrupamento opcional de Conteúdos por matéria, tema ou projeto.
- **RLS**: Row Level Security — política de segurança do Supabase que restringe acesso aos dados por Usuário.
- **Supabase_Auth**: Módulo de autenticação do Supabase que gerencia identidade e tokens JWT.
- **XP_Engine**: Módulo responsável por calcular e registrar transações de XP.
- **Achievement_Engine**: Módulo responsável por verificar e desbloquear Conquistas.

---

## Requisitos

### Requisito 1: Autenticação de Usuários

**User Story:** Como usuário, quero criar uma conta e fazer login, para que meus dados de estudo sejam salvos e protegidos.

#### Critérios de Aceite

1. THE StudyFlow SHALL permitir que o Usuário se cadastre com e-mail e senha via Supabase_Auth.
2. WHEN o Usuário submete credenciais válidas, THE StudyFlow SHALL autenticar o Usuário e redirecionar para o Dashboard.
3. IF o Usuário submete credenciais inválidas, THEN THE StudyFlow SHALL exibir uma mensagem de erro descritiva sem revelar qual campo está incorreto.
4. WHEN o token JWT expira após 1 hora, THE StudyFlow SHALL renovar o token automaticamente sem interromper a sessão ativa.
5. WHEN o Usuário solicita logout, THE StudyFlow SHALL invalidar o token local e redirecionar para a tela de login.
6. THE StudyFlow SHALL aplicar RLS em todas as tabelas do banco de dados, garantindo que cada Usuário acesse somente seus próprios registros.

---

### Requisito 2: Cadastro e Gerenciamento de Conteúdos

**User Story:** Como usuário, quero cadastrar conteúdos com título, carga horária estimada, prioridade e prazo, para que o sistema saiba o que preciso estudar e possa planejar minha agenda.

#### Critérios de Aceite

1. WHEN o Usuário submete o formulário de criação de Conteúdo com título e carga horária estimada preenchidos, THE StudyFlow SHALL persistir o Conteúdo no banco de dados e creditar 10 XP ao Usuário.
2. THE StudyFlow SHALL aceitar os seguintes campos no cadastro de Conteúdo: título (obrigatório, máximo 120 caracteres), descrição (opcional, máximo 500 caracteres), carga horária estimada em horas (obrigatório, mínimo 0,5h), prioridade (obrigatório: baixa, média ou alta), prazo (opcional, data futura), e categoria (opcional).
3. IF o Usuário submete o formulário de Conteúdo com título ausente ou carga horária estimada menor que 0,5h, THEN THE StudyFlow SHALL rejeitar o envio e exibir mensagens de validação nos campos inválidos.
4. WHEN o Usuário edita um Conteúdo existente, THE StudyFlow SHALL atualizar os dados persistidos e acionar o Planejador para recalcular as Sessões futuras afetadas.
5. WHEN o Usuário arquiva um Conteúdo, THE StudyFlow SHALL alterar o status do Conteúdo para "archived" e remover as Sessões futuras pendentes vinculadas a ele.
6. THE StudyFlow SHALL exibir a lista de Conteúdos ativos com barra de progresso indicando a proporção entre horas concluídas e horas estimadas.
7. WHEN o total de horas estimadas dos Conteúdos ativos excede a capacidade total da Agenda configurada, THE StudyFlow SHALL exibir um alerta de sobrecarga informando o excedente em horas.

---

### Requisito 3: Configuração da Agenda Semanal

**User Story:** Como usuário, quero definir quais dias da semana e quantas horas por dia posso estudar, para que o planejamento respeite minha rotina real.

#### Critérios de Aceite

1. THE StudyFlow SHALL permitir que o Usuário configure, para cada dia da semana (domingo a sábado), se o dia está ativo e quantas horas estão disponíveis (mínimo 0,5h, máximo 24h por dia).
2. WHEN o Usuário salva a Agenda, THE StudyFlow SHALL persistir a configuração e acionar o Planejador para regenerar todas as Sessões futuras pendentes.
3. IF o Usuário tenta salvar a Agenda com um dia marcado como ativo e sem horas definidas, THEN THE StudyFlow SHALL rejeitar o envio e exibir mensagem de validação no campo correspondente.
4. THE StudyFlow SHALL exibir o total de horas semanais disponíveis calculado a partir da Agenda configurada.

---

### Requisito 4: Planejamento Automático de Sessões

**User Story:** Como usuário, quero receber um cronograma de estudos gerado automaticamente, para não precisar planejar manualmente o que estudar cada dia.

#### Critérios de Aceite

1. WHEN o Usuário possui Conteúdos ativos e Agenda configurada, THE Planejador SHALL gerar Sessões distribuindo os Conteúdos nos dias disponíveis para as próximas 4 semanas.
2. THE Planejador SHALL ordenar os Conteúdos para distribuição seguindo a sequência: prazo mais próximo primeiro, depois prioridade (alta > média > baixa), depois menor quantidade de horas restantes.
3. THE Planejador SHALL alocar blocos de Sessão respeitando o limite de horas disponíveis por dia definido na Agenda, sem ultrapassar esse limite.
4. THE Planejador SHALL evitar alocar o mesmo Conteúdo em dias consecutivos quando houver outros Conteúdos disponíveis para distribuição.
5. WHEN uma Sessão não é concluída até o final do dia agendado, THE Planejador SHALL reagendar a Sessão para o próximo dia disponível na Agenda dentro dos próximos 7 dias.
6. WHEN o Usuário conclui um Conteúdo integralmente, THE Planejador SHALL remover as Sessões futuras pendentes desse Conteúdo e redistribuir o tempo liberado para outros Conteúdos ativos.

---

### Requisito 5: Dashboard Diário e Semanal

**User Story:** Como usuário, quero ver no dashboard o que devo estudar hoje e na semana, para não precisar decidir toda manhã o que fazer.

#### Critérios de Aceite

1. THE Dashboard SHALL exibir, na visão diária, todas as Sessões agendadas para o dia corrente com título do Conteúdo, horas planejadas e status (pendente, concluída ou pulada).
2. THE Dashboard SHALL exibir, na visão semanal, as Sessões dos 7 dias da semana corrente agrupadas por dia.
3. WHEN não há Sessões agendadas para o dia corrente, THE Dashboard SHALL exibir uma mensagem informando que não há estudos planejados para hoje.
4. THE Dashboard SHALL exibir o progresso da meta semanal como percentual de horas concluídas em relação ao total de horas planejadas para a semana.
5. THE Dashboard SHALL carregar e renderizar as Sessões do dia em menos de 2,5 segundos em conexão 4G.

---

### Requisito 6: Registro de Conclusão de Sessões

**User Story:** Como usuário, quero marcar uma sessão de estudo como concluída, para receber pontos e atualizar meu progresso.

#### Critérios de Aceite

1. WHEN o Usuário marca uma Sessão como concluída, THE StudyFlow SHALL atualizar o status da Sessão para "done", registrar o horário de conclusão e creditar 50 XP ao Usuário via XP_Engine.
2. WHEN o Usuário marca uma Sessão como concluída, THE StudyFlow SHALL incrementar as horas concluídas do Conteúdo vinculado pelo valor de horas planejadas da Sessão.
3. WHEN as horas concluídas de um Conteúdo atingem ou superam as horas estimadas, THE StudyFlow SHALL alterar o status do Conteúdo para "done" e creditar 200 XP adicionais ao Usuário via XP_Engine.
4. WHEN o Usuário conclui um Conteúdo antes do prazo definido, THE XP_Engine SHALL creditar 100 XP adicionais ao Usuário.
5. WHEN o Usuário marca uma Sessão como pulada, THE StudyFlow SHALL atualizar o status da Sessão para "skipped" sem creditar XP.
6. THE StudyFlow SHALL processar a marcação de conclusão de Sessão e exibir o feedback visual de XP ganho em menos de 300ms após a ação do Usuário.

---

### Requisito 7: Sistema de XP e Níveis

**User Story:** Como usuário, quero ver minha pontuação e nível atuais, para me sentir recompensado pelo esforço e manter a motivação.

#### Critérios de Aceite

1. THE XP_Engine SHALL registrar cada transação de XP na tabela `xp_transactions` com valor, motivo, tipo de origem e identificador da origem.
2. THE StudyFlow SHALL calcular o nível atual do Usuário com base no total de XP acumulado seguindo a tabela: Nível 1 — Iniciante (0 XP), Nível 2 — Estudante (500 XP), Nível 3 — Dedicado (1.500 XP), Nível 4 — Focado (3.500 XP), Nível 5 — Expert (7.500 XP), Nível 6 — Mestre (15.000 XP).
3. WHEN o Usuário acumula XP suficiente para avançar de nível, THE StudyFlow SHALL exibir uma notificação de subida de nível com o novo nome do nível.
4. THE StudyFlow SHALL exibir na interface o total de XP acumulado, o nível atual, o nome do nível e o progresso percentual até o próximo nível.
5. WHEN o Usuário realiza o primeiro login do dia, THE XP_Engine SHALL creditar 15 XP ao Usuário uma única vez por dia.

---

### Requisito 8: Sistema de Streak

**User Story:** Como usuário, quero manter uma sequência de dias consecutivos de estudo, para ser recompensado pela consistência.

#### Critérios de Aceite

1. WHEN o Usuário conclui ao menos uma Sessão em um dia, THE StudyFlow SHALL incrementar o contador de Streak em 1 dia, desde que o dia anterior também tenha tido ao menos uma Sessão concluída ou seja o primeiro dia de estudo.
2. WHEN o Usuário não conclui nenhuma Sessão em um dia com Sessões agendadas, THE StudyFlow SHALL resetar o contador de Streak para zero no dia seguinte.
3. WHEN o contador de Streak atinge 3 dias consecutivos, THE XP_Engine SHALL creditar 75 XP ao Usuário uma única vez por marco atingido.
4. WHEN o contador de Streak atinge 7 dias consecutivos, THE XP_Engine SHALL creditar 300 XP ao Usuário uma única vez por marco atingido.
5. THE Dashboard SHALL exibir o valor atual do Streak do Usuário em dias.

---

### Requisito 9: Meta Semanal

**User Story:** Como usuário, quero ser recompensado quando cumpro 100% da minha meta semanal, para ter incentivo adicional de completar todos os estudos planejados.

#### Critérios de Aceite

1. WHEN todas as Sessões planejadas para uma semana são concluídas, THE XP_Engine SHALL creditar 500 XP ao Usuário ao final da semana.
2. THE Dashboard SHALL exibir o percentual de conclusão da meta semanal calculado como a razão entre horas de Sessões concluídas e horas de Sessões planejadas para a semana corrente.

---

### Requisito 10: Conquistas (Achievements)

**User Story:** Como usuário, quero desbloquear conquistas ao atingir marcos de uso, para ter reconhecimento adicional pelo meu progresso.

#### Critérios de Aceite

1. THE Achievement_Engine SHALL verificar as condições de desbloqueio de Conquistas após cada evento relevante (conclusão de Sessão, conclusão de Conteúdo, atualização de Streak).
2. WHEN as condições de uma Conquista são atendidas, THE Achievement_Engine SHALL registrar o desbloqueio na tabela `achievements` com a chave da Conquista e o horário de desbloqueio, e exibir uma notificação ao Usuário.
3. THE Achievement_Engine SHALL desbloquear cada Conquista no máximo uma vez por Usuário.
4. THE StudyFlow SHALL suportar as seguintes Conquistas: "Em Chamas" (7 dias consecutivos de estudo), "Devorador de Livros" (10 Conteúdos concluídos), "Maratonista" (50 horas totais de estudo registradas), "Pontual" (5 Conteúdos concluídos antes do prazo), "Semana Perfeita" (meta semanal 100% por 4 semanas consecutivas), "Madrugador" (primeira Sessão concluída antes das 07h00 por 5 vezes distintas).
5. THE StudyFlow SHALL exibir na tela de perfil todas as Conquistas disponíveis, indicando quais foram desbloqueadas e quais ainda estão bloqueadas.

---

### Requisito 11: Relatório Semanal

**User Story:** Como usuário, quero ver um relatório semanal do meu desempenho, para entender minha consistência e ajustar o plano.

#### Critérios de Aceite

1. THE StudyFlow SHALL exibir um relatório semanal contendo: total de horas estudadas, taxa de conclusão de Sessões (percentual de Sessões concluídas sobre o total planejado), XP ganho na semana e evolução do Streak.
2. THE StudyFlow SHALL exibir um gráfico de barras com as horas estudadas por dia da semana selecionada.
3. THE StudyFlow SHALL permitir que o Usuário navegue entre semanas anteriores para consultar relatórios históricos.

---

### Requisito 12: Categorias de Conteúdo

**User Story:** Como usuário, quero organizar meus conteúdos por categoria, para filtrar facilmente por matéria ou projeto.

#### Critérios de Aceite

1. THE StudyFlow SHALL permitir que o Usuário crie Categorias com nome (obrigatório, máximo 50 caracteres) e cor (obrigatório, selecionada de uma paleta predefinida).
2. WHEN o Usuário associa um Conteúdo a uma Categoria, THE StudyFlow SHALL exibir a cor da Categoria como indicador visual na listagem de Conteúdos e no Dashboard.
3. THE StudyFlow SHALL permitir que o Usuário filtre a listagem de Conteúdos por Categoria.

---

### Requisito 13: Requisitos Não Funcionais

**User Story:** Como usuário, quero que a plataforma seja rápida, acessível e segura, para ter uma experiência confiável em qualquer dispositivo.

#### Critérios de Aceite

1. THE StudyFlow SHALL renderizar o Dashboard com LCP (Largest Contentful Paint) inferior a 2,5 segundos em conexão 4G simulada.
2. THE StudyFlow SHALL processar e exibir feedback visual para ações do Usuário (conclusão de Sessão, salvamento de formulário) em menos de 300ms.
3. THE StudyFlow SHALL ser responsivo e utilizável em viewports a partir de 360px de largura.
4. THE StudyFlow SHALL atender ao nível AA das diretrizes WCAG 2.1 para contraste de cores, navegação por teclado e compatibilidade com leitores de tela.
5. THE StudyFlow SHALL aplicar políticas de RLS em 100% das tabelas do Supabase, impedindo acesso cruzado entre Usuários.
6. THE Supabase_Auth SHALL emitir tokens JWT com expiração de 1 hora, renovados automaticamente pelo cliente enquanto a sessão estiver ativa.
