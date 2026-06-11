'use client'

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ShadingType, PageOrientation, VerticalAlign } from 'docx'

export type LessonPlanWordActivityRow = {
  id: string
  sequenceNumber: string
  selectedLearningObjectives: string[]
  activityFlow: string
  time: string
  assessmentMethod: string
  notes: string
}

export type LessonPlanWordData = {
  lessonPlanTitle: string
  designer: string
  courseDomain: string
  teachingTimeLessons: string
  teachingTimeMinutes: string
  unitName: string
  schoolLevel: string
  implementationGrade: string
  materialSource: string
  teachingEquipment: string
  learningObjectives: Array<{ content: string }>
  addedCoreCompetencies: Array<{ content: string }>
  addedLearningPerformances: Array<{
    content: Array<{ code: string; description: string }>
  }>
  addedLearningContents: Array<{
    content: Array<{ code: string; description: string }>
  }>
  activityRows: LessonPlanWordActivityRow[]
}

function sortActivityRows(rows: LessonPlanWordActivityRow[]) {
    return [...rows].sort((a, b) => {
      const seqA = a.sequenceNumber || ''
      const seqB = b.sequenceNumber || ''
      
      // 如果兩個序號都為空，使用 id 來穩定排序
      if (!seqA && !seqB) {
        return a.id.localeCompare(b.id)
      }
      if (!seqA) return 1 // 空序號排在後面
      if (!seqB) return -1
      
      // 解析序號：支持純數字（如 "1"）和帶連字符的格式（如 "1-2", "2-1"）
      const parseSequence = (seq: string): number[] => {
        return seq.split('-').map(part => {
          const num = parseInt(part.trim(), 10)
          return isNaN(num) ? 0 : num
        })
      }
      
      const partsA = parseSequence(seqA)
      const partsB = parseSequence(seqB)
      
      // 比較每個部分
      const maxLength = Math.max(partsA.length, partsB.length)
      for (let i = 0; i < maxLength; i++) {
        const partA = partsA[i] || 0
        const partB = partsB[i] || 0
        
        if (partA !== partB) {
          return partA - partB
        }
      }
      
      // 如果所有部分都相同，使用 id 來穩定排序
      return a.id.localeCompare(b.id)
    })
  }

export async function generateLessonPlanWordDocument(o: LessonPlanWordData) {
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
    
    const teachingTimeText = o.teachingTimeLessons && o.teachingTimeMinutes
      ? `${o.teachingTimeLessons} 節課,共 ${o.teachingTimeMinutes} 分鐘`
      : o.teachingTimeLessons
      ? `${o.teachingTimeLessons} 節課`
      : o.teachingTimeMinutes
      ? `${o.teachingTimeMinutes} 分鐘`
      : ''
    
    const coreCompetencyText = o.addedCoreCompetencies.length > 0
      ? o.addedCoreCompetencies.map(c => c.content).join('\n')
      : ''
    
    const learningPerformanceText = o.addedLearningPerformances.length > 0
      ? o.addedLearningPerformances.flatMap(p => p.content.map(c => `${c.code}: ${c.description}`)).join('\n')
      : ''
    
    const learningContentText = o.addedLearningContents.length > 0
      ? o.addedLearningContents.flatMap(c => c.content.map(cont => `${cont.code}: ${cont.description}`)).join('\n')
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
            children: [new Paragraph({ children: [new TextRun({ text: o.lessonPlanTitle || '', ...textStyle })] })],
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
            children: [new Paragraph({ children: [new TextRun({ text: o.designer || '', ...textStyle })] })],
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
            children: [new Paragraph({ children: [new TextRun({ text: o.courseDomain || '', ...textStyle })] })],
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
            children: [new Paragraph({ children: [new TextRun({ text: o.unitName || '', ...textStyle })] })],
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
                text: o.schoolLevel && o.implementationGrade 
                  ? `${o.schoolLevel} ${o.implementationGrade}年級` 
                  : (o.schoolLevel || (o.implementationGrade ? `${o.implementationGrade}年級` : '')), 
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
            children: [new Paragraph({ children: [new TextRun({ text: o.materialSource || '', ...textStyle })] })],
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
              children: [new TextRun({ text: o.teachingEquipment || '', ...textStyle })],
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
              children: [new TextRun({ 
                text: o.learningObjectives.length > 0 
                  ? o.learningObjectives.map(obj => obj.content).join('\n')
                  : '', 
                ...textStyle 
              })],
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
            columnSpan: 6,
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
      // Row 1: 標題列（#、學習目標、活動流程、時間、評量方式、備註）
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '#', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            width: { size: 6, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 15, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
            },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '活動目標', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            width: { size: 15, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
            },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '活動流程', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            width: { size: 40, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
            },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '時間', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            width: { size: 8, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
            },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '評量方式', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            width: { size: 18, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              bottom: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              left: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
              right: { style: BorderStyle.SINGLE, size: 2, color: '000000' },
            },
          }),
          new TableCell({
            children: [new Paragraph({ 
              children: [new TextRun({ text: '備註', ...headerTextStyle })],
              alignment: AlignmentType.CENTER,
            })],
            width: { size: 13, type: WidthType.PERCENTAGE },
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

    // Row 2: 活動資料列
    if (o.activityRows.length > 0) {
      // 如果有活動資料，為每個活動建立一行
      const sortedRows = sortActivityRows(o.activityRows)
      sortedRows.forEach((row, index) => {
        // 取得選中的學習目標文字
        const selectedObjectives = row.selectedLearningObjectives
          .map(idx => {
            const objIdx = parseInt(idx)
            return o.learningObjectives[objIdx]?.content || ''
          })
          .filter(Boolean)
          .join('、')
        
        const isLastRow = index === sortedRows.length - 1
        
        table2Rows.push(
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: row.sequenceNumber || (index + 1).toString(), ...textStyle })],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 100, before: 100 },
                })],
                width: { size: 6, type: WidthType.PERCENTAGE },
                borders: isLastRow ? outerCornerBottomLeftStyle : outerLeftBorderStyle, // 最後一行使用底部外框
                verticalAlign: VerticalAlign.TOP,
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: selectedObjectives || '', ...textStyle })],
                  spacing: { after: 100, before: 100 },
                })],
                width: { size: 20, type: WidthType.PERCENTAGE },
                ...(isLastRow ? { borders: { ...contentCellStyle.borders, bottom: { style: BorderStyle.SINGLE, size: 15, color: '000000' } } } : contentCellStyle),
                verticalAlign: VerticalAlign.TOP,
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: row.activityFlow || '', ...textStyle })],
                  spacing: { after: 100, before: 100 },
                })],
                width: { size: 35, type: WidthType.PERCENTAGE },
                ...(isLastRow ? { borders: { ...contentCellStyle.borders, bottom: { style: BorderStyle.SINGLE, size: 15, color: '000000' } } } : contentCellStyle),
                verticalAlign: VerticalAlign.TOP,
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: row.time || '', ...textStyle })],
                  spacing: { after: 100, before: 100 },
                })],
                width: { size: 8, type: WidthType.PERCENTAGE },
                ...(isLastRow ? { borders: { ...contentCellStyle.borders, bottom: { style: BorderStyle.SINGLE, size: 15, color: '000000' } } } : contentCellStyle),
                verticalAlign: VerticalAlign.TOP,
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: row.assessmentMethod || '', ...textStyle })],
                  spacing: { after: 100, before: 100 },
                })],
                width: { size: 18, type: WidthType.PERCENTAGE },
                ...(isLastRow ? { borders: { ...contentCellStyle.borders, bottom: { style: BorderStyle.SINGLE, size: 15, color: '000000' } } } : contentCellStyle),
                verticalAlign: VerticalAlign.TOP,
              }),
              new TableCell({
                children: [new Paragraph({ 
                  children: [new TextRun({ text: row.notes || '', ...textStyle })],
                  spacing: { after: 100, before: 100 },
                })],
                width: { size: 13, type: WidthType.PERCENTAGE },
                borders: isLastRow ? outerCornerBottomRightStyle : outerRightBorderStyle, // 最後一行使用底部外框
                verticalAlign: VerticalAlign.TOP,
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
