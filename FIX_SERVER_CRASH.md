# 🔧 修復伺服器掛掉問題

## 步驟 1: 檢查服務狀態

```bash
# 查看 PM2 服務狀態
pm2 status

# 查看錯誤日誌
pm2 logs teacher-collab --err --lines 50

# 查看所有日誌
pm2 logs teacher-collab --lines 100
```

## 步驟 2: 檢查建置是否成功

```bash
cd ~/projects/teacher-collaboration-system

# 檢查 .next 目錄是否存在
ls -la .next

# 檢查是否有建置錯誤
cat .next/trace 2>/dev/null || echo "沒有 trace 檔案"
```

## 步驟 3: 重新建置並啟動

```bash
cd ~/projects/teacher-collaboration-system

# 停止服務
pm2 stop teacher-collab

# 清除快取
rm -rf .next
rm -rf node_modules/.cache

# 重新建置（查看是否有錯誤）
npm run build

# 如果建置成功，啟動服務
pm2 start teacher-collab

# 查看狀態
pm2 status

# 查看日誌
pm2 logs teacher-collab --lines 50
```

## 步驟 4: 如果建置失敗，檢查錯誤

```bash
# 查看建置錯誤
npm run build 2>&1 | tee build-error.log

# 檢查 Node.js 版本
node --version

# 檢查 npm 版本
npm --version
```

## 步驟 5: 如果服務無法啟動，檢查端口

```bash
# 檢查 8080 端口是否被佔用
sudo lsof -i :8080

# 或者使用 netstat
netstat -tulpn | grep 8080
```

## 步驟 6: 手動啟動測試

```bash
cd ~/projects/teacher-collaboration-system

# 手動啟動（測試是否有錯誤）
npm start

# 如果手動啟動成功，按 Ctrl+C 停止，然後用 PM2 啟動
pm2 start npm --name "teacher-collab" -- start
```


