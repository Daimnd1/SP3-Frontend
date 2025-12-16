-- Posture Tracking Tables for Reports Feature
-- Run this in Supabase SQL Editor

-- Table: posture_sessions
-- Stores each sitting/standing session with duration and height info
CREATE TABLE IF NOT EXISTS posture_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  desk_id UUID NOT NULL REFERENCES desks(id) ON DELETE CASCADE,
  mode TEXT NOT NULL CHECK (mode IN ('sitting', 'standing')),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  start_height_mm INTEGER NOT NULL,
  end_height_mm INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: posture_changes
-- Logs each transition between sitting and standing
CREATE TABLE IF NOT EXISTS posture_changes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  desk_id UUID NOT NULL REFERENCES desks(id) ON DELETE CASCADE,
  from_mode TEXT CHECK (from_mode IN ('sitting', 'standing')),
  to_mode TEXT NOT NULL CHECK (to_mode IN ('sitting', 'standing')),
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  height_mm INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_posture_sessions_user_start ON posture_sessions(user_id, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_posture_sessions_desk ON posture_sessions(desk_id);
CREATE INDEX IF NOT EXISTS idx_posture_changes_user_changed ON posture_changes(user_id, changed_at DESC);

-- Row Level Security Policies
ALTER TABLE posture_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE posture_changes ENABLE ROW LEVEL SECURITY;

-- RLS: posture_sessions
CREATE POLICY "Users can view their own posture sessions"
  ON posture_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posture sessions"
  ON posture_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posture sessions"
  ON posture_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS: posture_changes
CREATE POLICY "Users can view their own posture changes"
  ON posture_changes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own posture changes"
  ON posture_changes FOR INSERT
  WITH CHECK (auth.uid() = user_id);