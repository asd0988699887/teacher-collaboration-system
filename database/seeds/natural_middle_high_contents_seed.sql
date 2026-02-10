-- 自然科學習內容種子資料（國中/高中）
-- 國中：三層結構（主題 → 次主題 → 學習內容）
-- 高中：四層結構（科目 → 主題 → 次主題 → 學習內容）

-- ============================================
-- 國中 - 物質的組成與特性（A）
-- ============================================

-- 物質組成與元素的週期性（Aa）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'A', '物質的組成與特性', 'Aa', '物質組成與元素的週期性', 'Aa-IV-1', '原子模型的發展。'),
('國中', NULL, NULL, 'A', '物質的組成與特性', 'Aa', '物質組成與元素的週期性', 'Aa-IV-2', '原子量與分子量是原子、分子之間的相對質量。'),
('國中', NULL, NULL, 'A', '物質的組成與特性', 'Aa', '物質組成與元素的週期性', 'Aa-IV-3', '純物質包括元素與化合物。'),
('國中', NULL, NULL, 'A', '物質的組成與特性', 'Aa', '物質組成與元素的週期性', 'Aa-IV-4', '元素的性質有規律性和週期性。'),
('國中', NULL, NULL, 'A', '物質的組成與特性', 'Aa', '物質組成與元素的週期性', 'Aa-IV-5', '元素與化合物有特定的化學符號表示法。');

-- 物質的形態、性質及分類（Ab）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'A', '物質的組成與特性', 'Ab', '物質的形態、性質及分類', 'Ab-IV-1', '物質的粒子模型與物質三態。'),
('國中', NULL, NULL, 'A', '物質的組成與特性', 'Ab', '物質的形態、性質及分類', 'Ab-IV-2', '溫度會影響物質的狀態。'),
('國中', NULL, NULL, 'A', '物質的組成與特性', 'Ab', '物質的形態、性質及分類', 'Ab-IV-3', '物質的物理性質與化學性質。'),
('國中', NULL, NULL, 'A', '物質的組成與特性', 'Ab', '物質的形態、性質及分類', 'Ab-IV-4', '物質依是否可用物理方法分離，可分為純物質和混合物。');

-- ============================================
-- 國中 - 能量的形式、轉換及流動（B）
-- ============================================

-- 能量的形式與轉換（Ba）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'Ba-IV-1', '能量有不同形式，例如：動能、熱能、光能、電能、化學能等，而且彼此之間可以轉換。孤立系統的總能量會維持定值。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'Ba-IV-2', '光合作用是將光能轉換成化學能；呼吸作用是將化學能轉換成熱能。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'Ba-IV-3', '化學反應中的能量改變，常以吸熱或放熱的形式發生。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'Ba-IV-4', '電池是化學能轉變成電能的裝置。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'Ba-IV-5', '力可以作功，作功可以改變物體的能量。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'Ba-IV-6', '每單位時間對物體所做的功稱為功率。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'Ba-IV-7', '物體的動能與位能之和稱為力學能，動能與位能可以互換。');

-- 溫度與熱量（Bb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bb', '溫度與熱量', 'Bb-IV-1', '熱具有從高溫處傳到低溫處的趨勢。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bb', '溫度與熱量', 'Bb-IV-2', '透過水升高溫度所吸收的熱能定義熱量單位。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bb', '溫度與熱量', 'Bb-IV-3', '不同物質受熱後，其溫度的變化可能不同，比熱就是此特性的定量化描述。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bb', '溫度與熱量', 'Bb-IV-4', '熱的傳播方式包含傳導、對流與輻射。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bb', '溫度與熱量', 'Bb-IV-5', '熱會改變物質形態，例如：狀態產生變化、體積發生脹縮。');

-- 生物體內的能量與代謝（Bc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bc', '生物體內的能量與代謝', 'Bc-IV-1', '生物經由酵素的催化進行新陳代謝，並以實驗活動探討影響酵素作用速率的因素。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bc', '生物體內的能量與代謝', 'Bc-IV-2', '細胞利用養分進行呼吸作用釋放能量，供生物生存所需。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bc', '生物體內的能量與代謝', 'Bc-IV-3', '植物利用葉綠體進行光合作用，將二氧化碳和水轉變成醣類養分，並釋出氧氣；養分可供植物本身及動物生長所需。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bc', '生物體內的能量與代謝', 'Bc-IV-4', '日光、二氧化碳和水分等因素會影響光合作用的進行，這些因素的影響可經由探究實驗來證實。');

-- 生態系中能量的流動與轉換（Bd）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bd', '生態系中能量的流動與轉換', 'Bd-IV-1', '生態系中的能量來源是太陽，能量會經由食物鏈在不同生物間流轉。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bd', '生態系中能量的流動與轉換', 'Bd-IV-2', '在生態系中，碳元素會出現在不同的物質中（例如：二氧化碳、葡萄糖），在生物與無生物間循環使用。'),
('國中', NULL, NULL, 'B', '能量的形式、轉換及流動', 'Bd', '生態系中能量的流動與轉換', 'Bd-IV-3', '生態系中，生產者、消費者和分解者共同促成能量的流轉和物質的循環。');

-- ============================================
-- 國中 - 物質的結構與功能（C）
-- ============================================

-- 物質的分離與鑑定（Ca）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'C', '物質的結構與功能', 'Ca', '物質的分離與鑑定', 'Ca-IV-1', '實驗分離混合物，例如：結晶法、過濾法及簡易濾紙色層分析法。'),
('國中', NULL, NULL, 'C', '物質的結構與功能', 'Ca', '物質的分離與鑑定', 'Ca-IV-2', '化合物可利用化學性質來鑑定。');

-- 物質的結構與功能（Cb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'C', '物質的結構與功能', 'Cb', '物質的結構與功能', 'Cb-IV-1', '分子與原子。'),
('國中', NULL, NULL, 'C', '物質的結構與功能', 'Cb', '物質的結構與功能', 'Cb-IV-2', '元素會因原子排列方式不同而有不同的特性。'),
('國中', NULL, NULL, 'C', '物質的結構與功能', 'Cb', '物質的結構與功能', 'Cb-IV-3', '分子式相同會因原子排列方式不同而形成不同的物質。');

-- ============================================
-- 國中 - 生物體的構造與功能（D）
-- ============================================

-- 細胞的構造與功能（Da）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'Da-IV-1', '使用適當的儀器可觀察到細胞的形態及細胞膜、細胞質、細胞核、細胞壁等基本構造。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'Da-IV-2', '細胞是組成生物體的基本單位。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'Da-IV-3', '多細胞個體具有細胞、組織、器官、器官系統等組成層次。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'Da-IV-4', '細胞會進行細胞分裂，染色體在分裂過程中會發生變化。');

-- 動植物體的構造與功能（Db）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Db', '動植物體的構造與功能', 'Db-IV-1', '動物體（以人體為例）經由攝食、消化、吸收獲得所需的養分。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Db', '動植物體的構造與功能', 'Db-IV-2', '動物體（以人體為例）的循環系統能將體內的物質運輸至各細胞處，並進行物質交換。並經由心跳、心音及脈搏的探測，以了解循環系統的運作情形。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Db', '動植物體的構造與功能', 'Db-IV-3', '動物體（以人體為例）藉由呼吸系統與外界交換氣體。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Db', '動植物體的構造與功能', 'Db-IV-4', '生殖系統（以人體為例）能產生配子進行有性生殖，並且有分泌激素的功能。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Db', '動植物體的構造與功能', 'Db-IV-5', '動植物體適應環境的構造常成為人類發展各種精密儀器的參考。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Db', '動植物體的構造與功能', 'Db-IV-6', '植物體根、莖、葉、花、果實內的維管束具有運輸功能。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Db', '動植物體的構造與功能', 'Db-IV-7', '花的構造中，雄蕊的花藥可產生花粉粒，花粉粒內有精細胞；雌蕊的子房內有胚珠，胚珠內有卵細胞。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Db', '動植物體的構造與功能', 'Db-IV-8', '植物體的分布會影響水在地表的流動，也會影響氣溫和空氣品質。');

-- 生物體內的恆定性與調節（Dc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Dc', '生物體內的恆定性與調節', 'Dc-IV-1', '人體的神經系統能察覺環境的變動並產生反應。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Dc', '生物體內的恆定性與調節', 'Dc-IV-2', '人體的內分泌系統能調節代謝作用，維持體內物質的恆定。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Dc', '生物體內的恆定性與調節', 'Dc-IV-3', '皮膚是人體的第一道防禦系統，能阻止外來物，例如：細菌的侵入；而淋巴系統則可進一步產生免疫作用。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Dc', '生物體內的恆定性與調節', 'Dc-IV-4', '人體會藉由各系統的協調，使體內所含的物質以及各種狀態能維持在一定範圍內。'),
('國中', NULL, NULL, 'D', '生物體的構造與功能', 'Dc', '生物體內的恆定性與調節', 'Dc-IV-5', '生物體能覺察外界環境變化、採取適當的反應以使體內環境維持恆定，這些現象能以觀察或改變自變項的方式來探討。');

-- ============================================
-- 國中 - 物質系統（E）
-- ============================================

-- 自然界的尺度與單位（Ea）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'E', '物質系統', 'Ea', '自然界的尺度與單位', 'Ea-IV-1', '時間、長度、質量等為基本物理量，經由計算可得到密度、體積等衍伸物理量。'),
('國中', NULL, NULL, 'E', '物質系統', 'Ea', '自然界的尺度與單位', 'Ea-IV-2', '以適當的尺度量測或推估物理量，例如：奈米到光年、毫克到公噸、毫升到立方公尺等。'),
('國中', NULL, NULL, 'E', '物質系統', 'Ea', '自然界的尺度與單位', 'Ea-IV-3', '測量時可依工具的最小刻度進行估計。');

-- 力與運動（Eb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-1', '力能引發物體的移動或轉動。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-2', '力矩會改變物體的轉動，槓桿是力矩的作用。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-3', '平衡的物體所受合力為零且合力矩為零。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-4', '摩擦力可分靜摩擦力與動摩擦力。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-5', '壓力的定義與帕斯卡原理。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-6', '物體在靜止液體中所受浮力，等於排開液體的重量。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-7', '簡單機械，例如：槓桿、滑輪、輪軸、齒輪、斜面，通常具有省時、省力，或者是改變作用力方向等功能。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-8', '距離、時間及方向等概念可用來描述物體的運動。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-9', '圓周運動是一種加速度運動。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-10', '物體不受力時，會保持原有的運動狀態。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-11', '物體做加速度運動時，必受力。以相同的力量作用相同的時間，則質量愈小的物體其受力後造成的速度改變愈大。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-12', '物體的質量決定其慣性大小。'),
('國中', NULL, NULL, 'E', '物質系統', 'Eb', '力與運動', 'Eb-IV-13', '對於每一作用力都有一個大小相等、方向相反的反作用力。');

-- 氣體（Ec）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'E', '物質系統', 'Ec', '氣體', 'Ec-IV-1', '大氣壓力是因為大氣層中空氣的重量所造成。'),
('國中', NULL, NULL, 'E', '物質系統', 'Ec', '氣體', 'Ec-IV-2', '定溫下，定量氣體在密閉容器內，其壓力與體積的定性關係。');

-- 宇宙與天體（Ed）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'E', '物質系統', 'Ed', '宇宙與天體', 'Ed-IV-1', '星系是組成宇宙的基本單位。'),
('國中', NULL, NULL, 'E', '物質系統', 'Ed', '宇宙與天體', 'Ed-IV-2', '我們所在的星系，稱為銀河系，主要是由恆星所組成；太陽是銀河系的成員之一。');

-- ============================================
-- 國中 - 地球環境（F）
-- ============================================

-- 組成地球的物質（Fa）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'F', '地球環境', 'Fa', '組成地球的物質', 'Fa-IV-1', '地球具有大氣圈、水圈和岩石圈。'),
('國中', NULL, NULL, 'F', '地球環境', 'Fa', '組成地球的物質', 'Fa-IV-2', '三大類岩石有不同的特徵和成因。'),
('國中', NULL, NULL, 'F', '地球環境', 'Fa', '組成地球的物質', 'Fa-IV-3', '大氣的主要成分為氮氣和氧氣，並含有水氣、二氧化碳等變動氣體。'),
('國中', NULL, NULL, 'F', '地球環境', 'Fa', '組成地球的物質', 'Fa-IV-4', '大氣可由溫度變化分層。'),
('國中', NULL, NULL, 'F', '地球環境', 'Fa', '組成地球的物質', 'Fa-IV-5', '海水具有不同的成分及特性。');

-- 地球與太空（Fb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'F', '地球環境', 'Fb', '地球與太空', 'Fb-IV-1', '太陽系由太陽和行星組成，行星均繞太陽公轉。'),
('國中', NULL, NULL, 'F', '地球環境', 'Fb', '地球與太空', 'Fb-IV-2', '類地行星的環境差異極大。'),
('國中', NULL, NULL, 'F', '地球環境', 'Fb', '地球與太空', 'Fb-IV-3', '月球繞地球公轉；日、月、地在同一直線上會發生日月食。'),
('國中', NULL, NULL, 'F', '地球環境', 'Fb', '地球與太空', 'Fb-IV-4', '月相變化具有規律性。');

-- 生物圈的組成（Fc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'F', '地球環境', 'Fc', '生物圈的組成', 'Fc-IV-1', '生物圈內含有不同的生態系。生態系的生物因子，其組成層次由低到高為個體、族群、群集。'),
('國中', NULL, NULL, 'F', '地球環境', 'Fc', '生物圈的組成', 'Fc-IV-2', '組成生物體的基本層次是細胞，而細胞則由醣類、蛋白質及脂質等分子所組成，這些分子則由更小的粒子所組成。');

-- ============================================
-- 國中 - 演化與延續（G）
-- ============================================

-- 生殖與遺傳（Ga）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'G', '演化與延續', 'Ga', '生殖與遺傳', 'Ga-IV-1', '生物的生殖可分為有性生殖與無性生殖，有性生殖產生的子代其性狀和親代差異較大。'),
('國中', NULL, NULL, 'G', '演化與延續', 'Ga', '生殖與遺傳', 'Ga-IV-2', '人類的性別主要由性染色體決定。'),
('國中', NULL, NULL, 'G', '演化與延續', 'Ga', '生殖與遺傳', 'Ga-IV-3', '人類的 ABO 血型是可遺傳的性狀。'),
('國中', NULL, NULL, 'G', '演化與延續', 'Ga', '生殖與遺傳', 'Ga-IV-4', '遺傳物質會發生變異，其變異可能造成性狀的改變，若變異發生在生殖細胞可遺傳到後代。'),
('國中', NULL, NULL, 'G', '演化與延續', 'Ga', '生殖與遺傳', 'Ga-IV-5', '生物技術的進步，有助於解決農業、食品、能源、醫藥，以及環境相關的問題，但也可能帶來新問題。'),
('國中', NULL, NULL, 'G', '演化與延續', 'Ga', '生殖與遺傳', 'Ga-IV-6', '孟德爾遺傳研究的科學史。');

-- 演化（Gb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'G', '演化與延續', 'Gb', '演化', 'Gb-IV-1', '從地層中發現的化石，可以知道地球上曾經存在許多的生物，但有些生物已經消失了，例如：三葉蟲、恐龍等。');

-- 生物多樣性（Gc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'G', '演化與延續', 'Gc', '生物多樣性', 'Gc-IV-1', '依據生物形態與構造的特徵，可以將生物分類。'),
('國中', NULL, NULL, 'G', '演化與延續', 'Gc', '生物多樣性', 'Gc-IV-2', '地球上有形形色色的生物，在生態系中擔任不同的角色，發揮不同的功能，有助於維持生態系的穩定。'),
('國中', NULL, NULL, 'G', '演化與延續', 'Gc', '生物多樣性', 'Gc-IV-3', '人的體表和體內有許多微生物，有些微生物對人體有利，有些則有害。'),
('國中', NULL, NULL, 'G', '演化與延續', 'Gc', '生物多樣性', 'Gc-IV-4', '人類文明發展中有許多利用微生物的例子，例如：早期的釀酒、近期的基因轉殖等。');

-- ============================================
-- 國中 - 地球的歷史（H）
-- ============================================

-- 地層與化石（Hb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'H', '地球的歷史', 'Hb', '地層與化石', 'Hb-IV-1', '研究岩層岩性與化石可幫助了解地球的歷史。'),
('國中', NULL, NULL, 'H', '地球的歷史', 'Hb', '地層與化石', 'Hb-IV-2', '解讀地層、地質事件，可幫助了解當地的地層發展先後順序。');

-- ============================================
-- 國中 - 變動的地球（I）
-- ============================================

-- 地表與地殼的變動（Ia）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'I', '變動的地球', 'Ia', '地表與地殼的變動', 'Ia-IV-1', '外營力及內營力的作用會改變地貌。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ia', '地表與地殼的變動', 'Ia-IV-2', '岩石圈可分為數個板塊。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ia', '地表與地殼的變動', 'Ia-IV-3', '板塊之間會相互分離或聚合，產生地震、火山和造山運動。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ia', '地表與地殼的變動', 'Ia-IV-4', '全球地震、火山分布在特定的地帶，且兩者相當吻合。');

-- 天氣與氣候變化（Ib）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'Ib-IV-1', '氣團是性質均勻的大型空氣團塊，性質各有不同。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'Ib-IV-2', '氣壓差會造成空氣的流動而產生風。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'Ib-IV-3', '由於地球自轉的關係會造成高、低氣壓空氣的旋轉。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'Ib-IV-4', '鋒面是性質不同的氣團之交界面，會產生各種天氣變化。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'Ib-IV-5', '臺灣的災變天氣包括颱風、梅雨、寒潮、乾旱等現象。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'Ib-IV-6', '臺灣秋冬季受東北季風影響，夏季受西南季風影響，造成各地氣溫、風向和降水的季節性差異。');

-- 海水的運動（Ic）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'I', '變動的地球', 'Ic', '海水的運動', 'Ic-IV-1', '海水運動包含波浪、海流和潮汐，各有不同的運動方式。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ic', '海水的運動', 'Ic-IV-2', '海流對陸地的氣候會產生影響。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ic', '海水的運動', 'Ic-IV-3', '臺灣附近的海流隨季節有所不同。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Ic', '海水的運動', 'Ic-IV-4', '潮汐變化具有規律性。');

-- 晝夜與季節（Id）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'I', '變動的地球', 'Id', '晝夜與季節', 'Id-IV-1', '夏季白天較長，冬季黑夜較長。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Id', '晝夜與季節', 'Id-IV-2', '陽光照射角度之變化，會造成地表單位面積土地吸收太陽能量的不同。'),
('國中', NULL, NULL, 'I', '變動的地球', 'Id', '晝夜與季節', 'Id-IV-3', '地球的四季主要是因為地球自轉軸傾斜於地球公轉軌道面而造成。');

-- ============================================
-- 國中 - 物質的反應、平衡及製造（J）
-- ============================================

-- 物質反應規律（Ja）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Ja', '物質反應規律', 'Ja-IV-1', '化學反應中的質量守恆定律。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Ja', '物質反應規律', 'Ja-IV-2', '化學反應是原子重新排列。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Ja', '物質反應規律', 'Ja-IV-3', '化學反應中常伴隨沉澱、氣體、顏色及溫度變化等現象。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Ja', '物質反應規律', 'Ja-IV-4', '化學反應的表示法。');

-- 水溶液中的變化（Jb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jb', '水溶液中的變化', 'Jb-IV-1', '由水溶液導電的實驗認識電解質與非電解質。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jb', '水溶液中的變化', 'Jb-IV-2', '電解質在水溶液中會解離出陰離子和陽離子而導電。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jb', '水溶液中的變化', 'Jb-IV-3', '不同的離子在水溶液中可能會發生沉澱、酸鹼中和及氧化還原等反應。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jb', '水溶液中的變化', 'Jb-IV-4', '溶液的概念及重量百分濃度（P%）、百萬分點的表示法（ppm）。');

-- 氧化與還原反應（Jc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jc', '氧化與還原反應', 'Jc-IV-1', '氧化與還原的狹義定義為：物質得到氧稱為氧化反應；失去氧稱為還原反應。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jc', '氧化與還原反應', 'Jc-IV-2', '物質燃燒實驗認識氧化。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jc', '氧化與還原反應', 'Jc-IV-3', '不同金屬元素燃燒實驗認識元素對氧氣的活性。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jc', '氧化與還原反應', 'Jc-IV-4', '生活中常見的氧化還原反應與應用。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jc', '氧化與還原反應', 'Jc-IV-5', '鋅銅電池實驗認識電池原理。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jc', '氧化與還原反應', 'Jc-IV-6', '化學電池的放電與充電。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jc', '氧化與還原反應', 'Jc-IV-7', '電解水與硫酸銅水溶液實驗認識電解原理。');

-- 酸鹼反應（Jd）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jd', '酸鹼反應', 'Jd-IV-1', '金屬與非金屬氧化物在水溶液中的酸鹼性，及酸性溶液對金屬與大理石的反應。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jd', '酸鹼反應', 'Jd-IV-2', '酸鹼強度與 pH 值的關係。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jd', '酸鹼反應', 'Jd-IV-3', '實驗認識廣用指示劑及 pH 計。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jd', '酸鹼反應', 'Jd-IV-4', '水溶液中氫離子與氫氧根離子的關係。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jd', '酸鹼反應', 'Jd-IV-5', '酸、鹼、鹽類在日常生活中的應用與危險性。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jd', '酸鹼反應', 'Jd-IV-6', '實驗認識酸與鹼中和生成鹽和水，並可放出熱量而使溫度變化。');

-- 化學反應速率與平衡（Je）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Je', '化學反應速率與平衡', 'Je-IV-1', '實驗認識化學反應速率及影響反應速率的因素，例如：本性、溫度、濃度、接觸面積及催化劑。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Je', '化學反應速率與平衡', 'Je-IV-2', '可逆反應。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Je', '化學反應速率與平衡', 'Je-IV-3', '化學平衡及溫度、濃度如何影響化學平衡的因素。');

-- 有機化合物的性質、製備及反應（Jf）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jf', '有機化合物的性質、製備及反應', 'Jf-IV-1', '有機化合物與無機化合物的重要特徵。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jf', '有機化合物的性質、製備及反應', 'Jf-IV-2', '生活中常見的烷類、醇類、有機酸及酯類。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jf', '有機化合物的性質、製備及反應', 'Jf-IV-3', '酯化與皂化反應。'),
('國中', NULL, NULL, 'J', '物質的反應、平衡及製造', 'Jf', '有機化合物的性質、製備及反應', 'Jf-IV-4', '常見的塑膠。');

-- ============================================
-- 國中 - 自然界的現象與交互作用（K）
-- ============================================

-- 波動、光及聲音（Ka）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-1', '波的特徵，例如：波峰、波谷、波長、頻率、波速、振幅。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-2', '波傳播的類型，例如：橫波和縱波。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-3', '介質的種類、狀態、密度及溫度等因素會影響聲音傳播的速率。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-4', '聲波會反射，可以做為測量、傳播等用途。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-5', '耳朵可以分辨不同的聲音，例如：大小、高低及音色，但人耳聽不到超聲波。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-6', '由針孔成像、影子實驗驗證與說明光的直進性。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-7', '光速的大小和影響光速的因素。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-8', '透過實驗探討光的反射與折射規律。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-9', '生活中有許多運用光學原理的實例或儀器，例如：透鏡、面鏡、眼睛、眼鏡及顯微鏡等。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-10', '陽光經過三稜鏡可以分散成各種色光。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'Ka-IV-11', '物體的顏色是光選擇性反射的結果。');

-- 萬有引力（Kb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Kb', '萬有引力', 'Kb-IV-1', '物體在地球或月球等星體上因為星體的引力作用而具有重量；物體之質量與其重量是不同的物理量。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Kb', '萬有引力', 'Kb-IV-2', '帶質量的兩物體之間有重力，例如：萬有引力，此力大小與兩物體各自的質量成正比、與物體間距離的平方成反比。');

-- 電磁現象（Kc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'Kc-IV-1', '摩擦可以產生靜電，電荷有正負之別。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'Kc-IV-2', '靜止帶電物體之間有靜電力，同號電荷會相斥，異號電荷則會相吸。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'Kc-IV-3', '磁場可以用磁力線表示，磁力線方向即為磁場方向，磁力線越密處磁場越大。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'Kc-IV-4', '電流會產生磁場，其方向分布可以由安培右手定則求得。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'Kc-IV-5', '載流導線在磁場會受力，並簡介電動機的運作原理。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'Kc-IV-6', '環形導線內磁場變化，會產生感應電流。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'Kc-IV-7', '電池連接導體形成通路時，多數導體通過的電流與其兩端電壓差成正比，其比值即為電阻。'),
('國中', NULL, NULL, 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'Kc-IV-8', '電流通過帶有電阻物體時，能量會以發熱的形式逸散。');

-- ============================================
-- 國中 - 生物與環境（L）
-- ============================================

-- 生物間的交互作用（La）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'L', '生物與環境', 'La', '生物間的交互作用', 'La-IV-1', '隨著生物間、生物與環境間的交互作用，生態系中的結構會隨時間改變，形成演替現象。');

-- 生物與環境的交互作用（Lb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'L', '生物與環境', 'Lb', '生物與環境的交互作用', 'Lb-IV-1', '生態系中的非生物因子會影響生物的分布與生存，環境調查時常需檢測非生物因子的變化。'),
('國中', NULL, NULL, 'L', '生物與環境', 'Lb', '生物與環境的交互作用', 'Lb-IV-2', '人類活動會改變環境，也可能影響其他生物的生存。'),
('國中', NULL, NULL, 'L', '生物與環境', 'Lb', '生物與環境的交互作用', 'Lb-IV-3', '人類可採取行動來維持生物的生存環境，使生物能在自然環境中生長、繁殖、交互作用，以維持生態平衡。');

-- ============================================
-- 國中 - 科學、科技、社會及人文（M）
-- ============================================

-- 科學、技術及社會的互動關係（Ma）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Ma', '科學、技術及社會的互動關係', 'Ma-IV-1', '生命科學的進步，有助於解決社會中發生的農業、食品、能源、醫藥，以及環境相關的問題。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Ma', '科學、技術及社會的互動關係', 'Ma-IV-2', '保育工作不是只有科學家能夠處理，所有的公民都有權利及義務，共同研究、監控及維護生物多樣性。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Ma', '科學、技術及社會的互動關係', 'Ma-IV-3', '不同的材料對生活及社會的影響。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Ma', '科學、技術及社會的互動關係', 'Ma-IV-4', '各種發電方式與新興的能源科技對社會、經濟、環境及生態的影響。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Ma', '科學、技術及社會的互動關係', 'Ma-IV-5', '各種本土科學知能（含原住民族科學與世界觀）對社會、經濟環境及生態保護之啟示。');

-- 科學發展的歷史（Mb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Mb', '科學發展的歷史', 'Mb-IV-1', '生物技術的發展是為了因應人類需求，運用跨領域技術來改造生物。發展相關技術的歷程中，也應避免對其他生物以及環境造成過度的影響。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Mb', '科學發展的歷史', 'Mb-IV-2', '科學史上重要發現的過程，以及不同性別、背景、族群者於其中的貢獻。');

-- 科學在生活中的應用（Mc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'Mc-IV-1', '生物生長條件與機制在處理環境汙染物質的應用。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'Mc-IV-2', '運用生物體的構造與功能，可改善人類生活。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'Mc-IV-3', '生活中對各種材料進行加工與運用。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'Mc-IV-4', '常見人造材料的特性、簡單的製造過程及在生活上的應用。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'Mc-IV-5', '電力供應與輸送方式的概要。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'Mc-IV-6', '用電安全常識，避免觸電和電線走火。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'Mc-IV-7', '電器標示和電費計算。');

-- 天然災害與防治（Md）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Md', '天然災害與防治', 'Md-IV-1', '生物保育知識與技能在防治天然災害的應用。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Md', '天然災害與防治', 'Md-IV-2', '颱風主要發生在七至九月，並容易造成生命財產的損失。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Md', '天然災害與防治', 'Md-IV-3', '颱風會帶來狂風、豪雨及暴潮等災害。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Md', '天然災害與防治', 'Md-IV-4', '臺灣位處於板塊交界，因此地震頻仍，常造成災害。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Md', '天然災害與防治', 'Md-IV-5', '大雨過後和順向坡會加重山崩的威脅。');

-- 環境汙染與防治（Me）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'Me-IV-1', '環境汙染物對生物生長的影響及應用。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'Me-IV-2', '家庭廢水的影響與再利用。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'Me-IV-3', '空氣品質與空氣汙染的種類、來源及一般防治方法。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'Me-IV-4', '溫室氣體與全球暖化。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'Me-IV-5', '重金屬汙染的影響。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'Me-IV-6', '環境汙染物與生物放大的關係。'),
('國中', NULL, NULL, 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'Me-IV-7', '對聲音的特性做深入的研究可以幫助我們更確實防範噪音的汙染。');

-- ============================================
-- 國中 - 資源與永續發展（N）
-- ============================================

-- 永續發展與資源的利用（Na）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'Na-IV-1', '利用生物資源會影響生物間相互依存的關係。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'Na-IV-2', '生活中節約能源的方法。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'Na-IV-3', '環境品質繫於資源的永續利用與維持生態平衡。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'Na-IV-4', '資源使用的 5R：減量、拒絕、重複使用、回收及再生。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'Na-IV-5', '各種廢棄物對環境的影響，環境的承載能力與處理方法。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'Na-IV-6', '人類社會的發展必須建立在保護地球自然環境的基礎上。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'Na-IV-7', '為使地球永續發展，可以從減量、回收、再利用、綠能等做起。');

-- 氣候變遷之影響與調適（Nb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'N', '資源與永續發展', 'Nb', '氣候變遷之影響與調適', 'Nb-IV-1', '全球暖化對生物的影響。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Nb', '氣候變遷之影響與調適', 'Nb-IV-2', '氣候變遷產生的衝擊有海平面上升、全球暖化、異常降水等現象。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Nb', '氣候變遷之影響與調適', 'Nb-IV-3', '因應氣候變遷的方法有減緩與調適。');

-- 能源的開發與利用（Nc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('國中', NULL, NULL, 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'Nc-IV-1', '生質能源的發展現況。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'Nc-IV-2', '開發任何一種能源都有風險，應依據證據來評估與決策。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'Nc-IV-3', '化石燃料的形成與特性。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'Nc-IV-4', '新興能源的開發，例如：風能、太陽能、核融合發電、汽電共生、生質能、燃料電池等。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'Nc-IV-5', '新興能源的科技，例如：油電混合動力車、太陽能飛機等。'),
('國中', NULL, NULL, 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'Nc-IV-6', '臺灣能源的利用現況與未來展望。');

-- ============================================
-- 高中 - 生物（B）
-- ============================================

-- 生物體的構造與功能（D）- 細胞的構造與功能（Da）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'B', '生物', 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'BDa-Vc-1', '不同的細胞具有不同的功能、形態及構造。'),
('高中', 'B', '生物', 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'BDa-Vc-2', '原核細胞與真核細胞的構造與功能。'),
('高中', 'B', '生物', 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'BDa-Vc-3', 'ATP 是提供細胞生理作用所需能量的直接來源。'),
('高中', 'B', '生物', 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'BDa-Vc-4', '光合作用與呼吸作用的能量轉換關係。'),
('高中', 'B', '生物', 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'BDa-Vc-5', '真核細胞的細胞週期包括間期與細胞分裂期。'),
('高中', 'B', '生物', 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'BDa-Vc-6', '真核細胞的細胞分裂。'),
('高中', 'B', '生物', 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'BDa-Vc-7', '有絲分裂的過程。'),
('高中', 'B', '生物', 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'BDa-Vc-8', '動物生殖細胞一般須經過減數分裂的過程形成配子。'),
('高中', 'B', '生物', 'D', '生物體的構造與功能', 'Da', '細胞的構造與功能', 'BDa-Vc-9', '多細胞生物的受精卵經由有絲分裂與細胞分化的過程，形成不同類型的細胞。');

-- 演化與延續（G）- 生殖與遺傳（Ga）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'B', '生物', 'G', '演化與延續', 'Ga', '生殖與遺傳', 'BGa-Vc-1', '孟德爾遺傳法則中，性狀與遺傳因子之關係。'),
('高中', 'B', '生物', 'G', '演化與延續', 'Ga', '生殖與遺傳', 'BGa-Vc-2', '孟德爾遺傳法則的延伸。'),
('高中', 'B', '生物', 'G', '演化與延續', 'Ga', '生殖與遺傳', 'BGa-Vc-3', '遺傳的染色體學說之發展歷程。'),
('高中', 'B', '生物', 'G', '演化與延續', 'Ga', '生殖與遺傳', 'BGa-Vc-4', '性聯遺傳。'),
('高中', 'B', '生物', 'G', '演化與延續', 'Ga', '生殖與遺傳', 'BGa-Vc-5', '遺傳物質為核酸。'),
('高中', 'B', '生物', 'G', '演化與延續', 'Ga', '生殖與遺傳', 'BGa-Vc-6', '分子遺傳學的中心法則。'),
('高中', 'B', '生物', 'G', '演化與延續', 'Ga', '生殖與遺傳', 'BGa-Vc-7', '同一性狀具有不同的表徵。');

-- 演化與延續（G）- 演化（Gb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'B', '生物', 'G', '演化與延續', 'Gb', '演化', 'BGb-Vc-1', '生物性狀的表徵比例會變動。'),
('高中', 'B', '生物', 'G', '演化與延續', 'Gb', '演化', 'BGb-Vc-2', '達爾文的演化理論。'),
('高中', 'B', '生物', 'G', '演化與延續', 'Gb', '演化', 'BGb-Vc-3', '共同祖先的概念對生物分類系統之影響。'),
('高中', 'B', '生物', 'G', '演化與延續', 'Gb', '演化', 'BGb-Vc-4', '演化證據對生物分類系統演變之影響。'),
('高中', 'B', '生物', 'G', '演化與延續', 'Gb', '演化', 'BGb-Vc-5', '在地球上的生物經演化過程而形成目前的生物多樣性。');

-- 科學、科技、社會及人文（M）- 科學發展的歷史（Mb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'B', '生物', 'M', '科學、科技、社會及人文', 'Mb', '科學發展的歷史', 'BMb-Vc-1', '細胞學說的發展歷程。'),
('高中', 'B', '生物', 'M', '科學、科技、社會及人文', 'Mb', '科學發展的歷史', 'BMb-Vc-2', '孟德爾依據實驗結果推論遺傳現象的規律性。'),
('高中', 'B', '生物', 'M', '科學、科技、社會及人文', 'Mb', '科學發展的歷史', 'BMb-Vc-3', '性染色體的發現。'),
('高中', 'B', '生物', 'M', '科學、科技、社會及人文', 'Mb', '科學發展的歷史', 'BMb-Vc-4', '演化觀念的形成與發展。');

-- 科學、科技、社會及人文（M）- 科學在生活中的應用（Mc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'B', '生物', 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'BMc-Vc-1', '基因轉殖技術的應用。');

-- ============================================
-- 高中 - 物理（P）
-- ============================================

-- 能量的形式、轉換及流動（B）- 能量的形式與轉換（Ba）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'PBa-Vc-1', '電場以及磁場均具有能量，利用手機傳遞訊息即是電磁場以電磁波的形式來傳遞能量的實例。'),
('高中', 'P', '物理', 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'PBa-Vc-2', '不同形式的能量間可以轉換，且總能量守恆。能量的形式因觀察尺度的不同，而有不同的展現與說明。'),
('高中', 'P', '物理', 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'PBa-Vc-3', '質量及能量可以相互轉換，其轉換公式為E = mc2。'),
('高中', 'P', '物理', 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'PBa-Vc-4', '原子核的融合以及原子核的分裂是質量可以轉換為能量的應用實例，且為目前重要之能源議題。');

-- 能量的形式、轉換及流動（B）- 溫度與熱量（Bb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'B', '能量的形式、轉換及流動', 'Bb', '溫度與熱量', 'PBb-Vc-1', '克氏溫標的意義及理想氣體的內能的簡單說明。'),
('高中', 'P', '物理', 'B', '能量的形式、轉換及流動', 'Bb', '溫度與熱量', 'PBb-Vc-2', '實驗顯示：把功轉換成熱很容易，卻無法把熱完全轉換為功。'),
('高中', 'P', '物理', 'B', '能量的形式、轉換及流動', 'Bb', '溫度與熱量', 'PBb-Vc-3', '物體內的原子不斷在運動並交互作用，此交互作用能量與原子的動能合稱為熱能。'),
('高中', 'P', '物理', 'B', '能量的形式、轉換及流動', 'Bb', '溫度與熱量', 'PBb-Vc-4', '由於物體溫度的不同所造成的能量傳遞稱為熱。');

-- 物質系統（E）- 自然界的尺度與單位（Ea）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'E', '物質系統', 'Ea', '自然界的尺度與單位', 'PEa-Vc-1', '科學上常用的物理量有國際標準單位。'),
('高中', 'P', '物理', 'E', '物質系統', 'Ea', '自然界的尺度與單位', 'PEa-Vc-2', '因工具的限制或應用上的方便，許多自然科學所需的測量，包含物理量，是經由基本物理量的測量再計算而得。'),
('高中', 'P', '物理', 'E', '物質系統', 'Ea', '自然界的尺度與單位', 'PEa-Vc-3', '原子的大小約為 10-10公尺，原子核的大小約為10-15公尺。');

-- 物質系統（E）- 力與運動（Eb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'E', '物質系統', 'Eb', '力與運動', 'PEb-Vc-1', '伽利略之前學者對物體運動的觀察與思辯。'),
('高中', 'P', '物理', 'E', '物質系統', 'Eb', '力與運動', 'PEb-Vc-2', '伽利略對物體運動的研究與思辯歷程。'),
('高中', 'P', '物理', 'E', '物質系統', 'Eb', '力與運動', 'PEb-Vc-3', '克卜勒行星運動三大定律發現的歷史背景及內容。'),
('高中', 'P', '物理', 'E', '物質系統', 'Eb', '力與運動', 'PEb-Vc-4', '牛頓三大運動定律。'),
('高中', 'P', '物理', 'E', '物質系統', 'Eb', '力與運動', 'PEb-Vc-5', '摩擦力、正向力、彈力等常見的作用力。');

-- 自然界的現象與交互作用（K）- 波動、光及聲音（Ka）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'PKa-Vc-1', '波速、頻率、波長的數學關係。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'PKa-Vc-2', '定性介紹都卜勒效應及其應用。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'PKa-Vc-3', '歷史上光的主要理論有微粒說和波動說。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'PKa-Vc-4', '光的反射定律，並以波動理論解釋折射定律。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'PKa-Vc-5', '光除了反射和折射現象外，也有干涉及繞射現象。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'PKa-Vc-6', '惠更斯原理可以解釋光波如何前進、干涉和繞射。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Ka', '波動、光及聲音', 'PKa-Vc-7', '馬克士威從其方程式預測電磁波的存在，且計算出電磁波的速度等於光速，因此推論光是一種電磁波，後來也獲得證實。');

-- 自然界的現象與交互作用（K）- 萬有引力（Kb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kb', '萬有引力', 'PKb-Vc-1', '牛頓運動定律結合萬有引力定律可用以解釋克卜勒行星運動定律。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kb', '萬有引力', 'PKb-Vc-2', '物體在重力場中運動的定性描述。');

-- 自然界的現象與交互作用（K）- 電磁現象（Kc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'PKc-Vc-1', '電荷會產生電場，兩點電荷間有電力，此力量值與兩點電荷所帶電荷量成正比，與兩點電荷間的距離平方成反比。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'PKc-Vc-2', '原子內帶負電的電子與帶正電的原子核以電力互相吸引，形成穩定的原子結構。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'PKc-Vc-3', '變動的磁場會產生電場，變動的電場會產生磁場。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'PKc-Vc-4', '所有的電磁現象經統整後，皆可由馬克士威方程式描述。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'PKc-Vc-5', '馬克士威方程式預測電磁場的擾動可以在空間中傳遞，即為電磁波。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kc', '電磁現象', 'PKc-Vc-6', '電磁波包含低頻率的無線電波，到高頻率的伽瑪射線在日常生活中有廣泛的應用。');

-- 自然界的現象與交互作用（K）- 量子現象（Kd）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kd', '量子現象', 'PKd-Vc-1', '光具有粒子性，光子能量 E=hν，與其頻率 ν成正比。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kd', '量子現象', 'PKd-Vc-2', '光電效應在日常生活中之應用。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kd', '量子現象', 'PKd-Vc-3', '原子光譜。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kd', '量子現象', 'PKd-Vc-4', '能階的概念。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kd', '量子現象', 'PKd-Vc-5', '電子的雙狹縫干涉現象與其波動性。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kd', '量子現象', 'PKd-Vc-6', '光子與電子以及所有微觀粒子都具有波粒二象性。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Kd', '量子現象', 'PKd-Vc-7', '牛頓運動定律在原子尺度以下並不適用。');

-- 自然界的現象與交互作用（K）- 基本交互作用（Ke）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Ke', '基本交互作用', 'PKe-Vc-1', '原子核內的質子與質子、質子與中子、中子與中子之間有強力使它們互相吸引。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Ke', '基本交互作用', 'PKe-Vc-2', '單獨的中子並不穩定，會透過弱作用（或弱力）自動衰變成質子及其他粒子。'),
('高中', 'P', '物理', 'K', '自然界的現象與交互作用', 'Ke', '基本交互作用', 'PKe-Vc-3', '自然界的一切交互作用可完全由重力、電磁力、強力、以及弱作用等四種基本交互作用所涵蓋。');

-- 科學、科技、社會及人文（M）- 科學在生活中的應用（Mc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'PMc-Vc-1', '用電安全。'),
('高中', 'P', '物理', 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'PMc-Vc-2', '電在生活中的應用。'),
('高中', 'P', '物理', 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'PMc-Vc-3', '科學的態度與方法。'),
('高中', 'P', '物理', 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'PMc-Vc-4', '近代物理科學的發展，以及不同性別、背景、族群者於其中的貢獻。');

-- 資源與永續發展（N）- 能源的開發與利用（Nc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'P', '物理', 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'PNc-Vc-1', '原子核的分裂。'),
('高中', 'P', '物理', 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'PNc-Vc-2', '核能發電與輻射安全。'),
('高中', 'P', '物理', 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'PNc-Vc-3', '能量一樣的系統，作功的能力不一定相同。'),
('高中', 'P', '物理', 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'PNc-Vc-4', '雖然能量守恆，但能量一旦發生形式上的轉換，通常其作功效能會降低。');

-- ============================================
-- 高中 - 化學（C）
-- ============================================

-- 物質的組成與特性（A）- 物質組成與元素的週期性（Aa）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'A', '物質的組成與特性', 'Aa', '物質組成與元素的週期性', 'CAa-Vc-1', '拉瓦節提出物質最基本的組成是元素。'),
('高中', 'C', '化學', 'A', '物質的組成與特性', 'Aa', '物質組成與元素的週期性', 'CAa-Vc-2', '道耳頓根據定比定律、倍比定律、質量守恆定律及元素概念提出原子說。'),
('高中', 'C', '化學', 'A', '物質的組成與特性', 'Aa', '物質組成與元素的週期性', 'CAa-Vc-3', '元素依原子序大小順序，有規律的排列在週期表上。'),
('高中', 'C', '化學', 'A', '物質的組成與特性', 'Aa', '物質組成與元素的週期性', 'CAa-Vc-4', '同位素。');

-- 物質的組成與特性（A）- 物質的形態、性質及分類（Ab）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'A', '物質的組成與特性', 'Ab', '物質的形態、性質及分類', 'CAb-Vc-1', '物質的三相圖。'),
('高中', 'C', '化學', 'A', '物質的組成與特性', 'Ab', '物質的形態、性質及分類', 'CAb-Vc-2', '元素可依特性分為金屬、類金屬及非金屬。'),
('高中', 'C', '化學', 'A', '物質的組成與特性', 'Ab', '物質的形態、性質及分類', 'CAb-Vc-3', '化合物可依組成與性質不同，分為離子化合物與分子化合物。');

-- 能量的形式、轉換及流動（B）- 能量的形式與轉換（Ba）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'CBa-Vc-1', '化學反應發生後，產物的能量總和較反應物低者，為放熱反應；反之，則為吸熱反應。'),
('高中', 'C', '化學', 'B', '能量的形式、轉換及流動', 'Ba', '能量的形式與轉換', 'CBa-Vc-2', '能量轉換過程遵守能量守恆。');

-- 物質的結構與功能（C）- 物質的分離與鑑定（Ca）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'C', '物質的結構與功能', 'Ca', '物質的分離與鑑定', 'CCa-Vc-1', '混合物的分離過程與純化方法：蒸餾、萃取、色層分析、硬水軟化及海水純化等。'),
('高中', 'C', '化學', 'C', '物質的結構與功能', 'Ca', '物質的分離與鑑定', 'CCa-Vc-2', '化合物特性的差異。');

-- 物質的結構與功能（C）- 物質的結構與功能（Cb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'C', '物質的結構與功能', 'Cb', '物質的結構與功能', 'CCb-Vc-1', '原子之間會以不同方式形成不同的化學鍵結。'),
('高中', 'C', '化學', 'C', '物質的結構與功能', 'Cb', '物質的結構與功能', 'CCb-Vc-2', '化學鍵的特性會影響物質的結構，並決定其功能。');

-- 物質系統（E）- 氣體（Ec）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'E', '物質系統', 'Ec', '氣體', 'CEc-Vc-1', '氣體基本性質。');

-- 物質的反應、平衡及製造（J）- 物質反應規律（Ja）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Ja', '物質反應規律', 'CJa-Vc-1', '拉瓦節以定量分析方法，驗證質量守恆定律。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Ja', '物質反應規律', 'CJa-Vc-2', '化學反應僅為原子的重新排列組合，其個數不變，依此原則即可平衡化學反應方程式。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Ja', '物質反應規律', 'CJa-Vc-3', '莫耳與簡單的化學計量。');

-- 物質的反應、平衡及製造（J）- 水溶液中的變化（Jb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jb', '水溶液中的變化', 'CJb-Vc-1', '溶液的種類與特性。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jb', '水溶液中的變化', 'CJb-Vc-2', '定量說明物質在水中溶解的程度會受到水溫的影響。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jb', '水溶液中的變化', 'CJb-Vc-3', '體積莫耳濃度的表示法。');

-- 物質的反應、平衡及製造（J）- 氧化與還原反應（Jc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jc', '氧化與還原反應', 'CJc-Vc-1', '氧化還原的廣義定義為：物質失去電子稱為氧化反應；得到電子稱為還原反應。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jc', '氧化與還原反應', 'CJc-Vc-2', '氧化劑與還原劑的定義及常見氧化劑與還原劑。');

-- 物質的反應、平衡及製造（J）- 酸鹼反應（Jd）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jd', '酸鹼反應', 'CJd-Vc-1', '水可自解離產生H+和OH-。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jd', '酸鹼反應', 'CJd-Vc-2', '根據阿瑞尼斯的酸鹼學說，物質溶於水中，可解離出H+為酸；可解離出OH-為鹼。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jd', '酸鹼反應', 'CJd-Vc-3', 'pH＝-log[H+]，此數值可代表水溶液的酸鹼程度。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jd', '酸鹼反應', 'CJd-Vc-4', '在水溶液中可幾乎100%解離的酸或鹼，為強酸或強鹼；反之則稱為弱酸或弱鹼。');

-- 物質的反應、平衡及製造（J）- 化學反應速率與平衡（Je）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Je', '化學反應速率與平衡', 'CJe-Vc-1', '定溫時，飽和溶液的溶質溶解度為定值，其溶質溶解與結晶達到平衡。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Je', '化學反應速率與平衡', 'CJe-Vc-2', '物質的接觸面積大小對反應速率之影響。');

-- 物質的反應、平衡及製造（J）- 有機化合物的性質、製備及反應（Jf）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jf', '有機化合物的性質、製備及反應', 'CJf-Vc-1', '醣類、蛋白質、油脂及核酸的性質與功能。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jf', '有機化合物的性質、製備及反應', 'CJf-Vc-2', '常見的界面活性劑包括肥皂與清潔劑，其組成包含親油性的一端和親水性的一端。'),
('高中', 'C', '化學', 'J', '物質的反應、平衡及製造', 'Jf', '有機化合物的性質、製備及反應', 'CJf-Vc-3', '界面活性劑的性質與應用。');

-- 科學、科技、社會及人文（M）- 科學、技術及社會的互動關係（Ma）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'M', '科學、科技、社會及人文', 'Ma', '科學、技術及社會的互動關係', 'CMa-Vc-1', '化學製造流程對日常生活、社會、經濟、環境及生態的影響。');

-- 科學、科技、社會及人文（M）- 科學發展的歷史（Mb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'M', '科學、科技、社會及人文', 'Mb', '科學發展的歷史', 'CMb-Vc-1', '近代化學科學的發展，以及不同性別、背景、族群者於其中的貢獻。'),
('高中', 'C', '化學', 'M', '科學、科技、社會及人文', 'Mb', '科學發展的歷史', 'CMb-Vc-2', '未來科學的發展。');

-- 科學、科技、社會及人文（M）- 科學在生活中的應用（Mc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'CMc-Vc-1', '水的處理過程。'),
('高中', 'C', '化學', 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'CMc-Vc-2', '生活中常見的藥品。'),
('高中', 'C', '化學', 'M', '科學、科技、社會及人文', 'Mc', '科學在生活中的應用', 'CMc-Vc-3', '化學在先進科技發展的應用。');

-- 科學、科技、社會及人文（M）- 環境汙染與防治（Me）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'CMe-Vc-1', '酸雨的成因、影響及防治方法。'),
('高中', 'C', '化學', 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'CMe-Vc-2', '全球暖化的成因、影響及因應方法。'),
('高中', 'C', '化學', 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'CMe-Vc-3', '臭氧層破洞的成因、影響及防治方法。'),
('高中', 'C', '化學', 'M', '科學、科技、社會及人文', 'Me', '環境汙染與防治', 'CMe-Vc-4', '工業廢水的影響與再利用。');

-- 資源與永續發展（N）- 永續發展與資源的利用（Na）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'CNa-Vc-1', '永續發展在於滿足當代人之需求，又不危及下一代之發展。'),
('高中', 'C', '化學', 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'CNa-Vc-2', '將永續發展的理念應用於生活中。'),
('高中', 'C', '化學', 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'CNa-Vc-3', '水資源回收與再利用。'),
('高中', 'C', '化學', 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'CNa-Vc-4', '水循環與碳循環。');

-- 資源與永續發展（N）- 能源的開發與利用（Nc）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'C', '化學', 'N', '資源與永續發展', 'Nc', '能源的開發與利用', 'CNc-Vc-1', '新興能源與替代能源在臺灣的發展現況。');

-- ============================================
-- 高中 - 地球科學（E）
-- ============================================

-- 物質系統（E）- 宇宙與天體（Ed）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'E', '物質系統', 'Ed', '宇宙與天體', 'EEd-Vc-1', '我們的宇宙由各種不同尺度的天體所組成，且正在膨脹。'),
('高中', 'E', '地球科學', 'E', '物質系統', 'Ed', '宇宙與天體', 'EEd-Vc-2', '天體的亮度與光度用視星等與絕對星等來表示。'),
('高中', 'E', '地球科學', 'E', '物質系統', 'Ed', '宇宙與天體', 'EEd-Vc-3', '天文觀測可在不同的電磁波段進行。'),
('高中', 'E', '地球科學', 'E', '物質系統', 'Ed', '宇宙與天體', 'EEd-Vc-4', '恆星的顏色可用來了解恆星的表面溫度。');

-- 地球環境（F）- 組成地球的物質（Fa）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'F', '地球環境', 'Fa', '組成地球的物質', 'EFa-Vc-1', '由地震波可以協助了解固體地球具有不同性質的分層。'),
('高中', 'E', '地球科學', 'F', '地球環境', 'Fa', '組成地球的物質', 'EFa-Vc-2', '固體地球各分層之化學組成與物理狀態不同。'),
('高中', 'E', '地球科學', 'F', '地球環境', 'Fa', '組成地球的物質', 'EFa-Vc-3', '大氣溫度與壓力會隨高度而變化。'),
('高中', 'E', '地球科學', 'F', '地球環境', 'Fa', '組成地球的物質', 'EFa-Vc-4', '海洋表水鹽度主要受降水、蒸發及河川注入等因素影響。'),
('高中', 'E', '地球科學', 'F', '地球環境', 'Fa', '組成地球的物質', 'EFa-Vc-5', '海水的溫度隨深度和水平分布而變化。');

-- 地球環境（F）- 地球與太空（Fb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'F', '地球環境', 'Fb', '地球與太空', 'EFb-Vc-1', '由地球觀察恆星的視運動可以分成周日運動與周年運動。');

-- 地球的歷史（H）- 地球的起源與演變（Ha）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'H', '地球的歷史', 'Ha', '地球的起源與演變', 'EHa-Vc-1', '天文學家以太陽星雲學說來解釋太陽系的起源和形成。太陽系是由太陽、行星、衛星、小行星和彗星等天體組成。'),
('高中', 'E', '地球科學', 'H', '地球的歷史', 'Ha', '地球的起源與演變', 'EHa-Vc-2', '與其他類地行星及太陽系小天體相較，地球獨一無二的環境，極為適合生命的發生和繁衍。'),
('高中', 'E', '地球科學', 'H', '地球的歷史', 'Ha', '地球的起源與演變', 'EHa-Vc-3', '在地球大氣演化過程中，海洋與生物扮演著極其重要的角色。');

-- 地球的歷史（H）- 地層與化石（Hb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'H', '地球的歷史', 'Hb', '地層與化石', 'EHb-Vc-1', '化石可以作為地層的相對地質年代對比的輔助工具。'),
('高中', 'E', '地球科學', 'H', '地球的歷史', 'Hb', '地層與化石', 'EHb-Vc-2', '利用岩層中的化石與放射性同位素定年法，可幫助推論地層的絕對地質年代。');

-- 變動的地球（I）- 地表與地殼的變動（Ia）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ia', '地表與地殼的變動', 'EIa-Vc-1', '科學家曾經提出大陸漂移、海底擴張及板塊構造等主要學說，來解釋變動中的固體地球。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ia', '地表與地殼的變動', 'EIa-Vc-2', '板塊邊界可分為聚合、張裂及錯動三大類型。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ia', '地表與地殼的變動', 'EIa-Vc-3', '板塊邊界有各種不同的地質作用與岩漿活動。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ia', '地表與地殼的變動', 'EIa-Vc-4', '由地質構造與震源分布等特徵，可推論臺灣位於聚合型板塊邊界。');

-- 變動的地球（I）- 天氣與氣候變化（Ib）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'EIb-Vc-1', '一定氣壓下，氣溫越高，空氣所能容納的水氣含量越高。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'EIb-Vc-2', '當水氣達到飽和時，多餘的水氣會凝結或凝固。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'EIb-Vc-3', '空氣中的水氣量可以用濕度來表示。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'EIb-Vc-4', '空氣上升時會因為膨脹而降溫。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'EIb-Vc-5', '大氣的水平運動主要受氣壓梯度力、科氏力和摩擦力的影響。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'EIb-Vc-6', '天氣圖是由各地氣象觀測資料繪製而成，用以分析天氣。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ib', '天氣與氣候變化', 'EIb-Vc-7', '大氣與海洋的交互作用會影響天氣，造成氣候變化，例如：聖嬰現象。');

-- 變動的地球（I）- 海水的運動（Ic）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ic', '海水的運動', 'EIc-Vc-1', '表面海流受盛行風的影響。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ic', '海水的運動', 'EIc-Vc-2', '波浪形成的主因為風吹海面，而波浪會影響海岸地形。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ic', '海水的運動', 'EIc-Vc-3', '潮汐的變化受到日地月系統的影響有週期性。'),
('高中', 'E', '地球科學', 'I', '變動的地球', 'Ic', '海水的運動', 'EIc-Vc-4', '臺灣海峽的潮流運動隨地點不同而有所差異。');

-- 變動的地球（I）- 晝夜與季節（Id）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'I', '變動的地球', 'Id', '晝夜與季節', 'EId-Vc-1', '太陽每日於天空中的位置會隨季節而改變。');

-- 科學、科技、社會及人文（M）- 天然災害與防治（Md）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'M', '科學、科技、社會及人文', 'Md', '天然災害與防治', 'EMd-Vc-1', '颱風形成有其必要條件與機制。'),
('高中', 'E', '地球科學', 'M', '科學、科技、社會及人文', 'Md', '天然災害與防治', 'EMd-Vc-2', '颱風是一個螺旋雲帶結構，中心氣壓最低。'),
('高中', 'E', '地球科學', 'M', '科學、科技、社會及人文', 'Md', '天然災害與防治', 'EMd-Vc-3', '侵臺颱風的路徑主要受太平洋高壓所引導，不同路徑對臺灣各地的風雨影響不同。'),
('高中', 'E', '地球科學', 'M', '科學、科技、社會及人文', 'Md', '天然災害與防治', 'EMd-Vc-4', '臺灣位在活躍的板塊交界，斷層活動引發的地震及所導致的災害常造成巨大的損失。');

-- 資源與永續發展（N）- 永續發展與資源的利用（Na）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'ENa-Vc-1', '永續發展對地球與人類的延續有其重要性。'),
('高中', 'E', '地球科學', 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'ENa-Vc-2', '節用資源與合理開發，可以降低人類對地球環境的影響，以利永續發展。'),
('高中', 'E', '地球科學', 'N', '資源與永續發展', 'Na', '永續發展與資源的利用', 'ENa-Vc-3', '認識地球環境有助於經濟、生態、文化及政策四個面向的永續發展。');

-- 資源與永續發展（N）- 氣候變遷之影響與調適（Nb）
INSERT INTO natural_middle_high_contents (school_level, subject_code, subject_name, theme_code, theme_name, sub_theme_code, sub_theme_name, code, description) VALUES
('高中', 'E', '地球科學', 'N', '資源與永續發展', 'Nb', '氣候變遷之影響與調適', 'ENb-Vc-1', '氣候變化有多重時間尺度的特性。'),
('高中', 'E', '地球科學', 'N', '資源與永續發展', 'Nb', '氣候變遷之影響與調適', 'ENb-Vc-2', '冰期與間冰期的氣溫變化及海平面的升降，對全球生物與自然環境會造成影響。'),
('高中', 'E', '地球科學', 'N', '資源與永續發展', 'Nb', '氣候變遷之影響與調適', 'ENb-Vc-3', '過去主導地球長期的自然氣候變化的原理並無法完全用來解釋近幾十年來快速的氣候變遷情形。根據目前科學證據了解人類活動是主要因素。'),
('高中', 'E', '地球科學', 'N', '資源與永續發展', 'Nb', '氣候變遷之影響與調適', 'ENb-Vc-4', '因應氣候變遷的調適有許多面向與方法。');

image.png