-- 英文學習內容種子資料（國中/高中）
-- 結構：主分類（A/B/C/D）→ 子分類（a/b/c/d/e，僅 A 主題有）→ 學習內容

-- ============================================
-- 國中 - A. 語言知識 - a. 字母
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('國中', 'A', '語言知識', 'a', '字母', 'Aa-IV-1', '連續體大小寫字母的辨識及書寫。');

-- ============================================
-- 國中 - A. 語言知識 - b. 語音
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('國中', 'A', '語言知識', 'b', '語音', 'Ab-IV-1', '句子的發音、重音及語調。'),
('國中', 'A', '語言知識', 'b', '語音', '*◎Ab-IV-2', '歌謠、韻文的節奏與音韻。'),
('國中', 'A', '語言知識', 'b', '語音', '*Ab-IV-3', '字母拼讀規則（含字母拼讀的精熟能力、字彙拼寫的輔助）。');

-- ============================================
-- 國中 - A. 語言知識 - c. 字詞
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('國中', 'A', '語言知識', 'c', '字詞', 'Ac-IV-1', '簡易的英文標示。'),
('國中', 'A', '語言知識', 'c', '字詞', 'Ac-IV-2', '常見的教室用語。'),
('國中', 'A', '語言知識', 'c', '字詞', 'Ac-IV-3', '常見的生活用語。'),
('國中', 'A', '語言知識', 'c', '字詞', 'Ac-IV-4', '國中階段所學字詞（能聽、讀、說、寫最基本的1,200字詞）。');

-- ============================================
-- 國中 - A. 語言知識 - d. 句構
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('國中', 'A', '語言知識', 'd', '句構', 'Ad-IV-1', '國中階段所學的文法句型。');

-- ============================================
-- 國中 - A. 語言知識 - e. 篇章
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('國中', 'A', '語言知識', 'e', '篇章', '◎Ae-IV-1', '簡易歌謠、韻文、短文、故事及短劇。'),
('國中', 'A', '語言知識', 'e', '篇章', '◎Ae-IV-2', '常見的圖表。'),
('國中', 'A', '語言知識', 'e', '篇章', '*◎Ae-IV-3', '公共場所廣播（如捷運、車站、機場廣播）。'),
('國中', 'A', '語言知識', 'e', '篇章', 'Ae-IV-4', '簡易賀卡、書信、電子郵件。'),
('國中', 'A', '語言知識', 'e', '篇章', '*Ae-IV-5', '不同體裁、不同主題之簡易文章。'),
('國中', 'A', '語言知識', 'e', '篇章', 'Ae-IV-6', '簡易故事的背景、人物、事件和結局。'),
('國中', 'A', '語言知識', 'e', '篇章', '*◎Ae-IV-7', '敘述者的觀點、態度、及寫作目的。'),
('國中', 'A', '語言知識', 'e', '篇章', '*Ae-IV-8', '簡易故事及短文的大意。');

-- ============================================
-- 國中 - B. 溝通功能（無子項目）
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('國中', 'B', '溝通功能', NULL, NULL, 'B-IV-1', '自己、家人及朋友的簡易描述。'),
('國中', 'B', '溝通功能', NULL, NULL, 'B-IV-2', '國中階段所學字詞及句型的生活溝通。'),
('國中', 'B', '溝通功能', NULL, NULL, 'B-IV-3', '語言與非語言的溝通策略（如請求重述、手勢、表情等）。'),
('國中', 'B', '溝通功能', NULL, NULL, 'B-IV-4', '個人的需求、意願和感受的表達。'),
('國中', 'B', '溝通功能', NULL, NULL, 'B-IV-5', '人、事、時、地、物的描述及問答。'),
('國中', 'B', '溝通功能', NULL, NULL, '◎B-IV-6', '圖片描述。'),
('國中', 'B', '溝通功能', NULL, NULL, 'B-IV-7', '角色扮演。'),
('國中', 'B', '溝通功能', NULL, NULL, '*◎B-IV-8', '引導式討論。');

-- ============================================
-- 國中 - C. 文化與習俗（無子項目）
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('國中', 'C', '文化與習俗', NULL, NULL, 'C-IV-1', '國內外節慶習俗。'),
('國中', 'C', '文化與習俗', NULL, NULL, 'C-IV-2', '國內外風土民情。'),
('國中', 'C', '文化與習俗', NULL, NULL, 'C-IV-3', '文化習俗的了解及尊重。'),
('國中', 'C', '文化與習俗', NULL, NULL, 'C-IV-4', '基本的世界觀。'),
('國中', 'C', '文化與習俗', NULL, NULL, '*C-IV-5', '國際生活禮儀。');

-- ============================================
-- 國中 - D. 思考能力（無子項目）
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('國中', 'D', '思考能力', NULL, NULL, 'D-IV-1', '依綜合資訊作合理猜測。'),
('國中', 'D', '思考能力', NULL, NULL, 'D-IV-2', '二至三項訊息的比較、歸類、排序的方法。'),
('國中', 'D', '思考能力', NULL, NULL, 'D-IV-3', '訊息因果關係的釐清。'),
('國中', 'D', '思考能力', NULL, NULL, '*◎D-IV-4', '藉文字線索，對客觀事實及主觀意見的分辨。');

-- ============================================
-- 高中 - A. 語言知識 - b. 語音
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('高中', 'A', '語言知識', 'b', '語音', 'Ab-V-1', '句子語調所表達的情緒和態度。'),
('高中', 'A', '語言知識', 'b', '語音', '◎Ab-V-2', '歌謠、韻文的節奏與音韻。'),
('高中', 'A', '語言知識', 'b', '語音', '*Ab-V-3', '不同腔調/語言背景英語使用者的談話。');

-- ============================================
-- 高中 - A. 語言知識 - c. 字詞
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('高中', 'A', '語言知識', 'c', '字詞', 'Ac-V-1', '常見的英文標示。'),
('高中', 'A', '語言知識', 'c', '字詞', 'Ac-V-2', '生活用語。'),
('高中', 'A', '語言知識', 'c', '字詞', 'Ac-V-3', '高中階段所學字詞（字頻最高的4,500字詞）。');

-- ============================================
-- 高中 - A. 語言知識 - d. 句構
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('高中', 'A', '語言知識', 'd', '句構', 'Ad-V-1', '高中階段所學的結構。');

-- ============================================
-- 高中 - A. 語言知識 - e. 篇章
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('高中', 'A', '語言知識', 'e', '篇章', 'Ae-V-1', '歌曲、短詩、短文、短劇、故事。'),
('高中', 'A', '語言知識', 'e', '篇章', '◎Ae-V-2', '常見的圖表。'),
('高中', 'A', '語言知識', 'e', '篇章', '◎Ae-V-3', '公共場所廣播（如捷運、車站、機場廣播）。'),
('高中', 'A', '語言知識', 'e', '篇章', 'Ae-V-4', '賀卡、便條、書信、電子郵件、邀請卡。'),
('高中', 'A', '語言知識', 'e', '篇章', 'Ae-V-5', '教學廣播節目的內容。'),
('高中', 'A', '語言知識', 'e', '篇章', 'Ae-V-6', '學習雜誌、漫畫。'),
('高中', 'A', '語言知識', 'e', '篇章', 'Ae-V-7', '新聞報導。'),
('高中', 'A', '語言知識', 'e', '篇章', 'Ae-V-8', '工具書（如百科全書）或其他線上資源。'),
('高中', 'A', '語言知識', 'e', '篇章', 'Ae-V-9', '不同體裁、不同主題之文章。'),
('高中', 'A', '語言知識', 'e', '篇章', 'Ae-V-10', '故事及短劇的內容與情節。'),
('高中', 'A', '語言知識', 'e', '篇章', 'Ae-V-11', '故事的 背景、人物、事件和結局。'),
('高中', 'A', '語言知識', 'e', '篇章', '◎Ae-V-12', '敘述者的觀點、態度、及寫作目的。');

-- ============================================
-- 高中 - B. 溝通功能（無子項目）
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('高中', 'B', '溝通功能', NULL, NULL, 'B-V-1', '自己、家人及朋友的主題式或情境式介紹及描述。'),
('高中', 'B', '溝通功能', NULL, NULL, 'B-V-2', '高中階段所學字詞及句型的生活溝通。'),
('高中', 'B', '溝通功能', NULL, NULL, 'B-V-3', '語言與非語言的溝通策略（如請求重述、委婉語、迂迴解說、手勢、表情等）。'),
('高中', 'B', '溝通功能', NULL, NULL, '◎B-V-4', '圖片描述。'),
('高中', 'B', '溝通功能', NULL, NULL, 'B-V-5', '短劇表演。'),
('高中', 'B', '溝通功能', NULL, NULL, '◎B-V-6', '引導式討論。'),
('高中', 'B', '溝通功能', NULL, NULL, '*B-V-7', '符合情境或場景的自我表達與人際溝通。'),
('高中', 'B', '溝通功能', NULL, NULL, 'B-V-8', '短文、書信的內容及文本結構。'),
('高中', 'B', '溝通功能', NULL, NULL, 'B-V-9', '有情節發展及細節描述的故事或個人經驗。'),
('高中', 'B', '溝通功能', NULL, NULL, 'B-V-10', '一段談話或簡短故事的轉述。'),
('高中', 'B', '溝通功能', NULL, NULL, 'B-V-11', '日常對話、故事、廣播的要點。'),
('高中', 'B', '溝通功能', NULL, NULL, 'B-V-12', '故事及短文的主旨或大意。'),
('高中', 'B', '溝通功能', NULL, NULL, '*B-V-13', '談話或短文的摘要。'),
('高中', 'B', '溝通功能', NULL, NULL, '*B-V-14', '不同體裁、不同主題文章之賞析心得。'),
('高中', 'B', '溝通功能', NULL, NULL, '*B-V-15', '歌謠、韻文音韻之賞析心得。'),
('高中', 'B', '溝通功能', NULL, NULL, '*B-V-16', '字詞的特色、各類文學作品之賞析心得。');

-- ============================================
-- 高中 - C. 文化與習俗（無子項目）
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('高中', 'C', '文化與習俗', NULL, NULL, 'C-V-1', '多元文化觀點、不同文化及習俗的尊重。'),
('高中', 'C', '文化與習俗', NULL, NULL, 'C-V-2', '國際社會的基本生活禮儀。'),
('高中', 'C', '文化與習俗', NULL, NULL, 'C-V-3', '國際情勢、國際視野。'),
('高中', 'C', '文化與習俗', NULL, NULL, '*C-V-4', '國際議題（如全球暖化、人工智慧、氣候變遷等）。'),
('高中', 'C', '文化與習俗', NULL, NULL, 'C-V-5', '地球村觀點、生命及全球永續發展的關注。'),
('高中', 'C', '文化與習俗', NULL, NULL, 'C-V-6', '文化知識與語言能力、生活問題解決之道。'),
('高中', 'C', '文化與習俗', NULL, NULL, 'C-V-7', '多元文化、文化差異。'),
('高中', 'C', '文化與習俗', NULL, NULL, '*C-V-8', '文化涵養與國際觀。'),
('高中', 'C', '文化與習俗', NULL, NULL, '*C-V-9', '文化素養及社會上的多元文化觀點。');

-- ============================================
-- 高中 - D. 思考能力（無子項目）
-- ============================================
INSERT INTO english_middle_high_contents (school_level, main_category_code, main_category_name, sub_category_code, sub_category_name, code, description) VALUES
('高中', 'D', '思考能力', NULL, NULL, 'D-V-1', '多項訊息的比較、歸類、排序。'),
('高中', 'D', '思考能力', NULL, NULL, 'D-V-2', '兩個訊息關係的釐清。'),
('高中', 'D', '思考能力', NULL, NULL, '◎D-V-3', '藉文字線索，對客觀事實及主觀意見的分辨。'),
('高中', 'D', '思考能力', NULL, NULL, 'D-V-4', '多項訊息共通點或結論的分析及歸納。'),
('高中', 'D', '思考能力', NULL, NULL, 'D-V-5', '原則的類推、問題解決之道。'),
('高中', 'D', '思考能力', NULL, NULL, 'D-V-6', '依於訊息的整合，對情勢發展的預測。'),
('高中', 'D', '思考能力', NULL, NULL, 'D-V-7', '不同資訊的評估，及合理判斷或建議的提供。'),
('高中', 'D', '思考能力', NULL, NULL, 'D-V-8', '資訊的評估，及任務的規劃與完成。');

