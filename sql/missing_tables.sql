-- ============================================================
-- Missing Tables for DailyQ Supabase Database
-- 8 tables need to be created
-- ============================================================
-- Based on existing tables in Supabase:
-- ✅ analytics_snapshots, dsa_problems, dsa_submissions, exam_questions
-- ✅ exam_results, exams, leaderboard_entries, proctoring_logs
-- ✅ question_bank, user_solved_problems, user_stats, users
-- 
-- ❌ Missing: daily_challenges, user_daily_progress, school_exams,
--            scheduled_exams, scheduled_exam_registrations, notifications,
--            achievements, user_achievements
-- ============================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. DAILY_CHALLENGES TABLE
-- Daily practice challenges
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_challenges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    challenge_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    title VARCHAR(500),
    description TEXT,
    category VARCHAR(100),
    subject VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'mixed',
    question_count INTEGER DEFAULT 10,
    questions JSONB, -- Array of question IDs from question_bank
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for daily challenges
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);

-- ============================================================
-- 2. USER_DAILY_PROGRESS TABLE
-- Track daily practice completion
-- ============================================================
CREATE TABLE IF NOT EXISTS user_daily_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    score DECIMAL(5,2) DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, challenge_date)
);

-- Index for daily progress
CREATE INDEX IF NOT EXISTS idx_user_daily_progress_user_id ON user_daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_progress_date ON user_daily_progress(challenge_date);

-- ============================================================
-- 3. SCHOOL_EXAMS TABLE
-- School-specific exams for Class 1-12
-- ============================================================
CREATE TABLE IF NOT EXISTS school_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_level VARCHAR(20) NOT NULL, -- '1', '2', ..., '12'
    stream VARCHAR(50), -- 'PCM', 'PCB', 'Commerce', 'Arts' for 11-12
    subject VARCHAR(100) NOT NULL,
    chapter VARCHAR(255),
    topic VARCHAR(255),
    exam_type VARCHAR(50) DEFAULT 'practice' CHECK (exam_type IN ('practice', 'unit_test', 'half_yearly', 'annual')),
    questions JSONB, -- Array of question IDs or full questions
    question_count INTEGER DEFAULT 10,
    duration_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for school exams
CREATE INDEX IF NOT EXISTS idx_school_exams_class ON school_exams(class_level);
CREATE INDEX IF NOT EXISTS idx_school_exams_subject ON school_exams(subject);

-- ============================================================
-- 4. SCHEDULED_EXAMS TABLE
-- Scheduled exams with start/end times for live exams
-- ============================================================
CREATE TABLE IF NOT EXISTS scheduled_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    subject VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'medium',
    question_count INTEGER DEFAULT 30,
    duration_minutes INTEGER DEFAULT 60,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    registration_deadline TIMESTAMP WITH TIME ZONE,
    max_participants INTEGER,
    is_active BOOLEAN DEFAULT true,
    is_proctored BOOLEAN DEFAULT false,
    max_violations INTEGER DEFAULT 3,
    passing_score INTEGER DEFAULT 60,
    instructions TEXT,
    questions JSONB, -- Array of questions
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for scheduled exams
CREATE INDEX IF NOT EXISTS idx_scheduled_exams_start_time ON scheduled_exams(start_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_exams_is_active ON scheduled_exams(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_exams_category ON scheduled_exams(category);

-- ============================================================
-- 5. SCHEDULED_EXAM_REGISTRATIONS TABLE
-- Track users registered for scheduled exams
-- ============================================================
CREATE TABLE IF NOT EXISTS scheduled_exam_registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES scheduled_exams(id) ON DELETE CASCADE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered' CHECK (status IN ('registered', 'started', 'completed', 'disqualified')),
    UNIQUE(user_id, exam_id)
);

-- Index for registrations
CREATE INDEX IF NOT EXISTS idx_exam_registrations_exam_id ON scheduled_exam_registrations(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_registrations_user_id ON scheduled_exam_registrations(user_id);

-- ============================================================
-- 6. NOTIFICATIONS TABLE
-- User notifications for exams, results, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) NOT NULL, -- 'exam_reminder', 'result_available', 'streak', 'achievement', etc.
    data JSONB, -- Additional data like exam_id, result_id
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================
-- 7. ACHIEVEMENTS TABLE
-- User achievements and badges
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(50), -- 'streak', 'score', 'completion', 'special'
    criteria JSONB, -- { "type": "streak", "value": 7 }
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8. USER_ACHIEVEMENTS TABLE
-- Track user earned achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Index for user achievements
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_exam_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Daily Challenges: Public read for active
CREATE POLICY "Active challenges are public" ON daily_challenges FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Service role full access challenges" ON daily_challenges FOR ALL USING (auth.role() = 'service_role');

-- User Daily Progress: Users can view their own
CREATE POLICY "Users can view own daily progress" ON user_daily_progress FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access daily progress" ON user_daily_progress FOR ALL USING (auth.role() = 'service_role');

-- School Exams: Public read
CREATE POLICY "School exams are public" ON school_exams FOR SELECT USING (true);
CREATE POLICY "Service role full access school exams" ON school_exams FOR ALL USING (auth.role() = 'service_role');

-- Scheduled Exams: Public read for active
CREATE POLICY "Active scheduled exams are public" ON scheduled_exams FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Service role full access scheduled_exams" ON scheduled_exams FOR ALL USING (auth.role() = 'service_role');

-- Scheduled Exam Registrations: Users can view their own
CREATE POLICY "Users can view own registrations" ON scheduled_exam_registrations FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access registrations" ON scheduled_exam_registrations FOR ALL USING (auth.role() = 'service_role');

-- Notifications: Users can view their own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');

-- Achievements: Public read
CREATE POLICY "Achievements are public" ON achievements FOR SELECT USING (true);
CREATE POLICY "Service role full access achievements" ON achievements FOR ALL USING (auth.role() = 'service_role');

-- User Achievements: Users can view their own
CREATE POLICY "Users can view own achievements" ON user_achievements FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access user achievements" ON user_achievements FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp (if not already created)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to scheduled_exams
CREATE TRIGGER update_scheduled_exams_updated_at BEFORE UPDATE ON scheduled_exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- SAMPLE DATA - ACHIEVEMENTS
-- Insert some default achievements
-- ============================================================
INSERT INTO achievements (name, description, icon, category, criteria, points) VALUES
('First Steps', 'Complete your first quiz', '🎯', 'completion', '{"type": "exams_taken", "value": 1}', 10),
('Quiz Master', 'Complete 50 quizzes', '🏆', 'completion', '{"type": "exams_taken", "value": 50}', 100),
('Perfect Score', 'Get 100% on any quiz', '💯', 'score', '{"type": "perfect_score", "value": 1}', 50),
('Week Warrior', 'Maintain a 7-day streak', '🔥', 'streak', '{"type": "streak", "value": 7}', 75),
('Month Champion', 'Maintain a 30-day streak', '👑', 'streak', '{"type": "streak", "value": 30}', 200),
('DSA Beginner', 'Solve 10 DSA problems', '💻', 'completion', '{"type": "dsa_solved", "value": 10}', 50),
('DSA Expert', 'Solve 100 DSA problems', '🚀', 'completion', '{"type": "dsa_solved", "value": 100}', 250),
('Speed Demon', 'Complete a quiz in under 5 minutes', '⚡', 'special', '{"type": "time_under", "value": 300}', 30),
('Night Owl', 'Complete a quiz after midnight', '🦉', 'special', '{"type": "night_quiz", "value": 1}', 20),
('All Rounder', 'Score above 80% in 5 different subjects', '🌟', 'score', '{"type": "subjects_mastered", "value": 5}', 150)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- VERIFICATION
-- ============================================================
SELECT '✅ All 8 missing tables created successfully!' as status;

-- Check all 19 tables exist (plus analytics_snapshots = 20 total)
SELECT COUNT(*) as total_tables, 
       '(Expected: 19-20 including analytics_snapshots)' as note
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'users', 'user_stats', 'exams', 'exam_questions', 'exam_results',
    'question_bank', 'dsa_problems', 'dsa_submissions', 'user_solved_problems',
    'leaderboard_entries', 'proctoring_logs', 'daily_challenges',
    'user_daily_progress', 'school_exams', 'scheduled_exams',
    'scheduled_exam_registrations', 'notifications', 'achievements',
    'user_achievements'
);
