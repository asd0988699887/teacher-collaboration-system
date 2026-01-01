# 想法趨勢圖資料統計 API 回滾說明

## 如果系統無法啟動，請按照以下步驟回滾：

### 步驟 1：移除新創建的文件

刪除以下文件：
- `app/api/communities/[communityId]/idea-trend/route.ts`

### 步驟 2：重新啟動系統

```bash
npm run dev
```

## 注意事項

- 此回滾不會影響資料庫資料
- 只會移除新增的 API，不會影響現有功能
- 如果系統仍有問題，請檢查終端錯誤訊息

## 修改摘要

### 新增的功能：
- 想法趨勢圖資料統計 API：`/api/communities/[communityId]/idea-trend`
- 統計最近30天每個使用者的想法建立數量
- 按日期統計，沒有想法的日期補零
- 只統計新增想法（不包含回覆）

### 修改的文件：
- `app/api/communities/[communityId]/idea-trend/route.ts`（新文件）

### API 返回資料結構：

```typescript
{
  dateRange: {
    startDate: string,      // 起始日期 (YYYY-MM-DD)
    endDate: string,        // 結束日期 (YYYY-MM-DD)
    days: number           // 天數（應該是30）
  },
  userStats: [
    {
      userId: string,
      userName: string,
      userAccount: string,
      dailyCounts: [
        {
          date: string,    // 日期 (YYYY-MM-DD)
          count: number    // 該日期的建立數量（沒有就是0）
        }
      ],
      hasData: boolean     // 是否有資料（用於過濾）
    }
  ],
  communityId: string
}
```

### 功能特點：

- ✅ 統計最近30天的資料
- ✅ 只統計新增想法（`parent_id IS NULL`），不包含回覆
- ✅ 自動補零（沒有想法的日期設為0）
- ✅ 只返回有建立過想法的使用者
- ✅ 包含所有30天的資料，確保日期連續

