'use client'

import { useEffect, useState } from 'react'

export type IdeaWallOnboardingStepAnimation =
  | 'fab'
  | 'viewCard'
  | 'extend'
  | 'arrow'
  | 'convergenceButton'
  | 'convergenceForm'
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
    title: '新增想法',
    description: '點選右下角「＋」按鈕，即可新增一個想法節點。',
    tip: '提示：同階段的想法才可進行「想法收斂」。',
    mediaSrc: '/onboarding/IdeaWall_Add_Click.gif',
    animationType: 'fab',
  },
  {
    title: '檢視想法',
    description: '點選任一想法節點卡片，即可開啟檢視／編輯視窗查看詳細內容。',
    tip: '提示：「[ ]」內是階段，沒有「[ ]」的是標題；想法內容請點擊卡片查看。',
    mediaSrc: '/onboarding/IdeaWall_ViewNode_Click.gif',
    animationType: 'viewCard',
  },
  {
    title: '回覆想法',
    description: '在「檢視節點」視窗中，點選「延伸想法」即可新增回覆節點。',
    tip: '提示：需先點選想回覆的想法節點卡片。',
    mediaSrc: '/onboarding/IdeaWall_Extend_Click.gif',
    animationType: 'extend',
  },
  {
    title: '產生回覆節點',
    description:
      '新增回覆後，系統會產生「回覆節點」，並以箭頭由「被回覆節點」連接至「回覆節點」。',
    tip: '提示：節點卡片可拖曳移動位置。',
    mediaSrc: '/onboarding/IdeaWall_ReplyArrow_Animate.gif',
    animationType: 'arrow',
  },
  {
    title: '想法收斂',
    description: '點選「想法收斂」按鈕，開始整理並統整同階段的想法。',
    tip: '提示：請先建立想法節點，才能開始進行想法收斂。',
    mediaSrc: '/onboarding/Convergence_ClickButton.gif',
    animationType: 'convergenceButton',
  },
  {
    title: '填寫收斂內容',
    description: '選擇想收斂的「想法階段」，並輸入收斂結果內容。',
    tip: '提示：若尚不確定收斂內容，可在下方留言區與夥伴討論。各階段的討論內容彼此獨立，會分開顯示。',
    mediaSrc: '/onboarding/Convergence_FillForm.gif',
    animationType: 'convergenceForm',
  },
  {
    title: '產生收斂結果',
    description:
      '完成收斂後，系統會產生「收斂節點」，並以紫色連線將被收斂的想法節點指向該收斂節點，方便回顧統整結果。',
    tip: '提示：收斂節點的圖示為「實心燈泡」，與想法發散節點的「空心燈泡」圖示不同。',
    mediaSrc: '/onboarding/Convergence_ResultLinks.gif',
    animationType: 'convergenceResult',
  },
]

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

  // —— CSS 示意動畫（GIF 不存在時）——
  if (step.animationType === 'fab') {
    return (
      <div className="relative w-full h-[200px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 overflow-hidden">
        {/* 乾淨畫布；右下角「＋」與實際想法牆 FAB 同：bottom-4 right-4、w-12 h-12 */}
        <div className="idea-wall-onboard-fab absolute bottom-4 right-4 z-[1] w-12 h-12 rounded-full bg-[rgba(138,99,210,0.95)] shadow-lg flex items-center justify-center text-white text-2xl font-light pointer-events-none">
          +
        </div>
        {/* 游標動畫結束點對齊按鈕中心（見 globals idea-wall-cursor-fab） */}
        <div className="idea-wall-onboard-cursor-fab absolute left-0 top-0 z-10 pointer-events-none w-7 h-7">
          <CursorIcon />
        </div>
        <div className="idea-wall-onboard-ripple-fab absolute z-[1] w-8 h-8 rounded-full border-2 border-teal-400 opacity-0 pointer-events-none" />
      </div>
    )
  }

  if (step.animationType === 'viewCard') {
    return (
      <div className="relative w-full min-h-[200px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 p-4 overflow-hidden flex flex-col items-center">
        {/* 窄版範例卡片（與實際想法節點比例相近） */}
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
          {/* 僅示意「點擊卡片」；實際會開啟檢視視窗，動畫在此步結束即可，不再疊畫假彈窗 */}
          <div className="idea-wall-onboard-cursor-view absolute left-0 top-0 pointer-events-none z-30">
            <CursorIcon />
          </div>
          <div className="idea-wall-onboard-ripple-view absolute left-1/2 top-[22%] -translate-x-1/2 w-8 h-8 rounded-full border-2 border-teal-400 opacity-0 pointer-events-none z-30" />
        </div>
      </div>
    )
  }

  if (step.animationType === 'extend') {
    return (
      <div className="relative w-full min-h-[220px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 p-2.5">
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
        <div className="idea-wall-onboard-cursor-extend absolute left-0 top-0 z-20 pointer-events-none h-7 w-7">
          <CursorIcon />
        </div>
      </div>
    )
  }

  if (step.animationType === 'convergenceButton') {
    return (
      <div className="relative w-full h-[210px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 overflow-hidden">
        {/* 畫布區塊：放在下方，按鈕位於畫布上方（畫布外） */}
        <div className="absolute left-3 right-3 bottom-3 top-16 rounded-xl border border-gray-200 bg-white" />
        <div className="absolute left-4 top-[74px] text-[11px] text-gray-500 z-[1]">想法牆畫布</div>
        <div className="absolute left-6 top-5 z-[2]">
          <button
            type="button"
            tabIndex={-1}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium shadow-lg ring-4 ring-purple-200 pointer-events-none animate-pulse"
          >
            想法收斂
          </button>
        </div>
        <div className="absolute left-0 top-0 idea-wall-onboard-cursor-convergence z-10 pointer-events-none">
          <CursorIcon />
        </div>
      </div>
    )
  }

  if (step.animationType === 'convergenceForm') {
    return (
      <div className="relative w-full min-h-[230px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 p-3">
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm p-3 space-y-2">
          <div>
            <div className="text-[11px] text-gray-900 mb-1">收斂階段</div>
            <div className="h-9 rounded-lg border border-gray-300 bg-white flex items-center justify-between px-3 text-xs text-gray-900">
              <span>請選擇想法階段</span>
              <span>▼</span>
            </div>
          </div>
          <div>
            <div className="text-[11px] text-gray-900 mb-1">收斂結果</div>
            <div className="min-h-[56px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900">
              <span className="inline-flex items-center gap-1">
                <span>請自行輸入想法收斂結果。</span>
              </span>
            </div>
          </div>
          <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
            留言區：可與夥伴討論要收斂的內容
          </div>
        </div>
      </div>
    )
  }

  if (step.animationType === 'convergenceResult') {
    return (
      <div className="relative w-full min-h-[120px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 p-2 flex items-center justify-center">
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

  // arrow
  return (
    <div className="relative w-full min-h-[200px] rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 p-4 flex items-center justify-center">
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

interface IdeaWallOnboardingModalProps {
  open: boolean
  onDismiss: () => void
}

/**
 * 想法牆：首次進入 7 步驟引導
 */
export default function IdeaWallOnboardingModal({ open, onDismiss }: IdeaWallOnboardingModalProps) {
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
          className="pointer-events-auto w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
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
              onClick={onDismiss}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="關閉引導"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-6 pt-4 pb-2 overflow-y-auto flex-1">
            <h2 id="idea-wall-onboarding-title" className="text-xl font-bold text-gray-900 text-center mb-3">
              {current.title}
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed text-center mb-4">{current.description}</p>

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
                className="px-6 py-2.5 rounded-xl bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors shadow-sm shrink-0"
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
