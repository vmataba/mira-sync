export type Priority = 'high' | 'medium' | 'low'

export type TaskType = 'monetary' | 'general'

export type TaskStatus = 'new' | 'pending' | 'in_progress' | 'completed' | 'discarded'

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

export interface Comment {
  id: string
  taskId: string
  userId: string
  userName: string
  text: string
  createdAt: string
  updatedAt?: string
  parentId?: string
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
  status?: TaskStatus
  completedAt?: string
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
