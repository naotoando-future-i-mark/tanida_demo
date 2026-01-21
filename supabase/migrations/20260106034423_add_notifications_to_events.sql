/*
  # Add notifications to events table

  1. Changes
    - Add `notifications` column to `events` table as JSONB
    - This column will store an array of notification configurations
    - Each notification contains:
      - type: 'at_time' | 'before_10min' | 'before_1hour' | 'custom'
      - customValue: number (for custom notifications)
      - customUnit: 'minute' | 'hour' | 'day' | 'week' (for custom notifications)
      - referenceTime: 'start' | 'end' (which time to base the notification on)
  
  2. Default Value
    - Empty array [] by default (no notifications)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'events' AND column_name = 'notifications'
  ) THEN
    ALTER TABLE events ADD COLUMN notifications jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;