/*
  # 明るすぎる色を濃くする

  1. 変更内容
    - 4個目（GD）と9個目（その他就活予定③）が明るすぎて見えづらいため濃い色に変更
    
  2. 色の変更
    - GD: #FFEB3B → #FBC02D (濃い黄色)
    - その他就活予定③: #CDDC39 → #AFB42B (濃いライム)
*/

-- GD (order_index 4)
UPDATE color_presets SET color = '#FBC02D' WHERE label = 'GD';

-- その他就活予定③ (order_index 9)
UPDATE color_presets SET color = '#AFB42B' WHERE label = 'その他就活予定③';