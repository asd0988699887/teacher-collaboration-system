-- 為 notifications 表的 type 欄位添加 'announcement' 選項
USE teacher_collaboration_system;

ALTER TABLE notifications
MODIFY COLUMN type ENUM('file', 'task', 'idea', 'lesson_plan', 'convergence', 'chat', 'announcement') NOT NULL COMMENT '通知類型';
