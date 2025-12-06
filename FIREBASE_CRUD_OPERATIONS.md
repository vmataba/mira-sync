# Firebase CRUD Operations - Complete Reference

This document details all Create, Read, Update, and Delete operations in Mira Sync, ensuring every detail is saved to Firebase Firestore database.

## ✅ All Data is Stored in Firebase

**No localStorage for data** - Only session management (current logged-in user) uses localStorage. All application data (tasks, sprints, users) is stored in Firebase Firestore with real-time synchronization.

---

## 📊 Data Entities

### 1. Tasks
**Collection**: `tasks`

#### Create Task
- **UI**: Click "New Task" button → Fill form → Click "Create"
- **Service**: `taskService.createTask(taskData)`
- **Firebase**: Adds document to `tasks` collection with auto-generated ID
- **Fields Saved**:
  - `title` (string)
  - `description` (string, optional)
  - `type` ('monetary' | 'general')
  - `sprintId` (string)
  - `assignee` (object with id, name, type)
  - `deadline` (string, YYYY-MM-DD format)
  - `priority` ('high' | 'medium' | 'low')
  - `progress` (number, 0-100)
  - `monetary` (object, optional):
    - `amount` (number)
    - `currency` (string)
    - `invested` (number)
  - `createdAt` (Timestamp)
  - `updatedAt` (Timestamp)

#### Read Tasks
- **Real-time Subscription**: `taskService.subscribeToTasks(callback)`
- **Get All**: `taskService.getAllTasks()`
- **Get by Sprint**: `taskService.getTasksBySprintId(sprintId)`
- **Get Single**: `taskService.getTask(taskId)`
- **Auto-sync**: Changes automatically reflected in UI

#### Update Task
- **UI**: Click task card → Edit fields → Click "Update"
- **Service**: `taskService.updateTask(taskId, updates)`
- **Firebase**: Updates document in `tasks` collection
- **Auto-updates**: `updatedAt` timestamp

#### Delete Task
- **UI**: Click task card → Click "Delete" button → Confirm
- **Service**: `taskService.deleteTask(taskId)`
- **Firebase**: Removes document from `tasks` collection
- **Confirmation**: Requires user confirmation

---

### 2. Sprints (Plan Windows)
**Collection**: `sprints`

#### Create Sprint
- **UI**: Plan Windows tab → Click + button → Fill form → Click "Create"
- **Service**: `sprintService.createSprint(sprintData)`
- **Firebase**: Adds document to `sprints` collection
- **Fields Saved**:
  - `name` (string)
  - `description` (string, optional)
  - `startDate` (string, optional)
  - `endDate` (string, optional)
  - `createdAt` (Timestamp)
  - `updatedAt` (Timestamp)

#### Read Sprints
- **Real-time Subscription**: `sprintService.subscribeToSprints(callback)`
- **Get All**: `sprintService.getAllSprints()`
- **Get Single**: `sprintService.getSprint(sprintId)`
- **Auto-sync**: Changes automatically reflected in UI

#### Update Sprint
- **Service**: `sprintService.updateSprint(sprintId, updates)`
- **Firebase**: Updates document in `sprints` collection
- **Note**: Currently no UI for editing sprint details (can be added)

#### Delete Sprint
- **UI**: Plan Windows tab → Click delete icon on sprint card → Confirm
- **Service**: `sprintService.deleteSprint(sprintId)`
- **Firebase**: Removes document from `sprints` collection
- **Validation**:
  - Cannot delete if it's the only sprint
  - Cannot delete if tasks are assigned to it
  - Requires user confirmation

---

### 3. Users (Family Members)
**Collection**: `users`

#### Create User
- **UI**: Family tab → Click + button → Fill form → Click "Save"
- **Service**: `userService.createUser(userData)`
- **Firebase**: Adds document to `users` collection
- **Fields Saved**:
  - `name` (string)
  - `type` ('user' | 'group')
  - `username` (string, lowercase)
  - `password` (string) ⚠️ Plain text - needs hashing for production
  - `createdAt` (Timestamp)
  - `updatedAt` (Timestamp)
- **Validation**: Username uniqueness checked

#### Read Users
- **Real-time Subscription**: `userService.subscribeToUsers(callback)`
- **Get All**: `userService.getAllUsers()`
- **Get Single**: `userService.getUser(userId)`
- **Get by Username**: `userService.getUserByUsername(username)`
- **Auto-sync**: Changes automatically reflected in UI

#### Update User
- **UI**: Family tab → Click edit icon → Modify fields → Click "Save"
- **Service**: `userService.updateUser(userId, updates)`
- **Firebase**: Updates document in `users` collection
- **Auto-updates**: `updatedAt` timestamp
- **Validation**: Username uniqueness checked (excluding current user)

#### Delete User
- **UI**: Family tab → Click delete icon → Confirm
- **Service**: `userService.deleteUser(userId)`
- **Firebase**: Removes document from `users` collection
- **Validation**:
  - Cannot delete default admin (user-admin)
  - Cannot delete if it's the only member
  - Cannot delete if tasks are assigned to them
  - Requires user confirmation

---

## 🔄 Real-time Synchronization

All data uses Firebase's `onSnapshot` for real-time updates:

```typescript
// Example: Tasks subscription
taskService.subscribeToTasks((fetchedTasks) => {
  setTasks(fetchedTasks)
})
```

**Benefits**:
- ✅ Changes sync instantly across all devices
- ✅ No manual refresh needed
- ✅ Multiple users can work simultaneously
- ✅ Offline support (with Firebase offline persistence)

---

## 🔐 Authentication

**Current Implementation**: Custom authentication using Firestore

#### Login
- **UI**: Enter username and password → Click "Sign In"
- **Service**: `firebaseAuthService.login(username, password)`
- **Process**:
  1. Query `users` collection by username
  2. Verify password match
  3. Store user in localStorage (session only)
  4. Return user object

#### Logout
- **UI**: Click logout icon
- **Service**: `firebaseAuthService.logout()`
- **Process**: Remove user from localStorage

#### Session Persistence
- **Storage**: localStorage (key: `mira_sync_current_user`)
- **Purpose**: Keep user logged in across page refreshes
- **Data**: User object (id, name, type, username)

---

## 📝 Data Validation

### Task Validation
- ✅ Title is required
- ✅ Progress: 0-100
- ✅ Monetary fields validated when type is 'monetary'
- ✅ Sprint ID must exist
- ✅ Assignee ID must exist

### Sprint Validation
- ✅ Name is required
- ✅ Cannot delete if tasks assigned
- ✅ At least one sprint must exist

### User Validation
- ✅ Name is required
- ✅ Username is required and must be unique
- ✅ Password is required
- ✅ Cannot delete if tasks assigned
- ✅ At least one user must exist
- ✅ Cannot delete default admin

---

## 🚀 Initialization

On first app load:

```typescript
// Ensures default data exists
await initializeFirestore.ensureDefaultAdmin()
await initializeFirestore.ensureDefaultSprint()
```

**Default Admin User**:
- Username: `victor`
- Password: `admin123`
- Name: Victor
- Type: user

**Default Sprint**:
- Name: "Plan Window 1"
- Description: "Getting started with your goals"

---

## 📊 Data Flow Summary

```
User Action → UI Component → Handler Function → Firebase Service → Firestore
                                                        ↓
                                                Real-time Listener
                                                        ↓
                                                Update UI State
```

### Example: Creating a Task

1. **User**: Clicks "New Task" → Fills form → Clicks "Create"
2. **UI**: `handleSaveTask()` called
3. **Service**: `taskService.createTask(taskData)`
4. **Firebase**: Document added to `tasks` collection
5. **Real-time**: `subscribeToTasks` callback triggered
6. **UI**: Task list automatically updates

---

## ⚠️ Important Notes

### Security
- ⚠️ **Passwords are stored in plain text** - Implement bcrypt or similar for production
- ⚠️ **Firebase Security Rules** - Currently set to allow all read/write (development mode)
- ⚠️ **API Keys exposed** - Use environment variables for production

### Production Recommendations
1. **Password Hashing**: Implement bcrypt or Firebase Authentication
2. **Security Rules**: Restrict access based on authentication
3. **Environment Variables**: Move Firebase config to `.env`
4. **Input Sanitization**: Add validation for all user inputs
5. **Error Handling**: Implement proper error boundaries
6. **Logging**: Add comprehensive logging for debugging

---

## 🧪 Testing CRUD Operations

### Manual Testing Checklist

#### Tasks
- [ ] Create new task (general)
- [ ] Create new task (monetary)
- [ ] Update task details
- [ ] Update task progress
- [ ] Delete task
- [ ] Verify real-time sync

#### Sprints
- [ ] Create new sprint
- [ ] Set sprint as active
- [ ] Delete empty sprint
- [ ] Verify cannot delete sprint with tasks
- [ ] Verify real-time sync

#### Users
- [ ] Create new user
- [ ] Update user details
- [ ] Delete user without tasks
- [ ] Verify cannot delete user with tasks
- [ ] Verify cannot delete last user
- [ ] Verify username uniqueness
- [ ] Verify real-time sync

---

## 📚 Service API Reference

### Task Service
```typescript
taskService.getAllTasks(): Promise<Task[]>
taskService.getTasksBySprintId(sprintId: string): Promise<Task[]>
taskService.getTask(taskId: string): Promise<Task | null>
taskService.createTask(task: Omit<Task, 'id'>): Promise<string | null>
taskService.updateTask(taskId: string, updates: Partial<Task>): Promise<boolean>
taskService.deleteTask(taskId: string): Promise<boolean>
taskService.subscribeToTasks(callback: (tasks: Task[]) => void): Unsubscribe
```

### Sprint Service
```typescript
sprintService.getAllSprints(): Promise<Sprint[]>
sprintService.getSprint(sprintId: string): Promise<Sprint | null>
sprintService.createSprint(sprint: Omit<Sprint, 'id'>): Promise<string | null>
sprintService.updateSprint(sprintId: string, updates: Partial<Sprint>): Promise<boolean>
sprintService.deleteSprint(sprintId: string): Promise<boolean>
sprintService.subscribeToSprints(callback: (sprints: Sprint[]) => void): Unsubscribe
```

### User Service
```typescript
userService.getAllUsers(): Promise<AuthUser[]>
userService.getUser(userId: string): Promise<AuthUser | null>
userService.getUserByUsername(username: string): Promise<AuthUser | null>
userService.createUser(user: Omit<AuthUser, 'id'>): Promise<string | null>
userService.updateUser(userId: string, updates: Partial<AuthUser>): Promise<boolean>
userService.deleteUser(userId: string): Promise<boolean>
userService.subscribeToUsers(callback: (users: AuthUser[]) => void): Unsubscribe
userService.usernameExists(username: string, excludeId?: string): Promise<boolean>
```

---

## ✅ Verification

All CRUD operations are:
- ✅ Connected to Firebase Firestore
- ✅ Saving data to database (not computed on the fly)
- ✅ Supporting real-time updates
- ✅ Properly validated
- ✅ Error handled
- ✅ User-friendly with confirmations

**Live URL**: https://mira-sync.netlify.app
