# Firebase Security Rules Setup

## Current Issue

The Firebase initialization script is encountering a "permission-denied" error because Firestore Security Rules are blocking write operations.

## Quick Fix (Development Mode)

To allow the initialization script and app to work, you need to update your Firebase Security Rules:

### Step 1: Go to Firebase Console
1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **mira-sync**
3. Navigate to **Firestore Database** in the left sidebar
4. Click on the **Rules** tab

### Step 2: Update Security Rules

Replace the existing rules with these **development rules** (allows all read/write):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow all read and write access for development
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Step 3: Publish Rules
1. Click **Publish** button
2. Wait for rules to deploy (usually takes a few seconds)

### Step 4: Launch the App

The app will automatically initialize default data on first load. Simply start the development server:

```bash
npm run dev
```

The app will create the default user and sprint if they don't exist.

## Production Security Rules

⚠️ **IMPORTANT**: The development rules above allow anyone to read/write your database. 

For production, use these more secure rules:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && request.auth.uid == userId;
    }
    
    // Tasks collection
    match /tasks/{taskId} {
      allow read, write: if isSignedIn();
    }
    
    // Sprints collection
    match /sprints/{sprintId} {
      allow read, write: if isSignedIn();
    }
  }
}
```

## Alternative: Initialize via App

Instead of running the script, you can also let the app automatically initialize the default data on first load. The app already has this logic in `App.tsx`:

```typescript
// Ensure default data exists
await initializeFirestore.ensureDefaultAdmin()
await initializeFirestore.ensureDefaultSprint()
```

This will run automatically when you:
1. Update Firebase Security Rules (as described above)
2. Open the app in your browser
3. The app will create the default user and sprint if they don't exist

## Troubleshooting

### Still getting permission errors?
1. Double-check that you published the rules in Firebase Console
2. Wait 30-60 seconds for rules to propagate
3. Clear browser cache and reload the app
4. Check Firebase Console > Firestore Database > Rules to verify the rules are active

### Can't access Firebase Console?
Make sure you're logged in with the Google account that owns the Firebase project.

### Need to reset data?
In Firebase Console:
1. Go to Firestore Database
2. Click on the collection (users, sprints, or tasks)
3. Delete documents manually
4. Re-run the initialization script

## Next Steps

After initialization:
1. ✅ Login to the app with username: `victor`, password: `admin123`
2. ✅ Create additional family members
3. ✅ Create tasks and plan windows
4. ✅ All data will be stored in Firebase Firestore
5. ⚠️ Before deploying to production, update security rules
