/*
  # Fix triggers for tables using company_note_id
  
  1. Problem
    - The update_company_updated_at() function assumes all tables have a company_id field
    - Tables like selection_progress, selection_events, and company_memos have company_note_id instead
    - This causes "record \"new\" has no field \"company_id\"" error
  
  2. Solution
    - Create separate trigger functions for tables with company_note_id
    - These functions will:
      a) Get the company_note_id from the triggering row
      b) Join with company_notes to find the company_id
      c) Update the company's updated_at timestamp
  
  3. Changes
    - Keep original update_company_updated_at() for company_notes and company_reference_sites
    - Create new update_company_updated_at_via_note() for other tables
    - Update triggers to use the correct function
*/

-- Create a function to update companies.updated_at via company_note_id
CREATE OR REPLACE FUNCTION update_company_updated_at_via_note()
RETURNS TRIGGER AS $$
DECLARE
  target_company_note_id uuid;
  target_company_id uuid;
BEGIN
  -- Determine company_note_id from the triggering row
  IF TG_OP = 'DELETE' THEN
    target_company_note_id := OLD.company_note_id;
  ELSE
    target_company_note_id := NEW.company_note_id;
  END IF;

  -- Get the company_id from company_notes
  SELECT company_id INTO target_company_id
  FROM company_notes
  WHERE id = target_company_note_id;

  -- Update the company's updated_at timestamp if found
  IF target_company_id IS NOT NULL THEN
    UPDATE companies
    SET updated_at = now()
    WHERE id = target_company_id;
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Update trigger for company_memos table to use new function
DROP TRIGGER IF EXISTS update_company_on_memos_change ON company_memos;
CREATE TRIGGER update_company_on_memos_change
  AFTER INSERT OR UPDATE OR DELETE ON company_memos
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at_via_note();

-- Update trigger for selection_events table to use new function
DROP TRIGGER IF EXISTS update_company_on_events_change ON selection_events;
CREATE TRIGGER update_company_on_events_change
  AFTER INSERT OR UPDATE OR DELETE ON selection_events
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at_via_note();

-- Update trigger for selection_progress table to use new function
DROP TRIGGER IF EXISTS update_company_on_progress_change ON selection_progress;
CREATE TRIGGER update_company_on_progress_change
  AFTER INSERT OR UPDATE OR DELETE ON selection_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at_via_note();
