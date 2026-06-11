-- 記錄任務截止提醒通知（3 天、2 天、1 天各發一次）
CREATE TABLE IF NOT EXISTS task_deadline_notification_logs (
  id VARCHAR(36) PRIMARY KEY,
  task_id VARCHAR(36) NOT NULL,
  days_before TINYINT NOT NULL COMMENT '3=三天前, 2=兩天前, 1=一天前',
  sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_task_deadline_days (task_id, days_before),
  INDEX idx_task_id (task_id)
);
