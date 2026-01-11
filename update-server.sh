#!/bin/bash

# ============================================
# 教師共同備課系統 - 伺服器更新腳本
# ============================================
# 
# 此腳本用於更新已部署的專案
# 
# 使用方式：
#   ./update-server.sh
#
# ============================================

set -e  # 遇到錯誤立即停止

# 顏色輸出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}更新教師共同備課系統${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 取得專案目錄
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# 1. 拉取最新代碼
print_info "1/5: 從 GitHub 拉取最新代碼..."
git pull origin main
print_success "代碼更新完成"

# 2. 安裝新的依賴
print_info "2/5: 檢查並安裝新的依賴..."
npm install
print_success "依賴更新完成"

# 3. 重新建置
print_info "3/5: 重新建置專案..."
npm run build
print_success "建置完成"

# 4. 重啟服務
print_info "4/5: 重啟 PM2 服務..."
pm2 restart phototype-ui
print_success "服務重啟完成"

# 5. 顯示狀態
print_info "5/5: 檢查服務狀態..."
sleep 2
pm2 list

echo ""
print_success "✅ 更新完成！"
echo ""
print_info "查看日誌："
echo "  pm2 logs phototype-ui"
echo ""
print_info "服務網址："
echo "  http://140.115.126.19:3000"
echo ""

