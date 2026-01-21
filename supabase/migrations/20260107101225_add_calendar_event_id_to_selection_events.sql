/*
  # Add calendar_event_id to selection_events table

  1. Changes
    - Add `calendar_event_id` column to selection_events table
      - Type: text (UUID as string)
      - Nullable (not all selection events may have associated calendar events)
      - References events.id for tracking linked calendar events
  
  2. Purpose
    - Allow selection events to track their associated calendar events
    - Enable editing of existing calendar events when updating selection events
*/

-- Add calendar_event_id column
ALTER TABLE selection_events
ADD COLUMN IF NOT EXISTS calendar_event_id text;
