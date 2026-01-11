# ============================================
# 教師共同備課系統 - Git 初始化腳本 (PowerShell)
# ============================================
# 
# 此腳本會將專案初始化為 Git repository 並推送到 GitHub
# 
# 使用方式：
#   在 phototype-ui 目錄下執行：
#   .\git-init.ps1
#
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "Git Repository 初始化" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""

# 檢查是否已經是 Git repository
if (Test-Path ".git") {
    Write-Host "[警告] 此目錄已經是 Git repository" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "是否要繼續? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        Write-Host "操作已取消" -ForegroundColor Yellow
        exit 0
    }
}

# 步驟 1: Git init
Write-Host "[1/6] 初始化 Git repository..." -ForegroundColor Cyan
if (-not (Test-Path ".git")) {
    git init
    Write-Host "✓ Git repository 初始化完成" -ForegroundColor Green
} else {
    Write-Host "✓ 已是 Git repository，跳過初始化" -ForegroundColor Green
}

# 步驟 2: 檢查 .gitignore
Write-Host ""
Write-Host "[2/6] 檢查 .gitignore..." -ForegroundColor Cyan
if (Test-Path ".gitignore") {
    Write-Host "✓ .gitignore 已存在" -ForegroundColor Green
} else {
    Write-Host "! 警告: 找不到 .gitignore" -ForegroundColor Yellow
}

# 步驟 3: Add 所有檔案
Write-Host ""
Write-Host "[3/6] 加入所有檔案到 Git..." -ForegroundColor Cyan
git add .
Write-Host "✓ 檔案加入完成" -ForegroundColor Green

# 顯示將要提交的檔案
Write-Host ""
Write-Host "即將提交的檔案:" -ForegroundColor Yellow
git status --short

# 步驟 4: Commit
Write-Host ""
Write-Host "[4/6] 創建第一個 commit..." -ForegroundColor Cyan
git commit -m "Initial commit: Teacher Collaboration System with file upload validation"
Write-Host "✓ Commit 完成" -ForegroundColor Green

# 步驟 5: 設定主分支名稱
Write-Host ""
Write-Host "[5/6] 設定主分支為 main..." -ForegroundColor Cyan
git branch -M main
Write-Host "✓ 主分支設定完成" -ForegroundColor Green

# 步驟 6: 設定 remote
Write-Host ""
Write-Host "[6/6] 設定 GitHub remote..." -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "重要提示：請先在 GitHub 創建 repository" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "請依照以下步驟操作：" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. 開啟瀏覽器前往: https://github.com/new" -ForegroundColor White
Write-Host "2. Repository name 填入: teacher-collaboration-system" -ForegroundColor White
Write-Host "3. 設定為 Private（建議）或 Public" -ForegroundColor White
Write-Host "4. 不要勾選 'Initialize this repository with a README'" -ForegroundColor White
Write-Host "5. 不要勾選 'Add .gitignore'" -ForegroundColor White
Write-Host "6. 不要勾選 'Choose a license'" -ForegroundColor White
Write-Host "7. 點擊 'Create repository'" -ForegroundColor White
Write-Host ""
Write-Host "完成後按任意鍵繼續..." -ForegroundColor Yellow
$null = Read-Host

# 檢查 remote 是否已存在
$remoteExists = git remote | Select-String -Pattern "origin"

if ($remoteExists) {
    Write-Host ""
    Write-Host "remote 'origin' 已存在" -ForegroundColor Yellow
    git remote -v
    Write-Host ""
    $updateRemote = Read-Host "是否要更新 remote URL? (y/N)"
    if ($updateRemote -eq "y" -or $updateRemote -eq "Y") {
        git remote remove origin
        git remote add origin https://github.com/asd098869887/teacher-collaboration-system.git
        Write-Host "✓ Remote URL 已更新" -ForegroundColor Green
    }
} else {
    git remote add origin https://github.com/asd098869887/teacher-collaboration-system.git
    Write-Host "✓ Remote 設定完成" -ForegroundColor Green
}

# 顯示 remote 資訊
Write-Host ""
Write-Host "目前的 remote 設定:" -ForegroundColor Cyan
git remote -v

# 推送到 GitHub
Write-Host ""
Write-Host "========================================" -ForegroundColor Blue
Write-Host "準備推送到 GitHub" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue
Write-Host ""
Write-Host "即將執行: git push -u origin main" -ForegroundColor Cyan
Write-Host ""
$push = Read-Host "確定要推送? (y/N)"

if ($push -eq "y" -or $push -eq "Y") {
    Write-Host ""
    Write-Host "正在推送到 GitHub..." -ForegroundColor Cyan
    git push -u origin main
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ 成功推送到 GitHub！" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repository URL:" -ForegroundColor Cyan
    Write-Host "https://github.com/asd098869887/teacher-collaboration-system" -ForegroundColor White
    Write-Host ""
    Write-Host "下一步：" -ForegroundColor Yellow
    Write-Host "1. 前往伺服器 (ssh apisix@140.115.126.19)" -ForegroundColor White
    Write-Host "2. 創建專案目錄: mkdir -p /home/apisix/projects" -ForegroundColor White
    Write-Host "3. 進入目錄: cd /home/apisix/projects" -ForegroundColor White
    Write-Host "4. Clone 專案: git clone https://github.com/asd098869887/teacher-collaboration-system.git" -ForegroundColor White
    Write-Host "5. 進入專案: cd teacher-collaboration-system/phototype-ui" -ForegroundColor White
    Write-Host "6. 執行部署: chmod +x deploy-server.sh && ./deploy-server.sh" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "推送已取消" -ForegroundColor Yellow
    Write-Host "稍後可手動執行: git push -u origin main" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "腳本執行完畢" -ForegroundColor Green
Write-Host ""

