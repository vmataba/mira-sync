import React, { useEffect, useState } from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import CloseIcon from '@mui/icons-material/Close'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import type { Dayjs } from 'dayjs'
import type { Assignment, Priority, Sprint, TaskType } from '../models'
import { formatInputValue, parseFormattedNumber } from '../utils/currency'

interface TaskFormState {
  id?: string
  title: string
  description: string
  type: TaskType
  sprintId: string
  assigneeId: string
  deadline: Dayjs | null
  priority: Priority
  progress: string
  amount: string
  currency: string
  invested: string
}

interface TaskDialogProps {
  open: boolean
  form: TaskFormState
  sprints: Sprint[]
  assignments: Assignment[]
  isSmall: boolean
  onClose: () => void
  onChange: <K extends keyof TaskFormState>(key: K, value: TaskFormState[K]) => void
  onSave: () => void
}

export const TaskDialog = React.memo(({
  open,
  form,
  sprints,
  assignments,
  isSmall,
  onClose,
  onChange,
  onSave,
}: TaskDialogProps) => {
  const isMonetary = form.type === 'monetary'
  const [progressIncrementDialog, setProgressIncrementDialog] = useState(false)
  const [investedIncrementDialog, setInvestedIncrementDialog] = useState(false)
  const [progressIncrementValue, setProgressIncrementValue] = useState('')
  const [investedIncrementValue, setInvestedIncrementValue] = useState('')

  // Auto-calculate progress for monetary tasks based on invested/budget ratio
  useEffect(() => {
    if (isMonetary && form.amount && form.invested) {
      const budget = parseFormattedNumber(form.amount)
      const invested = parseFormattedNumber(form.invested)
      
      if (budget > 0) {
        const calculatedProgress = Math.min(100, Math.round((invested / budget) * 100))
        // Only update if different from current to avoid infinite loops
        if (form.progress !== calculatedProgress.toString()) {
          onChange('progress', calculatedProgress.toString())
        }
      }
    }
  }, [form.amount, form.invested, isMonetary])

  const handleApplyProgressIncrement = () => {
    const increment = Number(progressIncrementValue)
    if (!isNaN(increment) && increment !== 0) {
      const currentProgress = form.progress === '' ? 0 : Number(form.progress)
      const newProgress = Math.min(100, Math.max(0, currentProgress + increment))
      onChange('progress', newProgress.toString())
    }
    setProgressIncrementDialog(false)
    setProgressIncrementValue('')
  }

  const handleApplyInvestedIncrement = () => {
    const increment = parseFormattedNumber(investedIncrementValue)
    if (!isNaN(increment) && increment !== 0) {
      const currentInvested = form.invested ? parseFormattedNumber(form.invested) : 0
      const newInvested = Math.max(0, currentInvested + increment)
      onChange('invested', formatInputValue(newInvested.toString()))
    }
    setInvestedIncrementDialog(false)
    setInvestedIncrementValue('')
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        fullScreen={isSmall}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2.5, pb: 2 }}>
          <Typography variant="h6" component="div">
            {form.id ? 'Edit Task' : 'New Task'}
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 2.5 }}>
          <Stack spacing={2.5} sx={{ minWidth: { xs: 260, sm: 450 } }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => onChange('title', e.target.value)}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => onChange('description', e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControl fullWidth>
              <InputLabel id="plan-window-label">Plan Window</InputLabel>
              <Select
                labelId="plan-window-label"
                label="Plan Window"
                value={form.sprintId}
                onChange={(e) => onChange('sprintId', e.target.value as string)}
              >
                {sprints.map((sprint) => (
                  <MenuItem key={sprint.id} value={sprint.id}>
                    {sprint.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Type</InputLabel>
                <Select
                  labelId="type-label"
                  label="Type"
                  value={form.type}
                  onChange={(e) => onChange('type', e.target.value as TaskType)}
                >
                  <MenuItem value="general">General</MenuItem>
                  <MenuItem value="monetary">Monetary</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="priority-label">Priority</InputLabel>
                <Select
                  labelId="priority-label"
                  label="Priority"
                  value={form.priority}
                  onChange={(e) => onChange('priority', e.target.value as Priority)}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="assignee-label">Assigned to</InputLabel>
                <Select
                  labelId="assignee-label"
                  label="Assigned to"
                  value={form.assigneeId}
                  onChange={(e) => onChange('assigneeId', e.target.value as string)}
                >
                  {assignments.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.name} ({a.type === 'user' ? 'Individual' : 'Group'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DatePicker
                label="Deadline"
                value={form.deadline}
                onChange={(newValue) => onChange('deadline', newValue)}
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Stack>

            <TextField
              label="Progress (%)"
              type="number"
              value={form.progress}
              onChange={(e) => {
                const inputValue = e.target.value
                if (inputValue === '') {
                  onChange('progress', '')
                } else {
                  const value = Number(inputValue)
                  if (!Number.isNaN(value)) {
                    const clamped = Math.min(100, Math.max(0, value)).toString()
                    onChange('progress', clamped)
                  }
                }
              }}
              fullWidth
              inputProps={{ min: 0, max: 100 }}
              placeholder="0"
              helperText={isMonetary ? "Auto-calculated from invested/budget. Can be overridden." : "Leave empty for 0%"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setProgressIncrementDialog(true)}
                      edge="end"
                      size="small"
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          bgcolor: 'primary.light',
                          color: 'white',
                        },
                      }}
                    >
                      <AddCircleOutlineIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {isMonetary && (
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Budget Amount (TZS)"
                  value={form.amount}
                  onChange={(e) => {
                    const formatted = formatInputValue(e.target.value)
                    onChange('amount', formatted)
                  }}
                  fullWidth
                  placeholder="0"
                  helperText="Total budget for this task"
                />
                <TextField
                  label="Amount Invested (TZS)"
                  value={form.invested}
                  onChange={(e) => {
                    const formatted = formatInputValue(e.target.value)
                    onChange('invested', formatted)
                  }}
                  fullWidth
                  placeholder="0"
                  helperText="Amount spent so far"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setInvestedIncrementDialog(true)}
                          edge="end"
                          size="small"
                          sx={{
                            color: 'primary.main',
                            '&:hover': {
                              bgcolor: 'primary.light',
                              color: 'white',
                            },
                          }}
                        >
                          <AddCircleOutlineIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 2 }}>
          <Button onClick={onClose} size="large">Cancel</Button>
          <Button onClick={onSave} variant="contained" size="large">
            {form.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress Increment Dialog */}
      <Dialog open={progressIncrementDialog} onClose={() => setProgressIncrementDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Increment Progress</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Progress Increment (%)"
            type="number"
            fullWidth
            value={progressIncrementValue}
            onChange={(e) => setProgressIncrementValue(e.target.value)}
            placeholder="e.g., 10 or -5"
            helperText="Enter positive value to increase or negative to decrease"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setProgressIncrementDialog(false)}>Cancel</Button>
          <Button onClick={handleApplyProgressIncrement} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>

      {/* Invested Amount Increment Dialog */}
      <Dialog open={investedIncrementDialog} onClose={() => setInvestedIncrementDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Increment Invested Amount</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Amount Increment (TZS)"
            fullWidth
            value={investedIncrementValue}
            onChange={(e) => {
              const formatted = formatInputValue(e.target.value)
              setInvestedIncrementValue(formatted)
            }}
            placeholder="e.g., 100,000 or 1,000,000"
            helperText="Enter the amount to add to invested (use thousand separators)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInvestedIncrementDialog(false)}>Cancel</Button>
          <Button onClick={handleApplyInvestedIncrement} variant="contained">Apply</Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  )
})

TaskDialog.displayName = 'TaskDialog'
