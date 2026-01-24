#!/bin/bash
# ============================================
# 匯入數學學習內容資料
# ============================================

echo "開始匯入數學學習內容資料..."

# 檢查 MySQL 是否可用
if ! command -v mysql &> /dev/null; then
    echo "錯誤: 找不到 mysql 指令"
    exit 1
fi

# 讀取資料庫連線資訊（從 .env.production 或環境變數）
DB_USER=${DB_USER:-root}
DB_PASSWORD=${DB_PASSWORD:-root}
DB_NAME=${DB_NAME:-teacher_collaboration_system}

echo "使用資料庫: $DB_NAME"
echo "使用者: $DB_USER"

# 步驟 1: 建立資料表
echo ""
echo "步驟 1: 建立資料表..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/create_math_learning_contents.sql

if [ $? -eq 0 ]; then
    echo "✓ 資料表建立成功"
else
    echo "✗ 資料表建立失敗"
    exit 1
fi

# 步驟 2: 匯入資料
echo ""
echo "步驟 2: 匯入資料..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/seed_math_learning_contents.sql

if [ $? -eq 0 ]; then
    echo "✓ 資料匯入成功"
else
    echo "✗ 資料匯入失敗"
    exit 1
fi

# 步驟 3: 驗證資料
echo ""
echo "步驟 3: 驗證資料..."
mysql -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < database/check_math_contents.sql

echo ""
echo "完成！"

