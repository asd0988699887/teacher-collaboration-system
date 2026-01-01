-- ============================================
-- 更新 activity_versions 表
-- 加入 lesson_plan_id 欄位以便版本管理
-- ============================================

USE teacher_collaboration_system;

-- 注意：MySQL 5.7 不支援 IF NOT EXISTS，請先檢查欄位是否存在
-- 檢查方式：DESCRIBE activity_versions;
-- 如果 lesson_plan_id 欄位不存在，再執行以下語句

-- 檢查欄位是否存在（使用存儲過程）
DELIMITER $$

DROP PROCEDURE IF EXISTS add_lesson_plan_id_column$$

CREATE PROCEDURE add_lesson_plan_id_column()
BEGIN
    DECLARE column_exists INT DEFAULT 0;
    
    SELECT COUNT(*) INTO column_exists
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'teacher_collaboration_system'
      AND TABLE_NAME = 'activity_versions'
      AND COLUMN_NAME = 'lesson_plan_id';
    
    IF column_exists = 0 THEN
        ALTER TABLE activity_versions 
        ADD COLUMN lesson_plan_id VARCHAR(36) COMMENT '教案ID（關聯到 lesson_plans 表）' AFTER activity_id;
        
        ALTER TABLE activity_versions 
        ADD INDEX idx_lesson_plan (lesson_plan_id);
        
        SELECT 'lesson_plan_id 欄位已成功加入' AS result;
    ELSE
        SELECT 'lesson_plan_id 欄位已存在，無需加入' AS result;
    END IF;
END$$

DELIMITER ;

-- 執行存儲過程
CALL add_lesson_plan_id_column();

-- 刪除臨時存儲過程
DROP PROCEDURE IF EXISTS add_lesson_plan_id_column;

