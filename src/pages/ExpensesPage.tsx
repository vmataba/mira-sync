import { useState, useEffect, useMemo } from 'react'
import {
  Stack,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import dayjs from 'dayjs'
import type { Expense, Assignment } from '../models'
import type { AuthUser } from '../auth/authService'
import { ExpenseDialog } from '../components/ExpenseDialog'
import { ExpenseCard } from '../components/ExpenseCard'
import { ExpenseAnalytics } from '../components/ExpenseAnalytics'
import { ExpenseFilters } from '../components/ExpenseFilters'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { expenseService } from '../services/firestoreService'

interface ExpensesPageProps {
  expenses: Expense[]
  currentUser: AuthUser
  users: Assignment[]
  isSmall: boolean
  onShowSnackbar: (message: string, severity: 'success' | 'error' | 'info') => void
}

export function ExpensesPage({
  expenses,
  currentUser,
  users,
  isSmall,
  onShowSnackbar,
}: ExpensesPageProps) {
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>(undefined)
  const [selectedUserId, setSelectedUserId] = useState<string>('all')
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('all')
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean
    expenseId: string | null
  }>({ open: false, expenseId: null })

  // Listen for add expense event from toolbar
  useEffect(() => {
    const handleOpenDialog = () => {
      handleOpenExpenseDialog()
    }
    window.addEventListener('openExpenseDialog', handleOpenDialog)
    return () => {
      window.removeEventListener('openExpenseDialog', handleOpenDialog)
    }
  }, [])

  // Filter expenses based on user and time range
  const filteredExpenses = useMemo(() => {
    let filtered = [...expenses]

    // Filter by user
    if (selectedUserId !== 'all') {
      filtered = filtered.filter((expense) => expense.userId === selectedUserId)
    }

    // Filter by time range
    if (selectedTimeRange !== 'all') {
      const now = dayjs()
      filtered = filtered.filter((expense) => {
        const expenseDate = dayjs(expense.date)
        switch (selectedTimeRange) {
          case 'today':
            return expenseDate.isSame(now, 'day')
          case 'week':
            return expenseDate.isSame(now, 'week')
          case 'month':
            return expenseDate.isSame(now, 'month')
          case 'year':
            return expenseDate.isSame(now, 'year')
          default:
            return true
        }
      })
    }

    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [expenses, selectedUserId, selectedTimeRange])

  // Calculate analytics for filtered expenses
  const expenseAnalytics = useMemo(() => {
    const userId = selectedUserId === 'all' ? undefined : selectedUserId
    const expensesToAnalyze = userId
      ? filteredExpenses.filter((e) => e.userId === userId)
      : filteredExpenses

    const totalAmount = expensesToAnalyze.reduce((sum, expense) => sum + expense.amount, 0)
    const expenseCount = expensesToAnalyze.length
    const averageExpense = expenseCount > 0 ? totalAmount / expenseCount : 0

    const expensesByMonth: { [month: string]: number } = {}
    const expensesByPurpose: { [purpose: string]: number } = {}

    expensesToAnalyze.forEach((expense) => {
      const month = expense.date.substring(0, 7)
      expensesByMonth[month] = (expensesByMonth[month] || 0) + expense.amount

      expensesByPurpose[expense.purpose] = (expensesByPurpose[expense.purpose] || 0) + expense.amount
    })

    return {
      totalAmount,
      expenseCount,
      averageExpense,
      expensesByMonth,
      expensesByPurpose,
    }
  }, [filteredExpenses, selectedUserId])

  const handleOpenExpenseDialog = (expense?: Expense) => {
    setEditingExpense(expense)
    setExpenseDialogOpen(true)
  }

  const handleCloseExpenseDialog = () => {
    setExpenseDialogOpen(false)
    setEditingExpense(undefined)
  }

  const handleSaveExpense = async (expenseData: Omit<Expense, 'id'>) => {
    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, expenseData)
        onShowSnackbar('Expense updated successfully', 'success')
      } else {
        await expenseService.createExpense(expenseData)
        onShowSnackbar('Expense added successfully', 'success')
      }
      handleCloseExpenseDialog()
    } catch (error) {
      console.error('Error saving expense:', error)
      onShowSnackbar('Failed to save expense', 'error')
    }
  }

  const handleDeleteClick = (expenseId: string) => {
    setConfirmDialog({ open: true, expenseId })
  }

  const handleConfirmDelete = async () => {
    if (confirmDialog.expenseId) {
      try {
        await expenseService.deleteExpense(confirmDialog.expenseId)
        onShowSnackbar('Expense deleted successfully', 'success')
      } catch (error) {
        console.error('Error deleting expense:', error)
        onShowSnackbar('Failed to delete expense', 'error')
      }
    }
    setConfirmDialog({ open: false, expenseId: null })
  }

  const handleCancelDelete = () => {
    setConfirmDialog({ open: false, expenseId: null })
  }

  return (
    <Stack spacing={{ xs: 2, sm: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4" sx={{ mb: 0.5, fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
            Expense Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Track and analyze your expenses over time
          </Typography>
        </Box>
        {isSmall && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenExpenseDialog()}
            size="small"
          >
            Add
          </Button>
        )}
      </Stack>

      {/* Filters */}
      <ExpenseFilters
        selectedUserId={selectedUserId}
        selectedTimeRange={selectedTimeRange}
        users={users}
        onUserChange={setSelectedUserId}
        onTimeRangeChange={setSelectedTimeRange}
      />

      {/* Expense Analytics */}
      <ExpenseAnalytics analytics={expenseAnalytics} />

      {/* Expense List */}
      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              mb: 2,
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {selectedUserId !== 'all' || selectedTimeRange !== 'all'
              ? 'Filtered Expenses'
              : 'Recent Expenses'}
          </Typography>

          {filteredExpenses.length > 0 ? (
            <Box>
              {filteredExpenses.map((expense, index, array) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={handleOpenExpenseDialog}
                  onDelete={handleDeleteClick}
                  currentUserId={currentUser.id}
                  isLast={index === array.length - 1}
                />
              ))}
            </Box>
          ) : (
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
              <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                {selectedUserId !== 'all' || selectedTimeRange !== 'all'
                  ? 'No expenses found'
                  : 'No expenses yet'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {selectedUserId !== 'all' || selectedTimeRange !== 'all'
                  ? 'Try adjusting your filters to see more expenses.'
                  : 'Start tracking your expenses to get insights into your spending habits.'}
              </Typography>
              {(selectedUserId === 'all' && selectedTimeRange === 'all') && (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenExpenseDialog()}
                >
                  Add Expense
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <ExpenseDialog
        open={expenseDialogOpen}
        onClose={handleCloseExpenseDialog}
        onSave={handleSaveExpense}
        expense={editingExpense}
        currentUser={{ id: currentUser.id, name: currentUser.name }}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        severity="error"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </Stack>
  )
}
