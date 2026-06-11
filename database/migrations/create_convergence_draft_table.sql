-- ============================================
-- 創建想法收斂草稿表（管理員儲存某階段勾選的想法節點與收斂結果文字）
-- 供非管理員進入時瀏覽管理員想收斂的內容與節點
-- ============================================

USE teacher_collaboration_system;

CREATE TABLE IF NOT EXISTS convergence_drafts (
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    stage VARCHAR(255) NOT NULL COMMENT '收斂階段',
    selected_idea_ids TEXT COMMENT '已勾選的想法節點ID（JSON 陣列字串）',
    convergence_content TEXT COMMENT '收斂結果文字',
    updated_by VARCHAR(36) DEFAULT NULL COMMENT '最後儲存者ID',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    PRIMARY KEY (community_id, stage),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    INDEX idx_community (community_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='想法收斂草稿表';
