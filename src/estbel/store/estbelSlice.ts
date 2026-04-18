import { createSlice } from '@reduxjs/toolkit'
import type { 
  Scheme, 
  Transaction, 
  TransactionFilters, 
  SchemeStats,
} from '../types'

interface Action<T = unknown> {
  type: string
  payload: T
}

interface EstbelState {
  schemes: Scheme[]
  transactions: Transaction[]
  selectedSchemeId: string | null
  filters: TransactionFilters
  stats: SchemeStats
  loading: boolean
  error: string | null
}

const initialState: EstbelState = {
  schemes: [],
  transactions: [],
  selectedSchemeId: null,
  filters: {
    schemeId: 'all',
    type: 'all',
    dateRange: { startDate: null, endDate: null },
    searchQuery: '',
  },
  stats: {
    totalBalance: 0,
    totalIn: 0,
    totalOut: 0,
    transactionCount: 0,
    schemeCount: 0,
  },
  loading: false,
  error: null,
}

// Helper to compute stats from schemes
const computeStats = (schemes: Scheme[]): SchemeStats => {
  return schemes.reduce(
    (acc, scheme) => ({
      totalBalance: acc.totalBalance + scheme.balance,
      totalIn: acc.totalIn + scheme.totalIn,
      totalOut: acc.totalOut + scheme.totalOut,
      transactionCount: acc.transactionCount + scheme.transactionCount,
      schemeCount: acc.schemeCount + 1,
    }),
    { totalBalance: 0, totalIn: 0, totalOut: 0, transactionCount: 0, schemeCount: 0 }
  )
}

export const estbelSlice = createSlice({
  name: 'estbel',
  initialState,
  reducers: {
    // Loading states
    setLoading: (state, action: Action<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: Action<string | null>) => {
      state.error = action.payload
    },

    // Schemes
    setSchemes: (state, action: Action<Scheme[]>) => {
      state.schemes = action.payload
      state.stats = computeStats(action.payload)
    },
    addScheme: (state, action: Action<Scheme>) => {
      state.schemes.push(action.payload)
      state.stats = computeStats(state.schemes)
    },
    updateScheme: (state, action: Action<{ id: string; data: Partial<Scheme> }>) => {
      const index = state.schemes.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.schemes[index] = { ...state.schemes[index], ...action.payload.data }
        state.stats = computeStats(state.schemes)
      }
    },
    removeScheme: (state, action: Action<string>) => {
      state.schemes = state.schemes.filter(s => s.id !== action.payload)
      state.transactions = state.transactions.filter(t => t.schemeId !== action.payload)
      state.stats = computeStats(state.schemes)
      if (state.selectedSchemeId === action.payload) {
        state.selectedSchemeId = null
      }
    },

    // Transactions
    setTransactions: (state, action: Action<Transaction[]>) => {
      state.transactions = action.payload
    },
    addTransaction: (state, action: Action<Transaction>) => {
      state.transactions.push(action.payload)
      // Update scheme balance
      const scheme = state.schemes.find(s => s.id === action.payload.schemeId)
      if (scheme) {
        if (action.payload.type === 'in') {
          scheme.balance += action.payload.total
          scheme.totalIn += action.payload.total
        } else {
          scheme.balance -= action.payload.total
          scheme.totalOut += action.payload.total
        }
        scheme.transactionCount += 1
        state.stats = computeStats(state.schemes)
      }
    },
    updateTransaction: (state, action: Action<{ id: string; data: Partial<Transaction> }>) => {
      const index = state.transactions.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.transactions[index] = { ...state.transactions[index], ...action.payload.data }
      }
    },
    removeTransaction: (state, action: Action<Transaction>) => {
      const tx = action.payload
      state.transactions = state.transactions.filter(t => t.id !== tx.id)
      // Update scheme balance
      const scheme = state.schemes.find(s => s.id === tx.schemeId)
      if (scheme) {
        if (tx.type === 'in') {
          scheme.balance -= tx.total
          scheme.totalIn -= tx.total
        } else {
          scheme.balance += tx.total
          scheme.totalOut -= tx.total
        }
        scheme.transactionCount -= 1
        state.stats = computeStats(state.schemes)
      }
    },

    // Selection & Filters
    setSelectedScheme: (state, action: Action<string | null>) => {
      state.selectedSchemeId = action.payload
    },
    setFilters: (state, action: Action<Partial<TransactionFilters>>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetFilters: (state) => {
      state.filters = initialState.filters
    },

    // Reset all
    resetEstbel: () => initialState,
  },
})

export const {
  setLoading,
  setError,
  setSchemes,
  addScheme,
  updateScheme,
  removeScheme,
  setTransactions,
  addTransaction,
  updateTransaction,
  removeTransaction,
  setSelectedScheme,
  setFilters,
  resetFilters,
  resetEstbel,
} = estbelSlice.actions

export default estbelSlice.reducer
