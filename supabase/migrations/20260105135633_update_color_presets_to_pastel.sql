/*
  # Update color presets to pastel colors

  1. Changes
    - Update all color values in `color_presets` table to soft pastel tones
    - Maintains better readability with dark text
    - Creates a more cohesive and eye-friendly visual design
    - Each color is carefully selected to work well together

  2. New Color Palette
    - 面接: #FFD9B3 (Pastel Orange)
    - 説明会: #B3D9FF (Pastel Blue)
    - 書類選考: #B3E5DC (Pastel Teal)
    - GD: #FFF4B3 (Pastel Yellow)
    - OB訪問: #FFB3D9 (Pastel Pink)
    - 合同説明会: #E6B3FF (Pastel Purple)
    - その他就活予定①: #C8E6C9 (Pastel Green)
    - その他就活予定②: #B3E0F2 (Pastel Light Blue)
    - その他就活予定③: #E8F5B3 (Pastel Lime)
    - その他就活予定④: #D9CCFF (Pastel Lavender)
    - その他就活予定⑤: #B3F0F7 (Pastel Cyan)
    - その他就活予定⑥: #E0E0E0 (Pastel Gray)
*/

UPDATE color_presets SET color = '#FFD9B3' WHERE label = '面接';
UPDATE color_presets SET color = '#B3D9FF' WHERE label = '説明会';
UPDATE color_presets SET color = '#B3E5DC' WHERE label = '書類選考';
UPDATE color_presets SET color = '#FFF4B3' WHERE label = 'GD';
UPDATE color_presets SET color = '#FFB3D9' WHERE label = 'OB訪問';
UPDATE color_presets SET color = '#E6B3FF' WHERE label = '合同説明会';
UPDATE color_presets SET color = '#C8E6C9' WHERE label = 'その他就活予定①';
UPDATE color_presets SET color = '#B3E0F2' WHERE label = 'その他就活予定②';
UPDATE color_presets SET color = '#E8F5B3' WHERE label = 'その他就活予定③';
UPDATE color_presets SET color = '#D9CCFF' WHERE label = 'その他就活予定④';
UPDATE color_presets SET color = '#B3F0F7' WHERE label = 'その他就活予定⑤';
UPDATE color_presets SET color = '#E0E0E0' WHERE label = 'その他就活予定⑥';
