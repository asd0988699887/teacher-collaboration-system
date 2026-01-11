#!/bin/bash

# ============================================
# 教師共同備課系統 - 伺服器首次部署腳本
# ============================================
# 
# 此腳本會自動完成以下工作：
# 1. 安裝 Node.js、Git、MySQL
# 2. 設定 MySQL
# 3. 匯入資料庫
# 4. 安裝專案依賴
# 5. 建置專案
# 6. 使用 PM2 啟動服務
#
# 使用方式：
#   chmod +x deploy-server.sh
#   ./deploy-server.sh
#
# ============================================

set -e  # 遇到錯誤立即停止

# 顏色輸出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 輔助函數
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

# 檢查是否為 root 或有 sudo 權限
if [ "$EUID" -eq 0 ]; then 
    print_warning "請不要使用 root 使用者執行此腳本"
    print_info "建議使用一般使用者，腳本會在需要時使用 sudo"
    exit 1
fi

if ! sudo -n true 2>/dev/null; then
    print_error "此腳本需要 sudo 權限，請確保您的使用者在 sudoers 中"
    exit 1
fi

print_section "教師共同備課系統 - 伺服器部署"

# ============================================
# 步驟 1: 更新系統
# ============================================
print_section "步驟 1/8: 更新系統套件"
print_info "正在更新套件清單..."
sudo apt update -y
print_success "系統套件更新完成"

# ============================================
# 步驟 2: 安裝 Git
# ============================================
print_section "步驟 2/8: 安裝 Git"
if command -v git &> /dev/null; then
    GIT_VERSION=$(git --version)
    print_success "Git 已安裝: $GIT_VERSION"
else
    print_info "正在安裝 Git..."
    sudo apt install -y git
    print_success "Git 安裝完成: $(git --version)"
fi

# ============================================
# 步驟 3: 安裝 Node.js 20.x
# ============================================
print_section "步驟 3/8: 安裝 Node.js"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_success "Node.js 已安裝: $NODE_VERSION"
else
    print_info "正在安裝 Node.js 20.x LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
    print_success "Node.js 安裝完成: $(node --version)"
    print_success "npm 版本: $(npm --version)"
fi

# ============================================
# 步驟 4: 安裝 MySQL
# ============================================
print_section "步驟 4/8: 安裝 MySQL"
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version)
    print_success "MySQL 已安裝: $MYSQL_VERSION"
else
    print_info "正在安裝 MySQL Server..."
    sudo apt install -y mysql-server
    
    print_info "啟動 MySQL 服務..."
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    print_success "MySQL 安裝完成"
    
    # 設定 MySQL root 密碼
    print_info "正在設定 MySQL root 密碼為 'root'..."
    sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root';"
    sudo mysql -e "FLUSH PRIVILEGES;"
    print_success "MySQL root 密碼設定完成"
fi

# ============================================
# 步驟 5: 匯入資料庫
# ============================================
print_section "步驟 5/8: 匯入資料庫"

# 取得腳本所在目錄（專案根目錄）
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DB_DIR="$SCRIPT_DIR/database"

if [ ! -d "$DB_DIR" ]; then
    print_error "找不到 database 目錄: $DB_DIR"
    exit 1
fi

print_info "資料庫目錄: $DB_DIR"

# 5.1 建立主架構
print_info "1/9: 建立主資料庫架構..."
mysql -u root -proot < "$DB_DIR/schema.sql"
print_success "主架構建立完成"

# 5.2 建立補充架構
print_info "2/9: 建立通知系統架構..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/notifications_schema.sql"
print_success "通知系統架構建立完成"

print_info "3/9: 建立教案系統架構..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/lesson_plans_schema.sql"
print_success "教案系統架構建立完成"

print_info "4/9: 建立收斂討論架構..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/convergence_comments_schema.sql"
print_success "收斂討論架構建立完成"

# 5.3 建立權限函數（可選）
if [ -f "$DB_DIR/permissions.sql" ]; then
    print_info "5/9: 建立權限檢查函數..."
    mysql -u root -proot teacher_collaboration_system < "$DB_DIR/permissions.sql" 2>/dev/null || true
    print_success "權限函數建立完成（如有錯誤已忽略）"
else
    print_warning "未找到 permissions.sql，跳過此步驟"
fi

# 5.4 匯入測試資料 - Learning Contents
print_info "6/9: 匯入中文學習內容測試資料..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/seed_chinese_learning_contents.sql"
print_success "中文學習內容匯入完成"

print_info "7/9: 匯入英文學習內容測試資料..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/seed_english_learning_contents.sql"
print_success "英文學習內容匯入完成"

print_info "8/9: 匯入數學學習內容測試資料..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/seed_math_learning_contents.sql"
print_success "數學學習內容匯入完成"

print_info "9/9: 匯入社會學習內容測試資料..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/seed_social_learning_contents.sql"
print_success "社會學習內容匯入完成"

# 5.5 匯入測試資料 - Learning Performances
print_info "10/13: 匯入中文學習表現測試資料..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/seed_chinese_learning_performances.sql"
print_success "中文學習表現匯入完成"

print_info "11/13: 匯入英文學習表現測試資料..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/seed_english_learning_performances.sql"
print_success "英文學習表現匯入完成"

print_info "12/13: 匯入數學學習表現測試資料..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/seed_math_learning_performances.sql"
print_success "數學學習表現匯入完成"

print_info "13/13: 匯入社會學習表現測試資料..."
mysql -u root -proot teacher_collaboration_system < "$DB_DIR/seed_social_learning_performances.sql"
print_success "社會學習表現匯入完成"

print_success "所有資料庫匯入完成！"

# 驗證資料庫
print_info "驗證資料庫..."
TABLES_COUNT=$(mysql -u root -proot teacher_collaboration_system -e "SHOW TABLES;" -s --skip-column-names | wc -l)
print_success "資料庫包含 $TABLES_COUNT 個資料表"

# ============================================
# 步驟 6: 創建環境變數檔案
# ============================================
print_section "步驟 6/8: 創建環境變數檔案"

if [ -f "$SCRIPT_DIR/.env.production" ]; then
    print_warning ".env.production 已存在，跳過創建"
else
    print_info "正在創建 .env.production..."
    cat > "$SCRIPT_DIR/.env.production" << 'EOF'
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=teacher_collaboration_system
NODE_ENV=production
PORT=3000
MAX_FILE_SIZE=10485760
EOF
    print_success ".env.production 創建完成"
fi

# ============================================
# 步驟 7: 確保上傳目錄存在
# ============================================
print_section "步驟 7/8: 創建上傳目錄"

UPLOAD_DIR="$SCRIPT_DIR/public/uploads"
if [ ! -d "$UPLOAD_DIR" ]; then
    print_info "創建上傳目錄: $UPLOAD_DIR"
    mkdir -p "$UPLOAD_DIR"
    chmod 755 "$UPLOAD_DIR"
    print_success "上傳目錄創建完成"
else
    print_success "上傳目錄已存在"
fi

# ============================================
# 步驟 8: 安裝依賴、建置並啟動
# ============================================
print_section "步驟 8/8: 安裝依賴並建置專案"

print_info "正在安裝 npm 依賴..."
npm install
print_success "依賴安裝完成"

print_info "正在建置專案..."
npm run build
print_success "專案建置完成"

# 安裝 PM2
if ! command -v pm2 &> /dev/null; then
    print_info "正在安裝 PM2..."
    sudo npm install -g pm2
    print_success "PM2 安裝完成"
else
    print_success "PM2 已安裝: $(pm2 --version)"
fi

# 檢查是否已經在運行
if pm2 list | grep -q "phototype-ui"; then
    print_info "檢測到服務已在運行，正在重啟..."
    pm2 restart phototype-ui
    print_success "服務重啟完成"
else
    print_info "正在啟動服務..."
    pm2 start npm --name "phototype-ui" -- start
    print_success "服務啟動完成"
fi

# 設定 PM2 開機自動啟動
print_info "設定 PM2 開機自動啟動..."
pm2 startup systemd -u $USER --hp $HOME > /dev/null 2>&1 || true
pm2 save
print_success "開機自動啟動設定完成"

# ============================================
# 完成
# ============================================
print_section "部署完成！"

# 取得伺服器 IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo ""
print_success "✅ 所有步驟已完成！"
echo ""
print_info "服務資訊："
echo "  - 服務名稱: phototype-ui"
echo "  - 運行狀態: $(pm2 list | grep phototype-ui | awk '{print $10}')"
echo "  - 存取網址: http://$SERVER_IP:3000"
echo "  - 或使用: http://140.115.126.19:3000"
echo ""
print_info "常用指令："
echo "  - 查看狀態: pm2 status"
echo "  - 查看日誌: pm2 logs phototype-ui"
echo "  - 重啟服務: pm2 restart phototype-ui"
echo "  - 停止服務: pm2 stop phototype-ui"
echo "  - 開機啟動: pm2 startup 和 pm2 save"
echo ""
print_info "資料庫資訊："
echo "  - 資料庫名稱: teacher_collaboration_system"
echo "  - 使用者: root"
echo "  - 密碼: root"
echo "  - 包含資料表: $TABLES_COUNT 個"
echo ""
print_warning "注意事項："
echo "  - 如需修改設定，請編輯 .env.production"
echo "  - 修改後需重啟服務: pm2 restart phototype-ui"
echo "  - 上傳目錄位於: $UPLOAD_DIR"
echo ""
print_success "🎉 部署完成！請在瀏覽器開啟 http://140.115.126.19:3000 測試"

