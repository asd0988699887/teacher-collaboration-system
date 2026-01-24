-- ============================================
-- 社會科學習內容完整安裝腳本
-- 包含：建表 + 國中資料 + 高中資料
-- ============================================

USE teacher_collaboration_system;

-- ============================================
-- 步驟 1：刪除舊表（如果存在）
-- ============================================
DROP TABLE IF EXISTS social_learning_contents;

-- ============================================
-- 步驟 2：創建新表
-- ============================================
CREATE TABLE social_learning_contents (
    id VARCHAR(36) PRIMARY KEY,
    code VARCHAR(20) NOT NULL COMMENT '條目代碼（如：歷Ba-IV-1）',
    stage VARCHAR(5) NOT NULL COMMENT '學段（IV=國中，V=高中）',
    subject VARCHAR(10) NOT NULL COMMENT '科目（歷、地、公）',
    theme VARCHAR(5) NOT NULL COMMENT '主題代碼（A, B, C...）',
    theme_name VARCHAR(100) NOT NULL COMMENT '主題名稱',
    category VARCHAR(5) DEFAULT NULL COMMENT '項目代碼（a, b, c...，可為空）',
    category_name VARCHAR(100) DEFAULT NULL COMMENT '項目名稱（可為空）',
    description TEXT NOT NULL COMMENT '條目描述',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_stage (stage),
    INDEX idx_subject (subject),
    INDEX idx_theme (theme),
    INDEX idx_category (category),
    INDEX idx_stage_subject (stage, subject),
    INDEX idx_theme_category (theme, category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='社會科學習內容資料表（國中+高中）';

-- ============================================
-- 步驟 3：匯入國中歷史科資料
-- ============================================

-- 主題 A: 歷史的基礎觀念（無項目）
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷A-IV-1', 'IV', '歷', 'A', '歷史的基礎觀念', NULL, NULL, '紀年與分期。', 1);

-- 主題 B: 早期臺灣
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ba-IV-1', 'IV', '歷', 'B', '早期臺灣', 'a', '史前文化與臺灣原住民族', '考古發掘與史前文化。', 11),
(UUID(), '歷Ba-IV-2', 'IV', '歷', 'B', '早期臺灣', 'a', '史前文化與臺灣原住民族', '臺灣原住民族的遷徙與傳說。', 12),
(UUID(), '歷Bb-IV-1', 'IV', '歷', 'B', '早期臺灣', 'b', '大航海時代的臺灣', '十六、十七世紀東亞海域的各方勢力。', 21),
(UUID(), '歷Bb-IV-2', 'IV', '歷', 'B', '早期臺灣', 'b', '大航海時代的臺灣', '原住民族與外來者的接觸。', 22);

-- 主題 C: 清帝國時期的臺灣
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ca-IV-1', 'IV', '歷', 'C', '清帝國時期的臺灣', 'a', '政治經濟的變遷', '清帝國的統治政策。', 31),
(UUID(), '歷Ca-IV-2', 'IV', '歷', 'C', '清帝國時期的臺灣', 'a', '政治經濟的變遷', '農商業的發展。', 32),
(UUID(), '歷Cb-IV-1', 'IV', '歷', 'C', '清帝國時期的臺灣', 'b', '社會文化的變遷', '原住民族社會及其變化。', 41),
(UUID(), '歷Cb-IV-2', 'IV', '歷', 'C', '清帝國時期的臺灣', 'b', '社會文化的變遷', '漢人社會的活動。', 42);

-- 主題 D: 歷史考察（一）
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷D-IV-1', 'IV', '歷', 'D', '歷史考察（一）', NULL, NULL, '地方史探究（一）。', 51),
(UUID(), '歷D-IV-2', 'IV', '歷', 'D', '歷史考察（一）', NULL, NULL, '從主題B或C挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 52);

-- 主題 E: 日本帝國時期的臺灣
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ea-IV-1', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'a', '政治經濟的變遷', '殖民統治體制的建立。', 61),
(UUID(), '歷Ea-IV-2', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'a', '政治經濟的變遷', '基礎建設與產業政策。', 62),
(UUID(), '歷Ea-IV-3', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'a', '政治經濟的變遷', '「理蕃」政策與原住民族社會的對應。', 63),
(UUID(), '歷Eb-IV-1', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'b', '社會文化的變遷', '現代教育與文化啟蒙運動。', 71),
(UUID(), '歷Eb-IV-2', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'b', '社會文化的變遷', '都會文化的出現。', 72),
(UUID(), '歷Eb-IV-3', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'b', '社會文化的變遷', '新舊文化的衝突與在地社會的調適。', 73);

-- 主題 F: 當代臺灣
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Fa-IV-1', 'IV', '歷', 'F', '當代臺灣', 'a', '政治外交的變遷', '中華民國統治體制的移入與轉變。', 81),
(UUID(), '歷Fa-IV-2', 'IV', '歷', 'F', '當代臺灣', 'a', '政治外交的變遷', '二二八事件與白色恐怖。', 82),
(UUID(), '歷Fa-IV-3', 'IV', '歷', 'F', '當代臺灣', 'a', '政治外交的變遷', '國家政策下的原住民族。', 83),
(UUID(), '歷Fa-IV-4', 'IV', '歷', 'F', '當代臺灣', 'a', '政治外交的變遷', '臺海兩岸關係與臺灣的國際處境。', 84),
(UUID(), '歷Fb-IV-1', 'IV', '歷', 'F', '當代臺灣', 'b', '經濟社會的變遷', '經濟發展與社會轉型。', 91),
(UUID(), '歷Fb-IV-2', 'IV', '歷', 'F', '當代臺灣', 'b', '經濟社會的變遷', '大眾文化的演變。', 92);

-- 主題 G: 歷史考察（二）
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷G-IV-1', 'IV', '歷', 'G', '歷史考察（二）', NULL, NULL, '地方史探究（二）。', 101),
(UUID(), '歷G-IV-2', 'IV', '歷', 'G', '歷史考察（二）', NULL, NULL, '從主題E或F挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 102);

-- 主題 H: 從古典到傳統時代
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ha-IV-1', 'IV', '歷', 'H', '從古典到傳統時代', 'a', '政治、社會與文化的變遷、差異與互動', '商周至隋唐時期國家與社會的重要變遷。', 111),
(UUID(), '歷Ha-IV-2', 'IV', '歷', 'H', '從古典到傳統時代', 'a', '政治、社會與文化的變遷、差異與互動', '商周至隋唐時期民族與文化的互動。', 112),
(UUID(), '歷Hb-IV-1', 'IV', '歷', 'H', '從古典到傳統時代', 'b', '區域內外的互動與交流', '宋、元時期的國際互動。', 121),
(UUID(), '歷Hb-IV-2', 'IV', '歷', 'H', '從古典到傳統時代', 'b', '區域內外的互動與交流', '宋、元時期的商貿與文化交流。', 122);

-- 主題 I: 從傳統到現代
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ia-IV-1', 'IV', '歷', 'I', '從傳統到現代', 'a', '東亞世界的延續與變遷', '明、清時期東亞世界的變動。', 131),
(UUID(), '歷Ia-IV-2', 'IV', '歷', 'I', '從傳統到現代', 'a', '東亞世界的延續與變遷', '明、清時期東亞世界的商貿與文化交流。', 132),
(UUID(), '歷Ib-IV-1', 'IV', '歷', 'I', '從傳統到現代', 'b', '政治上的挑戰與回應', '晚清時期的東西方接觸與衝突。', 141),
(UUID(), '歷Ib-IV-2', 'IV', '歷', 'I', '從傳統到現代', 'b', '政治上的挑戰與回應', '甲午戰爭後的政治體制變革。', 142),
(UUID(), '歷Ic-IV-1', 'IV', '歷', 'I', '從傳統到現代', 'c', '社會文化的調適與變遷', '城市風貌的改變與新媒體的出現。', 151),
(UUID(), '歷Ic-IV-2', 'IV', '歷', 'I', '從傳統到現代', 'c', '社會文化的調適與變遷', '家族與婦女角色的轉變。', 152);

-- 主題 J: 歷史考察（三）
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷J-IV-1', 'IV', '歷', 'J', '歷史考察（三）', NULL, NULL, '從主題H或I挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 161);

-- 主題 K: 現代國家的興起
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ka-IV-1', 'IV', '歷', 'K', '現代國家的興起', 'a', '現代國家的追求', '中華民國的建立與早期發展。', 171),
(UUID(), '歷Ka-IV-2', 'IV', '歷', 'K', '現代國家的興起', 'a', '現代國家的追求', '舊傳統與新思潮間的激盪。', 172),
(UUID(), '歷Kb-IV-1', 'IV', '歷', 'K', '現代國家的興起', 'b', '現代國家的挑戰', '現代國家的建制與外交發展。', 181),
(UUID(), '歷Kb-IV-2', 'IV', '歷', 'K', '現代國家的興起', 'b', '現代國家的挑戰', '日本帝國的對外擴張與衝擊。', 182);

-- 主題 L: 當代東亞的局勢
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷La-IV-1', 'IV', '歷', 'L', '當代東亞的局勢', 'a', '共產政權在中國', '中華人民共和國的建立。', 191),
(UUID(), '歷La-IV-2', 'IV', '歷', 'L', '當代東亞的局勢', 'a', '共產政權在中國', '改革開放後的政經發展。', 192),
(UUID(), '歷Lb-IV-1', 'IV', '歷', 'L', '當代東亞的局勢', 'b', '不同陣營的互動', '冷戰時期東亞國家間的競合。', 201),
(UUID(), '歷Lb-IV-2', 'IV', '歷', 'L', '當代東亞的局勢', 'b', '不同陣營的互動', '東南亞地區國際組織的發展與影響。', 202);

-- 主題 M: 歷史考察（四）
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷M-IV-1', 'IV', '歷', 'M', '歷史考察（四）', NULL, NULL, '從主題K或L挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 211);

-- 主題 N: 古代文化的遺產
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Na-IV-1', 'IV', '歷', 'N', '古代文化的遺產', 'a', '多元並立的古代文化', '非洲與西亞的早期文化。', 221),
(UUID(), '歷Na-IV-2', 'IV', '歷', 'N', '古代文化的遺產', 'a', '多元並立的古代文化', '希臘、羅馬的政治及文化。', 222),
(UUID(), '歷Nb-IV-1', 'IV', '歷', 'N', '古代文化的遺產', 'b', '普世宗教的起源與發展', '佛教的起源與發展。', 231),
(UUID(), '歷Nb-IV-2', 'IV', '歷', 'N', '古代文化的遺產', 'b', '普世宗教的起源與發展', '基督教的起源與發展。', 232),
(UUID(), '歷Nb-IV-3', 'IV', '歷', 'N', '古代文化的遺產', 'b', '普世宗教的起源與發展', '伊斯蘭教的起源與發展。', 233);

-- 主題 O: 近代世界的變革
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Oa-IV-1', 'IV', '歷', 'O', '近代世界的變革', 'a', '近代歐洲的興起', '文藝復興。', 241),
(UUID(), '歷Oa-IV-2', 'IV', '歷', 'O', '近代世界的變革', 'a', '近代歐洲的興起', '宗教改革。', 242),
(UUID(), '歷Oa-IV-3', 'IV', '歷', 'O', '近代世界的變革', 'a', '近代歐洲的興起', '科學革命與啟蒙運動。', 243),
(UUID(), '歷Ob-IV-1', 'IV', '歷', 'O', '近代世界的變革', 'b', '多元世界的互動', '歐洲的海外擴張與傳教。', 251),
(UUID(), '歷Ob-IV-2', 'IV', '歷', 'O', '近代世界的變革', 'b', '多元世界的互動', '美洲和澳洲的政治與文化。', 252),
(UUID(), '歷Ob-IV-3', 'IV', '歷', 'O', '近代世界的變革', 'b', '多元世界的互動', '近代南亞與東南亞。', 253);

-- 主題 P: 歷史考察（五）
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷P-IV-1', 'IV', '歷', 'P', '歷史考察（五）', NULL, NULL, '從主題N或O挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 261);

-- 主題 Q: 現代世界的發展
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Qa-IV-1', 'IV', '歷', 'Q', '現代世界的發展', 'a', '現代國家的建立', '美國獨立與法國大革命。', 271),
(UUID(), '歷Qa-IV-2', 'IV', '歷', 'Q', '現代世界的發展', 'a', '現代國家的建立', '工業革命與社會變遷。', 272),
(UUID(), '歷Qa-IV-3', 'IV', '歷', 'Q', '現代世界的發展', 'a', '現代國家的建立', '民族主義與國家建立。', 273),
(UUID(), '歷Qb-IV-1', 'IV', '歷', 'Q', '現代世界的發展', 'b', '帝國主義的興起與影響', '歐洲帝國的擴張。', 281),
(UUID(), '歷Qb-IV-2', 'IV', '歷', 'Q', '現代世界的發展', 'b', '帝國主義的興起與影響', '亞、非、美三洲的發展及回應。', 282),
(UUID(), '歷Qb-IV-3', 'IV', '歷', 'Q', '現代世界的發展', 'b', '帝國主義的興起與影響', '第一次世界大戰。', 283),
(UUID(), '歷Qc-IV-1', 'IV', '歷', 'Q', '現代世界的發展', 'c', '戰爭與現代社會', '戰間期的世界局勢。', 291),
(UUID(), '歷Qc-IV-2', 'IV', '歷', 'Q', '現代世界的發展', 'c', '戰爭與現代社會', '第二次世界大戰。', 292),
(UUID(), '歷Qc-IV-3', 'IV', '歷', 'Q', '現代世界的發展', 'c', '戰爭與現代社會', '從兩極到多元的戰後世界。', 293);

-- 主題 R: 歷史考察（六）
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷R-IV-1', 'IV', '歷', 'R', '歷史考察（六）', NULL, NULL, '從主題Q挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 301);

-- ============================================
-- 步驟 4：匯入高中歷史科資料
-- ============================================

-- 主題 A: 如何認識過去？
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷A-V-1', 'V', '歷', 'A', '如何認識過去？', NULL, NULL, '誰的歷史？誰留下的史料？誰寫的歷史？', 1001);

-- 主題 B: 多元族群社會的形成
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ba-V-1', 'V', '歷', 'B', '多元族群社會的形成', 'a', '原住民族', '我群界定、原住民與原住民族的分類。', 1011),
(UUID(), '歷Ba-V-2', 'V', '歷', 'B', '多元族群社會的形成', 'a', '原住民族', '當代原住民族的處境與權利伸張。', 1012),
(UUID(), '歷Bb-V-1', 'V', '歷', 'B', '多元族群社會的形成', 'b', '移民社會的形成', '早期移民的歷史背景及其影響。', 1021),
(UUID(), '歷Bb-V-2', 'V', '歷', 'B', '多元族群社會的形成', 'b', '移民社會的形成', '戰後來臺的各方移民。', 1022);

-- 主題 C: 經濟與文化的多樣性
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ca-V-1', 'V', '歷', 'C', '經濟與文化的多樣性', 'a', '經濟活動', '臺灣歷史上的商貿活動。', 1031),
(UUID(), '歷Ca-V-2', 'V', '歷', 'C', '經濟與文化的多樣性', 'a', '經濟活動', '臺灣歷史上的土地問題。', 1032),
(UUID(), '歷Cb-V-1', 'V', '歷', 'C', '經濟與文化的多樣性', 'b', '山海文化', '原住民族的語言、傳統信仰與祭儀。', 1041),
(UUID(), '歷Cb-V-2', 'V', '歷', 'C', '經濟與文化的多樣性', 'b', '山海文化', '多元的信仰與祭祀活動。', 1042),
(UUID(), '歷Cb-V-3', 'V', '歷', 'C', '經濟與文化的多樣性', 'b', '山海文化', '從傳統到現代的文學與藝術。', 1043);

-- 主題 D: 現代國家的形塑
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Da-V-1', 'V', '歷', 'D', '現代國家的形塑', 'a', '臺、澎、金、馬如何成為一體？', '從地方到中央。', 1051),
(UUID(), '歷Da-V-2', 'V', '歷', 'D', '現代國家的形塑', 'a', '臺、澎、金、馬如何成為一體？', '國際局勢與臺灣地位。', 1052),
(UUID(), '歷Da-V-3', 'V', '歷', 'D', '現代國家的形塑', 'a', '臺、澎、金、馬如何成為一體？', '教育、語言與基礎建設。', 1053),
(UUID(), '歷Db-V-1', 'V', '歷', 'D', '現代國家的形塑', 'b', '追求自治與民主的軌跡', '日治時期的人權情況與政治、社會運動。', 1061),
(UUID(), '歷Db-V-2', 'V', '歷', 'D', '現代國家的形塑', 'b', '追求自治與民主的軌跡', '戰後的民主化追求與人權運動。', 1062),
(UUID(), '歷Db-V-3', 'V', '歷', 'D', '現代國家的形塑', 'b', '追求自治與民主的軌跡', '戰後的社會運動。', 1063);

-- 主題 E: 歷史考察（一）
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷E-V-1', 'V', '歷', 'E', '歷史考察（一）', NULL, NULL, '從主題B、C或D挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 1071);

-- 主題 F: 中國與東亞
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷F-V-1', 'V', '歷', 'F', '中國與東亞', NULL, NULL, '可以在什麼樣的脈絡中討論中國史？', 1081);

-- 主題 G: 國家與社會
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ga-V-1', 'V', '歷', 'G', '國家與社會', 'a', '國家的統治', '傳統政治權威的類型。', 1091),
(UUID(), '歷Ga-V-2', 'V', '歷', 'G', '國家與社會', 'a', '國家的統治', '戶籍、土地或賦役與國家統治的關係。', 1092),
(UUID(), '歷Gb-V-1', 'V', '歷', 'G', '國家與社會', 'b', '社會的組織', '民間社會組織的型態。', 1101),
(UUID(), '歷Gb-V-2', 'V', '歷', 'G', '國家與社會', 'b', '社會的組織', '社會組織與國家的互動。', 1102);

-- 主題 H: 人群的移動與交流
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ha-V-1', 'V', '歷', 'H', '人群的移動與交流', 'a', '近代以前的人群移動與交流', '從漢、晉到宋、元時期東亞人群移動的特色與影響。', 1111),
(UUID(), '歷Ha-V-2', 'V', '歷', 'H', '人群的移動與交流', 'a', '近代以前的人群移動與交流', '明、清時期東亞人群移動的特色與影響。', 1112),
(UUID(), '歷Hb-V-1', 'V', '歷', 'H', '人群的移動與交流', 'b', '近代以後的移民', '十九世紀以後東亞的人群移動。', 1121),
(UUID(), '歷Hb-V-2', 'V', '歷', 'H', '人群的移動與交流', 'b', '近代以後的移民', '十九世紀以後東亞人群移動的變遷及其影響。', 1122);

-- 主題 I: 現代化的歷程
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ia-V-1', 'V', '歷', 'I', '現代化的歷程', 'a', '傳統與現代的交會', '西方文化傳入東亞的影響。', 1131),
(UUID(), '歷Ia-V-2', 'V', '歷', 'I', '現代化的歷程', 'a', '傳統與現代的交會', '東亞國家對西方帝國主義的回應。', 1132),
(UUID(), '歷Ia-V-3', 'V', '歷', 'I', '現代化的歷程', 'a', '傳統與現代的交會', '民間社會與現代化的激盪。', 1133),
(UUID(), '歷Ib-V-1', 'V', '歷', 'I', '現代化的歷程', 'b', '戰爭與和平', '東亞地區人民在二十世紀重大戰爭中的經歷。', 1141),
(UUID(), '歷Ib-V-2', 'V', '歷', 'I', '現代化的歷程', 'b', '戰爭與和平', '共產主義在東亞的發展歷程及對局勢的影響。', 1142),
(UUID(), '歷Ib-V-3', 'V', '歷', 'I', '現代化的歷程', 'b', '戰爭與和平', '區域合作與經貿統合的追求。', 1143);

-- 主題 J: 歷史考察（二）
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷J-V-1', 'V', '歷', 'J', '歷史考察（二）', NULL, NULL, '從主題G、H或I挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 1151);

-- 主題 K: 臺灣與世界
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷K-V-1', 'V', '歷', 'K', '臺灣與世界', NULL, NULL, '可以在什麼樣的脈絡中討論世界史？', 1161);

-- 主題 L: 歐洲文化與現代世界
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷La-V-1', 'V', '歷', 'L', '歐洲文化與現代世界', 'a', '古代文化與基督教傳統', '神話與哲學。', 1171),
(UUID(), '歷La-V-2', 'V', '歷', 'L', '歐洲文化與現代世界', 'a', '古代文化與基督教傳統', '中古基督教世界。', 1172),
(UUID(), '歷La-V-3', 'V', '歷', 'L', '歐洲文化與現代世界', 'a', '古代文化與基督教傳統', '文藝復興。', 1173),
(UUID(), '歷Lb-V-1', 'V', '歷', 'L', '歐洲文化與現代世界', 'b', '個人、自由、理性', '從宗教改革到啟蒙運動。', 1181),
(UUID(), '歷Lb-V-2', 'V', '歷', 'L', '歐洲文化與現代世界', 'b', '個人、自由、理性', '資本主義與社會主義。', 1182),
(UUID(), '歷Lb-V-3', 'V', '歷', 'L', '歐洲文化與現代世界', 'b', '個人、自由、理性', '民主傳統及其現代挑戰。', 1183);

-- 主題 M: 文化的交會與多元世界的發展
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ma-V-1', 'V', '歷', 'M', '文化的交會與多元世界的發展', 'a', '伊斯蘭與世界', '伊斯蘭文化的發展與擴張。', 1191),
(UUID(), '歷Ma-V-2', 'V', '歷', 'M', '文化的交會與多元世界的發展', 'a', '伊斯蘭與世界', '伊斯蘭世界與西方的互動。', 1192),
(UUID(), '歷Mb-V-1', 'V', '歷', 'M', '文化的交會與多元世界的發展', 'b', '西方與世界', '歐洲與亞洲的交流。', 1201),
(UUID(), '歷Mb-V-2', 'V', '歷', 'M', '文化的交會與多元世界的發展', 'b', '西方與世界', '歐洲與非、美兩洲的交流。', 1202),
(UUID(), '歷Mb-V-3', 'V', '歷', 'M', '文化的交會與多元世界的發展', 'b', '西方與世界', '反殖民運動的發展。', 1203);

-- 主題 N: 世界變遷與現代性
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Na-V-1', 'V', '歷', 'N', '世界變遷與現代性', 'a', '冷戰期間的世界局勢', '冷戰期間的政治局勢。', 1211),
(UUID(), '歷Na-V-2', 'V', '歷', 'N', '世界變遷與現代性', 'a', '冷戰期間的世界局勢', '社會運動與反戰。', 1212),
(UUID(), '歷Nb-V-1', 'V', '歷', 'N', '世界變遷與現代性', 'b', '冷戰後的世界局勢', '現代性與現代文化。', 1221),
(UUID(), '歷Nb-V-2', 'V', '歷', 'N', '世界變遷與現代性', 'b', '冷戰後的世界局勢', '「西方」與「反西方」。', 1222),
(UUID(), '歷Nb-V-3', 'V', '歷', 'N', '世界變遷與現代性', 'b', '冷戰後的世界局勢', '全球化與多元文化。', 1223);

-- 主題 O: 歷史考察（三）
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷O-V-1', 'V', '歷', 'O', '歷史考察（三）', NULL, NULL, '從主題L、M或N挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 1231);

-- ============================================
-- 完成！驗證資料
-- ============================================
SELECT '=== 資料匯入完成 ===' as status;
SELECT COUNT(*) as total_records, stage, subject FROM social_learning_contents GROUP BY stage, subject;
SELECT '國中歷史科主題列表：' as info;
SELECT DISTINCT theme, theme_name FROM social_learning_contents WHERE stage = 'IV' AND subject = '歷' ORDER BY theme;
SELECT '高中歷史科主題列表：' as info;
SELECT DISTINCT theme, theme_name FROM social_learning_contents WHERE stage = 'V' AND subject = '歷' ORDER BY theme;

