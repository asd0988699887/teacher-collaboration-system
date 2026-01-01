# 看板任務移動 API 修復報告

## 🔴 問題描述

### 錯誤訊息
```
Error: You have an error in your SQL syntax
near 'UPDATE kanban_tasks SET sort_order = (@row_number:=@row_number + 1)' at line 2

SQL: 
'SET @row_number = 0;
 UPDATE kanban_tasks 
 SET sort_order = (@row_number:=@row_number + 1)
 WHERE list_id = ?
 ORDER BY sort_order ASC, created_at ASC'
```

### 錯誤位置
- **文件**：`app/api/communities/[communityId]/kanban/tasks/[taskId]/move/route.ts`
- **行數**：第 82-99 行
- **HTTP 狀態**：500 Internal Server Error

## 🔍 問題根源

### 技術原因

MySQL 的 `pool.execute()` 方法**不支持在一次調用中執行多條 SQL 語句**。

原始代碼嘗試執行：
```sql
SET @row_number = 0;
UPDATE kanban_tasks ...
```

這種語法在 MySQL CLI 中可行，但在 Node.js 的 `mysql2` 庫中使用 `execute()` 時會報錯。

### 為什麼會失敗

1. `pool.execute()` 是預處理語句（prepared statement）
2. 預處理語句只支持單條 SQL 語句
3. `SET` 和 `UPDATE` 是兩條獨立的語句
4. 需要使用其他方式來重新排序

## ✅ 修復方案

### 修改方法

將變數賦值 + UPDATE 的兩步驟改為使用 **MySQL 8.0+ 的視窗函數** `ROW_NUMBER()`。

### 修復前的代碼

```sql
-- 錯誤：兩條語句無法在 execute() 中執行
SET @row_number = 0;
UPDATE kanban_tasks 
SET sort_order = (@row_number:=@row_number + 1)
WHERE list_id = ?
ORDER BY sort_order ASC, created_at ASC
```

### 修復後的代碼

```sql
-- 正確：使用子查詢和視窗函數
UPDATE kanban_tasks t1
INNER JOIN (
  SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC) as new_order
  FROM kanban_tasks
  WHERE list_id = ?
) t2 ON t1.id = t2.id
SET t1.sort_order = t2.new_order
```

### 邏輯說明

1. **子查詢部分**：
   - 使用 `ROW_NUMBER()` 視窗函數生成新的排序號碼
   - 按照原有的 `sort_order` 和 `created_at` 排序
   - 為每個任務生成連續的序號（1, 2, 3, ...）

2. **更新部分**：
   - 使用 `INNER JOIN` 連接原表和子查詢結果
   - 將子查詢中計算的 `new_order` 更新到 `sort_order` 欄位

## 🎯 技術優勢

### ROW_NUMBER() 的優點

1. ✅ **單條 SQL 語句**：可以在 `execute()` 中執行
2. ✅ **原子性操作**：整個更新在一個事務中完成
3. ✅ **性能更好**：避免了變數賦值的開銷
4. ✅ **更現代**：使用標準 SQL 語法（SQL:2003）

### 兼容性

- ✅ MySQL 8.0+
- ✅ MariaDB 10.2+
- ✅ PostgreSQL（如果未來遷移）
- ❌ MySQL 5.7 及以下（不支持視窗函數）

## 📝 完整的修復代碼

```typescript
// 如果是在不同列表之間移動，重新排序兩個列表
if (oldListId !== targetListId) {
  // 重新排序舊列表 - 使用子查詢方式
  await query(
    `UPDATE kanban_tasks t1
     INNER JOIN (
       SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC) as new_order
       FROM kanban_tasks
       WHERE list_id = ?
     ) t2 ON t1.id = t2.id
     SET t1.sort_order = t2.new_order`,
    [oldListId]
  )

  // 重新排序新列表 - 使用子查詢方式
  await query(
    `UPDATE kanban_tasks t1
     INNER JOIN (
       SELECT id, ROW_NUMBER() OVER (ORDER BY sort_order ASC, created_at ASC) as new_order
       FROM kanban_tasks
       WHERE list_id = ?
     ) t2 ON t1.id = t2.id
     SET t1.sort_order = t2.new_order`,
    [targetListId]
  )
}
```

## 🧪 驗證結果

- ✅ Linter 檢查通過
- ✅ TypeScript 編譯通過
- ✅ SQL 語法正確（單條語句）
- ⏳ 需要實際測試拖拽功能

## 📚 相關知識

### MySQL 視窗函數

```sql
-- ROW_NUMBER(): 為結果集中的每一行分配唯一的連續整數
SELECT 
  id,
  title,
  ROW_NUMBER() OVER (ORDER BY sort_order ASC) as row_num
FROM kanban_tasks
WHERE list_id = '123'
```

### 其他可用的視窗函數

- `RANK()` - 排名（有並列）
- `DENSE_RANK()` - 密集排名
- `NTILE(n)` - 分組排名
- `LAG()` / `LEAD()` - 訪問前後行

## ⏰ 修復時間

2025-12-30 完成

## 🔄 測試建議

請測試以下場景：

1. ✅ 在同一列表內拖拽任務（調整順序）
2. ✅ 將任務從「待處理」拖到「進行中」
3. ✅ 將任務從「進行中」拖到「已完成」
4. ✅ 將任務從「已完成」拖回「待處理」
5. ✅ 拖拽多個任務後檢查順序是否正確
6. ✅ 刷新頁面後順序是否保持

## 📌 注意事項

### 如果使用 MySQL 5.7

如果您的數據庫是 MySQL 5.7（不支持視窗函數），需要改用以下方法：

```typescript
// 獲取舊列表的所有任務
const oldTasks = await query(
  `SELECT id FROM kanban_tasks 
   WHERE list_id = ? 
   ORDER BY sort_order ASC, created_at ASC`,
  [oldListId]
) as any[]

// 逐一更新排序
for (let i = 0; i < oldTasks.length; i++) {
  await query(
    `UPDATE kanban_tasks SET sort_order = ? WHERE id = ?`,
    [i + 1, oldTasks[i].id]
  )
}
```

但這種方法效率較低，建議升級到 MySQL 8.0。

