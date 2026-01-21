#!/bin/bash

# ============================================
# 資料庫修復腳本
# 用於修復已部署但缺少欄位和資料的資料庫
# ============================================

set -e  # 遇到錯誤立即停止

echo "=========================================="
echo "資料庫修復腳本"
echo "=========================================="
echo ""

DB_NAME="teacher_collaboration_system"
DB_USER="root"
DB_PASSWORD="root"

# 顏色輸出
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}步驟 1: 匯入額外的 schema 檔案${NC}"
echo "-------------------------------------------"

# 匯入 notifications schema
if [ -f "database/notifications_schema.sql" ]; then
    echo -e "${YELLOW}匯入 notifications_schema.sql...${NC}"
    sudo mysql "$DB_NAME" < database/notifications_schema.sql
    echo -e "${GREEN}✓ notifications_schema.sql 匯入成功${NC}"
else
    echo -e "${RED}✗ 找不到 database/notifications_schema.sql${NC}"
fi

# 匯入 lesson_plans schema
if [ -f "database/lesson_plans_schema.sql" ]; then
    echo -e "${YELLOW}匯入 lesson_plans_schema.sql...${NC}"
    sudo mysql "$DB_NAME" < database/lesson_plans_schema.sql
    echo -e "${GREEN}✓ lesson_plans_schema.sql 匯入成功${NC}"
else
    echo -e "${RED}✗ 找不到 database/lesson_plans_schema.sql${NC}"
fi

# 匯入 convergence_comments schema
if [ -f "database/convergence_comments_schema.sql" ]; then
    echo -e "${YELLOW}匯入 convergence_comments_schema.sql...${NC}"
    sudo mysql "$DB_NAME" < database/convergence_comments_schema.sql
    echo -e "${GREEN}✓ convergence_comments_schema.sql 匯入成功${NC}"
else
    echo -e "${RED}✗ 找不到 database/convergence_comments_schema.sql${NC}"
fi

echo ""
echo -e "${BLUE}步驟 2: 執行資料庫遷移（修復缺少的欄位）${NC}"
echo "-------------------------------------------"

# 修復 ideas 表缺少 activity_id 欄位
if [ -f "database/add_idea_activity_id.sql" ]; then
    echo -e "${YELLOW}為 ideas 表新增 activity_id 欄位...${NC}"
    sudo mysql "$DB_NAME" < database/add_idea_activity_id.sql 2>&1 | grep -v "Duplicate column name" || true
    echo -e "${GREEN}✓ ideas 表已更新${NC}"
else
    echo -e "${RED}✗ 找不到 database/add_idea_activity_id.sql${NC}"
fi

# 修復 lesson_plans 表缺少 current_version_id 欄位
if [ -f "database/add_current_version_id.sql" ]; then
    echo -e "${YELLOW}為 lesson_plans 表新增 current_version_id 欄位...${NC}"
    sudo mysql "$DB_NAME" < database/add_current_version_id.sql 2>&1 | grep -v "Duplicate column name" || true
    echo -e "${GREEN}✓ lesson_plans 表已更新${NC}"
else
    echo -e "${RED}✗ 找不到 database/add_current_version_id.sql${NC}"
fi

echo ""
echo -e "${BLUE}步驟 3: 匯入學習內容（learning_contents）${NC}"
echo "-------------------------------------------"

# 數學科
if [ -f "database/seed_math_learning_contents.sql" ]; then
    echo -e "${YELLOW}匯入數學科學習內容...${NC}"
    sudo mysql "$DB_NAME" < database/seed_math_learning_contents.sql
    echo -e "${GREEN}✓ 數學科學習內容匯入成功${NC}"
fi

# 國語科
if [ -f "database/seed_chinese_learning_contents.sql" ]; then
    echo -e "${YELLOW}匯入國語科學習內容...${NC}"
    sudo mysql "$DB_NAME" < database/seed_chinese_learning_contents.sql
    echo -e "${GREEN}✓ 國語科學習內容匯入成功${NC}"
fi

# 英語科
if [ -f "database/seed_english_learning_contents.sql" ]; then
    echo -e "${YELLOW}匯入英語科學習內容...${NC}"
    sudo mysql "$DB_NAME" < database/seed_english_learning_contents.sql
    echo -e "${GREEN}✓ 英語科學習內容匯入成功${NC}"
fi

# 社會科
if [ -f "database/seed_social_learning_contents.sql" ]; then
    echo -e "${YELLOW}匯入社會科學習內容...${NC}"
    sudo mysql "$DB_NAME" < database/seed_social_learning_contents.sql
    echo -e "${GREEN}✓ 社會科學習內容匯入成功${NC}"
fi

echo ""
echo -e "${BLUE}步驟 4: 匯入學習表現（learning_performances）${NC}"
echo "-------------------------------------------"

# 數學科
if [ -f "database/seed_math_learning_performances.sql" ]; then
    echo -e "${YELLOW}匯入數學科學習表現...${NC}"
    sudo mysql "$DB_NAME" < database/seed_math_learning_performances.sql
    echo -e "${GREEN}✓ 數學科學習表現匯入成功${NC}"
fi

# 國語科
if [ -f "database/seed_chinese_learning_performances.sql" ]; then
    echo -e "${YELLOW}匯入國語科學習表現...${NC}"
    sudo mysql "$DB_NAME" < database/seed_chinese_learning_performances.sql
    echo -e "${GREEN}✓ 國語科學習表現匯入成功${NC}"
fi

# 英語科
if [ -f "database/seed_english_learning_performances.sql" ]; then
    echo -e "${YELLOW}匯入英語科學習表現...${NC}"
    sudo mysql "$DB_NAME" < database/seed_english_learning_performances.sql
    echo -e "${GREEN}✓ 英語科學習表現匯入成功${NC}"
fi

# 社會科
if [ -f "database/seed_social_learning_performances.sql" ]; then
    echo -e "${YELLOW}匯入社會科學習表現...${NC}"
    sudo mysql "$DB_NAME" < database/seed_social_learning_performances.sql
    echo -e "${GREEN}✓ 社會科學習表現匯入成功${NC}"
fi

echo ""
echo -e "${BLUE}步驟 5: 驗證資料庫狀態${NC}"
echo "-------------------------------------------"

echo -e "${YELLOW}檢查所有資料表...${NC}"
sudo mysql -e "USE $DB_NAME; SHOW TABLES;"

echo ""
echo -e "${YELLOW}檢查 ideas 表結構（確認 activity_id 欄位）...${NC}"
sudo mysql -e "USE $DB_NAME; DESCRIBE ideas;" | grep -E "Field|activity_id" || echo "查無 activity_id 欄位"

echo ""
echo -e "${YELLOW}檢查學習內容資料數量...${NC}"
sudo mysql -e "USE $DB_NAME; SELECT '數學科學習內容' AS 項目, COUNT(*) AS 數量 FROM learning_contents WHERE subject='數學' UNION ALL SELECT '國語科學習內容', COUNT(*) FROM learning_contents WHERE subject='國語' UNION ALL SELECT '英語科學習內容', COUNT(*) FROM learning_contents WHERE subject='英語' UNION ALL SELECT '社會科學習內容', COUNT(*) FROM learning_contents WHERE subject='社會';"

echo ""
echo -e "${YELLOW}檢查學習表現資料數量...${NC}"
sudo mysql -e "USE $DB_NAME; SELECT '數學科學習表現' AS 項目, COUNT(*) AS 數量 FROM learning_performances WHERE subject='數學' UNION ALL SELECT '國語科學習表現', COUNT(*) FROM learning_performances WHERE subject='國語' UNION ALL SELECT '英語科學習表現', COUNT(*) FROM learning_performances WHERE subject='英語' UNION ALL SELECT '社會科學習表現', COUNT(*) FROM learning_performances WHERE subject='社會';"

echo ""
echo -e "${GREEN}=========================================="
echo "資料庫修復完成！"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}接下來請執行：${NC}"
echo "  pm2 restart teacher-collab"
echo ""
echo -e "${BLUE}然後在瀏覽器中測試：${NC}"
echo "  1. 建立想法節點（ideas）"
echo "  2. 新增教案時選擇學習內容和學習表現"
echo "  3. 編輯教案並儲存，確認資料持久化"
echo ""

