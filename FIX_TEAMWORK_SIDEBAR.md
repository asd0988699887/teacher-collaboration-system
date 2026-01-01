# 修復團隊分工 Sidebar 顯示問題

## 問題描述

團隊分工頁面的左側 sidebar 消失了。

## 修改內容

### 1. 調整團隊分工頁面的布局
- 將 `flex-1` 改為 `w-full`，避免 flex 布局衝突
- 將 `px-8 py-6` 改為在內部容器使用 `p-4`，確保布局正確

### 2. 添加網絡圖 API 測試功能
- 在「社群網絡圖功能開發中」頁面添加「測試 API」按鈕
- 點擊按鈕會在控制台輸出 API 返回的資料
- 方便確認 API 是否正常工作

## 回滾步驟

如果修改後系統無法啟動或 sidebar 仍有問題，請按照以下步驟回滾：

### 步驟 1：還原 CommunityDetail.tsx

```bash
git checkout app/components/CommunityDetail.tsx
```

或手動還原以下修改（約第 2026-2028 行）：

```typescript
// 還原為：
{activeTab === 'teamwork' && (
  <div className="flex-1 overflow-x-auto px-8 py-6">
    <div className="flex gap-4 min-w-max">
```

### 步驟 2：清除 Next.js 快取（可選）

```bash
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
```

### 步驟 3：重新啟動

```bash
npm run dev
```

## 修改的文件

- `app/components/CommunityDetail.tsx`
  - 調整團隊分工頁面布局（第 2026-2028 行）
  - 添加網絡圖 API 測試按鈕（第 2321-2345 行）

## 測試方法

### 1. 測試 Sidebar 顯示
- 打開社群詳情頁面
- 點擊左側 sidebar 的「團隊分工」圖標（時鐘圖標）
- 確認左側 sidebar 仍然顯示

### 2. 測試網絡圖 API
- 點擊「活動歷程」tab
- 點擊「社群網絡圖」按鈕
- 點擊「測試 API（查看控制台）」按鈕
- 打開瀏覽器開發者工具（F12）→ Console 標籤
- 查看「網絡圖 API 返回資料」的日誌

## 如果 Sidebar 仍然消失

可能的原因：
1. CSS 樣式衝突
2. 容器寬度設置問題
3. z-index 層級問題

請檢查：
- 瀏覽器開發者工具 → Elements 標籤
- 查看左側 sidebar 元素是否存在
- 檢查是否有 `display: none` 或其他隱藏樣式

