# 🔄 清除快取並重新建置

## 在伺服器上執行以下指令：

```bash
cd ~/projects/teacher-collaboration-system

# 1. 清除 Next.js 建置快取
rm -rf .next

# 2. 重新建置（這會重新編譯所有檔案）
npm run build

# 3. 重啟服務
pm2 restart teacher-collab

# 4. 查看服務狀態
pm2 status

# 5. 查看日誌確認沒有錯誤
pm2 logs teacher-collab --lines 30
```

## 在瀏覽器端：

1. **清除瀏覽器快取**：
   - Chrome/Edge: 按 `Ctrl+Shift+Delete`，選擇「快取的圖片和檔案」，清除
   - 或使用無痕模式：`Ctrl+Shift+N`

2. **強制重新整理**：
   - Windows: `Ctrl+F5`
   - Mac: `Cmd+Shift+R`

3. **訪問正確的網址**：
   ```
   http://140.115.126.19:8080
   ```

## 驗證修改是否生效：

打開瀏覽器的開發者工具（F12），在 Console 中應該會看到：
```
✅ 已執行自動縮放，確保所有節點在畫面內
```

或者在 Network 標籤中，重新載入頁面後，檢查 `NetworkGraph.tsx` 的載入時間，應該是剛剛建置的版本。


