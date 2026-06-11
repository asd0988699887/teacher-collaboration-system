/** 教案快照資料（與版本管理 lesson_plan_data 格式一致） */
export interface LessonPlanSnapshotData {
  lessonPlanTitle?: string | null
  courseDomain?: string | null
  designer?: string | null
  unitName?: string | null
  schoolLevel?: string | null
  implementationGrade?: string | null
  teachingTimeLessons?: string | number | null
  teachingTimeMinutes?: string | number | null
  materialSource?: string | null
  teachingEquipment?: string | null
  learningObjectives?: string | null
  assessmentTools?: string | null
  references?: string | null
  addedCoreCompetencies?: Array<{ content: string }>
  addedLearningPerformances?: Array<{
    content: Array<{ code: string; description: string }>
  }>
  addedLearningContents?: Array<{
    content: Array<{ code: string; description: string }>
  }>
  activityRows?: Array<{
    id: string
    sequenceNumber?: string
    selectedLearningObjectives?: string[]
    activityFlow?: string
    time?: string
    assessmentMethod?: string
    notes?: string
  }>
  checkedPerformances?: string[]
  checkedContents?: string[]
}

export interface CompletedLessonPlanItem {
  id: string
  title: string
  completedAt: string
  completedDate: string
  completedTime: string
  completedByName?: string
  lessonPlanData: LessonPlanSnapshotData
}

export function parseLearningObjectivesArray(learningObjectivesStr?: string | null): Array<{ content: string }> {
  if (!learningObjectivesStr) return []
  if (learningObjectivesStr.includes('|||')) {
    return learningObjectivesStr
      .split('|||')
      .filter((item) => item.trim())
      .map((content) => ({ content: content.trim() }))
  }
  return [{ content: learningObjectivesStr.trim() }]
}
