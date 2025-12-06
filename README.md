# Mira Sync - Family Goal & Task Planning

A modern, mobile-first web application for family goal planning, task management, and budget tracking. Built with React, TypeScript, Material-UI, and Firebase.

## ✨ Features

- 📱 **Mobile-First Design**: Optimized for smartphones with responsive layout
- 🎯 **Smart Task Management**: Priority-based sorting with deadline tracking
- 📊 **Plan Windows**: Organize tasks into sprints with active window persistence
- 👥 **Family Members**: Assign tasks with beautiful avatar displays
- 💰 **Budget Tracking**: Monitor monetary goals with investment history
- 📈 **Progress History**: Track task progress and investment changes over time
- 🔄 **Real-time Sync**: Firebase Firestore for instant data synchronization
- 🎨 **Material Design**: Beautiful UI with color-coded priorities and status badges
- ⚡ **Smart Notifications**: Visual indicators for overdue and completed tasks
- 🔍 **Advanced Filtering**: Filter tasks by plan window and family member

## 🚀 Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **UI Framework**: Material-UI (MUI) v6
- **Database**: Firebase Firestore
- **Date Management**: Day.js
- **Deployment**: Netlify
- **Testing**: Vitest, React Testing Library

## 📋 Prerequisites

- Node.js 18+ and npm
- A Firebase project ([Create one here](https://console.firebase.google.com/))
- Git (for version control)

## ⚡ Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd mira-sync
npm install
```

### 2. Configure Firebase

1. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

2. Get your Firebase credentials:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings > General > Your apps > Web app
   - Copy the configuration values

3. Update `.env` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### 3. Set Up Firebase Security Rules

⚠️ **Important**: Update your Firestore Security Rules before running the app.

1. Go to Firebase Console → Firestore Database → Rules
2. For **development**, use these rules (see [FIREBASE_RULES_SETUP.md](./FIREBASE_RULES_SETUP.md) for production rules):

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

### 4. Start the App

```bash
npm run dev
```

The app will automatically create default data on first load:
- Default admin user: `victor` / `admin123`
- Default plan window

### 5. Login

Open http://localhost:5173 and login with:
- **Username**: `victor`
- **Password**: `admin123`

## Firebase Setup

The application is configured to use Firebase Firestore for data storage and real-time synchronization. See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed information about:

- Firestore collections structure
- Service architecture
- Security considerations
- Testing and troubleshooting

## Project Structure

```
src/
├── auth/              # Authentication service
├── components/        # React components
│   ├── Logo.tsx
│   ├── LoginScreen.tsx
│   ├── TaskCard.tsx
│   ├── TaskDialog.tsx
│   └── MemberDialog.tsx
├── services/          # Firebase services
│   ├── firestoreService.ts
│   └── firebaseAuthService.ts
├── firebaseApp.ts     # Firebase initialization
├── firebaseConfig.ts  # Firebase configuration
├── models.ts          # TypeScript interfaces
├── App.tsx            # Main application
└── main.tsx           # Entry point
```

## 📜 Available Scripts

- `npm run dev` - Start development server (http://localhost:5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run tests with Vitest
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Netlify (Recommended)

The app is configured for deployment on Netlify with automatic builds.

1. **Set Environment Variables** in Netlify:
   - Go to Site Settings > Build & Deploy > Environment
   - Add all `VITE_FIREBASE_*` variables from your `.env` file

2. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

   Or connect your GitHub repository for automatic deployments.

### Manual Deployment

```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

## 🔒 Security Notes

- ⚠️ **Never commit `.env` file** - It's already in `.gitignore`
- 🔐 **Use production Firebase rules** before going live (see FIREBASE_RULES_SETUP.md)
- 🛡️ **Change default password** after first login
- 📝 **Review firestore.rules** for your security requirements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- Built with [React](https://react.dev/)
- UI components from [Material-UI](https://mui.com/)
- Backend powered by [Firebase](https://firebase.google.com/)
- Deployed on [Netlify](https://www.netlify.com/)
