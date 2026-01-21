# 推送 Word 表格行高修復到 GitHub

Write-Host "正在提交 Word 表格行高修復..." -ForegroundColor Green

# 添加修改的檔案
git add app/components/CourseObjectives.tsx

# 提交
git commit -m "修復 Word 檔案學習活動設計表格行高問題"

# 推送到 GitHub
git push origin main

Write-Host "推送完成！" -ForegroundColor Green
Write-Host ""
Write-Host "接下來請在伺服器上執行：" -ForegroundColor Yellow
Write-Host "  ssh apisix@140.115.126.19" -ForegroundColor Cyan
Write-Host "  cd /home/apisix/projects/teacher-collaboration-system" -ForegroundColor Cyan
Write-Host "  git pull" -ForegroundColor Cyan
Write-Host "  npm run build" -ForegroundColor Cyan
Write-Host "  pm2 restart teacher-collab" -ForegroundColor Cyan

