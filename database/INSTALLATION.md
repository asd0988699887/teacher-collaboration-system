# MySQL 資料庫安裝指南

## 快速開始

### 步驟 1：安裝 MySQL

確保您的系統已安裝 MySQL 8.0 或更高版本。

**Windows:**
```bash
# 下載並安裝 MySQL Community Server
# https://dev.mysql.com/downloads/mysql/
```

**macOS:**
```bash
brew install mysql
brew services start mysql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

### 步驟 2：建立資料庫

```bash
# 登入 MySQL
mysql -u root -p

# 執行資料庫建立腳本
source database/schema.sql;

# 或使用命令列
mysql -u root -p < database/schema.sql
```

### 步驟 3：建立權限檢查函數（可選）

```bash
# 執行權限檢查函數腳本
mysql -u root -p teacher_collaboration_system < database/permissions.sql
```

### 步驟 4：驗證安裝

```sql
USE teacher_collaboration_system;

-- 檢查所有表
SHOW TABLES;

-- 檢查函數
SHOW FUNCTION STATUS WHERE Db = 'teacher_collaboration_system';

-- 檢查觸發器
SHOW TRIGGERS FROM teacher_collaboration_system;
```

## 資料庫結構概覽

### 核心表

- `users` - 使用者
- `communities` - 社群
- `community_members` - 社群成員（含角色）

### 功能表

- `activities` - 共備活動
- `activity_versions` - 活動版本
- `ideas` - 想法節點
- `resources` - 社群資源
- `kanban_lists` - 團隊分工列表
- `kanban_tasks` - 團隊分工任務
- `task_assignees` - 任務指派

### 視圖

- `community_members_detail` - 社群成員詳細資訊
- `activities_detail` - 活動詳細資訊
- `ideas_detail` - 想法節點詳細資訊

### 函數

- `is_community_creator()` - 檢查是否為社群建立者
- `is_activity_creator()` - 檢查是否為活動建立者
- `is_idea_creator()` - 檢查是否為想法節點建立者
- `is_community_admin()` - 檢查是否為社群管理員
- `is_community_member()` - 檢查是否為社群成員

### 觸發器

- `after_community_create` - 自動將社群建立者設為管理員

## 連接字串範例

### Node.js (使用 mysql2)

```typescript
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_password',
  database: 'teacher_collaboration_system',
  charset: 'utf8mb4'
});
```

### 環境變數設定

建立 `.env` 檔案：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=teacher_collaboration_system
DB_CHARSET=utf8mb4
```

## 下一步

1. 閱讀 [README.md](./README.md) 了解權限控制規則
2. 查看 [api-examples.md](./api-examples.md) 了解如何實作權限檢查
3. 參考 [app/types/database.ts](../app/types/database.ts) 了解 TypeScript 類型定義

## 疑難排解

### 問題：無法建立資料庫

**解決方案：**
- 確認 MySQL 服務正在運行
- 確認使用者有足夠權限
- 檢查 MySQL 版本是否為 8.0 或更高

### 問題：外鍵約束錯誤

**解決方案：**
- 確認所有相關表都已建立
- 檢查外鍵引用的 ID 是否存在
- 確認字符集設定正確（utf8mb4）

### 問題：函數無法建立

**解決方案：**
- 確認 MySQL 版本支援函數
- 檢查是否有語法錯誤
- 確認使用者有 CREATE FUNCTION 權限

## 備份與還原

### 備份資料庫

```bash
mysqldump -u root -p teacher_collaboration_system > backup.sql
```

### 還原資料庫

```bash
mysql -u root -p teacher_collaboration_system < backup.sql
```


