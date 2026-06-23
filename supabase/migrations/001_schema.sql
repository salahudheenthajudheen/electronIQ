-- ElectronIQ Full Schema — safe to re-run

-- Profiles table (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student', 'teacher', 'admin')) DEFAULT 'student',
  name TEXT NOT NULL DEFAULT '',
  section TEXT DEFAULT '',
  roll_no TEXT DEFAULT '',
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ml')),
  avatar_seed TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can read own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers and admins can read all profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Teachers and admins can read all profiles" ON profiles FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Phase Progress
CREATE TABLE IF NOT EXISTS phase_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  phase INT NOT NULL CHECK (phase BETWEEN 1 AND 4),
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0
);

ALTER TABLE phase_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can read own progress' AND tablename = 'phase_progress') THEN
    CREATE POLICY "Students can read own progress" ON phase_progress FOR SELECT USING (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers and admins can read all progress' AND tablename = 'phase_progress') THEN
    CREATE POLICY "Teachers and admins can read all progress" ON phase_progress FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert own progress' AND tablename = 'phase_progress') THEN
    CREATE POLICY "Students can insert own progress" ON phase_progress FOR INSERT WITH CHECK (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can update own progress' AND tablename = 'phase_progress') THEN
    CREATE POLICY "Students can update own progress" ON phase_progress FOR UPDATE USING (auth.uid() = student_id);
  END IF;
END $$;

-- Hypothesis Entries
CREATE TABLE IF NOT EXISTS hypothesis_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  upvotes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE hypothesis_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read hypotheses' AND tablename = 'hypothesis_entries') THEN
    CREATE POLICY "Anyone can read hypotheses" ON hypothesis_entries FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert own hypotheses' AND tablename = 'hypothesis_entries') THEN
    CREATE POLICY "Students can insert own hypotheses" ON hypothesis_entries FOR INSERT WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- Sim Trials
CREATE TABLE IF NOT EXISTS sim_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  voltage TEXT CHECK (voltage IN ('low', 'medium', 'high')),
  pressure TEXT CHECK (pressure IN ('low', 'medium', 'high')),
  mag_field BOOLEAN DEFAULT false,
  elec_field BOOLEAN DEFAULT false,
  prediction TEXT,
  result TEXT,
  correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE sim_trials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can read own trials' AND tablename = 'sim_trials') THEN
    CREATE POLICY "Students can read own trials" ON sim_trials FOR SELECT USING (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert own trials' AND tablename = 'sim_trials') THEN
    CREATE POLICY "Students can insert own trials" ON sim_trials FOR INSERT WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- Worksheet Answers
CREATE TABLE IF NOT EXISTS worksheet_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  answer_text TEXT,
  hint_level_used INT DEFAULT 0,
  is_correct BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE worksheet_answers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can read own answers' AND tablename = 'worksheet_answers') THEN
    CREATE POLICY "Students can read own answers" ON worksheet_answers FOR SELECT USING (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert own answers' AND tablename = 'worksheet_answers') THEN
    CREATE POLICY "Students can insert own answers" ON worksheet_answers FOR INSERT WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- Tag Activity
CREATE TABLE IF NOT EXISTS tag_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  device_id TEXT NOT NULL,
  selected_role TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tag_activity ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can read own tags' AND tablename = 'tag_activity') THEN
    CREATE POLICY "Students can read own tags" ON tag_activity FOR SELECT USING (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert own tags' AND tablename = 'tag_activity') THEN
    CREATE POLICY "Students can insert own tags" ON tag_activity FOR INSERT WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- Padlet Uploads
CREATE TABLE IF NOT EXISTS padlet_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE padlet_uploads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read uploads' AND tablename = 'padlet_uploads') THEN
    CREATE POLICY "Anyone can read uploads" ON padlet_uploads FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert own uploads' AND tablename = 'padlet_uploads') THEN
    CREATE POLICY "Students can insert own uploads" ON padlet_uploads FOR INSERT WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- Story Drafts
CREATE TABLE IF NOT EXISTS story_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  option_type TEXT NOT NULL CHECK (option_type IN ('cosmic_trip', 'thomson_discovery', 'cathode_ray')),
  content_json JSONB DEFAULT '[]',
  ai_turns INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

ALTER TABLE story_drafts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can read own drafts' AND tablename = 'story_drafts') THEN
    CREATE POLICY "Students can read own drafts" ON story_drafts FOR SELECT USING (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert own drafts' AND tablename = 'story_drafts') THEN
    CREATE POLICY "Students can insert own drafts" ON story_drafts FOR INSERT WITH CHECK (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can update own drafts' AND tablename = 'story_drafts') THEN
    CREATE POLICY "Students can update own drafts" ON story_drafts FOR UPDATE USING (auth.uid() = student_id);
  END IF;
END $$;

-- Quiz Attempts (Escape Room)
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  room_number INT NOT NULL CHECK (room_number BETWEEN 1 AND 5),
  question_id TEXT NOT NULL,
  answer TEXT NOT NULL,
  correct BOOLEAN NOT NULL,
  hint_coins_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can read own quiz attempts' AND tablename = 'quiz_attempts') THEN
    CREATE POLICY "Students can read own quiz attempts" ON quiz_attempts FOR SELECT USING (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can insert own quiz attempts' AND tablename = 'quiz_attempts') THEN
    CREATE POLICY "Students can insert own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (auth.uid() = student_id);
  END IF;
END $$;

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read badges' AND tablename = 'badges') THEN
    CREATE POLICY "Anyone can read badges" ON badges FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can insert badges' AND tablename = 'badges') THEN
    CREATE POLICY "System can insert badges" ON badges FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Leaderboard
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_xp INT DEFAULT 0,
  phase_xp JSONB DEFAULT '{"1": 0, "2": 0, "3": 0, "4": 0}',
  streak_days INT DEFAULT 0,
  last_active DATE DEFAULT CURRENT_DATE
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read leaderboard' AND tablename = 'leaderboard') THEN
    CREATE POLICY "Anyone can read leaderboard" ON leaderboard FOR SELECT USING (true);
  END IF;
END $$;

-- AI Calls Cache
CREATE TABLE IF NOT EXISTS ai_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  function_name TEXT NOT NULL,
  prompt_hash TEXT NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_calls ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can read own ai calls' AND tablename = 'ai_calls') THEN
    CREATE POLICY "Students can read own ai calls" ON ai_calls FOR SELECT USING (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can insert ai calls' AND tablename = 'ai_calls') THEN
    CREATE POLICY "System can insert ai calls" ON ai_calls FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Events (engagement tracking)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Students can read own events' AND tablename = 'events') THEN
    CREATE POLICY "Students can read own events" ON events FOR SELECT USING (auth.uid() = student_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'System can insert events' AND tablename = 'events') THEN
    CREATE POLICY "System can insert events" ON events FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Teachers and admins can read events' AND tablename = 'events') THEN
    CREATE POLICY "Teachers and admins can read events" ON events FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'admin'))
    );
  END IF;
END $$;

-- Admin Settings
CREATE TABLE IF NOT EXISTS admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Anyone can read settings' AND tablename = 'admin_settings') THEN
    CREATE POLICY "Anyone can read settings" ON admin_settings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update settings' AND tablename = 'admin_settings') THEN
    CREATE POLICY "Admins can update settings" ON admin_settings FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

-- XP Trigger Function (will replace if already exists)
CREATE OR REPLACE FUNCTION update_leaderboard_xp()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO leaderboard (student_id, total_xp, phase_xp, last_active)
  VALUES (NEW.student_id, 0, '{"1": 0, "2": 0, "3": 0, "4": 0}', CURRENT_DATE)
  ON CONFLICT (student_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on events to ensure leaderboard row exists
DROP TRIGGER IF EXISTS ensure_leaderboard_row ON events;
CREATE TRIGGER ensure_leaderboard_row
  AFTER INSERT ON events
  FOR EACH ROW EXECUTE FUNCTION update_leaderboard_xp();

-- Streak update function
CREATE OR REPLACE FUNCTION update_streak()
RETURNS TRIGGER AS $$
DECLARE
  last_active_date DATE;
BEGIN
  SELECT last_active INTO last_active_date FROM leaderboard WHERE student_id = NEW.student_id;
  IF last_active_date IS NOT NULL THEN
    IF last_active_date = CURRENT_DATE - INTERVAL '1 day' THEN
      UPDATE leaderboard SET streak_days = streak_days + 1, last_active = CURRENT_DATE
      WHERE student_id = NEW.student_id;
    ELSIF last_active_date < CURRENT_DATE - INTERVAL '1 day' THEN
      UPDATE leaderboard SET streak_days = 1, last_active = CURRENT_DATE
      WHERE student_id = NEW.student_id;
    END IF;
  ELSE
    UPDATE leaderboard SET streak_days = 1, last_active = CURRENT_DATE
    WHERE student_id = NEW.student_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_event_update_streak ON events;
CREATE TRIGGER on_event_update_streak
  AFTER INSERT ON events
  FOR EACH ROW EXECUTE FUNCTION update_streak();

-- Auto-create profile row on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_seed)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), COALESCE(NEW.raw_user_meta_data->>'avatar_seed', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
