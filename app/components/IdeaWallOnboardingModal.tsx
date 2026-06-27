'use client'

import { useEffect, useState } from 'react'
import { useOnboardingExitAnimation } from '@/lib/useOnboardingExitAnimation'

export const IDEA_WALL_ONBOARDING_REOPEN_SELECTOR = '[data-idea-wall-onboarding-reopen]'

export type IdeaWallOnboardingStepAnimation =
  | 'fabViewCarousel'
  | 'extendArrowCarousel'
  | 'convergenceFormCarousel'
  | 'convergenceResult'

type StepDef = {
  title: string
  description: string
  tip?: string
  mediaSrc?: string
  animationType: IdeaWallOnboardingStepAnimation
}

const STEPS: StepDef[] = [
  {
    title: '新增與查看想法',
    description: '點選右下角「＋」可以新增想法；點選想法卡片，可以查看或編輯詳細內容。',
    tip: '提示：[ ]內是階段，沒有[ ]的是標題；想法內容請點擊卡片查看。—— 相同階段才可進行收斂。',
    animationType: 'fabViewCarousel',
  },
  {
    title: '回覆想法和產生回覆節點',
    description:
      '在想法卡片中點選「延伸想法」，即可新增回覆想法。回覆後，系統會自動產生新的想法節點，並以連線表示兩個想法之間的關係。',
    tip: '提示：節點卡片可拖曳移動位置。',
    animationType: 'extendArrowCarousel',
  },
  {
    title: '想法收斂',
    description:
      '點選「想法收斂」按鈕，選擇想收斂的「想法階段」，勾選想法結點並輸入收斂結果內容。',
    tip: '提示：想法收斂由活動管理員進行；其他成員可查看收斂內容，並於下方討論區留言，提供補充意見與討論。',
    animationType: 'convergenceFormCarousel',
  },
  {
    title: '產生收斂結果',
    description:
      '完成收斂後，系統會產生「收斂節點」，並以紫色連線將被收斂的想法節點指向該收斂節點，方便回顧統整結果。',
    tip: '提示：收斂節點以「實心燈泡＋奶油色底」呈現；一般想法節點則為「空心燈泡＋白底」。',
    mediaSrc: '/onboarding/Convergence_ResultLinks.gif',
    animationType: 'convergenceResult',
  },
]

/** 各頁圖示框統一高度 */
const ILLUSTRATION_FRAME =
  'relative w-full h-[200px] shrink-0 rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 overflow-hidden'

/** 導覽彈窗統一高度（避免各頁不一致與內容區捲軸） */
const MODAL_FRAME =
  'pointer-events-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col h-[536px] max-h-[90vh]'

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

function FabIllustration({ paused = false }: { paused?: boolean }) {
  const pauseClass = paused ? '[&_*]:![animation-play-state:paused]' : ''
  return (
    <div className={`${ILLUSTRATION_FRAME} ${pauseClass}`}>
      <div className="idea-wall-onboard-fab absolute bottom-4 right-4 z-[1] w-12 h-12 rounded-full bg-[rgba(138,99,210,0.95)] shadow-lg flex items-center justify-center text-white text-2xl font-light pointer-events-none">
        +
      </div>
      <div className="idea-wall-onboard-cursor-fab absolute left-0 top-0 z-10 pointer-events-none w-7 h-7">
        <CursorIcon />
      </div>
      <div className="idea-wall-onboard-ripple-fab absolute z-[1] w-8 h-8 rounded-full border-2 border-teal-400 opacity-0 pointer-events-none" />
    </div>
  )
}

function ViewCardIllustration({ paused = false }: { paused?: boolean }) {
  const pauseClass = paused ? '[&_*]:![animation-play-state:paused]' : ''
  return (
    <div className={`${ILLUSTRATION_FRAME} p-4 flex flex-col items-center justify-center ${pauseClass}`}>
      <div className="relative w-full max-w-[200px] mt-1">
        <div className="rounded-lg border border-gray-200 bg-white shadow-md p-2.5 idea-wall-onboard-card-pulse">
          <div className="flex items-start gap-1 mb-1">
            <span className="text-amber-400 text-sm leading-none shrink-0" aria-hidden>
              💡
            </span>
            <span className="text-[10px] font-bold text-gray-800 leading-tight">[力與運動]</span>
          </div>
          <div className="text-[11px] font-bold text-gray-900 leading-snug mb-2 pl-0.5">力有哪些？</div>
          <div className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-medium shrink-0">
              王
            </span>
            <span className="text-[9px] text-gray-500 tabular-nums">2026/02/26 17:07</span>
          </div>
        </div>
        <div className="idea-wall-onboard-cursor-view absolute left-0 top-0 pointer-events-none z-30">
          <CursorIcon />
        </div>
        <div className="idea-wall-onboard-ripple-view absolute left-1/2 top-[22%] -translate-x-1/2 w-8 h-8 rounded-full border-2 border-teal-400 opacity-0 pointer-events-none z-30" />
      </div>
    </div>
  )
}

const CAROUSEL_FAB_MS = 2800
const CAROUSEL_VIEW_MS = 2800
const CAROUSEL_PAUSE_MS = 2500

function FabViewCarouselIllustration() {
  const [phase, setPhase] = useState<'fab' | 'viewCard' | 'pause'>('fab')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const schedule = (next: 'fab' | 'viewCard' | 'pause', delay: number) => {
      timer = setTimeout(() => setPhase(next), delay)
    }

    if (phase === 'fab') {
      schedule('viewCard', CAROUSEL_FAB_MS)
    } else if (phase === 'viewCard') {
      schedule('pause', CAROUSEL_VIEW_MS)
    } else {
      schedule('fab', CAROUSEL_PAUSE_MS)
    }

    return () => clearTimeout(timer)
  }, [phase])

  if (phase === 'fab') {
    return <FabIllustration key="fab" />
  }

  return <ViewCardIllustration key="viewCard" paused={phase === 'pause'} />
}

function ExtendIllustration({ paused = false }: { paused?: boolean }) {
  const pauseClass = paused ? '[&_*]:![animation-play-state:paused]' : ''
  return (
    <div className={`${ILLUSTRATION_FRAME} p-2 flex items-start justify-center ${pauseClass}`}>
      {/* 與 EditIdeaModal 一致的「檢視節點」版面；延伸想法為藍底白字 +，並加強視覺凸顯 */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-xl flex flex-col max-w-md mx-auto overflow-hidden">
        <div className="px-3 py-1.5 border-b border-gray-200 shrink-0">
          <h3 className="text-[13px] font-bold text-gray-900">檢視節點</h3>
        </div>
        <div className="px-3 py-1.5 space-y-1.5">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-0.5">標題</label>
            <div className="w-full px-2 py-1 border border-gray-300 rounded-lg text-[10px] text-gray-900 bg-white">
              力有哪些？
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-0.5">內容</label>
            <div className="w-full px-2 py-1 border border-gray-300 rounded-lg text-[9px] text-gray-800 leading-snug min-h-[38px] bg-white">
              生活中有那些力的運用?
            </div>
          </div>
        </div>
        <div className="px-2 py-1.5 border-t border-gray-200 flex flex-wrap items-center justify-between gap-1.5 bg-white">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              tabIndex={-1}
              className="px-2 py-1 text-[9px] text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium border border-red-100 flex items-center gap-0.5 pointer-events-none"
            >
              <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              刪除
            </button>
            <div className="relative inline-flex items-center">
              <button
                type="button"
                tabIndex={-1}
                className="idea-wall-onboard-extend-btn idea-wall-onboard-extend-highlight relative z-[1] px-2.5 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-[9px] font-medium flex items-center gap-1 pointer-events-none"
              >
                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                延伸想法
              </button>
              <div className="idea-wall-onboard-ripple-extend absolute left-1/2 top-1/2 z-0 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-teal-400 opacity-0 pointer-events-none" />
              {/* 游標錨定於「延伸想法」按鈕容器，確保動畫一定落在按鈕上 */}
              <div className="idea-wall-onboard-cursor-extend absolute z-20 pointer-events-none h-7 w-7">
                <CursorIcon />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              tabIndex={-1}
              className="px-2 py-1 text-[9px] text-gray-700 bg-gray-100 rounded-lg font-medium pointer-events-none"
            >
              取消
            </button>
            <button
              type="button"
              tabIndex={-1}
              className="px-2 py-1 text-[9px] text-white bg-[rgba(138,99,210,0.9)] rounded-lg font-medium pointer-events-none"
            >
              儲存
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ArrowIllustration({ paused = false }: { paused?: boolean }) {
  const pauseClass = paused ? '[&_*]:![animation-play-state:paused]' : ''
  return (
    <div className={`${ILLUSTRATION_FRAME} p-2 flex items-center justify-center ${pauseClass}`}>
      <div className="relative w-full max-w-sm">
        <div className="relative z-10 flex items-center justify-between w-full">
          <div className="w-[42%] rounded-lg border border-gray-300 bg-white shadow-sm p-2">
            <div className="text-[10px] font-semibold text-gray-800 text-center">原始想法</div>
          </div>
          <div className="w-[42%] rounded-lg border-2 border-purple-400 bg-white shadow p-2 idea-wall-onboard-reply-target-glow idea-wall-onboard-reply-purple-glow">
            <div className="text-[10px] font-semibold text-gray-800 text-center">衍生想法</div>
          </div>
        </div>

        {/* 箭頭由左卡右緣連到右卡左緣（端點碰到卡片） */}
        <div className="absolute inset-0 pointer-events-none z-20">
          <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <marker id="idea-wall-arrowhead" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" fill="#111827" />
              </marker>
            </defs>
            <line
              className="idea-wall-onboard-arrow-path"
              x1="42"
              y1="20"
              x2="57"
              y2="20"
              stroke="#111827"
              strokeWidth="1.8"
              markerEnd="url(#idea-wall-arrowhead)"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

const CAROUSEL_EXTEND_MS = 2800
const CAROUSEL_ARROW_MS = 2800

function ExtendArrowCarouselIllustration() {
  const [phase, setPhase] = useState<'extend' | 'arrow' | 'pause'>('extend')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const schedule = (next: 'extend' | 'arrow' | 'pause', delay: number) => {
      timer = setTimeout(() => setPhase(next), delay)
    }

    if (phase === 'extend') {
      schedule('arrow', CAROUSEL_EXTEND_MS)
    } else if (phase === 'arrow') {
      schedule('pause', CAROUSEL_ARROW_MS)
    } else {
      schedule('extend', CAROUSEL_PAUSE_MS)
    }

    return () => clearTimeout(timer)
  }, [phase])

  if (phase === 'extend') {
    return <ExtendIllustration key="extend" />
  }

  return <ArrowIllustration key="arrow" paused={phase === 'pause'} />
}

function ConvergenceButtonIllustration({ paused = false }: { paused?: boolean }) {
  const pauseClass = paused ? '[&_*]:![animation-play-state:paused]' : ''
  return (
    <div className={`${ILLUSTRATION_FRAME} p-3 flex flex-col justify-center ${pauseClass}`}>
      <div className="mb-2">
        <button
          type="button"
          tabIndex={-1}
          className="px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-medium shadow-lg ring-4 ring-purple-200 pointer-events-none animate-pulse"
        >
          想法收斂
        </button>
      </div>
      <div className="relative h-[72px] rounded-xl border border-gray-200 bg-white">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">想法牆畫布</div>
      </div>
      <div className="absolute left-0 top-0 idea-wall-onboard-cursor-convergence z-10 pointer-events-none">
        <CursorIcon />
      </div>
    </div>
  )
}

function ConvergenceFormIllustration({ paused = false }: { paused?: boolean }) {
  const pauseClass = paused ? '[&_*]:![animation-play-state:paused]' : ''
  return (
    <div className={`${ILLUSTRATION_FRAME} p-2 flex items-center justify-center ${pauseClass}`}>
      <div className="w-full rounded-lg border border-gray-200 bg-white shadow-sm p-2 space-y-1">
        <div>
          <div className="text-[9px] text-gray-900 mb-0.5">收斂階段</div>
          <div className="h-7 rounded-lg border border-gray-300 bg-white flex items-center justify-between px-2 text-[10px] text-gray-900">
            <span>請選擇想法階段</span>
            <span className="text-[9px]">▼</span>
          </div>
        </div>
        <div>
          <div className="text-[9px] text-gray-900 mb-0.5">想法節點</div>
          <div className="rounded-lg border border-gray-300 bg-white px-2 py-1 flex items-start gap-1.5">
            <span className="mt-[1px] h-2.5 w-2.5 shrink-0 rounded-[3px] border border-gray-400 bg-white" />
            <div className="min-w-0">
              <div className="text-[10px] font-bold text-gray-900 leading-tight">虎克定律</div>
              <div className="text-[9px] text-gray-500 leading-tight">在彈性限度內，彈性物體的變形量與外力成正比</div>
            </div>
          </div>
        </div>
        <div>
          <div className="text-[9px] text-gray-900 mb-0.5">收斂結果</div>
          <div className="min-h-[24px] rounded-lg border border-gray-300 bg-white px-2 py-1 text-[10px] leading-tight text-gray-900">
            請自行輸入想法收斂結果。
          </div>
        </div>
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-2 py-1 text-[9px] leading-tight text-amber-900">
          討論區：可與夥伴討論要收斂的內容
        </div>
      </div>
    </div>
  )
}

const CAROUSEL_CONVERGENCE_BUTTON_MS = 2800
const CAROUSEL_CONVERGENCE_FORM_MS = 2800

function ConvergenceFormCarouselIllustration() {
  const [phase, setPhase] = useState<'button' | 'form' | 'pause'>('button')

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const schedule = (next: 'button' | 'form' | 'pause', delay: number) => {
      timer = setTimeout(() => setPhase(next), delay)
    }

    if (phase === 'button') {
      schedule('form', CAROUSEL_CONVERGENCE_BUTTON_MS)
    } else if (phase === 'form') {
      schedule('pause', CAROUSEL_CONVERGENCE_FORM_MS)
    } else {
      schedule('button', CAROUSEL_PAUSE_MS)
    }

    return () => clearTimeout(timer)
  }, [phase])

  if (phase === 'button') {
    return <ConvergenceButtonIllustration key="button" />
  }

  return <ConvergenceFormIllustration key="form" paused={phase === 'pause'} />
}

function StepIllustration({ stepIndex }: { stepIndex: number }) {
  const step = STEPS[stepIndex]
  const [imgError, setImgError] = useState(false)

  if (step.animationType === 'fabViewCarousel') {
    return <FabViewCarouselIllustration />
  }

  if (step.animationType === 'extendArrowCarousel') {
    return <ExtendArrowCarouselIllustration />
  }

  if (step.animationType === 'convergenceFormCarousel') {
    return <ConvergenceFormCarouselIllustration />
  }

  if (step.mediaSrc && !imgError) {
    return (
      <div className={`${ILLUSTRATION_FRAME} bg-gray-50 flex items-center justify-center`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={step.mediaSrc}
          alt=""
          className="max-h-[188px] w-auto object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    )
  }

  // —— CSS 示意動畫（GIF 不存在時）——
  if (step.animationType === 'convergenceResult') {
    return (
      <div className={`${ILLUSTRATION_FRAME} p-2 flex items-center justify-center`}>
        {/* 純 SVG 示意圖：卡片與箭頭在同一座標系，不再有 CSS/SVG 錯位 */}
        <svg
          className="w-full max-w-md"
          viewBox="0 0 300 100"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <marker
              id="convergeArrow"
              markerUnits="userSpaceOnUse"
              markerWidth="10"
              markerHeight="10"
              viewBox="0 0 10 10"
              refX="0"
              refY="5"
              orient="auto"
            >
              <path d="M0,0 L10,5 L0,10 Z" fill="#7C3AED" />
            </marker>
          </defs>

          {/* 想法 A */}
          <rect x="10" y="8" width="90" height="30" rx="6" fill="white" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="55" y="28" textAnchor="middle" fontSize="12" fill="#374151">想法 A</text>

          {/* 想法 B */}
          <rect x="10" y="62" width="90" height="30" rx="6" fill="white" stroke="#D1D5DB" strokeWidth="1.5" />
          <text x="55" y="82" textAnchor="middle" fontSize="12" fill="#374151">想法 B</text>

          {/* 收斂節點（僅調整卡片 x；箭頭座標不變） */}
          <g className="animate-pulse">
            <rect x="166" y="35" width="90" height="30" rx="6" fill="#F5F3FF" stroke="#7C3AED" strokeWidth="2" />
            <text x="211" y="55" textAnchor="middle" fontSize="12" fontWeight="600" fill="#7C3AED">收斂節點</text>
          </g>

          {/* 想法A → 收斂節點（偏上）：tip ≈ (163, 47) */}
          <line
            x1="100" y1="23" x2="154" y2="44"
            stroke="#7C3AED" strokeWidth="1.5"
            markerEnd="url(#convergeArrow)"
            className="idea-wall-onboard-converge-arrow-path"
          />
          {/* 想法B → 收斂節點（偏下）：tip ≈ (163, 54) */}
          <line
            x1="100" y1="77" x2="154" y2="56"
            stroke="#7C3AED" strokeWidth="1.5"
            markerEnd="url(#convergeArrow)"
            className="idea-wall-onboard-converge-arrow-path"
          />
        </svg>
      </div>
    )
  }

  return null
}

interface IdeaWallOnboardingModalProps {
  open: boolean
  onDismiss: (options?: { showReopenHint?: boolean }) => void
}

/**
 * 想法牆：首次進入 4 步驟引導
 */
export default function IdeaWallOnboardingModal({ open, onDismiss }: IdeaWallOnboardingModalProps) {
  const [step, setStep] = useState(0)
  const {
    panelRef,
    panelStyle,
    isExiting,
    isCompleting,
    backdropFading,
    beginExitAnimation,
    shouldRender,
  } = useOnboardingExitAnimation(open, 112)

  useEffect(() => {
    if (open) setStep(0)
  }, [open])

  if (!shouldRender) return null

  const total = STEPS.length
  const isLast = step === total - 1
  const current = STEPS[step]

  const handleNext = () => {
    if (isCompleting) return
    if (isLast) {
      beginExitAnimation(IDEA_WALL_ONBOARDING_REOPEN_SELECTOR, onDismiss)
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

  const panel = (
        <div
          ref={panelRef}
          style={panelStyle}
          className={`${MODAL_FRAME} ${isExiting ? 'will-change-transform' : ''}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="idea-wall-onboarding-title"
        >
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

          <div className="px-6 pt-4 pb-2 flex-1 min-h-0 overflow-hidden flex flex-col">
            <h2 id="idea-wall-onboarding-title" className="text-xl font-bold text-gray-900 text-center mb-3 shrink-0">
              {current.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed text-center mb-3 shrink-0">{current.description}</p>

            <StepIllustration stepIndex={step} />

            {current.tip && (
              <div className="mt-3 shrink-0 pl-3 border-l-4 border-amber-400 bg-amber-50 rounded-r-lg py-1.5 pr-2">
                <p className="text-xs leading-snug text-amber-900">
                  {current.animationType === 'fabViewCarousel' ? (
                    <>
                      提示：<strong>[ ]</strong>內是階段，沒有<strong>[ ]</strong>的是標題；想法內容請點擊卡片查看。—— 相同階段才可進行收斂。
                    </>
                  ) : (
                    current.tip
                  )}
                </p>
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
      <div
        className={`fixed inset-0 z-[110] bg-black/50 ${
          backdropFading ? 'opacity-0 transition-opacity duration-300' : ''
        }`}
        aria-hidden
      />

      {isExiting ? (
        <div className="fixed inset-0 z-[111] pointer-events-none">{panel}</div>
      ) : (
        <div className="fixed inset-0 z-[111] flex items-center justify-center p-4 pointer-events-none">
          {panel}
        </div>
      )}
    </>
  )
}
