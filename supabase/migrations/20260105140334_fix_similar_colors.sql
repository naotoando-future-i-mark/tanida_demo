/*
  # 似ている色を変更

  1. 変更内容
    - 2個目（説明会）と8個目（その他就活予定②）の青系色が似すぎているため変更
    - 3個目（書類選考）と11個目（その他就活予定⑤）が同じシアン色のため変更
    
  2. 色の変更
    - その他就活予定②: #03A9F4 → #3F51B5 (インディゴ)
    - その他就活予定⑤: #00BCD4 → #009688 (ティール)
*/

-- その他就活予定② (order_index 8)
UPDATE color_presets SET color = '#3F51B5' WHERE label = 'その他就活予定②';

-- その他就活予定⑤ (order_index 11)
UPDATE color_presets SET color = '#009688' WHERE label = 'その他就活予定⑤';