-- ============================================
-- 社會科學習內容資料表（國中+高中）
-- 三層結構：主題 → 項目（可選） → 條目
-- 執行時間: 2026-01-21
-- ============================================

USE teacher_collaboration_system;

-- 創建社會科學習內容資料表
CREATE TABLE IF NOT EXISTS social_learning_contents (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL COMMENT '條目代碼（如：歷Ba-IV-1）',
    stage VARCHAR(5) NOT NULL COMMENT '學段（IV=國中，V=高中）',
    subject VARCHAR(10) NOT NULL COMMENT '科目（歷、地、公）',
    theme VARCHAR(5) NOT NULL COMMENT '主題代碼（A, B, C...）',
    theme_name VARCHAR(100) NOT NULL COMMENT '主題名稱',
    category VARCHAR(5) DEFAULT NULL COMMENT '項目代碼（a, b, c...，可為空）',
    category_name VARCHAR(100) DEFAULT NULL COMMENT '項目名稱（可為空）',
    description TEXT NOT NULL COMMENT '條目描述',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stage (stage),
    INDEX idx_subject (subject),
    INDEX idx_theme (theme),
    INDEX idx_category (category),
    INDEX idx_stage_subject (stage, subject),
    INDEX idx_theme_category (theme, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社會科學習內容資料表（國中+高中）';

-- ============================================
-- 說明
-- ============================================
-- 1. stage: 'IV' = 國中, 'V' = 高中
-- 2. subject: '歷'=歷史, '地'=地理, '公'=公民
-- 3. theme: 'A', 'B', 'C'...（依課綱分類）
-- 4. category: 'a', 'b', 'c'...（有些主題沒有項目，此欄位為 NULL）
-- 5. code: 完整代碼（如：歷Ba-IV-1）
-- 6. description: 條目內容描述
-- 7. 資料結構支援三層查詢：
--    - 第一層：依 stage + subject 查詢所有主題
--    - 第二層：依 theme 查詢該主題下的所有項目（如果有）
--    - 第三層：依 theme + category 查詢所有條目

