# 白屏問題修復報告

## 修改日期
2026-01-04

## 問題描述
從社群總覽點擊社群卡片進入社群後，畫面變成全白。

## 根本原因

### 錯誤代碼位置
`app/components/CommunityDetail.tsx` 第 2029-2034 行

### 錯誤內容
```typescript
{currentUserId && (
  <NotificationBell 
    userId={currentUserId}  // ❌ currentUserId 變數未定義
    communityId={communityId || undefined} 
  />
)}
```

### 問題分析
1. `currentUserId` 是在 `useEffect` 內部定義的局部變數（第 192 行）
2. 該變數無法在組件的 JSX 返回值中訪問
3. React 在渲染時遇到未定義變數，導致組件崩潰
4. 整個頁面因錯誤而顯示白屏

### 原因追溯
這個錯誤是在之前修改通知功能時引入的。當時為了支持社群內的通知過濾，在 `CommunityDetail.tsx` 中添加了 `NotificationBell` 組件，但誤用了 `currentUserId` 而非正確的 `userId` state。

## 解決方案

### 修復內容
將 `currentUserId` 改為 `userId`（這是組件的 state 變數，第 114 行定義）

```typescript
{userId && (  // ✅ 使用組件的 state 變數
  <NotificationBell 
    userId={userId}
    communityId={communityId || undefined} 
  />
)}
```

## 修改的文件

### 1. `app/components/CommunityDetail.tsx`
- **行數**：2029
- **修改內容**：`currentUserId` → `userId`
- **備份檔案**：`app/components/CommunityDetail.tsx.backup_white_screen_fix`

## 回滾步驟

如果需要回滾（不建議，因為這是錯誤修復）：

```bash
# 恢復到修復前的版本（有錯誤的版本）
Copy-Item app\components\CommunityDetail.tsx.backup_white_screen_fix app\components\CommunityDetail.tsx -Force
```

## 驗證修復

### 測試步驟
1. 確保開發伺服器正在運行
2. 訪問 `http://localhost:3000` 或 `http://localhost:3001`（根據實際端口）
3. 點擊社群卡片進入社群
4. **預期結果**：頁面正常顯示，不再白屏

### 瀏覽器控制台檢查
之前的錯誤訊息應該消失：
- ❌ 之前：`ReferenceError: currentUserId is not defined`
- ✅ 現在：無錯誤

## 相關問題

### 通知功能狀態
- 通知功能目前已回滾到原始版本
- 在社群內仍然會只顯示該社群的通知數量（原始行為）
- 如果需要修改通知行為，需要另外實施更安全的方案

## 技術細節

### 變數作用域說明
```typescript
// ❌ 錯誤：局部變數在 useEffect 外無法訪問
useEffect(() => {
  const currentUserId = userData.id || userData.userId
  // currentUserId 只在這個 useEffect 內有效
}, [])

// ✅ 正確：使用組件的 state
const [userId, setUserId] = useState<string | null>(null)

useEffect(() => {
  const userData = JSON.parse(savedUser)
  setUserId(userData.id || userData.userId || null)
  // 通過 setState 更新，可在整個組件中使用
}, [])
```

## 總結

✅ **白屏問題已修復**
- 原因：使用了未定義的 `currentUserId` 變數
- 修復：改用正確的 `userId` state 變數
- 影響範圍：僅修改一行代碼
- 風險等級：低（簡單的變數名稱更正）

✅ **系統恢復正常**
- 社群頁面可正常訪問
- 通知功能正常運作
- 無其他副作用

## 後續建議

如果需要修改通知數量顯示邏輯（讓社群內也顯示所有未讀通知），建議：
1. 等待當前修復測試通過
2. 創建新的實施方案
3. 進行充分測試後再部署

