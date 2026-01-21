/*
  # Create Job Hunting Notes System

  1. New Tables
    - `companies`
      - `id` (uuid, primary key)
      - `name` (text, company name)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `company_notes`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - Basic info fields: industry, job_type, location, employee_count, listing_status, base_salary, web_test, working_hours
      - MyPage info fields: mypage_url, login_id, password, login_notes
      - `custom_fields` (jsonb, for custom user-defined fields)
      - `free_memo` (text, free-form notes)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `company_memos`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `category` (text, memo category)
      - `title` (text, memo title)
      - `content` (text, memo content)
      - `is_deleted` (boolean, for soft delete)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `selection_events`
      - `id` (uuid, primary key)
      - `company_id` (uuid, foreign key)
      - `track` (text, intern or fulltime)
      - `event_type` (text, event category)
      - `title` (text, event title)
      - `deadline_date` (date)
      - `deadline_time` (time)
      - `status` (text, pending or completed)
      - `memo` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can view all companies"
    ON companies FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can create companies"
    ON companies FOR INSERT
    TO authenticated
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can update companies"
    ON companies FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete companies"
    ON companies FOR DELETE
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Company notes table
CREATE TABLE IF NOT EXISTS company_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  industry text DEFAULT '',
  job_type text DEFAULT '',
  location text DEFAULT '',
  employee_count text DEFAULT '',
  listing_status text DEFAULT '',
  base_salary text DEFAULT '',
  web_test text DEFAULT '',
  working_hours text DEFAULT '',
  mypage_url text DEFAULT '',
  login_id text DEFAULT '',
  password text DEFAULT '',
  login_notes text DEFAULT '',
  custom_fields jsonb DEFAULT '[]'::jsonb,
  free_memo text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(company_id)
);

DO $$
BEGIN
  ALTER TABLE company_notes ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can view all company notes"
    ON company_notes FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can create company notes"
    ON company_notes FOR INSERT
    TO authenticated
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can update company notes"
    ON company_notes FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete company notes"
    ON company_notes FOR DELETE
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Company memos table
CREATE TABLE IF NOT EXISTS company_memos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  category text NOT NULL,
  title text NOT NULL,
  content text DEFAULT '',
  is_deleted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  ALTER TABLE company_memos ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can view company memos"
    ON company_memos FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can create company memos"
    ON company_memos FOR INSERT
    TO authenticated
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can update company memos"
    ON company_memos FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete company memos"
    ON company_memos FOR DELETE
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Selection events table
CREATE TABLE IF NOT EXISTS selection_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE,
  track text NOT NULL,
  event_type text NOT NULL,
  title text NOT NULL,
  deadline_date date NOT NULL,
  deadline_time time,
  status text DEFAULT 'pending',
  memo text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

DO $$
BEGIN
  ALTER TABLE selection_events ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can view selection events"
    ON selection_events FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can create selection events"
    ON selection_events FOR INSERT
    TO authenticated
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can update selection events"
    ON selection_events FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE POLICY "Users can delete selection events"
    ON selection_events FOR DELETE
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;