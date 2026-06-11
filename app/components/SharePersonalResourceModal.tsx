'use client'

interface ShareCommunityOption {
  id: string
  name: string
}

interface SharePersonalResourceModalProps {
  isOpen: boolean
  fileName: string
  communities: ShareCommunityOption[]
  isSubmitting?: boolean
  onClose: () => void
  onShare: (communityId: string) => void
}

/**
 * 選擇要分享個人資源到哪個進行中的共備活動
 */
export default function SharePersonalResourceModal({
  isOpen,
  fileName,
  communities,
  isSubmitting = false,
  onClose,
  onShare,
}: SharePersonalResourceModalProps) {
  if (!isOpen) return null

  const displayName = fileName.replace(/\.[^/.]+$/, '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-personal-resource-title"
      >
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 id="share-personal-resource-title" className="text-lg font-bold text-gray-900">
            分享至共備活動
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            將「{displayName}」分享至以下進行中的共備活動（會出現在該活動的社群資源）
          </p>
        </div>

        <div className="max-h-72 overflow-y-auto px-6 py-4">
          {communities.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">目前沒有進行中的共備活動</p>
          ) : (
            <ul className="space-y-2">
              {communities.map((community) => (
                <li key={community.id}>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => onShare(community.id)}
                    className="w-full rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 transition-colors hover:border-purple-300 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {community.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}
