-- ============================================
-- 新增收斂內容修改追蹤功能
-- 相容 MySQL 5.7+ / 8.0+
-- ============================================

-- Step 1: ideas 表新增 last_edited_by 欄位
ALTER TABLE ideas
  ADD COLUMN last_edited_by VARCHAR(36) DEFAULT NULL COMMENT '最後編輯者ID';

-- Step 2: ideas 表新增 last_edited_at 欄位
ALTER TABLE ideas
  ADD COLUMN last_edited_at TIMESTAMP DEFAULT NULL COMMENT '最後編輯時間';

-- Step 3: 新增索引（加速查詢）
ALTER TABLE ideas
  ADD INDEX idx_last_edited_by (last_edited_by);

-- Step 4: 建立想法節點修改紀錄表
CREATE TABLE IF NOT EXISTS idea_edit_history (
  id VARCHAR(36) PRIMARY KEY,
  idea_id VARCHAR(36) NOT NULL COMMENT '想法節點ID',
  editor_id VARCHAR(36) NOT NULL COMMENT '編輯者ID',
  edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '編輯時間',
  old_activity_id VARCHAR(36) DEFAULT NULL COMMENT '修改前活動ID',
  new_activity_id VARCHAR(36) DEFAULT NULL COMMENT '修改後活動ID',
  old_stage VARCHAR(50) DEFAULT NULL COMMENT '修改前階段',
  new_stage VARCHAR(50) DEFAULT NULL COMMENT '修改後階段',
  old_title VARCHAR(255) DEFAULT NULL COMMENT '修改前標題',
  new_title VARCHAR(255) DEFAULT NULL COMMENT '修改後標題',
  old_content TEXT DEFAULT NULL COMMENT '修改前內容',
  new_content TEXT DEFAULT NULL COMMENT '修改後內容',
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
  FOREIGN KEY (editor_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_idea (idea_id),
  INDEX idx_editor (editor_id),
  INDEX idx_edited_at (edited_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='想法節點修改紀錄表';
