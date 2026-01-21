/*
  # Add event_type column to events table

  1. Changes
    - Add `event_type` column to `events` table to store event category
    - Values: 'intern' (インターン) or 'fulltime' (本選考)
    - Column is optional (nullable)

  2. Notes
    - This allows users to categorize calendar events by recruitment type
    - Default is NULL (no type selected)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'event_type'
  ) THEN
    ALTER TABLE events ADD COLUMN event_type text CHECK (event_type IN ('intern', 'fulltime'));
  END IF;
END $$;