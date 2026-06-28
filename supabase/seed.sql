-- ElectronIQ Seed Data — run once after migration

-- Default admin settings
INSERT INTO admin_settings (key, value) VALUES
  ('school_name', '"School Name"'),
  ('padlet_url', '"https://padlet.com/embed/default"')
ON CONFLICT (key) DO NOTHING;

-- Ensure RLS policy for INSERT on profiles exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own profile' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- Create admin user (run after Supabase Auth is ready):
-- 1. Go to Supabase Dashboard → Authentication → Users → Invite user
-- 2. Email: admin@gmail.com, Password: admin@123
-- 3. Then run: UPDATE profiles SET role = 'admin' WHERE id = '<the-new-user-id>';
-- Or use the SQL admin creation function below:

-- Helper: create admin user via auth API (uncomment and run after migration)
-- SELECT supabase_auth.create_user(
--   '{"email":"admin@gmail.com","password":"admin@123","email_confirm":true}'::jsonb
-- );
-- Then find the user's id and:
-- UPDATE profiles SET role = 'admin', name = 'Admin' WHERE email = 'admin@gmail.com';
