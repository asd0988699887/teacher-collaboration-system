-- ============================================
-- 社會科國中高中學習表現資料表
-- 執行時間: 2026-01-21
-- ============================================

USE teacher_collaboration_system;

-- 創建社會科國中高中學習表現資料表
CREATE TABLE IF NOT EXISTS social_learning_performances_middle_high (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL COMMENT '學習表現代碼（如：社 1b-IV-1）',
    stage VARCHAR(5) NOT NULL COMMENT '學段（IV=國中，V=高中）',
    subject VARCHAR(10) NOT NULL COMMENT '科目（社、歷、地、公）',
    dimension VARCHAR(5) NOT NULL COMMENT '構面（1, 2, 3）',
    dimension_name VARCHAR(50) NOT NULL COMMENT '構面名稱',
    category VARCHAR(5) NOT NULL COMMENT '項目（a, b, c, d）',
    category_name VARCHAR(50) NOT NULL COMMENT '項目名稱',
    description TEXT NOT NULL COMMENT '學習表現描述',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stage (stage),
    INDEX idx_subject (subject),
    INDEX idx_dimension (dimension),
    INDEX idx_category (category),
    INDEX idx_stage_subject (stage, subject),
    INDEX idx_dimension_category (dimension, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社會科國中高中學習表現資料表';

-- ============================================
-- 說明
-- ============================================
-- 1. stage: 'IV' = 國中, 'V' = 高中
-- 2. subject: '社'=社會, '歷'=歷史, '地'=地理, '公'=公民
-- 3. dimension: '1'=理解及思辯, '2'=態度及價值觀, '3'=實作及參與
-- 4. category: 'a', 'b', 'c', 'd'（根據不同構面有不同項目）
-- 5. 構面和項目的對應關係：
--    - 1 (理解及思辯): a.覺察說明, b.分析詮釋, c.判斷創新
--    - 2 (態度及價值觀): a.敏覺關懷, b.同理尊重, c.自省珍視
--    - 3 (實作及參與): a.問題發現, b.資料蒐整與應用, c.溝通合作, d.規劃執行

