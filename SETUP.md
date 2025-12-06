# Complete Setup Guide

This guide walks you through setting up Mira Sync from scratch, including creating a new Firebase project.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Firebase Project Setup](#firebase-project-setup)
3. [Local Development Setup](#local-development-setup)
4. [Environment Configuration](#environment-configuration)
5. [Firebase Security Rules](#firebase-security-rules)
6. [First Run](#first-run)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed ([Download](https://nodejs.org/))
- **Git** installed ([Download](https://git-scm.com/))
- A **Google account** for Firebase
- A **code editor** (VS Code recommended)

## Firebase Project Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name (e.g., "mira-sync")
4. Enable/disable Google Analytics (optional)
5. Click **"Create project"**

### 2. Enable Firestore Database

1. In Firebase Console, click **"Firestore Database"** in the left menu
2. Click **"Create database"**
3. Choose **"Start in production mode"** (we'll update rules later)
4. Select your preferred location
5. Click **"Enable"**

### 3. Register Web App

1. In Firebase Console, click the **web icon** (</>) to add a web app
2. Enter app nickname (e.g., "Mira Sync Web")
3. **Do NOT** check "Also set up Firebase Hosting"
4. Click **"Register app"**
5. **Copy the configuration object** - you'll need this later
6. Click **"Continue to console"**

## Local Development Setup

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd mira-sync
```

### 2. Install Dependencies

```bash
npm install
```

## Environment Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Add Firebase Credentials

Open `.env` and fill in your Firebase configuration from step 3 above:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-ABC123XYZ
VITE_USE_FIREBASE_EMULATORS=false
```

### 3. Verify Configuration

Your `.env` file should look similar to the example above. Make sure:
- All values are filled in
- No quotes around values
- No trailing spaces

## Firebase Security Rules

### Development Rules (Start Here)

1. Go to Firebase Console → **Firestore Database** → **Rules**
2. Replace the existing rules with:

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

3. Click **"Publish"**

⚠️ **Warning**: These rules allow anyone to read/write your database. Only use for development!

### Production Rules (Before Going Live)

Before deploying to production, update to secure rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() {
      return request.auth != null;
    }
    
    match /users/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && request.auth.uid == userId;
    }
    
    match /tasks/{taskId} {
      allow read, write: if isSignedIn();
    }
    
    match /sprints/{sprintId} {
      allow read, write: if isSignedIn();
    }
  }
}
```

## First Run

### 1. Start Development Server

```bash
npm run dev
```

The app will open at http://localhost:5173

### 2. Automatic Initialization

On first load, the app will automatically:
- Create a default admin user
- Create a default plan window
- Set up the initial database structure

### 3. Login

Use these default credentials:
- **Username**: `victor`
- **Password**: `admin123`

⚠️ **Important**: Change this password after first login!

### 4. Verify Setup

After logging in, you should see:
- The main dashboard
- One plan window
- No tasks (empty state)

## Deployment

### Netlify Deployment

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Set Environment Variables**:
   - Go to Netlify Dashboard → Site Settings → Build & Deploy → Environment
   - Add all `VITE_FIREBASE_*` variables from your `.env` file

4. **Deploy**:
   ```bash
   npm run build
   netlify deploy --prod
   ```

### Alternative: GitHub + Netlify Auto-Deploy

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard
4. Netlify will automatically build and deploy on each push

## Troubleshooting

### "Permission Denied" Error

**Problem**: Firestore operations fail with permission errors

**Solution**:
1. Check Firebase Console → Firestore → Rules
2. Ensure rules are published
3. Wait 30-60 seconds for rules to propagate
4. Clear browser cache and reload

### "Firebase Config Not Found" Error

**Problem**: App shows configuration error

**Solution**:
1. Verify `.env` file exists in project root
2. Check all `VITE_FIREBASE_*` variables are set
3. Restart development server (`npm run dev`)
4. Ensure no quotes around environment variable values

### Build Fails

**Problem**: `npm run build` fails

**Solution**:
1. Delete `node_modules` and reinstall:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. Check for TypeScript errors:
   ```bash
   npm run lint
   ```
3. Ensure all dependencies are installed

### Login Not Working

**Problem**: Can't login with default credentials

**Solution**:
1. Check browser console for errors
2. Verify Firebase rules allow writes
3. Check Firestore Database in Firebase Console
4. Ensure `users` collection exists with a user document

### Environment Variables Not Working in Production

**Problem**: App works locally but not in production

**Solution**:
1. Verify environment variables are set in Netlify/hosting platform
2. Check variable names match exactly (case-sensitive)
3. Rebuild and redeploy after setting variables
4. Check build logs for errors

## Next Steps

After successful setup:

1. ✅ Change default password
2. ✅ Add family members
3. ✅ Create plan windows
4. ✅ Add tasks
5. ✅ Update Firebase security rules for production
6. ✅ Set up custom domain (optional)
7. ✅ Enable Firebase Analytics (optional)

## Support

If you encounter issues not covered here:

1. Check [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for Firebase-specific help
2. Review [FIREBASE_RULES_SETUP.md](./FIREBASE_RULES_SETUP.md) for security rules
3. Open an issue on GitHub with:
   - Error message
   - Steps to reproduce
   - Browser and OS information
   - Screenshots if applicable

## Security Checklist

Before going live:

- [ ] Updated Firebase security rules to production rules
- [ ] Changed default admin password
- [ ] Removed development/test data
- [ ] Set up proper user authentication
- [ ] Reviewed and tested all security rules
- [ ] Environment variables secured in hosting platform
- [ ] `.env` file NOT committed to repository
- [ ] HTTPS enabled (automatic with Netlify)

---

**Congratulations!** 🎉 Your Mira Sync instance is now set up and ready to use!
