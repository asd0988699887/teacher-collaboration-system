-- 任務看板：開始／結束時間支援時分（DATE → DATETIME）
ALTER TABLE kanban_tasks
  MODIFY COLUMN start_date DATETIME NULL COMMENT '開始日期時間',
  MODIFY COLUMN end_date DATETIME NULL COMMENT '結束日期時間';
