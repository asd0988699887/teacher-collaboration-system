-- 創建自然科學習表現資料表（國中/高中）
-- 三層結構：項目 → 子項 → 學習表現

CREATE TABLE IF NOT EXISTS natural_middle_high_performances (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_level ENUM('國中', '高中') NOT NULL COMMENT '學段',
  main_category VARCHAR(50) NOT NULL COMMENT '項目（探究能力、科學的態度與本質）',
  sub_category_code VARCHAR(10) NOT NULL COMMENT '子項代碼（t=思考智能, p=問題解決, a=科學的態度與本質）',
  sub_category_name VARCHAR(50) NOT NULL COMMENT '子項名稱（思考智能、問題解決、科學的態度與本質）',
  item_code VARCHAR(10) NOT NULL COMMENT '子項項目代碼（i=想像創造, r=推理論證, c=批判思辨, m=建立模型, o=觀察與定題, e=計劃與執行, a=分析與發現, c=討論與傳達, i=培養科學探究的興趣, h=養成應用科學思考與探究的習慣, n=認識科學本質）',
  item_name VARCHAR(50) NOT NULL COMMENT '子項項目名稱',
  code VARCHAR(20) NOT NULL COMMENT '學習表現代碼（如 ti-IV-1, tr-Vc-1）',
  description TEXT NOT NULL COMMENT '學習表現描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_level (school_level),
  INDEX idx_main_category (main_category),
  INDEX idx_sub_category_code (sub_category_code),
  INDEX idx_item_code (item_code),
  INDEX idx_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='自然科學習表現（國中/高中）';

