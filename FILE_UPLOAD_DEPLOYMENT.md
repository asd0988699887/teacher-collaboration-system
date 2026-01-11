# 📦 檔案上傳功能部署指南

本文件說明如何部署已增強驗證功能的檔案上傳系統。

---

## ✅ 修改完成項目

### 1. 新增檔案
- ✅ `phototype-ui/.env.example.txt` - 環境變數範本
- ✅ `phototype-ui/lib/storage-config.ts` - 檔案上傳配置模組

### 2. 修改檔案
- ✅ `phototype-ui/app/api/communities/[communityId]/resources/route.ts` - 增加驗證邏輯

### 3. 新增功能
- ✅ 檔案大小限制（預設 10MB，可透過環境變數調整）
- ✅ 檔案類型限制（僅允許圖片和文件）
- ✅ 檔案權限自動設定（Linux/Unix）
- ✅ 友善的錯誤訊息
- ✅ 環境變數驅動配置

---

## 🚀 部署步驟

### 步驟 1：設定環境變數

#### **本地開發環境**

創建 `phototype-ui/.env.local`：

```plaintext
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的本地資料庫密碼
DB_NAME=teacher_collaboration_system
NODE_ENV=development
MAX_FILE_SIZE=10485760
```

#### **伺服器生產環境**

創建 `phototype-ui/.env.production`：

```plaintext
DB_HOST=localhost
DB_PORT=3306
DB_USER=你的伺服器資料庫使用者
DB_PASSWORD=你的伺服器資料庫密碼
DB_NAME=teacher_collaboration_system
NODE_ENV=production
MAX_FILE_SIZE=10485760
```

或者在伺服器上設定環境變數（Linux）：

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=your_user
export DB_PASSWORD=your_password
export DB_NAME=teacher_collaboration_system
export NODE_ENV=production
export MAX_FILE_SIZE=10485760
```

---

### 步驟 2：確保上傳目錄存在

在伺服器上執行（Linux）：

```bash
# 進入專案目錄
cd phototype-ui

# 創建上傳目錄
mkdir -p public/uploads

# 設定權限（讓 Node.js 可以寫入）
chmod 755 public/uploads
```

Windows 不需要特別設定權限。

---

### 步驟 3：建置和啟動

```bash
# 進入專案目錄
cd phototype-ui

# 安裝依賴（如果還沒安裝）
npm install

# 建置專案
npm run build

# 啟動服務
npm start
```

服務會在 `http://your-server-ip:3000` 上運行。

---

### 步驟 4：使用 PM2（推薦用於生產環境）

```bash
# 安裝 PM2
npm install -g pm2

# 啟動應用
cd phototype-ui
pm2 start npm --name "phototype-ui" -- start

# 設定開機自動啟動
pm2 startup
pm2 save

# 查看狀態
pm2 status

# 查看日誌
pm2 logs phototype-ui
```

---

## 🧪 測試驗證

### 測試案例 1：正常上傳（應該成功）

- ✅ 上傳小於 10MB 的圖片（jpg, png, gif, webp, svg）
- ✅ 上傳小於 10MB 的文件（pdf, doc, docx, xls, xlsx, ppt, pptx, txt）

**預期結果：** 上傳成功，返回 201 狀態碼

---

### 測試案例 2：檔案過大（應該失敗）

- ❌ 上傳大於 10MB 的檔案

**預期錯誤訊息：**
```json
{
  "error": "檔案過大，最大允許 10 MB",
  "maxSize": 10485760,
  "actualSize": 15000000,
  "maxSizeFormatted": "10 MB",
  "actualSizeFormatted": "14.31 MB"
}
```

**狀態碼：** 400

---

### 測試案例 3：不支援的檔案類型（應該失敗）

- ❌ 上傳 .exe, .zip, .rar, .7z 等檔案

**預期錯誤訊息：**
```json
{
  "error": "不支援的檔案類型，僅允許圖片（jpg, png, gif, webp, svg）和文件（pdf, doc, docx, xls, xlsx, ppt, pptx, txt）",
  "fileType": "application/x-msdownload",
  "fileName": "program.exe",
  "allowedTypes": "圖片和文件（詳見錯誤訊息）"
}
```

**狀態碼：** 400

---

### 測試案例 4：空檔案（應該失敗）

- ❌ 上傳大小為 0 的檔案

**預期錯誤訊息：**
```json
{
  "error": "檔案大小無效"
}
```

**狀態碼：** 400

---

## 📊 支援的檔案類型

### 圖片格式
- jpg, jpeg
- png
- gif
- webp
- svg

### 文件格式
- pdf
- doc, docx (Word)
- xls, xlsx (Excel)
- ppt, pptx (PowerPoint)
- txt (純文字)

---

## ⚙️ 調整檔案大小限制

如果需要調整檔案大小限制，只需修改環境變數：

```plaintext
# 10MB（預設）
MAX_FILE_SIZE=10485760

# 20MB
MAX_FILE_SIZE=20971520

# 50MB
MAX_FILE_SIZE=52428800

# 100MB
MAX_FILE_SIZE=104857600
```

修改後需要重新啟動服務：

```bash
# 如果使用 npm start
# 按 Ctrl+C 停止，然後重新執行 npm start

# 如果使用 PM2
pm2 restart phototype-ui
```

---

## 🔍 檢查上傳的檔案

上傳的檔案會存放在：

```
phototype-ui/public/uploads/[communityId]/[uniqueFileName]
```

例如：
```
phototype-ui/public/uploads/comm-123/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf
```

可以透過瀏覽器訪問：
```
http://your-server-ip:3000/uploads/comm-123/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf
```

---

## 🛠️ 常見問題

### 1. 上傳後無法訪問檔案（403 錯誤）

**原因：** Linux 權限問題

**解決方法：**
```bash
chmod 755 public/uploads
chmod 644 public/uploads/**/*
```

---

### 2. 上傳失敗，顯示「伺服器儲存空間不足」

**原因：** 磁碟空間已滿

**解決方法：**
```bash
# 檢查磁碟空間
df -h

# 清理不需要的檔案
# 或擴充磁碟空間
```

---

### 3. 環境變數沒有生效

**原因：** `.env` 檔案位置錯誤或格式錯誤

**解決方法：**
- 確保 `.env.local` 或 `.env.production` 在 `phototype-ui/` 目錄下
- 檢查檔案格式（每行一個變數，`KEY=VALUE`，不要有空格）
- 重新啟動服務

---

### 4. 上傳成功但檔案不存在

**原因：** 上傳目錄不存在或權限不足

**解決方法：**
```bash
mkdir -p public/uploads
chmod 755 public/uploads

# 確認 Node.js 程序的使用者有寫入權限
ls -la public/
```

---

## 📝 修改內容總結

### 核心改動
1. **檔案大小驗證** - 防止過大檔案佔用空間
2. **檔案類型驗證** - 只允許安全的檔案類型
3. **環境變數配置** - 限制可透過環境變數調整
4. **友善錯誤訊息** - 清楚告知使用者問題
5. **檔案權限設定** - Linux 自動設定正確權限

### 向後相容
- ✅ 現有上傳的檔案不受影響
- ✅ 下載和刪除功能不需修改
- ✅ 資料庫結構不需修改
- ✅ 前端程式碼不需修改

---

## 🎯 下一步建議

1. **測試所有案例** - 確保驗證功能正常運作
2. **監控磁碟空間** - 定期檢查上傳目錄大小
3. **備份策略** - 定期備份 `public/uploads/` 目錄
4. **日誌監控** - 使用 PM2 查看上傳相關錯誤

---

## 📞 技術支援

如有問題，請檢查：

1. **應用日誌**
   ```bash
   pm2 logs phototype-ui
   # 或
   tail -f logs/app.log
   ```

2. **環境變數是否正確載入**
   ```bash
   # 在 Node.js 中檢查
   console.log('MAX_FILE_SIZE:', process.env.MAX_FILE_SIZE)
   ```

3. **檔案權限**
   ```bash
   ls -la public/uploads/
   ```

---

**修改完成日期：** 2026-01-11
**版本：** 1.0
**測試狀態：** ✅ Linter 檢查通過，等待功能測試

