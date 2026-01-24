-- 國文學習內容種子資料（國中/高中）
-- 兩層結構：主分類代碼 → 學習內容項目

-- ============================================
-- 國中 - 2.字詞 (Ab)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Ab', '2.字詞', 'Ab-IV-1', '4,000個常用字的字形、字音和字義。'),
('國中', 'Ab', '2.字詞', 'Ab-IV-2', '3,500個常用字的使用。'),
('國中', 'Ab', '2.字詞', 'Ab-IV-3', '基本的造字原則：象形、指事、會意、形聲。'),
('國中', 'Ab', '2.字詞', 'Ab-IV-4', '6,500個常用語詞的認念。'),
('國中', 'Ab', '2.字詞', 'Ab-IV-5', '5,000個常用語詞的使用。'),
('國中', 'Ab', '2.字詞', 'Ab-IV-6', '常用文言文的詞義及語詞結構。'),
('國中', 'Ab', '2.字詞', 'Ab-IV-7', '常用文言文的字詞、虛字、古今義變。'),
('國中', 'Ab', '2.字詞', 'Ab-IV-8', '各體書法與名家碑帖的認識與欣賞。');

-- ============================================
-- 國中 - 3.句段 (Ac)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Ac', '3.句段', 'Ac-IV-1', '標點符號在文本中的不同效果。'),
('國中', 'Ac', '3.句段', 'Ac-IV-2', '敘事、有無、判斷、表態等句型。'),
('國中', 'Ac', '3.句段', 'Ac-IV-3', '文句表達的邏輯與意義。');

-- ============================================
-- 國中 - 4.篇章 (Ad)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Ad', '4.篇章', 'Ad-IV-1', '篇章的主旨、結構、寓意與分析。'),
('國中', 'Ad', '4.篇章', 'Ad-IV-2', '新詩、現代散文、現代小說、劇本。'),
('國中', 'Ad', '4.篇章', 'Ad-IV-3', '韻文：如古體詩、樂府詩、近體詩、詞、曲等。'),
('國中', 'Ad', '4.篇章', 'Ad-IV-4', '非韻文：如古文、古典小說、語錄體、寓言等。');

-- ============================================
-- 國中 - 1.記敘文本 (Ba)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Ba', '1.記敘文本', '◎Ba-IV-1', '順敘、倒敘、插敘與補敘法。'),
('國中', 'Ba', '1.記敘文本', 'Ba-IV-2', '各種描寫的作用及呈現的效果。');

-- ============================================
-- 國中 - 2.抒情文本 (Bb)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Bb', '2.抒情文本', '◎Bb-IV-1', '自我及人際交流的感受。'),
('國中', 'Bb', '2.抒情文本', '◎Bb-IV-2', '對社會群體與家國民族情感的體會。'),
('國中', 'Bb', '2.抒情文本', 'Bb-IV-3', '對物或自然以及生命的感悟。'),
('國中', 'Bb', '2.抒情文本', '◎Bb-IV-4', '直接抒情。'),
('國中', 'Bb', '2.抒情文本', '◎Bb-IV-5', '藉由敘述事件與描寫景物間接抒情。');

-- ============================================
-- 國中 - 3.說明文本 (Bc)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Bc', '3.說明文本', 'Bc-IV-1', '具邏輯、客觀、理性的說明，如科學知識、產品、環境、制度等說明。'),
('國中', 'Bc', '3.說明文本', 'Bc-IV-2', '描述、列舉、因果、問題解決、比較、分類、定義等寫作手法。'),
('國中', 'Bc', '3.說明文本', '◎Bc-IV-3', '數據、圖表、圖片、工具列等輔助說明。');

-- ============================================
-- 國中 - 4.議論文本 (Bd)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Bd', '4.議論文本', '◎Bd-IV-1', '以事實、理論為論據，達到說服、建構、批判等目的。'),
('國中', 'Bd', '4.議論文本', 'Bd-IV-2', '論證方式如比較、比喻等。');

-- ============================================
-- 國中 - 5.應用文本 (Be)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Be', '5.應用文本', 'Be-IV-1', '在生活應用方面，以自傳、簡報、新聞稿等格式與寫作方法為主。'),
('國中', 'Be', '5.應用文本', 'Be-IV-2', '在人際溝通方面，以書信、便條、對聯等之慣用語彙與書寫格式為主。'),
('國中', 'Be', '5.應用文本', 'Be-IV-3', '在學習應用方面，以簡報、讀書報告、演講稿、劇本等格式與寫作方法為主。');

-- ============================================
-- 國中 - 1.物質文化 (Ca)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Ca', '1.物質文化', '◎Ca-IV-1', '各類文本中的飲食、服飾、建築形式、交通工具、名勝古蹟及休閒娛樂等文化內涵。'),
('國中', 'Ca', '1.物質文化', '◎Ca-IV-2', '各類文本中表現科技文明演進、生存環境發展的文化內涵。');

-- ============================================
-- 國中 - 2.社群文化 (Cb)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Cb', '2.社群文化', '◎Cb-IV-1', '各類文本中的親屬關係、道德倫理、儀式風俗、典章制 度等文化內涵。'),
('國中', 'Cb', '2.社群文化', '◎Cb-IV-2', '各類文本中所反映的個人與家庭、鄉里、國族及其他社群的關係。');

-- ============================================
-- 國中 - 3.精神文化 (Cc)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('國中', 'Cc', '3.精神文化', '◎Cc-IV-1', '各類文本中的藝術、信仰、思想等文化內涵。');

-- ============================================
-- 高中 - 2.字詞 (Ab)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Ab', '2.字詞', 'Ab-V-1', '六書的基本原則。'),
('高中', 'Ab', '2.字詞', 'Ab-V-2', '文言文的詞義及語詞結構。'),
('高中', 'Ab', '2.字詞', 'Ab-V-3', '文言文的字詞、虛字、古今義變。'),
('高中', 'Ab', '2.字詞', 'Ab-V-4', '各體書法作品與名家碑帖的深入鑑賞。');

-- ============================================
-- 高中 - 3.句段 (Ac)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Ac', '3.句段', 'Ac-V-1', '文句的深層意涵與象徵意義。');

-- ============================================
-- 高中 - 4.篇章 (Ad)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Ad', '4.篇章', 'Ad-V-1', '篇章的主旨、結構、寓意與評述。'),
('高中', 'Ad', '4.篇章', 'Ad-V-2', '新詩、現代散文、現代小說、劇本。'),
('高中', 'Ad', '4.篇章', 'Ad-V-3', '韻文：如辭賦、古體詩、樂府詩、近體詩、詞、散曲、戲曲等。'),
('高中', 'Ad', '4.篇章', 'Ad-V-4', '非韻文：如古文、古典小說、語錄體、寓言等。');

-- ============================================
-- 高中 - 1.記敘文本 (Ba)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Ba', '1.記敘文本', '◎Ba-V-1', '順敘、倒敘、插敘與補敘法。'),
('高中', 'Ba', '1.記敘文本', 'Ba-V-2', '人、事、時、地、物的細部描寫。'),
('高中', 'Ba', '1.記敘文本', 'Ba-V-3', '寫作手法與文學美感的呈現。');

-- ============================================
-- 高中 - 2.抒情文本 (Bb)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Bb', '2.抒情文本', '◎Bb-V-1', '自我及人際交流的感受。'),
('高中', 'Bb', '2.抒情文本', '◎Bb-V-2', '對社會群體與家國民族情感的體會。'),
('高中', 'Bb', '2.抒情文本', 'Bb-V-3', '對萬物之情、宇宙之愛的感悟。'),
('高中', 'Bb', '2.抒情文本', '◎Bb-V-4', '藉由敘述事件與描寫景物間接抒情。');

-- ============================================
-- 高中 - 3.說明文本 (Bc)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Bc', '3.說明文本', 'Bc-V-1', '具邏輯、客觀、理性、知識的說明，如人權公約、百科全書、制度演變等。'),
('高中', 'Bc', '3.說明文本', 'Bc-V-2', '描述、列舉、因果、問題解決、比較、定義、引用、問答等寫作手法。'),
('高中', 'Bc', '3.說明文本', '◎Bc-V-3', '數據、圖表、圖片、工具列等輔助說明。');

-- ============================================
-- 高中 - 4.議論文本 (Bd)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Bd', '4.議論文本', '◎Bd-V-1', '以事實、理論為論據，達到說服、建構、批判等目的。'),
('高中', 'Bd', '4.議論文本', 'Bd-V-2', '論證方式如歸納、演繹、因果論證等。');

-- ============================================
-- 高中 - 5.應用文本 (Be)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Be', '5.應用文本', 'Be-V-1', '在生活應用方面，以自傳、新聞稿、報導、評論、等格式與寫作方法為主。'),
('高中', 'Be', '5.應用文本', 'Be-V-2', '在人際溝通方面，以書信、便條、啟事、柬帖、對聯、題辭、慶賀文、祭弔文等慣用語彙與書寫格式為主。'),
('高中', 'Be', '5.應用文本', 'Be-V-3', '在學習應用方面，以簡報、讀書報告、演講稿、會議紀錄、劇本、小論文、計劃書、申請書等格式與寫作方法為主。');

-- ============================================
-- 高中 - 1.物質文化 (Ca)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Ca', '1.物質文化', '◎Ca-V-1', '各類文本中的飲食、服飾、建築形式、交通工具、名勝古蹟及休閒娛樂等文化內涵。'),
('高中', 'Ca', '1.物質文化', '◎Ca-V-2', '各類文本中表現科技文明演進、生存環境發展的文化內涵。'),
('高中', 'Ca', '1.物質文化', 'Ca-V-3', '各類文本中物質形貌樣態的呈現方式與文本脈絡的關聯性。');

-- ============================================
-- 高中 - 2.社群文化 (Cb)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Cb', '2.社群文化', '◎Cb-V-1', '各類文本中的親屬關係、道德倫理、儀式風俗、典章制 度等文化內涵。'),
('高中', 'Cb', '2.社群文化', '◎Cb-V-2', '各類文本中所反映的個人與家庭、鄉里、國族及其他社群的關係。'),
('高中', 'Cb', '2.社群文化', 'Cb-V-3', '各類文本中所反映不同社群間的文化差異、交互影響等現象。'),
('高中', 'Cb', '2.社群文化', 'Cb-V-4', '各類文本所呈現社群關係中的性別、權力等文化符碼。');

-- ============================================
-- 高中 - 3.精神文化 (Cc)
-- ============================================
INSERT INTO chinese_middle_high_contents (school_level, main_category_code, main_category_name, code, description) VALUES
('高中', 'Cc', '3.精神文化', '◎Cc-V-1', '各類文本中的藝術、信仰、思想等文化內涵。'),
('高中', 'Cc', '3.精神文化', 'Cc-V-2', '各類文本中所反映的矛盾衝突、生命態度、天人關係等文化內涵。');

