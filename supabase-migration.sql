-- ==========================================
-- NodePath P1 Database Migration Schema
-- ==========================================

-- 1. Profiles Table (User Profile & Streak)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  username TEXT,
  avatar_url TEXT,
  streak_count INT DEFAULT 0,
  last_active_date DATE
);

-- 2. User Progress Table (Full Snapshot per Course)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id)
);

-- 3. Normalized Question Attempts Table (Granular Analytics & Spaced Repetition)
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  last_selected_option_id TEXT,
  attempts_count INT DEFAULT 1,
  is_first_try_correct BOOLEAN DEFAULT false,
  easiness_factor NUMERIC(3,2) DEFAULT 2.50,
  interval_days INT DEFAULT 1,
  next_review_at TIMESTAMP WITH TIME ZONE,
  review_state TEXT DEFAULT 'new',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, course_id, question_id)
);

-- Indexes for Fast Querying
CREATE INDEX IF NOT EXISTS idx_user_progress_user_course ON public.user_progress(user_id, course_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_review ON public.question_attempts(user_id, course_id, next_review_at);
CREATE INDEX IF NOT EXISTS idx_question_attempts_state ON public.question_attempts(user_id, review_state);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies: User Progress
CREATE POLICY "Users can view their own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies: Question Attempts
CREATE POLICY "Users can view own question attempts"
  ON public.question_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update own question attempts"
  ON public.question_attempts FOR ALL
  USING (auth.uid() = user_id);
