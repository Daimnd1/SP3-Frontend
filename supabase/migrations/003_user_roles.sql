-- User Roles and Profiles for Manager Feature
-- Run this in Supabase SQL Editor

-- Table: profiles
-- Stores user role and additional profile data
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'manager')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Backfill existing users into profiles table
INSERT INTO public.profiles (user_id, role)
SELECT id, 'user'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;

-- Index for fast role lookups
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Helper function to check if current user is a manager (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'manager'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Managers can view all profiles" ON profiles;

-- RLS: Users can view their own profile OR if they're a manager (view all)
CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id OR public.is_manager());

-- Drop existing insert/update policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- RLS: Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS: Users can update their own profile (not including role)
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Users can view their own posture sessions" ON posture_sessions;
DROP POLICY IF EXISTS "Users and managers can view posture sessions" ON posture_sessions;
DROP POLICY IF EXISTS "Managers can view all posture sessions" ON posture_sessions;
DROP POLICY IF EXISTS "Users can view their own posture changes" ON posture_changes;
DROP POLICY IF EXISTS "Users and managers can view posture changes" ON posture_changes;
DROP POLICY IF EXISTS "Managers can view all posture changes" ON posture_changes;

-- RLS: Users view own data OR managers view all
CREATE POLICY "Users and managers can view posture sessions"
  ON posture_sessions FOR SELECT
  USING (auth.uid() = user_id OR public.is_manager());

CREATE POLICY "Users and managers can view posture changes"
  ON posture_changes FOR SELECT
  USING (auth.uid() = user_id OR public.is_manager());

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
