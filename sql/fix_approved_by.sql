-- Fix approved_by column type mismatch
-- The column has a foreign key constraint that needs to be dropped first

-- Step 1: Drop the foreign key constraint
ALTER TABLE question_bank DROP CONSTRAINT IF EXISTS question_bank_approved_by_fkey;

-- Step 2: Change the column type from UUID to TEXT
ALTER TABLE question_bank ALTER COLUMN approved_by TYPE TEXT;

-- Verify the change
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'question_bank' AND column_name = 'approved_by';
