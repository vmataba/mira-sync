/**
 * Firebase Connection Test Script
 * Run this to verify Firebase connectivity and data operations
 */

import { db } from './firebaseApp'
import { collection, getDocs } from 'firebase/firestore'

export async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase Connection...')
  
  try {
    // Test 1: Check if Firestore is accessible
    console.log('Test 1: Checking Firestore accessibility...')
    const testCollection = collection(db, 'test')
    await getDocs(testCollection)
    console.log('✅ Firestore is accessible')
    
    // Test 2: Check collections
    console.log('\nTest 2: Checking collections...')
    const collections = ['tasks', 'sprints', 'users']
    
    for (const collectionName of collections) {
      const collectionRef = collection(db, collectionName)
      const snapshot = await getDocs(collectionRef)
      console.log(`✅ ${collectionName}: ${snapshot.size} documents`)
    }
    
    console.log('\n🎉 All Firebase tests passed!')
    return true
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error)
    return false
  }
}

// Auto-run if this file is imported
if (typeof window !== 'undefined') {
  // Run test after a short delay to ensure Firebase is initialized
  setTimeout(() => {
    testFirebaseConnection()
  }, 1000)
}
