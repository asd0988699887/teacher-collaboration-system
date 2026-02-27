# 🚀 伺服器部署指令（正確路徑）

## 📋 伺服器端更新指令

SSH 登入伺服器後，執行以下指令：

```bash
# 1. 進入專案目錄
cd ~/projects/teacher-collaboration-system

# 2. 檢查是否有 phototype-ui 子目錄
ls -la

# 3. 如果有 phototype-ui 子目錄，進入它
cd phototype-ui

# 4. 拉取最新代碼
git pull origin main

# 5. 安裝新的依賴（如果有）
npm install

# 6. 重新建置
npm run build

# 7. 重啟 PM2 服務（服務名稱是 teacher-collab）
pm2 restart teacher-collab

# 8. 查看服務狀態
pm2 status

# 9. 查看日誌（確認沒有錯誤）
pm2 logs teacher-collab --lines 50
```

## 🔄 如果專案直接在 ~/projects/teacher-collaboration-system 下（沒有 phototype-ui 子目錄）

```bash
# 1. 進入專案目錄
cd ~/projects/teacher-collaboration-system

# 2. 拉取最新代碼
git pull origin main

# 3. 安裝新的依賴（如果有）
npm install

# 4. 重新建置
npm run build

# 5. 重啟 PM2 服務
pm2 restart teacher-collab

# 6. 查看服務狀態
pm2 status

# 7. 查看日誌
pm2 logs teacher-collab --lines 50
```

## 📝 完整指令（複製貼上即可）

```bash
cd ~/projects/teacher-collaboration-system && \
if [ -d "phototype-ui" ]; then \
  cd phototype-ui && \
  git pull origin main && \
  npm install && \
  npm run build && \
  pm2 restart teacher-collab && \
  pm2 status && \
  echo "✅ 部署完成！查看日誌：pm2 logs teacher-collab --lines 50"; \
else \
  git pull origin main && \
  npm install && \
  npm run build && \
  pm2 restart teacher-collab && \
  pm2 status && \
  echo "✅ 部署完成！查看日誌：pm2 logs teacher-collab --lines 50"; \
fi
```

## 🔍 驗證部署

部署完成後，在瀏覽器開啟：
```
http://140.115.126.19:3000
```

測試網絡圖功能，確認：
- ✅ 進入網絡圖時，所有節點都在畫面內
- ✅ 沒有節點跑出畫面範圍
- ✅ 自動縮放正常運作

## 📝 常用 PM2 指令

```bash
# 查看服務狀態
pm2 status

# 查看日誌
pm2 logs teacher-collab

# 查看最近 50 行日誌
pm2 logs teacher-collab --lines 50

# 重啟服務
pm2 restart teacher-collab

# 停止服務
pm2 stop teacher-collab

# 啟動服務
pm2 start teacher-collab
```


