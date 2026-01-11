# 🚀 快速部署指令清單

您目前的狀態：已 SSH 登入伺服器，位於 `/home/apisix` 目錄

---

## 📋 伺服器端執行步驟（複製貼上即可）

### 步驟 1: 創建專案目錄並 Clone 專案

```bash
# 創建 projects 目錄
mkdir -p /home/apisix/projects

# 進入目錄
cd /home/apisix/projects

# Clone 專案（請先確保已在 GitHub 創建 repository 並 push）
git clone https://github.com/asd098869887/teacher-collaboration-system.git

# 查看是否 clone 成功
ls -la teacher-collaboration-system
```

**預期輸出：** 應該看到 `teacher-collaboration-system` 目錄

---

### 步驟 2: 進入專案目錄

```bash
# 進入專案的 phototype-ui 目錄
cd teacher-collaboration-system/phototype-ui

# 查看檔案列表（應該看到 deploy-server.sh）
ls -la | grep deploy
```

**預期輸出：** 應該看到 `deploy-server.sh` 和 `update-server.sh`

---

### 步驟 3: 執行自動化部署腳本

```bash
# 給予執行權限
chmod +x deploy-server.sh

# 執行部署（大約需要 5-10 分鐘）
./deploy-server.sh
```

**腳本會自動完成所有部署工作，包括：**
- ✅ 安裝 Node.js、Git、MySQL
- ✅ 設定資料庫
- ✅ 匯入所有 SQL 檔案
- ✅ 建置專案
- ✅ 啟動 PM2 服務

**請等待腳本執行完畢，過程中可能會要求輸入 sudo 密碼。**

---

### 步驟 4: 驗證部署

部署完成後，執行以下指令確認：

```bash
# 查看 PM2 服務狀態
pm2 status

# 查看服務日誌
pm2 logs phototype-ui --lines 20

# 查看資料庫
mysql -u root -proot -e "USE teacher_collaboration_system; SHOW TABLES;"
```

---

## 🌐 測試訪問

在您的瀏覽器開啟：

```
http://140.115.126.19:3000
```

如果可以看到系統首頁，表示部署成功！🎉

---

## 🔄 常用管理指令

```bash
# 查看服務狀態
pm2 status

# 重啟服務
pm2 restart phototype-ui

# 查看日誌
pm2 logs phototype-ui

# 停止服務
pm2 stop phototype-ui

# 啟動服務
pm2 start phototype-ui
```

---

## 📝 如果遇到問題

### 問題：git clone 失敗

**原因：** Repository 可能是 private，或尚未在 GitHub 創建

**解決：**
1. 確認已在 GitHub 創建 repository
2. 確認本機已 push 代碼到 GitHub
3. 如果是 private repository，使用 personal access token

### 問題：deploy-server.sh 執行失敗

**解決：**
```bash
# 查看錯誤訊息
cat /var/log/syslog | grep -i error

# 檢查腳本權限
ls -la deploy-server.sh

# 手動執行腳本並查看詳細輸出
bash -x deploy-server.sh
```

### 問題：無法訪問 http://140.115.126.19:3000

**解決：**
```bash
# 檢查服務是否運行
pm2 status

# 檢查 port 是否被佔用
sudo lsof -i :3000

# 查看服務日誌
pm2 logs phototype-ui --err

# 重啟服務
pm2 restart phototype-ui
```

---

## 📞 需要幫助？

詳細的部署指南和問題排除請參考：
- `DEPLOYMENT_GUIDE_COMPLETE.md` - 完整部署文件
- `FILE_UPLOAD_DEPLOYMENT.md` - 檔案上傳功能說明

祝部署順利！🚀

