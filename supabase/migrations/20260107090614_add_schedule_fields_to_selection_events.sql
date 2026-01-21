/*
  # Add schedule fields to selection_events table

  1. Changes
    - Add `date_type` column to selection_events table
      - Type: text ('deadline' or 'schedule')
      - Default: 'deadline'
    - Add `start_date` column for schedule start date
      - Type: text
      - Nullable
    - Add `start_time` column for schedule start time
      - Type: text
      - Nullable
    - Add `end_date` column for schedule end date
      - Type: text
      - Nullable
    - Add `end_time` column for schedule end time
      - Type: text
      - Nullable

  2. Purpose
    - Allow users to choose between deadline and schedule types
    - Store schedule start/end date and time separately from deadline
*/

-- Add date_type column with default value
ALTER TABLE selection_events
ADD COLUMN IF NOT EXISTS date_type text DEFAULT 'deadline';

-- Add schedule-related columns
ALTER TABLE selection_events
ADD COLUMN IF NOT EXISTS start_date text;

ALTER TABLE selection_events
ADD COLUMN IF NOT EXISTS start_time text;

ALTER TABLE selection_events
ADD COLUMN IF NOT EXISTS end_date text;

ALTER TABLE selection_events
ADD COLUMN IF NOT EXISTS end_time text;