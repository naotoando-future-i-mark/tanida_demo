/*
  # Add recurrence and memo fields to events table

  1. Changes
    - Add `recurrence_type` (text) - Type of recurrence: 'none', 'daily', 'weekly', 'monthly', 'yearly', 'custom'
    - Add `recurrence_interval` (integer) - Interval for recurrence (e.g., every 2 days, every 3 weeks)
    - Add `recurrence_days` (jsonb) - Days of week for weekly recurrence (e.g., [0,1,2] for Mon, Tue, Wed)
    - Add `recurrence_monthly_type` (text) - Type for monthly: 'day_of_month', 'day_of_week'
    - Add `recurrence_monthly_day` (integer) - Day of month (1-31) or week number (1-5)
    - Add `recurrence_monthly_weekday` (integer) - Weekday (0-6) for day_of_week type
    - Add `recurrence_end_type` (text) - End type: 'never', 'count', 'date'
    - Add `recurrence_end_count` (integer) - Number of occurrences
    - Add `recurrence_end_date` (date) - End date for recurrence
    - Add `memo` (text) - Memo/note for the event
  
  2. Security
    - No changes to RLS policies needed
*/

DO $$
BEGIN
  -- Add recurrence_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_type'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_type text DEFAULT 'none';
  END IF;

  -- Add recurrence_interval column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_interval'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_interval integer DEFAULT 1;
  END IF;

  -- Add recurrence_days column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_days'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_days jsonb;
  END IF;

  -- Add recurrence_monthly_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_monthly_type'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_monthly_type text;
  END IF;

  -- Add recurrence_monthly_day column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_monthly_day'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_monthly_day integer;
  END IF;

  -- Add recurrence_monthly_weekday column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_monthly_weekday'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_monthly_weekday integer;
  END IF;

  -- Add recurrence_end_type column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_end_type'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_end_type text DEFAULT 'never';
  END IF;

  -- Add recurrence_end_count column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_end_count'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_end_count integer;
  END IF;

  -- Add recurrence_end_date column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'recurrence_end_date'
  ) THEN
    ALTER TABLE events ADD COLUMN recurrence_end_date date;
  END IF;

  -- Add memo column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'memo'
  ) THEN
    ALTER TABLE events ADD COLUMN memo text DEFAULT '';
  END IF;
END $$;