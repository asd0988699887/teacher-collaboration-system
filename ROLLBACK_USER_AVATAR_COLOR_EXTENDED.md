# 使用者頭像顏色區分功能擴展回滾說明

## 如果修改後系統無法啟動，請按照以下步驟回滾：

### 步驟 1：恢復 IdeaCard.tsx

在 `app/components/IdeaCard.tsx` 文件中：

1. **移除顏色生成函數**（約第 28-57 行）：
   ```typescript
   // 刪除以下代碼：
   // 定義一組色調差異明顯的顏色...
   const USER_COLORS = [...]
   const getUserColor = (userId?: string): string => {...}
   ```

2. **從接口中移除 creatorId**（約第 10 行）：
   ```typescript
   // 恢復為：
   interface IdeaCardProps {
     // ...
     creatorAvatar?: string
     onClick?: () => void
     // 移除 creatorId?: string
   }
   ```

3. **從函數參數中移除 creatorId**（約第 17 行）：
   ```typescript
   // 恢復為：
   export default function IdeaCard({
     // ...
     creatorAvatar,
     onClick,
     // 移除 creatorId,
   }: IdeaCardProps) {
   ```

4. **恢復固定的背景顏色 class**（約第 88 行）：
   ```typescript
   // 恢復為：
   className="w-4 h-4 rounded-full bg-[rgba(138,99,210,0.9)] flex items-center justify-center text-white text-[8px] font-semibold flex-shrink-0"
   
   // 移除：
   style={{ backgroundColor: getUserColor(creatorId) }}
   ```

### 步驟 2：恢復 DraggableIdeaCard.tsx

在 `app/components/DraggableIdeaCard.tsx` 文件中：

1. **從接口中移除 creatorId**（約第 14 行）：
   ```typescript
   // 恢復為：
   interface DraggableIdeaCardProps {
     // ...
     creatorAvatar?: string
     position: { x: number; y: number }
     // 移除 creatorId?: string
   }
   ```

2. **從函數參數中移除 creatorId**（約第 27 行）：
   ```typescript
   // 恢復為：
   export default function DraggableIdeaCard({
     // ...
     creatorAvatar,
     position,
     // 移除 creatorId,
   }: DraggableIdeaCardProps) {
   ```

3. **從 IdeaCard 調用中移除 creatorId**（約第 147 行）：
   ```typescript
   // 恢復為：
   <IdeaCard
     // ...
     creatorAvatar={creatorAvatar}
     onClick={() => {}}
     // 移除 creatorId={creatorId}
   />
   ```

### 步驟 3：恢復 CommunityDetail.tsx

在 `app/components/CommunityDetail.tsx` 文件中：

1. **恢復社群管理頭像**（約第 2395 行）：
   ```typescript
   // 恢復為：
   <div className="w-12 h-12 rounded-full bg-[rgba(138,99,210,0.9)] flex items-center justify-center text-white text-lg font-semibold">
   
   // 移除：
   style={{ backgroundColor: getUserColor(member.userId) }}
   ```

2. **恢復想法牆的簡化邏輯**（約第 2530 行）：
   ```typescript
   // 恢復為：
   {ideas.map((idea, index) => (
     <DraggableIdeaCard
       key={idea.id}
       // ...
       creatorAvatar={idea.creatorAvatar}
       position={idea.position || { x: 50 + index * 200, y: 50 }}
       // 移除 creatorId={creatorId} 和查找邏輯
     />
   ))}
   ```

### 步驟 4：清除 Next.js 快取（可選）

```bash
# Windows PowerShell
Remove-Item -Path ".next" -Recurse -Force -ErrorAction SilentlyContinue
```

### 步驟 5：重新啟動系統

```bash
npm run dev
```

## 修改的文件清單

### 已修改的文件：
1. `app/components/IdeaCard.tsx`
   - 添加顏色生成函數
   - 添加 `creatorId` prop
   - 修改頭像背景顏色為動態顏色

2. `app/components/DraggableIdeaCard.tsx`
   - 添加 `creatorId` prop
   - 傳遞 `creatorId` 給 `IdeaCard`

3. `app/components/CommunityDetail.tsx`
   - 修改社群管理頁面頭像顏色
   - 在想法牆中根據 `creatorName` 查找 `creatorId` 並傳遞

## 回滾後的效果

- 想法牆和社群管理的頭像恢復為統一的紫色背景
- 但團隊分工的頭像顏色會保留（因為是第一次修改，不在此回滾範圍內）
- 系統應該能正常啟動和運行

## 如果需要完全回滾（包括團隊分工）

請參考 `ROLLBACK_USER_AVATAR_COLOR.md` 文件，進行完整回滾。

