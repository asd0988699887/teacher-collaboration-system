'use client'

import { useState, useEffect, useCallback } from 'react'

type LearningObj = { content: string }

type PreviewActivityRow = {
  id: string
  sequenceNumber: string
  selectedLearningObjectives: string[]
  activityFlow: string
  time: string
  assessmentMethod: string
  notes: string
}

export type HistoryPreviewModel = {
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
  learningObjectives: LearningObj[]
  addedCoreCompetencies: Array<{ content: string }>
  addedLearningPerformances: Array<{
    content: Array<{ code: string; description: string }>
  }>
  addedLearningContents: Array<{
    content: Array<{ code: string; description: string }>
  }>
  activityRows: PreviewActivityRow[]
}

function normalizeActivityRowsFromApi(rows: any[]): PreviewActivityRow[] {
  if (!Array.isArray(rows)) return []
  return rows.map((row: any) => {
    let notes = row.notes || ''
    let selectedLearningObjectives: string[] = Array.isArray(row.selectedLearningObjectives)
      ? row.selectedLearningObjectives
      : []
    let sequenceNumber = row.sequenceNumber || ''

    if (
      typeof notes === 'string' &&
      notes.trim().startsWith('{') &&
      notes.includes('selectedLearningObjectives')
    ) {
      try {
        const parsed = JSON.parse(notes)
        if (parsed && typeof parsed === 'object') {
          selectedLearningObjectives = parsed.selectedLearningObjectives || []
          notes = parsed.notes || ''
          sequenceNumber = parsed.sequenceNumber || ''
        }
      } catch {
        /* ignore */
      }
    }

    if ((!notes || notes === '') && row.teachingResources) {
      try {
        const parsed = JSON.parse(row.teachingResources)
        if (
          parsed &&
          typeof parsed === 'object' &&
          Array.isArray(parsed.selectedLearningObjectives)
        ) {
          selectedLearningObjectives = parsed.selectedLearningObjectives || []
          notes = parsed.notes || ''
          sequenceNumber = parsed.sequenceNumber || ''
        } else {
          notes = row.teachingResources
        }
      } catch {
        notes = row.teachingResources
      }
    }

    return {
      id: row.id || String(Date.now()),
      sequenceNumber,
      selectedLearningObjectives,
      activityFlow: row.activityFlow || row.teachingContent || '',
      time: row.time || row.teachingTime || '',
      assessmentMethod: row.assessmentMethod || row.assessmentMethods || '',
      notes,
    }
  })
}

function parseLearningObjectives(str: string): LearningObj[] {
  if (!str) return []
  if (str.includes('|||')) {
    return str
      .split('|||')
      .filter((item: string) => item.trim())
      .map((content: string) => ({ content: content.trim() }))
  }
  return [{ content: str.trim() }]
}

function sortActivityRows(rows: PreviewActivityRow[]): PreviewActivityRow[] {
  return [...rows].sort((a, b) => {
    const seqA = a.sequenceNumber || ''
    const seqB = b.sequenceNumber || ''
    if (!seqA && !seqB) return a.id.localeCompare(b.id)
    if (!seqA) return 1
    if (!seqB) return -1
    const parseSequence = (seq: string): number[] =>
      seq.split('-').map((part) => {
        const num = parseInt(part.trim(), 10)
        return Number.isNaN(num) ? 0 : num
      })
    const partsA = parseSequence(seqA)
    const partsB = parseSequence(seqB)
    const maxLength = Math.max(partsA.length, partsB.length)
    for (let i = 0; i < maxLength; i++) {
      const partA = partsA[i] || 0
      const partB = partsB[i] || 0
      if (partA !== partB) return partA - partB
    }
    return a.id.localeCompare(b.id)
  })
}

export function mapLessonPlanApiToPreview(data: any): HistoryPreviewModel | null {
  const lp = data?.lessonPlan
  if (!lp) return null

  return {
    lessonPlanTitle: lp.lessonPlanTitle || '',
    designer: lp.designer || '',
    courseDomain: lp.courseDomain || '',
    teachingTimeLessons: lp.teachingTimeLessons?.toString() || '',
    teachingTimeMinutes: lp.teachingTimeMinutes?.toString() || '',
    unitName: lp.unitName || '',
    schoolLevel: lp.schoolLevel || lp.school_level || '',
    implementationGrade: lp.implementationGrade || '',
    materialSource: lp.materialSource || '',
    teachingEquipment: lp.teachingEquipment || '',
    learningObjectives: parseLearningObjectives(lp.learningObjectives || ''),
    addedCoreCompetencies: Array.isArray(data.coreCompetencies) ? data.coreCompetencies : [],
    addedLearningPerformances: Array.isArray(data.learningPerformances)
      ? data.learningPerformances
      : [],
    addedLearningContents: Array.isArray(data.learningContents) ? data.learningContents : [],
    activityRows: normalizeActivityRowsFromApi(data.activityRows || []),
  }
}

function PreviewTableBody({ m }: { m: HistoryPreviewModel }) {
  const teachingTimeText =
    m.teachingTimeLessons && m.teachingTimeMinutes
      ? `${m.teachingTimeLessons} 節課,共 ${m.teachingTimeMinutes} 分鐘`
      : m.teachingTimeLessons
        ? `${m.teachingTimeLessons} 節課`
        : m.teachingTimeMinutes
          ? `${m.teachingTimeMinutes} 分鐘`
          : ''

  const gradeText =
    m.schoolLevel && m.implementationGrade
      ? `${m.schoolLevel} ${m.implementationGrade}年級`
      : m.schoolLevel || (m.implementationGrade ? `${m.implementationGrade}年級` : '')

  const sortedRows = sortActivityRows(m.activityRows)

  return (
    <div className="border border-gray-400 bg-white text-sm">
      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div
          className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          教案標題
        </div>
        <div
          className="flex-1 px-2 py-1.5 text-gray-800 text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          {m.lessonPlanTitle}
        </div>
        <div
          className="w-20 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          設計者
        </div>
        <div className="w-32 px-2 py-1.5 text-gray-800 text-xs">{m.designer}</div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div
          className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          課程領域
        </div>
        <div
          className="flex-1 px-2 py-1.5 text-gray-800 text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          {m.courseDomain}
        </div>
        <div
          className="w-20 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          授課時間
        </div>
        <div className="w-32 px-2 py-1.5 text-gray-800 text-xs">{teachingTimeText}</div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div
          className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          單元名稱
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 text-xs">{m.unitName}</div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div
          className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          實施年級
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 text-xs">{gradeText}</div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div
          className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          核心素養
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 min-h-[50px] text-xs">
          {m.addedCoreCompetencies.length > 0 ? (
            <div className="space-y-1">
              {m.addedCoreCompetencies.map((item, index) => (
                <div key={index} className="whitespace-pre-wrap">
                  {item.content}
                </div>
              ))}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div
          className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          學習表現
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 min-h-[50px] text-xs">
          {m.addedLearningPerformances.length > 0 ? (
            <div className="space-y-1">
              {m.addedLearningPerformances.flatMap((performance, perfIndex) =>
                (performance.content || []).map((perf, perfContentIndex) => (
                  <div key={`${perfIndex}-${perfContentIndex}`} className="whitespace-pre-wrap">
                    {perf.code}: {perf.description}
                  </div>
                ))
              )}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div
          className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          學習內容
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 min-h-[50px] text-xs">
          {m.addedLearningContents.length > 0 ? (
            <div className="space-y-1">
              {m.addedLearningContents.flatMap((contentGroup, contIndex) =>
                (contentGroup.content || []).map((cont, contContentIndex) => (
                  <div key={`${contIndex}-${contContentIndex}`} className="whitespace-pre-wrap">
                    {cont.code}: {cont.description}
                  </div>
                ))
              )}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div
          className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          教材來源
        </div>
        <div
          className="flex-1 px-2 py-1.5 text-gray-800 whitespace-pre-wrap text-xs"
          style={{ minHeight: '36px', wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}
        >
          {m.materialSource}
        </div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div
          className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          教學設備/資源
        </div>
        <div
          className="flex-1 px-2 py-1.5 text-gray-800 whitespace-pre-wrap text-xs"
          style={{ minHeight: '36px', wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}
        >
          {m.teachingEquipment}
        </div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div
          className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs"
          style={{ borderRight: '1px solid #9ca3af' }}
        >
          學習目標
        </div>
        <div
          className="flex-1 px-2 py-1.5 text-gray-800 whitespace-pre-wrap text-xs"
          style={{ minHeight: '60px', wordBreak: 'break-word', overflowWrap: 'break-word', minWidth: 0 }}
        >
          {m.learningObjectives.length > 0
            ? m.learningObjectives.map((obj) => obj.content).join('\n')
            : ''}
        </div>
      </div>

      <div
        className="min-h-[40px]"
        style={{
          backgroundColor: '#FEFBFF',
          marginLeft: '-1px',
          marginRight: '-1px',
          width: 'calc(100% + 2px)',
        }}
      />

      <div className="flex" style={{ borderTop: '1px solid #9ca3af', borderBottom: '1px solid #9ca3af' }}>
        <div className="flex-1 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs text-center">
          學習活動設計
        </div>
      </div>

      <div style={{ borderBottom: '1px solid #9ca3af' }}>
        <div className="flex bg-gray-100">
          <div
            className="w-8 px-2 py-1.5 font-medium text-gray-700 text-center text-xs"
            style={{ borderRight: '1px solid #9ca3af' }}
          >
            #
          </div>
          <div
            className="flex-[2] px-2 py-1.5 font-medium text-gray-700 text-center text-xs"
            style={{ borderRight: '1px solid #9ca3af' }}
          >
            活動目標
          </div>
          <div
            className="flex-[6] px-2 py-1.5 font-medium text-gray-700 text-center text-xs"
            style={{ borderRight: '1px solid #9ca3af' }}
          >
            活動流程
          </div>
          <div
            className="w-12 px-1 py-1.5 font-medium text-gray-700 text-center text-xs"
            style={{ borderRight: '1px solid #9ca3af' }}
          >
            時間
          </div>
          <div
            className="flex-[2] px-2 py-1.5 font-medium text-gray-700 text-center text-xs"
            style={{ borderRight: '1px solid #9ca3af' }}
          >
            評量方式
          </div>
          <div className="w-12 px-1 py-1.5 font-medium text-gray-700 text-center text-xs">備註</div>
        </div>
        {sortedRows.length > 0 ? (
          sortedRows.map((activity, index) => {
            const selectedObjectives = activity.selectedLearningObjectives
              .map((idx) => {
                const objIdx = parseInt(idx, 10)
                return m.learningObjectives[objIdx]?.content || ''
              })
              .filter(Boolean)
              .join('、')

            const getRowHeight = () => {
              const flowLines = (activity.activityFlow || '').split('\n').length || 1
              const timeLines = (activity.time || '').split('\n').length || 1
              const assessmentLines = (activity.assessmentMethod || '').split('\n').length || 1
              const notesLines = (activity.notes || '').split('\n').length || 1
              const maxLines = Math.max(flowLines, timeLines, assessmentLines, notesLines)
              return Math.max(40, maxLines * 20 + 12)
            }
            const rowHeight = getRowHeight()

            return (
              <div key={activity.id} className="flex">
                <div
                  className="w-8 px-2 py-1.5 text-gray-800 text-xs text-center border-r border-gray-400"
                  style={{
                    minHeight: `${rowHeight}px`,
                    borderRightWidth: '1px',
                    borderRightStyle: 'solid',
                    borderRightColor: '#9ca3af',
                  }}
                >
                  {activity.sequenceNumber || index + 1}
                </div>
                <div
                  className="flex-[2] px-2 py-1.5 text-gray-800 text-xs whitespace-pre-wrap border-r border-gray-400"
                  style={{
                    minHeight: `${rowHeight}px`,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    minWidth: 0,
                    borderRightWidth: '1px',
                    borderRightStyle: 'solid',
                    borderRightColor: '#9ca3af',
                  }}
                >
                  {selectedObjectives}
                </div>
                <div
                  className="flex-[6] px-2 py-1.5 text-gray-800 text-xs whitespace-pre-wrap border-r border-gray-400"
                  style={{
                    minHeight: `${rowHeight}px`,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    minWidth: 0,
                    borderRightWidth: '1px',
                    borderRightStyle: 'solid',
                    borderRightColor: '#9ca3af',
                  }}
                >
                  {activity.activityFlow}
                </div>
                <div
                  className="w-12 flex-shrink-0 px-1 py-1.5 text-gray-800 text-xs whitespace-pre-wrap border-r border-gray-400"
                  style={{
                    minHeight: `${rowHeight}px`,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    borderRightWidth: '1px',
                    borderRightStyle: 'solid',
                    borderRightColor: '#9ca3af',
                  }}
                >
                  {activity.time}
                </div>
                <div
                  className="flex-[2] px-2 py-1.5 text-gray-800 text-xs whitespace-pre-wrap border-r border-gray-400"
                  style={{
                    minHeight: `${rowHeight}px`,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                    minWidth: 0,
                    borderRightWidth: '1px',
                    borderRightStyle: 'solid',
                    borderRightColor: '#9ca3af',
                  }}
                >
                  {activity.assessmentMethod}
                </div>
                <div
                  className="w-12 flex-shrink-0 px-1 py-1.5 text-gray-800 text-xs whitespace-pre-wrap"
                  style={{
                    minHeight: `${rowHeight}px`,
                    wordBreak: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {activity.notes}
                </div>
              </div>
            )
          })
        ) : (
          <div className="flex">
            <div className="flex-1 px-2 py-1.5 text-gray-800 min-h-[36px] text-xs" />
          </div>
        )}
      </div>
    </div>
  )
}

interface HistoryLessonPreviewModalProps {
  open: boolean
  activityId: string | null
  /** 卡片標題（教案標題或活動名） */
  subtitle?: string
  onClose: () => void
}

export default function HistoryLessonPreviewModal({
  open,
  activityId,
  subtitle,
  onClose,
}: HistoryLessonPreviewModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<HistoryPreviewModel | null>(null)

  const load = useCallback(async () => {
    if (!activityId) return
    setLoading(true)
    setError(null)
    setModel(null)
    try {
      const res = await fetch(`/api/lesson-plans/${activityId}`)
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || '載入教案失敗')
      }
      const mapped = mapLessonPlanApiToPreview(data)
      setModel(mapped)
    } catch (e: any) {
      setError(e.message || '載入失敗')
    } finally {
      setLoading(false)
    }
  }, [activityId])

  useEffect(() => {
    if (open && activityId) {
      load()
    } else {
      setModel(null)
      setError(null)
    }
  }, [open, activityId, load])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50 cursor-default border-0 w-full h-full"
        aria-label="關閉背景"
        onClick={onClose}
      />
      <div
        className="relative z-10 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-xl shadow-2xl border border-gray-200 bg-[#FEFBFF] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-preview-title"
      >
        <div className="flex-shrink-0 flex items-start justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-white">
          <div>
            <h2 id="history-preview-title" className="text-lg font-bold text-[#6D28D9]">
              歷史教案瀏覽（唯讀）
            </h2>
            {subtitle ? <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 flex-shrink-0"
          >
            關閉
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-5 sm:py-5">
          {loading && <p className="text-gray-600 text-center py-12">載入教案中…</p>}
          {error && <p className="text-red-600 text-center py-8">{error}</p>}
          {!loading && !error && model && <PreviewTableBody m={model} />}
          {!loading && !error && !model && (
            <p className="text-gray-500 text-center py-12">此活動尚無教案資料可預覽。</p>
          )}
        </div>
      </div>
    </div>
  )
}
