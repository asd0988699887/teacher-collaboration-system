/** 解析任務截止日期（YYYY-MM-DD、datetime-local 或 MySQL DATETIME） */
export function parseTaskEndDate(endDate: string): Date | null {
  if (!endDate?.trim()) return null
  const v = endDate.trim()
  const local = v.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (local) {
    return new Date(
      Number(local[1]),
      Number(local[2]) - 1,
      Number(local[3]),
      Number(local[4]),
      Number(local[5])
    )
  }
  const mysql = v.match(/^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})/)
  if (mysql) {
    return new Date(
      Number(mysql[1]),
      Number(mysql[2]) - 1,
      Number(mysql[3]),
      Number(mysql[4]),
      Number(mysql[5])
    )
  }
  const datePart = v.includes('T') ? v.split('T')[0] : v.split(' ')[0]
  const [y, m, d] = datePart.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

/** 距截止日剩餘天數（截止當天為 0，已過期為負數） */
export function daysUntilDeadline(endDate: string, today = startOfDay(new Date())): number | null {
  const end = parseTaskEndDate(endDate)
  if (!end) return null
  const endDay = startOfDay(end)
  return Math.round((endDay.getTime() - today.getTime()) / 86400000)
}

export function isIncompleteKanbanTask(status?: string): boolean {
  return status !== 'completed'
}

export function isTaskOverdue(endDate: string, status?: string): boolean {
  if (!isIncompleteKanbanTask(status)) return false
  const days = daysUntilDeadline(endDate)
  return days !== null && days < 0
}

/** 未完成且 3 個日曆日內到期（含今天，未過期） */
export function isTaskDueSoon(endDate: string, status?: string): boolean {
  if (!isIncompleteKanbanTask(status)) return false
  const days = daysUntilDeadline(endDate)
  return days !== null && days >= 0 && days <= 3
}

export interface KanbanTaskForStatus {
  status?: string
  endDate?: string
  assignees?: string[]
}

export interface TaskStatusSummary {
  deadlineReminder: number
  myIncomplete: number
  incomplete: number
  completed: number
}

/** 與活動內側邊欄「任務狀態」相同的四項摘要 */
export function computeKanbanTaskStatusSummary(
  tasks: KanbanTaskForStatus[],
  userId?: string | null
): TaskStatusSummary {
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const incompleteTasks = tasks.filter((t) => t.status !== 'completed')
  const myIncompleteTasks = incompleteTasks.filter(
    (t) => userId != null && Array.isArray(t.assignees) && t.assignees.includes(userId)
  )
  const overdueTasks = incompleteTasks.filter((t) => isTaskOverdue(t.endDate || '', t.status))
  const dueSoonTasks = incompleteTasks.filter((t) => isTaskDueSoon(t.endDate || '', t.status))

  return {
    deadlineReminder: overdueTasks.length + dueSoonTasks.length,
    myIncomplete: myIncompleteTasks.length,
    incomplete: incompleteTasks.length,
    completed: completedTasks.length,
  }
}
