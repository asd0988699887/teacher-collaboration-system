# 修復：載入討論區留言失敗錯誤

## 錯誤訊息
```
載入討論區留言失敗: 讀取討論區留言失敗
```

## 原因
資料庫表 `convergence_comments` 尚未建立。

## 解決方法

### 方法一：執行 SQL 腳本（推薦）

在 MySQL 中執行以下 SQL 腳本：

```bash
# 使用命令列執行
mysql -u root -p teacher_collaboration_system < database/convergence_comments_schema.sql
```

或者手動在 MySQL 客戶端執行：

```sql
USE teacher_collaboration_system;

CREATE TABLE IF NOT EXISTS convergence_comments (
    id VARCHAR(36) PRIMARY KEY,
    community_id VARCHAR(36) NOT NULL COMMENT '社群ID',
    stage VARCHAR(50) NOT NULL COMMENT '收斂階段',
    content TEXT NOT NULL COMMENT '留言內容',
    author_id VARCHAR(36) NOT NULL COMMENT '留言者ID',
    author_account VARCHAR(50) NOT NULL COMMENT '留言者帳號（快取，避免頻繁 JOIN）',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '建立時間',
    FOREIGN KEY (community_id) REFERENCES communities(id) ON DELETE CASCADE,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_community_stage (community_id, stage),
    INDEX idx_author (author_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收斂討論區留言表';
```

### 方法二：驗證表是否已建立

執行以下 SQL 檢查表是否存在：

```sql
USE teacher_collaboration_system;
SHOW TABLES LIKE 'convergence_comments';
```

如果返回空，則需要執行方法一。

## 驗證修復

1. 執行 SQL 腳本建立表
2. 重新啟動開發伺服器（如果正在運行）
3. 開啟想法收斂表單
4. 選擇一個收斂階段
5. 確認不再出現錯誤訊息
6. 測試新增留言功能

## 注意事項

- 建立表後，留言功能才能正常運作
- 如果表已存在，`CREATE TABLE IF NOT EXISTS` 不會重複建立
- 建立表不會影響現有資料

## 已實施的錯誤處理改進

代碼已更新，現在會：
1. **API GET 方法**：如果表不存在，返回空留言列表（不顯示錯誤）
2. **API POST 方法**：如果表不存在，返回友好的錯誤訊息提示需要建立表
3. **前端**：在開發環境才會顯示詳細錯誤，生產環境優雅處理

即使表不存在，系統也不會崩潰，但留言功能需要表建立後才能使用。

