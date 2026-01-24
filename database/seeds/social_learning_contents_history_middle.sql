-- ============================================
-- 社會科學習內容種子資料 - 歷史科國中（IV）
-- ============================================

USE teacher_collaboration_system;

-- ============================================
-- 主題 A: 歷史的基礎觀念（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷A-IV-1', 'IV', '歷', 'A', '歷史的基礎觀念', NULL, NULL, '紀年與分期。', 1);

-- ============================================
-- 主題 B: 早期臺灣
-- ============================================

-- 項目 a: 史前文化與臺灣原住民族
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ba-IV-1', 'IV', '歷', 'B', '早期臺灣', 'a', '史前文化與臺灣原住民族', '考古發掘與史前文化。', 11),
(UUID(), '歷Ba-IV-2', 'IV', '歷', 'B', '早期臺灣', 'a', '史前文化與臺灣原住民族', '臺灣原住民族的遷徙與傳說。', 12);

-- 項目 b: 大航海時代的臺灣
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Bb-IV-1', 'IV', '歷', 'B', '早期臺灣', 'b', '大航海時代的臺灣', '十六、十七世紀東亞海域的各方勢力。', 21),
(UUID(), '歷Bb-IV-2', 'IV', '歷', 'B', '早期臺灣', 'b', '大航海時代的臺灣', '原住民族與外來者的接觸。', 22);

-- ============================================
-- 主題 C: 清帝國時期的臺灣
-- ============================================

-- 項目 a: 政治經濟的變遷
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ca-IV-1', 'IV', '歷', 'C', '清帝國時期的臺灣', 'a', '政治經濟的變遷', '清帝國的統治政策。', 31),
(UUID(), '歷Ca-IV-2', 'IV', '歷', 'C', '清帝國時期的臺灣', 'a', '政治經濟的變遷', '農商業的發展。', 32);

-- 項目 b: 社會文化的變遷
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Cb-IV-1', 'IV', '歷', 'C', '清帝國時期的臺灣', 'b', '社會文化的變遷', '原住民族社會及其變化。', 41),
(UUID(), '歷Cb-IV-2', 'IV', '歷', 'C', '清帝國時期的臺灣', 'b', '社會文化的變遷', '漢人社會的活動。', 42);

-- ============================================
-- 主題 D: 歷史考察（一）（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷D-IV-1', 'IV', '歷', 'D', '歷史考察（一）', NULL, NULL, '地方史探究（一）。', 51),
(UUID(), '歷D-IV-2', 'IV', '歷', 'D', '歷史考察（一）', NULL, NULL, '從主題B或C挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 52);

-- ============================================
-- 主題 E: 日本帝國時期的臺灣
-- ============================================

-- 項目 a: 政治經濟的變遷
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ea-IV-1', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'a', '政治經濟的變遷', '殖民統治體制的建立。', 61),
(UUID(), '歷Ea-IV-2', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'a', '政治經濟的變遷', '基礎建設與產業政策。', 62),
(UUID(), '歷Ea-IV-3', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'a', '政治經濟的變遷', '「理蕃」政策與原住民族社會的對應。', 63);

-- 項目 b: 社會文化的變遷
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Eb-IV-1', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'b', '社會文化的變遷', '現代教育與文化啟蒙運動。', 71),
(UUID(), '歷Eb-IV-2', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'b', '社會文化的變遷', '都會文化的出現。', 72),
(UUID(), '歷Eb-IV-3', 'IV', '歷', 'E', '日本帝國時期的臺灣', 'b', '社會文化的變遷', '新舊文化的衝突與在地社會的調適。', 73);

-- ============================================
-- 主題 F: 當代臺灣
-- ============================================

-- 項目 a: 政治外交的變遷
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Fa-IV-1', 'IV', '歷', 'F', '當代臺灣', 'a', '政治外交的變遷', '中華民國統治體制的移入與轉變。', 81),
(UUID(), '歷Fa-IV-2', 'IV', '歷', 'F', '當代臺灣', 'a', '政治外交的變遷', '二二八事件與白色恐怖。', 82),
(UUID(), '歷Fa-IV-3', 'IV', '歷', 'F', '當代臺灣', 'a', '政治外交的變遷', '國家政策下的原住民族。', 83),
(UUID(), '歷Fa-IV-4', 'IV', '歷', 'F', '當代臺灣', 'a', '政治外交的變遷', '臺海兩岸關係與臺灣的國際處境。', 84);

-- 項目 b: 經濟社會的變遷
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Fb-IV-1', 'IV', '歷', 'F', '當代臺灣', 'b', '經濟社會的變遷', '經濟發展與社會轉型。', 91),
(UUID(), '歷Fb-IV-2', 'IV', '歷', 'F', '當代臺灣', 'b', '經濟社會的變遷', '大眾文化的演變。', 92);

-- ============================================
-- 主題 G: 歷史考察（二）（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷G-IV-1', 'IV', '歷', 'G', '歷史考察（二）', NULL, NULL, '地方史探究（二）。', 101),
(UUID(), '歷G-IV-2', 'IV', '歷', 'G', '歷史考察（二）', NULL, NULL, '從主題E或F挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 102);

-- ============================================
-- 主題 H: 從古典到傳統時代
-- ============================================

-- 項目 a: 政治、社會與文化的變遷、差異與互動
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ha-IV-1', 'IV', '歷', 'H', '從古典到傳統時代', 'a', '政治、社會與文化的變遷、差異與互動', '商周至隋唐時期國家與社會的重要變遷。', 111),
(UUID(), '歷Ha-IV-2', 'IV', '歷', 'H', '從古典到傳統時代', 'a', '政治、社會與文化的變遷、差異與互動', '商周至隋唐時期民族與文化的互動。', 112);

-- 項目 b: 區域內外的互動與交流
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Hb-IV-1', 'IV', '歷', 'H', '從古典到傳統時代', 'b', '區域內外的互動與交流', '宋、元時期的國際互動。', 121),
(UUID(), '歷Hb-IV-2', 'IV', '歷', 'H', '從古典到傳統時代', 'b', '區域內外的互動與交流', '宋、元時期的商貿與文化交流。', 122);

-- ============================================
-- 主題 I: 從傳統到現代
-- ============================================

-- 項目 a: 東亞世界的延續與變遷
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ia-IV-1', 'IV', '歷', 'I', '從傳統到現代', 'a', '東亞世界的延續與變遷', '明、清時期東亞世界的變動。', 131),
(UUID(), '歷Ia-IV-2', 'IV', '歷', 'I', '從傳統到現代', 'a', '東亞世界的延續與變遷', '明、清時期東亞世界的商貿與文化交流。', 132);

-- 項目 b: 政治上的挑戰與回應
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ib-IV-1', 'IV', '歷', 'I', '從傳統到現代', 'b', '政治上的挑戰與回應', '晚清時期的東西方接觸與衝突。', 141),
(UUID(), '歷Ib-IV-2', 'IV', '歷', 'I', '從傳統到現代', 'b', '政治上的挑戰與回應', '甲午戰爭後的政治體制變革。', 142);

-- 項目 c: 社會文化的調適與變遷
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ic-IV-1', 'IV', '歷', 'I', '從傳統到現代', 'c', '社會文化的調適與變遷', '城市風貌的改變與新媒體的出現。', 151),
(UUID(), '歷Ic-IV-2', 'IV', '歷', 'I', '從傳統到現代', 'c', '社會文化的調適與變遷', '家族與婦女角色的轉變。', 152);

-- ============================================
-- 主題 J: 歷史考察（三）（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷J-IV-1', 'IV', '歷', 'J', '歷史考察（三）', NULL, NULL, '從主題H或I挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 161);

-- ============================================
-- 主題 K: 現代國家的興起
-- ============================================

-- 項目 a: 現代國家的追求
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ka-IV-1', 'IV', '歷', 'K', '現代國家的興起', 'a', '現代國家的追求', '中華民國的建立與早期發展。', 171),
(UUID(), '歷Ka-IV-2', 'IV', '歷', 'K', '現代國家的興起', 'a', '現代國家的追求', '舊傳統與新思潮間的激盪。', 172);

-- 項目 b: 現代國家的挑戰
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Kb-IV-1', 'IV', '歷', 'K', '現代國家的興起', 'b', '現代國家的挑戰', '現代國家的建制與外交發展。', 181),
(UUID(), '歷Kb-IV-2', 'IV', '歷', 'K', '現代國家的興起', 'b', '現代國家的挑戰', '日本帝國的對外擴張與衝擊。', 182);

-- ============================================
-- 主題 L: 當代東亞的局勢
-- ============================================

-- 項目 a: 共產政權在中國
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷La-IV-1', 'IV', '歷', 'L', '當代東亞的局勢', 'a', '共產政權在中國', '中華人民共和國的建立。', 191),
(UUID(), '歷La-IV-2', 'IV', '歷', 'L', '當代東亞的局勢', 'a', '共產政權在中國', '改革開放後的政經發展。', 192);

-- 項目 b: 不同陣營的互動
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Lb-IV-1', 'IV', '歷', 'L', '當代東亞的局勢', 'b', '不同陣營的互動', '冷戰時期東亞國家間的競合。', 201),
(UUID(), '歷Lb-IV-2', 'IV', '歷', 'L', '當代東亞的局勢', 'b', '不同陣營的互動', '東南亞地區國際組織的發展與影響。', 202);

-- ============================================
-- 主題 M: 歷史考察（四）（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷M-IV-1', 'IV', '歷', 'M', '歷史考察（四）', NULL, NULL, '從主題K或L挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 211);

-- ============================================
-- 主題 N: 古代文化的遺產
-- ============================================

-- 項目 a: 多元並立的古代文化
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Na-IV-1', 'IV', '歷', 'N', '古代文化的遺產', 'a', '多元並立的古代文化', '非洲與西亞的早期文化。', 221),
(UUID(), '歷Na-IV-2', 'IV', '歷', 'N', '古代文化的遺產', 'a', '多元並立的古代文化', '希臘、羅馬的政治及文化。', 222);

-- 項目 b: 普世宗教的起源與發展
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Nb-IV-1', 'IV', '歷', 'N', '古代文化的遺產', 'b', '普世宗教的起源與發展', '佛教的起源與發展。', 231),
(UUID(), '歷Nb-IV-2', 'IV', '歷', 'N', '古代文化的遺產', 'b', '普世宗教的起源與發展', '基督教的起源與發展。', 232),
(UUID(), '歷Nb-IV-3', 'IV', '歷', 'N', '古代文化的遺產', 'b', '普世宗教的起源與發展', '伊斯蘭教的起源與發展。', 233);

-- ============================================
-- 主題 O: 近代世界的變革
-- ============================================

-- 項目 a: 近代歐洲的興起
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Oa-IV-1', 'IV', '歷', 'O', '近代世界的變革', 'a', '近代歐洲的興起', '文藝復興。', 241),
(UUID(), '歷Oa-IV-2', 'IV', '歷', 'O', '近代世界的變革', 'a', '近代歐洲的興起', '宗教改革。', 242),
(UUID(), '歷Oa-IV-3', 'IV', '歷', 'O', '近代世界的變革', 'a', '近代歐洲的興起', '科學革命與啟蒙運動。', 243);

-- 項目 b: 多元世界的互動
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Ob-IV-1', 'IV', '歷', 'O', '近代世界的變革', 'b', '多元世界的互動', '歐洲的海外擴張與傳教。', 251),
(UUID(), '歷Ob-IV-2', 'IV', '歷', 'O', '近代世界的變革', 'b', '多元世界的互動', '美洲和澳洲的政治與文化。', 252),
(UUID(), '歷Ob-IV-3', 'IV', '歷', 'O', '近代世界的變革', 'b', '多元世界的互動', '近代南亞與東南亞。', 253);

-- ============================================
-- 主題 P: 歷史考察（五）（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷P-IV-1', 'IV', '歷', 'P', '歷史考察（五）', NULL, NULL, '從主題N或O挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 261);

-- ============================================
-- 主題 Q: 現代世界的發展
-- ============================================

-- 項目 a: 現代國家的建立
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Qa-IV-1', 'IV', '歷', 'Q', '現代世界的發展', 'a', '現代國家的建立', '美國獨立與法國大革命。', 271),
(UUID(), '歷Qa-IV-2', 'IV', '歷', 'Q', '現代世界的發展', 'a', '現代國家的建立', '工業革命與社會變遷。', 272),
(UUID(), '歷Qa-IV-3', 'IV', '歷', 'Q', '現代世界的發展', 'a', '現代國家的建立', '民族主義與國家建立。', 273);

-- 項目 b: 帝國主義的興起與影響
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Qb-IV-1', 'IV', '歷', 'Q', '現代世界的發展', 'b', '帝國主義的興起與影響', '歐洲帝國的擴張。', 281),
(UUID(), '歷Qb-IV-2', 'IV', '歷', 'Q', '現代世界的發展', 'b', '帝國主義的興起與影響', '亞、非、美三洲的發展及回應。', 282),
(UUID(), '歷Qb-IV-3', 'IV', '歷', 'Q', '現代世界的發展', 'b', '帝國主義的興起與影響', '第一次世界大戰。', 283);

-- 項目 c: 戰爭與現代社會
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷Qc-IV-1', 'IV', '歷', 'Q', '現代世界的發展', 'c', '戰爭與現代社會', '戰間期的世界局勢。', 291),
(UUID(), '歷Qc-IV-2', 'IV', '歷', 'Q', '現代世界的發展', 'c', '戰爭與現代社會', '第二次世界大戰。', 292),
(UUID(), '歷Qc-IV-3', 'IV', '歷', 'Q', '現代世界的發展', 'c', '戰爭與現代社會', '從兩極到多元的戰後世界。', 293);

-- ============================================
-- 主題 R: 歷史考察（六）（無項目）
-- ============================================
INSERT INTO social_learning_contents (id, code, stage, subject, theme, theme_name, category, category_name, description, sort_order) VALUES
(UUID(), '歷R-IV-1', 'IV', '歷', 'R', '歷史考察（六）', NULL, NULL, '從主題Q挑選適當課題深入探究，或規劃與執行歷史踏查或展演。', 301);

-- ============================================
-- 完成！國中歷史科共 18 個主題，約 65 筆條目
-- ============================================

