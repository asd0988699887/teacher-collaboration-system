# 教師共同備課系統 - MySQL 資料庫架構說明

## 資料庫概述

此資料庫架構支援教師共同備課系統的所有功能，並實作了完整的權限控制機制。

## 權限控制規則

### 1. 社群（Communities）

- **建立者權限**：
  - ✅ 編輯社群
  - ✅ 刪除社群
  - ✅ 管理成員（設為管理員、刪除成員）
  
- **其他成員權限**：
  - ✅ 檢視社群
  - ✅ 退出社群
  - ❌ 編輯社群
  - ❌ 刪除社群

**實作方式**：透過 `communities.creator_id` 欄位判斷是否為建立者。

### 2. 共備活動（Activities）

- **建立者權限**：
  - ✅ 編輯活動
  - ✅ 刪除活動
  - ✅ 管理版本
  
- **其他成員權限**：
  - ✅ 檢視活動（需密碼驗證，如果活動為非公開）
  - ❌ 編輯活動
  - ❌ 刪除活動

**實作方式**：透過 `activities.creator_id` 欄位判斷是否為建立者。

### 3. 想法牆的想法節點（Ideas）

- **建立者權限**：
  - ✅ 編輯節點
  - ✅ 刪除節點
  
- **其他成員權限**：
  - ✅ 檢視節點
  - ✅ 延伸想法（建立子節點）
  - ❌ 編輯節點
  - ❌ 刪除節點

**實作方式**：透過 `ideas.creator_id` 欄位判斷是否為建立者。

### 4. 團隊分工（Kanban）

- **所有成員權限**：
  - ✅ 建立列表
  - ✅ 編輯列表
  - ✅ 刪除列表
  - ✅ 建立任務
  - ✅ 編輯任務
  - ✅ 刪除任務
  - ✅ 指派任務

**實作方式**：無權限限制，所有社群成員都可以操作。

### 5. 社群資源（Resources）

- **所有成員權限**：
  - ✅ 上傳檔案
  - ✅ 下載檔案
  - ✅ 刪除檔案

**實作方式**：無權限限制，所有社群成員都可以操作。

### 6. 社群管理（Community Management）

- **管理員權限**：
  - ✅ 檢視所有成員
  - ✅ 將一般成員設為管理員
  - ✅ 刪除成員
  
- **一般成員權限**：
  - ✅ 檢視所有成員
  - ❌ 修改成員角色
  - ❌ 刪除成員

**實作方式**：
- 社群建立者自動成為管理員（透過觸發器 `after_community_create`）
- 透過 `community_members.role` 欄位判斷角色（`admin` 或 `member`）

## 資料表結構

### 核心表

1. **users** - 使用者表
2. **communities** - 社群表
3. **community_members** - 社群成員表（包含角色）

### 功能表

4. **activities** - 共備活動表
5. **activity_versions** - 活動版本表
6. **ideas** - 想法節點表
7. **resources** - 社群資源表
8. **kanban_lists** - 團隊分工列表表
9. **kanban_tasks** - 團隊分工任務表
10. **task_assignees** - 任務指派表

### 視圖（Views）

- `community_members_detail` - 社群成員詳細資訊
- `activities_detail` - 活動詳細資訊
- `ideas_detail` - 想法節點詳細資訊

## 安裝步驟

### 1. 確保 MySQL 已安裝

```bash
# 檢查 MySQL 版本
mysql --version
```

### 2. 執行資料庫建立腳本

```bash
# 方式一：使用 MySQL 命令列
mysql -u root -p < database/schema.sql

# 方式二：在 MySQL 客戶端中執行
mysql -u root -p
source database/schema.sql;
```

### 3. 驗證資料庫建立

```sql
USE teacher_collaboration_system;
SHOW TABLES;
```

## 常用查詢範例

### 檢查使用者是否為社群建立者

```sql
SELECT 
    c.id,
    c.name,
    c.creator_id,
    CASE 
        WHEN c.creator_id = ? THEN TRUE 
        ELSE FALSE 
    END AS is_creator
FROM communities c
WHERE c.id = ?;
```

### 檢查使用者是否為活動建立者

```sql
SELECT 
    a.id,
    a.name,
    a.creator_id,
    CASE 
        WHEN a.creator_id = ? THEN TRUE 
        ELSE FALSE 
    END AS is_creator
FROM activities a
WHERE a.id = ?;
```

### 檢查使用者是否為想法節點建立者

```sql
SELECT 
    i.id,
    i.title,
    i.creator_id,
    CASE 
        WHEN i.creator_id = ? THEN TRUE 
        ELSE FALSE 
    END AS is_creator
FROM ideas i
WHERE i.id = ?;
```

### 檢查使用者是否為社群管理員

```sql
SELECT 
    cm.role,
    CASE 
        WHEN cm.role = 'admin' THEN TRUE 
        ELSE FALSE 
    END AS is_admin
FROM community_members cm
WHERE cm.community_id = ? 
  AND cm.user_id = ?;
```

### 取得社群所有成員（包含角色）

```sql
SELECT * FROM community_members_detail
WHERE community_id = ?
ORDER BY 
    CASE role 
        WHEN 'admin' THEN 1 
        ELSE 2 
    END,
    joined_at;
```

## 注意事項

1. **外鍵約束**：所有外鍵都設定了 `ON DELETE CASCADE`，刪除父記錄時會自動刪除相關子記錄。

2. **唯一約束**：
   - `users.account` 和 `users.email` 必須唯一
   - `communities.invite_code` 必須唯一
   - `community_members` 中同一社群不能有重複的使用者

3. **自動觸發器**：建立社群時，會自動將建立者加入 `community_members` 表並設為管理員。

4. **JSON 欄位**：
   - `activity_versions.lesson_plan_data` - 儲存教案資料
   - `ideas.converged_idea_ids` - 儲存被收斂的想法節點IDs陣列

5. **時間戳記**：所有表都包含 `created_at` 和 `updated_at` 欄位，用於追蹤建立和更新時間。

## 後續開發建議

1. **API 層權限檢查**：在後端 API 中實作權限檢查邏輯，確保前端無法繞過權限控制。

2. **索引優化**：根據實際查詢模式，可能需要新增額外的索引。

3. **資料備份**：建議定期備份資料庫。

4. **效能監控**：監控慢查詢，適時優化。


