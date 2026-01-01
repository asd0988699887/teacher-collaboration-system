# 數學學習內容功能回滾指南

如果「數學學習內容」功能導致問題，請按照以下步驟回滾到上一個穩定狀態。

## 回滾步驟

### 1. 回滾資料庫

執行回滾 SQL 腳本刪除數學學習內容資料表：

```bash
# 在 MySQL 中執行
mysql -u root -p teacher_collaboration_system < database/rollback_math_learning_contents.sql
```

或在 MySQL 客戶端中執行：
```sql
source database/rollback_math_learning_contents.sql;
```

### 2. 刪除 API 檔案

刪除新增的 API 檔案：
```bash
rm app/api/learning-contents/math/route.ts
rm -rf app/api/learning-contents/math
```

### 3. 還原前端組件

使用 Git 還原 `CourseObjectives.tsx` 到修改前的狀態：

```bash
git checkout HEAD~1 app/components/CourseObjectives.tsx
```

或者手動將檔案內容替換為備份版本（如果有備份）。

### 4. 重新啟動應用程式

執行 `npm run dev` 重新啟動應用程式。

## 驗證

- 確認 `math_learning_contents` 表已被刪除
- 確認數學學習內容 API 不再可用（訪問 `/api/learning-contents/math` 應返回 404）
- 確認教案撰寫頁面的學習內容恢復到修改前的狀態（只顯示自然科）
- 確認系統正常啟動且沒有新的錯誤

## 檔案清單

**需要刪除的檔案：**
- `database/create_math_learning_contents.sql`
- `database/seed_math_learning_contents.sql`
- `database/rollback_math_learning_contents.sql`
- `app/api/learning-contents/math/route.ts`
- `MATH_LEARNING_CONTENT_ROLLBACK.md`

**需要還原的檔案：**
- `app/components/CourseObjectives.tsx`

## 注意事項

- 回滾操作會刪除所有數學學習內容數據
- 確保在生產環境執行回滾前先備份資料庫
- 如果有其他功能依賴數學學習內容，請先確認影響範圍

## 支援

如有問題，請檢查：
1. MySQL 錯誤日誌
2. Next.js 開發伺服器日誌
3. 瀏覽器控制台錯誤訊息

