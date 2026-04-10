# Requirements Document

## Introduction

Adicionar uma seção de calendário mensal na tela de Conteúdos (Contents) do StudyFlow. O calendário exibe os dias do mês atual com indicadores visuais nos dias que possuem sessões de estudo agendadas (pendentes ou concluídas), permitindo ao usuário visualizar rapidamente a distribuição das atividades ao longo do mês. O usuário pode navegar entre meses e clicar em um dia para ver os conteúdos associados àquele dia.

## Glossary

- **Calendar_View**: Componente de calendário mensal exibido na tela de Conteúdos.
- **Calendar_Day**: Célula individual representando um dia do mês no Calendar_View.
- **Session**: Sessão de estudo agendada, com data (`scheduledDate`), status (`pending`, `done`, `skipped`) e referência a um conteúdo (`contentId`).
- **Content**: Módulo ou curso de estudo cadastrado pelo usuário.
- **Day_Events**: Lista de sessões associadas a um Calendar_Day específico.
- **Selected_Day**: Calendar_Day atualmente selecionado pelo usuário para visualizar os Day_Events.
- **Current_Month**: Mês e ano atualmente exibido no Calendar_View.
- **Today**: Data atual do dispositivo do usuário.
- **Month_Navigator**: Controle de navegação que permite avançar ou retroceder o Current_Month.

---

## Requirements

### Requirement 1: Exibição do Calendário Mensal

**User Story:** Como estudante, quero ver um calendário mensal na tela de Conteúdos, para que eu possa visualizar em quais dias tenho atividades de estudo agendadas.

#### Acceptance Criteria

1. THE Calendar_View SHALL exibir uma grade mensal com os dias organizados em colunas de domingo a sábado.
2. THE Calendar_View SHALL exibir o nome do mês e o ano do Current_Month no cabeçalho.
3. THE Calendar_View SHALL exibir os dias da semana abreviados (Dom, Seg, Ter, Qua, Qui, Sex, Sáb) como cabeçalho das colunas.
4. WHEN o Current_Month não começa em domingo, THE Calendar_View SHALL preencher as células anteriores ao primeiro dia com espaços vazios para manter o alinhamento correto da grade.
5. WHEN o Current_Month não termina em sábado, THE Calendar_View SHALL preencher as células posteriores ao último dia com espaços vazios para manter o alinhamento correto da grade.
6. WHEN a data atual pertence ao Current_Month, THE Calendar_View SHALL destacar visualmente o Calendar_Day correspondente ao Today com estilo diferenciado dos demais dias.

---

### Requirement 2: Indicadores de Sessões nos Dias

**User Story:** Como estudante, quero ver indicadores visuais nos dias que possuem sessões agendadas, para que eu identifique rapidamente minha distribuição de estudos no mês.

#### Acceptance Criteria

1. WHEN um Calendar_Day possui uma ou mais Sessions com status `pending` ou `done`, THE Calendar_View SHALL exibir um indicador visual (ponto ou badge) naquele Calendar_Day.
2. WHEN um Calendar_Day possui Sessions com status `done`, THE Calendar_View SHALL exibir o indicador com cor diferente do indicador de sessões `pending`, para distinguir dias concluídos de dias pendentes.
3. WHEN um Calendar_Day não possui nenhuma Session, THE Calendar_View SHALL exibir aquele Calendar_Day sem indicadores.
4. WHEN as Sessions são carregadas do servidor, THE Calendar_View SHALL exibir um estado de carregamento enquanto os dados não estão disponíveis.
5. IF a busca de Sessions falhar, THEN THE Calendar_View SHALL exibir uma mensagem de erro informando que não foi possível carregar as sessões.

---

### Requirement 3: Navegação entre Meses

**User Story:** Como estudante, quero navegar entre os meses no calendário, para que eu possa ver atividades passadas e futuras.

#### Acceptance Criteria

1. THE Month_Navigator SHALL exibir um botão para avançar ao próximo mês e um botão para retroceder ao mês anterior.
2. WHEN o usuário aciona o botão de avançar, THE Calendar_View SHALL atualizar o Current_Month para o mês seguinte e recarregar os indicadores de sessões correspondentes.
3. WHEN o usuário aciona o botão de retroceder, THE Calendar_View SHALL atualizar o Current_Month para o mês anterior e recarregar os indicadores de sessões correspondentes.
4. THE Month_Navigator SHALL exibir um botão "Hoje" que, quando acionado, retorna o Current_Month ao mês que contém o Today.

---

### Requirement 4: Seleção de Dia e Exibição de Eventos

**User Story:** Como estudante, quero clicar em um dia do calendário para ver quais conteúdos estão agendados naquele dia, para que eu possa planejar meus estudos.

#### Acceptance Criteria

1. WHEN o usuário clica em um Calendar_Day que possui Sessions, THE Calendar_View SHALL definir aquele dia como Selected_Day e exibir a lista de Day_Events abaixo do calendário.
2. WHEN um Selected_Day está definido, THE Calendar_View SHALL destacar visualmente o Calendar_Day selecionado com estilo diferenciado dos demais dias.
3. WHEN a lista de Day_Events é exibida, THE Calendar_View SHALL mostrar para cada Session o título do Content associado, o número de horas planejadas e o status da sessão.
4. WHEN o usuário clica em um Calendar_Day sem Sessions, THE Calendar_View SHALL limpar o Selected_Day e ocultar a lista de Day_Events.
5. WHEN o usuário clica no mesmo Calendar_Day que já está selecionado, THE Calendar_View SHALL limpar o Selected_Day e ocultar a lista de Day_Events (toggle).
6. WHEN o Current_Month é alterado via Month_Navigator, THE Calendar_View SHALL limpar o Selected_Day atual.

---

### Requirement 5: Integração com a Tela de Conteúdos

**User Story:** Como estudante, quero que o calendário apareça na tela de Conteúdos de forma integrada, para que eu tenha uma visão unificada dos meus módulos e agenda.

#### Acceptance Criteria

1. THE Calendar_View SHALL ser exibido na tela de Conteúdos acima da lista de módulos ativos (ContentList).
2. THE Calendar_View SHALL buscar Sessions apenas do usuário autenticado atualmente.
3. WHEN o usuário cria, edita ou arquiva um Content que resulta em alteração de Sessions, THE Calendar_View SHALL atualizar os indicadores automaticamente sem necessidade de recarregar a página.
4. THE Calendar_View SHALL ser responsivo, adaptando seu layout para telas menores (mobile) sem perda de funcionalidade.
