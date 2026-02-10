-- ============================================================
-- DailyQ - Complete Database Schema
-- Comprehensive SQL setup for all features
-- Run this in Supabase SQL Editor to create all tables, views, and functions
-- ============================================================
-- 
-- This file includes:
-- - 19 Core Tables (Users, Exams, Questions, DSA, Leaderboards, etc.)
-- - NIMCET 2026 Exam Templates & Sections
-- - Row Level Security (RLS) Policies
-- - Triggers & Functions
-- - Sample Achievement Data
-- - NIMCET-specific Views & Functions
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
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'medium',
    subject VARCHAR(100),
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON exam_questions(exam_id);

-- ============================================================
-- 5. SCHEDULED_EXAMS TABLE
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
    questions JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_exams_start_time ON scheduled_exams(start_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_exams_is_active ON scheduled_exams(is_active);
CREATE INDEX IF NOT EXISTS idx_scheduled_exams_category ON scheduled_exams(category);

-- ============================================================
-- 6. SCHEDULED_EXAM_REGISTRATIONS TABLE
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

CREATE INDEX IF NOT EXISTS idx_exam_registrations_exam_id ON scheduled_exam_registrations(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_registrations_user_id ON scheduled_exam_registrations(user_id);

-- ============================================================
-- 7. EXAM_RESULTS TABLE
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
    answers JSONB,
    time_per_question JSONB,
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

CREATE INDEX IF NOT EXISTS idx_exam_results_user_id ON exam_results(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_exam_id ON exam_results(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_scheduled_exam_id ON exam_results(scheduled_exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_results_score ON exam_results(score DESC);
CREATE INDEX IF NOT EXISTS idx_exam_results_submitted_at ON exam_results(submitted_at);

-- ============================================================
-- 8. QUESTION_BANK TABLE
-- Master question repository for all categories
-- ============================================================
CREATE TABLE IF NOT EXISTS question_bank (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer INTEGER NOT NULL,
    subject VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    explanation TEXT,
    source VARCHAR(255) DEFAULT 'manual',
    source_file VARCHAR(255),
    tags JSONB,
    hints JSONB DEFAULT '[]'::jsonb,
    is_approved BOOLEAN DEFAULT false,
    approved_by TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_question_bank_subject ON question_bank(subject);
CREATE INDEX IF NOT EXISTS idx_question_bank_category ON question_bank(category);
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty ON question_bank(difficulty);
CREATE INDEX IF NOT EXISTS idx_question_bank_is_approved ON question_bank(is_approved);
CREATE INDEX IF NOT EXISTS idx_question_bank_search ON question_bank USING gin(to_tsvector('english', question_text));

-- ============================================================
-- 9. DSA_PROBLEMS TABLE
-- Data Structures & Algorithms problems
-- ============================================================
CREATE TABLE IF NOT EXISTS dsa_problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    topics JSONB,
    examples JSONB NOT NULL,
    constraints TEXT,
    starter_code JSONB,
    test_cases JSONB NOT NULL,
    hidden_test_cases JSONB,
    companies JSONB,
    hints JSONB DEFAULT '[]'::jsonb,
    solution TEXT,
    acceptance_rate DECIMAL(5,2) DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    total_accepted INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dsa_problems_slug ON dsa_problems(slug);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_difficulty ON dsa_problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_dsa_problems_topics ON dsa_problems USING gin(topics);

-- ============================================================
-- 10. DSA_SUBMISSIONS TABLE
-- User code submissions for DSA problems
-- ============================================================
CREATE TABLE IF NOT EXISTS dsa_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES dsa_problems(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    language VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('accepted', 'wrong_answer', 'time_limit_exceeded', 'runtime_error', 'compilation_error', 'pending')),
    runtime_ms INTEGER,
    memory_kb INTEGER,
    test_cases_passed INTEGER DEFAULT 0,
    test_cases_total INTEGER DEFAULT 0,
    error_message TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dsa_submissions_user_id ON dsa_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_problem_id ON dsa_submissions(problem_id);
CREATE INDEX IF NOT EXISTS idx_dsa_submissions_status ON dsa_submissions(status);

-- ============================================================
-- 11. USER_SOLVED_PROBLEMS TABLE
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

CREATE INDEX IF NOT EXISTS idx_user_solved_user_id ON user_solved_problems(user_id);

-- ============================================================
-- 12. LEADERBOARD_ENTRIES TABLE
-- Rankings for various categories and time periods
-- ============================================================
CREATE TABLE IF NOT EXISTS leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    subcategory VARCHAR(100),
    score DECIMAL(10,2) DEFAULT 0,
    total_attempts INTEGER DEFAULT 0,
    accuracy DECIMAL(5,2) DEFAULT 0,
    period VARCHAR(20) DEFAULT 'all_time' CHECK (period IN ('daily', 'weekly', 'monthly', 'all_time')),
    rank INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, category, subcategory, period)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_category ON leaderboard_entries(category);
CREATE INDEX IF NOT EXISTS idx_leaderboard_period ON leaderboard_entries(period);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard_entries(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON leaderboard_entries(score DESC);

-- ============================================================
-- 13. PROCTORING_LOGS TABLE
-- Exam monitoring and violation tracking
-- ============================================================
CREATE TABLE IF NOT EXISTS proctoring_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    violation_count INTEGER DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proctoring_user_id ON proctoring_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_exam_id ON proctoring_logs(exam_id);
CREATE INDEX IF NOT EXISTS idx_proctoring_event_type ON proctoring_logs(event_type);

-- ============================================================
-- 14. DAILY_CHALLENGES TABLE
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
    questions JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);

-- ============================================================
-- 15. USER_DAILY_PROGRESS TABLE
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

CREATE INDEX IF NOT EXISTS idx_user_daily_progress_user_id ON user_daily_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_progress_date ON user_daily_progress(challenge_date);

-- ============================================================
-- 16. SCHOOL_EXAMS TABLE
-- School-specific exams for Class 1-12
-- ============================================================
CREATE TABLE IF NOT EXISTS school_exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_level VARCHAR(20) NOT NULL,
    stream VARCHAR(50),
    subject VARCHAR(100) NOT NULL,
    chapter VARCHAR(255),
    topic VARCHAR(255),
    exam_type VARCHAR(50) DEFAULT 'practice' CHECK (exam_type IN ('practice', 'unit_test', 'half_yearly', 'annual')),
    questions JSONB,
    question_count INTEGER DEFAULT 10,
    duration_minutes INTEGER DEFAULT 30,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_school_exams_class ON school_exams(class_level);
CREATE INDEX IF NOT EXISTS idx_school_exams_subject ON school_exams(subject);

-- ============================================================
-- 17. NOTIFICATIONS TABLE
-- User notifications for exams, results, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type VARCHAR(50) NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ============================================================
-- 18. ACHIEVEMENTS TABLE
-- User achievements and badges
-- ============================================================
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    category VARCHAR(50),
    criteria JSONB,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 19. USER_ACHIEVEMENTS TABLE
-- Track user earned achievements
-- ============================================================
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- ============================================================
-- 20. EXAM_TEMPLATES TABLE (NIMCET 2026)
-- Exam templates for structured exams like NIMCET
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_code VARCHAR(50) UNIQUE NOT NULL,
    exam_name VARCHAR(200) NOT NULL,
    total_questions INTEGER NOT NULL,
    total_marks INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 21. EXAM_SECTIONS TABLE (NIMCET 2026)
-- Sections within exam templates
-- ============================================================
CREATE TABLE IF NOT EXISTS exam_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_template_id UUID REFERENCES exam_templates(id) ON DELETE CASCADE,
    section_name VARCHAR(100) NOT NULL,
    section_order INTEGER NOT NULL,
    question_count INTEGER NOT NULL,
    marks_per_question DECIMAL(5,2) NOT NULL,
    negative_marks DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

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

-- Users
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = firebase_uid OR auth.role() = 'service_role');
CREATE POLICY "Service role full access users" ON users FOR ALL USING (auth.role() = 'service_role');

-- User Stats
CREATE POLICY "Users can view own stats" ON user_stats FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access stats" ON user_stats FOR ALL USING (auth.role() = 'service_role');

-- Exams
CREATE POLICY "Active exams are public" ON exams FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Service role full access exams" ON exams FOR ALL USING (auth.role() = 'service_role');

-- Exam Questions
CREATE POLICY "Exam questions visible for active exams" ON exam_questions FOR SELECT USING (exam_id IN (SELECT id FROM exams WHERE is_active = true) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access exam_questions" ON exam_questions FOR ALL USING (auth.role() = 'service_role');

-- Exam Results
CREATE POLICY "Users can view own results" ON exam_results FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access results" ON exam_results FOR ALL USING (auth.role() = 'service_role');

-- Question Bank
CREATE POLICY "Service role full access question_bank" ON question_bank FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Approved questions are public" ON question_bank FOR SELECT USING (is_approved = true OR auth.role() = 'service_role');

-- DSA Problems
CREATE POLICY "DSA problems are public" ON dsa_problems FOR SELECT USING (true);
CREATE POLICY "Service role full access dsa_problems" ON dsa_problems FOR ALL USING (auth.role() = 'service_role');

-- DSA Submissions
CREATE POLICY "Users can view own submissions" ON dsa_submissions FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access submissions" ON dsa_submissions FOR ALL USING (auth.role() = 'service_role');

-- Leaderboard
CREATE POLICY "Leaderboard is public" ON leaderboard_entries FOR SELECT USING (true);
CREATE POLICY "Service role full access leaderboard" ON leaderboard_entries FOR ALL USING (auth.role() = 'service_role');

-- Daily Challenges
CREATE POLICY "Active challenges are public" ON daily_challenges FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Service role full access challenges" ON daily_challenges FOR ALL USING (auth.role() = 'service_role');

-- Notifications
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access notifications" ON notifications FOR ALL USING (auth.role() = 'service_role');

-- Achievements
CREATE POLICY "Achievements are public" ON achievements FOR SELECT USING (true);
CREATE POLICY "Service role full access achievements" ON achievements FOR ALL USING (auth.role() = 'service_role');

-- Scheduled Exams
CREATE POLICY "Active scheduled exams are public" ON scheduled_exams FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Service role full access scheduled_exams" ON scheduled_exams FOR ALL USING (auth.role() = 'service_role');

-- Scheduled Exam Registrations
CREATE POLICY "Users can view own registrations" ON scheduled_exam_registrations FOR SELECT USING (user_id IN (SELECT id FROM users WHERE firebase_uid = auth.uid()::text) OR auth.role() = 'service_role');
CREATE POLICY "Service role full access registrations" ON scheduled_exam_registrations FOR ALL USING (auth.role() = 'service_role');

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_stats_updated_at BEFORE UPDATE ON user_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_question_bank_updated_at BEFORE UPDATE ON question_bank FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_dsa_problems_updated_at BEFORE UPDATE ON dsa_problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update DSA problem acceptance rate
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

-- ============================================================
-- NIMCET 2026 SETUP
-- ============================================================

-- Insert NIMCET 2026 Exam Template
INSERT INTO exam_templates (exam_code, exam_name, total_questions, total_marks, duration_minutes)
VALUES ('NIMCET-2026', 'NIT MCA Common Entrance Test 2026', 120, 1000, 120)
ON CONFLICT (exam_code) DO UPDATE SET
    exam_name = EXCLUDED.exam_name,
    total_questions = EXCLUDED.total_questions,
    total_marks = EXCLUDED.total_marks,
    updated_at = NOW();

-- Insert NIMCET 2026 Sections
INSERT INTO exam_sections (exam_template_id, section_name, section_order, question_count, marks_per_question, negative_marks)
SELECT 
    id,
    section_name,
    section_order,
    question_count,
    marks_per_question,
    negative_marks
FROM exam_templates, (VALUES
    ('Mathematics', 1, 50, 12.00, -3.00),
    ('Analytical Ability & Logical Reasoning', 2, 40, 8.00, -2.00),
    ('Computer Awareness', 3, 15, 5.00, -1.25),
    ('General English', 4, 15, 5.00, -1.25)
) AS sections(section_name, section_order, question_count, marks_per_question, negative_marks)
WHERE exam_code = 'NIMCET-2026'
ON CONFLICT DO NOTHING;

-- ============================================================
-- NIMCET VIEWS & FUNCTIONS
-- ============================================================

-- View: NIMCET question statistics
CREATE OR REPLACE VIEW nimcet_question_stats AS
SELECT 
    category,
    subject,
    difficulty,
    COUNT(*) as question_count,
    SUM(CASE WHEN is_approved THEN 1 ELSE 0 END) as approved_count
FROM question_bank
WHERE category LIKE 'nimcet%'
GROUP BY category, subject, difficulty
ORDER BY category, subject, difficulty;

-- Function: Generate NIMCET Mock Test (40 questions)
CREATE OR REPLACE FUNCTION generate_nimcet_mock_test(difficulty_level VARCHAR DEFAULT 'medium')
RETURNS TABLE (
    id UUID,
    question_text TEXT,
    options JSONB,
    correct_answer INTEGER,
    category VARCHAR,
    subject VARCHAR,
    section_name VARCHAR,
    marks DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    (
        -- Mathematics (10 questions)
        SELECT 
            q.id,
            q.question_text,
            q.options::JSONB,
            q.correct_answer,
            q.category,
            q.subject,
            'Mathematics'::VARCHAR as section_name,
            12.00::DECIMAL as marks
        FROM question_bank q
        WHERE q.category = 'nimcet'
          AND q.subject LIKE 'nimcet-math%'
          AND q.is_approved = true
          AND (difficulty_level = 'all' OR q.difficulty = difficulty_level)
        ORDER BY RANDOM()
        LIMIT 10
    )
    UNION ALL
    (
        -- Analytical Reasoning (10 questions)
        SELECT 
            q.id,
            q.question_text,
            q.options::JSONB,
            q.correct_answer,
            q.category,
            q.subject,
            'Analytical Reasoning'::VARCHAR as section_name,
            8.00::DECIMAL as marks
        FROM question_bank q
        WHERE q.category = 'nimcet'
          AND q.subject LIKE 'nimcet-reasoning%'
          AND q.is_approved = true
          AND (difficulty_level = 'all' OR q.difficulty = difficulty_level)
        ORDER BY RANDOM()
        LIMIT 10
    )
    UNION ALL
    (
        -- Computer (10 questions)
        SELECT 
            q.id,
            q.question_text,
            q.options::JSONB,
            q.correct_answer,
            q.category,
            q.subject,
            'Computer Awareness'::VARCHAR as section_name,
            5.00::DECIMAL as marks
        FROM question_bank q
        WHERE q.category = 'nimcet'
          AND q.subject LIKE 'nimcet-computer%'
          AND q.is_approved = true
          AND (difficulty_level = 'all' OR q.difficulty = difficulty_level)
        ORDER BY RANDOM()
        LIMIT 10
    )
    UNION ALL
    (
        -- General English (10 questions)
        SELECT 
            q.id,
            q.question_text,
            q.options::JSONB,
            q.correct_answer,
            q.category,
            q.subject,
            'General English'::VARCHAR as section_name,
            5.00::DECIMAL as marks
        FROM question_bank q
        WHERE q.category = 'nimcet'
          AND q.subject LIKE 'nimcet-english%'
          AND q.is_approved = true
          AND (difficulty_level = 'all' OR q.difficulty = difficulty_level)
        ORDER BY RANDOM()
        LIMIT 10
    );
END;
$$ LANGUAGE plpgsql;

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
-- COMPLETION MESSAGE
-- ============================================================
DO $$
BEGIN
    RAISE NOTICE '✅ DailyQ Database Schema Created Successfully!';
    RAISE NOTICE '📊 Total Tables: 21';
    RAISE NOTICE '🎓 NIMCET 2026 Setup Complete';
    RAISE NOTICE '🔒 RLS Policies Enabled';
    RAISE NOTICE '⚡ Triggers & Functions Configured';
END $$;
