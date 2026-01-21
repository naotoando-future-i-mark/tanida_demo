/*
  # Fix RLS Policies for Anonymous Access

  1. Changes
    - Drop existing authenticated-only policies
    - Create new public policies that allow anonymous users
    - Apply to all job hunting tables: companies, company_notes, company_memos, selection_events

  2. Security
    - Allow public access since this is a personal app without user authentication
    - All users can perform CRUD operations on all tables
*/

-- Drop existing policies for companies
DROP POLICY IF EXISTS "Users can view all companies" ON companies;
DROP POLICY IF EXISTS "Users can create companies" ON companies;
DROP POLICY IF EXISTS "Users can update companies" ON companies;
DROP POLICY IF EXISTS "Users can delete companies" ON companies;

-- Create public policies for companies
CREATE POLICY "Anyone can view companies"
  ON companies FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create companies"
  ON companies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update companies"
  ON companies FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete companies"
  ON companies FOR DELETE
  USING (true);

-- Drop existing policies for company_notes
DROP POLICY IF EXISTS "Users can view all company notes" ON company_notes;
DROP POLICY IF EXISTS "Users can create company notes" ON company_notes;
DROP POLICY IF EXISTS "Users can update company notes" ON company_notes;
DROP POLICY IF EXISTS "Users can delete company notes" ON company_notes;

-- Create public policies for company_notes
CREATE POLICY "Anyone can view company notes"
  ON company_notes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create company notes"
  ON company_notes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update company notes"
  ON company_notes FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete company notes"
  ON company_notes FOR DELETE
  USING (true);

-- Drop existing policies for company_memos
DROP POLICY IF EXISTS "Users can view company memos" ON company_memos;
DROP POLICY IF EXISTS "Users can create company memos" ON company_memos;
DROP POLICY IF EXISTS "Users can update company memos" ON company_memos;
DROP POLICY IF EXISTS "Users can delete company memos" ON company_memos;

-- Create public policies for company_memos
CREATE POLICY "Anyone can view company memos"
  ON company_memos FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create company memos"
  ON company_memos FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update company memos"
  ON company_memos FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete company memos"
  ON company_memos FOR DELETE
  USING (true);

-- Drop existing policies for selection_events
DROP POLICY IF EXISTS "Users can view selection events" ON selection_events;
DROP POLICY IF EXISTS "Users can create selection events" ON selection_events;
DROP POLICY IF EXISTS "Users can update selection events" ON selection_events;
DROP POLICY IF EXISTS "Users can delete selection events" ON selection_events;

-- Create public policies for selection_events
CREATE POLICY "Anyone can view selection events"
  ON selection_events FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create selection events"
  ON selection_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update selection events"
  ON selection_events FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete selection events"
  ON selection_events FOR DELETE
  USING (true);