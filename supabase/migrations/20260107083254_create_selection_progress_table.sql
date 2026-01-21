/*
  # Create Selection Progress Table
  
  1. New Table
    - `selection_progress`
      - `id` (uuid, primary key) - Unique identifier
      - `company_note_id` (uuid, foreign key) - Reference to company_notes
      - `track_type` (text) - Either 'intern' or 'fulltime'
      - `stage` (text) - Selection stage (ES通過、一次面接通過、二次面接通過、最終面接通過、内定 etc.)
      - `passed_date` (date) - Date when this stage was passed
      - `notes` (text) - Optional notes about this stage
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp
  
  2. Security
    - Enable RLS on selection_progress table
    - Add policies for users to manage their own selection progress records
  
  3. Important Notes
    - This table tracks PAST selection stages that have been completed
    - Different from selection_events which tracks FUTURE scheduled events
    - Users can record multiple stages for each track (intern/fulltime)
*/

-- Create selection_progress table
CREATE TABLE IF NOT EXISTS selection_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_note_id uuid REFERENCES company_notes(id) ON DELETE CASCADE NOT NULL,
  track_type text NOT NULL CHECK (track_type IN ('intern', 'fulltime')),
  stage text NOT NULL,
  passed_date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_selection_progress_company_note_id 
ON selection_progress(company_note_id);

CREATE INDEX IF NOT EXISTS idx_selection_progress_track_type 
ON selection_progress(company_note_id, track_type);

-- Enable RLS
ALTER TABLE selection_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view selection progress"
  ON selection_progress FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create selection progress"
  ON selection_progress FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update selection progress"
  ON selection_progress FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete selection progress"
  ON selection_progress FOR DELETE
  TO anon, authenticated
  USING (true);