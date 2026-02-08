-- ============================================================
-- Fix exam_results table to support both exams and scheduled_exams
-- ============================================================

-- Step 1: Make exam_id nullable and add scheduled_exam_id column
ALTER TABLE exam_results 
  ALTER COLUMN exam_id DROP NOT NULL;

ALTER TABLE exam_results 
  ADD COLUMN IF NOT EXISTS scheduled_exam_id UUID REFERENCES scheduled_exams(id) ON DELETE CASCADE;

-- Step 2: Add index for scheduled_exam_id
CREATE INDEX IF NOT EXISTS idx_exam_results_scheduled_exam_id ON exam_results(scheduled_exam_id);

-- Step 3: Add constraint to ensure either exam_id or scheduled_exam_id is set
ALTER TABLE exam_results 
  ADD CONSTRAINT exam_results_exam_or_scheduled_check 
  CHECK (
    (exam_id IS NOT NULL AND scheduled_exam_id IS NULL) OR 
    (exam_id IS NULL AND scheduled_exam_id IS NOT NULL)
  );

-- ============================================================
-- Migration complete!
-- Now exam_results can store results for both:
-- - Regular exams (exam_id NOT NULL, scheduled_exam_id NULL)
-- - Scheduled exams (exam_id NULL, scheduled_exam_id NOT NULL)
-- ============================================================
