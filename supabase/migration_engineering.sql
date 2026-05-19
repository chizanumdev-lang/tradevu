-- Migration: Add missing fields to engineering_projects
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/rxtyezapzwxgfvovhnce/sql/new

-- 1. Add description, completion_percentage, and impact_score columns if they do not exist
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS completion_percentage INT DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100);
ALTER TABLE engineering_projects ADD COLUMN IF NOT EXISTS impact_score INT DEFAULT 0 CHECK (impact_score BETWEEN 0 AND 100);

-- 2. Populate existing projects with realistic progress and impact values so they aren't empty
UPDATE engineering_projects 
SET 
  completion_percentage = 100, 
  impact_score = 90, 
  description = 'Deployment of multi-currency stablecoin and USD wallet gateways' 
WHERE name = 'USD wallets & transfers';

UPDATE engineering_projects 
SET 
  completion_percentage = 45, 
  impact_score = 80, 
  description = 'Onboarding console and metrics interface for Pay service partners' 
WHERE name = 'Pay Partner Dashboard';

-- 3. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
