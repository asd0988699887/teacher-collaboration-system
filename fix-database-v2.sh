#!/bin/bash

# ============================================
# 資料庫修復腳本 v2
# 先建表，再匯入資料
# ============================================

set -e

echo "=========================================="
echo "資料庫修復腳本 v2"
echo "=========================================="

DB_NAME="teacher_collaboration_system"

echo "步驟 1: 匯入額外的 schema 檔案"
echo "-------------------------------------------"

sudo mysql "$DB_NAME" < database/notifications_schema.sql 2>/dev/null && echo "✓ notifications_schema.sql" || echo "✗ 已存在"
sudo mysql "$DB_NAME" < database/lesson_plans_schema.sql 2>/dev/null && echo "✓ lesson_plans_schema.sql" || echo "✗ 已存在"
sudo mysql "$DB_NAME" < database/convergence_comments_schema.sql 2>/dev/null && echo "✓ convergence_comments_schema.sql" || echo "✗ 已存在"

echo ""
echo "步驟 2: 執行資料庫遷移"
echo "-------------------------------------------"

sudo mysql "$DB_NAME" < database/add_idea_activity_id.sql 2>/dev/null && echo "✓ add_idea_activity_id.sql" || echo "✗ 已存在"
sudo mysql "$DB_NAME" < database/add_current_version_id.sql 2>/dev/null && echo "✓ add_current_version_id.sql" || echo "✗ 已存在"

echo ""
echo "步驟 3: 建立學習內容資料表"
echo "-------------------------------------------"

sudo mysql "$DB_NAME" < database/create_math_learning_contents.sql && echo "✓ 數學科學習內容表"
sudo mysql "$DB_NAME" < database/create_chinese_learning_contents.sql && echo "✓ 國語科學習內容表"
sudo mysql "$DB_NAME" < database/create_english_learning_contents.sql && echo "✓ 英語科學習內容表"
sudo mysql "$DB_NAME" < database/create_social_learning_contents.sql && echo "✓ 社會科學習內容表"

echo ""
echo "步驟 4: 建立學習表現資料表"
echo "-------------------------------------------"

sudo mysql "$DB_NAME" < database/create_math_learning_performances.sql && echo "✓ 數學科學習表現表"
sudo mysql "$DB_NAME" < database/create_chinese_learning_performances.sql && echo "✓ 國語科學習表現表"
sudo mysql "$DB_NAME" < database/create_english_learning_performances.sql && echo "✓ 英語科學習表現表"
sudo mysql "$DB_NAME" < database/create_social_learning_performances.sql && echo "✓ 社會科學習表現表"

echo ""
echo "步驟 5: 匯入學習內容資料"
echo "-------------------------------------------"

sudo mysql "$DB_NAME" < database/seed_math_learning_contents.sql && echo "✓ 數學科學習內容"
sudo mysql "$DB_NAME" < database/seed_chinese_learning_contents.sql && echo "✓ 國語科學習內容"
sudo mysql "$DB_NAME" < database/seed_english_learning_contents.sql && echo "✓ 英語科學習內容"
sudo mysql "$DB_NAME" < database/seed_social_learning_contents.sql && echo "✓ 社會科學習內容"

echo ""
echo "步驟 6: 匯入學習表現資料"
echo "-------------------------------------------"

sudo mysql "$DB_NAME" < database/seed_math_learning_performances.sql && echo "✓ 數學科學習表現"
sudo mysql "$DB_NAME" < database/seed_chinese_learning_performances.sql && echo "✓ 國語科學習表現"
sudo mysql "$DB_NAME" < database/seed_english_learning_performances.sql && echo "✓ 英語科學習表現"
sudo mysql "$DB_NAME" < database/seed_social_learning_performances.sql && echo "✓ 社會科學習表現"

echo ""
echo "步驟 7: 驗證資料庫"
echo "-------------------------------------------"

echo "所有資料表："
sudo mysql -e "USE $DB_NAME; SHOW TABLES;" | grep -E "learning|ideas|lesson_plans"

echo ""
echo "ideas 表結構（確認 activity_id）："
sudo mysql -e "USE $DB_NAME; DESCRIBE ideas;" | grep -E "Field|activity_id"

echo ""
echo "學習內容資料數量："
sudo mysql -e "USE $DB_NAME; 
SELECT '數學科' AS 科目, COUNT(*) AS 數量 FROM math_learning_contents 
UNION ALL SELECT '國語科', COUNT(*) FROM chinese_learning_contents 
UNION ALL SELECT '英語科', COUNT(*) FROM english_learning_contents 
UNION ALL SELECT '社會科', COUNT(*) FROM social_learning_contents;"

echo ""
echo "學習表現資料數量："
sudo mysql -e "USE $DB_NAME; 
SELECT '數學科' AS 科目, COUNT(*) AS 數量 FROM math_learning_performances 
UNION ALL SELECT '國語科', COUNT(*) FROM chinese_learning_performances 
UNION ALL SELECT '英語科', COUNT(*) FROM english_learning_performances 
UNION ALL SELECT '社會科', COUNT(*) FROM social_learning_performances;"

echo ""
echo "=========================================="
echo "修復完成！"
echo "=========================================="
echo ""
echo "接下來的步驟："
echo "1. 安裝 PM2: npm install -g pm2"
echo "2. 啟動應用: pm2 start npm --name teacher-collab -- start"
echo "3. 測試功能"
echo ""

