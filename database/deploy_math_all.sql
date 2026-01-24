-- ============================================
-- 數學學習表現與學習內容（國中/高中）完整部署腳本
-- ============================================
-- 此腳本將：
-- 1. 創建 math_middle_high_performances 資料表（學習表現）
-- 2. 創建 math_middle_high_contents 資料表（學習內容）
-- 3. 匯入所有數學學習表現資料（國中 IV + 高中 V）
-- 4. 匯入所有數學學習內容資料（7-12年級）
-- ============================================

-- ============================================
-- 步驟 1: 創建學習表現資料表
-- ============================================
SOURCE C:/Users/翔哥/.cursor/worktrees/cursor___1203/ey93j/phototype-ui/database/migrations/add_math_middle_high_performances.sql;

-- ============================================
-- 步驟 2: 創建學習內容資料表
-- ============================================
SOURCE C:/Users/翔哥/.cursor/worktrees/cursor___1203/ey93j/phototype-ui/database/migrations/add_math_middle_high_contents.sql;

-- ============================================
-- 步驟 3: 匯入學習表現種子資料
-- ============================================
SOURCE C:/Users/翔哥/.cursor/worktrees/cursor___1203/ey93j/phototype-ui/database/seeds/math_middle_high_performances_seed.sql;

-- ============================================
-- 步驟 4: 匯入學習內容種子資料
-- ============================================
SOURCE C:/Users/翔哥/.cursor/worktrees/cursor___1203/ey93j/phototype-ui/database/seeds/math_middle_high_contents_seed.sql;

-- ============================================
-- 驗證資料
-- ============================================
SELECT '============ 驗證結果 ============' AS message;

SELECT '=== 學習表現統計 ===' AS message;
SELECT 
  school_level AS 學段,
  category AS 項目,
  category_name AS 項目名稱,
  COUNT(*) AS 學習表現數量
FROM math_middle_high_performances
GROUP BY school_level, category, category_name
ORDER BY school_level, category;

SELECT '=== 學習內容統計 ===' AS message;
SELECT 
  school_level AS 學段,
  grade AS 年級,
  COUNT(*) AS 學習內容數量
FROM math_middle_high_contents
GROUP BY school_level, grade
ORDER BY school_level, 
  CASE 
    WHEN grade = '7年級' THEN 1
    WHEN grade = '8年級' THEN 2
    WHEN grade = '9年級' THEN 3
    WHEN grade = '10年級' THEN 4
    WHEN grade = '11年級A類' THEN 5
    WHEN grade = '11年級B類' THEN 6
    WHEN grade = '12年級甲類' THEN 7
    WHEN grade = '12年級乙類' THEN 8
    ELSE 99
  END;

SELECT '========== 部署完成 ==========' AS message;

