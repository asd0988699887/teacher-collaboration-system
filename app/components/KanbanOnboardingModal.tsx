'use client'

import { useEffect, useState } from 'react'

type StepAnimation = 'addList' | 'addTask' | 'dragTask'

type StepDef = {
  title: string
  description: string
  tip: string
  animationType: StepAnimation
}

const STEPS: StepDef[] = [
  {
    title: '建立工作階段',
    description: '點選「新增列表」按鈕，可建立新的工作階段。',
    tip: '提示：系統預設會建立「待處理」、「進行中」、「已完成」三個工作階段；點選工作階段右上角的「X」可移除該工作階段。',
    animationType: 'addList',
  },
  {
    title: '建立工作任務',
    description: '點選各工作階段中的「新增任務」按鈕，可建立工作任務。',
    tip: '提示：任務卡片左下角顯示此任務的負責人，右下角顯示此任務建立於多久之前。',
    animationType: 'addTask',
  },
  {
    title: '改變任務階段',
    description: '可透過拖曳任務卡片，將任務移動到不同的工作階段。',
    tip: '提示：點選任務卡片右上角的三點按鈕，可「編輯任務」內容或「刪除任務」。',
    animationType: 'dragTask',
  },
]

function CursorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M5 3L19 12L12 13L9 20L5 3Z"
        fill="white"
        stroke="#1f2937"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StepIllustration({ stepIndex }: { stepIndex: number }) {
  const step = STEPS[stepIndex]

  if (step.animationType === 'addList') {
    return (
      <div className="relative w-full h-[128px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 overflow-hidden">
        <div className="absolute top-2.5 left-2.5 z-[1]">
          <span className="inline-flex items-center gap-0.5 rounded-lg bg-[rgba(138,99,210,0.9)] px-2.5 py-1.5 text-[10px] font-medium text-white shadow-sm">
            + 新增列表
          </span>
        </div>
        <div className="absolute top-2.5 right-2 flex items-center gap-1">
          {['待處理', '進行中', '已完成'].map((label) => (
            <div
              key={label}
              className="relative flex w-[52px] items-center justify-center rounded-md border border-gray-200 bg-white px-1 py-1.5 shadow-sm"
            >
              <button
                type="button"
                className="absolute right-0.5 top-1/2 flex h-3.5 w-3.5 -translate-y-1/2 items-center justify-center rounded text-[9px] leading-none text-gray-400"
                aria-hidden
              >
                ×
              </button>
              <div className="truncate text-center text-[8px] font-medium leading-none text-gray-600">
                {label}
              </div>
            </div>
          ))}
        </div>
        <div
          className="kanban-onboard-ripple-add-list pointer-events-none absolute z-[2] rounded-full border-2 border-[rgba(138,99,210,0.5)] bg-[rgba(138,99,210,0.12)]"
          aria-hidden
        />
        <CursorIcon className="kanban-onboard-cursor-add-list pointer-events-none z-[3]" />
      </div>
    )
  }

  if (step.animationType === 'addTask') {
    return (
      <div className="relative flex h-[128px] w-full items-start justify-center rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 pt-3">
        <div className="relative w-[min(200px,85%)] rounded-lg border border-gray-200 bg-white p-2 shadow-sm">
          <div className="flex items-center justify-between text-[10px] font-semibold text-gray-800">
            <span>進行中</span>
            <span className="text-gray-400">×</span>
          </div>
          <button
            type="button"
            className="mt-1.5 w-full rounded-md bg-[rgba(138,99,210,0.9)] py-1.5 text-center text-[10px] font-medium text-white"
            aria-hidden
          >
            新增任務
          </button>
          <div className="relative mt-2 rounded border border-gray-100 bg-gray-50/80 p-1.5">
            <div className="text-[9px] font-medium text-gray-800">範例任務</div>
            <div className="mt-2 flex items-end justify-between gap-1">
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500 text-[9px] font-semibold leading-none text-white"
                aria-hidden
              >
                威
              </span>
              <span className="shrink-0 text-[8px] text-gray-400">3個月前</span>
            </div>
          </div>
          <div
            className="kanban-onboard-ripple-add-task pointer-events-none absolute z-[2] h-7 w-7 rounded-full border-2 border-[rgba(138,99,210,0.5)] bg-[rgba(138,99,210,0.12)]"
            aria-hidden
          />
          <CursorIcon className="kanban-onboard-cursor-add-task pointer-events-none absolute z-[3]" />
        </div>
      </div>
    )
  }

  // dragTask
  return (
    <div className="relative flex h-[128px] w-full items-end justify-center gap-1.5 rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 px-2 pb-3 pt-2">
      {(['待處理', '進行中', '已完成'] as const).map((label, i) => (
        <div
          key={label}
          className={`relative flex h-[88px] w-[56px] flex-col rounded-md border border-dashed border-gray-300 bg-white/90 ${
            i === 1 ? 'border-purple-200 bg-purple-50/40' : ''
          }`}
        >
          <div className="border-b border-gray-100 py-1 text-center text-[8px] font-medium text-gray-600">
            {label}
          </div>
        </div>
      ))}
      <div className="kanban-onboard-drag-card pointer-events-none absolute bottom-[38px] left-[calc(50%-84px)] z-[2] w-[48px] rounded border border-gray-200 bg-white py-1.5 text-center text-[8px] font-medium text-gray-800 shadow-md">
        任務
      </div>
      <div
        className="kanban-onboard-drag-cursor pointer-events-none absolute z-[3]"
        aria-hidden
      >
        <CursorIcon />
      </div>
    </div>
  )
}

interface KanbanOnboardingModalProps {
  open: boolean
  onDismiss: () => void
}

/**
 * 團隊分工看板：首次進入 3 步驟引導
 */
export default function KanbanOnboardingModal({ open, onDismiss }: KanbanOnboardingModalProps) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!open) return null

  const total = STEPS.length
  const isLast = step === total - 1
  const current = STEPS[step]

  const handleNext = () => {
    if (isLast) {
      onDismiss()
    } else {
      setStep((s) => Math.min(s + 1, total - 1))
    }
  }

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 0))
  }

  return (
    <>
      <div className="fixed inset-0 z-[110] bg-black/50" aria-hidden />

      <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto flex w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl max-h-[min(520px,90vh)]"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="kanban-onboarding-title"
        >
          <div className="flex items-center justify-between border-b border-gray-100 px-5 pb-2 pt-4">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={
                    i === step
                      ? 'h-2 w-6 rounded-full bg-teal-500 transition-all'
                      : 'h-2 w-2 rounded-full bg-gray-200'
                  }
                />
              ))}
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
              aria-label="關閉引導"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-3 pt-3">
            <h2 id="kanban-onboarding-title" className="mb-2 text-center text-lg font-bold text-gray-900">
              {current.title}
            </h2>
            <p className="mb-3 text-center text-sm leading-relaxed text-gray-600">{current.description}</p>

            <StepIllustration stepIndex={step} />

            <div className="mt-3 border-l-4 border-amber-400 bg-amber-50 py-1.5 pl-3 pr-2 rounded-r-lg">
              <p className="text-xs leading-relaxed text-amber-900">{current.tip}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-100 bg-gray-50/80 px-6 py-3">
            <span className="shrink-0 text-sm text-gray-500">
              {step + 1} / {total}
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="shrink-0 rounded-xl border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  上一頁
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="shrink-0 rounded-xl bg-teal-500 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-600"
              >
                {isLast ? '完成' : '下一步'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
