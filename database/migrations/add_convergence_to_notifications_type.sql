-- ============================================
-- 為 notifications 表的 type 欄位添加 'convergence' 選項
-- ============================================

USE teacher_collaboration_system;

-- 修改 type 欄位，添加 'convergence' 選項
ALTER TABLE notifications
MODIFY COLUMN type ENUM('file', 'task', 'idea', 'lesson_plan', 'convergence') NOT NULL COMMENT '通知類型';



