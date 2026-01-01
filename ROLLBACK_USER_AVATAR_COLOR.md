# 使用者頭像顏色區分功能回滾說明

## 如果修改後系統無法啟動，請按照以下步驟回滾：

### 步驟 1：恢復 CommunityDetail.tsx

在 `app/components/CommunityDetail.tsx` 文件中：

1. **移除顏色生成函數**（約第 1564-1595 行）：
   ```typescript
   // 刪除以下代碼：
   // 定義一組色調差異明顯的顏色...
   const USER_COLORS = [...]
   const getUserColor = (userId: string): string => {...}
   ```

2. **恢復固定的背景顏色 class**（約第 2242 行）：
   ```typescript
   // 恢復為：
   className="w-6 h-6 rounded-full bg-[rgba(138,99,210,0.9)] flex items-center justify-center text-white text-xs font-semibold"
   
   // 移除：
   style={{ backgroundColor: getUserColor(assigneeId) }}
   ```

### 步驟 2：恢復 AddTaskModal.tsx

在 `app/components/AddTaskModal.tsx` 文件中：

1. **移除顏色生成函數**（約第 42-71 行）：
   ```typescript
   // 刪除以下代碼：
   // 定義一組色調差異明顯的顏色...
   const USER_COLORS = [...]
   const getUserColor = (userId: string): string => {...}
   ```

2. **恢復固定的背景顏色 class**（約第 276 行）：
   ```typescript
   // 恢復為：
   className="flex items-center gap-1.5 bg-[rgba(138,99,210,0.9)] px-2.5 py-1 rounded-full text-white"
   
   // 移除：
   style={{ backgroundColor: getUserColor(assigneeId) }}
   ```

3. **恢復頭像內背景顏色**（約第 285 行）：
   ```typescript
   // 恢復為：
   className="w-5 h-5 rounded-full bg-white bg-opacity-30 flex items-center justify-center text-white text-xs font-semibold"
   
   // 移除：
   style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}
   ```

### 步驟 3：清除 Next.js 快取（可選）

```bash
# Windows PowerShell
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
```

### 步驟 4：重新啟動系統

```bash
npm run dev
```

## 修改的文件清單

### 已修改的文件：
1. `app/components/CommunityDetail.tsx`
   - 添加顏色生成函數（約第 1564-1595 行）
   - 修改任務卡片頭像背景顏色（約第 2242 行）

2. `app/components/AddTaskModal.tsx`
   - 添加顏色生成函數（約第 42-71 行）
   - 修改負責人標籤背景顏色（約第 276 行）
   - 修改頭像內背景顏色（約第 285 行）

## 回滾後的效果

- 所有使用者頭像恢復為統一的紫色背景
- 相同首字母的使用者無法區分（恢復原始問題）
- 但系統應該能正常啟動和運行

## 如果需要重新實施

重新實施時，請參考 `FIX_USER_AVATAR_COLOR_PLAN.md` 文件。

