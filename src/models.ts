export type Priority = 'high' | 'medium' | 'low'

export type TaskType = 'monetary' | 'general'

export interface Assignment {
  id: string
  name: string
  type: 'user' | 'group'
}

export interface Sprint {
  id: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  isActive?: boolean
}

export interface MonetaryInfo {
  amount: number
  currency: string
  invested: number
}

export interface HistoryEntry {
  timestamp: string
  value: number
  changedBy?: string
  note?: string
}

export interface Task {
  id: string
  title: string
  description?: string
  type: TaskType
  sprintId: string
  assignee?: Assignment
  deadline?: string
  priority: Priority
  progress: number // 0-100
  monetary?: MonetaryInfo
  progressHistory?: HistoryEntry[]
  investedHistory?: HistoryEntry[]
  pinned?: boolean // Pinned tasks appear at the top
}

export interface Expense {
  id: string
  amount: number // Amount in TZS
  purpose: string // Short purpose/category
  description: string // Detailed description
  date: string // ISO date string
  userId: string // User who recorded the expense
  userName: string // User's display name for easy viewing
  createdAt: string // When the expense was recorded
}
