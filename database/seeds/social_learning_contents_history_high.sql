-- ============================================
-- 社會科學習內容種子資料 - 歷史科高中（V）
-- ============================================

USE teacher_collaboration_system;

-- ============================================
-- 主題 A: 如何認識過去？（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷A-V-1', 'V', '歷', 'A', '如何認識過去？', NULL, NULL, '誰的歷史？誰留下的史料？誰寫的歷史？', 1001);

-- ============================================
-- 主題 B: 多元族群社會的形成
-- ============================================

-- 項目 a: 原住民族
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ba-V-1', 'V', '歷', 'B', '多元族群社會的形成', 'a', '原住民族', '我群界定、原住民與原住民族的分類。', 1011),
(UUID(), '歷Ba-V-2', 'V', '歷', 'B', '多元族群社會的形成', 'a', '原住民族', '當代原住民族的處境與權利伸張。', 1012);

-- 項目 b: 移民社會的形成
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Bb-V-1', 'V', '歷', 'B', '多元族群社會的形成', 'b', '移民社會的形成', '早期移民的歷史背景及其影響。', 1021),
(UUID(), '歷Bb-V-2', 'V', '歷', 'B', '多元族群社會的形成', 'b', '移民社會的形成', '戰後來臺的各方移民。', 1022);

-- ============================================
-- 主題 C: 經濟與文化的多樣性
-- ============================================

-- 項目 a: 經濟活動
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ca-V-1', 'V', '歷', 'C', '經濟與文化的多樣性', 'a', '經濟活動', '臺灣歷史上的商貿活動。', 1031),
(UUID(), '歷Ca-V-2', 'V', '歷', 'C', '經濟與文化的多樣性', 'a', '經濟活動', '臺灣歷史上的土地問題。', 1032);

-- 項目 b: 山海文化
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Cb-V-1', 'V', '歷', 'C', '經濟與文化的多樣性', 'b', '山海文化', '原住民族的語言、傳統信仰與祭儀。', 1041),
(UUID(), '歷Cb-V-2', 'V', '歷', 'C', '經濟與文化的多樣性', 'b', '山海文化', '多元的信仰與祭祀活動。', 1042),
(UUID(), '歷Cb-V-3', 'V', '歷', 'C', '經濟與文化的多樣性', 'b', '山海文化', '從傳統到現代的文學與藝術。', 1043);

-- ============================================
-- 主題 D: 現代國家的形塑
-- ============================================

-- 項目 a: 臺、澎、金、馬如何成為一體？
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Da-V-1', 'V', '歷', 'D', '現代國家的形塑', 'a', '臺、澎、金、馬如何成為一體？', '從地方到中央。', 1051),
(UUID(), '歷Da-V-2', 'V', '歷', 'D', '現代國家的形塑', 'a', '臺、澎、金、馬如何成為一體？', '國際局勢與臺灣地位。', 1052),
(UUID(), '歷Da-V-3', 'V', '歷', 'D', '現代國家的形塑', 'a', '臺、澎、金、馬如何成為一體？', '教育、語言與基礎建設。', 1053);

-- 項目 b: 追求自治與民主的軌跡
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Db-V-1', 'V', '歷', 'D', '現代國家的形塑', 'b', '追求自治與民主的軌跡', '日治時期的人權情況與政治、社會運動。', 1061),
(UUID(), '歷Db-V-2', 'V', '歷', 'D', '現代國家的形塑', 'b', '追求自治與民主的軌跡', '戰後的民主化追求與人權運動。', 1062),
(UUID(), '歷Db-V-3', 'V', '歷', 'D', '現代國家的形塑', 'b', '追求自治與民主的軌跡', '戰後的社會運動。', 1063);

-- ============================================
-- 主題 E: 歷史考察（一）（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷E-V-1', 'V', '歷', 'E', '歷史考察（一）', NULL, NULL, '從主題B、C或D挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 1071);

-- ============================================
-- 主題 F: 中國與東亞（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷F-V-1', 'V', '歷', 'F', '中國與東亞', NULL, NULL, '可以在什麼樣的脈絡中討論中國史？', 1081);

-- ============================================
-- 主題 G: 國家與社會
-- ============================================

-- 項目 a: 國家的統治
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ga-V-1', 'V', '歷', 'G', '國家與社會', 'a', '國家的統治', '傳統政治權威的類型。', 1091),
(UUID(), '歷Ga-V-2', 'V', '歷', 'G', '國家與社會', 'a', '國家的統治', '戶籍、土地或賦役與國家統治的關係。', 1092);

-- 項目 b: 社會的組織
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Gb-V-1', 'V', '歷', 'G', '國家與社會', 'b', '社會的組織', '民間社會組織的型態。', 1101),
(UUID(), '歷Gb-V-2', 'V', '歷', 'G', '國家與社會', 'b', '社會的組織', '社會組織與國家的互動。', 1102);

-- ============================================
-- 主題 H: 人群的移動與交流
-- ============================================

-- 項目 a: 近代以前的人群移動與交流
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ha-V-1', 'V', '歷', 'H', '人群的移動與交流', 'a', '近代以前的人群移動與交流', '從漢、晉到宋、元時期東亞人群移動的特色與影響。', 1111),
(UUID(), '歷Ha-V-2', 'V', '歷', 'H', '人群的移動與交流', 'a', '近代以前的人群移動與交流', '明、清時期東亞人群移動的特色與影響。', 1112);

-- 項目 b: 近代以後的移民
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Hb-V-1', 'V', '歷', 'H', '人群的移動與交流', 'b', '近代以後的移民', '十九世紀以後東亞的人群移動。', 1121),
(UUID(), '歷Hb-V-2', 'V', '歷', 'H', '人群的移動與交流', 'b', '近代以後的移民', '十九世紀以後東亞人群移動的變遷及其影響。', 1122);

-- ============================================
-- 主題 I: 現代化的歷程
-- ============================================

-- 項目 a: 傳統與現代的交會
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ia-V-1', 'V', '歷', 'I', '現代化的歷程', 'a', '傳統與現代的交會', '西方文化傳入東亞的影響。', 1131),
(UUID(), '歷Ia-V-2', 'V', '歷', 'I', '現代化的歷程', 'a', '傳統與現代的交會', '東亞國家對西方帝國主義的回應。', 1132),
(UUID(), '歷Ia-V-3', 'V', '歷', 'I', '現代化的歷程', 'a', '傳統與現代的交會', '民間社會與現代化的激盪。', 1133);

-- 項目 b: 戰爭與和平
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ib-V-1', 'V', '歷', 'I', '現代化的歷程', 'b', '戰爭與和平', '東亞地區人民在二十世紀重大戰爭中的經歷。', 1141),
(UUID(), '歷Ib-V-2', 'V', '歷', 'I', '現代化的歷程', 'b', '戰爭與和平', '共產主義在東亞的發展歷程及對局勢的影響。', 1142),
(UUID(), '歷Ib-V-3', 'V', '歷', 'I', '現代化的歷程', 'b', '戰爭與和平', '區域合作與經貿統合的追求。', 1143);

-- ============================================
-- 主題 J: 歷史考察（二）（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷J-V-1', 'V', '歷', 'J', '歷史考察（二）', NULL, NULL, '從主題G、H或I挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 1151);

-- ============================================
-- 主題 K: 臺灣與世界（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷K-V-1', 'V', '歷', 'K', '臺灣與世界', NULL, NULL, '可以在什麼樣的脈絡中討論世界史？', 1161);

-- ============================================
-- 主題 L: 歐洲文化與現代世界
-- ============================================

-- 項目 a: 古代文化與基督教傳統
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷La-V-1', 'V', '歷', 'L', '歐洲文化與現代世界', 'a', '古代文化與基督教傳統', '神話與哲學。', 1171),
(UUID(), '歷La-V-2', 'V', '歷', 'L', '歐洲文化與現代世界', 'a', '古代文化與基督教傳統', '中古基督教世界。', 1172),
(UUID(), '歷La-V-3', 'V', '歷', 'L', '歐洲文化與現代世界', 'a', '古代文化與基督教傳統', '文藝復興。', 1173);

-- 項目 b: 個人、自由、理性
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Lb-V-1', 'V', '歷', 'L', '歐洲文化與現代世界', 'b', '個人、自由、理性', '從宗教改革到啟蒙運動。', 1181),
(UUID(), '歷Lb-V-2', 'V', '歷', 'L', '歐洲文化與現代世界', 'b', '個人、自由、理性', '資本主義與社會主義。', 1182),
(UUID(), '歷Lb-V-3', 'V', '歷', 'L', '歐洲文化與現代世界', 'b', '個人、自由、理性', '民主傳統及其現代挑戰。', 1183);

-- ============================================
-- 主題 M: 文化的交會與多元世界的發展
-- ============================================

-- 項目 a: 伊斯蘭與世界
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ma-V-1', 'V', '歷', 'M', '文化的交會與多元世界的發展', 'a', '伊斯蘭與世界', '伊斯蘭文化的發展與擴張。', 1191),
(UUID(), '歷Ma-V-2', 'V', '歷', 'M', '文化的交會與多元世界的發展', 'a', '伊斯蘭與世界', '伊斯蘭世界與西方的互動。', 1192);

-- 項目 b: 西方與世界
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Mb-V-1', 'V', '歷', 'M', '文化的交會與多元世界的發展', 'b', '西方與世界', '歐洲與亞洲的交流。', 1201),
(UUID(), '歷Mb-V-2', 'V', '歷', 'M', '文化的交會與多元世界的發展', 'b', '西方與世界', '歐洲與非、美兩洲的交流。', 1202),
(UUID(), '歷Mb-V-3', 'V', '歷', 'M', '文化的交會與多元世界的發展', 'b', '西方與世界', '反殖民運動的發展。', 1203);

-- ============================================
-- 主題 N: 世界變遷與現代性
-- ============================================

-- 項目 a: 冷戰期間的世界局勢
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Na-V-1', 'V', '歷', 'N', '世界變遷與現代性', 'a', '冷戰期間的世界局勢', '冷戰期間的政治局勢。', 1211),
(UUID(), '歷Na-V-2', 'V', '歷', 'N', '世界變遷與現代性', 'a', '冷戰期間的世界局勢', '社會運動與反戰。', 1212);

-- 項目 b: 冷戰後的世界局勢
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Nb-V-1', 'V', '歷', 'N', '世界變遷與現代性', 'b', '冷戰後的世界局勢', '現代性與現代文化。', 1221),
(UUID(), '歷Nb-V-2', 'V', '歷', 'N', '世界變遷與現代性', 'b', '冷戰後的世界局勢', '「西方」與「反西方」。', 1222),
(UUID(), '歷Nb-V-3', 'V', '歷', 'N', '世界變遷與現代性', 'b', '冷戰後的世界局勢', '全球化與多元文化。', 1223);

-- ============================================
-- 主題 O: 歷史考察（三）（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷O-V-1', 'V', '歷', 'O', '歷史考察（三）', NULL, NULL, '從主題L、M或N挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 1231);

-- ============================================
-- 完成！高中歷史科共 15 個主題，約 52 筆條目
-- ============================================

