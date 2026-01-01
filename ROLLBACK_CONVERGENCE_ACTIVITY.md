# 回滾「想法收斂活動名稱」功能

如果「想法收斂表單添加活動名稱」和「教案撰寫只顯示對應活動收斂結果」功能導致系統問題，請按照以下步驟回滾到上一個穩定狀態。

## 回滾步驟

### 1. 還原前端組件檔案

將以下檔案還原到修改前的狀態。你可以使用 Git 進行還原：
```bash
git checkout <commit-hash-before-changes> app/components/ConvergenceModal.tsx
git checkout <commit-hash-before-changes> app/components/CommunityDetail.tsx
```

或者手動將檔案內容替換為備份版本。

**需要還原的部分：**

#### ConvergenceModal.tsx
- 移除 `Activity` interface
- 移除 `activityId` 從 `ConvergenceModalProps.onSubmit` 參數
- 移除 `selectedActivityId`、`activities`、`isLoadingActivities` state
- 移除載入活動列表的 `useEffect`
- 移除「活動名稱」下拉選單 UI（在「收斂階段」上方）
- 移除 `handleSubmit` 中的 `activityId`

#### CommunityDetail.tsx
- 移除 `handleConvergenceSubmit` 中的 `activityId` 參數
- 移除 API 請求 body 中的 `activityId`
- 恢復收斂結果過濾邏輯：從 `.filter(idea => idea.isConvergence && idea.activityId === viewingActivity.id)` 改回 `.filter(idea => idea.isConvergence)`

### 2. 重新啟動開發伺服器

執行 `npm run dev` 重新啟動應用程式。

## 驗證

- 確認想法收斂表單中不再顯示「活動名稱」下拉選單。
- 確認教案撰寫頁面右側的「想法收斂結果」顯示所有收斂結果（不過濾活動）。
- 確認系統正常啟動且沒有新的錯誤。
- 確認收斂功能正常運作。

## 注意事項

⚠️ **重要**：此回滾不會影響資料庫中的 `activity_id` 欄位。收斂結果的 `activity_id` 資料會保留在資料庫中，但前端不會使用它們進行過濾。如果需要完全回滾資料庫變更，請參考 `ROLLBACK_IDEA_ACTIVITY_ID.md`。

