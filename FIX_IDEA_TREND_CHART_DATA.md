# 修復想法趨勢圖表資料讀取問題

## 問題描述

想法牆中有很多想法節點，但趨勢圖表顯示「目前沒有想法貢獻記錄」。

## 可能的原因

1. **日期範圍限制**：API 只統計最近30天的資料，如果想法節點是在30天之前建立的，就不會被統計到
2. **日期格式問題**：MySQL 的日期比較可能有格式或時區問題
3. **parent_id 判斷問題**：可能需要同時處理 NULL 和空字串

## 已做的修改

### 1. 添加調試日誌（後端 API）

在 `app/api/communities/[communityId]/idea-trend/route.ts` 中：
- 添加了日期範圍的調試輸出
- 添加了想法總數、新增想法數、回覆想法數的統計
- 添加了最早和最晚日期的記錄
- 在返回資料中包含 `debug` 欄位

### 2. 改善日期比較（後端 API）

- 使用 `CAST(? AS DATE)` 確保日期比較正確
- 處理 `parent_id IS NULL` 和 `parent_id = ''` 兩種情況

### 3. 添加前端調試輸出

在 `app/components/IdeaTrendChart.tsx` 中：
- 添加了 API 返回資料的調試輸出
- 在沒有資料時顯示更詳細的訊息，包括：
  - 如果想法不在最近30天範圍內，會顯示提示
  - 顯示最早和最晚日期
  - 顯示想法總數

## 如何查看調試資訊

1. **後端日誌**：查看終端（運行 `npm run dev` 的視窗）的控制台輸出
2. **前端日誌**：打開瀏覽器的開發者工具（F12），查看 Console 標籤

## 回滾步驟

如果修改後系統無法啟動：

1. **回滾 API 修改**：
   ```bash
   git checkout app/api/communities/[communityId]/idea-trend/route.ts
   ```

2. **回滾前端組件修改**：
   ```bash
   git checkout app/components/IdeaTrendChart.tsx
   ```

或按照 `ROLLBACK_IDEA_TREND_CHART.md` 的說明進行回滾。

## 下一步

請測試後查看：
1. 瀏覽器控制台的調試資訊
2. 終端的後端日誌

根據調試資訊，我們可以：
- 如果想法日期在30天之前：考慮擴大日期範圍或顯示所有資料
- 如果日期格式有問題：調整日期比較邏輯
- 如果查詢有問題：修正 SQL 查詢

## 修改的文件

- `app/api/communities/[communityId]/idea-trend/route.ts`（添加調試和改善查詢）
- `app/components/IdeaTrendChart.tsx`（添加調試和改善錯誤訊息）

