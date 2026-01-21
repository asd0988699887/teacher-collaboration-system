# 學段功能部署說明

## 📋 功能概述

將教案的「實施年級」拆分為兩個關聯的下拉選單：
1. **學段**：國小、國中、高中（高職）
2. **實施年級**：根據學段動態顯示（國小 1-6 年級，國中/高中 1-3 年級）

---

## 🗂️ 修改檔案清單

### 前端組件
- `app/components/CourseObjectives.tsx`
  - 新增 `schoolLevel` 狀態
  - 新增 `getGradeOptions()` 函數（動態年級選項）
  - 新增學段變更時的 `useEffect`（重置年級）
  - 修改表單 UI（兩個下拉選單 + 聯動）
  - 更新 PDF、Word 生成邏輯
  - 更新預覽顯示
  - 更新保存/讀取邏輯

### 後端 API
- `app/api/lesson-plans/[activityId]/route.ts`
  - 更新 `POST` 方法（INSERT 和 UPDATE）
  - 新增 `school_level` 欄位支援

### 資料庫
- `database/migrations/add_school_level.sql`（新建）
  - 新增 `school_level` 欄位至 `lesson_plans` 表
  - 更新 `lesson_plans_detail` 視圖

---

## 🚀 部署步驟

### 步驟 1：本地提交並推送到 GitHub

```powershell
# 在 Windows PowerShell（本地）
cd C:\Users\翔哥\.cursor\worktrees\cursor___1203\ey93j\phototype-ui

# 加入修改的檔案
git add app/components/CourseObjectives.tsx
git add app/api/lesson-plans/[activityId]/route.ts
git add database/migrations/add_school_level.sql
git add DEPLOYMENT_SCHOOL_LEVEL.md

# 提交
git commit -m "新增學段和實施年級分離功能"

# 推送到 GitHub
git push origin main
```

---

### 步驟 2：伺服器上更新代碼

```bash
# SSH 到伺服器
ssh apisix@140.115.126.19

# 進入專案目錄
cd /home/apisix/projects/teacher-collaboration-system

# 拉取最新代碼
git pull

# 如果有本地修改衝突，先處理：
# git stash  # 暫存本地修改
# git pull   # 拉取遠端代碼
# git stash pop  # 恢復本地修改（如果需要）
```

---

### 步驟 3：執行資料庫遷移

```bash
# 連接到 MySQL
mysql -u root -p

# 輸入密碼（root）
# 然後執行遷移腳本
```

在 MySQL 命令行中：

```sql
USE teacher_collaboration_system;

-- 執行遷移腳本
SOURCE /home/apisix/projects/teacher-collaboration-system/database/migrations/add_school_level.sql;

-- 驗證欄位已新增
DESCRIBE lesson_plans;

-- 檢查視圖是否更新
DESCRIBE lesson_plans_detail;

-- 退出 MySQL
EXIT;
```

---

### 步驟 4：重新構建和重啟應用

```bash
# 安裝依賴（如有新增）
npm install

# 構建專案
npm run build

# 重啟 PM2
pm2 restart teacher-collab

# 查看狀態
pm2 status

# 查看日誌（確認沒有錯誤）
pm2 logs teacher-collab --lines 30 --nostream
```

---

### 步驟 5：測試功能

1. **清除瀏覽器快取**（Ctrl+Shift+R）
2. 前往教案編輯頁面
3. **測試學段選擇**：
   - 選擇「國小」→ 確認年級選單顯示 1-6 年級
   - 選擇「國中」→ 確認年級選單顯示 1-3 年級
   - 選擇「高中（高職）」→ 確認年級選單顯示 1-3 年級
4. **測試聯動效果**：
   - 選擇「國小」和「三年級」
   - 切換學段為「國中」
   - 確認年級自動重置為空白
5. **測試保存與讀取**：
   - 選擇「國小」和「五年級」
   - 點擊「儲存」
   - 重新整理頁面
   - 確認學段和年級正確顯示
6. **測試預覽和下載**：
   - 確認預覽顯示「國小 五年級」
   - 下載 Word 檔案
   - 確認 Word 檔案中顯示「國小 五年級」

---

## 🗄️ 資料庫變更詳情

### 新增欄位

```sql
ALTER TABLE lesson_plans
ADD COLUMN school_level VARCHAR(20) COMMENT '學段（國小、國中、高中（高職））' 
AFTER unit_name;
```

### 欄位資訊
- **名稱**：`school_level`
- **類型**：`VARCHAR(20)`
- **位置**：在 `unit_name` 之後、`implementation_grade` 之前
- **允許 NULL**：是
- **預設值**：NULL
- **可能的值**：'國小'、'國中'、'高中（高職）'

---

## 📊 顯示格式

### 前端顯示
- **完整格式**：`國小 三年級`
- **僅學段**：`國小`（當年級未選時）
- **僅年級**：`三年級`（當學段未選時，向後相容）

### 資料庫儲存
- `school_level`: `'國小'`
- `implementation_grade`: `'3'`

---

## ⚠️ 注意事項

1. **向後相容**：現有教案如果沒有 `school_level`，仍會正常顯示 `implementation_grade`
2. **資料遷移**：舊資料的 `school_level` 為 `NULL`，不影響現有功能
3. **表單驗證**：目前未強制要求同時選擇學段和年級，可以只選其一
4. **顯示邏輯**：
   - 如果兩者都有：顯示「學段 + 年級」
   - 如果只有學段：顯示「學段」
   - 如果只有年級：顯示「年級」
   - 如果兩者都無：顯示空白

---

## 🔍 故障排除

### 問題 1：學段選單無法選擇
- **檢查**：確認瀏覽器已清除快取
- **解決**：按 Ctrl+Shift+R 強制重新載入

### 問題 2：年級選單沒有動態變化
- **檢查**：確認前端代碼已正確部署
- **解決**：檢查 `pm2 logs` 是否有錯誤

### 問題 3：儲存後資料不見
- **檢查**：確認資料庫遷移已執行
- **解決**：執行 `DESCRIBE lesson_plans`，確認 `school_level` 欄位存在

### 問題 4：版本回復後學段消失
- **說明**：舊版本的快照中沒有 `school_level` 資料
- **解決**：這是正常現象，舊版本回復時學段欄位會是空的

---

## 📝 版本資訊

- **功能名稱**：學段和實施年級分離
- **開發日期**：2026-01-21
- **版本**：v1.0
- **測試狀態**：✅ 待測試

---

## ✅ 檢查清單

部署前確認：
- [ ] 所有代碼已提交到 Git
- [ ] 本地測試通過
- [ ] 資料庫遷移腳本已準備好

部署後確認：
- [ ] 代碼已成功拉取到伺服器
- [ ] 資料庫遷移已執行
- [ ] 應用已重新構建和重啟
- [ ] PM2 狀態正常（online）
- [ ] 前端表單顯示正常
- [ ] 學段和年級聯動正常
- [ ] 保存和讀取功能正常
- [ ] 預覽顯示正常
- [ ] Word 下載功能正常

---

如有問題，請檢查：
1. PM2 日誌：`pm2 logs teacher-collab --lines 50`
2. 瀏覽器控制台（F12）
3. 資料庫欄位：`DESCRIBE lesson_plans`

