import type { Task, TaskStatus } from '../models'

export const getEffectiveStatus = (task: Task): TaskStatus => {
  if (task.status) return task.status
  if (task.progress >= 100) return 'completed'
  if (task.progress > 0) return 'in_progress'
  return 'new'
}

export const isTaskResolved = (task: Task): boolean => {
  const status = getEffectiveStatus(task)
  return status === 'completed' || status === 'discarded'
}

export const formatCompletedDate = (dateString: string): string => {
  const date = new Date(dateString)
  const day = date.getDate()
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = day % 100
  const ordinal = suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const year = date.getFullYear()
  return `${day}${ordinal} ${month} ${year}`
}

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  const diffWeeks = Math.floor(diffDays / 7)

  if (diffSecs < 60) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffWeeks < 4) return `${diffWeeks}w ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
