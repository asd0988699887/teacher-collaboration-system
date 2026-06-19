'use client'

const USEFUL_SITES = [
  {
    name: 'CIRN 教育資源網',
    desc: '提供課程綱要、教案與教學資源，協助備課規劃。',
    url: 'https://cirn.k12ea.gov.tw/',
  },
  {
    name: 'NotebookLM',
    desc: '可整理教材、摘要重點，協助快速理解與備課。',
    url: 'https://notebooklm.google.com/',
  },
  {
    name: 'Gemini',
    desc: 'AI 工具，可協助教案設計、內容生成與靈感發想。',
    url: 'https://gemini.google.com/',
  },
  {
    name: '康軒數位資源',
    desc: '提供教材、教案與數位教學資源。',
    url: 'https://www.knsh.com.tw/',
  },
  {
    name: '南一數位資源',
    desc: '提供課本配套教材與教學輔助資源。',
    url: 'https://www.nani.com.tw/',
  },
  {
    name: '翰林數位資源',
    desc: '提供教學內容、題庫與教案參考。',
    url: 'https://www.hle.com.tw/',
  },
] as const

interface UsefulLinksSectionProps {
  className?: string
}

/**
 * 好站連結列表（外層共備活動總覽使用）
 */
export default function UsefulLinksSection({ className = '' }: UsefulLinksSectionProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm min-h-[400px] p-6 md:p-8 ${className}`}>
      <h2 className="text-xl md:text-2xl font-bold text-[#6D28D9] mb-2">好站連結</h2>
      <p className="text-sm text-gray-500 mb-6">點擊卡片即可在新分頁開啟對應網站。</p>
      <div className="space-y-3">
        {USEFUL_SITES.map((site) => (
          <a
            key={site.url}
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-5 py-4 transition-all hover:border-purple-300 hover:shadow-md hover:shadow-purple-100/60 hover:-translate-y-[1px]"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-gray-800 group-hover:text-purple-700 transition-colors">
                  {site.name}
                </p>
                <p className="truncate text-xs text-gray-500 mt-0.5">{site.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
