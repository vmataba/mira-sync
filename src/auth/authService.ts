import type { Assignment } from '../models'

export interface AuthUser extends Assignment {
  username: string
  password: string
}

const AUTH_STORAGE_KEY = 'mira_sync_auth'
const USERS_STORAGE_KEY = 'mira_sync_users'

// Default admin user
export const defaultAuthUser: AuthUser = {
  id: 'user-admin',
  name: 'Victor',
  type: 'user',
  username: 'victor',
  password: 'admin123',
}

export const authService = {
  // Get current authenticated user
  getCurrentUser(): AuthUser | null {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  },

  // Set current authenticated user
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

  // Login with username and password
  login(username: string, password: string): AuthUser | null {
    const users = this.getAllUsers()
    const user = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    )
    if (user) {
      this.setCurrentUser(user)
      return user
    }
    return null
  },

  // Logout
  logout(): void {
    this.setCurrentUser(null)
  },

  // Get all users
  getAllUsers(): AuthUser[] {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    if (!stored) {
      // Initialize with default admin user
      const defaultUsers = [defaultAuthUser]
      this.saveAllUsers(defaultUsers)
      return defaultUsers
    }
    try {
      return JSON.parse(stored)
    } catch {
      return [defaultAuthUser]
    }
  },

  // Save all users
  saveAllUsers(users: AuthUser[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  },

  // Add or update user
  saveUser(user: AuthUser): void {
    const users = this.getAllUsers()
    const index = users.findIndex((u) => u.id === user.id)
    if (index >= 0) {
      users[index] = user
    } else {
      users.push(user)
    }
    this.saveAllUsers(users)
  },

  // Delete user
  deleteUser(id: string): boolean {
    // Don't allow deleting the default admin
    if (id === defaultAuthUser.id) return false
    
    const users = this.getAllUsers()
    const filtered = users.filter((u) => u.id !== id)
    if (filtered.length === users.length) return false
    
    this.saveAllUsers(filtered)
    return true
  },

  // Generate username from name
  generateUsername(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '')
  },

  // Check if username exists
  usernameExists(username: string, excludeId?: string): boolean {
    const users = this.getAllUsers()
    return users.some(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.id !== excludeId
    )
  },
}
