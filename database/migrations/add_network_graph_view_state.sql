-- ============================================
-- 添加網絡圖視圖狀態表（縮放比例和平移位置）
-- ============================================

USE teacher_collaboration_system;

CREATE TABLE IF NOT EXISTS network_graph_view_state (
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    zoom DECIMAL(10, 4) DEFAULT 1.0 COMMENT '縮放比例',
    pan_x DECIMAL(10, 2) DEFAULT 0 COMMENT 'X軸平移',
    pan_y DECIMAL(10, 2) DEFAULT 0 COMMENT 'Y軸平移',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    PRIMARY KEY (community_id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    INDEX idx_community (community_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='網絡圖視圖狀態表';

-- 添加網絡圖視圖狀態表（縮放比例和平移位置）
-- ============================================

USE teacher_collaboration_system;

CREATE TABLE IF NOT EXISTS network_graph_view_state (
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    zoom DECIMAL(10, 4) DEFAULT 1.0 COMMENT '縮放比例',
    pan_x DECIMAL(10, 2) DEFAULT 0 COMMENT 'X軸平移',
    pan_y DECIMAL(10, 2) DEFAULT 0 COMMENT 'Y軸平移',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    PRIMARY KEY (community_id),
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    INDEX idx_community (community_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='網絡圖視圖狀態表';

