'use client'

interface CommunityButtonProps {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
}

/**
 * 社群操作按鈕組件
 * 用於「新增社群」和「加入社群」按鈕
 */
export default function CommunityButton({
  label,
  onClick,
  variant = 'primary',
}: CommunityButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        w-[120px] h-10
        flex items-center justify-center gap-2.5
        bg-[rgba(138,99,210,0.6)] 
        hover:bg-[rgba(138,99,210,0.75)]
        active:bg-[rgba(138,99,210,0.85)]
        text-white
        rounded-lg
        shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]
        transition-all duration-200
        font-bold
      "
    >
      {/* Plus 符號 */}
      <span className="text-[18px] leading-[21px] font-bold">+</span>
      
      {/* 按鈕文字 */}
      <span className="text-[16px] leading-[21px] font-bold">{label}</span>
    </button>
  )
}

