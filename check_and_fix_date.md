# 伺服器日期修正說明

## 目前狀態
從 `timedatectl` 輸出可以看到：
- ✅ 本地時間：**Wed 2026-01-28 06:14:40 CST**（正確！）
- ✅ 時區：**Asia/Taipei (CST, +0800)**（正確！）
- ✅ 系統時鐘已同步：**yes**
- ✅ NTP 服務：**active**

**系統時間已經是正確的了！**

## 問題分析
如果應用程式還是顯示 1/27，可能是：
1. 應用程式快取了舊的時間
2. 資料庫中的時間戳記是舊的
3. 前端 JavaScript 的時間處理有問題

## 解決方案

### 1. 確認專案目錄
```bash
# 檢查專案目錄結構
ls -la /home/apisix/projects/

# 如果專案在根目錄，應該是：
cd /home/apisix/projects/teacher-collaboration-system

# 檢查是否有 phototype-ui 子目錄
ls -la /home/apisix/projects/teacher-collaboration-system/
```

### 2. 重啟應用程式
```bash
# 進入專案目錄（根據實際路徑調整）
cd /home/apisix/projects/teacher-collaboration-system

# 重啟 PM2 讓應用程式重新載入
pm2 restart teacher-collab

# 查看日誌確認
pm2 logs teacher-collab --lines 20
```

### 3. 檢查資料庫時間
```bash
# 連接到資料庫檢查時間
mysql -u root -proot teacher_collaboration_system -e "SELECT NOW() AS current_time;"
```

### 4. 如果時間還是不對，檢查應用程式時區設定
應用程式可能需要在環境變數中設定時區，或者使用資料庫的時間。

