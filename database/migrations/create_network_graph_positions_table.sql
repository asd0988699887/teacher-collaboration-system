-- ============================================
-- 創建網絡圖節點位置表
-- ============================================

USE teacher_collaboration_system;

CREATE TABLE IF NOT EXISTS network_graph_positions (
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    user_id VARCHAR(36) NOT NULL COMMENT '用戶ID（節點ID）',
    position_x DECIMAL(10, 2) NOT NULL COMMENT 'X座標',
    position_y DECIMAL(10, 2) NOT NULL COMMENT 'Y座標',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    PRIMARY KEY (community_id, user_id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_community (community_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='網絡圖節點位置表';

