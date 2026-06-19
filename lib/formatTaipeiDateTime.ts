const TAIPEI_TZ = 'Asia/Taipei'

/** 將資料庫時間轉為臺灣時區（UTC+8）的日期與時間字串，供 API 回傳顯示用 */
export function formatTaipeiDateTime(
  raw: Date | string | null | undefined
): { date: string; time: string } {
  if (raw == null || raw === '') return { date: '', time: '' }

  const d = raw instanceof Date ? raw : new Date(raw)
  if (Number.isNaN(d.getTime())) return { date: '', time: '' }

  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TAIPEI_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: TAIPEI_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const [year, month, day] = dateFormatter.format(d).split('-')
  const timeParts = timeFormatter.formatToParts(d)
  const hour = timeParts.find((p) => p.type === 'hour')?.value ?? '00'
  const minute = timeParts.find((p) => p.type === 'minute')?.value ?? '00'

  return {
    date: `${year}/${month}/${day}`,
    time: `${hour}:${minute}`,
  }
}
