-- Projects table (app-level modules, not per-user)
CREATE TABLE projects (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text UNIQUE NOT NULL,
  name       text NOT NULL,
  icon       text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO projects (slug, name, icon, sort_order) VALUES
  ('study',  'Estudos', 'BookOpen', 0),
  ('movies', 'Filmes',  'Film',     1);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_read_projects" ON projects
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Movies table
CREATE TABLE movies (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        text NOT NULL CHECK (char_length(title) <= 200),
  description  text CHECK (char_length(description) <= 1000),
  genre        text CHECK (char_length(genre) <= 50),
  release_year integer CHECK (release_year >= 1888 AND release_year <= 2100),
  rating       integer CHECK (rating >= 1 AND rating <= 10),
  status       text NOT NULL DEFAULT 'want_to_watch'
               CHECK (status IN ('want_to_watch', 'watched')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_movies" ON movies
  FOR ALL USING (auth.uid() = user_id);
