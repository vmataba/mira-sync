import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../../firebaseApp'
import type { Scheme, Transaction } from '../types'

const SCHEMES_COLLECTION = 'estbel_schemes'
const TRANSACTIONS_COLLECTION = 'estbel_transactions'

// Scheme Service
export const schemeService = {
  // Subscribe to real-time scheme updates
  subscribeToSchemes(callback: (schemes: Scheme[]) => void): () => void {
    console.log('subscribeToSchemes: Setting up subscription')
    const colRef = collection(db, SCHEMES_COLLECTION)
    
    return onSnapshot(
      colRef, 
      (snapshot) => {
        console.log('subscribeToSchemes: Received snapshot with', snapshot.docs.length, 'docs')
        const schemes: Scheme[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Scheme[]
        // Sort by createdAt descending and filter archived
        const filtered = schemes
          .filter(s => !s.isArchived)
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        console.log('subscribeToSchemes: Filtered schemes:', filtered.length)
        callback(filtered)
      },
      (error) => {
        console.error('subscribeToSchemes: Error in subscription:', error)
      }
    )
  },

  // Create a new scheme
  async createScheme(data: { name: string; description?: string; color: string; createdBy: string }): Promise<string | null> {
    try {
      // Build clean payload - remove undefined values
      const schemeData: Record<string, unknown> = {
        name: data.name,
        color: data.color,
        createdBy: data.createdBy,
        balance: 0,
        totalIn: 0,
        totalOut: 0,
        transactionCount: 0,
        createdAt: new Date().toISOString(),
        isArchived: false,
      }
      
      // Only add description if it has a value
      if (data.description && data.description.trim()) {
        schemeData.description = data.description.trim()
      }
      
      console.log('Creating scheme with data:', schemeData)
      const docRef = await addDoc(collection(db, SCHEMES_COLLECTION), schemeData)
      console.log('Scheme created with ID:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('Error creating scheme:', error)
      return null
    }
  },

  // Update a scheme
  async updateScheme(id: string, data: Partial<Scheme>): Promise<boolean> {
    try {
      await updateDoc(doc(db, SCHEMES_COLLECTION, id), data)
      return true
    } catch (error) {
      console.error('Error updating scheme:', error)
      return false
    }
  },

  // Archive a scheme (soft delete)
  async archiveScheme(id: string): Promise<boolean> {
    try {
      await updateDoc(doc(db, SCHEMES_COLLECTION, id), { isArchived: true })
      return true
    } catch (error) {
      console.error('Error archiving scheme:', error)
      return false
    }
  },

  // Delete a scheme and all its transactions
  async deleteScheme(id: string): Promise<boolean> {
    try {
      const batch = writeBatch(db)
      
      // Delete all transactions for this scheme
      const txQuery = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('schemeId', '==', id)
      )
      const txSnapshot = await getDocs(txQuery)
      txSnapshot.docs.forEach((txDoc) => {
        batch.delete(txDoc.ref)
      })
      
      // Delete the scheme
      batch.delete(doc(db, SCHEMES_COLLECTION, id))
      
      await batch.commit()
      return true
    } catch (error) {
      console.error('Error deleting scheme:', error)
      return false
    }
  },

  // Recalculate scheme totals from transactions
  async recalculateScheme(schemeId: string): Promise<boolean> {
    try {
      const txQuery = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('schemeId', '==', schemeId)
      )
      const snapshot = await getDocs(txQuery)
      
      let totalIn = 0
      let totalOut = 0
      
      snapshot.docs.forEach((doc) => {
        const tx = doc.data() as Transaction
        if (tx.type === 'in') {
          totalIn += tx.total
        } else {
          totalOut += tx.total
        }
      })
      
      await updateDoc(doc(db, SCHEMES_COLLECTION, schemeId), {
        balance: totalIn - totalOut,
        totalIn,
        totalOut,
        transactionCount: snapshot.size,
      })
      
      return true
    } catch (error) {
      console.error('Error recalculating scheme:', error)
      return false
    }
  },
}

// Transaction Service
export const transactionService = {
  // Subscribe to real-time transaction updates
  subscribeToTransactions(callback: (transactions: Transaction[]) => void): () => void {
    const colRef = collection(db, TRANSACTIONS_COLLECTION)
    
    return onSnapshot(
      colRef, 
      (snapshot) => {
        const transactions: Transaction[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Transaction[]
        // Sort by date desc, then createdAt desc
        const sorted = transactions.sort((a, b) => {
          const dateCompare = (b.date || '').localeCompare(a.date || '')
          if (dateCompare !== 0) return dateCompare
          return (b.createdAt || '').localeCompare(a.createdAt || '')
        })
        callback(sorted)
      },
      (error) => {
        console.error('subscribeToTransactions: Error:', error)
      }
    )
  },

  // Subscribe to transactions for a specific scheme
  subscribeToSchemeTransactions(
    schemeId: string,
    callback: (transactions: Transaction[]) => void
  ): () => void {
    const q = query(
      collection(db, TRANSACTIONS_COLLECTION),
      where('schemeId', '==', schemeId)
    )
    
    return onSnapshot(
      q, 
      (snapshot) => {
        const transactions: Transaction[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as Transaction[]
        // Sort by date desc, then createdAt desc
        const sorted = transactions.sort((a, b) => {
          const dateCompare = (b.date || '').localeCompare(a.date || '')
          if (dateCompare !== 0) return dateCompare
          return (b.createdAt || '').localeCompare(a.createdAt || '')
        })
        callback(sorted)
      },
      (error) => {
        console.error('subscribeToSchemeTransactions: Error:', error)
      }
    )
  },

  // Create a new transaction
  async createTransaction(
    data: Omit<Transaction, 'id' | 'total' | 'createdAt'>,
    schemeId: string
  ): Promise<string | null> {
    try {
      const total = data.unitPrice * data.quantity
      const transactionData = {
        ...data,
        schemeId,
        total,
        createdAt: new Date().toISOString(),
      }
      
      const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), transactionData)
      
      // Update scheme totals
      await schemeService.recalculateScheme(schemeId)
      
      return docRef.id
    } catch (error) {
      console.error('Error creating transaction:', error)
      return null
    }
  },

  // Update a transaction
  async updateTransaction(
    id: string,
    data: Partial<Transaction>,
    oldSchemeId?: string
  ): Promise<boolean> {
    try {
      // Recalculate total if unitPrice or quantity changed
      const updateData = { ...data }
      if (data.unitPrice !== undefined && data.quantity !== undefined) {
        updateData.total = data.unitPrice * data.quantity
      }
      
      await updateDoc(doc(db, TRANSACTIONS_COLLECTION, id), updateData)
      
      // Recalculate scheme totals
      if (data.schemeId) {
        await schemeService.recalculateScheme(data.schemeId)
        if (oldSchemeId && oldSchemeId !== data.schemeId) {
          await schemeService.recalculateScheme(oldSchemeId)
        }
      }
      
      return true
    } catch (error) {
      console.error('Error updating transaction:', error)
      return false
    }
  },

  // Delete a transaction
  async deleteTransaction(id: string, schemeId: string): Promise<boolean> {
    try {
      await deleteDoc(doc(db, TRANSACTIONS_COLLECTION, id))
      
      // Recalculate scheme totals
      await schemeService.recalculateScheme(schemeId)
      
      return true
    } catch (error) {
      console.error('Error deleting transaction:', error)
      return false
    }
  },

  // Get transactions by date range
  async getTransactionsByDateRange(
    startDate: string,
    endDate: string,
    schemeId?: string
  ): Promise<Transaction[]> {
    try {
      let q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      )
      
      if (schemeId) {
        q = query(
          collection(db, TRANSACTIONS_COLLECTION),
          where('schemeId', '==', schemeId),
          where('date', '>=', startDate),
          where('date', '<=', endDate),
          orderBy('date', 'desc')
        )
      }
      
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Transaction[]
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  },
}

export default { schemeService, transactionService }
