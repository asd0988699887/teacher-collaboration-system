-- 子任務：完成狀態與任務繳交欄位
ALTER TABLE kanban_tasks
  ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'incomplete' COMMENT 'incomplete | completed',
  ADD COLUMN completion_description TEXT NULL,
  ADD COLUMN attachment_path VARCHAR(512) NULL,
  ADD COLUMN attachment_name VARCHAR(255) NULL;
