# 數學學習表現功能回滾指南

如果「數學學習表現」功能（包含類別、學習階段篩選）導致問題，請按照以下步驟回滾到上一個穩定狀態。

## 回滾步驟

### 1. 回滾資料庫

執行回滾 SQL 腳本刪除數學學習表現資料表：

```bash
# 在 MySQL 中執行
mysql -u root -p teacher_collaboration_system < database/rollback_math_learning_performances.sql
```

或在 MySQL 客戶端中執行：
```sql
source database/rollback_math_learning_performances.sql;
```

### 2. 刪除 API 檔案

刪除新增的 API 檔案：
```bash
rm app/api/learning-performances/math/route.ts
rm -rf app/api/learning-performances/math
```

### 3. 還原前端組件

使用 Git 還原 `CourseObjectives.tsx` 到修改前的版本：

```bash
git checkout HEAD~1 app/components/CourseObjectives.tsx
```

或手動還原（如果有備份）。

### 4. 重新啟動應用程式

```bash
npm run dev
```

## 驗證

回滾完成後，請驗證：

1. **資料庫**：確認 `math_learning_performances` 表已被刪除
   ```sql
   SHOW TABLES LIKE 'math_learning_performances';
   -- 應該返回空結果
   ```

2. **API**：確認數學學習表現 API 不再可用
   - 訪問 `/api/learning-performances/math` 應返回 404

3. **前端**：確認教案撰寫頁面恢復到修改前的狀態
   - 課程領域選擇「數學」時，學習表現使用原有邏輯

## 檔案清單

**需要刪除的檔案：**
- `database/create_math_learning_performances.sql`
- `database/seed_math_learning_performances.sql`
- `database/rollback_math_learning_performances.sql`
- `app/api/learning-performances/math/route.ts`
- `MATH_LEARNING_PERFORMANCE_ROLLBACK.md`

**需要還原的檔案：**
- `app/components/CourseObjectives.tsx`

## 注意事項

- 回滾操作會刪除所有數學學習表現數據
- 確保在生產環境執行回滾前先備份資料庫
- 如果有其他功能依賴數學學習表現，請先確認影響範圍

## 支援

如有問題，請檢查：
1. MySQL 錯誤日誌
2. Next.js 開發伺服器日誌
3. 瀏覽器控制台錯誤訊息

