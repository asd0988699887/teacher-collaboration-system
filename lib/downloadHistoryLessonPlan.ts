import { Packer } from 'docx'
import { mapLessonPlanApiToPreview } from '@/app/components/HistoryLessonPreviewModal'
import {
  generateLessonPlanWordDocument,
  type LessonPlanWordData,
} from '@/lib/generateLessonPlanWord'

/** 歷史活動：依活動 ID 從 API 載入並下載 Word 教案 */
export async function downloadHistoryLessonPlan(
  historyActivityId: string,
  fileBaseName: string
) {
  const res = await fetch(`/api/lesson-plans/${historyActivityId}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || '載入教案失敗')
  }
  const m = mapLessonPlanApiToPreview(data)
  if (!m) {
    throw new Error('此活動尚無教案資料可下載')
  }
  const wordData: LessonPlanWordData = {
    lessonPlanTitle: m.lessonPlanTitle,
    designer: m.designer,
    courseDomain: m.courseDomain,
    teachingTimeLessons: m.teachingTimeLessons,
    teachingTimeMinutes: m.teachingTimeMinutes,
    unitName: m.unitName,
    schoolLevel: m.schoolLevel,
    implementationGrade: m.implementationGrade,
    materialSource: m.materialSource,
    teachingEquipment: m.teachingEquipment,
    learningObjectives: m.learningObjectives,
    addedCoreCompetencies: m.addedCoreCompetencies,
    addedLearningPerformances: m.addedLearningPerformances.map((g) => ({
      ...g,
      content: g.content || [],
    })),
    addedLearningContents: m.addedLearningContents.map((g) => ({
      ...g,
      content: g.content || [],
    })),
    activityRows: m.activityRows.map((r) => ({
      id: r.id,
      sequenceNumber: r.sequenceNumber,
      selectedLearningObjectives: r.selectedLearningObjectives,
      activityFlow: r.activityFlow,
      time: r.time,
      assessmentMethod: r.assessmentMethod,
      notes: r.notes,
    })),
  }
  const safeBase =
    (fileBaseName && fileBaseName.replace(/[\\/:*?"<>|]/g, '_').trim()) ||
    m.lessonPlanTitle.replace(/[\\/:*?"<>|]/g, '_').trim() ||
    '教案'
  const fileName = `${safeBase}_${new Date().toISOString().split('T')[0]}.docx`
  const doc = await generateLessonPlanWordDocument(wordData)
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
