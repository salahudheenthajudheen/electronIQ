-- ElectronIQ Seed Data — run once after migration

-- Default admin settings
INSERT INTO admin_settings (key, value) VALUES
  ('school_name', '"School Name"'),
  ('padlet_url', '"https://padlet.com/embed/default"')
ON CONFLICT (key) DO NOTHING;

-- Fix: ensure RLS policy for INSERT on profiles exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- To create an admin user:
-- 1. Sign up via the app at /register
-- 2. Run: UPDATE profiles SET role = 'admin' WHERE id = '<your-user-id>';
-- (Find your user id in Supabase Auth → Users)
