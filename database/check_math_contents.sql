-- ============================================
-- 檢查數學學習內容資料
-- ============================================
USE teacher_collaboration_system;

-- 檢查資料筆數
SELECT COUNT(*) AS total_count FROM math_learning_contents;

-- 檢查各年級資料分布
SELECT grade, COUNT(*) AS count 
FROM math_learning_contents 
GROUP BY grade 
ORDER BY grade;

-- 檢查各類別資料分布
SELECT category, category_name, COUNT(*) AS count 
FROM math_learning_contents 
GROUP BY category, category_name 
ORDER BY category;

-- 查看前 10 筆資料
SELECT id, code, category, category_name, grade, serial, description 
FROM math_learning_contents 
ORDER BY grade, category, serial 
LIMIT 10;

