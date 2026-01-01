# 數學學習表現 - 學習階段欄位回滾指南

如果「數學學習表現的學習階段欄位」功能導致問題，請按照以下步驟回滾。

## 回滾步驟

### 1. 還原前端組件

使用備份檔案還原 `CourseObjectives.tsx`：

```bash
cp app/components/CourseObjectives.tsx.backup app/components/CourseObjectives.tsx
```

或者使用 Git（如果有版本控制）：
```bash
git checkout HEAD app/components/CourseObjectives.tsx
```

### 2. 手動還原（如果需要部分回滾）

如果只想移除學習階段欄位，保留類別欄位，需要：

1. 移除 `mathPerformanceStage` 狀態變數
2. 移除學習階段選擇的 UI 區塊
3. 修改篩選邏輯，移除階段篩選（只保留類別篩選）
4. 移除學習階段相關的 useEffect

### 3. 重新啟動應用程式

```bash
npm run dev
```

## 變更說明

本次修改新增了「學習階段」欄位：

**修改內容：**
- 添加 `mathPerformanceStage` 狀態變數
- 在類別選擇後添加「學習階段」下拉選單（I/II/III）
- 修改篩選邏輯：同時根據類別和階段篩選
- 當類別變更時，自動重置階段和選擇
- 當階段變更時，自動重置選擇

**回滾後效果：**
- 移除學習階段欄位
- 只保留類別欄位
- 顯示該類別下所有階段的學習表現

## 注意事項

- 回滾不會影響資料庫數據（資料庫中已包含階段資訊）
- 回滾後用戶仍可看到所有階段的學習表現，但無法篩選

