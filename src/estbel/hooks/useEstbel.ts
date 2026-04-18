import { useEffect, useCallback, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../store'
import {
  setSchemes,
  setTransactions,
  setLoading,
  setSelectedScheme,
  setFilters,
  resetFilters,
} from '../store/estbelSlice'
import { schemeService, transactionService } from '../services/estbelService'
import type { 
  Scheme, 
  Transaction, 
  TransactionFilters, 
  SchemeFormData,
  TransactionFormData,
} from '../types'

// Hook for managing schemes
export function useSchemes() {
  const dispatch = useAppDispatch()
  const { schemes, stats, loading, error } = useAppSelector((state) => state.estbel)

  useEffect(() => {
    dispatch(setLoading(true))
    const unsubscribe = schemeService.subscribeToSchemes((fetchedSchemes) => {
      dispatch(setSchemes(fetchedSchemes))
      dispatch(setLoading(false))
    })
    return () => unsubscribe()
  }, [dispatch])

  const createScheme = useCallback(
    async (data: SchemeFormData, userId: string): Promise<string | null> => {
      const schemeData = {
        name: data.name.trim(),
        description: data.description?.trim() || '',
        color: data.color,
        createdBy: userId,
      }
      return await schemeService.createScheme(schemeData)
    },
    []
  )

  const updateScheme = useCallback(
    async (id: string, data: Partial<SchemeFormData>): Promise<boolean> => {
      const updateData: Partial<Scheme> = {}
      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.description !== undefined) updateData.description = data.description.trim() || undefined
      if (data.color !== undefined) updateData.color = data.color
      return await schemeService.updateScheme(id, updateData)
    },
    []
  )

  const archiveScheme = useCallback(async (id: string): Promise<boolean> => {
    return await schemeService.archiveScheme(id)
  }, [])

  const deleteScheme = useCallback(async (id: string): Promise<boolean> => {
    return await schemeService.deleteScheme(id)
  }, [])

  return {
    schemes,
    stats,
    loading,
    error,
    createScheme,
    updateScheme,
    archiveScheme,
    deleteScheme,
  }
}

// Hook for managing transactions
export function useTransactions(schemeId?: string) {
  const dispatch = useAppDispatch()
  const { transactions, filters, loading } = useAppSelector((state) => state.estbel)

  useEffect(() => {
    dispatch(setLoading(true))
    const unsubscribe = schemeId
      ? transactionService.subscribeToSchemeTransactions(schemeId, (fetched) => {
          dispatch(setTransactions(fetched))
          dispatch(setLoading(false))
        })
      : transactionService.subscribeToTransactions((fetched) => {
          dispatch(setTransactions(fetched))
          dispatch(setLoading(false))
        })
    return () => unsubscribe()
  }, [dispatch, schemeId])

  const createTransaction = useCallback(
    async (
      data: TransactionFormData,
      userId: string,
      userName: string
    ): Promise<string | null> => {
      const transactionData = {
        type: data.type,
        unitPrice: parseFloat(data.unitPrice.replace(/,/g, '')) || 0,
        quantity: parseFloat(data.quantity) || 1,
        date: data.date,
        description: data.description.trim(),
        schemeId: data.schemeId,
        createdBy: userId,
        createdByName: userName,
      }
      return await transactionService.createTransaction(transactionData, data.schemeId)
    },
    []
  )

  const updateTransaction = useCallback(
    async (
      id: string,
      data: Partial<TransactionFormData>,
      oldSchemeId?: string
    ): Promise<boolean> => {
      const updateData: Partial<Transaction> = {}
      if (data.type !== undefined) updateData.type = data.type
      if (data.unitPrice !== undefined) {
        updateData.unitPrice = parseFloat(data.unitPrice.replace(/,/g, '')) || 0
      }
      if (data.quantity !== undefined) {
        updateData.quantity = parseFloat(data.quantity) || 1
      }
      if (data.date !== undefined) updateData.date = data.date
      if (data.description !== undefined) updateData.description = data.description.trim()
      if (data.schemeId !== undefined) updateData.schemeId = data.schemeId
      
      return await transactionService.updateTransaction(id, updateData, oldSchemeId)
    },
    []
  )

  const deleteTransaction = useCallback(
    async (id: string, schemeId: string): Promise<boolean> => {
      return await transactionService.deleteTransaction(id, schemeId)
    },
    []
  )

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Filter by scheme
      if (filters.schemeId !== 'all' && tx.schemeId !== filters.schemeId) {
        return false
      }
      // Filter by type
      if (filters.type !== 'all' && tx.type !== filters.type) {
        return false
      }
      // Filter by date range
      if (filters.dateRange.startDate && tx.date < filters.dateRange.startDate) {
        return false
      }
      if (filters.dateRange.endDate && tx.date > filters.dateRange.endDate) {
        return false
      }
      // Filter by search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        return tx.description.toLowerCase().includes(query)
      }
      return true
    })
  }, [transactions, filters])

  const updateFilters = useCallback(
    (newFilters: Partial<TransactionFilters>) => {
      dispatch(setFilters(newFilters))
    },
    [dispatch]
  )

  const clearFilters = useCallback(() => {
    dispatch(resetFilters())
  }, [dispatch])

  return {
    transactions,
    filteredTransactions,
    filters,
    loading,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updateFilters,
    clearFilters,
  }
}

// Hook for scheme selection
export function useSchemeSelection() {
  const dispatch = useAppDispatch()
  const { selectedSchemeId, schemes } = useAppSelector((state) => state.estbel)

  const selectedScheme = useMemo(
    () => schemes.find((s) => s.id === selectedSchemeId) || null,
    [schemes, selectedSchemeId]
  )

  const selectScheme = useCallback(
    (id: string | null) => {
      dispatch(setSelectedScheme(id))
    },
    [dispatch]
  )

  return {
    selectedSchemeId,
    selectedScheme,
    selectScheme,
  }
}
