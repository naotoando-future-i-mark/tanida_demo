/*
  # 特定の色を更新

  1. 変更内容
    - 10個目（その他就活予定④）: #673AB7 → #6a5acd
    - 13個目（その他就活予定⑦）: #00897B → #bc8f8f
*/

-- その他就活予定④ (order_index 10)
UPDATE color_presets SET color = '#6a5acd' WHERE order_index = 10;

-- その他就活予定⑦ (order_index 13)
UPDATE color_presets SET color = '#bc8f8f' WHERE order_index = 13;