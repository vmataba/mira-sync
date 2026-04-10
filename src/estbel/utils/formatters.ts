// Estbel Number Formatting Utilities

/**
 * Format number with thousand separators
 */
export const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

/**
 * Duration preset types for reports
 */
export type DurationPreset = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom'

/**
 * Get date range for a duration preset
 */
export const getDateRangeForPreset = (preset: DurationPreset): { startDate: string; endDate: string } => {
  const today = new Date()
  const formatDate = (d: Date) => d.toISOString().split('T')[0]
  
  switch (preset) {
    case 'today':
      return { startDate: formatDate(today), endDate: formatDate(today) }
    
    case 'yesterday': {
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)
      return { startDate: formatDate(yesterday), endDate: formatDate(yesterday) }
    }
    
    case 'this_week': {
      const startOfWeek = new Date(today)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) // Monday
      startOfWeek.setDate(diff)
      return { startDate: formatDate(startOfWeek), endDate: formatDate(today) }
    }
    
    case 'last_week': {
      const startOfLastWeek = new Date(today)
      const day = startOfLastWeek.getDay()
      const diff = startOfLastWeek.getDate() - day + (day === 0 ? -6 : 1) - 7
      startOfLastWeek.setDate(diff)
      const endOfLastWeek = new Date(startOfLastWeek)
      endOfLastWeek.setDate(endOfLastWeek.getDate() + 6)
      return { startDate: formatDate(startOfLastWeek), endDate: formatDate(endOfLastWeek) }
    }
    
    case 'this_month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
      return { startDate: formatDate(startOfMonth), endDate: formatDate(today) }
    }
    
    case 'last_month': {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      return { startDate: formatDate(startOfLastMonth), endDate: formatDate(endOfLastMonth) }
    }
    
    case 'custom':
    default:
      return { startDate: '', endDate: '' }
  }
}

/**
 * Get label for duration preset
 */
export const getDurationLabel = (preset: DurationPreset): string => {
  const labels: Record<DurationPreset, string> = {
    today: 'Today',
    yesterday: 'Yesterday',
    this_week: 'This Week',
    last_week: 'Last Week',
    this_month: 'This Month',
    last_month: 'Last Month',
    custom: 'Custom Range',
  }
  return labels[preset]
}

/**
 * Format large numbers with abbreviations (K, M, B)
 * e.g., 50000 -> "50K", 1500000 -> "1.5M"
 */
export const formatAbbreviated = (num: number): string => {
  const absNum = Math.abs(num)
  const sign = num < 0 ? '-' : ''
  
  if (absNum >= 1_000_000_000) {
    const value = absNum / 1_000_000_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}B`
  }
  if (absNum >= 1_000_000) {
    const value = absNum / 1_000_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}M`
  }
  if (absNum >= 10_000) {
    const value = absNum / 1_000
    return `${sign}${value % 1 === 0 ? value.toFixed(0) : value.toFixed(1)}K`
  }
  if (absNum >= 1_000) {
    return `${sign}${formatNumber(absNum)}`
  }
  return `${sign}${absNum}`
}

/**
 * Format currency with TZS prefix and abbreviation for large amounts
 */
export const formatCurrencyAbbr = (num: number, showPrefix = true): string => {
  const prefix = showPrefix ? 'TZS ' : ''
  return `${prefix}${formatAbbreviated(num)}`
}

/**
 * Format currency with full number (with thousand separators)
 */
export const formatCurrencyFull = (num: number, showPrefix = true): string => {
  const prefix = showPrefix ? 'TZS ' : ''
  const sign = num < 0 ? '-' : ''
  return `${prefix}${sign}${formatNumber(Math.abs(num))}`
}

/**
 * Format date for display (DD/MM/YYYY)
 */
export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format date short (DD Mon)
 */
export const formatDateShort = (dateStr: string): string => {
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${day} ${months[date.getMonth()]}`
}

/**
 * Format date medium (DD Mon YYYY)
 */
export const formatDateMedium = (dateStr: string): string => {
  const date = new Date(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}
