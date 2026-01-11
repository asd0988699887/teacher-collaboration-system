# 🚀 教師共同備課系統 - 完整部署指南

本指南提供從零開始部署專案到 Ubuntu 伺服器的完整步驟。

---

## 📋 部署資訊總覽

### 伺服器資訊
- **IP 位址**: 140.115.126.19
- **Hostname**: apisix
- **使用者**: apisix (有 sudo 權限)
- **作業系統**: Ubuntu Linux (ESXi VM)
- **部署目錄**: `/home/apisix/projects/teacher-collaboration-system`

### GitHub 資訊
- **Repository**: `https://github.com/asd098869887/teacher-collaboration-system`
- **主分支**: main

### 服務資訊
- **服務名稱**: phototype-ui
- **Port**: 3000
- **存取網址**: `http://140.115.126.19:3000`
- **Process Manager**: PM2

### 資料庫資訊
- **資料庫名稱**: teacher_collaboration_system
- **使用者**: root
- **密碼**: root
- **類型**: MySQL 8.0+

---

## 🎯 部署流程概覽

```
本機 (Windows)          GitHub                伺服器 (Ubuntu)
    │                     │                        │
    │──[1]─ git init ────>│                        │
    │──[2]─ git push ────>│                        │
    │                     │<────[3]─ git clone ────│
    │                     │                        │
    │                     │      [4] 安裝環境      │
    │                     │      [5] 匯入資料庫    │
    │                     │      [6] 建置專案      │
    │                     │      [7] PM2 啟動      │
    │                     │                        │
    └─────────────────────┴────────────────────────┘
```

---

## 📍 階段一：本機端操作（Windows）

### 前置檢查

確保您已經：
- ✅ 完成檔案上傳驗證功能的修改
- ✅ 在本機測試過功能正常
- ✅ 有 GitHub 帳號 (`asd098869887`)

### 步驟 1-1: 使用自動化腳本（推薦）

在本機 PowerShell 中，進入專案目錄：

```powershell
# 進入專案目錄
cd C:\Users\翔哥\.cursor\worktrees\cursor___1203\ey93j\phototype-ui

# 執行 Git 初始化腳本
.\git-init.ps1
```

腳本會自動完成：
1. ✅ 初始化 Git repository
2. ✅ 加入所有檔案
3. ✅ 創建第一個 commit
4. ✅ 設定主分支為 main
5. ✅ 提示您在 GitHub 創建 repository
6. ✅ 設定 remote origin
7. ✅ 推送到 GitHub

### 步驟 1-2: 手動操作（如果不用腳本）

```powershell
# 進入專案目錄
cd phototype-ui

# 初始化 Git
git init

# 加入所有檔案
git add .

# 查看狀態
git status

# 創建第一個 commit
git commit -m "Initial commit: Teacher Collaboration System with file upload validation"

# 設定主分支名稱
git branch -M main

# 設定 remote
git remote add origin https://github.com/asd098869887/teacher-collaboration-system.git

# 推送到 GitHub
git push -u origin main
```

### 步驟 1-3: 在 GitHub 創建 Repository

**在執行 git push 之前，需要先在 GitHub 創建 repository：**

1. 開啟瀏覽器前往：https://github.com/new
2. **Repository name** 填入：`teacher-collaboration-system`
3. 設定為 **Private**（建議）或 Public
4. **不要勾選** "Initialize this repository with a README"
5. **不要勾選** "Add .gitignore"
6. **不要勾選** "Choose a license"
7. 點擊 **"Create repository"**

**完成後回到 PowerShell 繼續執行 git push。**

---

## 📍 階段二：伺服器端操作（Ubuntu）

### 步驟 2-1: SSH 連接到伺服器

```bash
# 從本機連接到伺服器
ssh apisix@140.115.126.19
```

### 步驟 2-2: 創建專案目錄

```bash
# 創建 projects 目錄
mkdir -p /home/apisix/projects

# 進入目錄
cd /home/apisix/projects
```

### 步驟 2-3: Clone 專案

```bash
# Clone 專案（第一次部署）
git clone https://github.com/asd098869887/teacher-collaboration-system.git

# 進入專案目錄
cd teacher-collaboration-system/phototype-ui

# 查看檔案
ls -la
```

### 步驟 2-4: 執行自動化部署腳本（推薦）

```bash
# 給予執行權限
chmod +x deploy-server.sh

# 執行部署腳本
./deploy-server.sh
```

**腳本會自動完成所有部署步驟，大約需要 5-10 分鐘。**

部署腳本包含：
1. ✅ 更新系統套件
2. ✅ 安裝 Git
3. ✅ 安裝 Node.js 20.x LTS
4. ✅ 安裝 MySQL 8.0
5. ✅ 設定 MySQL root 密碼
6. ✅ 匯入主資料庫架構
7. ✅ 匯入補充架構（通知、教案、收斂討論）
8. ✅ 匯入測試資料（learning contents + performances）
9. ✅ 創建 `.env.production`
10. ✅ 創建上傳目錄
11. ✅ 安裝 npm 依賴
12. ✅ 建置專案
13. ✅ 安裝並啟動 PM2
14. ✅ 設定開機自動啟動

### 步驟 2-5: 手動部署（如果不用腳本）

<details>
<summary>點擊展開手動部署步驟</summary>

```bash
# 1. 更新系統
sudo apt update -y
sudo apt upgrade -y

# 2. 安裝 Git
sudo apt install -y git
git --version

# 3. 安裝 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node --version
npm --version

# 4. 安裝 MySQL
sudo apt install -y mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql

# 5. 設定 MySQL root 密碼
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';"
sudo mysql -e "FLUSH PRIVILEGES;"

# 6. 匯入資料庫（在 phototype-ui 目錄下）
mysql -u root -proot < database/schema.sql
mysql -u root -proot teacher_collaboration_system < database/notifications_schema.sql
mysql -u root -proot teacher_collaboration_system < database/lesson_plans_schema.sql
mysql -u root -proot teacher_collaboration_system < database/convergence_comments_schema.sql
mysql -u root -proot teacher_collaboration_system < database/permissions.sql

# 匯入測試資料 - Contents
mysql -u root -proot teacher_collaboration_system < database/seed_chinese_learning_contents.sql
mysql -u root -proot teacher_collaboration_system < database/seed_english_learning_contents.sql
mysql -u root -proot teacher_collaboration_system < database/seed_math_learning_contents.sql
mysql -u root -proot teacher_collaboration_system < database/seed_social_learning_contents.sql

# 匯入測試資料 - Performances
mysql -u root -proot teacher_collaboration_system < database/seed_chinese_learning_performances.sql
mysql -u root -proot teacher_collaboration_system < database/seed_english_learning_performances.sql
mysql -u root -proot teacher_collaboration_system < database/seed_math_learning_performances.sql
mysql -u root -proot teacher_collaboration_system < database/seed_social_learning_performances.sql

# 7. 創建環境變數檔案
cat > .env.production << EOF
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=teacher_collaboration_system
NODE_ENV=production
PORT=3000
MAX_FILE_SIZE=10485760
EOF

# 8. 創建上傳目錄
mkdir -p public/uploads
chmod 755 public/uploads

# 9. 安裝依賴
npm install

# 10. 建置專案
npm run build

# 11. 安裝 PM2
sudo npm install -g pm2

# 12. 啟動服務
pm2 start npm --name "phototype-ui" -- start

# 13. 設定開機自動啟動
pm2 startup
pm2 save
```

</details>

---

## 🎉 部署完成

### 驗證部署

1. **檢查服務狀態**
```bash
pm2 status
```

2. **查看服務日誌**
```bash
pm2 logs phototype-ui
```

3. **在瀏覽器測試**

開啟瀏覽器訪問：
```
http://140.115.126.19:3000
```

### 測試檔案上傳功能

1. 登入系統
2. 進入任一社群
3. 上傳測試檔案：
   - ✅ 測試小圖片（< 10MB）→ 應該成功
   - ✅ 測試 PDF 文件 → 應該成功
   - ❌ 測試大檔案（> 10MB）→ 應該失敗並顯示錯誤
   - ❌ 測試不支援的類型（如 .exe）→ 應該失敗

---

## 🔄 後續更新流程

當您在本機修改代碼後，需要更新到伺服器：

### 本機端：

```powershell
# 提交變更
git add .
git commit -m "描述您的修改"
git push origin main
```

### 伺服器端：

```bash
# SSH 連接
ssh apisix@140.115.126.19

# 進入專案目錄
cd /home/apisix/projects/teacher-collaboration-system/phototype-ui

# 執行更新腳本
./update-server.sh
```

或手動執行：

```bash
git pull origin main
npm install
npm run build
pm2 restart phototype-ui
```

---

## 🛠️ PM2 常用指令

```bash
# 查看服務列表
pm2 list

# 查看服務詳細資訊
pm2 info phototype-ui

# 查看即時日誌
pm2 logs phototype-ui

# 查看最近 50 行日誌
pm2 logs phototype-ui --lines 50

# 清除日誌
pm2 flush

# 重啟服務
pm2 restart phototype-ui

# 停止服務
pm2 stop phototype-ui

# 啟動服務
pm2 start phototype-ui

# 刪除服務
pm2 delete phototype-ui

# 監控資源使用
pm2 monit

# 保存目前配置
pm2 save

# 查看開機啟動命令
pm2 startup
```

---

## 🗄️ 資料庫管理

### 連接資料庫

```bash
# 登入 MySQL
mysql -u root -proot

# 切換到專案資料庫
USE teacher_collaboration_system;

# 查看所有資料表
SHOW TABLES;

# 查看特定表的資料
SELECT * FROM users LIMIT 10;

# 離開
EXIT;
```

### 備份資料庫

```bash
# 備份整個資料庫
mysqldump -u root -proot teacher_collaboration_system > backup_$(date +%Y%m%d).sql

# 備份特定資料表
mysqldump -u root -proot teacher_collaboration_system users communities > backup_users_$(date +%Y%m%d).sql
```

### 還原資料庫

```bash
# 還原資料庫
mysql -u root -proot teacher_collaboration_system < backup_20260111.sql
```

---

## 🔍 常見問題排除

### 問題 1: 無法訪問服務（連接被拒絕）

**可能原因：**
- PM2 服務未啟動
- Port 3000 被佔用

**解決方法：**
```bash
# 檢查服務狀態
pm2 status

# 檢查 port 是否被佔用
sudo lsof -i :3000

# 重啟服務
pm2 restart phototype-ui

# 查看錯誤日誌
pm2 logs phototype-ui --err
```

### 問題 2: 資料庫連接失敗

**可能原因：**
- MySQL 服務未啟動
- 密碼錯誤
- 環境變數未正確設定

**解決方法：**
```bash
# 檢查 MySQL 狀態
sudo systemctl status mysql

# 啟動 MySQL
sudo systemctl start mysql

# 測試連接
mysql -u root -proot teacher_collaboration_system

# 檢查環境變數
cat .env.production

# 重啟服務讓環境變數生效
pm2 restart phototype-ui
```

### 問題 3: 檔案上傳失敗

**可能原因：**
- 上傳目錄不存在
- 權限不足

**解決方法：**
```bash
# 檢查上傳目錄
ls -la public/uploads

# 創建目錄（如果不存在）
mkdir -p public/uploads

# 設定權限
chmod 755 public/uploads

# 檢查磁碟空間
df -h
```

### 問題 4: Git clone/pull 失敗

**可能原因：**
- Repository 是 Private，需要驗證
- 網路問題

**解決方法：**

如果 repository 是 private，需要使用 Personal Access Token：

1. 在 GitHub 創建 Personal Access Token：
   - Settings → Developer settings → Personal access tokens → Generate new token
   - 選擇 `repo` 權限
   - 複製 token

2. Clone 時使用 token：
```bash
git clone https://YOUR_TOKEN@github.com/asd098869887/teacher-collaboration-system.git
```

或設定 credential helper：
```bash
git config --global credential.helper store
```

### 問題 5: npm install 失敗

**可能原因：**
- Node.js 版本不對
- 網路問題
- 磁碟空間不足

**解決方法：**
```bash
# 檢查 Node.js 版本（需要 18+）
node --version

# 清除 npm 快取
npm cache clean --force

# 重新安裝
rm -rf node_modules package-lock.json
npm install

# 檢查磁碟空間
df -h
```

---

## 📊 系統監控

### 監控服務健康狀態

```bash
# PM2 監控面板
pm2 monit

# 查看資源使用
pm2 list

# 查看系統資源
htop  # 需要先安裝: sudo apt install htop

# 查看磁碟使用
df -h

# 查看記憶體使用
free -h
```

### 設定日誌輪轉

PM2 自動管理日誌，但如果日誌太大可以：

```bash
# 安裝 PM2 日誌輪轉模組
pm2 install pm2-logrotate

# 設定最大檔案大小（10MB）
pm2 set pm2-logrotate:max_size 10M

# 設定保留天數
pm2 set pm2-logrotate:retain 7
```

---

## 🔐 安全性建議

### 生產環境建議（之後上線時）

1. **修改資料庫密碼**
```bash
# 登入 MySQL
sudo mysql

# 創建專用使用者
CREATE USER 'phototype'@'localhost' IDENTIFIED BY '強密碼';
GRANT ALL PRIVILEGES ON teacher_collaboration_system.* TO 'phototype'@'localhost';
FLUSH PRIVILEGES;

# 修改 .env.production
DB_USER=phototype
DB_PASSWORD=強密碼
```

2. **設定防火牆**（如果需要對外開放）
```bash
# 安裝 UFW
sudo apt install ufw

# 允許 SSH
sudo ufw allow 22/tcp

# 允許應用 port
sudo ufw allow 3000/tcp

# 啟用防火牆
sudo ufw enable

# 查看狀態
sudo ufw status
```

3. **使用 Nginx 反向代理**（可選）
```bash
# 安裝 Nginx
sudo apt install nginx

# 配置 Nginx（省略詳細步驟）
# 可以將 port 80 轉發到 3000
```

4. **設定 HTTPS**（可選，使用 Let's Encrypt）

---

## 📝 環境變數說明

`.env.production` 檔案內容：

```plaintext
# 資料庫設定
DB_HOST=localhost           # 資料庫主機
DB_PORT=3306               # 資料庫 port
DB_USER=root               # 資料庫使用者
DB_PASSWORD=root           # 資料庫密碼
DB_NAME=teacher_collaboration_system  # 資料庫名稱

# Node.js 環境
NODE_ENV=production        # 環境模式（production/development）
PORT=3000                  # 應用程式 port

# 檔案上傳設定
MAX_FILE_SIZE=10485760     # 最大檔案大小（bytes）
                          # 10MB = 10485760
                          # 20MB = 20971520
                          # 50MB = 52428800
```

修改後需要重啟服務：
```bash
pm2 restart phototype-ui
```

---

## 📞 技術支援

### 查看日誌
```bash
# 應用程式日誌
pm2 logs phototype-ui

# MySQL 錯誤日誌
sudo tail -f /var/log/mysql/error.log

# 系統日誌
sudo journalctl -xe
```

### 完全重新部署

如果遇到無法解決的問題，可以完全重新部署：

```bash
# 停止並刪除 PM2 服務
pm2 stop phototype-ui
pm2 delete phototype-ui

# 刪除專案目錄
cd /home/apisix/projects
rm -rf teacher-collaboration-system

# 重新 clone
git clone https://github.com/asd098869887/teacher-collaboration-system.git
cd teacher-collaboration-system/phototype-ui

# 重新執行部署腳本
chmod +x deploy-server.sh
./deploy-server.sh
```

---

## ✅ 檢查清單

### 部署前
- [ ] 本機代碼已測試
- [ ] GitHub repository 已創建
- [ ] 代碼已推送到 GitHub
- [ ] SSH 可以連接到伺服器

### 部署中
- [ ] 伺服器環境已安裝（Node.js, Git, MySQL）
- [ ] 專案已 clone 到伺服器
- [ ] 資料庫已建立並匯入
- [ ] 環境變數已設定
- [ ] 專案已建置
- [ ] PM2 服務已啟動

### 部署後
- [ ] 可以在瀏覽器訪問 http://140.115.126.19:3000
- [ ] 可以註冊/登入
- [ ] 可以上傳檔案
- [ ] 檔案大小和類型驗證正常運作
- [ ] PM2 開機自動啟動已設定

---

**部署完成日期：** 2026-01-11
**文件版本：** 1.0
**維護者：** asd098869887

🎉 祝部署順利！

