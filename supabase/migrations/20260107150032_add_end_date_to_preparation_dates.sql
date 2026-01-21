/*
  # 選考対策日に終了日時フィールドを追加

  1. 変更内容
    - `preparation_dates`テーブルに`end_date`カラムを追加
      - `end_date` (text, nullable) - 選考対策終了日時
  
  2. 注意事項
    - 既存のデータには影響なし（nullableフィールド）
*/

-- preparation_datesテーブルにend_dateカラムを追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'preparation_dates' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE preparation_dates ADD COLUMN end_date text;
  END IF;
END $$;