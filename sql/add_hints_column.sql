-- Add missing columns to dsa_problems table

-- Add hints column
ALTER TABLE dsa_problems 
ADD COLUMN IF NOT EXISTS hints JSONB DEFAULT '[]'::jsonb;

-- Add is_premium column
ALTER TABLE dsa_problems 
ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;

-- Add solution column
ALTER TABLE dsa_problems 
ADD COLUMN IF NOT EXISTS solution TEXT;

-- Add comments to describe the columns
COMMENT ON COLUMN dsa_problems.hints IS 'Array of hint strings to help users solve the problem';
COMMENT ON COLUMN dsa_problems.is_premium IS 'Whether this problem requires premium subscription';
COMMENT ON COLUMN dsa_problems.solution IS 'Solution code or explanation for the problem';

-- Verify the columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'dsa_problems' AND column_name IN ('hints', 'is_premium', 'solution');
