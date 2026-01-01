# 回滾「想法新增共備活動欄位」功能

如果「想法新增共備活動欄位」功能導致系統問題，請按照以下步驟回滾到上一個穩定狀態。

## 回滾步驟

### 1. 資料庫回滾

執行以下 SQL 腳本以移除 `ideas` 表中的 `activity_id` 欄位：

```bash
mysql -u root -p teacher_collaboration_system < database/rollback_idea_activity_id.sql
```

或者手動在 MySQL 客戶端中執行 `database/rollback_idea_activity_id.sql` 的內容：

```sql
USE teacher_collaboration_system;

-- 刪除外鍵約束
ALTER TABLE ideas 
DROP FOREIGN KEY IF EXISTS fk_ideas_activity;

-- 刪除索引
ALTER TABLE ideas 
DROP INDEX IF EXISTS idx_activity;

-- 刪除欄位
ALTER TABLE ideas 
DROP COLUMN IF EXISTS activity_id;
```

### 2. 還原 API 路由檔案

將 `app/api/communities/[communityId]/ideas/route.ts` 檔案還原到修改前的狀態。
你可以使用 Git 進行還原：
```bash
git checkout <commit-hash-before-changes> app/api/communities/[communityId]/ideas/route.ts
```

或者手動將檔案內容替換為備份版本。

**需要還原的部分：**
- GET 方法：移除 SQL 查詢中的 `i.activity_id AS activityId` 和返回物件中的 `activityId`
- POST 方法：移除 `activityId` 參數的接收、驗證和 INSERT 語句中的 `activity_id` 欄位

### 3. 還原前端組件檔案

將以下檔案還原到修改前的狀態。你可以使用 Git 進行還原：
```bash
git checkout <commit-hash-before-changes> app/components/AddIdeaModal.tsx
git checkout <commit-hash-before-changes> app/components/CommunityDetail.tsx
```

或者手動將檔案內容替換為備份版本。

**需要還原的部分：**
- `AddIdeaModal.tsx`：
  - 移除 `communityId` prop
  - 移除 `selectedActivityId`、`activities`、`isLoadingActivities` state
  - 移除載入活動列表的 `useEffect`
  - 移除「共備活動」下拉選單 UI
  - 移除 `onSubmit` 中的 `activityId`
- `CommunityDetail.tsx`：
  - 移除 `handleAddIdea` 中的 `activityId` 參數
  - 移除 API 請求 body 中的 `activityId`
  - 移除 `AddIdeaModal` 的 `communityId` prop

### 4. 重新啟動開發伺服器

執行 `npm run dev` 重新啟動應用程式。

## 驗證

- 確認新增想法表單中不再顯示「共備活動」下拉選單。
- 確認系統正常啟動且沒有新的錯誤。
- 確認現有想法功能正常運作。

