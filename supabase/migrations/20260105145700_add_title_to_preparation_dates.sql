/*
  # preparation_datesテーブルにtitleカラムを追加

  1. 変更内容
    - `preparation_dates` テーブルに `title` カラムを追加
      - `title` (text, nullable) - 選考対策日のタイトル
      - デフォルトは null で、親イベントのタイトルを引き継ぐ場合はアプリケーション側で処理

  2. 注意事項
    - 既存のレコードには影響なし（nullable のため）
*/

-- preparation_dates テーブルに title カラムを追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'preparation_dates' AND column_name = 'title'
  ) THEN
    ALTER TABLE preparation_dates ADD COLUMN title text;
  END IF;
END $$;