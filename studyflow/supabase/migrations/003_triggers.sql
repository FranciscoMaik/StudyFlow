-- Jazim: PostgreSQL Triggers for Transactional Consistency
-- Task 2.3 — Criar triggers PostgreSQL para consistência transacional
-- Requirements: 6.1, 6.2, 6.3, 6.4, 8.1, 8.2, 10.1, 10.2

-- ============================================================
-- 1. xp_on_session_complete
--    Credits 50 XP when a session is marked as 'done'
--    Requirement: 6.1
-- ============================================================
CREATE OR REPLACE FUNCTION xp_on_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status <> 'done' THEN
    INSERT INTO xp_transactions (user_id, amount, reason, source_type, source_id)
    VALUES (NEW.user_id, 50, 'Sessão concluída', 'session', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_xp_on_session_complete
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION xp_on_session_complete();

-- ============================================================
-- 2. check_content_completion
--    Updates completed_hours on the content; if content is now
--    fully done, sets status='done' and credits 200 XP.
--    If completed before deadline, credits 100 XP extra.
--    Requirements: 6.2, 6.3, 6.4
-- ============================================================
CREATE OR REPLACE FUNCTION check_content_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_content contents%ROWTYPE;
BEGIN
  IF NEW.status = 'done' AND OLD.status <> 'done' THEN
    -- Increment completed_hours on the linked content
    UPDATE contents
    SET completed_hours = completed_hours + NEW.planned_hours
    WHERE id = NEW.content_id
    RETURNING * INTO v_content;

    -- Check if content is now fully completed
    IF v_content.completed_hours >= v_content.estimated_hours
       AND v_content.status <> 'done' THEN

      UPDATE contents
      SET status = 'done'
      WHERE id = NEW.content_id;

      -- Credit 200 XP for completing the content
      INSERT INTO xp_transactions (user_id, amount, reason, source_type, source_id)
      VALUES (NEW.user_id, 200, 'Conteúdo concluído', 'content', NEW.content_id);

      -- Credit 100 XP extra if completed before deadline
      IF v_content.deadline IS NOT NULL AND CURRENT_DATE <= v_content.deadline THEN
        INSERT INTO xp_transactions (user_id, amount, reason, source_type, source_id)
        VALUES (NEW.user_id, 100, 'Conteúdo concluído antes do prazo', 'early_completion', NEW.content_id);
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_content_completion
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION check_content_completion();

-- ============================================================
-- 3. update_streak
--    Upserts the streaks table after a session is completed.
--    - last_study_date = yesterday  → increment current_streak
--    - last_study_date = today      → already counted, do nothing
--    - otherwise                    → reset current_streak to 1
--    Updates longest_streak if needed.
--    Requirements: 8.1, 8.2
-- ============================================================
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'done' AND OLD.status <> 'done' THEN
    INSERT INTO streaks (user_id, current_streak, longest_streak, last_study_date)
    VALUES (NEW.user_id, 1, 1, CURRENT_DATE)
    ON CONFLICT (user_id) DO UPDATE
      SET
        current_streak = CASE
          WHEN streaks.last_study_date = CURRENT_DATE - INTERVAL '1 day'
            THEN streaks.current_streak + 1
          WHEN streaks.last_study_date = CURRENT_DATE
            THEN streaks.current_streak  -- already counted today
          ELSE 1                          -- streak broken, reset
        END,
        longest_streak = GREATEST(
          streaks.longest_streak,
          CASE
            WHEN streaks.last_study_date = CURRENT_DATE - INTERVAL '1 day'
              THEN streaks.current_streak + 1
            WHEN streaks.last_study_date = CURRENT_DATE
              THEN streaks.current_streak
            ELSE 1
          END
        ),
        last_study_date = CASE
          WHEN streaks.last_study_date = CURRENT_DATE
            THEN streaks.last_study_date  -- keep today's date unchanged
          ELSE CURRENT_DATE
        END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_streak
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_streak();

-- ============================================================
-- 4. check_achievements
--    Checks and records unlocked achievements after a session
--    is completed.
--    - 'em_chamas'   : current_streak >= 7  (Req 10.4)
--    - 'maratonista' : total study hours >= 50  (Req 10.4)
--    Other achievements (devorador_de_livros, pontual,
--    semana_perfeita, madrugador) require richer context and
--    are handled client-side via achievement-engine.ts.
--    Requirements: 10.1, 10.2
-- ============================================================
CREATE OR REPLACE FUNCTION check_achievements()
RETURNS TRIGGER AS $$
DECLARE
  v_streak        integer;
  v_total_hours   numeric;
BEGIN
  IF NEW.status = 'done' AND OLD.status <> 'done' THEN

    -- Read current streak
    SELECT current_streak INTO v_streak
    FROM streaks
    WHERE user_id = NEW.user_id;

    -- Read total study hours from all completed sessions
    SELECT COALESCE(SUM(planned_hours), 0) INTO v_total_hours
    FROM sessions
    WHERE user_id = NEW.user_id
      AND status = 'done';

    -- 'em_chamas': 7-day streak
    IF v_streak >= 7 THEN
      INSERT INTO achievements (user_id, achievement_key)
      VALUES (NEW.user_id, 'em_chamas')
      ON CONFLICT (user_id, achievement_key) DO NOTHING;
    END IF;

    -- 'maratonista': 50 total study hours
    IF v_total_hours >= 50 THEN
      INSERT INTO achievements (user_id, achievement_key)
      VALUES (NEW.user_id, 'maratonista')
      ON CONFLICT (user_id, achievement_key) DO NOTHING;
    END IF;

  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_check_achievements
  AFTER UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION check_achievements();
