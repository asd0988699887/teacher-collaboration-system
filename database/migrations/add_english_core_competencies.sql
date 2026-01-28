-- ============================================
-- 創建英文核心素養資料表
-- ============================================
USE teacher_collaboration_system;

-- 創建英文核心素養表
CREATE TABLE IF NOT EXISTS english_core_competencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  school_level ENUM('國小', '國中', '高中') NOT NULL COMMENT '學段',
  main_category CHAR(1) NOT NULL COMMENT '總綱核心素養面向（A/B/C）',
  main_category_name VARCHAR(50) NOT NULL COMMENT '總綱核心素養面向名稱（自主行動/溝通互動/社會參與）',
  sub_category VARCHAR(10) NOT NULL COMMENT '子項目代碼（A1/A2/A3/B1/B2/B3/C1/C2/C3）',
  sub_category_name VARCHAR(100) NOT NULL COMMENT '子項目名稱',
  code VARCHAR(20) NOT NULL COMMENT '核心素養編碼（英-E-A1/英-J-A1/英S-U-A1）',
  general_description TEXT NOT NULL COMMENT '總綱核心素養項目說明',
  specific_description TEXT NOT NULL COMMENT '語文領域-英語文核心素養具體內涵（國民小學教育(E)/國民中學教育(J)/普通型高級中等學校教育(S-U)）',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_school_level (school_level),
  INDEX idx_main_category (main_category),
  INDEX idx_sub_category (sub_category),
  INDEX idx_code (code),
  UNIQUE KEY uk_school_level_code (school_level, code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='英文核心素養（國小/國中/高中）';

SELECT '英文核心素養資料表創建成功' AS message;

