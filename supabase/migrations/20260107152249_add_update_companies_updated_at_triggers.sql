/*
  # Add triggers to update companies.updated_at

  1. Purpose
    - Automatically update companies.updated_at timestamp when any related data changes
    - Ensures the company card always shows the most recent activity date

  2. Implementation
    - Create a reusable function that updates companies.updated_at
    - Add triggers on all related tables:
      - company_notes (INSERT, UPDATE)
      - company_memos (INSERT, UPDATE, DELETE)
      - selection_events (INSERT, UPDATE, DELETE)
      - selection_progress (INSERT, UPDATE, DELETE)
      - company_reference_sites (INSERT, UPDATE, DELETE)
    
  3. Behavior
    - Any INSERT, UPDATE, or DELETE on related tables will update the parent company's updated_at
    - Uses NEW.company_id or OLD.company_id to identify the parent company
*/

-- Create a function to update companies.updated_at
CREATE OR REPLACE FUNCTION update_company_updated_at()
RETURNS TRIGGER AS $$
DECLARE
  target_company_id uuid;
BEGIN
  -- Determine company_id from the triggering row
  IF TG_OP = 'DELETE' THEN
    target_company_id := OLD.company_id;
  ELSE
    target_company_id := NEW.company_id;
  END IF;

  -- Update the company's updated_at timestamp
  UPDATE companies
  SET updated_at = now()
  WHERE id = target_company_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for company_notes table
DROP TRIGGER IF EXISTS update_company_on_notes_change ON company_notes;
CREATE TRIGGER update_company_on_notes_change
  AFTER INSERT OR UPDATE ON company_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at();

-- Trigger for company_memos table
DROP TRIGGER IF EXISTS update_company_on_memos_change ON company_memos;
CREATE TRIGGER update_company_on_memos_change
  AFTER INSERT OR UPDATE OR DELETE ON company_memos
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at();

-- Trigger for selection_events table
DROP TRIGGER IF EXISTS update_company_on_events_change ON selection_events;
CREATE TRIGGER update_company_on_events_change
  AFTER INSERT OR UPDATE OR DELETE ON selection_events
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at();

-- Trigger for selection_progress table
DROP TRIGGER IF EXISTS update_company_on_progress_change ON selection_progress;
CREATE TRIGGER update_company_on_progress_change
  AFTER INSERT OR UPDATE OR DELETE ON selection_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at();

-- Trigger for company_reference_sites table
DROP TRIGGER IF EXISTS update_company_on_sites_change ON company_reference_sites;
CREATE TRIGGER update_company_on_sites_change
  AFTER INSERT OR UPDATE OR DELETE ON company_reference_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_company_updated_at();