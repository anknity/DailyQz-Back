-- ============================================================
-- DailyQ - Supabase Database Schema
-- Complete SQL setup for all features
-- Run this in Supabase SQL Editor to create all tables
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USERS TABLE
-- Stores user profiles synced from Firebase Auth
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    supabase_uid UUID,
    email VARCHAR(255),
    phone VARCHAR(20),
    display_name VARCHAR(255),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('guest', 'user', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster Firebase UID lookups
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================================
-- 2. USER_STATS TABLE
-- User performance statistics and progress tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_exams_taken INTEGER DEFAULT 0,
    total_questions_attempted INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    total_dsa_solved INTEGER DEFAULT 0,
    dsa_easy_solved INTEGER DEFAULT 0,
    dsa_medium_solved INTEGER DEFAULT 0,
    dsa_hard_solved INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    global_rank INTEGER,
    ai_skill_score INTEGER DEFAULT 0,
    last_activity_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Index for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_user_stats_global_rank ON user_stats(global_rank);
CREATE INDEX IF NOT EXISTS idx_user_stats_ai_score ON user_stats(ai_skill_score DESC);

-- ============================================================
-- 3. EXAMS TABLE
-- Exam definitions (Competitive, Government, Custom, Weekly, School)
-- ============================================================
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL CHECK (category IN ('competitive', 'government', 'custom', 'weekly', 'school', 'daily')),
    subject VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
    question_count INTEGER DEFAULT 0,
    duration_minutes INTEGER DEFAULT 30,
    passing_score INTEGER DEFAULT 60,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    is_proctored BOOLEAN DEFAULT false,
    max_violations INTEGER DEFAULT 3,
    instructions TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS idx_exams_category ON exams(category);
CREATE INDEX IF NOT EXISTS idx_exams_subject ON exams(subject);
CREATE INDEX IF NOT EXISTS idx_exams_is_active ON exams(is_active);
CREATE INDEX IF NOT EXISTS idx_exams_start_time ON exams(start_time);

-- ============================================================
-- 4. EXAM_QUESTIONS TABLE
-- Questions within specific exams
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of options
    correct_answer INTEGER NOT NULL, -- 0-indexed
    difficulty VARCHAR(20) DEFAULT 'medium',
    subject VARCHAR(100),
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for exam question retrieval
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);

-- ============================================================
-- 5. EXAM_RESULTS TABLE
-- User exam submissions and scores
-- Supports both regular exams and scheduled exams
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    scheduled_exam_id UUID REFERENCES scheduled_exams(id) ON DELETE CASCADE,
    score DECIMAL(5,2) NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER NOT NULL,
    wrong_answers INTEGER NOT NULL,
    unanswered INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2),
    time_taken_seconds INTEGER,
    answers JSONB, -- { "question_id": selected_answer }
    time_per_question JSONB, -- { "question_id": seconds }
    violation_count INTEGER DEFAULT 0,
    is_disqualified BOOLEAN DEFAULT false,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT exam_results_exam_or_scheduled_check 
      CHECK (
        (exam_id IS NOT NULL AND scheduled_exam_id IS NULL) OR 
        (exam_id IS NULL AND scheduled_exam_id IS NOT NULL)
      )
);

-- Indexes for result queries
CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_scheduled_exam_id ON exam_results(scheduled_exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_score ON exam_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_exam_results_submitted_at ON exam_results(submitted_at);

-- ============================================================
-- 6. QUESTION_BANK TABLE
-- Master question repository for all categories
-- ============================================================
CREATE TABLE IF NOT EXISTS question_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of options
    correct_answer INTEGER NOT NULL, -- 0-indexed
    subject VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL, -- 'jee', 'neet', 'school-10', 'banking', etc.
    subcategory VARCHAR(100), -- 'physics', 'chemistry', etc.
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    explanation TEXT,
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('ai_generated', 'pdf_parsed', 'manual', 'bulk_upload', 'api')),
    source_file VARCHAR(255),
    tags JSONB, -- Additional tags for filtering
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for question retrieval
CREATE INDEX IF NOT EXISTS idx_question_bank_subject ON question_bank(subject);
CREATE INDEX IF NOT EXISTS idx_question_bank_category ON question_bank(category);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_is_approved ON question_bank(is_approved);

-- Full-text search on questions
CREATE INDEX IF NOT EXISTS idx_question_bank_search ON question_bank USING gin(to_tsvector('english', question_text));

-- ============================================================
-- 7. DSA_PROBLEMS TABLE
-- Data Structures & Algorithms problems
-- ============================================================
CREATE TABLE IF NOT EXISTS dsa_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    topics JSONB, -- Array of topics like ['arrays', 'dynamic-programming']
    examples JSONB NOT NULL, -- Array of { input, output, explanation }
    constraints TEXT,
    starter_code JSONB, -- { "python": "...", "javascript": "...", "java": "..." }
    test_cases JSONB NOT NULL, -- Visible test cases
    hidden_test_cases JSONB, -- Hidden test cases for validation
    companies JSONB, -- Companies that asked this question
    hints JSONB, -- Array of hints
    solution TEXT,
    acceptance_rate DECIMAL(5,2) DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    total_accepted INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for DSA problems
CREATE INDEX IF NOT EXISTS idx_dsa_problems_slug ON dsa_problems(slug);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_difficulty ON dsa_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_topics ON dsa_problems USING gin(topics);

-- ============================================================
-- 8. DSA_SUBMISSIONS TABLE
-- User code submissions for DSA problems
-- ============================================================
CREATE TABLE IF NOT EXISTS dsa_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES dsa_problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL, -- 'python', 'javascript', 'java', 'cpp'
    status VARCHAR(50) NOT NULL CHECK (status IN ('accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error', 'pending')),
    runtime_ms INTEGER,
    memory_kb INTEGER,
    test_cases_passed INTEGER DEFAULT 0,
    test_cases_total INTEGER DEFAULT 0,
    error_message TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for submissions
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_user_id ON dsa_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_problem_id ON dsa_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_status ON dsa_submissions(status);

-- ============================================================
-- 9. USER_SOLVED_PROBLEMS TABLE
-- Track which DSA problems users have solved
-- ============================================================
CREATE TABLE IF NOT EXISTS user_solved_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES dsa_problems(id) ON DELETE CASCADE,
    first_solved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    best_runtime_ms INTEGER,
    best_memory_kb INTEGER,
    attempts INTEGER DEFAULT 1,
    UNIQUE(user_id, problem_id)
);

-- Index for user progress
CREATE INDEX IF NOT EXISTS idx_user_solved_user_id ON user_solved_problems(user_id);

-- ============================================================
-- 10. LEADERBOARD_ENTRIES TABLE
-- Rankings for various categories and time periods
-- ============================================================
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL, -- 'daily', 'exam', 'subject', 'dsa', 'global'
    subcategory VARCHAR(100), -- 'mathematics', 'physics', 'jee', etc.
    score DECIMAL(10,2) DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    period VARCHAR(20) DEFAULT 'all_time' CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, subcategory, period)
);

-- Indexes for leaderboard queries
CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON leaderboard_entries(category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_entries(period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_entries(score DESC);

-- ============================================================
-- 11. PROCTORING_LOGS TABLE
-- Exam monitoring and violation tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS proctoring_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'tab_switch', 'face_not_detected', 'copy_paste', 'multiple_faces', etc.
    event_data JSONB, -- Additional event details
    violation_count INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for proctoring logs
CREATE INDEX IF NOT EXISTS idx_proctoring_user_id ON proctoring_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_exam_id ON proctoring_logs(exam_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_event_type ON proctoring_logs(event_type);

-- ============================================================
-- 12. DAILY_CHALLENGES TABLE (NEW)
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
-- 13. USER_DAILY_PROGRESS TABLE (NEW)
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
-- 14. SCHOOL_EXAMS TABLE (NEW)
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
-- 15. SCHEDULED_EXAMS TABLE (NEW)
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
-- 16. SCHEDULED_EXAM_REGISTRATIONS TABLE (NEW)
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
-- 17. NOTIFICATIONS TABLE (NEW)
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
-- 18. ACHIEVEMENTS TABLE (NEW)
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
-- 19. USER_ACHIEVEMENTS TABLE (NEW)
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsa_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE dsa_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_solved_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE proctoring_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_exam_registrations ENABLE ROW LEVEL SECURITY;

-- Users: Can read their own data, service role can do everything
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = firebase_uid OR auth.role() = 'service_role');
CREATE POLICY "Service role full access users" ON users FOR ALL USING (auth.role() = 'service_role');

-- User Stats: Users can view their own stats
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access stats" ON user_stats FOR ALL USING (auth.role() = 'service_role');

-- Exams: Public read for active exams
CREATE POLICY "Active exams are public" ON exams FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Service role full access exams" ON exams FOR ALL USING (auth.role() = 'service_role');

-- Exam Questions: Visible during active exam
CREATE POLICY "Exam questions visible for active exams" ON exam_questions FOR SELECT USING (exam_id IN (SELECT id FROM exams WHERE is_active = true) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access exam_questions" ON exam_questions FOR ALL USING (auth.role() = 'service_role');

-- Exam Results: Users can view their own results
CREATE POLICY "Users can view own results" ON exam_results FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access results" ON exam_results FOR ALL USING (auth.role() = 'service_role');

-- Question Bank: Service role only for management
CREATE POLICY "Service role full access question_bank" ON question_bank FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Approved questions are public" ON question_bank FOR SELECT USING (is_approved = true OR auth.role() = 'service_role');

-- DSA Problems: Public read
CREATE POLICY "DSA problems are public" ON dsa_problems FOR SELECT USING (true);
CREATE POLICY "Service role full access dsa_problems" ON dsa_problems FOR ALL USING (auth.role() = 'service_role');

-- DSA Submissions: Users can view their own
CREATE POLICY "Users can view own submissions" ON dsa_submissions FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access submissions" ON dsa_submissions FOR ALL USING (auth.role() = 'service_role');

-- Leaderboard: Public read
CREATE POLICY "Leaderboard is public" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Service role full access leaderboard" ON leaderboard_entries FOR ALL USING (auth.role() = 'service_role');

-- Daily Challenges: Public read for active
CREATE POLICY "Active challenges are public" ON daily_challenges FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Service role full access challenges" ON daily_challenges FOR ALL USING (auth.role() = 'service_role');

-- Notifications: Users can view their own
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');

-- Achievements: Public read
CREATE POLICY "Achievements are public" ON achievements FOR SELECT USING (true);
CREATE POLICY "Service role full access achievements" ON achievements FOR ALL USING (auth.role() = 'service_role');

-- Scheduled Exams: Public read for active
CREATE POLICY "Active scheduled exams are public" ON scheduled_exams FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Service role full access scheduled_exams" ON scheduled_exams FOR ALL USING (auth.role() = 'service_role');

-- Scheduled Exam Registrations: Users can view their own
CREATE POLICY "Users can view own registrations" ON scheduled_exam_registrations FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access registrations" ON scheduled_exam_registrations FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_bank_updated_at BEFORE UPDATE ON question_bank FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dsa_problems_updated_at BEFORE UPDATE ON dsa_problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update DSA problem acceptance rate
CREATE OR REPLACE FUNCTION update_dsa_acceptance_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE dsa_problems
    SET 
        total_submissions = total_submissions + 1,
        total_accepted = total_accepted + CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END,
        acceptance_rate = (total_accepted + CASE WHEN NEW.status = 'accepted' THEN 1 ELSE 0 END)::DECIMAL / (total_submissions + 1) * 100
    WHERE id = NEW.problem_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_acceptance_rate AFTER INSERT ON dsa_submissions FOR EACH ROW EXECUTE FUNCTION update_dsa_acceptance_rate();

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    last_date DATE;
    current_user_streak INTEGER;
BEGIN
    SELECT last_activity_date, current_streak INTO last_date, current_user_streak
    FROM user_stats WHERE user_id = NEW.user_id;
    
    IF last_date IS NULL OR last_date < CURRENT_DATE - INTERVAL '1 day' THEN
        -- Streak broken, reset to 1
        UPDATE user_stats SET current_streak = 1, last_activity_date = CURRENT_DATE WHERE user_id = NEW.user_id;
    ELSIF last_date = CURRENT_DATE - INTERVAL '1 day' THEN
        -- Consecutive day, increment streak
        UPDATE user_stats SET 
            current_streak = current_streak + 1,
            max_streak = GREATEST(max_streak, current_streak + 1),
            last_activity_date = CURRENT_DATE
        WHERE user_id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================
-- SAMPLE DATA - ACHIEVEMENTS
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
-- VERIFICATION QUERIES
-- Run these to verify tables were created successfully
-- ============================================================
/*
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Expected tables (19 total):
-- achievements
-- daily_challenges
-- dsa_problems
-- dsa_submissions
-- exam_questions
-- exam_results
-- exams
-- leaderboard_entries
-- notifications
-- proctoring_logs
-- question_bank
-- scheduled_exam_registrations
-- scheduled_exams
-- school_exams
-- user_achievements
-- user_daily_progress
-- user_solved_problems
-- user_stats
-- users
*/

-- ============================================================
-- END OF SCHEMA
-- ============================================================
