'use client'

import { useState, useEffect, useRef } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ShadingType, PageOrientation, VerticalAlign } from 'docx'

interface ConvergenceResult {
  id: string
  stage: string
  title: string
  content: string
  createdDate: string
  createdTime: string
}

interface CourseObjectivesProps {
  activityName: string
  activityId?: string
  onBack: () => void
  onSidebarClick?: (tabId: string) => void
  convergenceResults?: ConvergenceResult[]
  onVersionCreated?: (activityId: string, versionData: {
    versionNumber: string
    lastModifiedDate: string
    lastModifiedTime: string
    lastModifiedUser: string
  }) => void
}

/**
 * 課程目標頁面組件
 * 對應 Figma 設計 (nodeId: 50-26)
 * 用於線上編寫教案
 */
export default function CourseObjectives({
  activityName,
  activityId,
  onBack,
  onSidebarClick,
  convergenceResults = [],
  onVersionCreated,
}: CourseObjectivesProps) {
  const [lessonPlanTitle, setLessonPlanTitle] = useState('')
  const [courseDomain, setCourseDomain] = useState('')
  const [designer, setDesigner] = useState('')
  const [unitName, setUnitName] = useState('')
  const [schoolLevel, setSchoolLevel] = useState('') // 學段：國小、國中、高中
  const [implementationGrade, setImplementationGrade] = useState('')
  const [teachingTimeLessons, setTeachingTimeLessons] = useState('')
  const [teachingTimeMinutes, setTeachingTimeMinutes] = useState('')
  const [materialSource, setMaterialSource] = useState('')
  const [teachingEquipment, setTeachingEquipment] = useState('')
  const [learningObjectives, setLearningObjectives] = useState('')
  // 核心素養相關狀態
  const [coreCompetencyCategory, setCoreCompetencyCategory] = useState('')
  const [coreCompetencyItem, setCoreCompetencyItem] = useState('')
  const [coreCompetencyDescription, setCoreCompetencyDescription] = useState('')
  const [addedCoreCompetencies, setAddedCoreCompetencies] = useState<Array<{
    content: string
  }>>([])
  
  // 英文核心素養相關狀態（從 API 載入）
  const [englishCoreCompetencies, setEnglishCoreCompetencies] = useState<Array<{
    mainCategory: string
    mainCategoryName: string
    subCategories: Array<{
      subCategory: string
      subCategoryName: string
      items: Array<{
        id: number
        code: string
        generalDescription: string
        specificDescription: string
      }>
    }>
  }>>([])
  
  // 國文核心素養相關狀態（從 API 載入）
  const [chineseCoreCompetencies, setChineseCoreCompetencies] = useState<Array<{
    mainCategory: string
    mainCategoryName: string
    subCategories: Array<{
      subCategory: string
      subCategoryName: string
      items: Array<{
        id: number
        code: string
        generalDescription: string
        specificDescription: string
      }>
    }>
  }>>([])
  
  // 數學核心素養相關狀態（從 API 載入）
  const [mathCoreCompetencies, setMathCoreCompetencies] = useState<Array<{
    mainCategory: string
    mainCategoryName: string
    subCategories: Array<{
      subCategory: string
      subCategoryName: string
      items: Array<{
        id: number
        code: string
        generalDescription: string
        specificDescription: string
      }>
    }>
  }>>([])
  
  // 社會科核心素養相關狀態（從 API 載入）
  const [socialCoreCompetencies, setSocialCoreCompetencies] = useState<Array<{
    mainCategory: string
    mainCategoryName: string
    subCategories: Array<{
      subCategory: string
      subCategoryName: string
      items: Array<{
        id: number
        code: string
        generalDescription: string
        specificDescription: string
      }>
    }>
  }>>([])
  
  // 自然科核心素養相關狀態（從 API 載入）
  const [naturalCoreCompetencies, setNaturalCoreCompetencies] = useState<Array<{
    mainCategory: string
    mainCategoryName: string
    subCategories: Array<{
      subCategory: string
      subCategoryName: string
      items: Array<{
        id: number
        code: string
        generalDescription: string
        specificDescription: string
      }>
    }>
  }>>([])
  const [learningPerformanceCategory, setLearningPerformanceCategory] = useState('')
  const [learningPerformanceSubItem, setLearningPerformanceSubItem] = useState('')
  const [selectedCodes, setSelectedCodes] = useState<string[]>([])
  const [addedLearningPerformances, setAddedLearningPerformances] = useState<Array<{
    content: { code: string; description: string }[]
  }>>([])
  
  // 數學學習表現相關狀態
  const [mathPerformances, setMathPerformances] = useState<Array<{
    id: string
    code: string
    category: string
    categoryName: string
    stage: string
    stageName: string
    serial: number
    description: string
  }>>([])
  const [mathPerformanceCategory, setMathPerformanceCategory] = useState('')
  const [mathPerformanceStage, setMathPerformanceStage] = useState('')
  const [selectedMathCodes, setSelectedMathCodes] = useState<string[]>([])
  
  // 國文學習表現相關狀態
  const [chinesePerformances, setChinesePerformances] = useState<Array<{
    id: string
    code: string
    category: number
    categoryName: string
    stage: string
    stageName: string
    serial: number
    description: string
  }>>([])
  const [chinesePerformanceCategory, setChinesePerformanceCategory] = useState('')
  const [chinesePerformanceStage, setChinesePerformanceStage] = useState('')
  const [selectedChineseCodes, setSelectedChineseCodes] = useState<string[]>([])
  
  // 英文學習表現相關狀態
  const [englishPerformances, setEnglishPerformances] = useState<Array<{
    id: string
    code: string
    category: number
    categoryName: string
    stage: string
    stageName: string
    serial: number
    description: string
  }>>([])
  const [englishPerformanceCategory, setEnglishPerformanceCategory] = useState('')
  const [englishPerformanceStage, setEnglishPerformanceStage] = useState('')
  const [selectedEnglishCodes, setSelectedEnglishCodes] = useState<string[]>([])
  
  // 英文學習表現相關狀態（國中/高中）
  const [englishMiddleHighPerformances, setEnglishMiddleHighPerformances] = useState<{
    categories: Array<{
      mainCategory: number
      mainCategoryName: string
      performances: Array<{
        id: number
        code: string
        description: string
      }>
    }>
  }>({ categories: [] })
  const [englishMHMainCategory, setEnglishMHMainCategory] = useState('') // 大分類（1-9）
  const [selectedEnglishMHCodes, setSelectedEnglishMHCodes] = useState<string[]>([])
  
  // 社會學習表現相關狀態（國小）
  const [socialPerformances, setSocialPerformances] = useState<Array<{
    id: string
    code: string
    dimensionItem: string
    dimensionItemName: string
    stage: string
    stageName: string
    serial: number
    description: string
  }>>([])
  const [socialPerformanceDimensionItem, setSocialPerformanceDimensionItem] = useState('')
  const [socialPerformanceStage, setSocialPerformanceStage] = useState('')
  const [selectedSocialCodes, setSelectedSocialCodes] = useState<string[]>([])
  
  // 社會學習表現相關狀態（國中高中）
  const [socialMiddleHighPerformances, setSocialMiddleHighPerformances] = useState<{
    dimensions: Array<{
      dimension: string
      dimensionName: string
      categories: Array<{
        category: string
        categoryName: string
        performances: Array<{
          id: string
          code: string
          subject: string
          description: string
        }>
      }>
    }>
  }>({ dimensions: [] })
  const [socialMHDimension, setSocialMHDimension] = useState('') // 構面（1, 2, 3）
  const [socialMHCategory, setSocialMHCategory] = useState('') // 項目（a, b, c, d）
  const [selectedSocialMHCodes, setSelectedSocialMHCodes] = useState<string[]>([])
  
  // 自然科學習表現相關狀態（國中/高中）
  const [naturalMiddleHighPerformances, setNaturalMiddleHighPerformances] = useState<Array<{
    subCategoryCode: string
    subCategoryName: string
    items: Array<{
      itemCode: string
      itemName: string
      performances: Array<{
        id: number
        code: string
        description: string
      }>
    }>
  }>>([])
  const [naturalMHSubCategory, setNaturalMHSubCategory] = useState('') // 第一層：子項（t, p, a）- 探究能力-思考智能（t）、探究能力-問題解決（p）、科學的態度與本質（a）
  const [naturalMHItem, setNaturalMHItem] = useState('') // 第二層：子項項目（i, r, c, m, o, e, a, c, h, n）- 想像創造（i）、推理論證（r）等
  const [selectedNaturalMHCodes, setSelectedNaturalMHCodes] = useState<string[]>([])
  
  // 自然科學習內容（國中/高中）
  const [naturalMiddleHighContents, setNaturalMiddleHighContents] = useState<Array<{
    subjectCode?: string
    subjectName?: string
    themeCode: string
    themeName: string
    subThemes: Array<{
      subThemeCode: string
      subThemeName: string
      contents: Array<{
        id: number
        code: string
        description: string
      }>
    }>
  }>>([])
  const [naturalMHContentSubject, setNaturalMHContentSubject] = useState('') // 第一層（僅高中）：科目（B, P, C, E）
  const [naturalMHContentTheme, setNaturalMHContentTheme] = useState('') // 第一層（國中）或第二層（高中）：主題（A-N）
  const [naturalMHContentSubTheme, setNaturalMHContentSubTheme] = useState('') // 第二層（國中）或第三層（高中）：次主題（Aa, Ab等）
  const [selectedNaturalMHContentCodes, setSelectedNaturalMHContentCodes] = useState<string[]>([])
  
  // 數學學習表現相關狀態（國中高中）
  const [mathMiddleHighPerformances, setMathMiddleHighPerformances] = useState<{
    categories: Array<{
      category: string
      categoryName: string
      performances: Array<{
        id: string
        code: string
        description: string
      }>
    }>
  }>({ categories: [] })
  const [mathMHCategory, setMathMHCategory] = useState('') // 項目（n, s, g, a, f, d）
  const [selectedMathMHCodes, setSelectedMathMHCodes] = useState<string[]>([])
  
  // 國文學習表現相關狀態（國中高中）
  const [chineseMiddleHighPerformances, setChineseMiddleHighPerformances] = useState<{
    categories: Array<{
      mainCategory: number
      mainCategoryName: string
      performances: Array<{
        id: string
        code: string
        description: string
      }>
    }>
  }>({ categories: [] })
  const [chineseMHMainCategory, setChineseMHMainCategory] = useState('') // 大分類（1, 2, 4, 5, 6）
  const [selectedChineseMHCodes, setSelectedChineseMHCodes] = useState<string[]>([])
  
  // 「其他」選項的狀態變數 - 學習表現
  const [mathPerformanceOther, setMathPerformanceOther] = useState('')
  const [chinesePerformanceOther, setChinesePerformanceOther] = useState('')
  const [englishPerformanceOther, setEnglishPerformanceOther] = useState('')
  const [socialPerformanceOther, setSocialPerformanceOther] = useState('')
  const [naturalPerformanceOther, setNaturalPerformanceOther] = useState('')
  
  // 數學學習內容相關狀態
  const [mathContents, setMathContents] = useState<Array<{
    grade: number
    contents: Array<{
      id: string
      code: string
      category: string
      categoryName: string
      description: string
    }>
  }>>([])
  const [mathContentGrade, setMathContentGrade] = useState('')
  const [selectedMathContentCodes, setSelectedMathContentCodes] = useState<string[]>([])
  
  // 數學學習內容相關狀態（國中高中）
  const [mathMiddleHighContents, setMathMiddleHighContents] = useState<{
    grades: Array<{
      grade: string
      contents: Array<{
        id: string
        code: string
        description: string
      }>
    }>
  }>({ grades: [] })
  const [mathMHContentGrade, setMathMHContentGrade] = useState('') // 年級
  const [selectedMathMHContentCodes, setSelectedMathMHContentCodes] = useState<string[]>([])
  
  // 國文學習內容相關狀態
  const [chineseContents, setChineseContents] = useState<Array<{
    id: string
    code: string
    topic: string
    topicName: string
    stage: string
    stageName: string
    serial: number
    description: string
  }>>([])
  const [chineseContentTopic, setChineseContentTopic] = useState('')
  const [chineseContentStage, setChineseContentStage] = useState('')
  const [selectedChineseContentCodes, setSelectedChineseContentCodes] = useState<string[]>([])
  
  // 國文學習內容相關狀態（國中/高中）
  const [chineseMiddleHighContents, setChineseMiddleHighContents] = useState<{
    categories: Array<{
      mainCategoryCode: string
      mainCategoryName: string
      contents: Array<{
        id: number
        code: string
        description: string
      }>
    }>
  }>({ categories: [] })
  const [chineseMHMainCategoryCode, setChineseMHMainCategoryCode] = useState('') // 主分類代碼（Ab, Ac...）
  const [selectedChineseMHContentCodes, setSelectedChineseMHContentCodes] = useState<string[]>([])
  
  // 英文學習內容相關狀態（國小）
  const [englishContents, setEnglishContents] = useState<Array<{
    mainCategoryCode: string
    mainCategoryName: string
    subCategories?: Array<{
      subCategoryCode: string
      subCategoryName: string
      contents: Array<{
        id: string
        code: string
        stage: string
        stageName: string
        description: string
      }>
    }>
    contents?: Array<{
      id: string
      code: string
      stage: string
      stageName: string
      description: string
    }>
  }>>([])
  const [englishContentMainCategory, setEnglishContentMainCategory] = useState('') // 主分類（A, B, C, D）
  const [englishContentSubCategory, setEnglishContentSubCategory] = useState('') // 子分類（Aa, Ab, Ac, Ad, Ae，僅 A 主題用）
  const [selectedEnglishContentCodes, setSelectedEnglishContentCodes] = useState<string[]>([])
  
  // 英文學習內容相關狀態（國中/高中）
  const [englishMiddleHighContents, setEnglishMiddleHighContents] = useState<Array<{
    mainCategoryCode: string
    mainCategoryName: string
    subCategories?: Array<{
      subCategoryCode: string
      subCategoryName: string
      contents: Array<{
        id: number
        code: string
        description: string
      }>
    }>
    contents?: Array<{
      id: number
      code: string
      description: string
    }>
  }>>([])
  const [englishMHContentMainCategory, setEnglishMHContentMainCategory] = useState('') // 主分類（A, B, C, D）
  const [englishMHContentSubCategory, setEnglishMHContentSubCategory] = useState('') // 子分類（a, b, c, d, e，僅 A 主題用）
  const [selectedEnglishMHContentCodes, setSelectedEnglishMHContentCodes] = useState<string[]>([])
  
  // 社會學習內容相關狀態（國小 - 舊版）
  const [socialContents, setSocialContents] = useState<Array<{
    id: string
    code: string
    topicItem: string
    topicItemName: string
    stage: string
    stageName: string
    serial: number
    description: string
  }>>([])
  const [socialContentTopicItem, setSocialContentTopicItem] = useState('')
  const [socialContentStage, setSocialContentStage] = useState('')
  const [selectedSocialContentCodes, setSelectedSocialContentCodes] = useState<string[]>([])

  // 社會學習內容相關狀態（國中/高中 - 新版三層結構）
  const [socialContentMHThemes, setSocialContentMHThemes] = useState<Array<{
    theme: string
    theme_name: string
  }>>([]) // 主題列表
  const [socialContentMHCategories, setSocialContentMHCategories] = useState<Array<{
    category: string
    category_name: string
  }>>([]) // 項目列表（可能為空）
  const [socialContentMHContents, setSocialContentMHContents] = useState<Array<{
    id: string
    code: string
    description: string
  }>>([]) // 條目列表
  const [socialContentMHTheme, setSocialContentMHTheme] = useState('') // 選擇的主題
  const [socialContentMHCategory, setSocialContentMHCategory] = useState('') // 選擇的項目
  const [selectedSocialContentMHCodes, setSelectedSocialContentMHCodes] = useState<string[]>([])
  
  // 「其他」選項的狀態變數 - 學習內容
  const [chineseContentOther, setChineseContentOther] = useState('')
  const [englishContentOther, setEnglishContentOther] = useState('')
  const [socialContentOther, setSocialContentOther] = useState('')
  const [naturalContentOther, setNaturalContentOther] = useState('')
  
  const [learningContentCategory, setLearningContentCategory] = useState('')
  const [learningContentStage, setLearningContentStage] = useState<'stage2' | 'stage3' | ''>('')
  const [selectedLearningContentCodes, setSelectedLearningContentCodes] = useState<string[]>([])
  const [addedLearningContents, setAddedLearningContents] = useState<Array<{
    content: { code: string; description: string }[]
  }>>([])
  
  // 雙向細目表勾選狀態
  const [checkedPerformances, setCheckedPerformances] = useState<Set<string>>(new Set())
  const [checkedContents, setCheckedContents] = useState<Set<string>>(new Set())
  
  // 標籤頁狀態
  const [activeTab, setActiveTab] = useState('objectives')
  
  // 根據學段生成年級選項
  const getGradeOptions = () => {
    if (schoolLevel === '國小') {
      return [
        { value: '1', label: '一年級' },
        { value: '2', label: '二年級' },
        { value: '3', label: '三年級' },
        { value: '4', label: '四年級' },
        { value: '5', label: '五年級' },
        { value: '6', label: '六年級' },
      ]
    } else if (schoolLevel === '國中' || schoolLevel === '高中（高職）') {
      return [
        { value: '1', label: '一年級' },
        { value: '2', label: '二年級' },
        { value: '3', label: '三年級' },
      ]
    }
    return []
  }
  
  // 下載功能（僅支援 Word）
  
  // 活動與評量設計的狀態
  const [teachingContent, setTeachingContent] = useState('')
  const [teachingTime, setTeachingTime] = useState('')
  const [teachingResources, setTeachingResources] = useState('')
  const [assessmentMethods, setAssessmentMethods] = useState('')
  const [assessmentTools, setAssessmentTools] = useState('')
  const [references, setReferences] = useState('')
  
  // 活動與評量設計的多列資料
  const [activityRows, setActivityRows] = useState<Array<{
    id: string
    teachingContent: string
    teachingTime: string
    teachingResources: string
    assessmentMethods: string
  }>>([])

  // 當前版本號
  const [currentVersion, setCurrentVersion] = useState<string>('')

  // 學習內容數據
  const learningContentData = {
    INa: {
      name: '物質與能量（INa）',
      stage2: [
        { code: 'INa-II-1', description: '自然界（包含生物與非生物）是由不同物質所組成。' },
        { code: 'INa-II-2', description: '在地球上，物質具有重量，佔有體積。' },
        { code: 'INa-II-3', description: '物質各有其特性，並可以依其特性與用途進行分類。' },
        { code: 'INa-II-4', description: '物質的形態會因溫度的不同而改變。' },
        { code: 'INa-II-5', description: '太陽照射、物質燃燒和摩擦等可以使溫度升高，運用測量的方法可知溫度高低。' },
        { code: 'INa-II-6', description: '太陽是地球能量的主要來源，提供生物的生長需要，能量可以各種形式呈現。' },
        { code: 'INa-II-7', description: '生物需要能量（養分）、陽光、空氣、水和土壤，維持生命、生長與活動。' },
        { code: 'INa-II-8', description: '日常生活中常用的能源。' }
      ],
      stage3: [
        { code: 'INa-III-1', description: '物質是由微小的粒子所組成，而且粒子不斷的運動。' },
        { code: 'INa-III-2', description: '物質各有不同性質，有些性質會隨溫度而改變。' },
        { code: 'INa-III-3', description: '混合物是由不同的物質所混合，物質混合前後重量不會改變，性質可能會改變。' },
        { code: 'INa-III-4', description: '空氣由各種不同氣體所組成，空氣具有熱脹冷縮的性質。氣體無一定的形狀與體積。' },
        { code: 'INa-III-5', description: '不同形式的能量可以相互轉換，但總量不變。' },
        { code: 'INa-III-6', description: '能量可藉由電流傳遞、轉換而後為人類所應用。利用電池等設備可以儲存電能再轉換成其他能量。' },
        { code: 'INa-III-7', description: '運動的物體具有動能，對同一物體而言，速度越快動能越大。' },
        { code: 'INa-III-8', description: '熱由高溫處往低溫處傳播，傳播的方式有傳導、對流和輻射，生活中可運用不同的方法保溫與散熱。' },
        { code: 'INa-III-9', description: '植物生長所需的養分是經由光合作用從太陽光獲得的。' },
        { code: 'INa-III-10', description: '在生態系中，能量經由食物鏈在不同物種間流動與循環。' }
      ]
    },
    INb: {
      name: '構造與功能（INb）',
      stage2: [
        { code: 'INb-II-1', description: '物質或物體各有不同的功能或用途。' },
        { code: 'INb-II-2', description: '物質性質上的差異性可用來區分或分離物質。' },
        { code: 'INb-II-3', description: '虹吸現象可用來將容器中的水吸出；連通管可測水平。' },
        { code: 'INb-II-4', description: '生物體的構造與功能是互相配合的。' },
        { code: 'INb-II-5', description: '常見動物的外部形態主要分為頭、軀幹和肢，但不同類別動物之各部位特徵和名稱有差異。' },
        { code: 'INb-II-6', description: '常見植物的外部形態主要由根、莖、葉、花、果實及種子所組成。' },
        { code: 'INb-II-7', description: '動植物體的外部形態和內部構造，與其生長、行為、繁衍後代和適應環境有關。' }
      ],
      stage3: [
        { code: 'INb-III-1', description: '物質有不同的結構與功能。' },
        { code: 'INb-III-2', description: '應用性質的不同可分離物質或鑑別物質。' },
        { code: 'INb-III-3', description: '物質表面的結構與性質不同，其可產生的摩擦力不同；摩擦力會影響物體運動的情形。' },
        { code: 'INb-III-4', description: '力可藉由簡單機械傳遞。' },
        { code: 'INb-III-5', description: '生物體是由細胞所組成，具有由細胞、器官到個體等不同層次的構造。' },
        { code: 'INb-III-6', description: '動物的形態特徵與行為相關，動物身體的構造不同，有不同的運動方式。' },
        { code: 'INb-III-7', description: '植物各部位的構造和所具有的功能有關，有些植物產生特化的構造以適應環境。' },
        { code: 'INb-III-8', description: '生物可依其形態特徵進行分類。' }
      ]
    },
    INc: {
      name: '系統與尺度（INc）',
      stage2: [
        { code: 'INc-II-1', description: '使用工具或自訂參考標準可量度與比較。' },
        { code: 'INc-II-2', description: '生活中常見的測量單位與度量。' },
        { code: 'INc-II-3', description: '力的表示法，包括大小、方向與作用點等。' },
        { code: 'INc-II-4', description: '方向、距離可用以表示物體位置。' },
        { code: 'INc-II-5', description: '水和空氣可以傳送動力讓物體移動。' },
        { code: 'INc-II-6', description: '水有三態變化及毛細現象。' },
        { code: 'INc-II-7', description: '利用適當的工具觀察不同大小、距離位置的物體。' },
        { code: 'INc-II-8', description: '不同的環境有不同的生物生存。' },
        { code: 'INc-II-9', description: '地表具有岩石、砂、土壤等不同環境，各有特徵，可以分辨。' },
        { code: 'INc-II-10', description: '天空中天體有東升西落的現象，月亮有盈虧的變化，星星則是有些亮有些暗。' }
      ],
      stage3: [
        { code: 'INc-III-1', description: '生活及探究中常用的測量工具和方法。' },
        { code: 'INc-III-2', description: '自然界或生活中有趣的最大或最小的事物（量），事物大小宜用適當的單位來表示。' },
        { code: 'INc-III-3', description: '本量與改變量不同，由兩者的比例可評估變化的程度。' },
        { code: 'INc-III-4', description: '對相同事物做多次測量，其結果間可能有差異，差異越大表示測量越不精確。' },
        { code: 'INc-III-5', description: '力的大小可由物體的形變或運動狀態的改變程度得知。' },
        { code: 'INc-III-6', description: '運用時間與距離可描述物體的速度與速度的變化。' },
        { code: 'INc-III-7', description: '動物體內的器官系統是由數個器官共同組合，以執行某種特定的生理作用。' },
        { code: 'INc-III-8', description: '在同一時期，特定區域上，相同物種所組成的群體稱為「族群」，而在特定區域由多個族群結合而組成「群集」。' },
        { code: 'INc-III-9', description: '不同的環境條件影響生物的種類和分布，以及生物間的食物關係，因而形成不同的生態系。' },
        { code: 'INc-III-10', description: '地球是由空氣、陸地、海洋及生存於其中的生物所組成的。' },
        { code: 'INc-III-11', description: '岩石由礦物組成，岩石和礦物有不同特徵，各有不同用途。' },
        { code: 'INc-III-12', description: '地球上的水存在於大氣、海洋、湖泊與地下中。' },
        { code: 'INc-III-13', description: '日出日落時間與位置，在不同季節會不同。' },
        { code: 'INc-III-14', description: '四季星空會有所不同。' },
        { code: 'INc-III-15', description: '除了地球外，還有其他行星環繞著太陽運行。' }
      ]
    },
    INd: {
      name: '改變與穩定（INd）',
      stage2: [
        { code: 'INd-II-1', description: '當受外在因素作用時，物質或自然現象可能會改變。改變有些較快、有些較慢；有些可以回復，有些則不能。' },
        { code: 'INd-II-2', description: '物質或自然現象的改變情形，可以運用測量的工具和方法得知。' },
        { code: 'INd-II-3', description: '生物從出生、成長到死亡有一定的壽命，透過生殖繁衍下一代。' },
        { code: 'INd-II-4', description: '空氣流動產生風。' },
        { code: 'INd-II-5', description: '自然環境中有砂石及土壤，會因水流、風而發生改變。' },
        { code: 'INd-II-6', description: '一年四季氣溫會有所變化，天氣也會有所不同。氣象報告可以讓我們知道天氣的可能變化。' },
        { code: 'INd-II-7', description: '天氣預報常用雨量、溫度、風向、風速等資料來表達天氣狀態，這些資料可以使用適當儀器測得。' },
        { code: 'INd-II-8', description: '力有各種不同的形式。' },
        { code: 'INd-II-9', description: '施力可能會使物體改變運動情形或形狀；當物體受力變形時，有的可恢復原狀，有的不能恢復原狀。' }
      ],
      stage3: [
        { code: 'INd-III-1', description: '自然界中存在著各種的穩定狀態；當有新的外加因素時，可能造成改變，再達到新的穩定狀態。' },
        { code: 'INd-III-2', description: '人類可以控制各種因素來影響物質或自然現象的改變，改變前後的差異可以被觀察，改變的快慢可以被測量與了解。' },
        { code: 'INd-III-3', description: '地球上的物體（含生物和非生物）均會受地球引力的作用，地球對物體的引力就是物體的重量。' },
        { code: 'INd-III-4', description: '生物個體間的性狀具有差異性；子代與親代的性狀具有相似性和相異性。' },
        { code: 'INd-III-5', description: '生物體接受環境刺激會產生適當的反應，並自動調節生理作用以維持恆定。' },
        { code: 'INd-III-6', description: '生物種類具有多樣性；生物生存的環境亦具有多樣性。' },
        { code: 'INd-III-7', description: '天氣圖上用高、低氣壓、鋒面、颱風等符號來表示天氣現象，並認識其天氣變化。' },
        { code: 'INd-III-8', description: '土壤是由岩石風化成的碎屑及生物遺骸所組成。化石是地層中古代生物的遺骸。' },
        { code: 'INd-III-9', description: '流水、風和波浪對砂石和土壤產生侵蝕、風化、搬運及堆積等作用，河流是改變地表最重要的力量。' },
        { code: 'INd-III-10', description: '流水及生物活動，對地表的改變會產生不同的影響。' },
        { code: 'INd-III-11', description: '海水的流動會影響天氣與氣候的變化。氣溫下降時水氣凝結為雲和霧或昇華為霜、雪。' },
        { code: 'INd-III-12', description: '自然界的水循環主要由海洋或湖泊表面水的蒸發，經凝結降水，再透過地表水與地下水等傳送回海洋或湖泊。' },
        { code: 'INd-III-13', description: '施力可使物體的運動速度改變，物體受多個力的作用，仍可能保持平衡靜止不動，物體不接觸也可以有力的作用。' }
      ]
    },
    INe: {
      name: '交互作用（INe）',
      stage2: [
        { code: 'INe-II-1', description: '自然界的物體、生物、環境間常會相互影響。' },
        { code: 'INe-II-2', description: '溫度會影響物質在水中溶解的程度（定性）及物質燃燒、生鏽、發酵等現象。' },
        { code: 'INe-II-3', description: '有些物質溶於水中，有些物質不容易溶於水中。' },
        { code: 'INe-II-4', description: '常見食物的酸鹼性有時可利用氣味、觸覺、味覺簡單區分，花卉、菜葉會因接觸到酸鹼而改變顏色。' },
        { code: 'INe-II-5', description: '生活周遭有各種的聲音；物體振動會產生聲音，聲音可以透過固體、液體、氣體傳播。不同的動物會發出不同的聲音，並且作為溝通的方式。' },
        { code: 'INe-II-6', description: '光線以直線前進，反射時有一定的方向。' },
        { code: 'INe-II-7', description: '磁鐵具有兩極，同極相斥，異極相吸；磁鐵會吸引含鐵的物體。磁力強弱可由吸起含鐵物質數量多寡得知。' },
        { code: 'INe-II-8', description: '物質可分為電的良導體和不良導體，將電池用電線或良導體接成通路，可使燈泡發光、馬達轉動。' },
        { code: 'INe-II-9', description: '電池或燈泡可以有串聯和並聯的接法，不同的接法會產生不同的效果。' },
        { code: 'INe-II-10', description: '動物的感覺器官接受外界刺激會引起生理和行為反應。' },
        { code: 'INe-II-11', description: '環境的變化會影響植物生長。' }
      ],
      stage3: [
        { code: 'INe-III-1', description: '自然界的物體、生物與環境間的交互作用，常具有規則性。' },
        { code: 'INe-III-2', description: '物質的形態與性質可因燃燒、生鏽、發酵、酸鹼作用等而改變或形成新物質，這些改變有些會和溫度、水、空氣、光等有關。改變要能發生，常需要具備一些條件。' },
        { code: 'INe-III-3', description: '燃燒是物質與氧劇烈作用的現象，燃燒必須同時具備可燃物、助燃物，並達到燃點等三個要素。' },
        { code: 'INe-III-4', description: '物質溶解、反應前後總重量不變。' },
        { code: 'INe-III-5', description: '常用酸鹼物質的特性，水溶液的酸鹼性質及其生活上的運用。' },
        { code: 'INe-III-6', description: '聲音有大小、高低與音色等不同性質，生活中聲音有樂音與噪音之分，噪音可以防治。' },
        { code: 'INe-III-7', description: '陽光是由不同色光組成。' },
        { code: 'INe-III-8', description: '光會有折射現象，放大鏡可聚光和成像。' },
        { code: 'INe-III-9', description: '地球有磁場，會使指北針指向固定方向。' },
        { code: 'INe-III-10', description: '磁鐵與通電的導線皆可產生磁力，使附近指北針偏轉。改變電流方向或大小，可以調控電磁鐵的磁極方向或磁力大小。' },
        { code: 'INe-III-11', description: '動物有覓食、生殖、保護、訊息傳遞以及社會性的行為。' },
        { code: 'INe-III-12', description: '生物的分布和習性，會受環境因素的影響；環境改變也會影響生存於其中的生物種類。' },
        { code: 'INe-III-13', description: '生態系中生物與生物彼此間的交互作用，有寄生、共生和競爭的關係。' }
      ]
    },
    INf: {
      name: '科學與生活（INf）',
      stage2: [
        { code: 'INf-II-1', description: '日常生活中常見的科技產品。' },
        { code: 'INf-II-2', description: '不同的環境影響人類食物的種類、來源與飲食習慣。' },
        { code: 'INf-II-3', description: '自然的規律與變化對人類生活應用與美感的啟發。' },
        { code: 'INf-II-4', description: '季節的變化與人類生活的關係。' },
        { code: 'INf-II-5', description: '人類活動對環境造成影響。' },
        { code: 'INf-II-6', description: '地震會造成嚴重的災害，平時的準備與防震能降低損害。' },
        { code: 'INf-II-7', description: '水與空氣汙染會對生物產生影響。' }
      ],
      stage3: [
        { code: 'INf-III-1', description: '世界與本地不同性別科學家的事蹟與貢獻。' },
        { code: 'INf-III-2', description: '科技在生活中的應用與對環境與人體的影響。' },
        { code: 'INf-III-3', description: '自然界生物的特徵與原理在人類生活上的應用。' },
        { code: 'INf-III-4', description: '人類日常生活中所依賴的經濟動植物及栽培養殖的方法。' },
        { code: 'INf-III-5', description: '臺灣的主要天然災害之認識及防災避難。' },
        { code: 'INf-III-6', description: '生活中的電器可以產生電磁波，具有功能但也可能造成傷害。' }
      ]
    },
    INg: {
      name: '資源與永續性（INg）',
      stage2: [
        { code: 'INg-II-1', description: '自然環境中有許多資源。人類生存與生活需依賴自然環境中的各種資源，但自然資源都是有限的，需要珍惜使用。' },
        { code: 'INg-II-2', description: '地球資源永續可結合日常生活中低碳與節水方法做起。' },
        { code: 'INg-II-3', description: '可利用垃圾減量、資源回收、節約能源等方法來保護環境。' }
      ],
      stage3: [
        { code: 'INg-III-1', description: '自然景觀和環境一旦被改變或破壞，極難恢復。' },
        { code: 'INg-III-2', description: '人類活動與其他生物的活動會相互影響，不當引進外來物種可能造成經濟損失和生態破壞。' },
        { code: 'INg-III-3', description: '生物多樣性對人類的重要性，而氣候變遷將對生物生存造成影響。' },
        { code: 'INg-III-4', description: '人類的活動會造成氣候變遷，加劇對生態與環境的影響。' },
        { code: 'INg-III-5', description: '能源的使用與地球永續發展息息相關。' },
        { code: 'INg-III-6', description: '碳足跡與水足跡所代表環境的意涵。' },
        { code: 'INg-III-7', description: '人類行為的改變可以減緩氣候變遷所造成的衝擊與影響。' }
      ]
    }
  }

  // 學習表現數據
  const learningPerformanceData = {
    t: {
      name: '思考智能（t）',
      subItems: {
        i: {
          name: '想像創造（i）',
          stage2: [
            { code: 'ti-II-1', description: '能在指導下觀察日常生活現象的規律性，並運用想像力與好奇心，了解及描述自然環境的現象。' }
          ],
          stage3: [
            { code: 'ti-III-1', description: '能運用好奇心察覺日常生活現象的規律性會因為某些改變而產生差異，並能依據已知的科學知識科學方法想像可能發生的事情，以察覺不同的方法，也常能做出不同的成品。' }
          ]
        },
        r: {
          name: '推理論證（r）',
          stage2: [
            { code: 'tr-II-1', description: '能知道觀察、記錄所得自然現象的結果是有其原因的，並依據習得的知識，說明自己的想法。' }
          ],
          stage3: [
            { code: 'tr-III-1', description: '能將自己及他人所觀察、記錄的自然現象與習得的知識互相連結，察覺彼此間的關係，並提出自己的想法及知道與他人的差異。' }
          ]
        },
        c: {
          name: '批判思辨（c）',
          stage2: [
            { code: 'tc-II-1', description: '能簡單分辨或分類所觀察到的自然科學現象。' }
          ],
          stage3: [
            { code: 'tc-III-1', description: '能就所蒐集的數據或資料，進行簡單的記錄與分類，並依據習得的知識，思考資料的正確性及辨別他人資訊與事實的差異。' }
          ]
        },
        m: {
          name: '建立模型（m）',
          stage2: [
            { code: 'tm-II-1', description: '能經由觀察自然界現象之間的關係，理解簡單的概念模型，進而與其生活經驗連結。' }
          ],
          stage3: [
            { code: 'tm-III-1', description: '能經由提問、觀察及實驗等歷程，探索自然界現象之間的關係，建立簡單的概念模型，並理解到有不同模型的存在。' }
          ]
        }
      }
    },
    p: {
      name: '問題解決（p）',
      subItems: {
        o: {
          name: '觀察與定題（o）',
          stage2: [
            { code: 'po-II-1', description: '能從日常經驗、學習活動、自然環境，進行觀察，進而能察覺問題。' },
            { code: 'po-II-2', description: '能依據觀察、蒐集資料、閱讀、思考、討論等，提出問題。' }
          ],
          stage3: [
            { code: 'po-III-1', description: '能從學習活動、日常經驗及科技運用、自然環境、書刊及網路媒體等察覺問題。' },
            { code: 'po-III-2', description: '能初步辨別適合科學探究的問題，並能依據觀察、蒐集資料、閱讀、思考、討論等，提出適宜探究之問題。' }
          ]
        },
        e: {
          name: '計劃與執行（e）',
          stage2: [
            { code: 'pe-II-1', description: '能了解一個因素改變可能造成的影響，進而預測活動的大致結果。在教師或教科書的指導或說明下，能了解探究的計畫。' },
            { code: 'pe-II-2', description: '能正確安全操作適合學習階段的物品、器材儀器、科技設備及資源，並能觀察和記錄。' }
          ],
          stage3: [
            { code: 'pe-III-1', description: '能了解自變項、應變項並預測改變時可能的影響和進行適當次數測試的意義。在教師或教科書的指導或說明下，能了解探究的計畫，並進而能根據問題的特性、資源（設備等）的有無等因素，規劃簡單的探究活動。' },
            { code: 'pe-III-2', description: '能正確安全操作適合學習階段的物品、器材儀器、科技設備及資源。能進行客觀的質性觀察或數值量測並詳實記錄。' }
          ]
        },
        a: {
          name: '分析與發現（a）',
          stage2: [
            { code: 'pa-II-1', description: '能運用簡單分類、製作圖表等方法，整理已有的資訊或數據。' },
            { code: 'pa-II-2', description: '能從得到的資訊或數據，形成解釋、得到解答、解決問題。並能將自己的探究結果和他人的結果（例如：來自老師）相比較，檢查是否相近。' }
          ],
          stage3: [
            { code: 'pa-III-1', description: '能分析比較、製作圖表、運用簡單數學等方法，整理已有的資訊或數據。' },
            { code: 'pa-III-2', description: '能從（所得的）資訊或數據，形成解釋、發現新知、獲知因果關係、解決問題或是發現新的問題。並能將自己的探究結果和他人的結果（例如：來自同學）比較對照，檢查相近探究是否有相近的結果。' }
          ]
        },
        c: {
          name: '討論與傳達（c）',
          stage2: [
            { code: 'pc-II-1', description: '能專注聆聽同學報告，提出疑問或意見。並能對探究方法、過程或結果，進行檢討。' },
            { code: 'pc-II-2', description: '能利用簡單形式的口語、文字或圖畫等，表達探究之過程、發現。' }
          ],
          stage3: [
            { code: 'pc-III-1', description: '能理解同學報告，提出合理的疑問或意見。並能對「所訂定的問題」、「探究方法」、「獲得之證據」及「探究之發現」等之間的符應情形，進行檢核並提出優點和弱點。' },
            { code: 'pc-III-2', description: '能利用簡單形式的口語、文字、影像（例如：攝影、錄影）、繪圖或實物、科學名詞、數學公式、模型等，表達探究之過程、發現或成果。' }
          ]
        }
      }
    },
    a: {
      name: '科學的態度與本質（a）',
      subItems: {
        i: {
          name: '培養科學探究的興趣（i）',
          stage2: [
            { code: 'ai-II-1', description: '保持對自然現象的好奇心，透過不斷的探尋和提問，常會有新發現。' },
            { code: 'ai-II-2', description: '透過探討自然與物質世界的規律性，感受發現的樂趣。' },
            { code: 'ai-II-3', description: '透過動手實作，享受以成品來表現自己構想的樂趣。' }
          ],
          stage3: [
            { code: 'ai-III-1', description: '透過科學探索了解現象發生的原因或機制，滿足好奇心。' },
            { code: 'ai-III-2', description: '透過成功的科學探索經驗，感受自然科學學習的樂趣。' },
            { code: 'ai-III-3', description: '參與合作學習並與同儕有良好的互動經驗，享受學習科學的樂趣。' }
          ]
        },
        h: {
          name: '養成應用科學思考與探究的習慣（h）',
          stage2: [
            { code: 'ah-II-1', description: '透過各種感官了解生活週遭事物的屬性。' },
            { code: 'ah-II-2', description: '透過有系統的分類與表達方式，與他人溝通自己的想法與發現。' }
          ],
          stage3: [
            { code: 'ah-III-1', description: '利用科學知識理解日常生活觀察到的現象。' },
            { code: 'ah-III-2', description: '透過科學探究活動解決一部分生活週遭的問題。' }
          ]
        },
        n: {
          name: '認識科學本質（n）',
          stage2: [
            { code: 'an-II-1', description: '體會科學的探索都是由問題開始。' },
            { code: 'an-II-2', description: '察覺科學家們是利用不同的方式探索自然與物質世界的形式與規律。' },
            { code: 'an-II-3', description: '發覺創造和想像是科學的重要元素。' }
          ],
          stage3: [
            { code: 'an-III-1', description: '透過科學探究活動，了解科學知識的基礎是來自於真實的經驗和證據。' },
            { code: 'an-III-2', description: '發覺許多科學的主張與結論，會隨著新證據的出現而改變。' },
            { code: 'an-III-3', description: '體認不同性別、族群等文化背景的人，都可成為科學家。' }
          ]
        }
      }
    }
  }

  // 核心素養數據（預設值，用於非英文科目或向後兼容）
  const defaultCoreCompetencyData = {
    A: {
      name: '自主行動',
      items: {
        A1: {
          name: '身心素質與自我精進',
          description: '具備身心健全發展的素質，擁有合宜的人性觀與自我觀，同時透過選擇、分析與運用新知，有效規劃生涯發展，探尋生命意義，並不斷自我精進，追求至善。',
          elementary: '能運用五官，敏銳的觀察周遭環境，保持好奇心、想像力持續探索自然。'
        },
        A2: {
          name: '系統思考與解決問題',
          description: '具備問題理解、思辨分析、推理批判的系統思考與後設思考素養，並能行動與反思，以有效處理及解決生活、生命問題。',
          elementary: '能運用好奇心及想像能力，從觀察、閱讀、思考所得的資訊或數據中，提出適合科學探究的問題或解釋資料，並能依據已知的科學知識、科學概念及探索科學的方法去想像可能發生的事情，以及理解科學事實會有不同的論點、證據或解釋方式。'
        },
        A3: {
          name: '規劃執行與創新應變',
          description: '具備規劃及執行計畫的能力，並試探與發展多元專業知能、充實生活經驗，發揮創新精神，以因應社會變遷、增進個人的彈性適應力。',
          elementary: '具備透過實地操作探究活動探索科學問題的能力，並能初步根據問題特性、資源的有無等因素，規劃簡單步驟，操作適合學習階段的器材儀器、科技設備及資源，進行自然科學實驗。'
        }
      }
    },
    B: {
      name: '溝通互動',
      items: {
        B1: {
          name: '符號運用與溝通表達',
          description: '具備理解及使用語言、文字、數理、肢體及藝術等各種符號進行表達、溝通及互動，並能了解與同理他人，應用在日常生活及工作上。',
          elementary: '能分析比較、製作圖表、運用簡單數學等方法，整理已有的自然科學資訊或數據，並利用較簡單形式的口語、文字、影像、繪圖或實物、科學名詞、數學公式、模型等，表達探究之過程、發現或成果。'
        },
        B2: {
          name: '科技資訊與媒體素養',
          description: '具備善用科技、資訊與各類媒體之能力，培養相關倫理及媒體識讀的素養，俾能分析、思辨、批判人與科技、資訊及媒體之關係。',
          elementary: '能了解科技及媒體的運用方式，並從學習活動、日常經驗及科技運用、自然環境、書刊及網路媒體等，察覺問題或獲得有助於探究的資訊。'
        },
        B3: {
          name: '藝術涵養與美感素養',
          description: '具備藝術感知、創作與鑑賞能力，體會藝術文化之美，透過生活美學的省思，豐富美感體驗，培養對美善的人事物，進行賞析、建構與分享的態度與能力。',
          elementary: '透過五官知覺觀察周遭環境的動植物與自然現象，知道如何欣賞美的事物。'
        }
      }
    },
    C: {
      name: '社會參與',
      items: {
        C1: {
          name: '道德實踐與公民意識',
          description: '具備道德實踐的素養，從個人小我到社會公民，循序漸進，養成社會責任感及公民意識，主動關注公共議題並積極參與社會活動，關懷自然生態與人類永續發展，而展現知善、樂善與行善的品德。',
          elementary: '培養愛護自然、珍愛生命、惜取資源的關懷心與行動力。'
        },
        C2: {
          name: '人際關係與團隊合作',
          description: '具備友善的人際情懷及與他人建立良好的互動關係，並發展與人溝通協調、包容異己、社會參與及服務等團隊合作的素養。',
          elementary: '透過探索科學的合作學習，培養與同儕溝通表達、團隊合作及和諧相處的能力。'
        },
        C3: {
          name: '多元文化與國際理解',
          description: '具備自我文化認同的信念，並尊重與欣賞多元文化，積極關心全球議題及國際情勢，且能順應時代脈動與社會需要，發展國際理解、多元文化價值觀與世界和平的胸懷。',
          elementary: '透過環境相關議題的學習，能了解全球自然環境的現況與特性及其背後之文化差異。'
        }
      }
    }
  }
  
  // 核心素養數據（根據科目動態切換）
  const coreCompetencyData = (courseDomain === '英文' && englishCoreCompetencies.length > 0)
    ? (() => {
        // 將 API 返回的資料轉換為與舊格式相容的結構
        const converted: any = {}
        englishCoreCompetencies.forEach((mainCat) => {
          converted[mainCat.mainCategory] = {
            name: mainCat.mainCategoryName,
            items: {} as any
          }
          mainCat.subCategories.forEach((subCat) => {
            // 只取第一個 item（因為同一 subCategory 在不同學段可能有不同內容）
            // 實際使用時會根據選擇的學段和子項目來取得對應的內容
            const firstItem = subCat.items[0]
            if (firstItem) {
              converted[mainCat.mainCategory].items[subCat.subCategory] = {
                name: subCat.subCategoryName,
                description: firstItem.generalDescription,
                elementary: firstItem.specificDescription,
                code: firstItem.code,
                items: subCat.items // 保存所有 items 以便後續使用
              }
            }
          })
        })
        return converted
      })()
    : (courseDomain === '國文' && chineseCoreCompetencies.length > 0)
    ? (() => {
        // 將 API 返回的資料轉換為與舊格式相容的結構
        const converted: any = {}
        chineseCoreCompetencies.forEach((mainCat) => {
          converted[mainCat.mainCategory] = {
            name: mainCat.mainCategoryName,
            items: {} as any
          }
          mainCat.subCategories.forEach((subCat) => {
            const firstItem = subCat.items[0]
            if (firstItem) {
              converted[mainCat.mainCategory].items[subCat.subCategory] = {
                name: subCat.subCategoryName,
                description: firstItem.generalDescription,
                elementary: firstItem.specificDescription,
                code: firstItem.code,
                items: subCat.items // 保存所有 items 以便後續使用
              }
            }
          })
        })
        return converted
      })()
    : (courseDomain === '數學' && mathCoreCompetencies.length > 0)
    ? (() => {
        // 將 API 返回的資料轉換為與舊格式相容的結構
        const converted: any = {}
        mathCoreCompetencies.forEach((mainCat) => {
          converted[mainCat.mainCategory] = {
            name: mainCat.mainCategoryName,
            items: {} as any
          }
          mainCat.subCategories.forEach((subCat) => {
            const firstItem = subCat.items[0]
            if (firstItem) {
              converted[mainCat.mainCategory].items[subCat.subCategory] = {
                name: subCat.subCategoryName,
                description: firstItem.generalDescription,
                elementary: firstItem.specificDescription,
                code: firstItem.code,
                items: subCat.items // 保存所有 items 以便後續使用
              }
            }
          })
        })
        return converted
      })()
    : (courseDomain === '社會' && socialCoreCompetencies.length > 0)
    ? (() => {
        // 將 API 返回的資料轉換為與舊格式相容的結構
        const converted: any = {}
        socialCoreCompetencies.forEach((mainCat) => {
          converted[mainCat.mainCategory] = {
            name: mainCat.mainCategoryName,
            items: {} as any
          }
          mainCat.subCategories.forEach((subCat) => {
            const firstItem = subCat.items[0]
            if (firstItem) {
              converted[mainCat.mainCategory].items[subCat.subCategory] = {
                name: subCat.subCategoryName,
                description: firstItem.generalDescription,
                elementary: firstItem.specificDescription,
                code: firstItem.code,
                items: subCat.items // 保存所有 items 以便後續使用
              }
            }
          })
        })
        return converted
      })()
    : (courseDomain === '自然' && naturalCoreCompetencies.length > 0)
    ? (() => {
        // 將 API 返回的資料轉換為與舊格式相容的結構
        const converted: any = {}
        naturalCoreCompetencies.forEach((mainCat) => {
          converted[mainCat.mainCategory] = {
            name: mainCat.mainCategoryName,
            items: {} as any
          }
          mainCat.subCategories.forEach((subCat) => {
            const firstItem = subCat.items[0]
            if (firstItem) {
              converted[mainCat.mainCategory].items[subCat.subCategory] = {
                name: subCat.subCategoryName,
                description: firstItem.generalDescription,
                elementary: firstItem.specificDescription,
                code: firstItem.code,
                items: subCat.items // 保存所有 items 以便後續使用
              }
            }
          })
        })
        return converted
      })()
    : defaultCoreCompetencyData

  // 當課程領域為英文時，載入英文核心素養
  useEffect(() => {
    const loadEnglishCoreCompetencies = async () => {
      if (courseDomain === '英文' && schoolLevel) {
        try {
          const apiSchoolLevel = schoolLevel === '高中（高職）' ? '高中' : schoolLevel
          const response = await fetch(`/api/core-competencies/english?schoolLevel=${apiSchoolLevel}`)
          if (response.ok) {
            const data = await response.json()
            setEnglishCoreCompetencies(data)
            // 重置選擇
            setCoreCompetencyCategory('')
            setCoreCompetencyItem('')
            setCoreCompetencyDescription('')
          } else {
            console.error('載入英文核心素養失敗')
          }
        } catch (error) {
          console.error('載入英文核心素養錯誤:', error)
        }
      } else if (courseDomain !== '英文') {
        // 如果不是英文，清空資料
        setEnglishCoreCompetencies([])
      }
    }
    loadEnglishCoreCompetencies()
  }, [courseDomain, schoolLevel])

  // 當課程領域為國文時，載入國文核心素養
  useEffect(() => {
    const loadChineseCoreCompetencies = async () => {
      if (courseDomain === '國文' && schoolLevel) {
        try {
          const apiSchoolLevel = schoolLevel === '高中（高職）' ? '高中' : schoolLevel
          const response = await fetch(`/api/core-competencies/chinese?schoolLevel=${apiSchoolLevel}`)
          if (response.ok) {
            const data = await response.json()
            setChineseCoreCompetencies(data)
            // 重置選擇
            setCoreCompetencyCategory('')
            setCoreCompetencyItem('')
            setCoreCompetencyDescription('')
          } else {
            console.error('載入國文核心素養失敗')
          }
        } catch (error) {
          console.error('載入國文核心素養錯誤:', error)
        }
      } else if (courseDomain !== '國文') {
        // 如果不是國文，清空資料
        setChineseCoreCompetencies([])
      }
    }
    loadChineseCoreCompetencies()
  }, [courseDomain, schoolLevel])

  // 當課程領域為數學時，載入數學核心素養
  useEffect(() => {
    const loadMathCoreCompetencies = async () => {
      if (courseDomain === '數學' && schoolLevel) {
        try {
          const apiSchoolLevel = schoolLevel === '高中（高職）' ? '高中' : schoolLevel
          const response = await fetch(`/api/core-competencies/math?schoolLevel=${apiSchoolLevel}`)
          if (response.ok) {
            const data = await response.json()
            setMathCoreCompetencies(data)
            // 重置選擇
            setCoreCompetencyCategory('')
            setCoreCompetencyItem('')
            setCoreCompetencyDescription('')
          } else {
            console.error('載入數學核心素養失敗')
          }
        } catch (error) {
          console.error('載入數學核心素養錯誤:', error)
        }
      } else if (courseDomain !== '數學') {
        // 如果不是數學，清空資料
        setMathCoreCompetencies([])
      }
    }
    loadMathCoreCompetencies()
  }, [courseDomain, schoolLevel])

  // 當課程領域為社會時，載入社會科核心素養
  useEffect(() => {
    const loadSocialCoreCompetencies = async () => {
      if (courseDomain === '社會' && schoolLevel) {
        try {
          const apiSchoolLevel = schoolLevel === '高中（高職）' ? '高中' : schoolLevel
          const response = await fetch(`/api/core-competencies/social?schoolLevel=${apiSchoolLevel}`)
          if (response.ok) {
            const data = await response.json()
            setSocialCoreCompetencies(data)
            // 重置選擇
            setCoreCompetencyCategory('')
            setCoreCompetencyItem('')
            setCoreCompetencyDescription('')
          } else {
            console.error('載入社會科核心素養失敗')
          }
        } catch (error) {
          console.error('載入社會科核心素養錯誤:', error)
        }
      } else if (courseDomain !== '社會') {
        // 如果不是社會，清空資料
        setSocialCoreCompetencies([])
      }
    }
    loadSocialCoreCompetencies()
  }, [courseDomain, schoolLevel])

  // 當課程領域為自然時，載入自然科核心素養
  useEffect(() => {
    const loadNaturalCoreCompetencies = async () => {
      if (courseDomain === '自然' && schoolLevel) {
        try {
          const apiSchoolLevel = schoolLevel === '高中（高職）' ? '高中' : schoolLevel
          const response = await fetch(`/api/core-competencies/natural?schoolLevel=${apiSchoolLevel}`)
          if (response.ok) {
            const data = await response.json()
            setNaturalCoreCompetencies(data)
            // 重置選擇
            setCoreCompetencyCategory('')
            setCoreCompetencyItem('')
            setCoreCompetencyDescription('')
          } else {
            console.error('載入自然科核心素養失敗')
          }
        } catch (error) {
          console.error('載入自然科核心素養錯誤:', error)
        }
      } else if (courseDomain !== '自然') {
        // 如果不是自然，清空資料
        setNaturalCoreCompetencies([])
      }
    }
    loadNaturalCoreCompetencies()
  }, [courseDomain, schoolLevel])

  // 當選擇學習表現類別時，重置子項選擇
  useEffect(() => {
    if (learningPerformanceCategory) {
      setLearningPerformanceSubItem('')
      setSelectedCodes([])
    }
  }, [learningPerformanceCategory])

  // 當選擇學習表現子項時，重置代碼選擇
  useEffect(() => {
    if (learningPerformanceSubItem) {
      setSelectedCodes([])
    }
  }, [learningPerformanceSubItem])

  // 當課程領域為數學時，載入數學學習表現
  useEffect(() => {
    const loadMathPerformances = async () => {
      if (courseDomain === '數學') {
        try {
          const response = await fetch('/api/learning-performances/math')
          if (response.ok) {
            const data = await response.json()
            setMathPerformances(data)
          } else {
            console.error('載入數學學習表現失敗')
          }
        } catch (error) {
          console.error('載入數學學習表現錯誤:', error)
        }
      }
    }
    loadMathPerformances()
  }, [courseDomain])

  // 當課程領域為國文時，載入國文學習表現
  useEffect(() => {
    const loadChinesePerformances = async () => {
      if (courseDomain === '國文') {
        try {
          const response = await fetch('/api/learning-performances/chinese')
          if (response.ok) {
            const data = await response.json()
            setChinesePerformances(data)
          } else {
            console.error('載入國文學習表現失敗')
          }
        } catch (error) {
          console.error('載入國文學習表現錯誤:', error)
        }
      }
    }
    loadChinesePerformances()
  }, [courseDomain])

  // 當課程領域為國文且學段為國中/高中時，載入對應的學習表現
  useEffect(() => {
    const loadChineseMiddleHighPerformances = async () => {
      if (courseDomain === '國文' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const apiSchoolLevel = schoolLevel === '國中' ? '國中' : '高中'
          const response = await fetch(`/api/learning-performances/chinese?schoolLevel=${apiSchoolLevel}`)
          
          if (response.ok) {
            const data = await response.json()
            setChineseMiddleHighPerformances({ categories: data })
            // 重置選擇
            setChineseMHMainCategory('')
            setSelectedChineseMHCodes([])
          } else {
            console.error(`載入${schoolLevel}國文學習表現失敗`)
          }
        } catch (error) {
          console.error(`載入${schoolLevel}國文學習表現錯誤:`, error)
        }
      } else {
        // 如果不是國文科或不是國中高中，清空資料
        setChineseMiddleHighPerformances({ categories: [] })
        setChineseMHMainCategory('')
        setSelectedChineseMHCodes([])
      }
    }
    loadChineseMiddleHighPerformances()
  }, [courseDomain, schoolLevel])

  // 當課程領域為英文時，載入英文學習表現
  useEffect(() => {
    const loadEnglishPerformances = async () => {
      if (courseDomain === '英文') {
        try {
          const response = await fetch('/api/learning-performances/english')
          if (response.ok) {
            const data = await response.json()
            setEnglishPerformances(data)
          } else {
            console.error('載入英文學習表現失敗')
          }
        } catch (error) {
          console.error('載入英文學習表現錯誤:', error)
        }
      }
    }
    loadEnglishPerformances()
  }, [courseDomain])

  // 當課程領域為英文且學段為國中/高中時，載入對應的學習表現
  useEffect(() => {
    const loadEnglishMiddleHighPerformances = async () => {
      if (courseDomain === '英文' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const apiSchoolLevel = schoolLevel === '國中' ? '國中' : '高中'
          const response = await fetch(`/api/learning-performances/english?schoolLevel=${apiSchoolLevel}`)
          
          if (response.ok) {
            const data = await response.json()
            setEnglishMiddleHighPerformances({ categories: data })
            // 重置選擇
            setEnglishMHMainCategory('')
            setSelectedEnglishMHCodes([])
          } else {
            console.error(`載入${schoolLevel}英文學習表現失敗`)
          }
        } catch (error) {
          console.error(`載入${schoolLevel}英文學習表現錯誤:`, error)
        }
      } else {
        // 如果不是英文科或不是國中高中，清空資料
        setEnglishMiddleHighPerformances({ categories: [] })
        setEnglishMHMainCategory('')
        setSelectedEnglishMHCodes([])
      }
    }
    loadEnglishMiddleHighPerformances()
  }, [courseDomain, schoolLevel])

  // 當課程領域為社會時，載入社會學習表現（國小）
  useEffect(() => {
    const loadSocialPerformances = async () => {
      if (courseDomain === '社會' && schoolLevel === '國小') {
        try {
          const response = await fetch('/api/learning-performances/social')
          if (response.ok) {
            const data = await response.json()
            setSocialPerformances(data)
          } else {
            console.error('載入社會學習表現失敗')
          }
        } catch (error) {
          console.error('載入社會學習表現錯誤:', error)
        }
      }
    }
    loadSocialPerformances()
  }, [courseDomain, schoolLevel])
  
  // 當課程領域為社會且學段為國中/高中時，載入對應的學習表現
  useEffect(() => {
    const loadSocialMiddleHighPerformances = async () => {
      if (courseDomain === '社會' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const apiUrl = schoolLevel === '國中' 
            ? '/api/learning-performances/social-middle'
            : '/api/learning-performances/social-high'
          
          const response = await fetch(apiUrl)
          if (response.ok) {
            const data = await response.json()
            setSocialMiddleHighPerformances(data)
            // 重置選擇
            setSocialMHDimension('')
            setSocialMHCategory('')
            setSelectedSocialMHCodes([])
          } else {
            console.error(`載入${schoolLevel}社會學習表現失敗`)
          }
        } catch (error) {
          console.error(`載入${schoolLevel}社會學習表現錯誤:`, error)
        }
      } else {
        // 如果不是社會科或不是國中高中，清空資料
        setSocialMiddleHighPerformances({ dimensions: [] })
        setSocialMHDimension('')
        setSocialMHCategory('')
        setSelectedSocialMHCodes([])
      }
    }
    loadSocialMiddleHighPerformances()
  }, [courseDomain, schoolLevel])

  // 當課程領域為自然且學段為國中/高中時，載入對應的學習表現
  useEffect(() => {
    const loadNaturalMiddleHighPerformances = async () => {
      if (courseDomain === '自然' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const apiSchoolLevel = schoolLevel === '國中' ? '國中' : '高中'
          const response = await fetch(`/api/learning-performances/natural?schoolLevel=${apiSchoolLevel}`)
          
          if (response.ok) {
            const data = await response.json()
            setNaturalMiddleHighPerformances(data)
            // 重置選擇
            setNaturalMHSubCategory('')
            setNaturalMHItem('')
            setSelectedNaturalMHCodes([])
          } else {
            console.error(`載入${schoolLevel}自然科學習表現失敗`)
          }
        } catch (error) {
          console.error(`載入${schoolLevel}自然科學習表現錯誤:`, error)
        }
      } else {
        // 如果不是自然科或不是國中高中，清空資料
        setNaturalMiddleHighPerformances([])
        setNaturalMHSubCategory('')
        setNaturalMHItem('')
        setSelectedNaturalMHCodes([])
      }
    }
    loadNaturalMiddleHighPerformances()
  }, [courseDomain, schoolLevel])

  // 當課程領域為自然且學段為國中/高中時，載入對應的學習內容
  useEffect(() => {
    const loadNaturalMiddleHighContents = async () => {
      if (courseDomain === '自然' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const apiSchoolLevel = schoolLevel === '國中' ? '國中' : '高中'
          const response = await fetch(`/api/learning-contents/natural?schoolLevel=${apiSchoolLevel}`)
          
          if (response.ok) {
            const data = await response.json()
            setNaturalMiddleHighContents(data)
            // 重置選擇
            setNaturalMHContentSubject('')
            setNaturalMHContentTheme('')
            setNaturalMHContentSubTheme('')
            setSelectedNaturalMHContentCodes([])
          } else {
            console.error(`載入${schoolLevel}自然科學習內容失敗`)
          }
        } catch (error) {
          console.error(`載入${schoolLevel}自然科學習內容錯誤:`, error)
        }
      } else {
        // 如果不是自然科或不是國中高中，清空資料
        setNaturalMiddleHighContents([])
        setNaturalMHContentSubject('')
        setNaturalMHContentTheme('')
        setNaturalMHContentSubTheme('')
        setSelectedNaturalMHContentCodes([])
      }
    }
    loadNaturalMiddleHighContents()
  }, [courseDomain, schoolLevel])
  
  // 當課程領域為數學且學段為國中/高中時，載入對應的學習表現
  useEffect(() => {
    const loadMathMiddleHighPerformances = async () => {
      if (courseDomain === '數學' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const apiSchoolLevel = schoolLevel === '國中' ? '國中' : '高中'
          const response = await fetch(`/api/learning-performances/math?schoolLevel=${apiSchoolLevel}`)
          
          if (response.ok) {
            const data = await response.json()
            setMathMiddleHighPerformances({ categories: data })
            // 重置選擇
            setMathMHCategory('')
            setSelectedMathMHCodes([])
          } else {
            console.error(`載入${schoolLevel}數學學習表現失敗`)
          }
        } catch (error) {
          console.error(`載入${schoolLevel}數學學習表現錯誤:`, error)
        }
      } else {
        // 如果不是數學科或不是國中高中，清空資料
        setMathMiddleHighPerformances({ categories: [] })
        setMathMHCategory('')
        setSelectedMathMHCodes([])
      }
    }
    loadMathMiddleHighPerformances()
  }, [courseDomain, schoolLevel])
  
  // 當數學類別變更時，重置階段和選擇
  useEffect(() => {
    if (mathPerformanceCategory) {
      setMathPerformanceStage('')
      setSelectedMathCodes([])
    }
  }, [mathPerformanceCategory])
  
  // 當數學階段變更時，重置選擇
  useEffect(() => {
    if (mathPerformanceStage) {
      setSelectedMathCodes([])
    }
  }, [mathPerformanceStage])

  // 當國文類別變更時，重置階段和選擇
  useEffect(() => {
    if (chinesePerformanceCategory) {
      setChinesePerformanceStage('')
      setSelectedChineseCodes([])
    }
  }, [chinesePerformanceCategory])
  
  // 當國文階段變更時，重置選擇
  useEffect(() => {
    if (chinesePerformanceStage) {
      setSelectedChineseCodes([])
    }
  }, [chinesePerformanceStage])

  // 當英文類別變更時，重置階段和選擇
  useEffect(() => {
    if (englishPerformanceCategory) {
      setEnglishPerformanceStage('')
      setSelectedEnglishCodes([])
    }
  }, [englishPerformanceCategory])
  
  // 當英文階段變更時，重置選擇
  useEffect(() => {
    if (englishPerformanceStage) {
      setSelectedEnglishCodes([])
    }
  }, [englishPerformanceStage])

  // 當社會構面項目變更時，重置階段和選擇
  useEffect(() => {
    if (socialPerformanceDimensionItem) {
      setSocialPerformanceStage('')
      setSelectedSocialCodes([])
    }
  }, [socialPerformanceDimensionItem])
  
  // 當社會階段變更時，重置選擇
  useEffect(() => {
    if (socialPerformanceStage) {
      setSelectedSocialCodes([])
    }
  }, [socialPerformanceStage])

  // 當選擇學習內容類別時，重置階段選擇
  useEffect(() => {
    if (learningContentCategory) {
      setLearningContentStage('')
      setSelectedLearningContentCodes([])
    }
  }, [learningContentCategory])

  // 當選擇學習內容階段時，重置代碼選擇
  useEffect(() => {
    if (learningContentStage) {
      setSelectedLearningContentCodes([])
    }
  }, [learningContentStage])

  // 當國文學習內容主題變更時，重置階段和選擇
  useEffect(() => {
    if (chineseContentTopic) {
      setChineseContentStage('')
      setSelectedChineseContentCodes([])
    }
  }, [chineseContentTopic])
  
  // 當國文學習內容階段變更時，重置選擇
  useEffect(() => {
    if (chineseContentStage) {
      setSelectedChineseContentCodes([])
    }
  }, [chineseContentStage])

  // 當英文學習內容主分類變更時，重置子分類和選擇
  useEffect(() => {
    if (englishContentMainCategory) {
      setEnglishContentSubCategory('')
      setSelectedEnglishContentCodes([])
    }
  }, [englishContentMainCategory])
  
  // 當英文學習內容子分類變更時，重置選擇
  useEffect(() => {
    if (englishContentSubCategory) {
      setSelectedEnglishContentCodes([])
    }
  }, [englishContentSubCategory])

  // 當社會學習內容主題項目變更時，重置階段和選擇
  useEffect(() => {
    if (socialContentTopicItem) {
      setSocialContentStage('')
      setSelectedSocialContentCodes([])
    }
  }, [socialContentTopicItem])
  
  // 當社會學習內容階段變更時，重置選擇
  useEffect(() => {
    if (socialContentStage) {
      setSelectedSocialContentCodes([])
    }
  }, [socialContentStage])

  // 當課程領域為數學時，載入數學學習內容
  useEffect(() => {
    const loadMathContents = async () => {
      if (courseDomain === '數學' && schoolLevel === '國小') {
        try {
          const response = await fetch('/api/learning-contents/math')
          if (response.ok) {
            const data = await response.json()
            setMathContents(data)
            // 重置選擇
            setMathContentGrade('')
            setSelectedMathContentCodes([])
          } else {
            console.error('載入數學學習內容失敗')
          }
        } catch (error) {
          console.error('載入數學學習內容錯誤:', error)
        }
      } else if (courseDomain !== '數學' || schoolLevel !== '國小') {
        // 如果不是數學或不是國小，清空資料
        setMathContents([])
        setMathContentGrade('')
        setSelectedMathContentCodes([])
      }
    }
    loadMathContents()
  }, [courseDomain, schoolLevel])

  // 當課程領域為數學且學段為國中/高中時，載入對應的學習內容
  useEffect(() => {
    const loadMathMiddleHighContents = async () => {
      if (courseDomain === '數學' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const apiSchoolLevel = schoolLevel === '國中' ? '國中' : '高中'
          const response = await fetch(`/api/learning-contents/math?schoolLevel=${apiSchoolLevel}`)
          
          if (response.ok) {
            const data = await response.json()
            setMathMiddleHighContents({ grades: data })
            // 重置選擇
            setMathMHContentGrade('')
            setSelectedMathMHContentCodes([])
          } else {
            console.error(`載入${schoolLevel}數學學習內容失敗`)
          }
        } catch (error) {
          console.error(`載入${schoolLevel}數學學習內容錯誤:`, error)
        }
      } else {
        // 如果不是數學科或不是國中高中，清空資料
        setMathMiddleHighContents({ grades: [] })
        setMathMHContentGrade('')
        setSelectedMathMHContentCodes([])
      }
    }
    loadMathMiddleHighContents()
  }, [courseDomain, schoolLevel])

  // 當課程領域為國文時，載入國文學習內容
  useEffect(() => {
    const loadChineseContents = async () => {
      if (courseDomain === '國文') {
        try {
          const response = await fetch('/api/learning-contents/chinese')
          if (response.ok) {
            const data = await response.json()
            setChineseContents(data)
          } else {
            console.error('載入國文學習內容失敗')
          }
        } catch (error) {
          console.error('載入國文學習內容錯誤:', error)
        }
      }
    }
    loadChineseContents()
  }, [courseDomain])

  // 當課程領域為國文且學段為國中/高中時，載入對應的學習內容
  useEffect(() => {
    const loadChineseMiddleHighContents = async () => {
      if (courseDomain === '國文' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const apiSchoolLevel = schoolLevel === '國中' ? '國中' : '高中'
          const response = await fetch(`/api/learning-contents/chinese?schoolLevel=${apiSchoolLevel}`)
          
          if (response.ok) {
            const data = await response.json()
            setChineseMiddleHighContents({ categories: data })
            // 重置選擇
            setChineseMHMainCategoryCode('')
            setSelectedChineseMHContentCodes([])
          } else {
            console.error(`載入${schoolLevel}國文學習內容失敗`)
          }
        } catch (error) {
          console.error(`載入${schoolLevel}國文學習內容錯誤:`, error)
        }
      } else {
        // 如果不是國文科或不是國中高中，清空資料
        setChineseMiddleHighContents({ categories: [] })
        setChineseMHMainCategoryCode('')
        setSelectedChineseMHContentCodes([])
      }
    }
    loadChineseMiddleHighContents()
  }, [courseDomain, schoolLevel])

  // 當課程領域為英文且學段為國小時，載入英文學習內容
  useEffect(() => {
    const loadEnglishContents = async () => {
      if (courseDomain === '英文' && schoolLevel === '國小') {
        try {
          const response = await fetch('/api/learning-contents/english')
          if (response.ok) {
            const data = await response.json()
            setEnglishContents(data)
            // 重置選擇
            setEnglishContentMainCategory('')
            setEnglishContentSubCategory('')
            setSelectedEnglishContentCodes([])
          } else {
            console.error('載入英文學習內容失敗')
          }
        } catch (error) {
          console.error('載入英文學習內容錯誤:', error)
        }
      } else if (courseDomain !== '英文' || schoolLevel !== '國小') {
        // 如果不是英文或不是國小，清空資料
        setEnglishContents([])
        setEnglishContentMainCategory('')
        setEnglishContentSubCategory('')
        setSelectedEnglishContentCodes([])
      }
    }
    loadEnglishContents()
  }, [courseDomain, schoolLevel])

  // 當課程領域為英文且學段為國中/高中時，載入對應的學習內容
  useEffect(() => {
    const loadEnglishMiddleHighContents = async () => {
      if (courseDomain === '英文' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const apiSchoolLevel = schoolLevel === '國中' ? '國中' : '高中'
          const response = await fetch(`/api/learning-contents/english?schoolLevel=${apiSchoolLevel}`)
          
          if (response.ok) {
            const data = await response.json()
            setEnglishMiddleHighContents(data)
            // 重置選擇
            setEnglishMHContentMainCategory('')
            setEnglishMHContentSubCategory('')
            setSelectedEnglishMHContentCodes([])
          } else {
            console.error(`載入${schoolLevel}英文學習內容失敗`)
          }
        } catch (error) {
          console.error(`載入${schoolLevel}英文學習內容錯誤:`, error)
        }
      } else {
        // 如果不是英文科或不是國中高中，清空資料
        setEnglishMiddleHighContents([])
        setEnglishMHContentMainCategory('')
        setEnglishMHContentSubCategory('')
        setSelectedEnglishMHContentCodes([])
      }
    }
    loadEnglishMiddleHighContents()
  }, [courseDomain, schoolLevel])

  // 當課程領域為社會時，載入社會學習內容（國小 - 舊版）
  useEffect(() => {
    const loadSocialContents = async () => {
      if (courseDomain === '社會' && schoolLevel === '國小') {
        try {
          const response = await fetch('/api/learning-contents/social')
          if (response.ok) {
            const data = await response.json()
            setSocialContents(data)
          } else {
            console.error('載入社會學習內容失敗')
          }
        } catch (error) {
          console.error('載入社會學習內容錯誤:', error)
        }
      }
    }
    loadSocialContents()
  }, [courseDomain, schoolLevel])

  // 當課程領域為社會且學段為國中/高中時，載入主題列表（新版）
  useEffect(() => {
    const loadSocialMHThemes = async () => {
      if (courseDomain === '社會' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const stage = schoolLevel === '國中' ? 'IV' : 'V'
          const response = await fetch(`/api/learning-contents/social?stage=${stage}&subject=歷`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.type === 'themes') {
              setSocialContentMHThemes(data.data)
            }
          } else {
            console.error('載入社會學習內容主題失敗')
          }
        } catch (error) {
          console.error('載入社會學習內容主題錯誤:', error)
        }
      } else {
        // 重置狀態
        setSocialContentMHThemes([])
        setSocialContentMHCategories([])
        setSocialContentMHContents([])
        setSocialContentMHTheme('')
        setSocialContentMHCategory('')
        setSelectedSocialContentMHCodes([])
      }
    }
    loadSocialMHThemes()
  }, [courseDomain, schoolLevel])

  // 當選擇主題後，載入該主題的項目和條目
  useEffect(() => {
    const loadSocialMHThemeDetails = async () => {
      if (socialContentMHTheme && courseDomain === '社會' && (schoolLevel === '國中' || schoolLevel === '高中（高職）')) {
        try {
          const stage = schoolLevel === '國中' ? 'IV' : 'V'
          const response = await fetch(`/api/learning-contents/social?stage=${stage}&subject=歷&theme=${socialContentMHTheme}`)
          if (response.ok) {
            const data = await response.json()
            if (data.success && data.type === 'theme_details') {
              setSocialContentMHCategories(data.data.categories)
              setSocialContentMHContents(data.data.contents)
            }
          }
        } catch (error) {
          console.error('載入主題詳情錯誤:', error)
        }
      } else {
        setSocialContentMHCategories([])
        setSocialContentMHContents([])
        setSocialContentMHCategory('')
        setSelectedSocialContentMHCodes([])
      }
    }
    loadSocialMHThemeDetails()
  }, [socialContentMHTheme, courseDomain, schoolLevel])

  // 當主題或項目變更時，重置選擇（學習內容）
  useEffect(() => {
    setSocialContentMHCategory('')
    setSelectedSocialContentMHCodes([])
  }, [socialContentMHTheme])

  useEffect(() => {
    setSelectedSocialContentMHCodes([])
  }, [socialContentMHCategory])
  
  // 當學段變更時，重置年級
  useEffect(() => {
    setImplementationGrade('')
  }, [schoolLevel])
  
  // 當社會科國中高中構面變更時，重置項目和選擇
  useEffect(() => {
    setSocialMHCategory('')
    setSelectedSocialMHCodes([])
  }, [socialMHDimension])
  
  // 當社會科國中高中項目變更時，重置選擇
  useEffect(() => {
    setSelectedSocialMHCodes([])
  }, [socialMHCategory])
  
  // 當數學學習內容年級變更時，重置選擇
  useEffect(() => {
    if (mathContentGrade) {
      setSelectedMathContentCodes([])
    }
  }, [mathContentGrade])

  // 當選擇核心素養類別時，重置項目選擇
  useEffect(() => {
    if (coreCompetencyCategory) {
      setCoreCompetencyItem('')
      setCoreCompetencyDescription('')
    }
  }, [coreCompetencyCategory])

  // 當選擇核心素養項目時，自動帶入說明
  useEffect(() => {
    if (coreCompetencyCategory && coreCompetencyItem) {
      const category = coreCompetencyData[coreCompetencyCategory as keyof typeof coreCompetencyData]
      if (category) {
        const item = category.items[coreCompetencyItem as keyof typeof category.items]
        if (item) {
          // 如果是英文、國文、數學、社會或自然科目，需要根據學段取得對應的內容
          if ((courseDomain === '英文' || courseDomain === '國文' || courseDomain === '數學' || courseDomain === '社會' || courseDomain === '自然') && schoolLevel && item.items) {
            const apiSchoolLevel = schoolLevel === '高中（高職）' ? '高中' : schoolLevel
            // 從 items 中找到對應學段的項目
            const matchedItem = item.items.find((it: any) => {
              if (courseDomain === '英文') {
                // 根據 code 判斷學段：英-E- 是國小，英-J- 是國中，英S-U- 是高中
                if (apiSchoolLevel === '國小' && it.code.startsWith('英-E-')) return true
                if (apiSchoolLevel === '國中' && it.code.startsWith('英-J-')) return true
                if (apiSchoolLevel === '高中' && it.code.startsWith('英S-U-')) return true
              } else if (courseDomain === '國文') {
                // 根據 code 判斷學段：國-E- 是國小，國-J- 是國中，國S-U- 或 國-S-U- 是高中
                if (apiSchoolLevel === '國小' && it.code.startsWith('國-E-')) return true
                if (apiSchoolLevel === '國中' && it.code.startsWith('國-J-')) return true
                if (apiSchoolLevel === '高中' && (it.code.startsWith('國S-U-') || it.code.startsWith('國-S-U-'))) return true
              } else if (courseDomain === '數學') {
                // 根據 code 判斷學段：數-E- 是國小，數-J- 是國中，數S-U- 或 數-S-U- 是高中
                if (apiSchoolLevel === '國小' && it.code.startsWith('數-E-')) return true
                if (apiSchoolLevel === '國中' && it.code.startsWith('數-J-')) return true
                if (apiSchoolLevel === '高中' && (it.code.startsWith('數S-U-') || it.code.startsWith('數-S-U-'))) return true
              } else if (courseDomain === '社會') {
                // 根據 code 判斷學段：社-E- 是國小，社-J- 是國中，社-U- 是高中
                if (apiSchoolLevel === '國小' && it.code.startsWith('社-E-')) return true
                if (apiSchoolLevel === '國中' && it.code.startsWith('社-J-')) return true
                if (apiSchoolLevel === '高中' && it.code.startsWith('社-U-')) return true
              } else if (courseDomain === '自然') {
                // 根據 code 判斷學段：自-E- 是國小，自-J- 是國中，自S-U- 是高中
                if (apiSchoolLevel === '國小' && it.code.startsWith('自-E-')) return true
                if (apiSchoolLevel === '國中' && it.code.startsWith('自-J-')) return true
                if (apiSchoolLevel === '高中' && it.code.startsWith('自S-U-')) return true
              }
              return false
            })
            
            if (matchedItem) {
              // 上方標籤使用編號（如：英-E-A1、國-E-A1、數-E-A1、社-E-A1 或 自-E-A1），內容只顯示文字描述
              const fullDescription = `總綱核心素養項目說明：\n${matchedItem.generalDescription}\n\n${matchedItem.code}：\n${matchedItem.specificDescription}`
              setCoreCompetencyDescription(fullDescription)
            } else {
              // 如果找不到對應學段的項目，使用預設格式（內容不再重複編號）
              const fullDescription = `總綱核心素養項目說明：\n${item.description}\n\n${item.code || ''}：\n${item.elementary}`
              setCoreCompetencyDescription(fullDescription)
            }
          } else {
            // 非英文/國文/數學/社會/自然科目或舊格式
            const fullDescription = `總綱核心素養項目說明：\n${item.description}\n\n國民小學教育(E)：\n${item.elementary}`
            setCoreCompetencyDescription(fullDescription)
          }
        }
      }
    } else {
      setCoreCompetencyDescription('')
    }
  }, [coreCompetencyCategory, coreCompetencyItem, courseDomain, schoolLevel, coreCompetencyData])

  // 載入當前版本號
  useEffect(() => {
    const loadCurrentVersion = async () => {
      if (!activityId) return

      try {
        // 先從 localStorage 讀取當前版本號
        const storageKey = `currentVersion_${activityId}`
        const storedVersion = localStorage.getItem(storageKey)
        
        if (storedVersion) {
          setCurrentVersion(storedVersion)
          return
        }

        // 如果 localStorage 沒有，從 API 讀取最新版本
        const response = await fetch(`/api/activity-versions/${activityId}`)
        const data = await response.json()

        if (response.ok && data.versions && data.versions.length > 0) {
          // 取得最新版本（版本號最大的）
          const latestVersion = data.versions[0]
          const versionNumber = `v${latestVersion.versionNumber}`
          setCurrentVersion(versionNumber)
          // 儲存到 localStorage
          localStorage.setItem(storageKey, versionNumber)
        } else {
          setCurrentVersion('')
        }
      } catch (error) {
        console.error('載入版本號錯誤:', error)
        setCurrentVersion('')
      }
    }

    loadCurrentVersion()
  }, [activityId])

  // 載入教案資料
  useEffect(() => {
    const loadLessonPlan = async () => {
      if (!activityId) return

      try {
        const response = await fetch(`/api/lesson-plans/${activityId}`)
        const data = await response.json()

        if (response.ok && data.lessonPlan) {
          // 載入主表資料
          setLessonPlanTitle(data.lessonPlan.lessonPlanTitle || '')
          setCourseDomain(data.lessonPlan.courseDomain || '')
          setDesigner(data.lessonPlan.designer || '')
          setUnitName(data.lessonPlan.unitName || '')
          setSchoolLevel(data.lessonPlan.schoolLevel || data.lessonPlan.school_level || '')
          setImplementationGrade(data.lessonPlan.implementationGrade || '')
          setTeachingTimeLessons(data.lessonPlan.teachingTimeLessons?.toString() || '')
          setTeachingTimeMinutes(data.lessonPlan.teachingTimeMinutes?.toString() || '')
          setMaterialSource(data.lessonPlan.materialSource || '')
          setTeachingEquipment(data.lessonPlan.teachingEquipment || '')
          setLearningObjectives(data.lessonPlan.learningObjectives || '')
          setAssessmentTools(data.lessonPlan.assessmentTools || '')
          setReferences(data.lessonPlan.references || '')

          // 載入核心素養
          if (data.coreCompetencies && Array.isArray(data.coreCompetencies)) {
            setAddedCoreCompetencies(data.coreCompetencies)
          }

          // 載入學習表現
          if (data.learningPerformances && Array.isArray(data.learningPerformances)) {
            setAddedLearningPerformances(data.learningPerformances)
          }

          // 載入學習內容
          if (data.learningContents && Array.isArray(data.learningContents)) {
            setAddedLearningContents(data.learningContents)
          }

          // 載入活動與評量設計
          if (data.activityRows && Array.isArray(data.activityRows)) {
            setActivityRows(data.activityRows.map((row: any) => ({
              id: row.id || '',
              teachingContent: row.teachingContent || '',
              teachingTime: row.teachingTime || '',
              teachingResources: row.teachingResources || '',
              assessmentMethods: row.assessmentMethods || '',
            })))
          }

          // 載入雙向細目表勾選狀態
          // 需要根據學習表現和活動行的索引來構建 key
          if (data.specificationPerformances && Array.isArray(data.specificationPerformances) && data.learningPerformances && data.activityRows) {
            const perfSet = new Set<string>()
            
            // 建立 performance_id 到索引的映射
            const perfIdToIndex = new Map<string, { groupIndex: number; itemIndex: number }>()
            data.learningPerformances.forEach((group: any) => {
              const groupIndex = group._groupIndex !== undefined ? group._groupIndex : 0
              if (group.content && Array.isArray(group.content)) {
                group.content.forEach((item: any) => {
                  if (item.id) {
                    const itemIndex = item._itemIndex !== undefined ? item._itemIndex : 0
                    perfIdToIndex.set(item.id, { groupIndex, itemIndex })
                  }
                })
              }
            })

            // 建立 activity_row_id 到索引的映射
            const actIdToIndex = new Map<string, number>()
            data.activityRows.forEach((row: any, actIndex: number) => {
              if (row.id) {
                actIdToIndex.set(row.id, actIndex)
              }
            })

            // 構建勾選狀態的 key
            data.specificationPerformances.forEach((spec: any) => {
              if (spec.isChecked) {
                const perfIndex = perfIdToIndex.get(spec.performanceId)
                const actIndex = actIdToIndex.get(spec.activityRowId)
                if (perfIndex !== undefined && actIndex !== undefined) {
                  perfSet.add(`perf-${perfIndex.groupIndex}-${perfIndex.itemIndex}-${actIndex}`)
                }
              }
            })
            setCheckedPerformances(perfSet)
          }

          if (data.specificationContents && Array.isArray(data.specificationContents) && data.learningContents && data.activityRows) {
            const contSet = new Set<string>()
            
            // 建立 content_id 到索引的映射
            const contIdToIndex = new Map<string, { groupIndex: number; itemIndex: number }>()
            data.learningContents.forEach((group: any) => {
              const groupIndex = group._groupIndex !== undefined ? group._groupIndex : 0
              if (group.content && Array.isArray(group.content)) {
                group.content.forEach((item: any) => {
                  if (item.id) {
                    const itemIndex = item._itemIndex !== undefined ? item._itemIndex : 0
                    contIdToIndex.set(item.id, { groupIndex, itemIndex })
                  }
                })
              }
            })

            // 建立 activity_row_id 到索引的映射
            const actIdToIndex = new Map<string, number>()
            data.activityRows.forEach((row: any, actIndex: number) => {
              if (row.id) {
                actIdToIndex.set(row.id, actIndex)
              }
            })

            // 構建勾選狀態的 key
            data.specificationContents.forEach((spec: any) => {
              if (spec.isChecked) {
                const contIndex = contIdToIndex.get(spec.contentId)
                const actIndex = actIdToIndex.get(spec.activityRowId)
                if (contIndex !== undefined && actIndex !== undefined) {
                  contSet.add(`cont-${contIndex.groupIndex}-${contIndex.itemIndex}-${actIndex}`)
                }
              }
            })
            setCheckedContents(contSet)
          }
        }
      } catch (error) {
        console.error('載入教案資料錯誤:', error)
      }
    }

    loadLessonPlan()
  }, [activityId])

  // 當節數改變時，自動計算分鐘數（1 節課 = 40 分鐘）
  useEffect(() => {
    if (teachingTimeLessons) {
      const lessons = parseFloat(teachingTimeLessons)
      if (!isNaN(lessons) && lessons > 0) {
        const minutes = Math.round(lessons * 40)
        setTeachingTimeMinutes(minutes.toString())
      } else if (teachingTimeLessons === '') {
        setTeachingTimeMinutes('')
      }
    }
  }, [teachingTimeLessons])

  // 自動調整 textarea 高度（每個欄位獨立調整）
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto'
    const scrollHeight = textarea.scrollHeight
    textarea.style.height = Math.max(40, scrollHeight) + 'px'
  }

  // 同步同一行所有 textarea 的高度（保持行高一致）
  const syncRowHeight = (rowIndex: number) => {
    setTimeout(() => {
      const rowId = `activity-row-${rowIndex}`
      const textareas = document.querySelectorAll(`[data-row-id="${rowId}"]`) as NodeListOf<HTMLTextAreaElement>
      if (textareas.length > 0) {
        let maxHeight = 40 // 最小高度
        textareas.forEach((textarea) => {
          textarea.style.height = 'auto'
          const height = textarea.scrollHeight
          if (height > maxHeight) {
            maxHeight = height
          }
        })
        textareas.forEach((textarea) => {
          textarea.style.height = maxHeight + 'px'
        })
      }
    }, 0)
  }

  // 當 activityRows 改變或切換到活動標籤頁時，重新計算所有行的高度
  useEffect(() => {
    if (activeTab === 'activity' && activityRows.length > 0) {
      // 使用 setTimeout 確保 DOM 已經渲染完成
      setTimeout(() => {
        activityRows.forEach((_, rowIndex) => {
          syncRowHeight(rowIndex)
        })
      }, 50)
    }
  }, [activityRows, activeTab])

  // 處理下載功能（僅支援 Word）
  const handleDownload = async () => {
    try {
      // 檢查瀏覽器是否支援 File System Access API
      if (!('showSaveFilePicker' in window)) {
        // 如果不支援，使用傳統下載方式
        await handleDownloadFallback()
        return
      }

      // 生成檔案名稱
      const fileName = `${activityName || '教案'}_${new Date().toISOString().split('T')[0]}.docx`
      
      // 使用 File System Access API 讓用戶選擇下載位置
      const fileHandle = await (window as any).showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: 'Word 檔案', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }],
      })

      await generateAndSaveWord(fileHandle)
      
      alert('檔案下載成功！')
    } catch (error: any) {
      // 如果用戶取消選擇，不顯示錯誤
      if (error.name !== 'AbortError') {
        console.error('下載失敗:', error)
        // 降級到傳統下載方式
        await handleDownloadFallback()
      }
    }
  }

  // 降級下載方式（當 File System Access API 不支援時）
  const handleDownloadFallback = async () => {
    const fileName = `${activityName || '教案'}_${new Date().toISOString().split('T')[0]}.docx`
    
    const doc = await generateWord()
    const blob = await Packer.toBlob(doc)
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 生成 PDF
  const generatePDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageWidth = pdf.internal.pageSize.getWidth()
    const margin = 20
    let startY = 20

    // 標題
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    const title = lessonPlanTitle || activityName || '教案'
    pdf.text(title, pageWidth / 2, startY, { align: 'center' })
    startY += 10

    // 第一行：教案標題 + 設計者
    const row1Data = [
      ['教案標題', lessonPlanTitle || ''],
      ['設計者', designer || '']
    ]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: row1Data,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 5

    // 第二行：課程領域 + 授課時間
    const teachingTimeText = teachingTimeLessons && teachingTimeMinutes
      ? `${teachingTimeLessons} 節課,共 ${teachingTimeMinutes} 分鐘`
      : teachingTimeLessons
      ? `${teachingTimeLessons} 節課`
      : teachingTimeMinutes
      ? `${teachingTimeMinutes} 分鐘`
      : ''
    const row2Data = [
      ['課程領域', courseDomain || ''],
      ['授課時間', teachingTimeText]
    ]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: row2Data,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 5

    // 第三行：單元名稱
    const row3Data = [['單元名稱', unitName || '']]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: row3Data,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 5

    // 第四行：實施年級（學段 + 年級）
    const gradeDisplay = schoolLevel && implementationGrade 
      ? `${schoolLevel} ${implementationGrade}年級` 
      : (schoolLevel || (implementationGrade ? `${implementationGrade}年級` : ''))
    const row4Data = [['實施年級', gradeDisplay]]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: row4Data,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 5

    // 第五行：核心素養
    const coreCompetencyText = addedCoreCompetencies.length > 0
      ? addedCoreCompetencies.map(c => c.content).join('\n')
      : ''
    const row5Data = [['核心素養', coreCompetencyText]]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: row5Data,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 5

    // 第六行：學習表現
    const learningPerformanceText = addedLearningPerformances.length > 0
      ? addedLearningPerformances.flatMap(p => p.content.map(c => `${c.code}: ${c.description}`)).join('\n')
      : ''
    const row6Data = [['學習表現', learningPerformanceText]]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: row6Data,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 5

    // 第七行：學習內容
    const learningContentText = addedLearningContents.length > 0
      ? addedLearningContents.flatMap(c => c.content.map(cont => `${cont.code}: ${cont.description}`)).join('\n')
      : ''
    const row7Data = [['學習內容', learningContentText]]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: row7Data,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 5

    // 第八行：教材來源
    const row8Data = [['教材來源', materialSource || '']]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: row8Data,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 5

    // 第九行：教學設備/資源
    const row9Data = [['教學設備/資源', teachingEquipment || '']]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: row9Data,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 5

    // 第十行：學習目標
    const row10Data = [['學習目標', learningObjectives || '']]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: row10Data,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 10

    // 學習活動設計標題
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'bold')
    pdf.text('學習活動設計', pageWidth / 2, startY, { align: 'center' })
    startY += 8

    // 活動與評量設計表格
    if (activityRows.length > 0) {
      const tableData = activityRows.map(row => [
        row.teachingContent || '',
        row.teachingTime || '',
        row.teachingResources || '',
        row.assessmentMethods || ''
      ])

      autoTable(pdf, {
        startY,
        head: [['教學內容及實施方式', '教學時間', '教學資源', '學習評量方式']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 50 }
        },
        margin: { left: margin, right: margin },
        styles: { cellPadding: 2, overflow: 'linebreak' }
      })
      startY = (pdf as any).lastAutoTable.finalY + 5
    }

    // 評量工具
    const assessmentRowData = [['評量工具', assessmentTools || '']]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: assessmentRowData,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })
    startY = (pdf as any).lastAutoTable.finalY + 5

    // 參考資料
    const referenceRowData = [['參考資料', references || '']]
    autoTable(pdf, {
      startY,
      head: [['', '']],
      body: referenceRowData,
      theme: 'grid',
      headStyles: { fillColor: [230, 230, 230], fontStyle: 'bold' },
      bodyStyles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 30, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      styles: { cellPadding: 3 }
    })

    return pdf
  }

  // 生成 Word 文件 - 完全按照指定的表格結構
  const generateWord = async () => {
    const children: (Paragraph | Table)[] = []

    // 添加標題「12年國教素養導向教學方案格式」
    children.push(
      new Paragraph({
        children: [new TextRun({ 
          text: '12年國教素養導向教學方案格式',
          bold: true,
          size: 32, // 16pt = 32 half-points
          color: '000000',
        })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 240, before: 0 }, // 標題後留一些間距
      })
    )

    // 定義邊框樣式（根據模板：外框較粗，內框較細）
    // Word XML 中 sz="12" 對應約 1.5pt，sz="4" 對應約 0.5pt
    // docx 庫中 size 單位是 1/20 point，所以 0.75pt = 15, 0.1pt = 2
    // 外框調整為 0.75pt（size: 15），內框調整為 0.1pt（size: 2）
    const outerBorderStyle = {
      top: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
    }
    
    const innerBorderStyle = {
      top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    }

    // 外框 cell 樣式（用於表格最外圍的 cell）
    // 第一行和最後一行的 cell：top/bottom 使用外框，left/right 使用內框
    // 第一列和最後一列的 cell：left/right 使用外框，top/bottom 使用內框
    // 角落的 cell：所有邊都使用外框
    const outerTopBorderStyle = {
      top: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    }
    
    const outerBottomBorderStyle = {
      top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    }
    
    const outerLeftBorderStyle = {
      top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    }
    
    const outerRightBorderStyle = {
      top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
    }
    
    const outerCornerTopLeftStyle = {
      top: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    }
    
    const outerCornerTopRightStyle = {
      top: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
    }
    
    const outerCornerBottomLeftStyle = {
      top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
    }
    
    const outerCornerBottomRightStyle = {
      top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
    }

    // 標籤欄位樣式（移除底色設定，保持白色）
    // 使用內框樣式，因為標題欄位在表格內部
    const labelCellStyle = {
      borders: innerBorderStyle,
      // 移除 shading 設定，讓標題欄位保持白色背景
    }

    // 內容欄位樣式（白底，使用內框樣式）
    const contentCellStyle = {
      borders: innerBorderStyle,
    }

    // 文字樣式（約 12pt）
    const textStyle = { size: 24, color: '000000' } // 12pt = 24 half-points, 黑色文字（非粗體）
    
    // 標題欄位文字樣式（黑色粗體字）
    const headerTextStyle = { size: 24, color: '000000', bold: true } // 12pt = 24 half-points, 黑色粗體文字

    // ========================
    // 【表格一：教案基本資料】
    // ========================
    // 10列、4欄，欄寬比例：18%, 42%, 15%, 25%
    
    const teachingTimeText = teachingTimeLessons && teachingTimeMinutes
      ? `${teachingTimeLessons} 節課,共 ${teachingTimeMinutes} 分鐘`
      : teachingTimeLessons
      ? `${teachingTimeLessons} 節課`
      : teachingTimeMinutes
      ? `${teachingTimeMinutes} 分鐘`
      : ''
    
    const coreCompetencyText = addedCoreCompetencies.length > 0
      ? addedCoreCompetencies.map(c => c.content).join('\n')
      : ''
    
    const learningPerformanceText = addedLearningPerformances.length > 0
      ? addedLearningPerformances.flatMap(p => p.content.map(c => `${c.code}: ${c.description}`)).join('\n')
      : ''
    
    const learningContentText = addedLearningContents.length > 0
      ? addedLearningContents.flatMap(c => c.content.map(cont => `${cont.code}: ${cont.description}`)).join('\n')
      : ''

    // 建立表格一的 10 列
    const table1Rows: TableRow[] = [
      // Row 0: 教案標題 + 設計者（4欄）- 第一行，使用外框樣式
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '教案標題', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' }, // 教案標題右邊是內框
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: lessonPlanTitle || '', ...textStyle })] })],
            width: { size: 42, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '設計者', ...headerTextStyle })] })],
            width: { size: 15, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 2, color: '000000' }, // 設計者左邊是內框
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
            },
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: designer || '', ...textStyle })] })],
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: outerCornerTopRightStyle, // 右上角，使用外框
          }),
        ],
      }),
      // Row 1: 課程領域 + 授課時間（4欄）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '課程領域', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerLeftBorderStyle, // 左側，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: courseDomain || '', ...textStyle })] })],
            width: { size: 42, type: WidthType.PERCENTAGE },
            ...contentCellStyle,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '授課時間', ...headerTextStyle })] })],
            width: { size: 15, type: WidthType.PERCENTAGE },
            ...labelCellStyle,
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: teachingTimeText, ...textStyle })] })],
            width: { size: 25, type: WidthType.PERCENTAGE },
            borders: outerRightBorderStyle, // 右側，使用外框
          }),
        ],
      }),
      // Row 2: 單元名稱（第1欄標籤，第2-4欄合併）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '單元名稱', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerLeftBorderStyle, // 左側，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: unitName || '', ...textStyle })] })],
            columnSpan: 3,
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: outerRightBorderStyle, // 右側，使用外框
          }),
        ],
      }),
      // Row 3: 實施年級（第1欄標籤，第2-4欄合併，顯示學段 + 年級）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '實施年級', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerLeftBorderStyle, // 左側，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ 
                text: schoolLevel && implementationGrade 
                  ? `${schoolLevel} ${implementationGrade}年級` 
                  : (schoolLevel || (implementationGrade ? `${implementationGrade}年級` : '')), 
                ...textStyle 
              })] 
            })],
            columnSpan: 3,
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: outerRightBorderStyle, // 右側，使用外框
          }),
        ],
      }),
      // Row 4: 核心素養（第1欄標籤，第2-4欄合併）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '核心素養', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerLeftBorderStyle, // 左側，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: coreCompetencyText, ...textStyle })],
              spacing: { after: 300, before: 300 }, // 增加上下間距，提高欄位高度（1.5倍）
            })],
            columnSpan: 3,
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: outerRightBorderStyle, // 右側，使用外框
          }),
        ],
      }),
      // Row 5: 學習表現（第1欄標籤，第2-4欄合併）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '學習表現', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerLeftBorderStyle, // 左側，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: learningPerformanceText, ...textStyle })],
              spacing: { after: 300, before: 300 }, // 增加上下間距，提高欄位高度（1.5倍）
            })],
            columnSpan: 3,
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: outerRightBorderStyle, // 右側，使用外框
          }),
        ],
      }),
      // Row 6: 學習內容（第1欄標籤，第2-4欄合併）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '學習內容', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerLeftBorderStyle, // 左側，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: learningContentText, ...textStyle })],
              spacing: { after: 300, before: 300 }, // 增加上下間距，提高欄位高度（1.5倍）
            })],
            columnSpan: 3,
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: outerRightBorderStyle, // 右側，使用外框
          }),
        ],
      }),
      // Row 7: 教材來源（第1欄標籤，第2-4欄合併）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '教材來源', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerLeftBorderStyle, // 左側，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: materialSource || '', ...textStyle })] })],
            columnSpan: 3,
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: outerRightBorderStyle, // 右側，使用外框
          }),
        ],
      }),
      // Row 8: 教學設備/資源（第1欄標籤，第2-4欄合併）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '教學設備/資源', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerLeftBorderStyle, // 左側，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: teachingEquipment || '', ...textStyle })],
              spacing: { after: 200, before: 200 }, // 增加上下間距，提高欄位高度
            })],
            columnSpan: 3,
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: outerRightBorderStyle, // 右側，使用外框
          }),
        ],
      }),
      // Row 9: 學習目標（第1欄標籤，第2-4欄合併）- 最後一行，使用外框樣式
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '學習目標', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerCornerBottomLeftStyle, // 左下角，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: learningObjectives || '', ...textStyle })],
              spacing: { after: 300, before: 300 }, // 增加上下間距，提高欄位高度（1.5倍）
            })],
            columnSpan: 3,
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: outerCornerBottomRightStyle, // 右下角，使用外框
          }),
        ],
      }),
    ]

    // 表格一 - 使用百分比寬度，確保適應頁面寬度
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: table1Rows,
      })
    )

    // 留一點空白
    children.push(
      new Paragraph({
        text: '',
        spacing: { after: 200 },
      })
    )

    // ========================
    // 【表格二：學習活動設計】
    // ========================
    // 5列、5欄，欄寬比例：第1-2欄合計47%（第1欄稍寬，第2欄稍窄），第3欄12%，第4欄12%，第5欄29%
    
    const activityTableHeaderStyle = {
      borders: outerBorderStyle,
      // 移除 shading 設定，讓標題欄位保持白色背景
    }

    // 建立表格二的 5 列
    const table2Rows: TableRow[] = [
      // Row 0: 學習活動設計（5欄合併成1格，置中）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '學習活動設計', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            columnSpan: 5,
            borders: {
              top: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' }, // 學習活動設計下面是內框
              left: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
            },
            // 移除 shading 設定，讓標題欄位保持白色背景
          }),
        ],
      }),
      // Row 1: 標題列（第1-2欄合併顯示「教學內容及實施方式」，第3欄「教學時間」，第4欄「教學資源」，第5欄「學習評量方式」）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '教學內容及實施方式', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            columnSpan: 2,
            width: { size: 47, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
            },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '教學時間', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            width: { size: 12, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
            },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '教學資源', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            width: { size: 12, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
            },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '學習評量方式', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            width: { size: 29, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
            },
          }),
        ],
      }),
    ]

    // Row 2: 空白資料列（第1-2欄合併，第3-5欄各為空白）
    if (activityRows.length > 0) {
      // 如果有活動資料，為每個活動建立一行
      activityRows.forEach((row) => {
        table2Rows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: row.teachingContent || '', ...textStyle })],
                  spacing: { after: 100, before: 100 }, // 減少間距，讓行高根據內容自動調整
                })],
                columnSpan: 2,
                width: { size: 47, type: WidthType.PERCENTAGE },
                borders: outerLeftBorderStyle, // 左側，使用外框
                verticalAlign: VerticalAlign.TOP, // 內容靠上對齊
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: row.teachingTime || '', ...textStyle })],
                  spacing: { after: 100, before: 100 }, // 減少間距，讓行高根據內容自動調整
                })],
                width: { size: 12, type: WidthType.PERCENTAGE },
                ...contentCellStyle,
                verticalAlign: VerticalAlign.TOP, // 內容靠上對齊
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: row.teachingResources || '', ...textStyle })],
                  spacing: { after: 100, before: 100 }, // 減少間距，讓行高根據內容自動調整
                })],
                width: { size: 12, type: WidthType.PERCENTAGE },
                ...contentCellStyle,
                verticalAlign: VerticalAlign.TOP, // 內容靠上對齊
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: row.assessmentMethods || '', ...textStyle })],
                  spacing: { after: 100, before: 100 }, // 減少間距，讓行高根據內容自動調整
                })],
                width: { size: 29, type: WidthType.PERCENTAGE },
                borders: outerRightBorderStyle, // 右側，使用外框
                verticalAlign: VerticalAlign.TOP, // 內容靠上對齊
              }),
            ],
          })
        )
      })
    } else {
      // 如果沒有活動資料，顯示一行空白（最小高度）
      table2Rows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ 
                text: '',
                spacing: { after: 200, before: 200 }, // 最小間距，避免行高過大
              })],
              columnSpan: 2,
              width: { size: 47, type: WidthType.PERCENTAGE },
              borders: outerLeftBorderStyle, // 左側，使用外框
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: '',
                spacing: { after: 200, before: 200 }, // 最小間距，避免行高過大
              })],
              width: { size: 12, type: WidthType.PERCENTAGE },
              ...contentCellStyle,
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: '',
                spacing: { after: 200, before: 200 }, // 最小間距，避免行高過大
              })],
              width: { size: 12, type: WidthType.PERCENTAGE },
              ...contentCellStyle,
              verticalAlign: VerticalAlign.TOP,
            }),
            new TableCell({
              children: [new Paragraph({ 
                text: '',
                spacing: { after: 200, before: 200 }, // 最小間距，避免行高過大
              })],
              width: { size: 29, type: WidthType.PERCENTAGE },
              borders: outerRightBorderStyle, // 右側，使用外框
              verticalAlign: VerticalAlign.TOP,
            }),
          ],
        })
      )
    }

    // Row 3: 評量工具（第1欄標籤，第2-5欄合併）
    table2Rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '評量工具', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerLeftBorderStyle, // 左側，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: assessmentTools || '', ...textStyle })],
              spacing: { after: 200, before: 200 }, // 增加上下間距，提高欄位高度
            })],
            columnSpan: 4,
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: outerRightBorderStyle, // 右側，使用外框
          }),
        ],
      })
    )

    // Row 4: 參考資料（第1欄標籤，第2-5欄合併）- 最後一行，使用外框樣式
    table2Rows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: '參考資料', ...headerTextStyle })] })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: outerCornerBottomLeftStyle, // 左下角，使用外框
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: references || '', ...textStyle })],
              spacing: { after: 200, before: 200 }, // 增加上下間距，提高欄位高度
            })],
            columnSpan: 4,
            width: { size: 82, type: WidthType.PERCENTAGE },
            borders: outerCornerBottomRightStyle, // 右下角，使用外框
          }),
        ],
      })
    )

    // 表格二 - 使用百分比寬度，確保適應頁面寬度
    children.push(
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: table2Rows,
      })
    )

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              size: {
                orientation: PageOrientation.PORTRAIT,
                width: 12240, // A4 寬度 (21cm = 11906 twips, 但使用 12240 以確保足夠)
                height: 15840, // A4 高度 (29.7cm = 16838 twips, 但使用 15840 以確保足夠)
              },
              margin: {
                top: 720, // 減少上邊距 (約 1.27cm，原本約 2.54cm)
                right: 720, // 減少右邊距 (約 1.27cm，原本約 2.54cm)
                bottom: 720, // 減少下邊距 (約 1.27cm，原本約 2.54cm)
                left: 720, // 減少左邊距 (約 1.27cm，原本約 2.54cm)
              },
            },
          },
          children,
        },
      ],
    })

    return doc
  }

  // 使用 File System Access API 儲存 PDF
  const generateAndSavePDF = async (fileHandle: FileSystemFileHandle) => {
    const pdf = generatePDF()
    const pdfBlob = pdf.output('blob')
    const writable = await fileHandle.createWritable()
    await writable.write(pdfBlob)
    await writable.close()
  }

  // 使用 File System Access API 儲存 Word
  const generateAndSaveWord = async (fileHandle: FileSystemFileHandle) => {
    const doc = await generateWord()
    const blob = await Packer.toBlob(doc)
    const writable = await fileHandle.createWritable()
    await writable.write(blob)
    await writable.close()
  }

  // 儲存表單資料並新增版本記錄
  const handleSave = async () => {
    if (!activityId) {
      alert('無法儲存：缺少活動 ID')
      return
    }

    // 獲取當前使用者資訊
    const userData = localStorage.getItem('user')
    let userId = ''
    let userNickname = '使用者'
    if (userData) {
      try {
        const user = JSON.parse(userData)
        userId = user.id || user.account || ''
        userNickname = user.nickname || '使用者'
      } catch (e) {
        // 忽略解析錯誤
      }
    }

    if (!userId) {
      alert('無法儲存：請先登入')
      return
    }

    // 收集所有表單資料
    const formData = {
      userId,
      lessonPlanTitle,
      courseDomain,
      designer,
      unitName,
      schoolLevel,
      implementationGrade,
      teachingTimeLessons,
      teachingTimeMinutes,
      materialSource,
      teachingEquipment,
      learningObjectives,
      addedCoreCompetencies,
      addedLearningPerformances,
      addedLearningContents,
      activityRows,
      assessmentTools,
      references,
      checkedPerformances: Array.from(checkedPerformances),
      checkedContents: Array.from(checkedContents),
    }

    try {
      // 呼叫 API 儲存教案資料
      const response = await fetch(`/api/lesson-plans/${activityId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.details 
          ? `${errorData.error}: ${errorData.details}` 
          : errorData.error || '儲存失敗'
        console.error('API 錯誤回應:', errorData)
        throw new Error(errorMessage)
      }

      const result = await response.json()
      
      // 更新當前版本號
      if (result.data && result.data.versionNumber) {
        const versionNumber = `v${result.data.versionNumber}`
        setCurrentVersion(versionNumber)
        // 同時更新到 localStorage
        const storageKey = `currentVersion_${activityId}`
        localStorage.setItem(storageKey, versionNumber)
      }
      
      // 顯示成功訊息
      alert('教案資料儲存成功！')
      
      // 通知父組件版本已建立（如果需要的話）
      if (onVersionCreated) {
        const now = new Date()
        const year = now.getFullYear()
        const month = String(now.getMonth() + 1).padStart(2, '0')
        const day = String(now.getDate()).padStart(2, '0')
        const hours = String(now.getHours()).padStart(2, '0')
        const minutes = String(now.getMinutes()).padStart(2, '0')
        
        onVersionCreated(activityId, {
          versionNumber: `v${result.data.versionNumber}`,
          lastModifiedDate: `${year}/${month}/${day}`,
          lastModifiedTime: `${hours}:${minutes}`,
          lastModifiedUser: userNickname,
        })
      }
    } catch (error: any) {
      console.error('儲存教案資料錯誤:', error)
      alert(`儲存失敗：${error.message || '未知錯誤'}`)
    }
  }

  const tabs = [
    { id: 'objectives', label: '課程目標' },
    { id: 'activity', label: '活動與評量設計' },
    { id: 'specification', label: '雙向細目表' },
    { id: 'preview', label: '預覽教案' },
  ]

  const sidebarTabs = [
    { id: 'resources', label: '資源' },
    { id: 'activities', label: '共備活動' },
    { id: 'ideas', label: '想法牆' },
    { id: 'teamwork', label: '團隊分工' },
    { id: 'history', label: '活動歷程' },
    { id: 'management', label: '社群管理' },
  ]

  return (
    <div className="w-full min-h-screen bg-[#F5F3FA] flex flex-col md:flex-row">
      {/* 左側導航欄 - 手機版隱藏，桌面版顯示 */}
      <div className="hidden md:flex w-[80px] bg-[#FAFAFA] flex-col items-center py-8 gap-6 flex-shrink-0">
        {/* 導航選項 */}
        {sidebarTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              if (tab.id !== 'activities' && onSidebarClick) {
                onSidebarClick(tab.id)
              }
            }}
            className={`w-12 h-12 flex items-center justify-center rounded-lg transition-colors ${
              tab.id === 'activities'
                ? 'bg-purple-100 text-purple-600'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
            title={tab.label}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {tab.id === 'resources' && (
                // 資源圖標
                <>
                  <path
                    d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V9C21 7.89543 20.1046 7 19 7H13L11 5H5C3.89543 5 3 5.89543 3 7Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'activities' && (
                // 共備活動圖標 - 書本
                <>
                  <path
                    d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'ideas' && (
                // 想法牆圖標 - 發光的燈泡
                <>
                  <circle
                    cx="12"
                    cy="9"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 14.5C9 14.5 9 16 9 17C9 17.5 9.5 18 10 18H14C14.5 18 15 17.5 15 17C15 16 15 14.5 15 14.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 21H14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* 發光效果 */}
                  <path
                    d="M12 2V3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M19 9H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M4 9H5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M17.5 4.5L16.8 5.2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M6.5 4.5L7.2 5.2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </>
              )}
              {tab.id === 'teamwork' && (
                // 團隊分工圖標 - 剪貼板任務清單
                <>
                  {/* 剪貼板主體 */}
                  <path
                    d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* 剪貼板頂部夾子 */}
                  <path
                    d="M9 3C9 2.44772 9.44772 2 10 2H14C14.5523 2 15 2.44772 15 3V5H9V3Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* 清單項目線條 */}
                  <path
                    d="M9 9H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 12H15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M9 15H13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  {/* 勾選標記 */}
                  <path
                    d="M9 17L11 19L15 15"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'history' && (
                // 活動歷程圖標
                <>
                  <path
                    d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 13H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 17H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 9H9H8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
              {tab.id === 'management' && (
                // 社群管理圖標
                <>
                  <path
                    d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="9"
                    cy="7"
                    r="4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}
            </svg>
          </button>
        ))}
      </div>

      {/* 主要內容區 */}
      <div className="flex-1 flex flex-col">
        {/* 返回按鈕和活動名稱 */}
        <div className="px-4 sm:px-6 md:px-16 pt-6 md:pt-8 pb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-gray-600"
            >
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className="text-lg font-semibold text-gray-800">{activityName}</h2>
          </button>
        </div>

        {/* 主要內容區 */}
        <div className="flex-1 bg-[#FEFBFF] px-4 sm:px-6 md:px-12 py-4 md:py-8 overflow-y-auto">
          <div className="flex gap-8">
            {/* 左側表單區域 */}
            <div className="flex-1 max-w-3xl">
              {/* 標題 */}
              <h1 className="text-2xl font-bold text-[#6D28D9] mb-6 flex items-center gap-3">
                {activeTab === 'objectives' && (
                  <>
                    <span>課程目標</span>
                    {currentVersion && (
                      <span className="text-lg font-normal text-gray-600">({currentVersion})</span>
                    )}
                  </>
                )}
                {activeTab === 'activity' && (
                  <>
                    <span>活動與評量設計</span>
                    {currentVersion && (
                      <span className="text-lg font-normal text-gray-600">({currentVersion})</span>
                    )}
                  </>
                )}
                {activeTab === 'specification' && '雙向細目表'}
                {activeTab === 'preview' && '預覽教案'}
              </h1>

              {/* 標籤頁 */}
              <div className="flex gap-4 mb-8 border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-[#6D28D9] border-b-2 border-[#6D28D9]'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* 表單內容 */}
              {activeTab === 'objectives' && (
                <div className="space-y-6">
                  {/* 教案標題 */}
                  <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    教案標題
                  </label>
                  <input
                    type="text"
                    value={lessonPlanTitle}
                    onChange={(e) => setLessonPlanTitle(e.target.value)}
                    placeholder="輸入教案標題"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  />
                </div>

          {/* 課程領域和設計者 */}
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                課程領域
              </label>
              <div className="flex gap-4">
                {['國文', '數學', '英文', '自然', '社會'].map((domain) => (
                  <label key={domain} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="courseDomain"
                      value={domain}
                      checked={courseDomain === domain}
                      onChange={(e) => setCourseDomain(e.target.value)}
                      className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">{domain}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                設計者
              </label>
              <input
                type="text"
                value={designer}
                onChange={(e) => setDesigner(e.target.value)}
                placeholder="輸入設計者"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
              />
            </div>
          </div>

          {/* 單元名稱 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              單元名稱
            </label>
            <input
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              placeholder="輸入單元名稱"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
            />
          </div>

          {/* 學段和實施年級 */}
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                學段
              </label>
              <select
                value={schoolLevel}
                onChange={(e) => setSchoolLevel(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
              >
                <option value="">請選擇學段</option>
                <option value="國小">國小</option>
                <option value="國中">國中</option>
                <option value="高中（高職）">高中（高職）</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                實施年級
              </label>
              <select
                value={implementationGrade}
                onChange={(e) => setImplementationGrade(e.target.value)}
                disabled={!schoolLevel}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">請選擇年級</option>
                {getGradeOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 授課時間 */}
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-gray-700 font-medium mb-2">
                授課時間
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={teachingTimeLessons}
                  onChange={(e) => setTeachingTimeLessons(e.target.value)}
                  placeholder="節數"
                  className="w-20 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                />
                <span className="text-gray-700">節課,共</span>
                <input
                  type="text"
                  value={teachingTimeMinutes}
                  onChange={(e) => setTeachingTimeMinutes(e.target.value)}
                  placeholder="分鐘"
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                />
                <span className="text-gray-700">分鐘</span>
              </div>
            </div>
          </div>

          {/* 核心素養 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              核心素養
            </label>
            <div className="space-y-3">
              {/* 第一個欄位：選擇 A、B、C */}
              {/* 如果沒有選擇學段，不顯示選項 */}
              {schoolLevel ? (
                <div className="flex gap-2">
                  <select
                    value={coreCompetencyCategory}
                    onChange={(e) => setCoreCompetencyCategory(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇</option>
                    {courseDomain === '英文' && englishCoreCompetencies.length > 0 ? (
                      // 英文科目：從 API 載入的資料顯示
                      englishCoreCompetencies.map((mainCat) => (
                        <option key={mainCat.mainCategory} value={mainCat.mainCategory}>
                          {mainCat.mainCategory} {mainCat.mainCategoryName}
                        </option>
                      ))
                    ) : courseDomain === '國文' && chineseCoreCompetencies.length > 0 ? (
                      // 國文科目：從 API 載入的資料顯示
                      chineseCoreCompetencies.map((mainCat) => (
                        <option key={mainCat.mainCategory} value={mainCat.mainCategory}>
                          {mainCat.mainCategory} {mainCat.mainCategoryName}
                        </option>
                      ))
                    ) : courseDomain === '數學' && mathCoreCompetencies.length > 0 ? (
                      // 數學科目：從 API 載入的資料顯示
                      mathCoreCompetencies.map((mainCat) => (
                        <option key={mainCat.mainCategory} value={mainCat.mainCategory}>
                          {mainCat.mainCategory} {mainCat.mainCategoryName}
                        </option>
                      ))
                    ) : courseDomain === '社會' && socialCoreCompetencies.length > 0 ? (
                      // 社會科目：從 API 載入的資料顯示
                      socialCoreCompetencies.map((mainCat) => (
                        <option key={mainCat.mainCategory} value={mainCat.mainCategory}>
                          {mainCat.mainCategory} {mainCat.mainCategoryName}
                        </option>
                      ))
                    ) : courseDomain === '自然' && naturalCoreCompetencies.length > 0 ? (
                      // 自然科目：從 API 載入的資料顯示
                      naturalCoreCompetencies.map((mainCat) => (
                        <option key={mainCat.mainCategory} value={mainCat.mainCategory}>
                          {mainCat.mainCategory} {mainCat.mainCategoryName}
                        </option>
                      ))
                    ) : (
                      // 非英文/國文/數學/社會/自然科目：顯示預設選項
                      <>
                        <option value="A">A 自主行動</option>
                        <option value="B">B 溝通互動</option>
                        <option value="C">C 社會參與</option>
                      </>
                    )}
                  </select>
                </div>
              ) : (
                <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                  請先選擇學段
                </div>
              )}
              {/* 第二個欄位：根據第一個欄位選擇顯示 A1/A2/A3 或 B1/B2/B3 或 C1/C2/C3 */}
              {coreCompetencyCategory && schoolLevel && (
                <div className="flex gap-2">
                  <select
                    value={coreCompetencyItem}
                    onChange={(e) => setCoreCompetencyItem(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇</option>
                    {coreCompetencyCategory &&
                      Object.entries(
                        coreCompetencyData[coreCompetencyCategory as keyof typeof coreCompetencyData].items
                      ).map(([key, item]) => (
                        <option key={key} value={key}>
                          {key} {item.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
               {/* 第三個欄位：自動帶入說明 */}
               {coreCompetencyItem && (
                 <div className="space-y-2">
                   <div
                     contentEditable
                     suppressContentEditableWarning
                     onBlur={(e) => {
                       const text = e.currentTarget.innerText
                       setCoreCompetencyDescription(text)
                     }}
                     onInput={(e) => {
                       const text = e.currentTarget.innerText
                       setCoreCompetencyDescription(text)
                     }}
                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 min-h-[150px] whitespace-pre-wrap"
                     style={{ 
                       minHeight: '150px',
                       whiteSpace: 'pre-wrap'
                     }}
                     dangerouslySetInnerHTML={{
                       __html: coreCompetencyDescription
                         ? (() => {
                             let html = coreCompetencyDescription
                             
                             // 先提取編號（如果描述中已經有編號）
                             let code = html.match(/(英-[EJ]-[A-C][1-3]|英S-U-[A-C][1-3]|國-[EJ]-[A-C][1-3]|國S-U-[A-C][1-3]|國-S-U-[A-C][1-3]|數-[EJ]-[A-C][1-3]|數S-U-[A-C][1-3]|數-S-U-[A-C][1-3]|社-[EJ]-[A-C][1-3]|社-U-[A-C][1-3]|自-[EJ]-[A-C][1-3]|自S-U-[A-C][1-3])/)?.[1] || null
                             
                             // 如果沒有編號，但描述中有「國民小學教育(E)：」等標籤，需要根據學段和選擇的項目來推斷編號
                             if (!code && (courseDomain === '英文' || courseDomain === '國文' || courseDomain === '數學' || courseDomain === '社會' || courseDomain === '自然') && schoolLevel && coreCompetencyCategory && coreCompetencyItem) {
                               const apiSchoolLevel = schoolLevel === '高中（高職）' ? '高中' : schoolLevel
                               let prefix = ''
                               if (courseDomain === '英文') {
                                 if (apiSchoolLevel === '國小') prefix = '英-E-'
                                 else if (apiSchoolLevel === '國中') prefix = '英-J-'
                                 else if (apiSchoolLevel === '高中') prefix = '英S-U-'
                               } else if (courseDomain === '國文') {
                                 if (apiSchoolLevel === '國小') prefix = '國-E-'
                                 else if (apiSchoolLevel === '國中') prefix = '國-J-'
                                 else if (apiSchoolLevel === '高中') prefix = '國S-U-'
                               } else if (courseDomain === '數學') {
                                 if (apiSchoolLevel === '國小') prefix = '數-E-'
                                 else if (apiSchoolLevel === '國中') prefix = '數-J-'
                                 else if (apiSchoolLevel === '高中') prefix = '數S-U-'
                               } else if (courseDomain === '社會') {
                                 if (apiSchoolLevel === '國小') prefix = '社-E-'
                                 else if (apiSchoolLevel === '國中') prefix = '社-J-'
                                 else if (apiSchoolLevel === '高中') prefix = '社-U-'
                               } else if (courseDomain === '自然') {
                                 if (apiSchoolLevel === '國小') prefix = '自-E-'
                                 else if (apiSchoolLevel === '國中') prefix = '自-J-'
                                 else if (apiSchoolLevel === '高中') prefix = '自S-U-'
                               }
                               code = prefix + coreCompetencyItem
                             }
                             
                             // 將「國民小學教育(E)：」等標籤替換為編號
                             if (code) {
                               html = html.replace(/國民小學教育\(E\)：/g, `${code}：`)
                               html = html.replace(/國民中學教育\(J\)：/g, `${code}：`)
                               html = html.replace(/普通型高級中等學校教育\(S-U\)：/g, `${code}：`)
                               html = html.replace(/高級中等學校教育\(U\)：/g, `${code}：`)
                             }
                             
                             // 格式化顯示
                             html = html.replace(/總綱核心素養項目說明：/g, '<span style="color: #1e3a8a; font-weight: 600;">總綱核心素養項目說明：</span>')
                             
                             // 將編號標籤（如：英-E-A1：、國-E-A1：、數-E-A1：、社-E-A1：或 自-E-A1：）改為藍色，與「總綱核心素養項目說明：」一樣的顏色和大小
                             html = html.replace(/(英-[EJ]-[A-C][1-3]|英S-U-[A-C][1-3]|國-[EJ]-[A-C][1-3]|國S-U-[A-C][1-3]|國-S-U-[A-C][1-3]|數-[EJ]-[A-C][1-3]|數S-U-[A-C][1-3]|數-S-U-[A-C][1-3]|社-[EJ]-[A-C][1-3]|社-U-[A-C][1-3]|自-[EJ]-[A-C][1-3]|自S-U-[A-C][1-3])：/g, '<span style="color: #1e3a8a; font-weight: 600;">$1：</span>')
                             
                             // 移除內容中重複的編號（在文字前面的編號）
                             // 如果內容開頭有編號，移除它（但保留標籤位置的編號）
                             if (code) {
                               const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                               // 移除標籤後內容開頭的編號（格式：標籤<br>編號 文字）
                               html = html.replace(new RegExp(`(<span style="color: #1e3a8a; font-weight: 600;">${escapedCode}：</span>\\s*<br>\\s*)${escapedCode}\\s+`, 'g'), '$1')
                             }
                             
                             html = html.replace(/\n/g, '<br>')
                             return html
                           })()
                         : ''
                     }}
                   />
                   {/* 加入按鈕 */}
                   <div className="flex justify-end">
                     <button
                       onClick={() => {
                         if (coreCompetencyDescription.trim()) {
                           setAddedCoreCompetencies([
                             ...addedCoreCompetencies,
                             {
                               content: coreCompetencyDescription
                             }
                           ])
                           // 重置選擇
                           setCoreCompetencyCategory('')
                           setCoreCompetencyItem('')
                           setCoreCompetencyDescription('')
                         }
                       }}
                       className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                     >
                       加入
                     </button>
                   </div>
                 </div>
               )}
               {/* 顯示已加入的核心素養 */}
               {addedCoreCompetencies.length > 0 && (
                 <div className="mt-4 space-y-3">
                   <label className="block text-gray-700 font-medium text-sm">
                    已加入的核心素養：
                   </label>
                   {addedCoreCompetencies.map((item, idx) => (
                     <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-white relative">
                       <button
                         onClick={() => {
                           setAddedCoreCompetencies(addedCoreCompetencies.filter((_, i) => i !== idx))
                         }}
                         className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                       >
                         刪除
                       </button>
                       <div
                         className="text-sm text-gray-700 pr-16 whitespace-pre-wrap"
                         dangerouslySetInnerHTML={{
                           __html: (() => {
                             let html = item.content
                             // 先提取編號（如果有的話）
                             const codeMatch = html.match(/(英-[EJ]-[A-C][1-3]|英S-U-[A-C][1-3]|國-[EJ]-[A-C][1-3]|國S-U-[A-C][1-3]|國-S-U-[A-C][1-3]|數-[EJ]-[A-C][1-3]|數S-U-[A-C][1-3]|數-S-U-[A-C][1-3]|社-[EJ]-[A-C][1-3]|社-U-[A-C][1-3]|自-[EJ]-[A-C][1-3]|自S-U-[A-C][1-3])/)
                             const code = codeMatch ? codeMatch[1] : null
                             
                             // 將「國民小學教育(E)：」等標籤替換為編號
                             if (code) {
                               html = html.replace(/國民小學教育\(E\)：/g, `${code}：`)
                               html = html.replace(/國民中學教育\(J\)：/g, `${code}：`)
                               html = html.replace(/普通型高級中等學校教育\(S-U\)：/g, `${code}：`)
                               html = html.replace(/高級中等學校教育\(U\)：/g, `${code}：`)
                             }
                             
                             // 格式化顯示
                             html = html.replace(/總綱核心素養項目說明：/g, '<span style="color: #1e3a8a; font-weight: 600;">總綱核心素養項目說明：</span>')
                             // 將編號（如：英-E-A1：、國-E-A1：、數-E-A1：、社-E-A1：或 自-E-A1：）改為藍色，與「總綱核心素養項目說明：」一樣的顏色和大小
                             html = html.replace(/(英-[EJ]-[A-C][1-3]|英S-U-[A-C][1-3]|國-[EJ]-[A-C][1-3]|國S-U-[A-C][1-3]|國-S-U-[A-C][1-3]|數-[EJ]-[A-C][1-3]|數S-U-[A-C][1-3]|數-S-U-[A-C][1-3]|社-[EJ]-[A-C][1-3]|社-U-[A-C][1-3]|自-[EJ]-[A-C][1-3]|自S-U-[A-C][1-3])：/g, '<span style="color: #1e3a8a; font-weight: 600;">$1：</span>')
                             // 移除內容中重複的編號（在文字前面的編號）
                             if (code) {
                               const escapedCode = code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
                               html = html.replace(new RegExp(`(<span style="color: #1e3a8a; font-weight: 600;">${escapedCode}：</span>\\s*<br>\\s*)${escapedCode}\\s+`, 'g'), '$1')
                               html = html.replace(new RegExp(`(${escapedCode}：\\s*<br>\\s*)${escapedCode}\\s+`, 'g'), '$1')
                             }
                             html = html.replace(/\n/g, '<br>')
                             return html
                           })()
                         }}
                       />
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>

          {/* 學習表現 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              學習表現
            </label>
            
            {/* 如果沒有選擇學段，不顯示選項 */}
            {!schoolLevel ? (
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                請先選擇學段
              </div>
            ) : (
            /* 根據課程領域顯示不同內容 */
            courseDomain === '數學' ? (
              (schoolLevel === '國中' || schoolLevel === '高中（高職）') ? (
                // === 數學領域的學習表現（國中/高中）- 兩層下拉選單 ===
                <div className="space-y-3">
                  {/* 第一層：選擇項目 */}
                  <div className="flex gap-2">
                    <select
                      value={mathMHCategory}
                      onChange={(e) => {
                        setMathMHCategory(e.target.value)
                        setSelectedMathMHCodes([])
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                    >
                      <option value="">請選擇項目</option>
                      {mathMiddleHighPerformances.categories.map((cat) => (
                        <option key={cat.category} value={cat.category}>
                          {cat.categoryName}（{cat.category}）
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 第二層：選擇學習表現 */}
                  {mathMHCategory && (() => {
                    const selectedCategory = mathMiddleHighPerformances.categories.find(
                      c => c.category === mathMHCategory
                    )
                    const performances = selectedCategory?.performances || []

                    return performances.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">
                          選擇學習表現：
                        </label>
                        <select
                          multiple
                          size={Math.min(performances.length, 8)}
                          value={selectedMathMHCodes}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value)
                            setSelectedMathMHCodes(selected)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          {performances.map((item) => (
                            <option key={item.id} value={item.code}>
                              {item.code}: {item.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">此項目無學習表現</div>
                    )
                  })()}

                  {/* 加入按鈕 */}
                  {selectedMathMHCodes.length > 0 && mathMHCategory && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const selectedCategory = mathMiddleHighPerformances.categories.find(
                            c => c.category === mathMHCategory
                          )
                          const performances = selectedCategory?.performances || []
                          const selectedPerformances = performances.filter(p => 
                            selectedMathMHCodes.includes(p.code)
                          )
                          
                          if (selectedPerformances.length > 0) {
                            setAddedLearningPerformances([
                              ...addedLearningPerformances,
                              {
                                content: selectedPerformances.map(p => ({
                                  code: p.code,
                                  description: p.description
                                }))
                              }
                            ])
                            setMathMHCategory('')
                            setSelectedMathMHCodes([])
                          }
                        }}
                        className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                      >
                        加入
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // === 數學領域的學習表現（國小）===
              <div className="space-y-3">
                {/* 第一個欄位：選擇類別 */}
                <div className="flex gap-2">
                  <select
                    value={mathPerformanceCategory}
                    onChange={(e) => {
                      setMathPerformanceCategory(e.target.value)
                      // 切換類別時重置相關狀態
                      setMathPerformanceStage('')
                      setSelectedMathCodes([])
                      setMathPerformanceOther('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇類別</option>
                    <option value="n">數與量（n）</option>
                    <option value="s">空間與形狀（s）</option>
                    <option value="g">坐標幾何（g）</option>
                    <option value="r">關係（r）</option>
                    <option value="a">代數（a）</option>
                    <option value="f">函數（f）</option>
                    <option value="d">資料與不確定性（d）</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 第二個欄位：條件渲染（下拉選單或文字輸入框） */}
                {mathPerformanceCategory && (
                  <div className="flex gap-2">
                    {mathPerformanceCategory === '其他' ? (
                      <textarea
                        value={mathPerformanceOther}
                        onChange={(e) => setMathPerformanceOther(e.target.value)}
                        placeholder="請輸入自定義學習表現內容"
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    ) : (
                      <select
                        value={mathPerformanceStage}
                        onChange={(e) => setMathPerformanceStage(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        <option value="">請選擇學習階段</option>
                        <option value="I">國民小學低年級（I）</option>
                        <option value="II">國民小學中年級（II）</option>
                        <option value="III">國民小學高年級（III）</option>
                      </select>
                    )}
                  </div>
                )}

                {/* 第三個欄位：選擇學習表現（選擇「其他」時不顯示） */}
                {mathPerformanceCategory && mathPerformanceCategory !== '其他' && mathPerformanceStage && (() => {
                  const filteredPerformances = mathPerformances.filter(p => 
                    p.category === mathPerformanceCategory && p.stage === mathPerformanceStage
                  )
                  
                  return filteredPerformances.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium text-sm">
                        選擇學習表現：
                      </label>
                      <select
                        multiple
                        size={Math.min(filteredPerformances.length, 8)}
                        value={selectedMathCodes}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setSelectedMathCodes(selected)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        {filteredPerformances.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code}: {item.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">此類別與階段無學習表現</div>
                  )
                })()}

                {/* 加入按鈕：支持自定義內容 */}
                {((mathPerformanceCategory === '其他' && mathPerformanceOther.trim()) || 
                  (selectedMathCodes.length > 0 && mathPerformanceCategory && mathPerformanceStage)) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (mathPerformanceCategory === '其他') {
                          // 處理自定義內容
                          setAddedLearningPerformances([
                            ...addedLearningPerformances,
                            {
                              content: [{
                                code: '自訂',
                                description: mathPerformanceOther
                              }]
                            }
                          ])
                          setMathPerformanceCategory('')
                          setMathPerformanceOther('')
                        } else {
                          // 處理從列表選擇的內容
                          const selectedPerformances = mathPerformances.filter(p => 
                            selectedMathCodes.includes(p.code)
                          )
                          if (selectedPerformances.length > 0) {
                            setAddedLearningPerformances([
                              ...addedLearningPerformances,
                              {
                                content: selectedPerformances.map(p => ({
                                  code: p.code,
                                  description: p.description
                                }))
                              }
                            ])
                            setMathPerformanceCategory('')
                            setMathPerformanceStage('')
                            setSelectedMathCodes([])
                          }
                        }
                      }}
                      className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      加入
                    </button>
                  </div>
                )}
              </div>
              )
            ) : courseDomain === '國文' ? (
              (schoolLevel === '國中' || schoolLevel === '高中（高職）') ? (
                // === 國文領域的學習表現（國中/高中）- 兩層下拉選單 ===
                <div className="space-y-3">
                  {/* 第一層：選擇大分類 */}
                  <div className="flex gap-2">
                    <select
                      value={chineseMHMainCategory}
                      onChange={(e) => {
                        setChineseMHMainCategory(e.target.value)
                        setSelectedChineseMHCodes([])
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                    >
                      <option value="">請選擇類別</option>
                      {chineseMiddleHighPerformances.categories.map((cat) => (
                        <option key={cat.mainCategory} value={cat.mainCategory}>
                          {cat.mainCategoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 第二層：選擇學習表現 */}
                  {chineseMHMainCategory && (() => {
                    const selectedCategory = chineseMiddleHighPerformances.categories.find(
                      c => c.mainCategory === parseInt(chineseMHMainCategory)
                    )
                    const performances = selectedCategory?.performances || []

                    return performances.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">
                          選擇學習表現：
                        </label>
                        <select
                          multiple
                          size={Math.min(performances.length, 8)}
                          value={selectedChineseMHCodes}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value)
                            setSelectedChineseMHCodes(selected)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          {performances.map((item) => (
                            <option key={item.id} value={item.code}>
                              {item.code}: {item.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">此類別無學習表現</div>
                    )
                  })()}

                  {/* 加入按鈕 */}
                  {selectedChineseMHCodes.length > 0 && chineseMHMainCategory && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const selectedCategory = chineseMiddleHighPerformances.categories.find(
                            c => c.mainCategory === parseInt(chineseMHMainCategory)
                          )
                          const performances = selectedCategory?.performances || []
                          const selectedPerformances = performances.filter(p => 
                            selectedChineseMHCodes.includes(p.code)
                          )
                          
                          if (selectedPerformances.length > 0) {
                            setAddedLearningPerformances([
                              ...addedLearningPerformances,
                              {
                                content: selectedPerformances.map(p => ({
                                  code: p.code,
                                  description: p.description
                                }))
                              }
                            ])
                            setChineseMHMainCategory('')
                            setSelectedChineseMHCodes([])
                          }
                        }}
                        className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                      >
                        加入
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // === 國文領域的學習表現（國小）===
              <div className="space-y-3">
                {/* 第一個欄位：選擇類別 */}
                <div className="flex gap-2">
                  <select
                    value={chinesePerformanceCategory}
                    onChange={(e) => {
                      setChinesePerformanceCategory(e.target.value)
                      setChinesePerformanceStage('')
                      setSelectedChineseCodes([])
                      setChinesePerformanceOther('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇類別</option>
                    <option value="1">聆聽（1）</option>
                    <option value="2">口語表達（2）</option>
                    <option value="3">標音符號與運用（3）</option>
                    <option value="4">識字與寫字（4）</option>
                    <option value="5">閱讀（5）</option>
                    <option value="6">寫作（6）</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 第二個欄位：條件渲染（下拉選單或文字輸入框） */}
                {chinesePerformanceCategory && (
                  <div className="flex gap-2">
                    {chinesePerformanceCategory === '其他' ? (
                      <textarea
                        value={chinesePerformanceOther}
                        onChange={(e) => setChinesePerformanceOther(e.target.value)}
                        placeholder="請輸入自定義學習表現內容"
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    ) : (
                      <select
                        value={chinesePerformanceStage}
                        onChange={(e) => setChinesePerformanceStage(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        <option value="">請選擇學習階段</option>
                        <option value="I">第一學習階段（I）- 國民小學1-2年級</option>
                        <option value="II">第二學習階段（II）- 國民小學3-4年級</option>
                        <option value="III">第三學習階段（III）- 國民小學5-6年級</option>
                      </select>
                    )}
                  </div>
                )}

                {/* 第三個欄位：選擇學習表現（選擇「其他」時不顯示） */}
                {chinesePerformanceCategory && chinesePerformanceCategory !== '其他' && chinesePerformanceStage && (() => {
                  const filteredPerformances = chinesePerformances.filter(p => 
                    p.category === parseInt(chinesePerformanceCategory) && p.stage === chinesePerformanceStage
                  )
                  
                  return filteredPerformances.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium text-sm">
                        選擇學習表現：
                      </label>
                      <select
                        multiple
                        size={Math.min(filteredPerformances.length, 8)}
                        value={selectedChineseCodes}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setSelectedChineseCodes(selected)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        {filteredPerformances.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code}: {item.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">此類別與階段無學習表現</div>
                  )
                })()}

                {/* 加入按鈕：支持自定義內容 */}
                {((chinesePerformanceCategory === '其他' && chinesePerformanceOther.trim()) || 
                  (selectedChineseCodes.length > 0 && chinesePerformanceCategory && chinesePerformanceStage)) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (chinesePerformanceCategory === '其他') {
                          setAddedLearningPerformances([
                            ...addedLearningPerformances,
                            {
                              content: [{
                                code: '自訂',
                                description: chinesePerformanceOther
                              }]
                            }
                          ])
                          setChinesePerformanceCategory('')
                          setChinesePerformanceOther('')
                        } else {
                          const selectedPerformances = chinesePerformances.filter(p => 
                            selectedChineseCodes.includes(p.code)
                          )
                          if (selectedPerformances.length > 0) {
                            setAddedLearningPerformances([
                              ...addedLearningPerformances,
                              {
                                content: selectedPerformances.map(p => ({
                                  code: p.code,
                                  description: p.description
                                }))
                              }
                            ])
                            setChinesePerformanceCategory('')
                            setChinesePerformanceStage('')
                            setSelectedChineseCodes([])
                          }
                        }
                      }}
                      className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      加入
                    </button>
                  </div>
                )}
              </div>
              )
            ) : courseDomain === '英文' ? (
              (schoolLevel === '國中' || schoolLevel === '高中（高職）') ? (
                // === 英文領域的學習表現（國中/高中）- 兩層下拉選單 ===
                <div className="space-y-3">
                  {/* 第一層：選擇大分類 */}
                  <div className="flex gap-2">
                    <select
                      value={englishMHMainCategory}
                      onChange={(e) => {
                        setEnglishMHMainCategory(e.target.value)
                        setSelectedEnglishMHCodes([])
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                    >
                      <option value="">請選擇類別</option>
                      {englishMiddleHighPerformances.categories.map((cat) => (
                        <option key={cat.mainCategory} value={cat.mainCategory}>
                          {cat.mainCategoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 第二層：選擇學習表現 */}
                  {englishMHMainCategory && (() => {
                    const selectedCategory = englishMiddleHighPerformances.categories.find(
                      c => c.mainCategory === parseInt(englishMHMainCategory)
                    )
                    const performances = selectedCategory?.performances || []

                    return performances.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">
                          選擇學習表現：
                        </label>
                        <select
                          multiple
                          size={Math.min(performances.length, 8)}
                          value={selectedEnglishMHCodes}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value)
                            setSelectedEnglishMHCodes(selected)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          {performances.map((item) => (
                            <option key={item.id} value={item.code}>
                              {item.code}: {item.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">此類別無學習表現</div>
                    )
                  })()}

                  {/* 加入按鈕 */}
                  {selectedEnglishMHCodes.length > 0 && englishMHMainCategory && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const selectedCategory = englishMiddleHighPerformances.categories.find(
                            c => c.mainCategory === parseInt(englishMHMainCategory)
                          )
                          const performances = selectedCategory?.performances || []
                          const selectedPerformances = performances.filter(p => 
                            selectedEnglishMHCodes.includes(p.code)
                          )
                          
                          if (selectedPerformances.length > 0) {
                            setAddedLearningPerformances([
                              ...addedLearningPerformances,
                              {
                                content: selectedPerformances.map(p => ({
                                  code: p.code,
                                  description: p.description
                                }))
                              }
                            ])
                            setEnglishMHMainCategory('')
                            setSelectedEnglishMHCodes([])
                          }
                        }}
                        className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                      >
                        加入
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // === 英文領域的學習表現（國小）===
              <div className="space-y-3">
                {/* 第一個欄位：選擇類別 */}
                <div className="flex gap-2">
                  <select
                    value={englishPerformanceCategory}
                    onChange={(e) => {
                      setEnglishPerformanceCategory(e.target.value)
                      setEnglishPerformanceStage('')
                      setSelectedEnglishCodes([])
                      setEnglishPerformanceOther('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇類別</option>
                    <option value="1">（一）語言能力（聽）</option>
                    <option value="2">（二）語言能力（說）</option>
                    <option value="3">（三）語言能力（讀）</option>
                    <option value="4">（四）語言能力（寫）</option>
                    <option value="5">（五）語言能力（聽說讀寫綜合應用能力）</option>
                    <option value="6">（六）學習興趣與態度</option>
                    <option value="7">（七）學習方法與策略</option>
                    <option value="8">（八）文化理解</option>
                    <option value="9">（九）邏輯思考、判斷與創造力</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 第二個欄位：條件渲染（下拉選單或文字輸入框） */}
                {englishPerformanceCategory && (
                  <div className="flex gap-2">
                    {englishPerformanceCategory === '其他' ? (
                      <textarea
                        value={englishPerformanceOther}
                        onChange={(e) => setEnglishPerformanceOther(e.target.value)}
                        placeholder="請輸入自定義學習表現內容"
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    ) : (
                      <select
                        value={englishPerformanceStage}
                        onChange={(e) => setEnglishPerformanceStage(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        <option value="">請選擇學習階段</option>
                        <option value="II">第二學習階段（II）- 國民小學3-4年級</option>
                        <option value="III">第三學習階段（III）- 國民小學5-6年級</option>
                      </select>
                    )}
                  </div>
                )}

                {/* 第三個欄位：選擇學習表現（選擇「其他」時不顯示） */}
                {englishPerformanceCategory && englishPerformanceCategory !== '其他' && englishPerformanceStage && (() => {
                  const filteredPerformances = englishPerformances.filter(p => 
                    p.category === parseInt(englishPerformanceCategory) && p.stage === englishPerformanceStage
                  )
                  
                  return filteredPerformances.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium text-sm">
                        選擇學習表現：
                      </label>
                      <select
                        multiple
                        size={Math.min(filteredPerformances.length, 8)}
                        value={selectedEnglishCodes}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setSelectedEnglishCodes(selected)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        {filteredPerformances.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code}: {item.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">此類別與階段無學習表現</div>
                  )
                })()}

                {/* 加入按鈕：支持自定義內容 */}
                {((englishPerformanceCategory === '其他' && englishPerformanceOther.trim()) || 
                  (selectedEnglishCodes.length > 0 && englishPerformanceCategory && englishPerformanceStage)) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (englishPerformanceCategory === '其他') {
                          setAddedLearningPerformances([
                            ...addedLearningPerformances,
                            {
                              content: [{
                                code: '自訂',
                                description: englishPerformanceOther
                              }]
                            }
                          ])
                          setEnglishPerformanceCategory('')
                          setEnglishPerformanceOther('')
                        } else {
                          const selectedPerformances = englishPerformances.filter(p => 
                            selectedEnglishCodes.includes(p.code)
                          )
                          if (selectedPerformances.length > 0) {
                            setAddedLearningPerformances([
                              ...addedLearningPerformances,
                              {
                                content: selectedPerformances.map(p => ({
                                  code: p.code,
                                  description: p.description
                                }))
                              }
                            ])
                            setEnglishPerformanceCategory('')
                            setEnglishPerformanceStage('')
                            setSelectedEnglishCodes([])
                          }
                        }
                      }}
                      className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      加入
                    </button>
                  </div>
                )}
              </div>
              )
            ) : courseDomain === '社會' ? (
              (schoolLevel === '國中' || schoolLevel === '高中（高職）') ? (
                // === 社會領域的學習表現（國中/高中）- 三層下拉選單 ===
                <div className="space-y-3">
                  {/* 第一層：選擇構面 */}
                  <div className="flex gap-2">
                    <select
                      value={socialMHDimension}
                      onChange={(e) => setSocialMHDimension(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                    >
                      <option value="">請選擇構面</option>
                      {socialMiddleHighPerformances.dimensions.map((dim) => (
                        <option key={dim.dimension} value={dim.dimension}>
                          {dim.dimension}. {dim.dimensionName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 第二層：選擇項目 */}
                  {socialMHDimension && (() => {
                    const selectedDimension = socialMiddleHighPerformances.dimensions.find(
                      d => d.dimension === socialMHDimension
                    )
                    return selectedDimension ? (
                      <div className="flex gap-2">
                        <select
                          value={socialMHCategory}
                          onChange={(e) => setSocialMHCategory(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          <option value="">請選擇項目</option>
                          {selectedDimension.categories.map((cat) => (
                            <option key={cat.category} value={cat.category}>
                              {cat.category}. {cat.categoryName}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null
                  })()}

                  {/* 第三層：選擇學習表現 */}
                  {socialMHDimension && socialMHCategory && (() => {
                    const selectedDimension = socialMiddleHighPerformances.dimensions.find(
                      d => d.dimension === socialMHDimension
                    )
                    const selectedCategory = selectedDimension?.categories.find(
                      c => c.category === socialMHCategory
                    )
                    const performances = selectedCategory?.performances || []

                    return performances.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">
                          選擇學習表現：
                        </label>
                        <select
                          multiple
                          size={Math.min(performances.length, 8)}
                          value={selectedSocialMHCodes}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value)
                            setSelectedSocialMHCodes(selected)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          {performances.map((item) => (
                            <option key={item.id} value={item.code}>
                              {item.code}: {item.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">此構面項目無學習表現</div>
                    )
                  })()}

                  {/* 加入按鈕 */}
                  {selectedSocialMHCodes.length > 0 && socialMHDimension && socialMHCategory && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const selectedDimension = socialMiddleHighPerformances.dimensions.find(
                            d => d.dimension === socialMHDimension
                          )
                          const selectedCategory = selectedDimension?.categories.find(
                            c => c.category === socialMHCategory
                          )
                          const performances = selectedCategory?.performances || []
                          const selectedPerformances = performances.filter(p => 
                            selectedSocialMHCodes.includes(p.code)
                          )
                          
                          if (selectedPerformances.length > 0) {
                            setAddedLearningPerformances([
                              ...addedLearningPerformances,
                              {
                                content: selectedPerformances.map(p => ({
                                  code: p.code,
                                  description: p.description
                                }))
                              }
                            ])
                            setSocialMHDimension('')
                            setSocialMHCategory('')
                            setSelectedSocialMHCodes([])
                          }
                        }}
                        className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                      >
                        加入
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // === 社會領域的學習表現（國小）===
              <div className="space-y-3">
                {/* 第一個欄位：選擇構面項目 */}
                <div className="flex gap-2">
                  <select
                    value={socialPerformanceDimensionItem}
                    onChange={(e) => {
                      setSocialPerformanceDimensionItem(e.target.value)
                      setSocialPerformanceStage('')
                      setSelectedSocialCodes([])
                      setSocialPerformanceOther('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇構面項目</option>
                    <option value="1a">1a - 理解及思辯-覺察說明</option>
                    <option value="1b">1b - 理解及思辯-分析詮釋</option>
                    <option value="1c">1c - 理解及思辯-判斷創新</option>
                    <option value="2a">2a - 態度及價值-敏覺關懷</option>
                    <option value="2b">2b - 態度及價值-同理尊重</option>
                    <option value="2c">2c - 態度及價值-自省珍視</option>
                    <option value="3a">3a - 實作及參與-問題發現</option>
                    <option value="3b">3b - 實作及參與-資料蒐整與應用</option>
                    <option value="3c">3c - 實作及參與-溝通合作</option>
                    <option value="3d">3d - 實作及參與-規劃執行</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 第二個欄位：條件渲染（下拉選單或文字輸入框） */}
                {socialPerformanceDimensionItem && (
                  <div className="flex gap-2">
                    {socialPerformanceDimensionItem === '其他' ? (
                      <textarea
                        value={socialPerformanceOther}
                        onChange={(e) => setSocialPerformanceOther(e.target.value)}
                        placeholder="請輸入自定義學習表現內容"
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    ) : (
                      <select
                        value={socialPerformanceStage}
                        onChange={(e) => setSocialPerformanceStage(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        <option value="">請選擇學習階段</option>
                        <option value="II">第二學習階段（II）- 國民小學3-4年級</option>
                        <option value="III">第三學習階段（III）- 國民小學5-6年級</option>
                      </select>
                    )}
                  </div>
                )}

                {/* 第三個欄位：選擇學習表現（選擇「其他」時不顯示） */}
                {socialPerformanceDimensionItem && socialPerformanceDimensionItem !== '其他' && socialPerformanceStage && (() => {
                  const filteredPerformances = socialPerformances.filter(p => 
                    p.dimensionItem === socialPerformanceDimensionItem && p.stage === socialPerformanceStage
                  )
                  
                  return filteredPerformances.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium text-sm">
                        選擇學習表現：
                      </label>
                      <select
                        multiple
                        size={Math.min(filteredPerformances.length, 8)}
                        value={selectedSocialCodes}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setSelectedSocialCodes(selected)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        {filteredPerformances.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code}: {item.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">此構面項目與階段無學習表現</div>
                  )
                })()}

                {/* 加入按鈕：支持自定義內容 */}
                {((socialPerformanceDimensionItem === '其他' && socialPerformanceOther.trim()) || 
                  (selectedSocialCodes.length > 0 && socialPerformanceDimensionItem && socialPerformanceStage)) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (socialPerformanceDimensionItem === '其他') {
                          setAddedLearningPerformances([
                            ...addedLearningPerformances,
                            {
                              content: [{
                                code: '自訂',
                                description: socialPerformanceOther
                              }]
                            }
                          ])
                          setSocialPerformanceDimensionItem('')
                          setSocialPerformanceOther('')
                        } else {
                          const selectedPerformances = socialPerformances.filter(p => 
                            selectedSocialCodes.includes(p.code)
                          )
                          if (selectedPerformances.length > 0) {
                            setAddedLearningPerformances([
                              ...addedLearningPerformances,
                              {
                                content: selectedPerformances.map(p => ({
                                  code: p.code,
                                  description: p.description
                                }))
                              }
                            ])
                            setSocialPerformanceDimensionItem('')
                            setSocialPerformanceStage('')
                            setSelectedSocialCodes([])
                          }
                        }
                      }}
                      className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      加入
                    </button>
                  </div>
                )}
              </div>
              )
            ) : courseDomain === '自然' ? (
              (schoolLevel === '國中' || schoolLevel === '高中（高職）') ? (
                // === 自然科的學習表現（國中/高中）- 三層下拉選單 ===
                <div className="space-y-3">
                  {/* 第一層：選擇項目（t, p, a）- 探究能力-思考智能（t）、探究能力-問題解決（p）、科學的態度與本質（a） */}
                  <div className="flex gap-2">
                    <select
                      value={naturalMHSubCategory}
                      onChange={(e) => {
                        setNaturalMHSubCategory(e.target.value)
                        setNaturalMHItem('')
                        setSelectedNaturalMHCodes([])
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                    >
                      <option value="">請選擇項目</option>
                      {naturalMiddleHighPerformances.map((cat) => (
                        <option key={cat.subCategoryCode} value={cat.subCategoryCode}>
                          {cat.subCategoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 第二層：選擇子項（i, r, c, m, o, e, a, c, h, n）- 想像創造（i）、推理論證（r）等 */}
                  {naturalMHSubCategory && (() => {
                    const selectedCategory = naturalMiddleHighPerformances.find(
                      c => c.subCategoryCode === naturalMHSubCategory
                    )
                    return selectedCategory && selectedCategory.items.length > 0 ? (
                      <div className="flex gap-2">
                        <select
                          value={naturalMHItem}
                          onChange={(e) => {
                            setNaturalMHItem(e.target.value)
                            setSelectedNaturalMHCodes([])
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          <option value="">請選擇子項</option>
                          {selectedCategory.items.map((item) => (
                            <option key={item.itemCode} value={item.itemCode}>
                              {item.itemCode}. {item.itemName}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null
                  })()}

                  {/* 第三層：選擇學習表現（ti-IV-1 等） */}
                  {naturalMHSubCategory && naturalMHItem && (() => {
                    const selectedCategory = naturalMiddleHighPerformances.find(
                      c => c.subCategoryCode === naturalMHSubCategory
                    )
                    const selectedItem = selectedCategory?.items.find(
                      it => it.itemCode === naturalMHItem
                    )
                    const performances = selectedItem?.performances || []

                    return performances.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">
                          選擇學習表現：
                        </label>
                        <select
                          multiple
                          size={Math.min(performances.length, 8)}
                          value={selectedNaturalMHCodes}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value)
                            setSelectedNaturalMHCodes(selected)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          {performances.map((item) => (
                            <option key={item.id} value={item.code}>
                              {item.code}: {item.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">此子項無學習表現</div>
                    )
                  })()}

                  {/* 加入按鈕 */}
                  {selectedNaturalMHCodes.length > 0 && naturalMHSubCategory && naturalMHItem && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const selectedCategory = naturalMiddleHighPerformances.find(
                            c => c.subCategoryCode === naturalMHSubCategory
                          )
                          const selectedItem = selectedCategory?.items.find(
                            it => it.itemCode === naturalMHItem
                          )
                          const performances = selectedItem?.performances || []
                          const selectedPerformances = performances.filter(p => 
                            selectedNaturalMHCodes.includes(p.code)
                          )
                          
                          if (selectedPerformances.length > 0) {
                            setAddedLearningPerformances([
                              ...addedLearningPerformances,
                              {
                                content: selectedPerformances.map(p => ({
                                  code: p.code,
                                  description: p.description
                                }))
                              }
                            ])
                            setNaturalMHSubCategory('')
                            setNaturalMHItem('')
                            setSelectedNaturalMHCodes([])
                          }
                        }}
                        className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                      >
                        加入
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // === 自然科的學習表現（國小）===
              <div className="space-y-3">
                {/* 第一個欄位：選擇項目 */}
                <div className="flex gap-2">
                  <select
                    value={learningPerformanceCategory}
                    onChange={(e) => {
                      setLearningPerformanceCategory(e.target.value)
                      setLearningPerformanceSubItem('')
                      setSelectedCodes([])
                      setNaturalPerformanceOther('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇項目</option>
                    <option value="t">探究能力-思考智能（t）</option>
                    <option value="p">探究能力-問題解決（p）</option>
                    <option value="a">科學的態度與本質（a）</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 第二個欄位：條件渲染（下拉選單或文字輸入框） */}
                {learningPerformanceCategory && (
                  <div className="flex gap-2">
                    {learningPerformanceCategory === '其他' ? (
                      <textarea
                        value={naturalPerformanceOther}
                        onChange={(e) => setNaturalPerformanceOther(e.target.value)}
                        placeholder="請輸入自定義學習表現內容"
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    ) : (
                      <select
                        value={learningPerformanceSubItem}
                        onChange={(e) => setLearningPerformanceSubItem(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        <option value="">請選擇子項</option>
                        {learningPerformanceCategory &&
                          Object.entries(
                            learningPerformanceData[learningPerformanceCategory as keyof typeof learningPerformanceData].subItems
                          ).map(([key, subItem]) => (
                            <option key={key} value={key}>
                              {subItem.name}
                            </option>
                          ))}
                      </select>
                    )}
                  </div>
                )}

                {/* 第三個欄位：選擇代碼（選擇「其他」時不顯示） */}
                {learningPerformanceSubItem && learningPerformanceCategory && learningPerformanceCategory !== '其他' && (() => {
                  const category = learningPerformanceData[learningPerformanceCategory as keyof typeof learningPerformanceData]
                  const subItem = category.subItems[learningPerformanceSubItem as keyof typeof category.subItems]
                  const allOptions: { code: string; description: string }[] = [
                    ...(subItem.stage2 || []),
                    ...(subItem.stage3 || [])
                  ]

                  return (
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium text-sm">
                        選擇學習表現：
                      </label>
                      <select
                        multiple
                        size={Math.min(allOptions.length, 6)}
                        value={selectedCodes}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setSelectedCodes(selected)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        {allOptions.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code} {item.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })()}

                {/* 加入按鈕：支持自定義內容 */}
                {((learningPerformanceCategory === '其他' && naturalPerformanceOther.trim()) || 
                  (learningPerformanceCategory && learningPerformanceSubItem && selectedCodes.length > 0)) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (learningPerformanceCategory === '其他') {
                          setAddedLearningPerformances([
                            ...addedLearningPerformances,
                            {
                              content: [{
                                code: '自訂',
                                description: naturalPerformanceOther
                              }]
                            }
                          ])
                          setLearningPerformanceCategory('')
                          setNaturalPerformanceOther('')
                        } else {
                          const category = learningPerformanceData[learningPerformanceCategory as keyof typeof learningPerformanceData]
                          const subItem = category.subItems[learningPerformanceSubItem as keyof typeof category.subItems]
                          const allOptions: { code: string; description: string }[] = [
                            ...(subItem.stage2 || []),
                            ...(subItem.stage3 || [])
                          ]
                          
                          const content = allOptions.filter(item => selectedCodes.includes(item.code))

                          setAddedLearningPerformances([
                            ...addedLearningPerformances,
                            {
                              content
                            }
                          ])

                          // 重置選擇
                          setLearningPerformanceCategory('')
                          setLearningPerformanceSubItem('')
                          setSelectedCodes([])
                        }
                      }}
                      className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      加入
                    </button>
                  </div>
                )}
              </div>
              )
            ) : (
              // === 未選擇課程領域或其他領域 ===
              <div className="text-gray-500 text-sm py-4">
                請先選擇課程領域（目前支持：數學、自然）
              </div>
            )
            )}

            {/* 顯示已加入的學習表現（共用部分） */}
            {addedLearningPerformances.length > 0 && (
              <div className="mt-4 space-y-3">
                <label className="block text-gray-700 font-medium text-sm">
                  已加入的學習表現：
                </label>
                {addedLearningPerformances.map((item, idx) => (
                  <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-white relative">
                    <button
                      onClick={() => {
                        setAddedLearningPerformances(addedLearningPerformances.filter((_, i) => i !== idx))
                      }}
                      className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      刪除
                    </button>
                    <div className="space-y-2 pr-16">
                      {item.content.map((contentItem, contentIdx) => (
                        <div key={contentIdx} className="text-sm text-gray-700 pl-2 border-l-2 border-purple-300">
                          <div>
                            <span className="font-medium">{contentItem.code}</span> {contentItem.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 學習內容 */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              學習內容
            </label>
            
            {/* 如果沒有選擇學段，不顯示選項 */}
            {!schoolLevel ? (
              <div className="px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                請先選擇學段
              </div>
            ) : (
            /* 根據課程領域顯示不同內容 */
            courseDomain === '數學' ? (
              (schoolLevel === '國中' || schoolLevel === '高中（高職）') ? (
                // === 數學領域的學習內容（國中/高中）- 兩層下拉選單 ===
                <div className="space-y-3">
                  {/* 第一層：選擇年級 */}
                  <div className="flex gap-2">
                    <select
                      value={mathMHContentGrade}
                      onChange={(e) => {
                        setMathMHContentGrade(e.target.value)
                        setSelectedMathMHContentCodes([])
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                    >
                      <option value="">請選擇年級</option>
                      {mathMiddleHighContents.grades.map((g) => (
                        <option key={g.grade} value={g.grade}>
                          {g.grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 第二層：選擇學習內容 */}
                  {mathMHContentGrade && (() => {
                    const selectedGrade = mathMiddleHighContents.grades.find(
                      g => g.grade === mathMHContentGrade
                    )
                    const contents = selectedGrade?.contents || []

                    return contents.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">
                          選擇學習內容：
                        </label>
                        <select
                          multiple
                          size={Math.min(contents.length, 8)}
                          value={selectedMathMHContentCodes}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value)
                            setSelectedMathMHContentCodes(selected)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          {contents.map((item) => (
                            <option key={item.id} value={item.code}>
                              {item.code}: {item.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">此年級無學習內容</div>
                    )
                  })()}

                  {/* 加入按鈕 */}
                  {selectedMathMHContentCodes.length > 0 && mathMHContentGrade && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const selectedGrade = mathMiddleHighContents.grades.find(
                            g => g.grade === mathMHContentGrade
                          )
                          const contents = selectedGrade?.contents || []
                          const selectedContents = contents.filter(c => 
                            selectedMathMHContentCodes.includes(c.code)
                          )
                          
                          if (selectedContents.length > 0) {
                            setAddedLearningContents([
                              ...addedLearningContents,
                              {
                                content: selectedContents.map(c => ({
                                  code: c.code,
                                  description: c.description
                                }))
                              }
                            ])
                            setMathMHContentGrade('')
                            setSelectedMathMHContentCodes([])
                          }
                        }}
                        className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                      >
                        加入
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // === 數學領域的學習內容（國小）===
              <div className="space-y-3">
                {/* 第一層：選擇年級 */}
                <div className="flex gap-2">
                  <select
                    value={mathContentGrade}
                    onChange={(e) => {
                      setMathContentGrade(e.target.value)
                      setSelectedMathContentCodes([])
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇年級</option>
                    <option value="1">一年級</option>
                    <option value="2">二年級</option>
                    <option value="3">三年級</option>
                    <option value="4">四年級</option>
                    <option value="5">五年級</option>
                    <option value="6">六年級</option>
                  </select>
                </div>

                {/* 第二層：選擇學習內容 */}
                {mathContentGrade && (() => {
                  const selectedGrade = mathContents.find(g => g.grade === parseInt(mathContentGrade))
                  const contents = selectedGrade?.contents || []
                  
                  return contents.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium text-sm">
                        選擇學習內容：
                      </label>
                      <select
                        multiple
                        size={Math.min(contents.length, 8)}
                        value={selectedMathContentCodes}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setSelectedMathContentCodes(selected)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        {contents.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code}: {item.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">此年級無學習內容</div>
                  )
                })()}

                {/* 加入按鈕 */}
                {selectedMathContentCodes.length > 0 && mathContentGrade && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const selectedGrade = mathContents.find(g => g.grade === parseInt(mathContentGrade))
                        const contents = selectedGrade?.contents || []
                        const selectedContents = contents.filter(c => 
                          selectedMathContentCodes.includes(c.code)
                        )
                        if (selectedContents.length > 0) {
                          setAddedLearningContents([
                            ...addedLearningContents,
                            {
                              content: selectedContents.map(c => ({
                                code: c.code,
                                description: c.description
                              }))
                            }
                          ])
                          setMathContentGrade('')
                          setSelectedMathContentCodes([])
                        }
                      }}
                      className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      加入
                    </button>
                  </div>
                )}
              </div>
              )
            ) : courseDomain === '國文' ? (
              (schoolLevel === '國中' || schoolLevel === '高中（高職）') ? (
                // === 國文領域的學習內容（國中/高中）- 兩層下拉選單 ===
                <div className="space-y-3">
                  {/* 第一層：選擇主分類 */}
                  <div className="flex gap-2">
                    <select
                      value={chineseMHMainCategoryCode}
                      onChange={(e) => {
                        setChineseMHMainCategoryCode(e.target.value)
                        setSelectedChineseMHContentCodes([])
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                    >
                      <option value="">請選擇主題</option>
                      {chineseMiddleHighContents.categories.map((cat) => (
                        <option key={cat.mainCategoryCode} value={cat.mainCategoryCode}>
                          {cat.mainCategoryCode} - {cat.mainCategoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 第二層：選擇學習內容 */}
                  {chineseMHMainCategoryCode && (() => {
                    const selectedCategory = chineseMiddleHighContents.categories.find(
                      c => c.mainCategoryCode === chineseMHMainCategoryCode
                    )
                    const contents = selectedCategory?.contents || []

                    return contents.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">
                          選擇學習內容：
                        </label>
                        <select
                          multiple
                          size={Math.min(contents.length, 8)}
                          value={selectedChineseMHContentCodes}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value)
                            setSelectedChineseMHContentCodes(selected)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          {contents.map((item) => (
                            <option key={item.id} value={item.code}>
                              {item.code}: {item.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">此主題無學習內容</div>
                    )
                  })()}

                  {/* 加入按鈕 */}
                  {selectedChineseMHContentCodes.length > 0 && chineseMHMainCategoryCode && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const selectedCategory = chineseMiddleHighContents.categories.find(
                            c => c.mainCategoryCode === chineseMHMainCategoryCode
                          )
                          const contents = selectedCategory?.contents || []
                          const selectedContents = contents.filter(c => 
                            selectedChineseMHContentCodes.includes(c.code)
                          )
                          
                          if (selectedContents.length > 0) {
                            setAddedLearningContents([
                              ...addedLearningContents,
                              {
                                content: selectedContents.map(c => ({
                                  code: c.code,
                                  description: c.description
                                }))
                              }
                            ])
                            setChineseMHMainCategoryCode('')
                            setSelectedChineseMHContentCodes([])
                          }
                        }}
                        className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                      >
                        加入
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // === 國文領域的學習內容（國小）===
              <div className="space-y-3">
                {/* 第一個欄位：選擇主題 */}
                <div className="flex gap-2">
                  <select
                    value={chineseContentTopic}
                    onChange={(e) => {
                      setChineseContentTopic(e.target.value)
                      setChineseContentStage('')
                      setSelectedChineseContentCodes([])
                      setChineseContentOther('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇主題</option>
                    <option value="Aa">Aa - 標音符號</option>
                    <option value="Ab">Ab - 字詞</option>
                    <option value="Ac">Ac - 句段</option>
                    <option value="Ad">Ad - 篇章</option>
                    <option value="Ba">Ba - 記敘文本</option>
                    <option value="Bb">Bb - 抒情文本</option>
                    <option value="Bc">Bc - 說明文本</option>
                    <option value="Bd">Bd - 議論文本</option>
                    <option value="Be">Be - 應用文本</option>
                    <option value="Ca">Ca - 物質文化</option>
                    <option value="Cb">Cb - 社群文化</option>
                    <option value="Cc">Cc - 精神文化</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 第二個欄位：條件渲染（下拉選單或文字輸入框） */}
                {chineseContentTopic && (
                  <div className="flex gap-2">
                    {chineseContentTopic === '其他' ? (
                      <textarea
                        value={chineseContentOther}
                        onChange={(e) => setChineseContentOther(e.target.value)}
                        placeholder="請輸入自定義學習內容"
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    ) : (
                      <select
                        value={chineseContentStage}
                        onChange={(e) => setChineseContentStage(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        <option value="">請選擇學習階段</option>
                        <option value="I">第一學習階段（I）- 國民小學1-2年級</option>
                        <option value="II">第二學習階段（II）- 國民小學3-4年級</option>
                        <option value="III">第三學習階段（III）- 國民小學5-6年級</option>
                      </select>
                    )}
                  </div>
                )}

                {/* 第三個欄位：選擇學習內容（選擇「其他」時不顯示） */}
                {chineseContentTopic && chineseContentTopic !== '其他' && chineseContentStage && (() => {
                  const filteredContents = chineseContents.filter(c => 
                    c.topic === chineseContentTopic && c.stage === chineseContentStage
                  )
                  
                  return filteredContents.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium text-sm">
                        選擇學習內容：
                      </label>
                      <select
                        multiple
                        size={Math.min(filteredContents.length, 8)}
                        value={selectedChineseContentCodes}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setSelectedChineseContentCodes(selected)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        {filteredContents.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code}: {item.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">此主題與階段無學習內容</div>
                  )
                })()}

                {/* 加入按鈕：支持自定義內容 */}
                {((chineseContentTopic === '其他' && chineseContentOther.trim()) || 
                  (selectedChineseContentCodes.length > 0 && chineseContentTopic && chineseContentStage)) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (chineseContentTopic === '其他') {
                          setAddedLearningContents([
                            ...addedLearningContents,
                            {
                              content: [{
                                code: '自訂',
                                description: chineseContentOther
                              }]
                            }
                          ])
                          setChineseContentTopic('')
                          setChineseContentOther('')
                        } else {
                          const selectedContents = chineseContents.filter(c => 
                            selectedChineseContentCodes.includes(c.code)
                          )
                          if (selectedContents.length > 0) {
                            setAddedLearningContents([
                              ...addedLearningContents,
                              {
                                content: selectedContents.map(c => ({
                                  code: c.code,
                                  description: c.description
                                }))
                              }
                            ])
                            setChineseContentTopic('')
                            setChineseContentStage('')
                            setSelectedChineseContentCodes([])
                          }
                        }
                      }}
                      className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      加入
                    </button>
                  </div>
                )}
              </div>
              )
            ) : courseDomain === '英文' ? (
              (schoolLevel === '國中' || schoolLevel === '高中（高職）') ? (
                // === 英文領域的學習內容（國中/高中）===
                <div className="space-y-3">
                  {/* 第一層：選擇主分類 */}
                  <div className="flex gap-2">
                    <select
                      value={englishMHContentMainCategory}
                      onChange={(e) => {
                        setEnglishMHContentMainCategory(e.target.value)
                        setEnglishMHContentSubCategory('')
                        setSelectedEnglishMHContentCodes([])
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                    >
                      <option value="">請選擇主題</option>
                      {englishMiddleHighContents.map((cat) => (
                        <option key={cat.mainCategoryCode} value={cat.mainCategoryCode}>
                          {cat.mainCategoryCode}. {cat.mainCategoryName}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 第二層：選擇子分類（僅 A 主題有） */}
                  {englishMHContentMainCategory === 'A' && englishMiddleHighContents.find(c => c.mainCategoryCode === 'A')?.subCategories && (
                    <div className="flex gap-2">
                      <select
                        value={englishMHContentSubCategory}
                        onChange={(e) => {
                          setEnglishMHContentSubCategory(e.target.value)
                          setSelectedEnglishMHContentCodes([])
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        <option value="">請選擇項目</option>
                        {englishMiddleHighContents.find(c => c.mainCategoryCode === 'A')?.subCategories?.map((sub) => (
                          <option key={sub.subCategoryCode} value={sub.subCategoryCode}>
                            {sub.subCategoryCode}. {sub.subCategoryName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 第三層：選擇學習內容 */}
                  {englishMHContentMainCategory && (() => {
                    const selectedCategory = englishMiddleHighContents.find(
                      c => c.mainCategoryCode === englishMHContentMainCategory
                    )
                    
                    let contents: Array<{ id: number; code: string; description: string }> = []
                    
                    if (englishMHContentMainCategory === 'A' && englishMHContentSubCategory) {
                      // A 主題：從子分類中取得學習內容
                      const selectedSubCategory = selectedCategory?.subCategories?.find(
                        sc => sc.subCategoryCode === englishMHContentSubCategory
                      )
                      contents = selectedSubCategory?.contents || []
                    } else if (englishMHContentMainCategory !== 'A') {
                      // B/C/D 主題：直接從主分類取得學習內容
                      contents = selectedCategory?.contents || []
                    }

                    return contents.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">
                          選擇學習內容：
                        </label>
                        <select
                          multiple
                          size={Math.min(contents.length, 8)}
                          value={selectedEnglishMHContentCodes}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value)
                            setSelectedEnglishMHContentCodes(selected)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          {contents.map((item) => (
                            <option key={item.id} value={item.code}>
                              {item.code}: {item.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">
                        {englishMHContentMainCategory === 'A' && !englishMHContentSubCategory 
                          ? '請先選擇項目' 
                          : '此主題無學習內容'}
                      </div>
                    )
                  })()}

                  {/* 加入按鈕 */}
                  {selectedEnglishMHContentCodes.length > 0 && englishMHContentMainCategory && 
                   (englishMHContentMainCategory !== 'A' || englishMHContentSubCategory) && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const selectedCategory = englishMiddleHighContents.find(
                            c => c.mainCategoryCode === englishMHContentMainCategory
                          )
                          
                          let contents: Array<{ id: number; code: string; description: string }> = []
                          
                          if (englishMHContentMainCategory === 'A' && englishMHContentSubCategory) {
                            const selectedSubCategory = selectedCategory?.subCategories?.find(
                              sc => sc.subCategoryCode === englishMHContentSubCategory
                            )
                            contents = selectedSubCategory?.contents || []
                          } else if (englishMHContentMainCategory !== 'A') {
                            contents = selectedCategory?.contents || []
                          }
                          
                          const selectedContents = contents.filter(c => 
                            selectedEnglishMHContentCodes.includes(c.code)
                          )
                          
                          if (selectedContents.length > 0) {
                            setAddedLearningContents([
                              ...addedLearningContents,
                              {
                                content: selectedContents.map(c => ({
                                  code: c.code,
                                  description: c.description
                                }))
                              }
                            ])
                            setEnglishMHContentMainCategory('')
                            setEnglishMHContentSubCategory('')
                            setSelectedEnglishMHContentCodes([])
                          }
                        }}
                        className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                      >
                        加入
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // === 英文領域的學習內容（國小）===
              <div className="space-y-3">
                {/* 第一層：選擇主分類 */}
                <div className="flex gap-2">
                  <select
                    value={englishContentMainCategory}
                    onChange={(e) => {
                      setEnglishContentMainCategory(e.target.value)
                      setEnglishContentSubCategory('')
                      setSelectedEnglishContentCodes([])
                      setEnglishContentOther('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇主題項目</option>
                    <option value="A">A. 語言知識</option>
                    <option value="B">B. 溝通功能</option>
                    <option value="C">C. 文化與習俗</option>
                    <option value="D">D. 思考能力</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 第二層：條件渲染 */}
                {englishContentMainCategory && (
                  <>
                    {/* 如果選「A.語言知識」，顯示子項目選擇 */}
                    {englishContentMainCategory === 'A' && (
                      <div className="flex gap-2">
                        <select
                          value={englishContentSubCategory}
                          onChange={(e) => {
                            setEnglishContentSubCategory(e.target.value)
                            setSelectedEnglishContentCodes([])
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          <option value="">請選擇項目</option>
                          <option value="Aa">a. 字母</option>
                          <option value="Ab">b. 語音</option>
                          <option value="Ac">c. 字詞</option>
                          <option value="Ad">d. 句構</option>
                          <option value="Ae">e. 篇章</option>
                        </select>
                      </div>
                    )}

                    {/* 如果選「其他」，顯示文字輸入框 */}
                    {englishContentMainCategory === '其他' && (
                      <div className="flex gap-2">
                        <textarea
                          value={englishContentOther}
                          onChange={(e) => setEnglishContentOther(e.target.value)}
                          placeholder="請輸入自定義學習內容"
                          rows={3}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                        />
                      </div>
                    )}

                    {/* 第三層：選擇學習內容 */}
                    {englishContentMainCategory !== '其他' && (() => {
                      const selectedCategory = englishContents.find(
                        c => c.mainCategoryCode === englishContentMainCategory
                      )
                      
                      let contents: Array<{ id: string; code: string; stage: string; stageName: string; description: string }> = []
                      
                      if (englishContentMainCategory === 'A' && englishContentSubCategory) {
                        // A 主題：從子分類中取得學習內容
                        const selectedSubCategory = selectedCategory?.subCategories?.find(
                          sc => sc.subCategoryCode === englishContentSubCategory
                        )
                        contents = selectedSubCategory?.contents || []
                      } else if (englishContentMainCategory !== 'A') {
                        // B/C/D 主題：直接從主分類取得學習內容
                        contents = selectedCategory?.contents || []
                      }
                      
                      return contents.length > 0 ? (
                        <div className="space-y-2">
                          <label className="block text-gray-700 font-medium text-sm">
                            選擇學習內容：
                          </label>
                          <select
                            multiple
                            size={Math.min(contents.length, 8)}
                            value={selectedEnglishContentCodes}
                            onChange={(e) => {
                              const selected = Array.from(e.target.selectedOptions, option => option.value)
                              setSelectedEnglishContentCodes(selected)
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                          >
                            {contents.map((item) => (
                              <option key={item.code} value={item.code}>
                                {item.code}: {item.description}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">
                          {englishContentMainCategory === 'A' && !englishContentSubCategory 
                            ? '請先選擇項目' 
                            : '此主題無學習內容'}
                        </div>
                      )
                    })()}

                    {/* 加入按鈕 */}
                    {((englishContentMainCategory === '其他' && englishContentOther.trim()) || 
                      (selectedEnglishContentCodes.length > 0 && englishContentMainCategory && 
                       (englishContentMainCategory !== 'A' || englishContentSubCategory))) && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => {
                            if (englishContentMainCategory === '其他') {
                              setAddedLearningContents([
                                ...addedLearningContents,
                                {
                                  content: [{
                                    code: '自訂',
                                    description: englishContentOther
                                  }]
                                }
                              ])
                              setEnglishContentMainCategory('')
                              setEnglishContentOther('')
                            } else {
                              const selectedCategory = englishContents.find(
                                c => c.mainCategoryCode === englishContentMainCategory
                              )
                              
                              let contents: Array<{ id: string; code: string; stage: string; stageName: string; description: string }> = []
                              
                              if (englishContentMainCategory === 'A' && englishContentSubCategory) {
                                const selectedSubCategory = selectedCategory?.subCategories?.find(
                                  sc => sc.subCategoryCode === englishContentSubCategory
                                )
                                contents = selectedSubCategory?.contents || []
                              } else if (englishContentMainCategory !== 'A') {
                                contents = selectedCategory?.contents || []
                              }
                              
                              const selectedContents = contents.filter(c => 
                                selectedEnglishContentCodes.includes(c.code)
                              )
                              
                              if (selectedContents.length > 0) {
                                setAddedLearningContents([
                                  ...addedLearningContents,
                                  {
                                    content: selectedContents.map(c => ({
                                      code: c.code,
                                      description: c.description
                                    }))
                                  }
                                ])
                                setEnglishContentMainCategory('')
                                setEnglishContentSubCategory('')
                                setSelectedEnglishContentCodes([])
                              }
                            }
                          }}
                          className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                        >
                          加入
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
              )
            ) : courseDomain === '社會' ? (
              (schoolLevel === '國中' || schoolLevel === '高中（高職）') ? (
                // === 社會領域的學習內容（國中/高中）- 三層結構 ===
                <div className="space-y-3">
                  {/* 第一層：選擇主題 */}
                  <div className="flex gap-2">
                    <select
                      value={socialContentMHTheme}
                      onChange={(e) => setSocialContentMHTheme(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                    >
                      <option value="">請選擇主題</option>
                      {socialContentMHThemes.map((theme) => (
                        <option key={theme.theme} value={theme.theme}>
                          {theme.theme}. {theme.theme_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 第二層：選擇項目（如果該主題有項目） */}
                  {socialContentMHTheme && socialContentMHCategories.length > 0 && (
                    <div className="flex gap-2">
                      <select
                        value={socialContentMHCategory}
                        onChange={(e) => setSocialContentMHCategory(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        <option value="">請選擇項目</option>
                        {socialContentMHCategories.map((cat) => (
                          <option key={cat.category} value={cat.category}>
                            {cat.category}. {cat.category_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* 第三層：選擇條目 */}
                  {socialContentMHTheme && (() => {
                    // 如果有項目，需要選擇了項目才顯示條目
                    // 如果沒有項目，直接顯示條目
                    const hasCategories = socialContentMHCategories.length > 0
                    const shouldShowContents = hasCategories ? socialContentMHCategory : true

                    if (!shouldShowContents) return null

                    const filteredContents = hasCategories && socialContentMHCategory
                      ? socialContentMHContents.filter(c => c.code.includes(`${socialContentMHTheme}${socialContentMHCategory}`))
                      : socialContentMHContents

                    return filteredContents.length > 0 ? (
                      <div className="space-y-2">
                        <label className="block text-gray-700 font-medium text-sm">
                          選擇學習內容：
                        </label>
                        <select
                          multiple
                          size={Math.min(filteredContents.length, 8)}
                          value={selectedSocialContentMHCodes}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value)
                            setSelectedSocialContentMHCodes(selected)
                          }}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          {filteredContents.map((item) => (
                            <option key={item.id} value={item.code}>
                              {item.code}: {item.description}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="text-gray-500 text-sm">此主題項目無學習內容</div>
                    )
                  })()}

                  {/* 加入按鈕 */}
                  {selectedSocialContentMHCodes.length > 0 && socialContentMHTheme && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          const selectedContents = socialContentMHContents.filter(c => 
                            selectedSocialContentMHCodes.includes(c.code)
                          )
                          
                          if (selectedContents.length > 0) {
                            setAddedLearningContents([
                              ...addedLearningContents,
                              {
                                content: selectedContents.map(c => ({
                                  code: c.code,
                                  description: c.description
                                }))
                              }
                            ])
                            setSocialContentMHTheme('')
                            setSocialContentMHCategory('')
                            setSelectedSocialContentMHCodes([])
                          }
                        }}
                        className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                      >
                        加入
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // === 社會領域的學習內容（國小）- 舊版 ===
              <div className="space-y-3">
                {/* 第一個欄位：選擇主題軸項目 */}
                <div className="flex gap-2">
                  <select
                    value={socialContentTopicItem}
                    onChange={(e) => {
                      setSocialContentTopicItem(e.target.value)
                      setSocialContentStage('')
                      setSelectedSocialContentCodes([])
                      setSocialContentOther('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇主題軸項目</option>
                    <option value="Aa">Aa - 互動與關聯-個人與群體</option>
                    <option value="Ab">Ab - 互動與關聯-人與環境</option>
                    <option value="Ac">Ac - 互動與關聯-權力規則與人權</option>
                    <option value="Ad">Ad - 互動與關聯-生產與消費</option>
                    <option value="Ae">Ae - 互動與關聯-科技與社會</option>
                    <option value="Af">Af - 互動與關聯-全球關連</option>
                    <option value="Ba">Ba - 差異與多元-個體差異</option>
                    <option value="Bb">Bb - 差異與多元-環境差異</option>
                    <option value="Bc">Bc - 差異與多元-社會與文化的差異</option>
                    <option value="Ca">Ca - 變遷與因果-環境的變遷</option>
                    <option value="Cb">Cb - 變遷與因果-歷史的變遷</option>
                    <option value="Cc">Cc - 變遷與因果-社會的變遷</option>
                    <option value="Cd">Cd - 變遷與因果-政治的變遷</option>
                    <option value="Ce">Ce - 變遷與因果-經濟的變遷</option>
                    <option value="Da">Da - 選擇與責任-價值的選擇</option>
                    <option value="Db">Db - 選擇與責任-經濟的選擇</option>
                    <option value="Dc">Dc - 選擇與責任-參與公共事務的選擇</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 第二個欄位：條件渲染（下拉選單或文字輸入框） */}
                {socialContentTopicItem && (
                  <div className="flex gap-2">
                    {socialContentTopicItem === '其他' ? (
                      <textarea
                        value={socialContentOther}
                        onChange={(e) => setSocialContentOther(e.target.value)}
                        placeholder="請輸入自定義學習內容"
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    ) : (
                      <select
                        value={socialContentStage}
                        onChange={(e) => setSocialContentStage(e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        <option value="">請選擇學習階段</option>
                        <option value="II">第二學習階段（II）- 國民小學3-4年級</option>
                        <option value="III">第三學習階段（III）- 國民小學5-6年級</option>
                      </select>
                    )}
                  </div>
                )}

                {/* 第三個欄位：選擇學習內容（選擇「其他」時不顯示） */}
                {socialContentTopicItem && socialContentTopicItem !== '其他' && socialContentStage && (() => {
                  const filteredContents = socialContents.filter(c => 
                    c.topicItem === socialContentTopicItem && c.stage === socialContentStage
                  )
                  
                  return filteredContents.length > 0 ? (
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium text-sm">
                        選擇學習內容：
                      </label>
                      <select
                        multiple
                        size={Math.min(filteredContents.length, 8)}
                        value={selectedSocialContentCodes}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setSelectedSocialContentCodes(selected)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        {filteredContents.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code}: {item.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="text-gray-500 text-sm">此主題軸項目與階段無學習內容</div>
                  )
                })()}

                {/* 加入按鈕：支持自定義內容 */}
                {((socialContentTopicItem === '其他' && socialContentOther.trim()) || 
                  (selectedSocialContentCodes.length > 0 && socialContentTopicItem && socialContentStage)) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (socialContentTopicItem === '其他') {
                          setAddedLearningContents([
                            ...addedLearningContents,
                            {
                              content: [{
                                code: '自訂',
                                description: socialContentOther
                              }]
                            }
                          ])
                          setSocialContentTopicItem('')
                          setSocialContentOther('')
                        } else {
                          const selectedContents = socialContents.filter(c => 
                            selectedSocialContentCodes.includes(c.code)
                          )
                          if (selectedContents.length > 0) {
                            setAddedLearningContents([
                              ...addedLearningContents,
                              {
                                content: selectedContents.map(c => ({
                                  code: c.code,
                                  description: c.description
                                }))
                              }
                            ])
                            setSocialContentTopicItem('')
                            setSocialContentStage('')
                            setSelectedSocialContentCodes([])
                          }
                        }
                      }}
                      className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      加入
                    </button>
                  </div>
                )}
              </div>
              )
            ) : courseDomain === '自然' ? (
              schoolLevel === '國中' || schoolLevel === '高中（高職）' ? (
                // === 自然科的學習內容（國中/高中） ===
                <div className="space-y-3">
                  {schoolLevel === '高中（高職）' ? (
                    // === 高中：四層結構（科目 → 主題 → 次主題 → 學習內容） ===
                    <>
                      {/* 第一層：選擇科目 */}
                      <div className="flex gap-2">
                        <select
                          value={naturalMHContentSubject}
                          onChange={(e) => {
                            setNaturalMHContentSubject(e.target.value)
                            setNaturalMHContentTheme('')
                            setNaturalMHContentSubTheme('')
                            setSelectedNaturalMHContentCodes([])
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          <option value="">請選擇科目</option>
                          {Array.from(new Set(naturalMiddleHighContents.map(c => c.subjectCode).filter(Boolean))).map((subjectCode) => {
                            const subject = naturalMiddleHighContents.find(c => c.subjectCode === subjectCode)
                            return (
                              <option key={subjectCode} value={subjectCode}>
                                {subject?.subjectName}
                              </option>
                            )
                          })}
                        </select>
                      </div>

                      {/* 第二層：選擇主題 */}
                      {naturalMHContentSubject && (() => {
                        const selectedSubject = naturalMiddleHighContents.find(
                          c => c.subjectCode === naturalMHContentSubject
                        )
                        return selectedSubject && selectedSubject.themes.length > 0 ? (
                          <div className="flex gap-2">
                            <select
                              value={naturalMHContentTheme}
                              onChange={(e) => {
                                setNaturalMHContentTheme(e.target.value)
                                setNaturalMHContentSubTheme('')
                                setSelectedNaturalMHContentCodes([])
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                            >
                              <option value="">請選擇主題</option>
                              {selectedSubject.themes.map((theme) => (
                                <option key={theme.themeCode} value={theme.themeCode}>
                                  {theme.themeName}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : null
                      })()}

                      {/* 第三層：選擇次主題 */}
                      {naturalMHContentSubject && naturalMHContentTheme && (() => {
                        const selectedSubject = naturalMiddleHighContents.find(
                          c => c.subjectCode === naturalMHContentSubject
                        )
                        const selectedTheme = selectedSubject?.themes.find(
                          t => t.themeCode === naturalMHContentTheme
                        )
                        return selectedTheme && selectedTheme.subThemes.length > 0 ? (
                          <div className="flex gap-2">
                            <select
                              value={naturalMHContentSubTheme}
                              onChange={(e) => {
                                setNaturalMHContentSubTheme(e.target.value)
                                setSelectedNaturalMHContentCodes([])
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                            >
                              <option value="">請選擇次主題</option>
                              {selectedTheme.subThemes.map((subTheme) => (
                                <option key={subTheme.subThemeCode} value={subTheme.subThemeCode}>
                                  {subTheme.subThemeCode}. {subTheme.subThemeName}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : null
                      })()}

                      {/* 第四層：選擇學習內容 */}
                      {naturalMHContentSubject && naturalMHContentTheme && naturalMHContentSubTheme && (() => {
                        const selectedSubject = naturalMiddleHighContents.find(
                          c => c.subjectCode === naturalMHContentSubject
                        )
                        const selectedTheme = selectedSubject?.themes.find(
                          t => t.themeCode === naturalMHContentTheme
                        )
                        const selectedSubTheme = selectedTheme?.subThemes.find(
                          st => st.subThemeCode === naturalMHContentSubTheme
                        )
                        const contents = selectedSubTheme?.contents || []

                        return contents.length > 0 ? (
                          <div className="space-y-2">
                            <label className="block text-gray-700 font-medium text-sm">
                              選擇學習內容：
                            </label>
                            <select
                              multiple
                              size={Math.min(contents.length, 8)}
                              value={selectedNaturalMHContentCodes}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value)
                                setSelectedNaturalMHContentCodes(selected)
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                            >
                              {contents.map((item) => (
                                <option key={item.id} value={item.code}>
                                  {item.code}: {item.description}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">此次主題無學習內容</div>
                        )
                      })()}

                      {/* 加入按鈕 */}
                      {selectedNaturalMHContentCodes.length > 0 && naturalMHContentSubject && naturalMHContentTheme && naturalMHContentSubTheme && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              const selectedSubject = naturalMiddleHighContents.find(
                                c => c.subjectCode === naturalMHContentSubject
                              )
                              const selectedTheme = selectedSubject?.themes.find(
                                t => t.themeCode === naturalMHContentTheme
                              )
                              const selectedSubTheme = selectedTheme?.subThemes.find(
                                st => st.subThemeCode === naturalMHContentSubTheme
                              )
                              const contents = selectedSubTheme?.contents || []
                              const selectedContents = contents.filter(c => 
                                selectedNaturalMHContentCodes.includes(c.code)
                              )
                              
                              if (selectedContents.length > 0) {
                                setAddedLearningContents([
                                  ...addedLearningContents,
                                  {
                                    content: selectedContents.map(c => ({
                                      code: c.code,
                                      description: c.description
                                    }))
                                  }
                                ])
                                setNaturalMHContentSubject('')
                                setNaturalMHContentTheme('')
                                setNaturalMHContentSubTheme('')
                                setSelectedNaturalMHContentCodes([])
                              }
                            }}
                            className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                          >
                            加入
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    // === 國中：三層結構（主題 → 次主題 → 學習內容） ===
                    <>
                      {/* 第一層：選擇主題 */}
                      <div className="flex gap-2">
                        <select
                          value={naturalMHContentTheme}
                          onChange={(e) => {
                            setNaturalMHContentTheme(e.target.value)
                            setNaturalMHContentSubTheme('')
                            setSelectedNaturalMHContentCodes([])
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                        >
                          <option value="">請選擇主題</option>
                          {naturalMiddleHighContents.map((theme) => (
                            <option key={theme.themeCode} value={theme.themeCode}>
                              {theme.themeCode}. {theme.themeName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 第二層：選擇次主題 */}
                      {naturalMHContentTheme && (() => {
                        const selectedTheme = naturalMiddleHighContents.find(
                          t => t.themeCode === naturalMHContentTheme
                        )
                        return selectedTheme && selectedTheme.subThemes.length > 0 ? (
                          <div className="flex gap-2">
                            <select
                              value={naturalMHContentSubTheme}
                              onChange={(e) => {
                                setNaturalMHContentSubTheme(e.target.value)
                                setSelectedNaturalMHContentCodes([])
                              }}
                              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                            >
                              <option value="">請選擇次主題</option>
                              {selectedTheme.subThemes.map((subTheme) => (
                                <option key={subTheme.subThemeCode} value={subTheme.subThemeCode}>
                                  {subTheme.subThemeCode}. {subTheme.subThemeName}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : null
                      })()}

                      {/* 第三層：選擇學習內容 */}
                      {naturalMHContentTheme && naturalMHContentSubTheme && (() => {
                        const selectedTheme = naturalMiddleHighContents.find(
                          t => t.themeCode === naturalMHContentTheme
                        )
                        const selectedSubTheme = selectedTheme?.subThemes.find(
                          st => st.subThemeCode === naturalMHContentSubTheme
                        )
                        const contents = selectedSubTheme?.contents || []

                        return contents.length > 0 ? (
                          <div className="space-y-2">
                            <label className="block text-gray-700 font-medium text-sm">
                              選擇學習內容：
                            </label>
                            <select
                              multiple
                              size={Math.min(contents.length, 8)}
                              value={selectedNaturalMHContentCodes}
                              onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, option => option.value)
                                setSelectedNaturalMHContentCodes(selected)
                              }}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                            >
                              {contents.map((item) => (
                                <option key={item.id} value={item.code}>
                                  {item.code}: {item.description}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">此次主題無學習內容</div>
                        )
                      })()}

                      {/* 加入按鈕 */}
                      {selectedNaturalMHContentCodes.length > 0 && naturalMHContentTheme && naturalMHContentSubTheme && (
                        <div className="flex justify-end">
                          <button
                            onClick={() => {
                              const selectedTheme = naturalMiddleHighContents.find(
                                t => t.themeCode === naturalMHContentTheme
                              )
                              const selectedSubTheme = selectedTheme?.subThemes.find(
                                st => st.subThemeCode === naturalMHContentSubTheme
                              )
                              const contents = selectedSubTheme?.contents || []
                              const selectedContents = contents.filter(c => 
                                selectedNaturalMHContentCodes.includes(c.code)
                              )
                              
                              if (selectedContents.length > 0) {
                                setAddedLearningContents([
                                  ...addedLearningContents,
                                  {
                                    content: selectedContents.map(c => ({
                                      code: c.code,
                                      description: c.description
                                    }))
                                  }
                                ])
                                setNaturalMHContentTheme('')
                                setNaturalMHContentSubTheme('')
                                setSelectedNaturalMHContentCodes([])
                              }
                            }}
                            className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                          >
                            加入
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                // === 自然科的學習內容（國小）- 原有邏輯 ===
              <div className="space-y-3">
                {/* 第一欄：選擇跨科概念 */}
                <div className="flex gap-2">
                  <select
                    value={learningContentCategory}
                    onChange={(e) => {
                      setLearningContentCategory(e.target.value)
                      setLearningContentStage('')
                      setSelectedLearningContentCodes([])
                      setNaturalContentOther('')
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                  >
                    <option value="">請選擇跨科概念</option>
                    <option value="INa">物質與能量（INa）</option>
                    <option value="INb">構造與功能（INb）</option>
                    <option value="INc">系統與尺度（INc）</option>
                    <option value="INd">改變與穩定（INd）</option>
                    <option value="INe">交互作用（INe）</option>
                    <option value="INf">科學與生活（INf）</option>
                    <option value="INg">資源與永續性（INg）</option>
                    <option value="其他">其他</option>
                  </select>
                </div>

                {/* 第二欄：條件渲染（下拉選單或文字輸入框） */}
                {learningContentCategory && (
                  <div className="flex gap-2">
                    {learningContentCategory === '其他' ? (
                      <textarea
                        value={naturalContentOther}
                        onChange={(e) => setNaturalContentOther(e.target.value)}
                        placeholder="請輸入自定義學習內容"
                        rows={3}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    ) : (
                      <select
                        value={learningContentStage}
                        onChange={(e) => setLearningContentStage(e.target.value as 'stage2' | 'stage3' | '')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        <option value="">請選擇學習階段</option>
                        <option value="stage2">第二學習階段學習內容</option>
                        <option value="stage3">第三學習階段學習內容</option>
                      </select>
                    )}
                  </div>
                )}

                {/* 第三欄：選擇代碼（選擇「其他」時不顯示） */}
                {learningContentCategory && learningContentCategory !== '其他' && learningContentStage && (() => {
                  const category = learningContentData[learningContentCategory as keyof typeof learningContentData]
                  const items = category[learningContentStage as 'stage2' | 'stage3']

                  return (
                    <div className="space-y-2">
                      <label className="block text-gray-700 font-medium text-sm">
                        選擇學習內容：
                      </label>
                      <select
                        multiple
                        size={Math.min(items.length, 8)}
                        value={selectedLearningContentCodes}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, option => option.value)
                          setSelectedLearningContentCodes(selected)
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800"
                      >
                        {items.map((item) => (
                          <option key={item.code} value={item.code}>
                            {item.code} {item.description}
                          </option>
                        ))}
                      </select>
                    </div>
                  )
                })()}

                {/* 加入按鈕：支持自定義內容 */}
                {((learningContentCategory === '其他' && naturalContentOther.trim()) || 
                  (learningContentCategory && learningContentStage && selectedLearningContentCodes.length > 0)) && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (learningContentCategory === '其他') {
                          setAddedLearningContents([
                            ...addedLearningContents,
                            {
                              content: [{
                                code: '自訂',
                                description: naturalContentOther
                              }]
                            }
                          ])
                          setLearningContentCategory('')
                          setNaturalContentOther('')
                        } else {
                          const category = learningContentData[learningContentCategory as keyof typeof learningContentData]
                          const items = category[learningContentStage as 'stage2' | 'stage3']
                          const content = items.filter(item => selectedLearningContentCodes.includes(item.code))

                          setAddedLearningContents([
                            ...addedLearningContents,
                            {
                              content
                            }
                          ])

                          // 重置選擇
                          setLearningContentCategory('')
                          setLearningContentStage('')
                          setSelectedLearningContentCodes([])
                        }
                      }}
                      className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      加入
                    </button>
                  </div>
                )}
              </div>
              )
            ) : (
              // === 未選擇課程領域或其他領域 ===
              <div className="text-gray-500 text-sm py-4">
                請先選擇課程領域（目前支持：國文、英文、數學、自然、社會）
              </div>
            )
            )}

            {/* 顯示已加入的學習內容（共用部分） */}
            {addedLearningContents.length > 0 && (
              <div className="mt-4 space-y-3">
                <label className="block text-gray-700 font-medium text-sm">
                  已加入的學習內容：
                </label>
                {addedLearningContents.map((item, idx) => (
                  <div key={idx} className="border border-gray-300 rounded-lg p-4 bg-white relative">
                    <button
                      onClick={() => {
                        setAddedLearningContents(addedLearningContents.filter((_, i) => i !== idx))
                      }}
                      className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      刪除
                    </button>
                    <div className="space-y-2 pr-16">
                      {item.content.map((contentItem, contentIdx) => (
                        <div key={contentIdx} className="text-sm text-gray-700 pl-2 border-l-2 border-purple-300">
                          <div>
                            <span className="font-medium">{contentItem.code}</span> {contentItem.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

                {/* 教材來源 */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    教材來源
                  </label>
                  <textarea
                    value={materialSource}
                    onChange={(e) => setMaterialSource(e.target.value)}
                    placeholder="輸入教材來源"
                    rows={2}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                  />
                </div>

                {/* 教學設備/資源 */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    教學設備/資源
                  </label>
                  <textarea
                    value={teachingEquipment}
                    onChange={(e) => setTeachingEquipment(e.target.value)}
                    placeholder="輸入教學設備/資源"
                    rows={2}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                  />
                </div>

                {/* 學習目標 */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    學習目標
                  </label>
                  <textarea
                    value={learningObjectives}
                    onChange={(e) => setLearningObjectives(e.target.value)}
                    placeholder="輸入學習目標"
                    rows={4}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                  />
                </div>

                  {/* 儲存按鈕 */}
                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={handleSave}
                      className="px-8 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-bold hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      儲存
                    </button>
                  </div>
                </div>
              )}

              {/* 活動與評量設計 */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  {/* 第一列：教學內容及實施方式、教學時間、教學資源、學習評量方式 */}
                  <div className="flex gap-2">
                    {/* 教學內容及實施方式 - 最寬 */}
                    <div className="flex-[3]">
                      <label className="block text-gray-700 font-medium mb-2">
                        教學內容及實施方式
                      </label>
                      <textarea
                        value={teachingContent}
                        onChange={(e) => setTeachingContent(e.target.value)}
                        placeholder="輸入教學內容及實施方式"
                        rows={8}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    </div>

                    {/* 教學時間 - 最窄 */}
                    <div className="w-16 flex-shrink-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        教學時間
                      </label>
                      <textarea
                        value={teachingTime}
                        onChange={(e) => setTeachingTime(e.target.value)}
                        placeholder="輸入教學時間"
                        rows={8}
                        className="w-full px-2 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    </div>

                    {/* 教學資源 - 第二窄 */}
                    <div className="w-24 flex-shrink-0">
                      <label className="block text-gray-700 font-medium mb-2">
                        教學資源
                      </label>
                      <textarea
                        value={teachingResources}
                        onChange={(e) => setTeachingResources(e.target.value)}
                        placeholder="輸入教學資源"
                        rows={8}
                        className="w-full px-2 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    </div>

                    {/* 學習評量方式 */}
                    <div className="flex-[2]">
                      <label className="block text-gray-700 font-medium mb-2">
                        學習評量方式
                      </label>
                      <textarea
                        value={assessmentMethods}
                        onChange={(e) => setAssessmentMethods(e.target.value)}
                        placeholder="輸入學習評量方式"
                        rows={8}
                        className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                      />
                    </div>
                  </div>

                  {/* 加入按鈕 */}
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        if (teachingContent.trim() || teachingTime.trim() || teachingResources.trim() || assessmentMethods.trim()) {
                          setActivityRows([
                            ...activityRows,
                            {
                              id: Date.now().toString(),
                              teachingContent,
                              teachingTime,
                              teachingResources,
                              assessmentMethods,
                            }
                          ])
                          // 清空欄位
                          setTeachingContent('')
                          setTeachingTime('')
                          setTeachingResources('')
                          setAssessmentMethods('')
                        }
                      }}
                      className="px-4 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-medium hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      加入
                    </button>
                  </div>

                  {/* 表格樣式 */}
                  {activityRows.length > 0 && (
                    <div className="border border-gray-300">
                      {/* 表頭行 */}
                      <div className="flex border-b border-gray-300">
                        <div className="flex-[3] bg-gray-100 font-medium text-gray-700 flex items-center" style={{ borderRight: '1px solid #d1d5db' }}>
                          <div className="px-4 py-2 w-full">教學內容及實施方式</div>
                        </div>
                        <div className="w-16 flex-shrink-0 bg-gray-100 font-medium text-gray-700 flex items-center" style={{ borderRight: '1px solid #d1d5db' }}>
                          <div className="px-2 py-2 w-full">教學時間</div>
                        </div>
                        <div className="w-24 flex-shrink-0 bg-gray-100 font-medium text-gray-700 flex items-center" style={{ borderRight: '1px solid #d1d5db' }}>
                          <div className="px-2 py-2 w-full">教學資源</div>
                        </div>
                        <div className="flex-[2] bg-gray-100 font-medium text-gray-700 flex items-center" style={{ borderRight: '1px solid #d1d5db' }}>
                          <div className="px-4 py-2 w-full">學習評量方式</div>
                        </div>
                        <div className="w-20 flex-shrink-0 bg-gray-100">
                        </div>
                      </div>

                      {/* 已加入的列 - 表格樣式 */}
                      {activityRows.map((row, index) => (
                        <div key={row.id} className="flex" style={{ borderTop: index > 0 ? '1px solid #d1d5db' : 'none' }}>
                          {/* 教學內容及實施方式 */}
                          <div className="flex-[3] flex items-start" style={{ borderRight: '1px solid #d1d5db' }}>
                            <textarea
                              data-row-id={`activity-row-${index}`}
                              value={row.teachingContent}
                              onChange={(e) => {
                                const newRows = [...activityRows]
                                newRows[index].teachingContent = e.target.value
                                setActivityRows(newRows)
                                autoResizeTextarea(e.target)
                                syncRowHeight(index)
                              }}
                              onInput={(e) => {
                                autoResizeTextarea(e.target as HTMLTextAreaElement)
                                syncRowHeight(index)
                              }}
                              placeholder="輸入教學內容及實施方式"
                              className="w-full px-4 py-2 border-0 rounded-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none min-h-[40px] overflow-hidden"
                              style={{ height: 'auto' }}
                            />
                          </div>

                          {/* 教學時間 */}
                          <div className="w-16 flex-shrink-0 flex items-start" style={{ borderRight: '1px solid #d1d5db' }}>
                            <textarea
                              data-row-id={`activity-row-${index}`}
                              value={row.teachingTime}
                              onChange={(e) => {
                                const newRows = [...activityRows]
                                newRows[index].teachingTime = e.target.value
                                setActivityRows(newRows)
                                autoResizeTextarea(e.target)
                                syncRowHeight(index)
                              }}
                              onInput={(e) => {
                                autoResizeTextarea(e.target as HTMLTextAreaElement)
                                syncRowHeight(index)
                              }}
                              placeholder="輸入教學時間"
                              className="w-full px-2 py-2 border-0 rounded-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none min-h-[40px] overflow-hidden"
                              style={{ height: 'auto' }}
                            />
                          </div>

                          {/* 教學資源 */}
                          <div className="w-24 flex-shrink-0 flex items-start" style={{ borderRight: '1px solid #d1d5db' }}>
                            <textarea
                              data-row-id={`activity-row-${index}`}
                              value={row.teachingResources}
                              onChange={(e) => {
                                const newRows = [...activityRows]
                                newRows[index].teachingResources = e.target.value
                                setActivityRows(newRows)
                                autoResizeTextarea(e.target)
                                syncRowHeight(index)
                              }}
                              onInput={(e) => {
                                autoResizeTextarea(e.target as HTMLTextAreaElement)
                                syncRowHeight(index)
                              }}
                              placeholder="輸入教學資源"
                              className="w-full px-2 py-2 border-0 rounded-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none min-h-[40px] overflow-hidden"
                              style={{ height: 'auto' }}
                            />
                          </div>

                          {/* 學習評量方式 */}
                          <div className="flex-[2] flex items-start" style={{ borderRight: '1px solid #d1d5db' }}>
                            <textarea
                              data-row-id={`activity-row-${index}`}
                              value={row.assessmentMethods}
                              onChange={(e) => {
                                const newRows = [...activityRows]
                                newRows[index].assessmentMethods = e.target.value
                                setActivityRows(newRows)
                                autoResizeTextarea(e.target)
                                syncRowHeight(index)
                              }}
                              onInput={(e) => {
                                autoResizeTextarea(e.target as HTMLTextAreaElement)
                                syncRowHeight(index)
                              }}
                              placeholder="輸入學習評量方式"
                              className="w-full px-4 py-2 border-0 rounded-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none min-h-[40px] overflow-hidden"
                              style={{ height: 'auto' }}
                            />
                          </div>

                          {/* 刪除按鈕欄位 */}
                          <div className="w-20 flex-shrink-0 flex items-center justify-center">
                            <button
                              onClick={() => {
                                setActivityRows(activityRows.filter((_, i) => i !== index))
                              }}
                              className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 評量工具 */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      評量工具
                    </label>
                    <textarea
                      value={assessmentTools}
                      onChange={(e) => setAssessmentTools(e.target.value)}
                      placeholder="輸入評量工具"
                      rows={3}
                      className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                    />
                  </div>

                  {/* 參考資料 */}
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">
                      參考資料
                    </label>
                    <textarea
                      value={references}
                      onChange={(e) => setReferences(e.target.value)}
                      placeholder="輸入參考資料"
                      rows={3}
                      className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-800 resize-none"
                    />
                  </div>

                  {/* 儲存按鈕 */}
                  <div className="flex justify-end pt-4">
                    <button 
                      onClick={handleSave}
                      className="px-8 py-2 bg-[rgba(138,99,210,0.9)] text-white rounded-lg font-bold hover:bg-[rgba(138,99,210,1)] transition-colors"
                    >
                      儲存
                    </button>
                  </div>
                </div>
              )}

              {/* 雙向細目表 */}
              {activeTab === 'specification' && (
                <div className="space-y-6">
                  {/* 學習表現與活動、學習目標對應表 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">學習表現與活動、學習目標對應表</h3>
                    {addedLearningPerformances.length > 0 && activityRows.length > 0 ? (
                      <div className="border border-gray-300">
                        {addedLearningPerformances.flatMap((performance, perfIndex) =>
                          performance.content.map((perf, perfContentIndex) => (
                            <div key={`${perfIndex}-${perfContentIndex}`}>
                              {activityRows.map((activity, actIndex) => {
                                const checkId = `perf-${perfIndex}-${perfContentIndex}-${actIndex}`
                                const isChecked = checkedPerformances.has(checkId)
                                
                                return (
                                  <div key={`${perfIndex}-${perfContentIndex}-${actIndex}`}>
                                    {/* 第一行：空白 + 學習表現 */}
                                    {actIndex === 0 && (
                                      <div className="flex" style={{ borderBottom: '1px solid #d1d5db' }}>
                                        <div className="flex-1 bg-gray-50 px-4 py-3" style={{ borderRight: '1px solid #d1d5db' }}>
                                        </div>
                                        <div className="flex-1 bg-gray-50 px-4 py-3 text-gray-800">
                                          {perf.code}: {perf.description}
                                        </div>
                                      </div>
                                    )}
                                    {/* 第二行：活動+學習目標 + 打勾 */}
                                    <div className="flex" style={{ borderBottom: '1px solid #d1d5db' }}>
                                      <div className="flex-1 px-4 py-3 text-gray-800" style={{ borderRight: '1px solid #d1d5db' }}>
                                        <div className="mb-2">
                                          <span className="font-bold text-gray-700">活動：</span>
                                          <div className="mt-1">{activity.teachingContent}</div>
                                        </div>
                                        <div>
                                          <span className="font-bold text-gray-700">學習目標：</span>
                                          <div className="mt-1">{learningObjectives}</div>
                                        </div>
                                      </div>
                                      <div 
                                        className="flex-1 px-4 py-3 text-center text-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                          const newChecked = new Set(checkedPerformances)
                                          if (isChecked) {
                                            newChecked.delete(checkId)
                                          } else {
                                            newChecked.add(checkId)
                                          }
                                          setCheckedPerformances(newChecked)
                                        }}
                                      >
                                        {isChecked && <span className="text-green-600">✓</span>}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-8 border border-gray-300 rounded-lg">
                        {addedLearningPerformances.length === 0 ? '尚未新增學習表現' : '尚未新增活動'}
                      </div>
                    )}
                  </div>

                  {/* 學習內容與活動、學習目標對應表 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">學習內容與活動、學習目標對應表</h3>
                    {addedLearningContents.length > 0 && activityRows.length > 0 ? (
                      <div className="border border-gray-300">
                        {addedLearningContents.flatMap((contentGroup, contIndex) =>
                          contentGroup.content.map((cont, contContentIndex) => (
                            <div key={`${contIndex}-${contContentIndex}`}>
                              {activityRows.map((activity, actIndex) => {
                                const checkId = `cont-${contIndex}-${contContentIndex}-${actIndex}`
                                const isChecked = checkedContents.has(checkId)
                                
                                return (
                                  <div key={`${contIndex}-${contContentIndex}-${actIndex}`}>
                                    {/* 第一行：空白 + 學習內容 */}
                                    {actIndex === 0 && (
                                      <div className="flex" style={{ borderBottom: '1px solid #d1d5db' }}>
                                        <div className="flex-1 bg-gray-50 px-4 py-3" style={{ borderRight: '1px solid #d1d5db' }}>
                                        </div>
                                        <div className="flex-1 bg-gray-50 px-4 py-3 text-gray-800">
                                          {cont.code}: {cont.description}
                                        </div>
                                      </div>
                                    )}
                                    {/* 第二行：活動+學習目標 + 打勾 */}
                                    <div className="flex" style={{ borderBottom: '1px solid #d1d5db' }}>
                                      <div className="flex-1 px-4 py-3 text-gray-800" style={{ borderRight: '1px solid #d1d5db' }}>
                                        <div className="mb-2">
                                          <span className="font-bold text-gray-700">活動：</span>
                                          <div className="mt-1">{activity.teachingContent}</div>
                                        </div>
                                        <div>
                                          <span className="font-bold text-gray-700">學習目標：</span>
                                          <div className="mt-1">{learningObjectives}</div>
                                        </div>
                                      </div>
                                      <div 
                                        className="flex-1 px-4 py-3 text-center text-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                                        onClick={() => {
                                          const newChecked = new Set(checkedContents)
                                          if (isChecked) {
                                            newChecked.delete(checkId)
                                          } else {
                                            newChecked.add(checkId)
                                          }
                                          setCheckedContents(newChecked)
                                        }}
                                      >
                                        {isChecked && <span className="text-green-600">✓</span>}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          ))
                        )}
                      </div>
                    ) : (
                      <div className="text-gray-500 text-center py-8 border border-gray-300 rounded-lg">
                        {addedLearningContents.length === 0 ? '尚未新增學習內容' : '尚未新增活動'}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 預覽教案標籤頁 */}
              {activeTab === 'preview' && (
                <div className="space-y-0">
                  {/* 表格樣式的教案預覽 */}
                  <div className="border border-gray-400 bg-white text-sm">
                    {/* 第一行：教案標題 + 設計者 */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        教案標題
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        {lessonPlanTitle || ''}
                      </div>
                      <div className="w-20 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        設計者
                      </div>
                      <div className="w-32 px-2 py-1.5 text-gray-800 text-xs">
                        {designer || ''}
                      </div>
                    </div>

                    {/* 第二行：課程領域 + 授課時間 */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        課程領域
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        {courseDomain || ''}
                      </div>
                      <div className="w-20 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        授課時間
                      </div>
                      <div className="w-32 px-2 py-1.5 text-gray-800 text-xs">
                        {teachingTimeLessons && teachingTimeMinutes
                          ? `${teachingTimeLessons} 節課,共 ${teachingTimeMinutes} 分鐘`
                          : teachingTimeLessons
                          ? `${teachingTimeLessons} 節課`
                          : teachingTimeMinutes
                          ? `${teachingTimeMinutes} 分鐘`
                          : ''}
                      </div>
                    </div>

                    {/* 第三行：單元名稱 */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        單元名稱
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 text-xs">
                        {unitName || ''}
                      </div>
                    </div>

                    {/* 第四行：實施年級（學段 + 年級） */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        實施年級
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 text-xs">
                        {schoolLevel && implementationGrade 
                          ? `${schoolLevel} ${implementationGrade}年級` 
                          : (schoolLevel || (implementationGrade ? `${implementationGrade}年級` : ''))}
                      </div>
                    </div>

                    {/* 第五行：核心素養 */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        核心素養
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 min-h-[50px] text-xs">
                        {addedCoreCompetencies.length > 0 ? (
                          <div className="space-y-1">
                            {addedCoreCompetencies.map((item, index) => (
                              <div key={index} className="whitespace-pre-wrap">
                                {item.content}
                              </div>
                            ))}
                          </div>
                        ) : ''}
                      </div>
                    </div>

                    {/* 第六行：學習表現 */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        學習表現
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 min-h-[50px] text-xs">
                        {addedLearningPerformances.length > 0 ? (
                          <div className="space-y-1">
                            {addedLearningPerformances.flatMap((performance, perfIndex) =>
                              performance.content.map((perf, perfContentIndex) => (
                                <div key={`${perfIndex}-${perfContentIndex}`} className="whitespace-pre-wrap">
                                  {perf.code}: {perf.description}
                                </div>
                              ))
                            )}
                          </div>
                        ) : ''}
                      </div>
                    </div>

                    {/* 第七行：學習內容 */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        學習內容
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 min-h-[50px] text-xs">
                        {addedLearningContents.length > 0 ? (
                          <div className="space-y-1">
                            {addedLearningContents.flatMap((contentGroup, contIndex) =>
                              contentGroup.content.map((cont, contContentIndex) => (
                                <div key={`${contIndex}-${contContentIndex}`} className="whitespace-pre-wrap">
                                  {cont.code}: {cont.description}
                                </div>
                              ))
                            )}
                          </div>
                        ) : ''}
                      </div>
                    </div>

                    {/* 第八行：教材來源 */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        教材來源
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 whitespace-pre-wrap text-xs" style={{ minHeight: '36px', wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}>
                        {materialSource || ''}
                      </div>
                    </div>

                    {/* 第九行：教學設備/資源 */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        教學設備/資源
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 whitespace-pre-wrap text-xs" style={{ minHeight: '36px', wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}>
                        {teachingEquipment || ''}
                      </div>
                    </div>

                    {/* 第十行：學習目標 */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        學習目標
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 whitespace-pre-wrap text-xs" style={{ minHeight: '60px', wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}>
                        {learningObjectives || ''}
                      </div>
                    </div>

                    {/* 留白區域（只有背景色，沒有邊框和內容） */}
                    <div className="min-h-[40px]" style={{ backgroundColor: '#FEFBFF', marginLeft: '-1px', marginRight: '-1px', width: 'calc(100% + 2px)' }}>
                    </div>

                    {/* 學習活動設計（整欄都是標題） */}
                    <div className="flex" style={{ borderTop: '1px solid #9ca3af', borderBottom: '1px solid #9ca3af' }}>
                      <div className="flex-1 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs text-center">
                        學習活動設計
                      </div>
                    </div>

                    {/* 活動與評量設計表格 */}
                    <div style={{ borderBottom: '1px solid #9ca3af' }}>
                      {/* 表頭行 */}
                      <div className="flex bg-gray-100">
                        <div className="flex-[3] px-2 py-1.5 font-medium text-gray-700 text-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                          教學內容及實施方式
                        </div>
                        <div className="w-16 px-1 py-1.5 font-medium text-gray-700 text-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                          教學時間
                        </div>
                        <div className="w-20 px-1 py-1.5 font-medium text-gray-700 text-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                          教學資源
                        </div>
                        <div className="flex-[2] px-2 py-1.5 font-medium text-gray-700 text-center text-xs">
                          學習評量方式
                        </div>
                      </div>
                      {/* 活動內容行 */}
                      {activityRows.length > 0 ? (
                        activityRows.map((activity, index) => {
                          // 計算這一行的最大高度
                          const getRowHeight = () => {
                            const content = activity.teachingContent || ''
                            const time = activity.teachingTime || ''
                            const resources = activity.teachingResources || ''
                            const assessment = activity.assessmentMethods || ''
                            
                            // 簡單估算：每行約 20px，加上 padding
                            const contentLines = content.split('\n').length || 1
                            const timeLines = time.split('\n').length || 1
                            const resourcesLines = resources.split('\n').length || 1
                            const assessmentLines = assessment.split('\n').length || 1
                            
                            const maxLines = Math.max(contentLines, timeLines, resourcesLines, assessmentLines)
                            return Math.max(40, maxLines * 20 + 12)
                          }
                          
                          const rowHeight = getRowHeight()
                          
                          return (
                            <div key={activity.id} className="flex" style={{ borderTop: '1px solid #9ca3af' }}>
                              <div className="flex-[3] px-2 py-1.5 text-gray-800 whitespace-pre-wrap text-xs border-r border-gray-400" style={{ minHeight: `${rowHeight}px`, wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0, borderRightWidth: '1px', borderRightStyle: 'solid', borderRightColor: '#9ca3af' }}>
                                {activity.teachingContent || ''}
                              </div>
                              <div className="w-16 flex-shrink-0 px-1 py-1.5 text-gray-800 text-xs whitespace-pre-wrap border-r border-gray-400" style={{ minHeight: `${rowHeight}px`, wordBreak: 'break-word', overflowWrap: 'break-word', borderRightWidth: '1px', borderRightStyle: 'solid', borderRightColor: '#9ca3af' }}>
                                {activity.teachingTime || ''}
                              </div>
                              <div className="w-20 flex-shrink-0 px-1 py-1.5 text-gray-800 text-xs whitespace-pre-wrap border-r border-gray-400" style={{ minHeight: `${rowHeight}px`, wordBreak: 'break-word', overflowWrap: 'break-word', borderRightWidth: '1px', borderRightStyle: 'solid', borderRightColor: '#9ca3af' }}>
                                {activity.teachingResources || ''}
                              </div>
                              <div className="flex-[2] px-2 py-1.5 text-gray-800 whitespace-pre-wrap text-xs" style={{ minHeight: `${rowHeight}px`, wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}>
                                {activity.assessmentMethods || ''}
                              </div>
                            </div>
                          )
                        })
                      ) : (
                        <div className="flex" style={{ borderTop: '1px solid #9ca3af' }}>
                          <div className="flex-1 px-2 py-1.5 text-gray-800 min-h-[36px] text-xs"></div>
                        </div>
                      )}
                    </div>

                    {/* 評量工具 */}
                    <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        評量工具
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 whitespace-pre-wrap text-xs" style={{ minHeight: '50px', wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}>
                        {assessmentTools || ''}
                      </div>
                    </div>

                    {/* 參考資料 */}
                    <div className="flex">
                      <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
                        參考資料
                      </div>
                      <div className="flex-1 px-2 py-1.5 text-gray-800 whitespace-pre-wrap text-xs" style={{ minHeight: '50px', wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}>
                        {references || ''}
                      </div>
                    </div>
                  </div>

                  {/* 底部按鈕 */}
                  <div className="flex justify-between pt-6">
                    <button
                      onClick={onBack}
                      className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                    >
                      返回
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-6 py-2 bg-[#6D28D9] text-white rounded-lg font-medium hover:bg-[#5B21B6] transition-colors flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M5.33333 6.66667L8 9.33333L10.6667 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 9.33333V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      下載 Word
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* 右側區域 - 想法收斂結果（僅在課程目標和活動與評量設計標籤頁顯示） */}
            {(activeTab === 'objectives' || activeTab === 'activity') && (
              <div className="w-96 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200">
                {/* 標題欄 */}
                <div className="bg-gradient-to-r from-purple-400 to-purple-600 px-6 py-4 rounded-t-lg">
                  <h2 className="text-white font-semibold text-lg">想法收斂結果</h2>
                </div>
                {/* 內容區域 */}
                <div className="flex-1 p-6 overflow-y-auto max-h-[600px]">
                  {convergenceResults.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">尚無收斂結果</p>
                  ) : (
                    <div className="space-y-3">
                      {convergenceResults.map((result) => (
                        <div
                          key={result.id}
                          className="border border-gray-200 rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          {/* 收斂標籤 */}
                          <div className="mb-1.5">
                            <span className="text-sm font-bold text-gray-700">
                              [{result.stage}]
                            </span>
                          </div>
                          {/* 收斂內容 */}
                          <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {result.content}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

