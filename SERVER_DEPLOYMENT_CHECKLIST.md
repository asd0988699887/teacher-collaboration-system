# 伺服器部署檢查清單

## 檢查日期
2026-01-04

## 目的
檢查系統從本地環境遷移到生產伺服器所需修改的部分

---

## 📋 檢查結果總覽

### ⚠️ 必須修改的項目（5 項）
1. 檔案上傳儲存方式
2. 環境變數配置
3. 資料庫連接設定
4. 檔案路徑處理
5. 生產環境設定

### ✅ 不需修改的項目
- API 端點（使用相對路徑，無硬編碼 localhost）
- 前端 fetch 請求（都是相對路徑）
- 資料庫查詢邏輯
- 業務邏輯代碼

---

## 🔴 必須修改的項目詳細說明

### 1. 檔案上傳儲存方式 ⚠️ 最重要

#### 現況分析
**檔案位置：** `app/api/communities/[communityId]/resources/route.ts`

**問題代碼：**
```typescript
// 第 115 行 - 上傳時寫入本地檔案系統
const uploadDir = join(process.cwd(), 'public', 'uploads', communityId)
if (!existsSync(uploadDir)) {
  await mkdir(uploadDir, { recursive: true })
}

// 第 123-128 行 - 寫入本地磁碟
const filePath = join(uploadDir, uniqueFileName)
const bytes = await file.arrayBuffer()
const buffer = Buffer.from(bytes)
await writeFile(filePath, buffer)

// 第 131 行 - 儲存相對路徑到資料庫
const relativePath = `/uploads/${communityId}/${uniqueFileName}`
```

**問題說明：**
- ✗ 檔案儲存在本地 `public/uploads/` 資料夾
- ✗ 多台伺服器無法共享檔案（如果使用負載平衡）
- ✗ 伺服器重啟或重新部署會丟失檔案
- ✗ 無備份機制

**影響範圍：**
- 上傳檔案：`app/api/communities/[communityId]/resources/route.ts` (POST, DELETE)
- 下載檔案：`app/api/communities/[communityId]/resources/[resourceId]/download/route.ts` (GET)

**目前已上傳的檔案：**
```
public/uploads/
├── 2e839172-84bc-4a20-a0fc-6446f5ca8f50/
│   └── 593359f7-8247-4dd3-bfb6-7cb1fc622bbc.png
├── 4e62182a-edf7-49d3-90e3-2681e17daf18/
│   ├── c4d50780-32d6-489b-9bb7-b5ac902e419c.png
│   └── c77d576f-9512-4b6f-b361-c8e94a9711c0.docx
└── ed7545f0-f4d8-4930-8664-65ed9699c685/
    └── cb656f69-6fc2-4850-a3f7-ed4fc3dde434.png
```

#### 建議解決方案（3 選 1）

**方案 A：使用雲端儲存服務（推薦）**
- AWS S3
- Google Cloud Storage
- Azure Blob Storage
- 阿里雲 OSS

**優點：**
- ✅ 可擴展性好
- ✅ 自動備份
- ✅ CDN 加速
- ✅ 支援多伺服器

**方案 B：使用共享網路儲存（NFS/SMB）**
- 適合自架伺服器

**優點：**
- ✅ 多伺服器共享
- ✅ 本地控制
- ✅ 無額外費用

**缺點：**
- ✗ 需要額外設定
- ✗ 性能可能不如雲端

**方案 C：資料庫 BLOB 儲存（不推薦）**
- 將檔案以二進位儲存在 MySQL

**優點：**
- ✅ 簡單
- ✅ 事務一致性

**缺點：**
- ✗ 資料庫體積大
- ✗ 查詢效能差
- ✗ 備份困難

---

### 2. 環境變數配置 ⚠️

#### 現況分析
**檔案位置：** `.env.local` （已被 .gitignore 忽略，無法讀取）

**使用位置：** `lib/db.ts`

```typescript
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'teacher_collaboration_system',
})
```

**其他環境變數使用：**
```typescript
// app/api/communities/[communityId]/resources/route.ts
stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
```

#### 必須設定的環境變數

**開發環境 (.env.local)：**
```env
# 資料庫設定
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=teacher_collaboration_system

# Node 環境
NODE_ENV=development
```

**生產環境 (.env.production 或伺服器環境變數)：**
```env
# 資料庫設定（必須更改）
DB_HOST=your_production_db_host
DB_PORT=3306
DB_USER=your_production_db_user
DB_PASSWORD=your_secure_password
DB_NAME=teacher_collaboration_system

# Node 環境
NODE_ENV=production

# 如果使用雲端儲存（方案 A）
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=your_bucket_name
AWS_REGION=ap-northeast-1

# 伺服器設定（可選）
PORT=3000
HOST=0.0.0.0
```

#### 部署平台環境變數設定

**Vercel:**
```
Settings → Environment Variables → 添加上述變數
```

**Docker:**
```dockerfile
ENV DB_HOST=your_db_host
ENV DB_USER=your_db_user
# ... 其他變數
```

**PM2 (ecosystem.config.js):**
```javascript
module.exports = {
  apps: [{
    name: 'phototype-ui',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      DB_HOST: 'your_db_host',
      // ... 其他變數
    }
  }]
}
```

---

### 3. 資料庫連接設定

#### 現況分析
**檔案位置：** `lib/db.ts`

**問題：**
- ✗ 預設值指向 localhost
- ✗ 連接池大小可能需要調整
- ✗ 沒有重連機制
- ✗ 沒有連接超時設定

#### 建議修改

```typescript
// lib/db.ts - 生產環境強化版本
import mysql from 'mysql2/promise'

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: process.env.NODE_ENV === 'production' ? 20 : 10, // 生產環境增加連接數
  queueLimit: 0,
  // 新增：連接超時
  connectTimeout: 10000,
  // 新增：閒置超時
  idleTimeout: 60000,
  // 新增：最大閒置連接數
  maxIdle: 10,
  // 新增：啟用連接檢查
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
})

// 新增：連接池錯誤處理
pool.on('error', (err) => {
  console.error('Database pool error:', err)
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.error('Database connection was closed.')
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    console.error('Database has too many connections.')
  }
  if (err.code === 'ECONNREFUSED') {
    console.error('Database connection was refused.')
  }
})

export default pool
```

#### 資料庫安全檢查

1. **確認生產資料庫：**
   - ✓ 不使用 root 帳號
   - ✓ 設定強密碼
   - ✓ 限制遠端訪問 IP
   - ✓ 啟用 SSL 連接（如適用）

2. **網路設定：**
   - ✓ 資料庫不直接暴露到公網
   - ✓ 使用內部網路或 VPN
   - ✓ 設定防火牆規則

---

### 4. 檔案路徑處理

#### 現況分析
**使用 `process.cwd()` 的位置：**

1. **`app/api/communities/[communityId]/resources/route.ts`**
   ```typescript
   // 第 115 行
   const uploadDir = join(process.cwd(), 'public', 'uploads', communityId)
   
   // 第 266 行
   const fullPath = join(process.cwd(), 'public', filePath)
   ```

2. **`app/api/communities/[communityId]/resources/[resourceId]/download/route.ts`**
   ```typescript
   // 第 44 行
   const fullPath = join(process.cwd(), 'public', filePath)
   ```

**問題：**
- ✗ `process.cwd()` 在不同環境可能不一致
- ✗ Docker 容器中路徑結構可能不同
- ✗ 無法輕易切換儲存方式

#### 建議解決方案

**創建統一的檔案處理模組：**

```typescript
// lib/storage.ts（新建檔案）
import { join } from 'path'
import { existsSync } from 'fs'
import { writeFile, mkdir, unlink, readFile } from 'fs/promises'

// 根據環境變數決定儲存方式
const STORAGE_TYPE = process.env.STORAGE_TYPE || 'local' // 'local' | 's3' | 'gcs'
const STORAGE_BASE_PATH = process.env.STORAGE_BASE_PATH || join(process.cwd(), 'public')

export class StorageService {
  // 上傳檔案
  async uploadFile(
    buffer: Buffer,
    path: string
  ): Promise<string> {
    if (STORAGE_TYPE === 's3') {
      // TODO: 實作 S3 上傳
      return await this.uploadToS3(buffer, path)
    }
    
    // 預設：本地儲存
    const fullPath = join(STORAGE_BASE_PATH, path)
    const dir = dirname(fullPath)
    
    if (!existsSync(dir)) {
      await mkdir(dir, { recursive: true })
    }
    
    await writeFile(fullPath, buffer)
    return path
  }

  // 下載檔案
  async downloadFile(path: string): Promise<Buffer> {
    if (STORAGE_TYPE === 's3') {
      // TODO: 實作 S3 下載
      return await this.downloadFromS3(path)
    }
    
    // 預設：本地儲存
    const fullPath = join(STORAGE_BASE_PATH, path)
    return await readFile(fullPath)
  }

  // 刪除檔案
  async deleteFile(path: string): Promise<void> {
    if (STORAGE_TYPE === 's3') {
      // TODO: 實作 S3 刪除
      return await this.deleteFromS3(path)
    }
    
    // 預設：本地儲存
    const fullPath = join(STORAGE_BASE_PATH, path)
    if (existsSync(fullPath)) {
      await unlink(fullPath)
    }
  }

  // S3 相關方法（需要安裝 @aws-sdk/client-s3）
  private async uploadToS3(buffer: Buffer, key: string): Promise<string> {
    // 實作細節
    throw new Error('S3 upload not implemented')
  }

  private async downloadFromS3(key: string): Promise<Buffer> {
    // 實作細節
    throw new Error('S3 download not implemented')
  }

  private async deleteFromS3(key: string): Promise<void> {
    // 實作細節
    throw new Error('S3 delete not implemented')
  }
}

export const storage = new StorageService()
```

---

### 5. 生產環境設定

#### Next.js 生產配置

**檔案位置：** `next.config.ts`

**目前配置：**
```typescript
const nextConfig: NextConfig = {
  /* config options here */
};
```

**建議生產配置：**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 生產環境優化
  compress: true,
  poweredByHeader: false,
  
  // 圖片優化
  images: {
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // 如果使用 CDN
  assetPrefix: process.env.CDN_URL || '',
  
  // 環境變數
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '',
  },
  
  // 輸出配置（如果需要）
  // output: 'standalone', // 適用於 Docker
  
  // 安全標頭
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

#### Package.json 腳本

**目前：**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

**建議增加：**
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "prod": "NODE_ENV=production npm run build && npm run start",
    "deploy": "npm run build && pm2 restart ecosystem.config.js --env production"
  }
}
```

---

## ✅ 不需修改的項目

### 1. API 端點 ✓
**檢查結果：** 所有 API 使用相對路徑，無硬編碼
```typescript
// ✓ 良好範例
fetch('/api/communities')
fetch(`/api/communities/${communityId}/resources`)
```

### 2. 前端 fetch 請求 ✓
**檢查範圍：** `app/components/*.tsx`
**檢查結果：** 232 個 fetch 呼叫，全部使用相對路徑

### 3. 靜態資源 ✓
**檢查結果：** 圖片和 SVG 都在 `public/` 目錄下，會自動處理

### 4. 資料庫結構 ✓
**檢查結果：** 資料庫 schema 與環境無關，可直接使用

---

## 📝 部署步驟建議

### 階段 1：準備工作
1. [ ] 備份本地資料庫
2. [ ] 備份已上傳的檔案（`public/uploads/`）
3. [ ] 記錄所有環境變數

### 階段 2：伺服器端設定
1. [ ] 設定生產資料庫
2. [ ] 匯入資料庫 schema
3. [ ] 創建資料庫使用者（非 root）
4. [ ] 設定防火牆規則

### 階段 3：應用部署
1. [ ] 安裝 Node.js (v18 或更高)
2. [ ] Clone 程式碼
3. [ ] 設定環境變數
4. [ ] 執行 `npm install`
5. [ ] 執行 `npm run build`
6. [ ] 啟動應用 `npm start`

### 階段 4：檔案儲存遷移
1. [ ] 決定儲存方案（S3 / NFS / 其他）
2. [ ] 實作 StorageService
3. [ ] 遷移現有檔案
4. [ ] 測試上傳/下載/刪除

### 階段 5：測試
1. [ ] 測試使用者註冊/登入
2. [ ] 測試社群功能
3. [ ] 測試檔案上傳/下載
4. [ ] 測試想法牆
5. [ ] 測試看板功能
6. [ ] 壓力測試

---

## 🚨 重要注意事項

### 安全性
1. **不要** 提交 `.env` 檔案到 Git
2. **不要** 在程式碼中硬編碼密碼或 API 金鑰
3. **務必** 在生產環境使用 HTTPS
4. **務必** 設定 CORS 限制（如果有跨域需求）
5. **務必** 定期備份資料庫

### 效能
1. 考慮使用 CDN 加速靜態資源
2. 考慮使用 Redis 做快取
3. 考慮使用 PM2 做進程管理
4. 監控資料庫連接數

### 監控
1. 設定日誌收集（如 Winston, Pino）
2. 設定錯誤追蹤（如 Sentry）
3. 設定效能監控（如 New Relic, DataDog）

---

## 📚 相關文件

### 需要創建的文件
1. `DEPLOYMENT.md` - 詳細部署指南
2. `ENVIRONMENT.md` - 環境變數說明
3. `STORAGE.md` - 儲存方案文件
4. `.env.example` - 環境變數範本

### 現有相關文件
- `database/INSTALLATION.md` - 資料庫安裝指南
- `database/API_SETUP.md` - API 設定說明
- `README.md` - 專案說明

---

## 📊 估計工作量

| 項目 | 工作量 | 優先級 |
|------|--------|--------|
| 環境變數設定 | 1 小時 | 🔴 高 |
| 資料庫部署 | 2 小時 | 🔴 高 |
| 檔案儲存遷移（本地 NFS） | 4 小時 | 🔴 高 |
| 檔案儲存遷移（雲端 S3） | 8 小時 | 🔴 高 |
| Next.js 配置優化 | 2 小時 | 🟡 中 |
| 測試與驗證 | 4 小時 | 🔴 高 |
| **總計（本地 NFS）** | **13 小時** | |
| **總計（雲端 S3）** | **17 小時** | |

---

## 💡 建議

1. **優先處理檔案儲存**：這是最大的架構變更
2. **先在測試環境驗證**：不要直接在生產環境修改
3. **分階段部署**：先部署基本功能，再遷移檔案
4. **準備回滾方案**：確保可以快速回到本地環境
5. **文件化所有變更**：方便未來維護

---

**最後更新：** 2026-01-04  
**檢查人員：** AI Assistant  
**狀態：** 待執行

