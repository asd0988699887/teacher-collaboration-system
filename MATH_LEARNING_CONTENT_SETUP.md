# 數學學習內容功能實施指南

## ⚠️ 重要提示

**您提到「資料如下:」但沒有提供具體的數學學習內容數據。**

目前已經完成了：
- ✅ 資料庫表結構
- ✅ API 端點
- ✅ 前端 UI 整合

**但還需要您提供數學學習內容的具體數據才能完成匯入！**

## 已完成的檔案

### 1. 資料庫腳本

**`database/create_math_learning_contents.sql`**
- 創建 `math_learning_contents` 資料表
- 包含欄位：id, code, category, category_name, grade, serial, description

**`database/seed_math_learning_contents.sql`**
- ⚠️ **此檔案需要填入實際數據**
- 目前只有範例格式，需要您提供數據後填入

**`database/rollback_math_learning_contents.sql`**
- 回滾腳本，可刪除資料表

### 2. API 端點

**`app/api/learning-contents/math/route.ts`**
- GET `/api/learning-contents/math`
- 支持查詢參數：`category`（N/S/G/R/A/F/D）、`grade`（1-6）

### 3. 前端整合

**`app/components/CourseObjectives.tsx`**
- ✅ 已添加數學學習內容的狀態變數
- ✅ 已添加載入數學學習內容的 useEffect
- ✅ 已整合 UI，根據課程領域顯示不同內容

## 需要您提供：數學學習內容數據

### 數據格式

編碼規則：`{category}-{grade}-{serial}`

範例：
- `N-1-1` = 數與量，1年級，流水號1
- `S-2-3` = 空間與形狀，2年級，流水號3

### SQL INSERT 格式

```sql
INSERT INTO math_learning_contents (id, code, category, category_name, grade, serial, description) VALUES
(UUID(), 'N-1-1', 'N', '數與量', 1, 1, '學習內容描述...'),
(UUID(), 'N-1-2', 'N', '數與量', 1, 2, '學習內容描述...'),
(UUID(), 'S-1-1', 'S', '空間與形狀', 1, 1, '學習內容描述...'),
...
```

### 類別對照表

- `N` = 數與量
- `S` = 空間與形狀
- `G` = 坐標幾何
- `R` = 關係（國小階段專用）
- `A` = 代數
- `F` = 函數
- `D` = 資料與不確定性

### 年級

1-6 年級，以阿拉伯數字 1-6 表示

## 執行步驟（待數據提供後）

### 1. 填入數據

編輯 `database/seed_math_learning_contents.sql`，將所有 INSERT 語句填入。

### 2. 執行資料庫腳本

```bash
# 步驟 1：建立資料表
mysql -u root -p teacher_collaboration_system < database/create_math_learning_contents.sql

# 步驟 2：匯入數據
mysql -u root -p teacher_collaboration_system < database/seed_math_learning_contents.sql
```

### 3. 驗證

```sql
-- 檢查數據筆數
SELECT COUNT(*) FROM math_learning_contents;

-- 查看前 5 筆
SELECT code, category_name, grade, description 
FROM math_learning_contents 
LIMIT 5;
```

### 4. 測試前端

1. 重啟開發伺服器：`npm run dev`
2. 進入教案撰寫頁面
3. 選擇課程領域為「數學」
4. 驗證學習內容下拉選單顯示數學類別和年級
5. 選擇類別和年級後驗證學習內容列表
6. 加入學習內容並驗證顯示

## 功能說明

完成後，系統會根據課程領域自動顯示不同的學習內容：

- **選擇「數學」** → 顯示 7 個主題類別（N/S/G/R/A/F/D）和 6 個年級選項（1-6年級）
- **選擇「自然」** → 顯示原有的跨科概念（INa-INg）和學習階段（stage2/stage3）
- **選擇其他領域** → 提示「請先選擇課程領域（目前支持：數學、自然）」

## 回滾方式

如有問題，請參考 `MATH_LEARNING_CONTENT_ROLLBACK.md` 執行回滾。

## 等待您的數據

請提供數學學習內容的完整數據列表，格式可以是：
- Excel 表格
- CSV 檔案
- 文字列表（格式：編碼 - 描述）

收到數據後，我會幫您完成 `seed_math_learning_contents.sql` 的匯入腳本！

