import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'
import type { Analytics } from 'firebase/analytics'
import { firebaseConfig } from './firebaseConfig'

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export { analytics }
