# SQL Files

This directory contains SQL scripts for the DailyQ database setup.

## Files

### 1. `complete_schema.sql`
**Purpose:** Complete database schema for DailyQ application

**Contains:**
- 21 Core tables (Users, Exams, Questions, DSA, Achievements, etc.)
- NIMCET 2026 exam templates and sections
- Row Level Security (RLS) policies for all tables
- Database triggers and functions
- NIMCET-specific views and functions
- Sample achievement data

**Usage:**
1. Open Supabase Dashboard → SQL Editor
2. Copy the entire content of `complete_schema.sql`
3. Paste and click "Run"
4. Wait for completion message: "✅ DailyQ Database Schema Created Successfully!"

**Run this:** Once during initial setup or when setting up a new environment

---

### 2. `import_nimcet_computer_questions.sql`
**Purpose:** Import 155 historical NIMCET Computer Science questions (2008-2022)

**Contains:**
- 155 questions distributed across 5 subjects:
  - nimcet-computer-fundamentals (31 questions)
  - nimcet-computer-programming (31 questions)
  - nimcet-computer-dbms (31 questions)
  - nimcet-computer-networks (31 questions)
  - nimcet-computer-os (31 questions)

**Usage:**
1. Open Supabase Dashboard → SQL Editor
2. Copy the content of `import_nimcet_computer_questions.sql`
3. Paste and click "Run"
4. Verify with: `SELECT COUNT(*) FROM question_bank WHERE category = 'nimcet'`

**Status:** ✅ Already executed (218 NIMCET questions in database)

**Run this:** Once for data seeding (already done)

---

## Database Tables (21 Total)

1. **users** - User profiles synced from Firebase
2. **user_stats** - Performance statistics and streaks
3. **exams** - Exam definitions (Competitive, Custom, Weekly, School)
4. **exam_questions** - Questions within specific exams
5. **scheduled_exams** - Live scheduled exams with start/end times
6. **scheduled_exam_registrations** - User registrations for scheduled exams
7. **exam_results** - Test submissions and scores
8. **question_bank** - Master question repository (all categories)
9. **dsa_problems** - Data Structures & Algorithms problems
10. **dsa_submissions** - Code submissions for DSA
11. **user_solved_problems** - DSA problem completion tracking
12. **leaderboard_entries** - Rankings by category/period
13. **proctoring_logs** - Exam violation monitoring
14. **daily_challenges** - Daily practice challenges
15. **user_daily_progress** - Daily challenge completion
16. **school_exams** - School exams (Class 1-12)
17. **notifications** - User notifications
18. **achievements** - Achievement definitions
19. **user_achievements** - User earned achievements
20. **exam_templates** - Exam templates (e.g., NIMCET 2026)
21. **exam_sections** - Sections within exam templates

---

## NIMCET 2026 Structure

**Total:** 120 Questions, 1000 Marks, 120 Minutes

### Sections:
1. **Mathematics** - 50 questions × 12 marks = 600 marks (negative: -3)
2. **Analytical Ability & Logical Reasoning** - 40 questions × 8 marks = 320 marks (negative: -2)
3. **Computer Awareness** - 15 questions × 5 marks = 75 marks (negative: -1.25)
4. **General English** - 15 questions × 5 marks = 75 marks (negative: -1.25)

### Available Functions:
- `generate_nimcet_mock_test()` - Returns 40 random questions (10 from each section)
- `nimcet_question_stats` - View showing question distribution by subject

---

## Notes

- All tables have RLS (Row Level Security) enabled
- Service role key bypasses RLS for backend operations
- Questions must be approved (`is_approved = true`) to appear in exams
- Timestamps use `TIMESTAMP WITH TIME ZONE` for proper timezone handling
