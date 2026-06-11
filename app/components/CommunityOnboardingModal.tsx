'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'

export const COMMUNITY_ONBOARDING_REOPEN_SELECTOR = '[data-community-onboarding-reopen]'

const EXIT_SHRINK_MS = 220
const EXIT_FLY_MS = 520

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  return reduced
}

type StepDef = {
  title: string
  description: string
  tip?: string
  /** 若未來放入 public/onboarding/*.gif 可自動顯示 */
  mediaSrc?: string
}

const STEPS: StepDef[] = [
  {
    title: '發起活動',
    description:
      '如果您還沒有活動，請先點選右上角「發起活動」按鈕建立活動。',
    tip: '提示：發起後即可邀請成員一起共備。',
    mediaSrc: '/onboarding/NewCommunity_Click.gif',
  },
  {
    title: '加入活動',
    description:
      '如果您已取得活動邀請碼，請點選「加入活動」並輸入邀請碼加入。',
    tip: '提示：邀請碼可向活動建立者索取。',
    mediaSrc: '/onboarding/JoinCommunity_Click.gif',
  },
  {
    title: '進行中活動',
    description:
      '建立或加入成功後，會在「進行中活動」區塊下方看到您加入的活動卡片。',
    tip: '提示：此處會列出您目前參與的所有活動。',
    mediaSrc: '/onboarding/JoinedList_Highlight.gif',
  },
  {
    title: '進入活動',
    description: '點擊您想進入的活動卡片，即可進入該活動開始共備。',
    tip: '提示：進入後可從左側功能列中切換想法牆、活動資源等功能。',
    mediaSrc: '/onboarding/ClickCard_Enter.gif',
  },
]

/** 游標圖示（簡化指標） */
function CursorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
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
  // 若有放置 GIF，優先顯示（載入失敗則顯示下方 CSS 動畫）
  const step = STEPS[stepIndex]
  const [imgError, setImgError] = useState(false)

  if (step.mediaSrc && !imgError) {
    return (
      <div className="relative w-full min-h-[200px] rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center border border-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={step.mediaSrc}
          alt=""
          className="max-h-[220px] w-auto object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  if (stepIndex === 0) {
    return (
      <div className="relative w-full min-h-[200px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 overflow-hidden">
        <div className="absolute top-3 right-3">
          <div className="community-onboard-demo-btn community-onboard-target-new px-3 py-1.5 rounded-lg bg-[rgba(138,99,210,0.9)] text-white text-xs font-medium shadow">
            發起活動
          </div>
        </div>
        <div className="community-onboard-cursor-step1 absolute left-0 top-0 pointer-events-none">
          <CursorIcon />
        </div>
        <div className="community-onboard-ripple-step1 absolute top-[1.35rem] right-[4.75rem] w-8 h-8 rounded-full border-2 border-teal-400 opacity-0" />
      </div>
    )
  }

  if (stepIndex === 1) {
    return (
      <div className="relative w-full min-h-[200px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 overflow-hidden">
        <div className="absolute top-3 right-3">
          <div className="community-onboard-demo-btn community-onboard-target-join px-3 py-1.5 rounded-lg bg-[rgba(138,99,210,0.9)] text-white text-xs font-medium shadow">
            加入活動
          </div>
        </div>
        <div className="community-onboard-cursor-step2 absolute left-0 top-0 pointer-events-none">
          <CursorIcon />
        </div>
        <div className="community-onboard-ripple-step2 absolute top-[1.35rem] right-[4.75rem] w-8 h-8 rounded-full border-2 border-teal-400 opacity-0" />
      </div>
    )
  }

  if (stepIndex === 2) {
    // 列表由左至右排列：示意僅保留最左一張卡片，並加上高亮（與實際列表第一格一致）
    return (
      <div className="relative w-full min-h-[200px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 p-4 overflow-hidden">
        <p className="text-sm font-bold text-[#6D28D9] mb-3">進行中活動</p>
        <div className="flex justify-start">
          <div
            className="community-onboard-card-glow h-20 w-full max-w-[200px] rounded-lg bg-white border-2 border-purple-400 shadow-lg shrink-0"
            aria-hidden
          />
        </div>
      </div>
    )
  }

  // step 4：示意點擊活動卡片本體進入（不顯示進入活動按鈕）
  return (
    <div className="relative w-full min-h-[200px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 flex items-center justify-center p-6">
      <div className="relative w-full max-w-[220px] rounded-xl bg-white border border-gray-200 shadow-md p-4">
        <div className="font-semibold text-gray-800 text-sm">範例活動</div>
        <div className="text-xs text-gray-500 mt-1">點擊卡片進入…</div>
        <div className="border-t border-gray-200 mt-3 pt-3 -mx-4 px-4">
          <div
            className="community-onboard-edit-btn-glow w-full py-2 rounded-lg text-[10px] font-bold text-center border-2 border-[#7C3AED] text-[#7C3AED] bg-[rgba(124,58,237,0.06)]"
            aria-hidden
          >
            進入活動
          </div>
        </div>
      </div>
    </div>
  )
}

interface CommunityOnboardingModalProps {
  open: boolean
  onDismiss: (options?: { showReopenHint?: boolean }) => void
}

/**
 * 共備活動列表頁：首次進入 4 步驟引導（參考 teal 風格操作說明）
 */
export default function CommunityOnboardingModal({
  open,
  onDismiss,
}: CommunityOnboardingModalProps) {
  const [step, setStep] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [backdropFading, setBackdropFading] = useState(false)
  const [panelStyle, setPanelStyle] = useState<CSSProperties | undefined>()
  const panelRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    if (open) {
      setStep(0)
      setIsExiting(false)
      setIsCompleting(false)
      setBackdropFading(false)
      setPanelStyle(undefined)
      return
    }
    setIsExiting(false)
    setIsCompleting(false)
    setBackdropFading(false)
    setPanelStyle(undefined)
  }, [open])

  if (!open && !isExiting) return null

  const total = STEPS.length
  const isLast = step === total - 1

  const finishWithReopenHint = () => {
    onDismiss({ showReopenHint: true })
  }

  const beginExitAnimation = () => {
    if (isCompleting) return
    setIsCompleting(true)

    if (prefersReducedMotion) {
      finishWithReopenHint()
      return
    }

    const target = document.querySelector(COMMUNITY_ONBOARDING_REOPEN_SELECTOR)
    const panel = panelRef.current
    if (!target || !panel) {
      finishWithReopenHint()
      return
    }

    const panelRect = panel.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const originX = panelRect.left + panelRect.width / 2
    const originY = panelRect.top + panelRect.height / 2
    const flyDx = targetRect.left + targetRect.width / 2 - originX
    const flyDy = targetRect.top + targetRect.height / 2 - originY

    setIsExiting(true)
    setPanelStyle({
      position: 'fixed',
      left: originX,
      top: originY,
      width: panelRect.width,
      maxWidth: panelRect.width,
      margin: 0,
      transform: 'translate(-50%, -50%) scale(1)',
      opacity: 1,
      transition: 'none',
      zIndex: 102,
    })

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setBackdropFading(true)
        setPanelStyle((prev) => ({
          ...prev,
          transform: 'translate(-50%, -50%) scale(0.9)',
          transition: `transform ${EXIT_SHRINK_MS}ms cubic-bezier(0.33, 1, 0.68, 1), opacity ${EXIT_SHRINK_MS}ms ease`,
        }))

        window.setTimeout(() => {
          setPanelStyle((prev) => ({
            ...prev,
            transform: `translate(calc(-50% + ${flyDx}px), calc(-50% + ${flyDy}px)) scale(0.08)`,
            opacity: 0,
            transition: `transform ${EXIT_FLY_MS}ms cubic-bezier(0.33, 1, 0.68, 1), opacity ${EXIT_FLY_MS}ms ease`,
          }))

          window.setTimeout(() => {
            finishWithReopenHint()
          }, EXIT_FLY_MS + 20)
        }, EXIT_SHRINK_MS + 20)
      })
    })
  }

  const handleNext = () => {
    if (isCompleting) return
    if (isLast) {
      beginExitAnimation()
    } else {
      setStep((s) => Math.min(s + 1, total - 1))
    }
  }

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 0))
  }

  const handleClose = () => {
    onDismiss()
  }

  const current = STEPS[step]

  const panel = (
        <div
          ref={panelRef}
          style={panelStyle}
          className={`pointer-events-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${
            isExiting ? 'will-change-transform' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="community-onboarding-title"
        >
          {/* 頂部：進度點 + 關閉 */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2 border-b border-gray-100">
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
              onClick={handleClose}
              disabled={isCompleting}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-50"
              aria-label="關閉引導"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-6 pt-4 pb-2 overflow-y-auto flex-1">
            <h2
              id="community-onboarding-title"
              className="text-xl font-bold text-gray-900 text-center mb-3"
            >
              {current.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed text-center mb-4">
              {current.description}
            </p>

            <StepIllustration stepIndex={step} />

            {current.tip && (
              <div className="mt-4 pl-3 border-l-4 border-amber-400 bg-amber-50 rounded-r-lg py-2 pr-2">
                <p className="text-sm text-amber-900">{current.tip}</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/80 gap-3">
            <span className="text-sm text-gray-500 shrink-0">
              {step + 1} / {total}
            </span>
            <div className="flex items-center justify-end gap-2 flex-1 min-w-0">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  上一步
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                disabled={isCompleting}
                className="px-6 py-2.5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors shadow-sm shrink-0 disabled:opacity-70"
              >
                {isLast ? '完成' : '下一步'}
              </button>
            </div>
          </div>
        </div>
  )

  return (
    <>
      {/* 遮罩：不點擊關閉 */}
      <div
        className={`fixed inset-0 z-[100] bg-black/50 ${
          backdropFading ? 'opacity-0 transition-opacity duration-300' : ''
        }`}
        aria-hidden
      />

      {isExiting ? (
        <div className="fixed inset-0 z-[101] pointer-events-none">{panel}</div>
      ) : (
        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
          {panel}
        </div>
      )}
    </>
  )
}
