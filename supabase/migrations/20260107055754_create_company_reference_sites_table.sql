/*
  # Create company reference sites table

  1. New Tables
    - `company_reference_sites`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key to companies)
      - `memo_id` (uuid, nullable, foreign key to company_memos) - which memo this site relates to
      - `name` (text) - user-defined name for the site
      - `url` (text) - the URL of the reference site
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `company_reference_sites` table
    - Add policy for anonymous users to manage their company reference sites
*/

CREATE TABLE IF NOT EXISTS company_reference_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  memo_id uuid REFERENCES company_memos(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  url text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE company_reference_sites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view company reference sites"
  ON company_reference_sites
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert company reference sites"
  ON company_reference_sites
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update company reference sites"
  ON company_reference_sites
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete company reference sites"
  ON company_reference_sites
  FOR DELETE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_company_reference_sites_company_id ON company_reference_sites(company_id);
CREATE INDEX IF NOT EXISTS idx_company_reference_sites_memo_id ON company_reference_sites(memo_id);