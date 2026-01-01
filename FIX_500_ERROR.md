# 修復 500 錯誤的完整說明

## 問題診斷

系統出現 500 Internal Server Error，可能的原因：
1. 空的 `network-graph` 目錄可能導致 Next.js 路由錯誤
2. Next.js 快取問題

## 完整修復步驟

### 步驟 1：手動刪除空的 network-graph 目錄

請手動刪除以下目錄：
```
app/api/communities/[communityId]/network-graph/
```

**方法：**
1. 在檔案總管中導航到：`app\api\communities\[communityId]\network-graph`
2. 確認目錄是空的
3. 刪除整個 `network-graph` 目錄

### 步驟 2：清理 Next.js 快取

在終端中執行以下命令：

```powershell
# 停止開發伺服器（如果正在運行）
# 按 Ctrl+C 停止

# 刪除 .next 目錄（Next.js 快取）
Remove-Item -Path .next -Recurse -Force -ErrorAction SilentlyContinue

# 重新啟動開發伺服器
npm run dev
```

### 步驟 3：如果問題仍然存在

請檢查終端的錯誤訊息，並告訴我具體的錯誤內容。

## 已完成的回滾操作

✅ 已刪除：`app/api/communities/[communityId]/network-graph/route.ts`
✅ 系統狀態：網絡圖 API 已完全移除

## 注意事項

- 空的目錄在 Next.js 中可能導致路由錯誤
- 刪除 `.next` 目錄會清理所有快取，需要重新編譯
- 這不會影響資料庫資料或現有功能

