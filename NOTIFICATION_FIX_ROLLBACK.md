# 通知功能修復 - 回滾指南

## 修改日期
2026-01-04

## 問題描述
在社群總覽時顯示 12 則未讀通知，但進入社群後鈴鐺沒有顯示未讀數量且無法點擊。

## 修改內容

### 修改的檔案
1. `app/components/NotificationBell.tsx` - 通知鈴鐺組件

### 修改細節

**問題原因**：
- 當傳遞 `communityId` 給 `NotificationBell` 時，API 只返回該社群的通知
- 如果該社群沒有未讀通知，但其他社群有，會導致鈴鐺不顯示未讀數量

**解決方案**：
- 總是載入所有通知（不在 API 層過濾）
- 未讀數量總是顯示所有社群的未讀通知數
- 在前端過濾要顯示的通知列表（如果指定了 communityId）

## 回滾步驟

### 方法 1：使用備份檔案恢復

```bash
# 恢復備份檔案
Copy-Item app\components\NotificationBell.tsx.backup_notification_fix app\components\NotificationBell.tsx -Force
```

### 方法 2：手動修改

編輯 `app/components/NotificationBell.tsx`，將 `loadNotifications` 函數改回：

```typescript
  // 載入通知
  const loadNotifications = async () => {
    try {
      let url = `/api/notifications?userId=${userId}`
      if (communityId) {
        url += `&communityId=${communityId}`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (response.ok) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (error) {
      console.error('載入通知失敗:', error)
    }
  }
```

## 驗證回滾成功

1. 重新啟動開發伺服器：`npm run dev`
2. 檢查在社群總覽時的通知數量
3. 進入社群後檢查通知數量
4. 應該恢復到修改前的行為

## 備註

- 備份檔案位置：`app/components/NotificationBell.tsx.backup_notification_fix`
- 如果需要完全回到之前的狀態，也可以使用 Git 回滾：
  ```bash
  git checkout HEAD -- app/components/NotificationBell.tsx
  ```
