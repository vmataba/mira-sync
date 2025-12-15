import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid2 as Grid,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import type { Expense } from '../models'
import { formatInputValue, parseFormattedNumber } from '../utils/currency'

interface ExpenseDialogProps {
  open: boolean
  onClose: () => void
  onSave: (expense: Omit<Expense, 'id'>) => void
  expense?: Expense
  currentUser: { id: string; name: string }
}

export function ExpenseDialog({ open, onClose, onSave, expense, currentUser }: ExpenseDialogProps) {
  const [formData, setFormData] = useState({
    amount: '',
    purpose: '',
    date: dayjs(),
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        amount: expense.amount.toString(),
        purpose: expense.purpose,
        date: dayjs(expense.date),
      })
    } else {
      setFormData({
        amount: '',
        purpose: '',
        date: dayjs(),
      })
    }
  }, [expense, open])

  const handleSave = () => {
    const amount = parseFormattedNumber(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (!formData.purpose.trim()) {
      alert('Please enter a purpose/description')
      return
    }

    const expenseData: Omit<Expense, 'id'> = {
      amount,
      purpose: formData.purpose.trim(),
      description: formData.purpose.trim(), // Use purpose as description
      date: formData.date.format('YYYY-MM-DD'),
      userId: currentUser.id,
      userName: currentUser.name,
      createdAt: new Date().toISOString(),
    }

    onSave(expenseData)
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Amount (TZS)"
                value={formData.amount}
                onChange={(e) => {
                  const formatted = formatInputValue(e.target.value)
                  setFormData({ ...formData, amount: formatted })
                }}
                placeholder="0"
                helperText="Use thousand separators (e.g., 1,000,000)"
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Purpose/Description"
                multiline
                rows={3}
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="What was this expense for?"
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <DatePicker
                label="Date"
                value={formData.date}
                onChange={(newDate) => setFormData({ ...formData, date: newDate || dayjs() })}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {expense ? 'Update' : 'Add'} Expense
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
}
