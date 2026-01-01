# 數學學習表現功能整合 - 剩餘步驟

## 已完成

✅ 1. 創建資料庫表 (`database/create_math_learning_performances.sql`)
✅ 2. 匯入數學學習表現數據 (`database/seed_math_learning_performances.sql`)
✅ 3. 創建回滾腳本 (`database/rollback_math_learning_performances.sql`)
✅ 4. 創建 API 端點 (`app/api/learning-performances/math/route.ts`)
✅ 5. 創建回滾文檔 (`MATH_LEARNING_PERFORMANCE_ROLLBACK.md`)
✅ 6. 備份前端組件 (`app/components/CourseObjectives.tsx.backup`)
✅ 7. 添加數學學習表現狀態變數
✅ 8. 添加載入數學學習表現的 useEffect

## 待完成 - 前端 UI 整合

### 修改位置
文件：`app/components/CourseObjectives.tsx`
行號：約 2454-2560 (學習表現部分)

### 需要做的修改

在「學習表現」區塊中，根據 `courseDomain` 的值顯示不同內容：

```typescript
{/* 學習表現 */}
<div>
  <label className="block text-gray-700 font-medium mb-2">
    學習表現
  </label>
  
  {/* 根據課程領域顯示不同內容 */}
  {courseDomain === '數學' ? (
    // === 數學領域 ===
    <div className="space-y-3">
      {/* 選擇類別 */}
      <div className="flex gap-2">
        <select
          value={mathPerformanceCategory}
          onChange={(e) => setMathPerformanceCategory(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
        >
          <option value="">請選擇類別</option>
          <option value="n">數與量（n）</option>
          <option value="s">空間與形狀（s）</option>
          <option value="g">坐標幾何（g）</option>
          <option value="r">關係（r）</option>
          <option value="a">代數（a）</option>
          <option value="f">函數（f）</option>
          <option value="d">資料與不確定性（d）</option>
        </select>
      </div>

      {/* 選擇學習表現 */}
      {mathPerformanceCategory && (() => {
        const filteredPerformances = mathPerformances.filter(p => p.category === mathPerformanceCategory)
        
        return filteredPerformances.length > 0 ? (
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium text-sm">
              選擇學習表現：
            </label>
            <select
              multiple
              size={Math.min(filteredPerformances.length, 8)}
              value={selectedMathCodes}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value)
                setSelectedMathCodes(selected)
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
            >
              {filteredPerformances.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.code}: {item.description}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">此類別無學習表現</div>
        )
      })()}

      {/* 加入按鈕 */}
      {selectedMathCodes.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              const selectedPerformances = mathPerformances.filter(p => 
                selectedMathCodes.includes(p.code)
              )
              if (selectedPerformances.length > 0) {
                setAddedLearningPerformances([
                  ...addedLearningPerformances,
                  {
                    content: selectedPerformances.map(p => ({
                      code: p.code,
                      description: p.description
                    }))
                  }
                ])
                setMathPerformanceCategory('')
                setSelectedMathCodes([])
              }
            }}
            className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
          >
            加入
          </button>
        </div>
      )}
    </div>
  ) : courseDomain === '自然' ? (
    // === 自然科 === (保留原有的三層選單邏輯)
    ... 原有代碼 ...
  ) : (
    // === 其他領域 ===
    <div className="text-gray-500 text-sm py-4">
      請先選擇課程領域（目前支持：數學、自然）
    </div>
  )}
</div>
```

### 關鍵點

1. **判斷邏輯**：使用 `courseDomain === '數學'` 判斷
2. **數學選單**：只有兩層（類別 → 學習表現），不像自然科有三層
3. **數據來源**：數學使用 `mathPerformances` (從 API 載入)
4. **狀態變數**：使用 `mathPerformanceCategory` 和 `selectedMathCodes`
5. **保持一致**：加入到 `addedLearningPerformances` 的格式與自然科相同

## 執行步驟

### 1. 執行資料庫腳本

```bash
# 建立資料表
mysql -u root -p teacher_collaboration_system < database/create_math_learning_performances.sql

# 匯入數據
mysql -u root -p teacher_collaboration_system < database/seed_math_learning_performances.sql
```

### 2. 驗證 API

```bash
# 測試 API 是否正常
curl http://localhost:3000/api/learning-performances/math

# 篩選類別
curl http://localhost:3000/api/learning-performances/math?category=n
```

### 3. 完成前端整合

手動修改 `app/components/CourseObjectives.tsx` 的學習表現部分，按照上述代碼進行替換。

### 4. 測試

1. 重啟開發伺服器：`npm run dev`
2. 進入教案撰寫頁面
3. 選擇課程領域為「數學」
4. 驗證學習表現下拉選單顯示數學類別
5. 選擇類別後驗證學習表現列表
6. 加入學習表現並驗證顯示

### 5. 如有問題，執行回滾

```bash
# 回滾資料庫
mysql -u root -p teacher_collaboration_system < database/rollback_math_learning_performances.sql

# 還原前端組件
cp app/components/CourseObjectives.tsx.backup app/components/CourseObjectives.tsx

# 刪除 API
rm -rf app/api/learning-performances/math
```

## 注意事項

1. **備份已完成**：`CourseObjectives.tsx.backup` 已創建
2. **API 已就緒**：`/api/learning-performances/math` 可用
3. **數據結構一致**：數學和自然科的數據格式相同，可共用 `addedLearningPerformances`
4. **逐步測試**：建議先測試 API，再整合前端
5. **回滾準備**：所有回滾腳本和文檔已準備好

## 預期效果

- 選擇「數學」→ 顯示 7 個類別 (n, s, g, r, a, f, d)
- 選擇「自然」→ 顯示原有的 3 個項目 (t, p, a)
- 選擇其他領域 → 提示請選擇支持的領域
- 已加入的學習表現統一顯示在「已加入的學習表現」區域

