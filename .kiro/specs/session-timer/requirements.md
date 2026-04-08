# Requirements Document

## Introduction

O Session Timer é uma funcionalidade do StudyFlow que adiciona um botão de play/pause em cada SessionCard da dashboard. O usuário pode cronometrar o tempo real de estudo de cada sessão, pausar e retomar quando quiser. O tempo acumulado é exibido no card e, ao concluir a sessão, o tempo cronometrado é registrado e pode influenciar a concessão de XP. A funcionalidade opera inteiramente no cliente (estado em memória + localStorage para persistência entre reloads), sem exigir novas colunas no banco de dados para o timer em si — apenas o tempo efetivo ao completar a sessão é persistido.

## Glossary

- **Session_Timer**: Componente de cronômetro acoplado a um SessionCard que controla o tempo de estudo de uma sessão.
- **Timer_State**: Estado interno do cronômetro de uma sessão, podendo ser `idle` (não iniciado), `running` (em execução) ou `paused` (pausado).
- **Elapsed_Time**: Tempo acumulado em segundos desde o início do cronômetro, excluindo períodos pausados.
- **SessionCard**: Card da dashboard que representa uma sessão de estudo agendada.
- **Session**: Registro de uma sessão de estudo com status `pending`, `done` ou `skipped`.
- **XP**: Pontos de experiência do sistema de gamificação do StudyFlow.
- **Timer_Store**: Mecanismo de persistência local (localStorage) que mantém o estado dos timers ativos entre reloads de página.
- **Planned_Hours**: Duração planejada da sessão em horas, definida no momento da criação da sessão.
- **Active_Timer**: Timer com Timer_State igual a `running`.

---

## Requirements

### Requirement 1: Controle de Play/Pause no SessionCard

**User Story:** Como estudante, quero iniciar e pausar um cronômetro em cada sessão da dashboard, para que eu possa medir o tempo real que dedico a cada módulo de estudo.

#### Acceptance Criteria

1. WHEN uma Session com status `pending` é exibida no SessionCard, THE Session_Timer SHALL renderizar um botão de play com ícone e rótulo acessível "Iniciar cronômetro".
2. WHEN o usuário aciona o botão de play, THE Session_Timer SHALL alterar o Timer_State para `running` e iniciar a contagem do Elapsed_Time.
3. WHEN o Timer_State é `running`, THE Session_Timer SHALL renderizar um botão de pause com ícone e rótulo acessível "Pausar cronômetro".
4. WHEN o usuário aciona o botão de pause, THE Session_Timer SHALL alterar o Timer_State para `paused` e interromper a contagem do Elapsed_Time.
5. WHEN o Timer_State é `paused`, THE Session_Timer SHALL renderizar o botão de play novamente, permitindo retomar a contagem.
6. WHEN a Session tem status `done` ou `skipped`, THE Session_Timer SHALL não renderizar o botão de play/pause.

---

### Requirement 2: Exibição do Tempo Decorrido

**User Story:** Como estudante, quero ver o tempo que já estudei em cada sessão diretamente no card, para que eu tenha visibilidade do meu progresso em tempo real.

#### Acceptance Criteria

1. THE Session_Timer SHALL exibir o Elapsed_Time no formato `MM:SS` quando o Elapsed_Time for inferior a 3600 segundos.
2. THE Session_Timer SHALL exibir o Elapsed_Time no formato `HH:MM:SS` quando o Elapsed_Time for igual ou superior a 3600 segundos.
3. WHILE o Timer_State é `running`, THE Session_Timer SHALL atualizar o Elapsed_Time exibido a cada 1 segundo.
4. WHEN o Timer_State é `idle`, THE Session_Timer SHALL exibir `00:00` como valor inicial do Elapsed_Time.
5. THE Session_Timer SHALL exibir o Elapsed_Time em uma área com `aria-live="polite"` para leitores de tela.

---

### Requirement 3: Persistência do Timer entre Reloads

**User Story:** Como estudante, quero que o cronômetro não seja perdido se eu recarregar a página acidentalmente, para que eu não perca o controle do tempo já estudado.

#### Acceptance Criteria

1. WHEN o Timer_State muda para `running` ou `paused`, THE Timer_Store SHALL persistir o Timer_State e o Elapsed_Time acumulado no localStorage, indexado pelo id da Session.
2. WHEN a página é recarregada e existe um estado salvo no Timer_Store para uma Session, THE Session_Timer SHALL restaurar o Timer_State e o Elapsed_Time a partir do Timer_Store.
3. WHEN uma Session tem status `done` ou `skipped`, THE Timer_Store SHALL remover o estado salvo dessa Session do localStorage.
4. IF o Timer_Store contém um estado com Timer_State `running` ao restaurar, THEN THE Session_Timer SHALL retomar a contagem a partir do Elapsed_Time salvo, ajustando pelo tempo decorrido desde o último save.

---

### Requirement 4: Integração com Conclusão de Sessão

**User Story:** Como estudante, quero que o tempo cronometrado seja considerado ao concluir uma sessão, para que meu esforço real seja reconhecido pelo sistema de gamificação.

#### Acceptance Criteria

1. WHEN o usuário aciona o botão "Feito!" em um SessionCard com Active_Timer, THE Session_Timer SHALL pausar automaticamente o cronômetro antes de acionar o callback `onComplete`.
2. WHEN uma Session é concluída com Elapsed_Time maior que zero, THE Session_Timer SHALL passar o Elapsed_Time em segundos para o callback `onComplete` junto com o id da Session.
3. WHEN uma Session é concluída com Elapsed_Time igual a zero, THE Session_Timer SHALL acionar o callback `onComplete` sem alterar o comportamento padrão de concessão de XP.
4. WHEN o usuário aciona o botão "Pular" em um SessionCard, THE Session_Timer SHALL parar e descartar o Elapsed_Time antes de acionar o callback `onSkip`.

---

### Requirement 5: Indicador Visual de Sessão em Andamento

**User Story:** Como estudante, quero que o card da sessão em andamento tenha uma aparência diferenciada, para que eu identifique rapidamente qual sessão estou cronometrando.

#### Acceptance Criteria

1. WHILE o Timer_State é `running`, THE SessionCard SHALL aplicar um estilo visual distinto (borda animada ou destaque de cor) para indicar que a sessão está em andamento.
2. WHILE o Timer_State é `running`, THE SessionCard SHALL exibir um indicador de "Em andamento" visível ao lado do Elapsed_Time.
3. WHEN o Timer_State muda de `running` para `paused` ou `idle`, THE SessionCard SHALL remover o estilo visual de sessão em andamento.

---

### Requirement 6: Limite de um Timer Ativo por Vez

**User Story:** Como estudante, quero que apenas um cronômetro esteja ativo por vez na dashboard, para que eu não me confunda sobre qual sessão estou estudando.

#### Acceptance Criteria

1. WHEN o usuário inicia um Session_Timer em uma Session, THE Timer_Store SHALL verificar se existe outro Active_Timer em outra Session.
2. IF existe um Active_Timer em outra Session, THEN THE Timer_Store SHALL pausar automaticamente o Active_Timer anterior antes de iniciar o novo.
3. THE Session_Timer SHALL garantir que no máximo um Timer_State seja `running` em qualquer momento na dashboard.
