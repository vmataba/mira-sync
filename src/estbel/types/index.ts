// Estbel Multi-Scheme Cash Flow Types

export type TransactionType = 'in' | 'out'

export interface Transaction {
  id: string
  schemeId: string
  type: TransactionType
  unitPrice: number
  quantity: number
  total: number // Auto-computed: unitPrice * quantity
  date: string // ISO date string
  description: string
  createdAt: string
  createdBy: string
  createdByName: string
}

export interface Scheme {
  id: string
  name: string
  description?: string
  color: string // Hex color for visual distinction
  icon?: string // Icon identifier
  balance: number // Current balance (computed from transactions)
  totalIn: number // Total cash in
  totalOut: number // Total cash out
  transactionCount: number
  createdAt: string
  createdBy: string
  isArchived?: boolean
}

export interface SchemeStats {
  totalBalance: number
  totalIn: number
  totalOut: number
  transactionCount: number
  schemeCount: number
}

export interface TransactionFormData {
  type: TransactionType
  unitPrice: string
  quantity: string
  date: string
  description: string
  schemeId: string
}

export interface SchemeFormData {
  name: string
  description: string
  color: string
}

export interface DateRange {
  startDate: string | null
  endDate: string | null
}

export interface TransactionFilters {
  schemeId: string | 'all'
  type: TransactionType | 'all'
  dateRange: DateRange
  searchQuery: string
}

// PDF Report Types
export interface ReportData {
  scheme: Scheme
  transactions: Transaction[]
  dateRange: DateRange
  generatedAt: string
  generatedBy: string
}

// Scheme color presets (Banking-inspired)
export const SCHEME_COLORS = [
  '#0A2540', // Deep Blue (Primary)
  '#00A67E', // Teal Green
  '#6366F1', // Indigo
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#14B8A6', // Cyan
] as const

// Default transaction form state
export const DEFAULT_TRANSACTION_FORM: TransactionFormData = {
  type: 'in',
  unitPrice: '',
  quantity: '1',
  date: new Date().toISOString().split('T')[0],
  description: '',
  schemeId: '',
}

// Default scheme form state
export const DEFAULT_SCHEME_FORM: SchemeFormData = {
  name: '',
  description: '',
  color: SCHEME_COLORS[0],
}

// Default filters
export const DEFAULT_FILTERS: TransactionFilters = {
  schemeId: 'all',
  type: 'all',
  dateRange: {
    startDate: null,
    endDate: null,
  },
  searchQuery: '',
}
