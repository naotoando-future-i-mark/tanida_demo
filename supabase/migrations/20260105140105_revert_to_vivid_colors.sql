/*
  # カラープリセットを鮮やかな色に戻す

  1. 変更内容
    - color_presetsテーブルの色を元の鮮やかな色に戻す
    - パステルカラーから視認性の高い色に変更
    
  2. 色の変更
    - 面接: #FF9800 (オレンジ)
    - 説明会: #2196F3 (青)
    - 書類選考: #00BCD4 (シアン)
    - GD: #FFEB3B (黄色)
    - OB訪問: #E91E63 (ピンク)
    - 合同説明会: #9C27B0 (紫)
    - その他就活予定①: #4CAF50 (緑)
    - その他就活予定②: #03A9F4 (ライトブルー)
    - その他就活予定③: #CDDC39 (ライム)
    - その他就活予定④: #673AB7 (ディープパープル)
    - その他就活予定⑤: #00BCD4 (シアン)
    - その他就活予定⑥: #9E9E9E (グレー)
    - その他就活予定⑦: #F44336 (赤)
    - その他就活予定⑧: #795548 (ブラウン)
*/

-- 面接
UPDATE color_presets SET color = '#FF9800' WHERE label = '面接';

-- 説明会
UPDATE color_presets SET color = '#2196F3' WHERE label = '説明会';

-- 書類選考
UPDATE color_presets SET color = '#00BCD4' WHERE label = '書類選考';

-- GD
UPDATE color_presets SET color = '#FFEB3B' WHERE label = 'GD';

-- OB訪問
UPDATE color_presets SET color = '#E91E63' WHERE label = 'OB訪問';

-- 合同説明会
UPDATE color_presets SET color = '#9C27B0' WHERE label = '合同説明会';

-- その他就活予定①
UPDATE color_presets SET color = '#4CAF50' WHERE label = 'その他就活予定①';

-- その他就活予定②
UPDATE color_presets SET color = '#03A9F4' WHERE label = 'その他就活予定②';

-- その他就活予定③
UPDATE color_presets SET color = '#CDDC39' WHERE label = 'その他就活予定③';

-- その他就活予定④
UPDATE color_presets SET color = '#673AB7' WHERE label = 'その他就活予定④';

-- その他就活予定⑤
UPDATE color_presets SET color = '#00BCD4' WHERE label = 'その他就活予定⑤';

-- その他就活予定⑥
UPDATE color_presets SET color = '#9E9E9E' WHERE label = 'その他就活予定⑥';

-- その他就活予定⑦
UPDATE color_presets SET color = '#F44336' WHERE label = 'その他就活予定⑦';

-- その他就活予定⑧
UPDATE color_presets SET color = '#795548' WHERE label = 'その他就活予定⑧';