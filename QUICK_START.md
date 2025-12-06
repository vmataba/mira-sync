# 🚀 Quick Start Guide

## Step 1: Update Firebase Security Rules

**Before the app can work, you MUST update Firebase Security Rules:**

1. Go to: https://console.firebase.google.com/project/mira-sync/firestore/rules
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

3. Click **Publish**
4. Wait 30 seconds for rules to deploy

## Step 2: Initialize Default Data

Run the initialization script:

```bash
npm run init-firebase
```

This will create:
- ✅ Default admin user (username: `victor`, password: `admin123`)
- ✅ Default plan window ("Plan Window 1")

## Step 3: Start the App

```bash
npm run dev
```

Open http://localhost:5173 and login with:
- **Username**: `victor`
- **Password**: `admin123`

## That's it! 🎉

Your app is now connected to Firebase and ready to use!

---

## What's Next?

- Create family members in the "Family" tab
- Create plan windows in the "Plan Windows" tab
- Add tasks in the "Tasks" tab
- All data syncs in real-time across devices!

## Need Help?

- See [FIREBASE_RULES_SETUP.md](./FIREBASE_RULES_SETUP.md) for detailed Firebase setup
- See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for architecture details
- See [README.md](./README.md) for full documentation
