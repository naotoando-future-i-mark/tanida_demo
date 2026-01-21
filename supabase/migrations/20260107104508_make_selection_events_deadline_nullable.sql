/*
  # Make deadline_date nullable in selection_events

  1. Changes
    - Alter `deadline_date` column in selection_events table to be nullable
    - This allows schedule-type events to not require a deadline

  2. Reason
    - When date_type is 'schedule', events don't need a deadline
    - The NOT NULL constraint was causing errors when saving schedule-type events
*/

ALTER TABLE selection_events
ALTER COLUMN deadline_date DROP NOT NULL;
