# Firebase Setup Guide for Mira Sync

## Overview

Mira Sync now uses Firebase Firestore as its primary database, replacing local state management. All data (tasks, sprints, and users) is stored in Firebase and synced in real-time across all clients.

## Firebase Configuration

The Firebase configuration is located in `/src/firebaseConfig.ts`:

```typescript
export const firebaseConfig = {
  apiKey: 'AIzaSyB616ImIICWo7e08ugcSpa_6BqiJVBV8Jc',
  authDomain: 'mira-sync.firebaseapp.com',
  projectId: 'mira-sync',
  storageBucket: 'mira-sync.firebasestorage.app',
  messagingSenderId: '614032904530',
  appId: '1:614032904530:web:d0ddfa02ad947f52a92a8b',
  measurementId: 'G-Z0593FGZCT',
}
```

## Firestore Collections

### 1. **tasks** Collection
Stores all task data with the following structure:
```typescript
{
  id: string
  title: string
  description?: string
  type: 'monetary' | 'general'
  sprintId: string
  assignee?: {
    id: string
    name: string
    type: 'user' | 'group'
  }
  deadline?: string
  priority: 'high' | 'medium' | 'low'
  progress: number // 0-100
  monetary?: {
    amount: number
    currency: string
    invested: number
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 2. **sprints** Collection
Stores plan windows/sprints:
```typescript
{
  id: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

### 3. **users** Collection
Stores user/family member data:
```typescript
{
  id: string
  name: string
  type: 'user' | 'group'
  username: string
  password: string // Note: In production, use proper password hashing
  createdAt: Timestamp
  updatedAt: Timestamp
}
```

## Service Architecture

### Firestore Service (`/src/services/firestoreService.ts`)
Provides CRUD operations and real-time subscriptions for:
- **taskService**: Manage tasks
- **sprintService**: Manage sprints/plan windows
- **userService**: Manage users/family members
- **initializeFirestore**: Initialize default data

Key features:
- Real-time updates using `onSnapshot`
- Automatic timestamp management
- Error handling and logging

### Firebase Auth Service (`/src/services/firebaseAuthService.ts`)
Handles authentication using Firestore for user data:
- Login/logout functionality
- User management (CRUD operations)
- Username validation
- Local storage for session persistence

## Data Flow

1. **App Initialization**:
   - Check authentication status
   - Initialize default admin user and sprint if they don't exist
   - Subscribe to real-time updates for tasks, sprints, and users

2. **Real-time Sync**:
   - All data changes are automatically synced across all clients
   - Uses Firestore's `onSnapshot` for live updates
   - No manual refresh needed

3. **Data Operations**:
   - Create: `await taskService.createTask(taskData)`
   - Read: `await taskService.getAllTasks()`
   - Update: `await taskService.updateTask(taskId, updates)`
   - Delete: `await taskService.deleteTask(taskId)`

## Default Data

On first run, the app automatically creates:
- **Default Admin User**:
  - Username: `victor`
  - Password: `admin123`
  - Name: Victor
  - Type: user

- **Default Sprint**:
  - Name: "Plan Window 1"
  - Description: "Getting started with your goals"

## Security Considerations

⚠️ **Important**: The current implementation stores passwords in plain text in Firestore. For production use, you should:

1. Implement proper password hashing (e.g., bcrypt)
2. Set up Firebase Security Rules
3. Enable Firebase Authentication
4. Use environment variables for sensitive configuration

### Recommended Firebase Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Users can only read their own user document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
  }
}
```

## Testing Firebase Connection

To test the Firebase connection, you can:

1. Open the browser console
2. Check for Firebase initialization logs
3. Verify data is loading from Firestore
4. Test CRUD operations through the UI

Or use the test script:
```typescript
import { testFirebaseConnection } from './test-firebase'
await testFirebaseConnection()
```

## Troubleshooting

### Connection Issues
- Verify Firebase configuration in `firebaseConfig.ts`
- Check browser console for errors
- Ensure Firestore is enabled in Firebase Console
- Verify network connectivity

### Data Not Syncing
- Check Firestore Security Rules
- Verify subscriptions are active
- Check browser console for errors
- Ensure proper cleanup of subscriptions

### Authentication Issues
- Verify user exists in Firestore `users` collection
- Check username/password match
- Clear local storage and try again

## Migration from Local Storage

The app previously used localStorage for data persistence. The new Firebase implementation:
- ✅ Provides real-time sync across devices
- ✅ Supports multiple users simultaneously
- ✅ Offers better scalability
- ✅ Enables offline support (with Firebase offline persistence)
- ✅ Provides automatic backups

## Next Steps

1. **Enable Firebase Authentication**: Replace custom auth with Firebase Auth
2. **Add Security Rules**: Implement proper Firestore security rules
3. **Password Hashing**: Implement secure password storage
4. **Offline Support**: Enable Firestore offline persistence
5. **Analytics**: Utilize Firebase Analytics for insights
6. **Cloud Functions**: Add server-side logic for complex operations

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [React Firebase Hooks](https://github.com/CSFrequency/react-firebase-hooks)
