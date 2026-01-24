# 社會科國中高中學習表現功能部署說明

## 📋 功能概述

新增國中和高中的社會科學習表現資料，實現學段選擇聯動：
- **國小**：顯示現有的社會學習表現（不變）
- **國中**：顯示代碼中有 `IV` 的學習表現（新增）
- **高中**：顯示代碼中有 `V` 的學習表現（新增）

社會科特殊的三層階層結構：
1. **構面**：理解及思辯、態度及價值觀、實作及參與
2. **項目**：覺察說明、分析詮釋、判斷創新...等
3. **學習表現**：具體的學習表現內容

---

## 🗂️ 修改檔案清單

### 資料庫
- `database/migrations/add_social_middle_high_performances.sql`（新建）
  - 創建 `social_learning_performances_middle_high` 表
  
- `database/seeds/social_middle_high_performances.sql`（新建）
  - 匯入 114 筆學習表現資料（國中 43 筆 + 高中 71 筆）

### API
- `app/api/learning-performances/social-middle/route.ts`（新建）
  - 返回國中社會學習表現（按構面和項目分組）
  
- `app/api/learning-performances/social-high/route.ts`（新建）
  - 返回高中社會學習表現（按構面和項目分組）

### 前端（待完成）
- `app/components/CourseObjectives.tsx`（待修改）
  - 實現三層下拉選單邏輯

---

## 🚀 部署步驟

### 步驟 1：本地提交並推送（Windows PowerShell）

```powershell
cd C:\Users\翔哥\.cursor\worktrees\cursor___1203\ey93j\phototype-ui

# 加入所有新檔案
git add database/migrations/add_social_middle_high_performances.sql
git add database/seeds/social_middle_high_performances.sql
git add "app/api/learning-performances/social-middle/route.ts"
git add "app/api/learning-performances/social-high/route.ts"
git add DEPLOYMENT_SOCIAL_MIDDLE_HIGH.md

# 提交
git commit -m "Add social middle and high school learning performances"

# 推送
git push origin main
```

---

### 步驟 2：伺服器上更新代碼（SSH）

```bash
# SSH 連接
ssh apisix@140.115.126.19

# 進入專案目錄
cd /home/apisix/projects/teacher-collaboration-system

# 拉取最新代碼
git pull origin main

# 確認檔案已更新
ls -lh database/migrations/add_social_middle_high_performances.sql
ls -lh database/seeds/social_middle_high_performances.sql
```

---

### 步驟 3：執行資料庫遷移

```bash
# 連接到 MySQL
mysql -u root -p
# 輸入密碼：root
```

在 MySQL 中執行：

```sql
USE teacher_collaboration_system;

-- 1. 創建資料表
SOURCE /home/apisix/projects/teacher-collaboration-system/database/migrations/add_social_middle_high_performances.sql;

-- 2. 匯入種子資料
SOURCE /home/apisix/projects/teacher-collaboration-system/database/seeds/social_middle_high_performances.sql;

-- 3. 驗證資料
-- 檢查表結構
DESCRIBE social_learning_performances_middle_high;

-- 檢查資料筆數
SELECT COUNT(*) as total, stage, 
       CONCAT(dimension, dimensionName) as dimension_info
FROM social_learning_performances_middle_high
GROUP BY stage, dimension, dimension_name
ORDER BY stage, dimension;

-- 應該顯示：
-- IV (國中): 3 個構面，共約 43 筆
-- V (高中): 3 個構面，共約 71 筆

-- 退出 MySQL
EXIT;
```

---

### 步驟 4：測試 API

```bash
# 測試國中 API
curl http://localhost:8080/api/learning-performances/social-middle

# 測試高中 API
curl http://localhost:8080/api/learning-performances/social-high

# 應該會看到 JSON 格式的學習表現資料
```

---

## 📊 資料庫表結構

### social_learning_performances_middle_high

| 欄位 | 類型 | 說明 | 範例 |
|------|------|------|------|
| id | VARCHAR(36) | 主鍵 | UUID |
| code | VARCHAR(20) | 學習表現代碼 | '社 1b-IV-1' |
| stage | VARCHAR(5) | 學段 | 'IV' (國中), 'V' (高中) |
| subject | VARCHAR(10) | 科目 | '社', '歷', '地', '公' |
| dimension | VARCHAR(5) | 構面 | '1', '2', '3' |
| dimension_name | VARCHAR(50) | 構面名稱 | '理解及思辯' |
| category | VARCHAR(5) | 項目 | 'a', 'b', 'c', 'd' |
| category_name | VARCHAR(50) | 項目名稱 | '覺察說明' |
| description | TEXT | 學習表現描述 | '發覺生活經驗...' |
| sort_order | INT | 排序順序 | 1, 2, 3... |

---

## 🎯 API 回傳格式

### GET /api/learning-performances/social-middle
### GET /api/learning-performances/social-high

```json
{
  "dimensions": [
    {
      "dimension": "1",
      "dimensionName": "理解及思辯",
      "categories": [
        {
          "category": "a",
          "categoryName": "覺察說明",
          "performances": [
            {
              "id": "uuid",
              "code": "社 1a-IV-1",
              "subject": "社",
              "description": "發覺生活經驗或社會現象與社會領域內容知識的關係。"
            }
          ]
        }
      ]
    }
  ]
}
```

---

## ✅ 驗證清單

部署前：
- [ ] 所有檔案已提交到 Git
- [ ] 本地測試 API 路由無語法錯誤

部署後：
- [ ] 代碼已成功拉取到伺服器
- [ ] 資料庫表已創建
- [ ] 種子資料已匯入
- [ ] API 可以正常回傳資料
  - [ ] `/api/learning-performances/social-middle` 返回國中資料
  - [ ] `/api/learning-performances/social-high` 返回高中資料

---

## 🔄 下一步

1. ✅ 後端完成（資料庫 + API）
2. ⏳ 前端修改（三層下拉選單邏輯）
3. ⏳ 測試功能

---

## 🆘 故障排除

### 問題 1：資料表已存在

```sql
-- 如果需要重新創建表
DROP TABLE IF EXISTS social_learning_performances_middle_high;
-- 然後重新執行遷移腳本
```

### 問題 2：資料重複

```sql
-- 清空資料
DELETE FROM social_learning_performances_middle_high;
-- 然後重新匯入種子資料
```

### 問題 3：API 返回空資料

```sql
-- 檢查資料是否正確匯入
SELECT COUNT(*) FROM social_learning_performances_middle_high;
-- 應該顯示約 114 筆
```

---

如有問題，請檢查：
1. MySQL 是否正在運行：`sudo systemctl status mysql`
2. 資料表是否存在：`SHOW TABLES LIKE 'social%';`
3. 資料筆數是否正確：`SELECT COUNT(*) FROM social_learning_performances_middle_high;`

