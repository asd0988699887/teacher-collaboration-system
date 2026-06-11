/** 表單 / API 用：轉成 MySQL DATETIME 字串 */
export function toMysqlDateTime(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  const v = value.trim()
  const local = v.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::\d{2})?/)
  if (local) return `${local[1]} ${local[2]}:${local[3]}:00`
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v} 00:00:00`
  const mysql = v.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})(?::\d{2})?/)
  if (mysql) return `${mysql[1]} ${mysql[2]}:${mysql[3]}:00`
  return null
}

/** 以本地時區格式化為 datetime-local 值（避免 toISOString 造成 UTC 偏移） */
function formatDateToDatetimeLocal(d: Date): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/** 資料庫值 → datetime-local 輸入框格式 */
export function toDatetimeLocalValue(value: string | null | undefined): string {
  if (!value?.trim()) return ''
  const v = String(value).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00`
  const mysql = v.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2})/)
  if (mysql) return `${mysql[1]}T${mysql[2]}:${mysql[3]}`
  const local = v.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})/)
  if (local && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(v)) {
    return `${local[1]}T${local[2]}:${local[3]}`
  }
  const d = new Date(v)
  if (isNaN(d.getTime())) return ''
  return formatDateToDatetimeLocal(d)
}

/** API 回傳給前端：保留日期時間 */
export function fromMysqlToClientDateTime(value: string | Date | null | undefined): string {
  if (!value) return ''
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return ''
    return formatDateToDatetimeLocal(value)
  }
  return toDatetimeLocalValue(String(value))
}

function extractDatePart(value: string): string {
  if (!value) return ''
  const part = value.includes('T') ? value.split('T')[0] : value.split(' ')[0]
  return part.replace(/-/g, '/')
}

function extractTimePart(value: string): string | null {
  if (!value) return null
  let time: string | undefined
  if (value.includes('T')) time = value.split('T')[1]
  else if (value.includes(' ')) time = value.split(' ')[1]
  if (!time) return null
  const [h, m] = time.split(':')
  if (!h || !m) return null
  if (h === '00' && m === '00') return null
  return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`
}

export function hasTaskTime(value: string): boolean {
  return extractTimePart(value) !== null
}

/** 卡片預設：僅年月日 */
export function formatTaskDateCompact(value: string): string {
  return extractDatePart(value)
}

/** hover 提示：含時分（若未設定則同 compact） */
export function formatTaskDateFull(value: string): string {
  const date = extractDatePart(value)
  if (!date) return ''
  const time = extractTimePart(value)
  return time ? `${date} ${time}` : date
}

export function formatTaskDateRangeCompact(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return ''
  if (!startDate) return formatTaskDateCompact(endDate)
  if (!endDate) return formatTaskDateCompact(startDate)
  return `${formatTaskDateCompact(startDate)}~${formatTaskDateCompact(endDate)}`
}

export function formatTaskDateRangeFull(startDate: string, endDate: string): string {
  if (!startDate && !endDate) return ''
  if (!startDate) return formatTaskDateFull(endDate)
  if (!endDate) return formatTaskDateFull(startDate)
  return `${formatTaskDateFull(startDate)} ~ ${formatTaskDateFull(endDate)}`
}
