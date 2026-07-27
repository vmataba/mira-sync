import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebaseApp'
import type { Task, Sprint, Expense, Comment } from '../models'
import type { AuthUser } from '../auth/authService'

// Collection names
const COLLECTIONS = {
  TASKS: 'tasks',
  SPRINTS: 'sprints',
  USERS: 'users',
  EXPENSES: 'expenses',
  COMMENTS: 'comments',
} as const

// ============= TASKS =============

export const taskService = {
  // Get all tasks
  async getAllTasks(): Promise<Task[]> {
    try {
      const tasksRef = collection(db, COLLECTIONS.TASKS)
      const snapshot = await getDocs(tasksRef)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
    } catch (error) {
      console.error('Error fetching tasks:', error)
      return []
    }
  },

  // Get tasks by sprint ID
  async getTasksBySprintId(sprintId: string): Promise<Task[]> {
    try {
      const tasksRef = collection(db, COLLECTIONS.TASKS)
      const q = query(tasksRef, where('sprintId', '==', sprintId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[]
    } catch (error) {
      console.error('Error fetching tasks by sprint:', error)
      return []
    }
  },

  // Get a single task
  async getTask(taskId: string): Promise<Task | null> {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId)
      const snapshot = await getDoc(taskRef)
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Task
      }
      return null
    } catch (error) {
      console.error('Error fetching task:', error)
      return null
    }
  },

  // Create a new task
  async createTask(task: Omit<Task, 'id'>): Promise<string | null> {
    try {
      const tasksRef = collection(db, COLLECTIONS.TASKS)
      const docRef = await addDoc(tasksRef, {
        ...task,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating task:', error)
      return null
    }
  },

  // Update a task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId)
      await updateDoc(taskRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
      return true
    } catch (error) {
      console.error('Error updating task:', error)
      return false
    }
  },

  // Delete a task
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const taskRef = doc(db, COLLECTIONS.TASKS, taskId)
      await deleteDoc(taskRef)
      return true
    } catch (error) {
      console.error('Error deleting task:', error)
      return false
    }
  },

  // Subscribe to tasks changes
  subscribeToTasks(callback: (tasks: Task[]) => void): Unsubscribe {
    const tasksRef = collection(db, COLLECTIONS.TASKS)
    return onSnapshot(
      tasksRef,
      (snapshot) => {
        const tasks = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Task[]
        callback(tasks)
      },
      (error) => {
        console.error('Error subscribing to tasks:', error)
      }
    )
  },
}

// ============= SPRINTS =============

export const sprintService = {
  // Get all sprints
  async getAllSprints(): Promise<Sprint[]> {
    try {
      const sprintsRef = collection(db, COLLECTIONS.SPRINTS)
      const snapshot = await getDocs(sprintsRef)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sprint[]
    } catch (error) {
      console.error('Error fetching sprints:', error)
      return []
    }
  },

  // Get a single sprint
  async getSprint(sprintId: string): Promise<Sprint | null> {
    try {
      const sprintRef = doc(db, COLLECTIONS.SPRINTS, sprintId)
      const snapshot = await getDoc(sprintRef)
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Sprint
      }
      return null
    } catch (error) {
      console.error('Error fetching sprint:', error)
      return null
    }
  },

  // Create a new sprint
  async createSprint(sprint: Omit<Sprint, 'id'>): Promise<string | null> {
    try {
      const sprintsRef = collection(db, COLLECTIONS.SPRINTS)
      const docRef = await addDoc(sprintsRef, {
        ...sprint,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating sprint:', error)
      return null
    }
  },

  // Update a sprint
  async updateSprint(sprintId: string, updates: Partial<Sprint>): Promise<boolean> {
    try {
      const sprintRef = doc(db, COLLECTIONS.SPRINTS, sprintId)
      await updateDoc(sprintRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
      return true
    } catch (error) {
      console.error('Error updating sprint:', error)
      return false
    }
  },

  // Delete a sprint
  async deleteSprint(sprintId: string): Promise<boolean> {
    try {
      const sprintRef = doc(db, COLLECTIONS.SPRINTS, sprintId)
      await deleteDoc(sprintRef)
      return true
    } catch (error) {
      console.error('Error deleting sprint:', error)
      return false
    }
  },

  // Set active sprint (mark one as active, others as inactive)
  async setActiveSprint(sprintId: string): Promise<boolean> {
    try {
      // Get all sprints
      const sprints = await this.getAllSprints()
      
      // Update all sprints in a batch-like manner
      const updatePromises = sprints.map(async (sprint) => {
        const sprintRef = doc(db, COLLECTIONS.SPRINTS, sprint.id)
        await updateDoc(sprintRef, {
          isActive: sprint.id === sprintId,
          updatedAt: Timestamp.now(),
        })
      })
      
      await Promise.all(updatePromises)
      console.log('Active sprint set to:', sprintId)
      return true
    } catch (error) {
      console.error('Error setting active sprint:', error)
      return false
    }
  },

  // Get the active sprint
  async getActiveSprint(): Promise<Sprint | null> {
    try {
      const sprints = await this.getAllSprints()
      return sprints.find((s) => s.isActive) || sprints[0] || null
    } catch (error) {
      console.error('Error getting active sprint:', error)
      return null
    }
  },

  // Subscribe to sprints changes
  subscribeToSprints(callback: (sprints: Sprint[]) => void): Unsubscribe {
    const sprintsRef = collection(db, COLLECTIONS.SPRINTS)
    return onSnapshot(
      sprintsRef,
      (snapshot) => {
        const sprints = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Sprint[]
        callback(sprints)
      },
      (error) => {
        console.error('Error subscribing to sprints:', error)
      }
    )
  },
}

// ============= USERS =============

export const userService = {
  // Get all users
  async getAllUsers(): Promise<AuthUser[]> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const snapshot = await getDocs(usersRef)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AuthUser[]
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    }
  },

  // Get a single user
  async getUser(userId: string): Promise<AuthUser | null> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      const snapshot = await getDoc(userRef)
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as AuthUser
      }
      return null
    } catch (error) {
      console.error('Error fetching user:', error)
      return null
    }
  },

  // Get user by username
  async getUserByUsername(username: string): Promise<AuthUser | null> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(usersRef, where('username', '==', username.toLowerCase()))
      const snapshot = await getDocs(q)
      if (!snapshot.empty) {
        const doc = snapshot.docs[0]
        return { id: doc.id, ...doc.data() } as AuthUser
      }
      return null
    } catch (error) {
      console.error('Error fetching user by username:', error)
      return null
    }
  },

  // Create a new user with auto-generated ID
  async createUser(user: Omit<AuthUser, 'id'>): Promise<string | null> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const docRef = await addDoc(usersRef, {
        ...user,
        username: user.username.toLowerCase(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      console.log('User created with auto ID:', docRef.id)
      return docRef.id
    } catch (error) {
      console.error('Error creating user:', error)
      return null
    }
  },

  // Create a new user with custom ID
  async createUserWithId(userId: string, user: Omit<AuthUser, 'id'>): Promise<boolean> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await setDoc(userRef, {
        ...user,
        username: user.username.toLowerCase(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      console.log('User created with custom ID:', userId)
      return true
    } catch (error) {
      console.error('Error creating user with custom ID:', error)
      return false
    }
  },

  // Update a user
  async updateUser(userId: string, updates: Partial<AuthUser>): Promise<boolean> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      
      // Check if document exists first
      const docSnap = await getDoc(userRef)
      
      // Remove id from updates to avoid trying to update the document ID
      const { id, ...updateFields } = updates
      const updateData: Record<string, unknown> = {
        ...updateFields,
        updatedAt: Timestamp.now(),
      }
      if (updates.username) {
        updateData.username = updates.username.toLowerCase()
      }
      
      if (!docSnap.exists()) {
        // Document doesn't exist, create it instead
        console.log('Document does not exist, creating it:', userId)
        await setDoc(userRef, {
          ...updateData,
          createdAt: Timestamp.now(),
        })
        console.log('User created successfully')
      } else {
        // Document exists, update it
        console.log('Updating user:', userId, 'with data:', updateData)
        await updateDoc(userRef, updateData)
        console.log('User updated successfully')
      }
      return true
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  },

  // Delete a user
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId)
      await deleteDoc(userRef)
      return true
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  },

  // Subscribe to users changes
  subscribeToUsers(callback: (users: AuthUser[]) => void): Unsubscribe {
    const usersRef = collection(db, COLLECTIONS.USERS)
    return onSnapshot(
      usersRef,
      (snapshot) => {
        const users = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as AuthUser[]
        callback(users)
      },
      (error) => {
        console.error('Error subscribing to users:', error)
      }
    )
  },

  // Check if username exists
  async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS)
      const q = query(usersRef, where('username', '==', username.toLowerCase()))
      const snapshot = await getDocs(q)
      
      if (snapshot.empty) return false
      
      if (excludeId) {
        return snapshot.docs.some((doc) => doc.id !== excludeId)
      }
      
      return true
    } catch (error) {
      console.error('Error checking username:', error)
      return false
    }
  },
}

// ============= EXPENSES =============

export const expenseService = {
  // Get all expenses
  async getAllExpenses(): Promise<Expense[]> {
    try {
      const expensesRef = collection(db, COLLECTIONS.EXPENSES)
      const snapshot = await getDocs(expensesRef)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[]
    } catch (error) {
      console.error('Error fetching expenses:', error)
      return []
    }
  },

  // Get expenses by user ID
  async getExpensesByUserId(userId: string): Promise<Expense[]> {
    try {
      const expensesRef = collection(db, COLLECTIONS.EXPENSES)
      const q = query(expensesRef, where('userId', '==', userId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[]
    } catch (error) {
      console.error('Error fetching expenses by user:', error)
      return []
    }
  },

  // Get a single expense
  async getExpense(expenseId: string): Promise<Expense | null> {
    try {
      const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId)
      const snapshot = await getDoc(expenseRef)
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Expense
      }
      return null
    } catch (error) {
      console.error('Error fetching expense:', error)
      return null
    }
  },

  // Create a new expense
  async createExpense(expense: Omit<Expense, 'id'>): Promise<string | null> {
    try {
      const expensesRef = collection(db, COLLECTIONS.EXPENSES)
      const docRef = await addDoc(expensesRef, {
        ...expense,
        createdAt: expense.createdAt || new Date().toISOString(),
      })
      return docRef.id
    } catch (error) {
      console.error('Error creating expense:', error)
      return null
    }
  },

  // Update an expense
  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<boolean> {
    try {
      const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId)
      await updateDoc(expenseRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('Error updating expense:', error)
      return false
    }
  },

  // Delete an expense
  async deleteExpense(expenseId: string): Promise<boolean> {
    try {
      const expenseRef = doc(db, COLLECTIONS.EXPENSES, expenseId)
      await deleteDoc(expenseRef)
      return true
    } catch (error) {
      console.error('Error deleting expense:', error)
      return false
    }
  },

  // Subscribe to expenses changes
  subscribeToExpenses(callback: (expenses: Expense[]) => void): Unsubscribe {
    const expensesRef = collection(db, COLLECTIONS.EXPENSES)
    return onSnapshot(
      expensesRef,
      (snapshot) => {
        const expenses = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Expense[]
        callback(expenses)
      },
      (error) => {
        console.error('Error subscribing to expenses:', error)
      }
    )
  },

  // Get expenses within date range
  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    try {
      const expensesRef = collection(db, COLLECTIONS.EXPENSES)
      const q = query(
        expensesRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      )
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Expense[]
    } catch (error) {
      console.error('Error fetching expenses by date range:', error)
      return []
    }
  },

  // Get expense analytics for a user
  async getExpenseAnalytics(userId: string): Promise<{
    totalAmount: number
    expenseCount: number
    averageExpense: number
    expensesByMonth: { [month: string]: number }
    expensesByPurpose: { [purpose: string]: number }
  }> {
    try {
      const expenses = await this.getExpensesByUserId(userId)
      
      const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
      const expenseCount = expenses.length
      const averageExpense = expenseCount > 0 ? totalAmount / expenseCount : 0
      
      const expensesByMonth: { [month: string]: number } = {}
      const expensesByPurpose: { [purpose: string]: number } = {}
      
      expenses.forEach((expense) => {
        // Group by month
        const month = expense.date.substring(0, 7) // YYYY-MM format
        expensesByMonth[month] = (expensesByMonth[month] || 0) + expense.amount
        
        // Group by purpose
        expensesByPurpose[expense.purpose] = (expensesByPurpose[expense.purpose] || 0) + expense.amount
      })
      
      return {
        totalAmount,
        expenseCount,
        averageExpense,
        expensesByMonth,
        expensesByPurpose,
      }
    } catch (error) {
      console.error('Error getting expense analytics:', error)
      return {
        totalAmount: 0,
        expenseCount: 0,
        averageExpense: 0,
        expensesByMonth: {},
        expensesByPurpose: {},
      }
    }
  },
}

// ============= COMMENTS =============

export const commentService = {
  async getCommentsByTaskId(taskId: string): Promise<Comment[]> {
    try {
      const commentsRef = collection(db, COLLECTIONS.COMMENTS)
      const q = query(commentsRef, where('taskId', '==', taskId))
      const snapshot = await getDocs(q)
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[]
    } catch (error) {
      console.error('Error fetching comments:', error)
      return []
    }
  },

  async addComment(comment: Omit<Comment, 'id'>): Promise<string | null> {
    try {
      const commentsRef = collection(db, COLLECTIONS.COMMENTS)
      // Build data without undefined fields (Firestore rejects undefined)
      const data: Record<string, any> = {
        taskId: comment.taskId,
        userId: comment.userId,
        userName: comment.userName,
        text: comment.text,
        createdAt: comment.createdAt || new Date().toISOString(),
      }
      if (comment.parentId) {
        data.parentId = comment.parentId
      }
      const docRef = await addDoc(commentsRef, data)
      return docRef.id
    } catch (error) {
      console.error('Error adding comment:', error)
      return null
    }
  },

  async updateComment(commentId: string, text: string): Promise<boolean> {
    try {
      const commentRef = doc(db, COLLECTIONS.COMMENTS, commentId)
      await updateDoc(commentRef, {
        text,
        updatedAt: new Date().toISOString(),
      })
      return true
    } catch (error) {
      console.error('Error updating comment:', error)
      return false
    }
  },

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const commentRef = doc(db, COLLECTIONS.COMMENTS, commentId)
      await deleteDoc(commentRef)
      return true
    } catch (error) {
      console.error('Error deleting comment:', error)
      return false
    }
  },

  subscribeToTaskComments(taskId: string, callback: (comments: Comment[]) => void): Unsubscribe {
    const commentsRef = collection(db, COLLECTIONS.COMMENTS)
    const q = query(commentsRef, where('taskId', '==', taskId))
    return onSnapshot(
      q,
      (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[]
        callback(comments)
      },
      (error) => {
        console.error('Error subscribing to task comments:', error)
      }
    )
  },

  subscribeToAllComments(callback: (comments: Comment[]) => void): Unsubscribe {
    const commentsRef = collection(db, COLLECTIONS.COMMENTS)
    return onSnapshot(
      commentsRef,
      (snapshot) => {
        const comments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Comment[]
        callback(comments)
      },
      (error) => {
        console.error('Error subscribing to all comments:', error)
      }
    )
  },

  async deleteCommentsByTaskId(taskId: string): Promise<boolean> {
    try {
      const comments = await this.getCommentsByTaskId(taskId)
      const deletePromises = comments.map((c) => this.deleteComment(c.id))
      await Promise.all(deletePromises)
      return true
    } catch (error) {
      console.error('Error deleting task comments:', error)
      return false
    }
  },
}

// ============= INITIALIZATION =============

export const initializeFirestore = {
  // Initialize default sprint if none exists
  async ensureDefaultSprint(): Promise<string> {
    try {
      const sprints = await sprintService.getAllSprints()
      if (sprints.length === 0) {
        const sprintId = await sprintService.createSprint({
          name: 'Plan Window 1',
          description: 'Getting started with your goals',
        })
        return sprintId || 'sprint-1'
      }
      return sprints[0].id
    } catch (error) {
      console.error('Error ensuring default sprint:', error)
      return 'sprint-1'
    }
  },

  // Initialize default admin user if none exists
  async ensureDefaultAdmin(): Promise<void> {
    try {
      const users = await userService.getAllUsers()
      if (users.length === 0) {
        await userService.createUser({
          name: 'Victor',
          type: 'user',
          username: 'victor',
          password: 'admin123',
        })
      }
    } catch (error) {
      console.error('Error ensuring default admin:', error)
    }
  },
}
