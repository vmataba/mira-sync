import {
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth'
import { auth } from '../firebaseApp'
import { userService } from './firestoreService'
import type { AuthUser } from '../auth/authService'

const AUTH_STORAGE_KEY = 'mira_sync_current_user'

export const firebaseAuthService = {
  // Get current authenticated user from local storage
  getCurrentUser(): AuthUser | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  },

  // Set current authenticated user in local storage
  setCurrentUser(user: AuthUser | null): void {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY)
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null
  },

  // Login with username and password (using Firestore for user data)
  async login(username: string, password: string): Promise<AuthUser | null> {
    try {
      // Get user from Firestore by username
      const user = await userService.getUserByUsername(username)
      
      if (!user) {
        console.error('User not found')
        return null
      }

      // Verify password (in production, use proper password hashing)
      if (user.password !== password) {
        console.error('Invalid password')
        return null
      }

      // Store user in local storage
      this.setCurrentUser(user)
      return user
    } catch (error) {
      console.error('Login error:', error)
      return null
    }
  },

  // Logout
  async logout(): Promise<void> {
    try {
      this.setCurrentUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  },

  // Get all users from Firestore
  async getAllUsers(): Promise<AuthUser[]> {
    return await userService.getAllUsers()
  },

  // Save user to Firestore
  async saveUser(user: AuthUser): Promise<boolean> {
    try {
      if (user.id && (user.id.startsWith('user-') || user.id.startsWith('member-'))) {
        // Update existing user
        const success = await userService.updateUser(user.id, user)
        if (success) {
          // Update local storage if it's the current user
          const currentUser = this.getCurrentUser()
          if (currentUser && currentUser.id === user.id) {
            this.setCurrentUser(user)
          }
        }
        return success
      } else if (user.id) {
        // Create new user with custom ID
        const { id, ...userData } = user
        const success = await userService.createUserWithId(id, userData)
        return success
      } else {
        // Create new user with auto-generated ID
        const { id, ...userData } = user
        const newUserId = await userService.createUser(userData)
        if (newUserId) {
          user.id = newUserId
          return true
        }
        return false
      }
    } catch (error) {
      console.error('Error saving user:', error)
      return false
    }
  },

  // Update existing user
  async updateUser(userId: string, user: AuthUser): Promise<boolean> {
    try {
      const success = await userService.updateUser(userId, user)
      if (success) {
        // Update local storage if it's the current user
        const currentUser = this.getCurrentUser()
        if (currentUser && currentUser.id === userId) {
          this.setCurrentUser(user)
        }
      }
      return success
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  },

  // Delete user from Firestore
  async deleteUser(id: string): Promise<boolean> {
    try {
      // Don't allow deleting the default admin
      if (id === 'user-admin') return false
      
      return await userService.deleteUser(id)
    } catch (error) {
      console.error('Error deleting user:', error)
      return false
    }
  },

  // Check if username exists
  async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    return await userService.usernameExists(username, excludeId)
  },

  // Generate username from name
  generateUsername(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '')
  },

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: AuthUser | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userData = await userService.getUser(firebaseUser.uid)
        callback(userData)
      } else {
        callback(null)
      }
    })
  },
}
