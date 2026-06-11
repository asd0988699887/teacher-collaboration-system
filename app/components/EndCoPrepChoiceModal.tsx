'use client'

interface EndCoPrepChoiceModalProps {
  open: boolean
  onClose: () => void
  onEndActivity: () => void
  onNewLessonPlan: () => void
  isProcessing?: boolean
}

export default function EndCoPrepChoiceModal({
  open,
  onClose,
  onEndActivity,
  onNewLessonPlan,
  isProcessing = false,
}: EndCoPrepChoiceModalProps) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-[120] bg-black/50" onClick={isProcessing ? undefined : onClose} aria-hidden />
      <div className="fixed inset-0 z-[121] flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="end-coprep-choice-title"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id="end-coprep-choice-title" className="mb-5 text-center text-lg font-bold text-gray-900">
            請選擇接下來要進行的動作
          </h2>

          <div className="space-y-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onEndActivity}
              className="w-full rounded-xl border-2 border-purple-200 bg-purple-50 px-4 py-4 text-left transition-colors hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="text-base font-semibold text-[#6D28D9]">結束此活動</div>
              <p className="mt-1 text-sm text-gray-600">將目前共備活動移至歷史活動。</p>
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={onNewLessonPlan}
              className="w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-4 text-left transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <div className="text-base font-semibold text-gray-900">產生新教案</div>
              <p className="mt-1 text-sm text-gray-600">
                將目前教案保存為已完成教案，並建立一份新的空白教案，用於下一單元共備。
              </p>
            </button>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="rounded-xl border border-gray-300 bg-white px-8 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
