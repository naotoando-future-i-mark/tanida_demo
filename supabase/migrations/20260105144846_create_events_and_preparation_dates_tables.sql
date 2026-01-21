/*
  # イベントと選考対策日のテーブル作成

  1. 新しいテーブル
    - `events`
      - `id` (uuid, primary key) - イベントID
      - `title` (text, not null) - イベントタイトル
      - `start_at` (text, not null) - 開始日時
      - `end_at` (text, not null) - 終了日時
      - `all_day` (boolean, default false) - 終日フラグ
      - `color_id` (uuid, not null) - カラープリセットID
      - `company_name` (text, nullable) - 会社名
      - `deadline_at` (text, nullable) - 応募締切日時
      - `meeting_url` (text, nullable) - ビデオ会議URL
      - `location` (text, nullable) - 場所
      - `created_at` (timestamptz) - 作成日時
      - `updated_at` (timestamptz) - 更新日時

    - `preparation_dates`
      - `id` (uuid, primary key) - ID
      - `event_id` (uuid, not null) - イベントID（外部キー）
      - `date` (text, not null) - 選考対策日
      - `created_at` (timestamptz) - 作成日時

  2. セキュリティ
    - 両テーブルでRLSを有効化
    - 全ユーザーが全データにアクセス可能（認証なしのシンプルなアプリ）
    
  3. 注意事項
    - イベントタイプ（event_type）フィールドは削除されました
*/

-- eventsテーブルを作成
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  start_at text NOT NULL,
  end_at text NOT NULL,
  all_day boolean DEFAULT false,
  color_id uuid NOT NULL REFERENCES color_presets(id) ON DELETE RESTRICT,
  company_name text,
  deadline_at text,
  meeting_url text,
  location text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- preparation_datesテーブルを作成
CREATE TABLE IF NOT EXISTS preparation_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  date text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLSを有効化
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE preparation_dates ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがアクセス可能なポリシーを作成（認証なしアプリ用）
CREATE POLICY "Allow all access to events"
  ON events FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all access to preparation_dates"
  ON preparation_dates FOR ALL
  USING (true)
  WITH CHECK (true);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_events_color_id ON events(color_id);
CREATE INDEX IF NOT EXISTS idx_preparation_dates_event_id ON preparation_dates(event_id);