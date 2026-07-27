import { useCallback, useEffect, useMemo, useState } from 'react'
import { Provider } from 'react-redux'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid2 as Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Snackbar,
  Alert,
  Stack,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import AddIcon from '@mui/icons-material/Add'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import PeopleIcon from '@mui/icons-material/People'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import CalendarViewWeekIcon from '@mui/icons-material/CalendarViewWeek'
import AssignmentIcon from '@mui/icons-material/Assignment'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import type { Assignment, Comment, Priority, Sprint, Task, TaskType, TaskStatus, Expense } from './models'
import { MiraSyncLogo } from './components/Logo'
import { TaskCard } from './components/TaskCard'
import { TaskDialog } from './components/TaskDialog'
import { MemberDialog } from './components/MemberDialog'
import { LoginScreen } from './components/LoginScreen'
import { CommandCenter } from './components/CommandCenter'
import { ExpensesPage } from './pages/ExpensesPage'
import type { AuthUser } from './auth/authService'
import { taskService, sprintService, userService, expenseService, commentService, initializeFirestore } from './services/firestoreService'
import { firebaseAuthService } from './services/firebaseAuthService'
import { parseFormattedNumber, formatInputValue } from './utils/currency'
import { getEffectiveStatus, isTaskResolved } from './utils/taskUtils'
import { CompletedTasksSection } from './components/CompletedTasksSection'
import { TaskCommentsDialog } from './components/comments/TaskCommentsDialog'
import { estbelTheme, estbelColors } from './theme'
import { store, EstbelDashboard } from './estbel'

// Use the new Estbel Banking-Grade theme
const theme = estbelTheme

// Default sprint will be loaded from Firebase
const defaultSprint: Sprint = {
  id: 'sprint-1',
  name: 'Plan Window 1',
  description: 'Getting started with your goals',
}

interface TaskFormState {
  id?: string
  title: string
  description: string
  type: TaskType
  sprintId: string
  assigneeId: string
  deadline: Dayjs | null
  priority: Priority
  status: TaskStatus
  progress: string
  amount: string
  currency: string
  invested: string
}

const emptyTaskForm: TaskFormState = {
  title: '',
  description: '',
  type: 'general',
  sprintId: defaultSprint.id,
  assigneeId: '',
  deadline: null,
  priority: 'medium',
  status: 'new',
  progress: '',
  amount: '',
  currency: 'TZS',
  invested: '',
}

// App Module type for Command Center navigation
type AppModule = 'command-center' | 'tracker' | 'estbel'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(firebaseAuthService.isAuthenticated())
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(firebaseAuthService.getCurrentUser())
  const [activeModule, setActiveModule] = useState<AppModule>('command-center')
  const [tasks, setTasks] = useState<Task[]>([])
  const [sprints, setSprints] = useState<Sprint[]>([])
  const [selectedSprintId, setSelectedSprintId] = useState<string>('')
  const [activePlanWindowId, setActivePlanWindowId] = useState<string>('')
  const [form, setForm] = useState<TaskFormState>(emptyTaskForm)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [newPlanDescription, setNewPlanDescription] = useState('')
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState(2)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [memberForm, setMemberForm] = useState({ id: '', name: '', type: 'user' as 'user' | 'group', username: '', password: '' })
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [filterAssigneeId, setFilterAssigneeId] = useState<string>('all')
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' })
  
  // Expense tracker state
  const [expenses, setExpenses] = useState<Expense[]>([])

  // Comments state
  const [allComments, setAllComments] = useState<Comment[]>([])
  const [commentsDialogTask, setCommentsDialogTask] = useState<Task | null>(null)

  // Initialize Firebase data on mount
  useEffect(() => {
    let unsubscribeTasks: (() => void) | undefined
    let unsubscribeSprints: (() => void) | undefined
    let unsubscribeUsers: (() => void) | undefined
    let unsubscribeExpenses: (() => void) | undefined
    let unsubscribeComments: (() => void) | undefined

    const initializeData = async () => {
      try {
        setLoading(true)
        
        // Ensure default data exists
        await initializeFirestore.ensureDefaultAdmin()
        await initializeFirestore.ensureDefaultSprint()
        
        // Subscribe to real-time updates
        unsubscribeTasks = taskService.subscribeToTasks((fetchedTasks) => {
          setTasks(fetchedTasks)
        })

        unsubscribeSprints = sprintService.subscribeToSprints((fetchedSprints) => {
          setSprints(fetchedSprints)
          if (fetchedSprints.length > 0) {
            // Find the active sprint or use the first one
            const activeSprint = fetchedSprints.find((s) => s.isActive) || fetchedSprints[0]
            const activeSprintId = activeSprint.id
            
            // Only update if not already set or if active sprint changed
            if (!selectedSprintId || activeSprint.isActive) {
              setSelectedSprintId(activeSprintId)
              setActivePlanWindowId(activeSprintId)
              setForm((prev) => ({ ...prev, sprintId: activeSprintId }))
            }
          }
        })

        unsubscribeUsers = userService.subscribeToUsers((fetchedUsers) => {
          const syncedAssignments = fetchedUsers.map((u) => ({
            id: u.id,
            name: u.name,
            type: u.type,
          }))
          setAssignments(syncedAssignments)
          if (syncedAssignments.length > 0 && !form.assigneeId) {
            setForm((prev) => ({ ...prev, assigneeId: syncedAssignments[0].id }))
          }
        })

        unsubscribeExpenses = expenseService.subscribeToExpenses((fetchedExpenses) => {
          setExpenses(fetchedExpenses)
        })

        unsubscribeComments = commentService.subscribeToAllComments((fetchedComments) => {
          setAllComments(fetchedComments)
        })

        setLoading(false)
      } catch (error) {
        console.error('Error initializing data:', error)
        setLoading(false)
      }
    }

    initializeData()

    // Cleanup subscriptions
    return () => {
      if (unsubscribeTasks) unsubscribeTasks()
      if (unsubscribeSprints) unsubscribeSprints()
      if (unsubscribeUsers) unsubscribeUsers()
      if (unsubscribeExpenses) unsubscribeExpenses()
      if (unsubscribeComments) unsubscribeComments()
    }
  }, [])

  const isSmall = useMediaQuery('(max-width:600px)', { noSsr: true })

  const tasksForSelectedSprint = useMemo(() => {
    let filtered = tasks.filter((t) => t.sprintId === selectedSprintId)
    
    // Filter by assignee if not 'all'
    if (filterAssigneeId !== 'all') {
      filtered = filtered.filter((t) => t.assignee?.id === filterAssigneeId)
    }
    
    // Sort by: pinned first, then priority (high > medium > low), then by deadline (earliest first)
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    
    return filtered.sort((a, b) => {
      // First, sort by pinned status (pinned tasks come first)
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      
      // Then, sort by priority
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
      if (priorityDiff !== 0) return priorityDiff
      
      // Then, sort by deadline (tasks with deadlines come first, earliest first)
      if (a.deadline && b.deadline) {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      if (a.deadline && !b.deadline) return -1
      if (!a.deadline && b.deadline) return 1
      
      // Finally, maintain original order for tasks with same priority and no deadline
      return 0
    })
  }, [tasks, selectedSprintId, filterAssigneeId])

  const selectedSprint = useMemo(
    () => sprints.find((s) => s.id === selectedSprintId),
    [sprints, selectedSprintId]
  )

  const sprintStats = useMemo(() => {
    const total = tasksForSelectedSprint.length
    if (total === 0) {
      return { total: 0, completed: 0, avgProgress: 0 }
    }
    const completed = tasksForSelectedSprint.filter((t) => isTaskResolved(t)).length
    const avgProgress =
      tasksForSelectedSprint.reduce((sum, t) => sum + t.progress, 0) / total
    return {
      total,
      completed,
      avgProgress: Math.round(avgProgress),
    }
  }, [tasksForSelectedSprint])

  const activePlanWindow = useMemo(
    () => sprints.find((s) => s.id === activePlanWindowId),
    [sprints, activePlanWindowId]
  )

  const commentCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    allComments.forEach((c) => {
      counts[c.taskId] = (counts[c.taskId] || 0) + 1
    })
    return counts
  }, [allComments])

  const handleOpenCreate = () => {
    // By default, create under the selected Plan Window.
    setForm((prev) => ({
      ...emptyTaskForm,
      sprintId: selectedSprintId || prev.sprintId,
    }))
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  const handleOpenPlanDialog = (sprint?: Sprint) => {
    if (sprint) {
      setNewPlanName(sprint.name)
      setNewPlanDescription(sprint.description || '')
      setEditingSprintId(sprint.id)
    } else {
      setNewPlanName('')
      setNewPlanDescription('')
      setEditingSprintId(null)
    }
    setPlanDialogOpen(true)
  }

  const handleClosePlanDialog = () => {
    setPlanDialogOpen(false)
    setNewPlanName('')
    setNewPlanDescription('')
    setEditingSprintId(null)
  }

  const handleChange = useCallback(<K extends keyof TaskFormState>(
    key: K,
    value: TaskFormState[K],
  ) => {
    setForm((prev) => {
      if (prev[key] === value) return prev
      return { ...prev, [key]: value }
    })
  }, [])

  const handleSaveTask = async () => {
    if (!form.title.trim()) return

    const assignee = assignments.find((a) => a.id === form.assigneeId)
    const progressValue = form.progress === '' ? 0 : Number(form.progress)

    // Determine status and completedAt
    let status = form.status || 'new'
    let completedAt: string | null = null

    // Auto-transition: if progress reaches 100 and status isn't already completed/discarded
    if (progressValue >= 100 && status !== 'completed' && status !== 'discarded') {
      status = 'completed'
    }
    // Set completedAt when status is completed
    if (status === 'completed' || status === 'discarded') {
      const existingTask = tasks.find((t) => t.id === form.id)
      completedAt = existingTask?.completedAt || new Date().toISOString()
    }

    // Build task data, omitting undefined fields for Firebase
    const taskData: any = {
      title: form.title.trim(),
      type: form.type,
      sprintId: form.sprintId,
      priority: form.priority,
      progress: progressValue,
      status,
      completedAt,
    }

    // Only add optional fields if they have values
    if (form.description.trim()) {
      taskData.description = form.description.trim()
    }

    if (assignee) {
      taskData.assignee = assignee
    }

    if (form.deadline) {
      taskData.deadline = form.deadline.format('YYYY-MM-DD')
    }

    // Only add monetary field if task type is monetary
    if (form.type === 'monetary') {
      taskData.monetary = {
        amount: parseFormattedNumber(form.amount || '0'),
        currency: 'TZS',
        invested: parseFormattedNumber(form.invested || '0'),
      }
    }

    try {
      if (form.id) {
        // Update existing task - capture history for changes
        const existingTask = tasks.find((t) => t.id === form.id)
        
        if (existingTask) {
          // Track progress history if progress changed
          if (progressValue !== existingTask.progress) {
            const progressHistoryEntry = {
              timestamp: new Date().toISOString(),
              value: progressValue,
              changedBy: currentUser?.name,
              note: 'Manual update',
            }
            taskData.progressHistory = [...(existingTask.progressHistory || []), progressHistoryEntry]
          }
          
          // Track invested history if invested amount changed (for monetary tasks)
          if (form.type === 'monetary' && existingTask.monetary) {
            const newInvested = parseFormattedNumber(form.invested || '0')
            if (newInvested !== existingTask.monetary.invested) {
              const investedHistoryEntry = {
                timestamp: new Date().toISOString(),
                value: newInvested,
                changedBy: currentUser?.name,
                note: 'Manual update',
              }
              taskData.investedHistory = [...(existingTask.investedHistory || []), investedHistoryEntry]
            }
          }
        }
        
        await taskService.updateTask(form.id, taskData)
        setSnackbar({ open: true, message: 'Task updated successfully', severity: 'success' })
      } else {
        // Create new task - initialize history with first entry
        const timestamp = new Date().toISOString()
        
        // Add initial progress history entry
        taskData.progressHistory = [{
          timestamp,
          value: progressValue,
          changedBy: currentUser?.name,
          note: 'Initial value',
        }]
        
        // Add initial invested history entry for monetary tasks
        if (form.type === 'monetary') {
          const investedValue = parseFormattedNumber(form.invested || '0')
          taskData.investedHistory = [{
            timestamp,
            value: investedValue,
            changedBy: currentUser?.name,
            note: 'Initial value',
          }]
        }
        
        await taskService.createTask(taskData)
        setSnackbar({ open: true, message: 'Task created successfully', severity: 'success' })
      }
      setDialogOpen(false)
    } catch (error) {
      console.error('Error saving task:', error)
      setSnackbar({ open: true, message: 'Failed to save task', severity: 'error' })
    }
  }

  const handleEditTask = (task: Task) => {
    setForm({
      id: task.id,
      title: task.title,
      description: task.description ?? '',
      type: task.type,
      sprintId: task.sprintId,
      assigneeId: task.assignee?.id ?? assignments[0]?.id ?? '',
      deadline: task.deadline ? dayjs(task.deadline) : null,
      priority: task.priority,
      status: getEffectiveStatus(task),
      progress: task.progress === 0 ? '' : task.progress.toString(),
      amount: task.monetary?.amount ? formatInputValue(task.monetary.amount.toString()) : '',
      currency: 'TZS',
      invested: task.monetary?.invested ? formatInputValue(task.monetary.invested.toString()) : '',
    })
    setDialogOpen(true)
  }

  const handleSavePlanWindow = async () => {
    const trimmedName = newPlanName.trim()
    if (!trimmedName) return

    try {
      if (editingSprintId) {
        // Update existing sprint
        const sprintData: Partial<Sprint> = {
          name: trimmedName,
          description: newPlanDescription.trim() || undefined,
        }
        await sprintService.updateSprint(editingSprintId, sprintData)
        setSnackbar({ open: true, message: 'Plan window updated successfully', severity: 'success' })
        setPlanDialogOpen(false)
      } else {
        // Create new sprint and set it as active
        const sprintData: Omit<Sprint, 'id'> = {
          name: trimmedName,
          description: newPlanDescription.trim() || undefined,
        }
        const newSprintId = await sprintService.createSprint(sprintData)
        setSnackbar({ open: true, message: 'Plan window created successfully', severity: 'success' })
        if (newSprintId) {
          // Set the new sprint as active
          await sprintService.setActiveSprint(newSprintId)
          setActivePlanWindowId(newSprintId)
          setSelectedSprintId(newSprintId)
          setForm((prev) => ({ ...prev, sprintId: newSprintId }))
          setPlanDialogOpen(false)
        }
      }
    } catch (error) {
      console.error('Error saving plan window:', error)
      setSnackbar({ open: true, message: 'Failed to save plan window', severity: 'error' })
    }
  }

  const handleLogin = async (username: string, password: string): Promise<boolean> => {
    const user = await firebaseAuthService.login(username, password)
    if (user) {
      setCurrentUser(user)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const handleLogout = async () => {
    await firebaseAuthService.logout()
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  const handleOpenMemberDialog = async (member?: Assignment) => {
    if (member) {
      const authUser = await userService.getUser(member.id)
      setMemberForm({
        id: member.id,
        name: member.name,
        type: member.type,
        username: authUser?.username || '',
        password: authUser?.password || '',
      })
      setEditingMemberId(member.id)
    } else {
      setMemberForm({ id: '', name: '', type: 'user', username: '', password: '' })
      setEditingMemberId(null)
    }
    setMemberDialogOpen(true)
  }

  const handleCloseMemberDialog = () => {
    setMemberDialogOpen(false)
    setMemberForm({ id: '', name: '', type: 'user', username: '', password: '' })
    setEditingMemberId(null)
  }

  const handleSaveMember = async () => {
    if (!memberForm.name.trim() || !memberForm.username.trim() || !memberForm.password.trim()) {
      setSnackbar({ open: true, message: 'Please fill in all fields', severity: 'error' })
      return
    }

    // Check if username already exists (excluding current user if editing)
    // Only check if username has changed or if creating new member
    if (editingMemberId) {
      const currentUser = await userService.getUser(editingMemberId)
      if (currentUser && currentUser.username !== memberForm.username.trim()) {
        const usernameExists = await firebaseAuthService.usernameExists(memberForm.username, editingMemberId)
        if (usernameExists) {
          setSnackbar({ open: true, message: 'Username already exists. Please choose a different username.', severity: 'error' })
          return
        }
      }
    } else {
      const usernameExists = await firebaseAuthService.usernameExists(memberForm.username)
      if (usernameExists) {
        setSnackbar({ open: true, message: 'Username already exists. Please choose a different username.', severity: 'error' })
        return
      }
    }

    try {
      if (editingMemberId) {
        // Update existing member
        const authUser: AuthUser = {
          id: editingMemberId,
          name: memberForm.name.trim(),
          type: memberForm.type,
          username: memberForm.username.trim(),
          password: memberForm.password,
        }
        await firebaseAuthService.updateUser(editingMemberId, authUser)
        setSnackbar({ open: true, message: 'Family member updated successfully', severity: 'success' })
      } else {
        // Create new member
        const newAuthUser: AuthUser = {
          id: `member-${Date.now()}`,
          name: memberForm.name.trim(),
          type: memberForm.type,
          username: memberForm.username.trim(),
          password: memberForm.password,
        }
        await firebaseAuthService.saveUser(newAuthUser)
        setSnackbar({ open: true, message: 'Family member created successfully', severity: 'success' })
      }
      handleCloseMemberDialog()
    } catch (error) {
      console.error('Error saving member:', error)
      setSnackbar({ open: true, message: 'Failed to save family member', severity: 'error' })
    }
  }

  const handleDeleteMember = async (id: string) => {
    // Don't allow deleting the default admin
    if (id === 'user-admin') {
      alert('Cannot delete the default admin account')
      return
    }

    // Don't allow deleting if it's the only member or if tasks are assigned to them
    if (assignments.length === 1) {
      alert('Cannot delete the last family member')
      return
    }
    const hasAssignedTasks = tasks.some((t) => t.assignee?.id === id)
    if (hasAssignedTasks) {
      alert('Cannot delete member with assigned tasks')
      return
    }
    
    try {
      await firebaseAuthService.deleteUser(id)
      setSnackbar({ open: true, message: 'Family member deleted successfully', severity: 'success' })
    } catch (error) {
      console.error('Error deleting member:', error)
      setSnackbar({ open: true, message: 'Failed to delete family member', severity: 'error' })
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(taskId)
        setSnackbar({ open: true, message: 'Task deleted successfully', severity: 'success' })
      } catch (error) {
        console.error('Error deleting task:', error)
        setSnackbar({ open: true, message: 'Failed to delete task', severity: 'error' })
      }
    }
  }

  const handleIncrementProgress = async (taskId: string, increment: number, description?: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    const newProgress = Math.min(100, Math.max(0, task.progress + increment))
    
    // Build note with increment and optional description
    const incrementNote = `${increment > 0 ? '+' : ''}${increment}%`
    const note = description ? `${incrementNote} - ${description}` : incrementNote
    
    // Add to progress history
    const historyEntry = {
      timestamp: new Date().toISOString(),
      value: newProgress,
      changedBy: currentUser?.name,
      note,
    }
    
    const progressHistory = [...(task.progressHistory || []), historyEntry]
    
    // Auto-transition status based on progress
    const updateData: any = { progress: newProgress, progressHistory }
    const currentStatus = getEffectiveStatus(task)
    
    if (newProgress >= 100 && currentStatus !== 'completed' && currentStatus !== 'discarded') {
      updateData.status = 'completed'
      updateData.completedAt = new Date().toISOString()
    } else if (newProgress < 100 && currentStatus === 'completed') {
      updateData.status = 'in_progress'
      updateData.completedAt = null
    } else if (newProgress > 0 && currentStatus === 'new') {
      updateData.status = 'in_progress'
    }

    try {
      await taskService.updateTask(taskId, updateData)
      setSnackbar({ open: true, message: 'Progress updated successfully', severity: 'success' })
    } catch (error) {
      console.error('Error updating progress:', error)
      setSnackbar({ open: true, message: 'Failed to update progress', severity: 'error' })
    }
  }

  const handleIncrementInvested = async (taskId: string, increment: number, description?: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.monetary) return

    const newInvested = Math.max(0, task.monetary.invested + increment)
    
    // Auto-calculate progress based on invested/budget ratio
    const newProgress = task.monetary.amount > 0 
      ? Math.min(100, Math.round((newInvested / task.monetary.amount) * 100))
      : task.progress

    // Build note with increment and optional description
    const incrementNote = `${increment > 0 ? '+' : ''}${increment.toLocaleString()} TZS`
    const investedNote = description ? `${incrementNote} - ${description}` : incrementNote

    // Add to invested history
    const investedHistoryEntry = {
      timestamp: new Date().toISOString(),
      value: newInvested,
      changedBy: currentUser?.name,
      note: investedNote,
    }
    
    // Add to progress history if it changed
    const progressHistoryEntry = {
      timestamp: new Date().toISOString(),
      value: newProgress,
      changedBy: currentUser?.name,
      note: 'Auto-calculated from investment',
    }
    
    const investedHistory = [...(task.investedHistory || []), investedHistoryEntry]
    const progressHistory = newProgress !== task.progress 
      ? [...(task.progressHistory || []), progressHistoryEntry]
      : task.progressHistory

    // Auto-transition status based on progress
    const updateData: any = {
      monetary: {
        amount: task.monetary.amount,
        currency: task.monetary.currency,
        invested: newInvested,
      },
      progress: newProgress,
      investedHistory,
      progressHistory,
    }
    const currentStatus = getEffectiveStatus(task)

    if (newProgress >= 100 && currentStatus !== 'completed' && currentStatus !== 'discarded') {
      updateData.status = 'completed'
      updateData.completedAt = new Date().toISOString()
    } else if (newProgress < 100 && currentStatus === 'completed') {
      updateData.status = 'in_progress'
      updateData.completedAt = null
    } else if (newProgress > 0 && currentStatus === 'new') {
      updateData.status = 'in_progress'
    }

    try {
      await taskService.updateTask(taskId, updateData)
      setSnackbar({ open: true, message: 'Invested amount updated successfully', severity: 'success' })
    } catch (error) {
      console.error('Error updating invested amount:', error)
      setSnackbar({ open: true, message: 'Failed to update invested amount', severity: 'error' })
    }
  }

  const handleTogglePin = async (taskId: string, pinned: boolean) => {
    try {
      await taskService.updateTask(taskId, { pinned })
      setSnackbar({ open: true, message: pinned ? 'Task pinned' : 'Task unpinned', severity: 'success' })
    } catch (error) {
      console.error('Error toggling pin:', error)
      setSnackbar({ open: true, message: 'Failed to update task', severity: 'error' })
    }
  }

  const handleDeleteProgressHistory = async (taskId: string, index: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.progressHistory) return

    const newHistory = [...task.progressHistory]
    newHistory.splice(index, 1)

    // Get the latest progress value from remaining history, or 0 if empty
    let newProgress = 0
    if (newHistory.length > 0) {
      // Sort by timestamp descending to get the most recent entry
      const sortedHistory = [...newHistory].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      newProgress = sortedHistory[0].value
    }

    try {
      await taskService.updateTask(taskId, { progressHistory: newHistory, progress: newProgress })
      setSnackbar({ open: true, message: 'History entry deleted, progress updated', severity: 'success' })
    } catch (error) {
      console.error('Error deleting history entry:', error)
      setSnackbar({ open: true, message: 'Failed to delete history entry', severity: 'error' })
    }
  }

  const handleClearProgressHistory = async (taskId: string) => {
    try {
      // Reset progress to 0 when clearing all history
      await taskService.updateTask(taskId, { progressHistory: [], progress: 0 })
      setSnackbar({ open: true, message: 'Progress history cleared, progress reset to 0', severity: 'success' })
    } catch (error) {
      console.error('Error clearing history:', error)
      setSnackbar({ open: true, message: 'Failed to clear history', severity: 'error' })
    }
  }

  const handleDeleteInvestedHistory = async (taskId: string, index: number) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.investedHistory || !task.monetary) return

    const newHistory = [...task.investedHistory]
    newHistory.splice(index, 1)

    // Get the latest invested value from remaining history, or 0 if empty
    let newInvested = 0
    if (newHistory.length > 0) {
      // Sort by timestamp descending to get the most recent entry
      const sortedHistory = [...newHistory].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      newInvested = sortedHistory[0].value
    }

    // Recalculate progress based on new invested amount
    const newProgress = task.monetary.amount > 0 
      ? Math.min(100, Math.round((newInvested / task.monetary.amount) * 100))
      : 0

    try {
      await taskService.updateTask(taskId, { 
        investedHistory: newHistory,
        monetary: {
          ...task.monetary,
          invested: newInvested,
        },
        progress: newProgress,
      })
      setSnackbar({ open: true, message: 'History entry deleted, invested amount updated', severity: 'success' })
    } catch (error) {
      console.error('Error deleting history entry:', error)
      setSnackbar({ open: true, message: 'Failed to delete history entry', severity: 'error' })
    }
  }

  const handleClearInvestedHistory = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.monetary) return

    try {
      // Reset invested to 0 and progress to 0 when clearing all history
      await taskService.updateTask(taskId, { 
        investedHistory: [],
        monetary: {
          ...task.monetary,
          invested: 0,
        },
        progress: 0,
      })
      setSnackbar({ open: true, message: 'Investment history cleared, invested reset to 0', severity: 'success' })
    } catch (error) {
      console.error('Error clearing history:', error)
      setSnackbar({ open: true, message: 'Failed to clear history', severity: 'error' })
    }
  }

  const handleSetActivePlanWindow = async (sprintId: string) => {
    try {
      await sprintService.setActiveSprint(sprintId)
      setActivePlanWindowId(sprintId)
      setSelectedSprintId(sprintId)
      setSnackbar({ open: true, message: 'Active plan window updated', severity: 'success' })
    } catch (error) {
      console.error('Error setting active plan window:', error)
      setSnackbar({ open: true, message: 'Failed to set active plan window', severity: 'error' })
    }
  }

  const handleDeleteSprint = async (sprintId: string) => {
    // Don't allow deleting if it's the only sprint
    if (sprints.length === 1) {
      alert('Cannot delete the last plan window')
      return
    }

    // Don't allow deleting if it has assigned tasks
    const hasAssignedTasks = tasks.some((t) => t.sprintId === sprintId)
    if (hasAssignedTasks) {
      alert('Cannot delete plan window with assigned tasks. Please reassign or delete the tasks first.')
      return
    }

    if (window.confirm('Are you sure you want to delete this plan window?')) {
      try {
        await sprintService.deleteSprint(sprintId)
        setSnackbar({ open: true, message: 'Plan window deleted successfully', severity: 'success' })
        // If the deleted sprint was active, set another one as active
        if (activePlanWindowId === sprintId && sprints.length > 1) {
          const newSprint = sprints.find((s) => s.id !== sprintId)
          if (newSprint) {
            await sprintService.setActiveSprint(newSprint.id)
            setActivePlanWindowId(newSprint.id)
            setSelectedSprintId(newSprint.id)
          }
        }
      } catch (error) {
        console.error('Error deleting sprint:', error)
        alert('Failed to delete plan window. Please try again.')
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LoginScreen onLogin={handleLogin} />
      </ThemeProvider>
    )
  }

  if (loading) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'background.default',
            }}
          >
            <Stack spacing={2} alignItems="center">
              <MiraSyncLogo />
              <Typography variant="body1" color="text.secondary">
                Loading...
              </Typography>
            </Stack>
          </Box>
        </ThemeProvider>
      </Provider>
    )
  }

  // Command Center - Entry Dashboard
  if (activeModule === 'command-center') {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <CommandCenter
            userName={currentUser?.name || 'User'}
            onSelectModule={(module) => setActiveModule(module)}
          />
        </ThemeProvider>
      </Provider>
    )
  }

  // Estbel Module - Professional Cash Flow
  if (activeModule === 'estbel' && currentUser) {
    return (
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <EstbelDashboard
            currentUser={currentUser}
            onBack={() => setActiveModule('command-center')}
          />
        </ThemeProvider>
      </Provider>
    )
  }

  // Tracker Module - Tasks & Expenses (existing functionality)
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar
          position="static"
          color="default"
          elevation={0}
          sx={{
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: estbelColors.background.paper,
          }}
        >
          <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 2, sm: 3 } }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconButton
                onClick={() => setActiveModule('command-center')}
                sx={{ color: 'text.secondary' }}
                size="small"
              >
                <ArrowBackIcon />
              </IconButton>
              <MiraSyncLogo />
            </Stack>
            <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={1} alignItems="center">
            {currentUser && (
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                }}
              >
                {currentUser.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </Avatar>
            )}
            {currentTab === 2 && !isSmall && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenCreate}
                aria-label="Add task"
                size="small"
              >
                New Task
              </Button>
            )}
            {currentTab === 3 && !isSmall && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                aria-label="Add expense"
                size="small"
                onClick={() => {
                  // Trigger the add expense action in ExpensesPage
                  const event = new CustomEvent('openExpenseDialog')
                  window.dispatchEvent(event)
                }}
              >
                New Expense
              </Button>
            )}
            <IconButton
              onClick={handleLogout}
              size="small"
              sx={{ color: 'text.secondary' }}
              aria-label="Logout"
            >
              <LogoutIcon />
            </IconButton>
          </Stack>
        </Toolbar>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ 
            px: { xs: 0, sm: 2 }, 
            borderTop: '1px solid', 
            borderColor: 'divider',
            '& .MuiTabs-scrollButtons': {
              '&.Mui-disabled': { opacity: 0.3 },
              width: { xs: 24, sm: 40 },
            },
            '& .MuiTab-root': {
              minWidth: { xs: 'auto', sm: 100 },
              minHeight: { xs: 44, sm: 48 },
              px: { xs: 1, sm: 2 },
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              '& .MuiSvgIcon-root': {
                fontSize: { xs: '1rem', sm: '1.25rem' },
                marginRight: { xs: 0.5, sm: 1 },
              },
            },
          }}
          TabIndicatorProps={{
            style: {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          <Tab 
            label="Family"
            icon={<PeopleIcon />} 
            iconPosition="start"
            aria-label="Family"
          />
          <Tab 
            label={isSmall ? "Plans" : "Plan Windows"}
            icon={<CalendarViewWeekIcon />} 
            iconPosition="start"
            aria-label="Plan Windows"
          />
          <Tab 
            label="Tasks"
            icon={<AssignmentIcon />} 
            iconPosition="start"
            aria-label="Tasks"
          />
          <Tab 
            label="Expenses"
            icon={<AccountBalanceWalletIcon />} 
            iconPosition="start"
            aria-label="Expenses"
          />
        </Tabs>
      </AppBar>

      <Box
        component="main"
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 3, sm: 4 },
          maxWidth: 1280,
          mx: 'auto',
        }}
      >
        {currentTab === 1 && (
          <Stack spacing={3}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  Plan Windows
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage your planning windows and set which one is active
                </Typography>
              </Box>
              <IconButton
                color="primary"
                onClick={() => handleOpenPlanDialog()}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Stack>

            {activePlanWindow && (
              <Card
                sx={{
                  background: `linear-gradient(135deg, ${estbelColors.primary.main} 0%, ${estbelColors.primary.light} 100%)`,
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  overflow: 'hidden',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at top right, rgba(255, 255, 255, 0.1) 0%, transparent 60%)',
                    pointerEvents: 'none',
                  },
                }}
              >
                <CardContent sx={{ p: { xs: 3, sm: 4 }, position: 'relative' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 20, color: 'rgba(255, 255, 255, 0.9)' }} />
                    <Typography variant="subtitle2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                      Active Plan Window
                    </Typography>
                  </Stack>
                  <Typography variant="h3" sx={{ mb: 1.5, color: 'white', fontWeight: 700 }}>
                    {activePlanWindow.name}
                  </Typography>
                  {activePlanWindow.description && (
                    <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 3, lineHeight: 1.6 }}>
                      {activePlanWindow.description}
                    </Typography>
                  )}
                  <Box sx={{ mb: 3 }}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.9)', fontWeight: 500 }}>
                        Overall Progress
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 700 }}>
                        {(() => {
                          const activeTasks = tasks.filter((t) => t.sprintId === activePlanWindowId)
                          if (activeTasks.length === 0) return '0%'
                          const avgProgress = Math.round(
                            activeTasks.reduce((sum, t) => sum + t.progress, 0) / activeTasks.length
                          )
                          return `${avgProgress}%`
                        })()}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={(() => {
                        const activeTasks = tasks.filter((t) => t.sprintId === activePlanWindowId)
                        if (activeTasks.length === 0) return 0
                        return Math.round(
                          activeTasks.reduce((sum, t) => sum + t.progress, 0) / activeTasks.length
                        )
                      })()}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: 'white',
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 700, color: 'white', fontSize: { xs: '2rem', sm: '2.5rem' }, mb: 0.5 }}>
                          {tasks.filter((t) => t.sprintId === activePlanWindowId).length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Total Tasks
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 700, color: 'white', fontSize: { xs: '2rem', sm: '2.5rem' }, mb: 0.5 }}>
                          {tasks.filter((t) => t.sprintId === activePlanWindowId && t.progress >= 100).length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Completed
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 4 }}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h2" sx={{ fontWeight: 700, color: 'white', fontSize: { xs: '2rem', sm: '2.5rem' }, mb: 0.5 }}>
                          {tasks.filter((t) => t.sprintId === activePlanWindowId && t.progress < 100).length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          In Progress
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}

            <Box>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                All Plan Windows
              </Typography>
              <Grid container spacing={3}>
                {sprints.map((sprint) => (
                  <Grid key={sprint.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Card
                      sx={{
                        borderColor:
                          sprint.id === activePlanWindowId
                            ? 'primary.main'
                            : 'divider',
                        borderWidth: sprint.id === activePlanWindowId ? 2 : 1,
                        bgcolor: 'background.paper',
                        transition: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'pointer',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateY(-6px)',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="h6" fontWeight={700} noWrap sx={{ mb: 0.5 }}>
                              {sprint.name}
                            </Typography>
                            {sprint.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ lineHeight: 1.5 }}
                              >
                                {sprint.description}
                              </Typography>
                            )}
                          </Box>
                          <Stack direction="row" spacing={0.5}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenPlanDialog(sprint)
                              }}
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main', bgcolor: 'action.hover' }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {sprints.length > 1 && (
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteSprint(sprint.id)
                                }}
                                sx={{ 
                                  color: 'text.secondary',
                                  '&:hover': { color: 'error.main', bgcolor: 'action.hover' },
                                  '&:disabled': { color: 'action.disabled' }
                                }}
                                disabled={tasks.some((t) => t.sprintId === sprint.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        </Stack>
                        
                        <Divider sx={{ my: 2 }} />
                        
                        <Box sx={{ mb: 2 }}>
                          <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={500}>
                              Progress
                            </Typography>
                            <Typography variant="caption" fontWeight={700} color="primary.main">
                              {(() => {
                                const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id)
                                if (sprintTasks.length === 0) return '0%'
                                const avgProgress = Math.round(
                                  sprintTasks.reduce((sum, t) => sum + t.progress, 0) / sprintTasks.length
                                )
                                return `${avgProgress}%`
                              })()}
                            </Typography>
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={(() => {
                              const sprintTasks = tasks.filter((t) => t.sprintId === sprint.id)
                              if (sprintTasks.length === 0) return 0
                              return Math.round(
                                sprintTasks.reduce((sum, t) => sum + t.progress, 0) / sprintTasks.length
                              )
                            })()}
                            sx={{
                              height: 6,
                              borderRadius: 3,
                              bgcolor: 'action.hover',
                              '& .MuiLinearProgress-bar': {
                                borderRadius: 3,
                              },
                            }}
                          />
                        </Box>
                        
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                          <Grid size={4}>
                            <Box sx={{ textAlign: 'center', py: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                              <Typography variant="h6" fontWeight={700} color="primary.main">
                                {tasks.filter((t) => t.sprintId === sprint.id).length}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                Total
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={4}>
                            <Box sx={{ textAlign: 'center', py: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                              <Typography variant="h6" fontWeight={700} color="success.main">
                                {tasks.filter((t) => t.sprintId === sprint.id && t.progress >= 100).length}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                Done
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid size={4}>
                            <Box sx={{ textAlign: 'center', py: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
                              <Typography variant="h6" fontWeight={700} color="warning.main">
                                {tasks.filter((t) => t.sprintId === sprint.id && t.progress < 100).length}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                Active
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                        
                        <Box sx={{ mt: 'auto' }}>
                          {sprint.id === activePlanWindowId ? (
                            <Chip
                              size="medium"
                              label="Active Window"
                              color="primary"
                              icon={<CheckCircleIcon />}
                              sx={{ width: '100%', fontWeight: 600 }}
                            />
                          ) : (
                            <Button
                              fullWidth
                              size="medium"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetActivePlanWindow(sprint.id)
                              }}
                              sx={{ fontWeight: 600 }}
                            >
                              Set as Active
                            </Button>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Stack>
        )}

        {currentTab === 0 && (
          <Stack spacing={3}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="h4" sx={{ mb: 0.5 }}>
                  Family Members
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Manage family members and groups for task assignments
                </Typography>
              </Box>
              <IconButton
                color="primary"
                onClick={() => handleOpenMemberDialog()}
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
              >
                <AddIcon />
              </IconButton>
            </Stack>

            <Grid container spacing={2}>
              {assignments.map((member) => (
                <Grid key={member.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card>
                    <CardContent sx={{ p: 2.5 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                            {member.name}
                          </Typography>
                          <Chip
                            size="small"
                            label={member.type === 'user' ? 'Individual' : 'Group'}
                            color={member.type === 'user' ? 'primary' : 'secondary'}
                            sx={{ fontWeight: 600 }}
                          />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                            {tasks.filter((t) => t.assignee?.id === member.id).length} task(s) assigned
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenMemberDialog(member)}
                            sx={{ color: 'text.secondary' }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          {assignments.length > 1 && (
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteMember(member.id)}
                              sx={{ color: 'error.main' }}
                              disabled={tasks.some((t) => t.assignee?.id === member.id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}

        {currentTab === 2 && (
          <Stack spacing={3}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${estbelColors.primary.main} 0%, ${estbelColors.primary.light} 100%)`,
                color: 'white',
                border: 'none',
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={2}
                  sx={{ mb: 2 }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h5" noWrap sx={{ fontWeight: 700, color: 'white', mb: 0.5 }}>
                      {selectedSprint?.name ?? 'Tasks'}
                    </Typography>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ color: 'rgba(255, 255, 255, 0.85)' }}
                    >
                      {selectedSprint?.description ?? 'Plan, track, and complete your goals.'}
                    </Typography>
                  </Box>
                  {isSmall && (
                    <IconButton
                      onClick={handleOpenCreate}
                      aria-label="Add task"
                      sx={{
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.3)',
                        },
                      }}
                    >
                      <AddIcon />
                    </IconButton>
                  )}
                </Stack>

                <Stack
                  direction="row"
                  spacing={{ xs: 3, sm: 5 }}
                  sx={{
                    pt: 2,
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Total Tasks
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', fontSize: { xs: '1.75rem', sm: '2.25rem' } }}>
                      {sprintStats.total}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Completed
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', fontSize: { xs: '1.75rem', sm: '2.25rem' } }}>
                      {sprintStats.completed}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.8)', display: 'block', mb: 0.5, textTransform: 'uppercase', letterSpacing: 1 }}>
                      Progress
                    </Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700, color: 'white', fontSize: { xs: '1.75rem', sm: '2.25rem' } }}>
                      {sprintStats.avgProgress}%
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Filters Section */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="window-filter-label">Plan Window</InputLabel>
                <Select
                  labelId="window-filter-label"
                  label="Plan Window"
                  value={selectedSprintId}
                  onChange={(e) => setSelectedSprintId(e.target.value)}
                >
                  {sprints.map((sprint) => (
                    <MenuItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel id="assignee-filter-label">Family Member</InputLabel>
                <Select
                  labelId="assignee-filter-label"
                  label="Family Member"
                  value={filterAssigneeId}
                  onChange={(e) => setFilterAssigneeId(e.target.value)}
                >
                  <MenuItem value="all">All Members</MenuItem>
                  {assignments.map((member) => (
                    <MenuItem key={member.id} value={member.id}>
                      {member.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <Stack spacing={3}>
                {/* Active Tasks (not resolved) */}
                {tasksForSelectedSprint.filter(t => !isTaskResolved(t)).length > 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      Active Tasks ({tasksForSelectedSprint.filter(t => !isTaskResolved(t)).length})
                    </Typography>
                    <Stack spacing={2}>
                      {tasksForSelectedSprint.filter(t => !isTaskResolved(t)).map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => handleEditTask(task)}
                          onEdit={() => handleEditTask(task)}
                          onDelete={() => handleDeleteTask(task.id)}
                          onIncrementProgress={handleIncrementProgress}
                          onIncrementInvested={handleIncrementInvested}
                          onTogglePin={handleTogglePin}
                          onDeleteProgressHistory={handleDeleteProgressHistory}
                          onClearProgressHistory={handleClearProgressHistory}
                          onDeleteInvestedHistory={handleDeleteInvestedHistory}
                          onClearInvestedHistory={handleClearInvestedHistory}
                          onOpenComments={() => setCommentsDialogTask(task)}
                          commentCount={commentCounts[task.id] || 0}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Completed & Discarded Tasks - Collapsible */}
                <CompletedTasksSection count={tasksForSelectedSprint.filter(t => isTaskResolved(t)).length}>
                  <Stack spacing={2}>
                    {tasksForSelectedSprint.filter(t => isTaskResolved(t)).map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onClick={() => handleEditTask(task)}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                        onIncrementProgress={handleIncrementProgress}
                        onIncrementInvested={handleIncrementInvested}
                        onTogglePin={handleTogglePin}
                        onDeleteProgressHistory={handleDeleteProgressHistory}
                        onClearProgressHistory={handleClearProgressHistory}
                        onDeleteInvestedHistory={handleDeleteInvestedHistory}
                        onClearInvestedHistory={handleClearInvestedHistory}
                        onOpenComments={() => setCommentsDialogTask(task)}
                        commentCount={commentCounts[task.id] || 0}
                      />
                    ))}
                  </Stack>
                </CompletedTasksSection>

                {tasksForSelectedSprint.length === 0 && (
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      border: '1px dashed',
                      borderColor: 'divider',
                      bgcolor: 'background.paper',
                      textAlign: 'center',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ mb: 0.5 }}
                    >
                      No tasks yet
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Create your first task to start tracking this sprint&apos;s goals.
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleOpenCreate}
                    >
                      New task
                    </Button>
                  </Box>
                )}
            </Stack>
          </Stack>
        )}

        {currentTab === 3 && currentUser && (
          <ExpensesPage
            expenses={expenses}
            currentUser={currentUser}
            users={assignments}
            isSmall={isSmall}
            onShowSnackbar={(message, severity) => setSnackbar({ open: true, message, severity })}
          />
        )}
      </Box>

      <TaskDialog
        open={dialogOpen}
        form={form}
        sprints={sprints}
        assignments={assignments}
        isSmall={isSmall}
        onClose={handleCloseDialog}
        onChange={handleChange}
        onSave={handleSaveTask}
      />
      <Dialog
        open={planDialogOpen}
        onClose={handleClosePlanDialog}
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle sx={{ p: 2.5, pb: 2 }}>
          <Typography variant="h6" component="div">
            {editingSprintId ? 'Edit Plan Window' : 'Create Plan Window'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Stack spacing={2.5} sx={{ minWidth: { xs: 260, sm: 400 } }}>
            <TextField
              label="Name"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              fullWidth
              autoFocus
              required
            />
            <TextField
              label="Description"
              value={newPlanDescription}
              onChange={(e) => setNewPlanDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 2 }}>
          <Button onClick={handleClosePlanDialog} size="large">Cancel</Button>
          <Button onClick={handleSavePlanWindow} variant="contained" size="large">
            {editingSprintId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      <MemberDialog
        open={memberDialogOpen}
        form={memberForm}
        editingId={editingMemberId}
        onClose={handleCloseMemberDialog}
        onChange={setMemberForm}
        onSave={handleSaveMember}
      />
      
      {/* Comments Dialog */}
      {currentUser && (
        <TaskCommentsDialog
          open={!!commentsDialogTask}
          onClose={() => setCommentsDialogTask(null)}
          task={commentsDialogTask}
          currentUser={currentUser}
        />
      )}

      {/* Snackbar for flash messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </ThemeProvider>
    </Provider>
  )
}

export default App
