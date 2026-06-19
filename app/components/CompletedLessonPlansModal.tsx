'use client'

import { useEffect, useState } from 'react'
import { Packer } from 'docx'
import {
  generateLessonPlanWordDocument,
  type LessonPlanWordData,
} from '@/lib/generateLessonPlanWord'
import {
  type CompletedLessonPlanItem,
  type LessonPlanSnapshotData,
  parseLearningObjectivesArray,
} from '@/lib/lessonPlanSnapshot'

function mapSnapshotToWordData(data: LessonPlanSnapshotData): LessonPlanWordData {
  return {
    lessonPlanTitle: data.lessonPlanTitle || '',
    designer: data.designer || '',
    courseDomain: data.courseDomain || '',
    teachingTimeLessons: data.teachingTimeLessons?.toString() || '',
    teachingTimeMinutes: data.teachingTimeMinutes?.toString() || '',
    unitName: data.unitName || '',
    schoolLevel: data.schoolLevel || '',
    implementationGrade: data.implementationGrade || '',
    materialSource: data.materialSource || '',
    teachingEquipment: data.teachingEquipment || '',
    learningObjectives: parseLearningObjectivesArray(data.learningObjectives),
    addedCoreCompetencies: data.addedCoreCompetencies || [],
    addedLearningPerformances: (data.addedLearningPerformances || []).map((group) => ({
      ...group,
      content: group.content || [],
    })),
    addedLearningContents: (data.addedLearningContents || []).map((group) => ({
      ...group,
      content: group.content || [],
    })),
    activityRows: (data.activityRows || []).map((row) => ({
      id: row.id,
      sequenceNumber: row.sequenceNumber || '',
      selectedLearningObjectives: row.selectedLearningObjectives || [],
      activityFlow: row.activityFlow || '',
      time: row.time || '',
      assessmentMethod: row.assessmentMethod || '',
      notes: row.notes || '',
    })),
  }
}

function sortActivityRows(rows: NonNullable<LessonPlanSnapshotData['activityRows']>) {
  return [...rows].sort((a, b) => {
    const seqA = a.sequenceNumber || ''
    const seqB = b.sequenceNumber || ''
    if (!seqA && !seqB) return a.id.localeCompare(b.id)
    if (!seqA) return 1
    if (!seqB) return -1
    const parseSequence = (seq: string) =>
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

export function LessonPlanPreviewContent({ data }: { data: LessonPlanSnapshotData }) {
  const learningObjectives = parseLearningObjectivesArray(data.learningObjectives)
  const activityRows = data.activityRows || []
  const teachingTimeLessons = data.teachingTimeLessons?.toString() || ''
  const teachingTimeMinutes = data.teachingTimeMinutes?.toString() || ''

  return (
    <div className="border border-gray-400 bg-white text-sm">
      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
          教案標題
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
          {data.lessonPlanTitle || ''}
        </div>
        <div className="w-20 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
          設計者
        </div>
        <div className="w-32 px-2 py-1.5 text-gray-800 text-xs">{data.designer || ''}</div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
          課程領域
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
          {data.courseDomain || ''}
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

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
          單元名稱
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 text-xs">{data.unitName || ''}</div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 flex items-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
          實施年級
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 text-xs">
          {data.schoolLevel && data.implementationGrade
            ? `${data.schoolLevel} ${data.implementationGrade}年級`
            : data.schoolLevel || (data.implementationGrade ? `${data.implementationGrade}年級` : '')}
        </div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
          核心素養
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 min-h-[50px] text-xs">
          {(data.addedCoreCompetencies || []).map((item, index) => (
            <div key={index} className="whitespace-pre-wrap">
              {item.content}
            </div>
          ))}
        </div>
      </div>

      <div className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div className="w-24 px-2 py-1.5 bg-gray-100 font-medium text-gray-700 text-xs" style={{ borderRight: '1px solid #9ca3af' }}>
          學習目標
        </div>
        <div className="flex-1 px-2 py-1.5 text-gray-800 min-h-[50px] text-xs">
          {learningObjectives.map((obj, index) => (
            <div key={index} className="whitespace-pre-wrap mb-1">
              {obj.content}
            </div>
          ))}
        </div>
      </div>

      <div className="flex bg-gray-100" style={{ borderBottom: '1px solid #9ca3af' }}>
        <div className="flex-1 px-2 py-1.5 font-medium text-gray-700 text-xs text-center">學習活動設計</div>
      </div>

      <div style={{ borderBottom: '1px solid #9ca3af' }}>
        <div className="flex bg-gray-100">
          <div className="w-8 px-2 py-1.5 font-medium text-gray-700 text-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>#</div>
          <div className="flex-[2] px-2 py-1.5 font-medium text-gray-700 text-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>活動目標</div>
          <div className="flex-[6] px-2 py-1.5 font-medium text-gray-700 text-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>活動流程</div>
          <div className="w-12 px-1 py-1.5 font-medium text-gray-700 text-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>時間</div>
          <div className="flex-[2] px-2 py-1.5 font-medium text-gray-700 text-center text-xs" style={{ borderRight: '1px solid #9ca3af' }}>評量方式</div>
          <div className="w-12 px-1 py-1.5 font-medium text-gray-700 text-center text-xs">備註</div>
        </div>
        {activityRows.length > 0 ? (
          sortActivityRows(activityRows).map((activity, index) => {
            const selectedObjectives = (activity.selectedLearningObjectives || [])
              .map((idx) => {
                const objIdx = parseInt(idx, 10)
                return learningObjectives[objIdx]?.content || ''
              })
              .filter(Boolean)
              .join('、')
            return (
              <div key={activity.id} className="flex" style={{ borderBottom: '1px solid #9ca3af' }}>
                <div className="w-8 px-2 py-1.5 text-gray-800 text-xs text-center" style={{ borderRight: '1px solid #9ca3af' }}>
                  {activity.sequenceNumber || index + 1}
                </div>
                <div className="flex-[2] px-2 py-1.5 text-gray-800 text-xs whitespace-pre-wrap" style={{ borderRight: '1px solid #9ca3af' }}>
                  {selectedObjectives}
                </div>
                <div className="flex-[6] px-2 py-1.5 text-gray-800 text-xs whitespace-pre-wrap" style={{ borderRight: '1px solid #9ca3af' }}>
                  {activity.activityFlow || ''}
                </div>
                <div className="w-12 px-1 py-1.5 text-gray-800 text-xs whitespace-pre-wrap" style={{ borderRight: '1px solid #9ca3af' }}>
                  {activity.time || ''}
                </div>
                <div className="flex-[2] px-2 py-1.5 text-gray-800 text-xs whitespace-pre-wrap" style={{ borderRight: '1px solid #9ca3af' }}>
                  {activity.assessmentMethod || ''}
                </div>
                <div className="w-12 px-1 py-1.5 text-gray-800 text-xs whitespace-pre-wrap">{activity.notes || ''}</div>
              </div>
            )
          })
        ) : (
          <div className="px-2 py-3 text-xs text-gray-400 text-center">尚無活動資料</div>
        )}
      </div>
    </div>
  )
}

interface CompletedLessonPlansModalProps {
  open: boolean
  onClose: () => void
  items: CompletedLessonPlanItem[]
  isLoading?: boolean
}

export default function CompletedLessonPlansModal({
  open,
  onClose,
  items,
  isLoading = false,
}: CompletedLessonPlansModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  useEffect(() => {
    if (open) {
      setSelectedId(items[0]?.id ?? null)
    }
  }, [open, items])

  if (!open) return null

  const selected = items.find((item) => item.id === selectedId) ?? items[0] ?? null

  const handleDownload = async () => {
    if (!selected) return

    setIsDownloading(true)
    try {
      const wordData = mapSnapshotToWordData(selected.lessonPlanData)
      const safeBase =
        (selected.title || wordData.lessonPlanTitle || '教案').replace(/[\\/:*?"<>|]/g, '_').trim() ||
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
    } catch (error) {
      console.error('下載教案失敗:', error)
      alert('下載教案失敗，請稍後再試')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-black/50" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-[121] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto flex h-[min(720px,90vh)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="completed-lesson-plans-title"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <h2 id="completed-lesson-plans-title" className="text-lg font-bold text-gray-900">
              已完成教案
            </h2>
            <div className="flex items-center gap-2">
              {selected && (
                <button
                  type="button"
                  onClick={() => void handleDownload()}
                  disabled={isDownloading}
                  className="flex items-center gap-2 rounded-lg bg-[#6D28D9] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5B21B6] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.33333 6.66667L8 9.33333L10.6667 6.66667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 9.33333V2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {isDownloading ? '下載中…' : '下載 Word'}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="關閉"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1">
            <div className="w-56 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50/80 p-3">
              {isLoading ? (
                <p className="py-4 text-center text-sm text-gray-500">載入中…</p>
              ) : items.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-500">尚無已完成教案</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(item.id)}
                        className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors ${
                          selected?.id === item.id
                            ? 'bg-purple-100 text-[#6D28D9] ring-1 ring-purple-200'
                            : 'bg-white text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-sm font-semibold line-clamp-2">{item.title}</div>
                        <div className="mt-1 text-xs text-gray-500">
                          {item.completedDate} {item.completedTime}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="min-w-0 flex-1 overflow-y-auto p-4">
              {selected ? (
                <>
                  <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <h3 className="text-base font-semibold text-gray-900">{selected.title}</h3>
                    <span className="text-xs text-gray-500">
                      封存於 {selected.completedDate} {selected.completedTime}
                      {selected.completedByName ? ` · ${selected.completedByName}` : ''}
                    </span>
                  </div>
                  <LessonPlanPreviewContent data={selected.lessonPlanData} />
                </>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  請從左側選擇要預覽的教案
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
