# 🔍 尋找伺服器專案路徑指令

請在伺服器上執行以下指令來找到專案位置：

## 步驟 1: 尋找專案目錄

```bash
# 方法 1: 搜尋 package.json
find /home/apisix -name "package.json" -type f 2>/dev/null | grep -v node_modules

# 方法 2: 搜尋 NetworkGraph.tsx（我們剛修改的檔案）
find /home/apisix -name "NetworkGraph.tsx" -type f 2>/dev/null

# 方法 3: 查看 PM2 服務的實際路徑
pm2 describe teacher-collab | grep "script path\|cwd"

# 方法 4: 查看所有目錄
ls -la /home/apisix/

# 方法 5: 搜尋 git 倉庫
find /home/apisix -name ".git" -type d 2>/dev/null
```

## 步驟 2: 確認 PM2 服務資訊

```bash
# 查看服務詳細資訊
pm2 describe teacher-collab

# 查看服務的工作目錄
pm2 show teacher-collab | grep "cwd\|script path"
```

## 步驟 3: 找到專案後，執行更新

找到專案目錄後（假設是 `/path/to/project`），執行：

```bash
cd /path/to/project
git pull origin main
npm install
npm run build
pm2 restart teacher-collab
pm2 logs teacher-collab --lines 50
```


