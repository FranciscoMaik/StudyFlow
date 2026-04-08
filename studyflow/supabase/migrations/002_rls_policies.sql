-- RLS Policies for all tables
-- Requisitos: 1.6, 13.5

-- schedules
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_schedules" ON schedules
  FOR ALL USING (auth.uid() = user_id);

-- categories
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_categories" ON categories
  FOR ALL USING (auth.uid() = user_id);

-- contents
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_contents" ON contents
  FOR ALL USING (auth.uid() = user_id);

-- sessions
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

-- xp_transactions
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_xp_transactions" ON xp_transactions
  FOR ALL USING (auth.uid() = user_id);

-- achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_achievements" ON achievements
  FOR ALL USING (auth.uid() = user_id);

-- streaks
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_own_streaks" ON streaks
  FOR ALL USING (auth.uid() = user_id);
