-- StudyFlow: Initial Schema Migration
-- Task 2.1 — Criar migrations SQL para todas as tabelas

-- Agenda semanal do usuário
CREATE TABLE schedules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_active   boolean NOT NULL DEFAULT false,
  available_hours numeric(4,2) CHECK (available_hours >= 0.5 AND available_hours <= 24),
  UNIQUE (user_id, day_of_week)
);

-- Categorias de conteúdo
CREATE TABLE categories (
  id      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name    text NOT NULL CHECK (char_length(name) <= 50),
  color   text NOT NULL
);

-- Conteúdos de estudo
CREATE TABLE contents (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id      uuid REFERENCES categories(id) ON DELETE SET NULL,
  title            text NOT NULL CHECK (char_length(title) <= 120),
  description      text CHECK (char_length(description) <= 500),
  estimated_hours  numeric(6,2) NOT NULL CHECK (estimated_hours >= 0.5),
  completed_hours  numeric(6,2) NOT NULL DEFAULT 0,
  priority         text NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  deadline         date,
  status           text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'done', 'archived')),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Sessões de estudo
CREATE TABLE sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id      uuid NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  scheduled_date  date NOT NULL,
  planned_hours   numeric(4,2) NOT NULL CHECK (planned_hours > 0),
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'skipped')),
  completed_at    timestamptz
);

-- Transações de XP
CREATE TABLE xp_transactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      integer NOT NULL,
  reason      text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN (
    'session', 'content', 'streak', 'weekly_goal',
    'login', 'content_creation', 'early_completion'
  )),
  source_id   uuid,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Conquistas desbloqueadas
CREATE TABLE achievements (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_key text NOT NULL CHECK (achievement_key IN (
    'em_chamas', 'devorador_de_livros', 'maratonista',
    'pontual', 'semana_perfeita', 'madrugador'
  )),
  unlocked_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, achievement_key)
);

-- Streak do usuário
CREATE TABLE streaks (
  user_id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak  integer NOT NULL DEFAULT 0,
  longest_streak  integer NOT NULL DEFAULT 0,
  last_study_date date
);
