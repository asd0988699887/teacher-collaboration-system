# 學習表現與學習內容「其他」選項功能回滾指南

## 功能概述
為所有科目（數學、國文、英文、社會、自然）的學習表現和學習內容添加「其他」選項，允許用戶自定義輸入。

## 修改的文件
- `app/components/CourseObjectives.tsx` - 主要修改文件

## 回滾步驟

### 方法一：使用備份文件（推薦）

1. 查找備份文件：
```powershell
Get-ChildItem "app/components/CourseObjectives.tsx.backup_*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
```

2. 恢復備份文件：
```powershell
# 先查看最新的備份文件
$latestBackup = Get-ChildItem "app/components/CourseObjectives.tsx.backup_*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
Write-Host "最新的備份文件: $($latestBackup.Name)"

# 確認後恢復
Copy-Item $latestBackup.FullName "app/components/CourseObjectives.tsx" -Force
```

3. 驗證恢復：
```powershell
# 檢查文件大小
Get-Item "app/components/CourseObjectives.tsx" | Select-Object Name, Length, LastWriteTime
```

### 方法二：使用 Git 回滾

如果使用 Git 版本控制：

```bash
# 查看修改
git diff app/components/CourseObjectives.tsx

# 回滾到上一個版本
git checkout HEAD -- app/components/CourseObjectives.tsx

# 或回滾到特定提交
git log --oneline app/components/CourseObjectives.tsx
git checkout <commit-hash> -- app/components/CourseObjectives.tsx
```

## 修改內容摘要

### 新增的狀態變數（每個科目）
學習表現：
- 數學：`mathPerformanceOther`
- 國文：`chinesePerformanceOther`
- 英文：`englishPerformanceOther`
- 社會：`socialPerformanceOther`
- 自然：`naturalPerformanceOther`

學習內容：
- 數學：`mathContentOther`
- 國文：`chineseContentOther`
- 英文：`englishContentOther`
- 社會：`socialContentOther`
- 自然：`naturalContentOther`

### UI 修改位置
1. 第一個下拉選單：在最後添加 `<option value="其他">其他</option>`
2. 第二個欄位：條件渲染（下拉選單 vs 文字輸入框）
3. 第三個欄位：條件渲染（選擇列表 vs 隱藏）
4. 加入按鈕：添加自定義內容處理邏輯

## 驗證回滾成功

1. 啟動開發服務器：
```bash
npm run dev
```

2. 檢查以下功能：
   - 學習表現下拉選單不應該有「其他」選項
   - 學習內容下拉選單不應該有「其他」選項
   - 第二個欄位應該始終是下拉選單
   - 沒有自定義輸入功能

## 備份文件管理

### 查看所有備份文件
```powershell
Get-ChildItem "app/components/CourseObjectives.tsx.backup_*" | Format-Table Name, Length, LastWriteTime
```

### 刪除舊備份文件（保留最近3個）
```powershell
Get-ChildItem "app/components/CourseObjectives.tsx.backup_*" | 
  Sort-Object LastWriteTime -Descending | 
  Select-Object -Skip 3 | 
  Remove-Item -Verbose
```

## 注意事項

1. **回滾前務必確認**：
   - 確認當前修改是否需要保留
   - 檢查是否有其他文件依賴此修改

2. **數據庫無影響**：
   - 此功能僅修改前端 UI
   - 不涉及數據庫結構變更
   - 不需要回滾數據庫

3. **用戶數據**：
   - 回滾後，用戶已加入的自定義學習表現/內容將無法正常顯示
   - 建議在回滾前通知用戶或導出數據

## 緊急回滾聯繫

如遇到問題無法回滾，請：
1. 保存當前錯誤日誌
2. 不要繼續修改文件
3. 聯繫技術支援

## 回滾記錄

| 回滾時間 | 執行者 | 原因 | 結果 |
|---------|--------|------|------|
|         |        |      |      |

---

**創建時間**：2024-12-22
**功能版本**：v1.0
**最後更新**：2024-12-22

