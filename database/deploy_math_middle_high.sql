-- ============================================
-- 數學學習表現（國中/高中）完整部署腳本
-- ============================================
-- 此腳本將：
-- 1. 創建 math_middle_high_performances 資料表
-- 2. 匯入所有數學學習表現資料（國中 IV + 高中 V）
-- ============================================

-- 步驟 1：創建資料表
SOURCE database/migrations/add_math_middle_high_performances.sql;

-- 步驟 2：匯入種子資料
SOURCE database/seeds/math_middle_high_performances_seed.sql;

-- 驗證資料
SELECT '============ 驗證結果 ============' AS message;

SELECT 
  school_level AS 學段,
  category AS 項目,
  category_name AS 項目名稱,
  COUNT(*) AS 學習表現數量
FROM math_middle_high_performances
GROUP BY school_level, category, category_name
ORDER BY school_level, category;

SELECT '========== 部署完成 ==========' AS message;

