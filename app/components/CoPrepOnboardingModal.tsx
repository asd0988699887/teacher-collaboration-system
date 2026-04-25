'use client'

import { useEffect, useState } from 'react'

type StepAnimation = 'save' | 'version' | 'convergence' | 'endCoPrep'

type StepDef = {
  title: string
  description: string
  tip: string
  animationType: StepAnimation
}

const STEPS: StepDef[] = [
  {
    title: '儲存教案',
    description: '編輯完成後，請點擊「儲存」保存資料。',
    tip: '提示：「課程目標」與「活動評量設計」皆需點擊儲存按鈕，才能保存資料。',
    animationType: 'save',
  },
  {
    title: '版本管理',
    description: '點擊「v＋版號」可查看舊版教案內容。',
    tip: '提示：點擊「儲存」後，版本號自動加 1。',
    animationType: 'version',
  },
  {
    title: '想法收斂結果',
    description: '右側會顯示收斂結果，供教師編輯教案時參考。',
    tip: '提示：收斂結果來自想法牆的討論，可作為教案設計的參考依據。',
    animationType: 'convergence',
  },
  {
    title: '結束共備',
    description: '教案完成後，點擊「結束共備」即可完成本次共備。',
    tip: '提示：結束共備後，教案將封存於歷史活動中，無法編輯，並自動產生新教案。',
    animationType: 'endCoPrep',
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

  // 第1頁：儲存按鈕（僅凸顯「儲存」）
  if (step.animationType === 'save') {
    return (
      <div className="relative flex h-[128px] w-full items-end justify-center rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 px-4 pb-5">
        <div className="coprep-onboard-save-btn relative rounded-lg bg-[rgba(138,99,210,0.9)] px-6 py-2 text-[11px] font-semibold text-white">
          儲存
        </div>
        <div
          className="coprep-onboard-ripple-save pointer-events-none absolute rounded-full border-2 border-[rgba(138,99,210,0.5)] bg-[rgba(138,99,210,0.12)]"
          aria-hidden
        />
        <CursorIcon className="coprep-onboard-cursor-save pointer-events-none absolute z-[3]" />
      </div>
    )
  }

  // 第2頁：版本管理（游標／漣漪錨定在「v1」上）
  if (step.animationType === 'version') {
    return (
      <div className="relative flex h-[128px] w-full items-start overflow-visible rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 px-4 pt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-[13px] font-bold text-[#6D28D9]">進行共備</span>
          <span className="coprep-onboard-v1-wrap relative inline-block text-[11px] font-semibold leading-none text-[#6D28D9]">
            v1
            <div
              className="coprep-onboard-ripple-version pointer-events-none absolute rounded-full border-2 border-[rgba(138,99,210,0.5)] bg-[rgba(138,99,210,0.12)]"
              aria-hidden
            />
            <CursorIcon className="coprep-onboard-cursor-version pointer-events-none absolute z-[3]" />
          </span>
        </div>
      </div>
    )
  }

  // 第3頁：想法收斂結果 highlight
  if (step.animationType === 'convergence') {
    return (
      <div className="relative flex h-[128px] w-full items-start justify-end gap-2 rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 px-3 pt-3">
        {/* 主內容示意 */}
        <div className="flex-1 rounded-lg border border-gray-200 bg-white p-2 h-[100px]">
          <div className="text-[8px] font-medium text-gray-400 mb-1">課程目標</div>
          <div className="space-y-1">
            <div className="h-1.5 rounded bg-gray-100 w-full" />
            <div className="h-1.5 rounded bg-gray-100 w-4/5" />
            <div className="h-1.5 rounded bg-gray-100 w-3/5" />
          </div>
        </div>
        {/* 右側收斂面板 */}
        <div className="coprep-onboard-convergence-panel w-[72px] rounded-lg border border-purple-300 bg-white shadow-md overflow-hidden h-[100px]">
          <div className="bg-gradient-to-r from-purple-400 to-purple-600 px-1.5 py-1 text-[7px] font-semibold text-white">
            想法收斂結果
          </div>
          <div className="p-1.5 space-y-1">
            <div className="text-[6px] text-gray-700 leading-tight">
              [力與運動]<br />與我們生活...
            </div>
            <div className="text-[6px] text-gray-700 leading-tight">
              [虎克定律]<br />F=kx
            </div>
          </div>
        </div>
      </div>
    )
  }

  // 第4頁：結束共備（游標／漣漪錨定在按鈕中心）
  return (
    <div className="relative flex h-[128px] w-full items-end justify-start rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 px-4 pb-5">
      <div className="coprep-onboard-end-btn-wrap relative inline-block">
        <div className="coprep-onboard-end-btn rounded-lg border-2 border-[rgba(138,99,210,0.9)] bg-white px-4 py-1.5 text-[10px] font-semibold text-[#6D28D9] shadow-sm">
          結束共備
        </div>
        <div
          className="coprep-onboard-ripple-end pointer-events-none absolute rounded-full border-2 border-[rgba(138,99,210,0.5)] bg-[rgba(138,99,210,0.12)]"
          aria-hidden
        />
        <CursorIcon className="coprep-onboard-cursor-end pointer-events-none absolute z-[3]" />
      </div>
    </div>
  )
}

interface CoPrepOnboardingModalProps {
  open: boolean
  onDismiss: () => void
}

/**
 * 進行共備：首次進入 4 步驟引導
 */
export default function CoPrepOnboardingModal({ open, onDismiss }: CoPrepOnboardingModalProps) {
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
          aria-labelledby="coprep-onboarding-title"
        >
          {/* 頂部進度點 + 關閉 */}
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

          {/* 中間內容 */}
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-3 pt-3">
            <h2 id="coprep-onboarding-title" className="mb-2 text-center text-lg font-bold text-gray-900">
              {current.title}
            </h2>
            <p className="mb-3 text-center text-sm leading-relaxed text-gray-600">{current.description}</p>

            <StepIllustration stepIndex={step} />

            <div className="mt-3 border-l-4 border-amber-400 bg-amber-50 py-1.5 pl-3 pr-2 rounded-r-lg">
              <p className="text-xs leading-relaxed text-amber-900">{current.tip}</p>
            </div>
          </div>

          {/* 底部頁碼與按鈕 */}
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
