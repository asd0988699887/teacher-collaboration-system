# 部署檢查總結

## 🎯 核心問題

您的系統**主要針對本地環境設計**，最大的問題是**檔案儲存**。

---

## 🔴 必須修改（5 項）

### 1. 檔案上傳儲存 ⚠️ **最重要**

**問題位置：**
- `app/api/communities/[communityId]/resources/route.ts`
- `app/api/communities/[communityId]/resources/[resourceId]/download/route.ts`

**問題代碼：**
```typescript
// 檔案儲存在本地 public/uploads/ 資料夾
const uploadDir = join(process.cwd(), 'public', 'uploads', communityId)
await writeFile(filePath, buffer)
```

**為什麼要改：**
- ✗ 伺服器重啟會丟失檔案
- ✗ 多台伺服器無法共享檔案
- ✗ 無法做負載平衡
- ✗ 沒有備份機制

**解決方案（3 選 1）：**

| 方案 | 優點 | 缺點 | 難度 | 推薦度 |
|------|------|------|------|--------|
| **AWS S3** | 可靠、可擴展、CDN | 需要費用 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **NFS/網路硬碟** | 免費、本地控制 | 需要設定 | ⭐⭐ | ⭐⭐⭐ |
| **資料庫 BLOB** | 簡單 | 效能差 | ⭐ | ⭐ |

---

### 2. 環境變數

**問題：** `.env.local` 檔案沒有提交到 Git（被 .gitignore）

**必須在伺服器設定：**
```env
DB_HOST=生產資料庫地址
DB_PORT=3306
DB_USER=資料庫使用者名稱
DB_PASSWORD=資料庫密碼
DB_NAME=teacher_collaboration_system
NODE_ENV=production
```

---

### 3. 資料庫連接

**問題位置：** `lib/db.ts`

**問題：**
```typescript
host: process.env.DB_HOST || 'localhost',  // 預設 localhost
```

**必須改為：**
- 生產資料庫的 IP 或域名
- 不要使用 root 帳號
- 增加連接池大小
- 增加錯誤處理

---

### 4. Next.js 配置

**問題位置：** `next.config.ts`

**目前：** 幾乎是空的
**需要：** 增加安全標頭、壓縮、圖片優化等

---

### 5. 已上傳檔案遷移

**問題：** 本地已有上傳檔案需要遷移
```
public/uploads/
├── 2e839172-.../593359f7-....png
├── 4e62182a-.../c4d50780-....png
└── ed7545f0-.../cb656f69-....png
```

**需要：** 將這些檔案遷移到新的儲存方案

---

## ✅ 不需修改

1. ✓ **API 端點**：都是相對路徑（`/api/...`）
2. ✓ **前端請求**：232 個 fetch 都用相對路徑
3. ✓ **資料庫結構**：Schema 與環境無關
4. ✓ **業務邏輯**：都是環境無關的

---

## 📊 工作量估計

| 任務 | 時間 | 難度 |
|------|------|------|
| 環境變數設定 | 1 小時 | 簡單 |
| 資料庫部署 | 2 小時 | 中等 |
| **檔案儲存改造（S3）** | **8 小時** | **困難** |
| 檔案儲存改造（NFS） | 4 小時 | 中等 |
| 測試驗證 | 4 小時 | 中等 |

**總計：** 13-17 小時（取決於儲存方案）

---

## 🚀 建議步驟

### 第 1 步：決定檔案儲存方案
- 如果預算允許：選擇 **AWS S3**（最穩定）
- 如果自架伺服器：選擇 **NFS**（較經濟）

### 第 2 步：準備環境
1. 設定生產資料庫
2. 建立 `.env.production` 檔案
3. 準備儲存服務（S3 或 NFS）

### 第 3 步：修改程式碼
1. 實作 `lib/storage.ts`（統一檔案處理）
2. 修改上傳 API
3. 修改下載 API
4. 更新 `next.config.ts`

### 第 4 步：遷移資料
1. 匯入資料庫
2. 上傳現有檔案到新儲存
3. 更新資料庫中的檔案路徑

### 第 5 步：測試
1. 本地測試所有功能
2. 部署到測試環境
3. 完整功能測試
4. 部署到生產環境

---

## 📝 需要的新檔案

建議創建以下檔案：

1. **`lib/storage.ts`** - 統一的檔案儲存介面
   ```typescript
   export class StorageService {
     async uploadFile(buffer: Buffer, path: string): Promise<string>
     async downloadFile(path: string): Promise<Buffer>
     async deleteFile(path: string): Promise<void>
   }
   ```

2. **`.env.example`** - 環境變數範本
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_user
   DB_PASSWORD=your_password
   # ...
   ```

3. **`ecosystem.config.js`** - PM2 配置（如果使用）
   ```javascript
   module.exports = {
     apps: [{
       name: 'phototype-ui',
       script: 'npm',
       args: 'start',
       // ...
     }]
   }
   ```

---

## ⚠️ 關鍵風險

1. **檔案遷移失敗**：可能丟失已上傳的檔案
   - 解決：先備份再操作

2. **資料庫連線問題**：可能無法連接生產資料庫
   - 解決：先測試連線再部署

3. **環境變數遺漏**：可能導致應用無法啟動
   - 解決：使用 `.env.example` 作為檢查清單

4. **效能問題**：生產流量可能超過預期
   - 解決：監控並適時擴展

---

## 📞 下一步行動

**現在請您決定：**

1. **檔案儲存方案**：S3 還是 NFS？
2. **部署平台**：自架伺服器、Vercel、AWS、還是其他？
3. **時間安排**：什麼時候開始修改？

**決定後，我可以：**
- 實作 `lib/storage.ts`
- 修改相關 API
- 創建部署腳本
- 提供詳細的操作步驟

---

**詳細資訊請查看：** `SERVER_DEPLOYMENT_CHECKLIST.md`

