/*
  # Create color presets table

  1. New Tables
    - `color_presets`
      - `id` (uuid, primary key) - Unique identifier for the color preset
      - `label` (text) - Display label for the color (e.g., "面接", "説明会")
      - `color` (text) - Hex color code (e.g., "#FFA52F")
      - `order_index` (integer) - Display order for sorting
      - `created_at` (timestamptz) - Record creation timestamp
      - `updated_at` (timestamptz) - Record update timestamp

  2. Security
    - Enable RLS on `color_presets` table
    - Add policy for all users to read color presets
    - Add policy for authenticated users to update color presets (for label editing)

  3. Initial Data
    - Insert default color presets matching the screenshot:
      - 面接 (Orange #FFA52F)
      - 説明会 (Blue #2196F3)
      - 書類選考 (Teal #009688)
      - GD (Yellow #FFC107)
      - OB訪問 (Pink #E91E63)
      - 合同説明会 (Purple #9C27B0)
      - その他就活予定① (Green #4CAF50)
      - その他就活予定② (Blue #2196F3)
      - その他就活予定③ (Lime #CDDC39)
      - その他就活予定④ (Deep Purple #673AB7)
      - その他就活予定⑤ (Cyan #00BCD4)
      - その他就活予定⑥ (Gray #9E9E9E)
*/

CREATE TABLE IF NOT EXISTS color_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  color text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE color_presets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view color presets"
  ON color_presets
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can update color presets"
  ON color_presets
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

INSERT INTO color_presets (label, color, order_index) VALUES
  ('面接', '#FFA52F', 1),
  ('説明会', '#2196F3', 2),
  ('書類選考', '#009688', 3),
  ('GD', '#FFC107', 4),
  ('OB訪問', '#E91E63', 5),
  ('合同説明会', '#9C27B0', 6),
  ('その他就活予定①', '#4CAF50', 7),
  ('その他就活予定②', '#2196F3', 8),
  ('その他就活予定③', '#CDDC39', 9),
  ('その他就活予定④', '#673AB7', 10),
  ('その他就活予定⑤', '#00BCD4', 11),
  ('その他就活予定⑥', '#9E9E9E', 12)
ON CONFLICT DO NOTHING;