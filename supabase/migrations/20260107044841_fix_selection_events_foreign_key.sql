/*
  # Fix selection_events to reference company_notes instead of job_notes

  1. Changes
    - Remove foreign key constraint to job_notes
    - Drop job_note_id column
    - Add company_note_id column referencing company_notes
    - Update RLS policies if needed

  2. Security
    - Maintain RLS on selection_events table
*/

-- Remove existing foreign key constraint
ALTER TABLE selection_events 
DROP CONSTRAINT IF EXISTS selection_events_job_note_id_fkey;

-- Drop the old column
ALTER TABLE selection_events 
DROP COLUMN IF EXISTS job_note_id;

-- Add new column referencing company_notes
ALTER TABLE selection_events 
ADD COLUMN IF NOT EXISTS company_note_id uuid REFERENCES company_notes(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_selection_events_company_note_id 
ON selection_events(company_note_id);
