import React, { useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import HistoryIcon from '@mui/icons-material/History'
import PersonIcon from '@mui/icons-material/Person'
import EventIcon from '@mui/icons-material/Event'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import type { Task } from '../models'
import { formatAbbreviated, formatInputValue } from '../utils/currency'
import { HistoryDialog } from './HistoryDialog'

interface TaskCardProps {
  task: Task
  onClick: () => void
  onEdit?: () => void
  onDelete?: () => void
  onIncrementProgress?: (taskId: string, increment: number, description?: string) => void
  onIncrementInvested?: (taskId: string, increment: number, description?: string) => void
}

export const TaskCard = React.memo(({ task, onClick, onEdit, onDelete, onIncrementProgress, onIncrementInvested }: TaskCardProps) => {
  const [progressDialog, setProgressDialog] = useState(false)
  const [investedDialog, setInvestedDialog] = useState(false)
  const [progressValue, setProgressValue] = useState('')
  const [investedValue, setInvestedValue] = useState('')
  const [progressDescription, setProgressDescription] = useState('')
  const [investedDescription, setInvestedDescription] = useState('')
  const [progressHistoryDialog, setProgressHistoryDialog] = useState(false)
  const [investedHistoryDialog, setInvestedHistoryDialog] = useState(false)

  const handleProgressIncrement = () => {
    const increment = Number(progressValue)
    if (!isNaN(increment) && increment !== 0 && onIncrementProgress) {
      onIncrementProgress(task.id, increment, progressDescription.trim() || undefined)
    }
    setProgressDialog(false)
    setProgressValue('')
    setProgressDescription('')
  }

  const handleInvestedIncrement = () => {
    const increment = Number(investedValue.replace(/,/g, ''))
    if (!isNaN(increment) && increment !== 0 && onIncrementInvested) {
      onIncrementInvested(task.id, increment, investedDescription.trim() || undefined)
    }
    setInvestedDialog(false)
    setInvestedValue('')
    setInvestedDescription('')
  }
  return (
    <>
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        transition: 'all 200ms ease-out',
        border: '2px solid',
        borderColor: task.progress >= 100 
          ? 'success.main' 
          : task.deadline && new Date(task.deadline) < new Date() && task.progress < 100
            ? 'error.main'
            : task.priority === 'high'
              ? 'error.light'
              : 'divider',
        borderLeftWidth: 6,
        borderLeftColor: task.priority === 'high' 
          ? 'error.main' 
          : task.priority === 'medium' 
            ? 'warning.main' 
            : 'success.main',
        bgcolor: task.progress >= 100 ? 'success.50' : 'background.paper',
        opacity: task.progress >= 100 ? 0.85 : 1,
        position: 'relative',
        overflow: 'visible',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-4px) translateX(2px)',
          boxShadow: '0 12px 24px -4px rgba(99, 102, 241, 0.2), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
        },
      }}
      data-testid="task-item"
    >
      <CardContent sx={{ pt: { xs: 5, sm: 5 }, pb: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 2.5 }, position: 'relative' }}>
        {/* Completion Badge */}
        {task.progress >= 100 && (
          <Box
            sx={{
              position: 'absolute',
              top: -12,
              right: 16,
              bgcolor: 'success.main',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 14 }} />
            COMPLETED
          </Box>
        )}
        
        {/* Overdue Badge */}
        {task.deadline && new Date(task.deadline) < new Date() && task.progress < 100 && (
          <Box
            sx={{
              position: 'absolute',
              top: -12,
              right: 16,
              bgcolor: 'error.main',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              fontSize: '0.75rem',
              fontWeight: 700,
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.7 },
              },
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 14 }} />
            OVERDUE
          </Box>
        )}

        {(onEdit || onDelete) && (
          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1,
            }}
          >
            {onEdit && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                size="small"
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    bgcolor: 'primary.main',
                    color: 'white',
                  },
                }}
                aria-label="Edit task"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            )}
            {onDelete && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                size="small"
                sx={{
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  '&:hover': {
                    bgcolor: 'error.main',
                    color: 'white',
                  },
                }}
                aria-label="Delete task"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            )}
          </Stack>
        )}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
          spacing={2}
        >
          <Box sx={{ flex: 1, minWidth: 0, pr: { xs: 7, sm: 0 } }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 0.5,
                fontSize: { xs: '1rem', sm: '1.125rem' },
                textDecoration: task.progress >= 100 ? 'line-through' : 'none',
                color: task.progress >= 100 ? 'text.secondary' : 'text.primary',
              }}
              noWrap
            >
              {task.title}
            </Typography>
            {task.description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1.5, lineHeight: 1.6 }}
                noWrap
              >
                {task.description}
              </Typography>
            )}
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 1.5, flexWrap: 'wrap', gap: 0.75 }}
            >
              <Chip
                size="small"
                label={
                  task.priority === 'high'
                    ? 'High'
                    : task.priority === 'medium'
                      ? 'Medium'
                      : 'Low'
                }
                sx={{
                  bgcolor: task.priority === 'high' ? 'error.main' : task.priority === 'medium' ? 'warning.main' : 'success.main',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
              {task.type === 'monetary' && (
                <Chip
                  size="small"
                  label="Monetary"
                  sx={{
                    bgcolor: 'secondary.main',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              )}
              {task.assignee && (
                <Tooltip title={`Assigned to ${task.assignee.name}`} arrow>
                  <Chip
                    size="small"
                    avatar={
                      <Avatar
                        sx={{
                          width: 20,
                          height: 20,
                          fontSize: '0.75rem',
                          bgcolor: 'white',
                          color: 'primary.main',
                          fontWeight: 600,
                        }}
                      >
                        {task.assignee.name.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    label={task.assignee.name}
                    icon={<PersonIcon />}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-avatar': {
                        bgcolor: 'white',
                        color: 'primary.main',
                        fontWeight: 600,
                      },
                      '& .MuiChip-icon': {
                        color: 'white',
                      },
                    }}
                  />
                </Tooltip>
              )}
              {task.deadline && (
                <Tooltip title={`Deadline: ${new Date(task.deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`} arrow>
                  <Chip
                    size="small"
                    icon={<EventIcon />}
                    label={(() => {
                      const deadline = new Date(task.deadline)
                      const today = new Date()
                      const diffTime = deadline.getTime() - today.getTime()
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                      
                      if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`
                      if (diffDays === 0) return 'Today'
                      if (diffDays === 1) return 'Tomorrow'
                      if (diffDays <= 7) return `${diffDays}d left`
                      return deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    })()}
                    sx={{
                      bgcolor: (() => {
                        const deadline = new Date(task.deadline)
                        const today = new Date()
                        const diffTime = deadline.getTime() - today.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        
                        if (diffDays < 0) return 'error.light'
                        if (diffDays <= 3) return 'warning.light'
                        return 'action.hover'
                      })(),
                      color: (() => {
                        const deadline = new Date(task.deadline)
                        const today = new Date()
                        const diffTime = deadline.getTime() - today.getTime()
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                        
                        if (diffDays < 0) return 'error.dark'
                        if (diffDays <= 3) return 'warning.dark'
                        return 'text.secondary'
                      })(),
                      fontWeight: 600,
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Box>
          <Box
            sx={{
              minWidth: { xs: '100%', sm: 140 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: { xs: 'flex-start', sm: 'flex-end' },
              gap: 1,
            }}
          >
            <Box sx={{ width: '100%', maxWidth: { xs: '100%', sm: 120 } }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Progress
                </Typography>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color: task.progress >= 100 ? 'success.main' : task.progress >= 50 ? 'primary.main' : 'text.secondary',
                    }}
                  >
                    {task.progress}%
                  </Typography>
                  {onIncrementProgress && (
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="View history" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            setProgressHistoryDialog(true)
                          }}
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: 'grey.100',
                            border: '1px solid',
                            borderColor: 'grey.300',
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: 'primary.light',
                              borderColor: 'primary.main',
                              color: 'white',
                            },
                          }}
                        >
                          <HistoryIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Update progress" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            setProgressDialog(true)
                          }}
                          sx={{
                            width: 28,
                            height: 28,
                            bgcolor: 'primary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'primary.dark',
                            },
                          }}
                        >
                          <AddCircleOutlineIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </Stack>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={task.progress}
                sx={{
                  width: '100%',
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'action.hover',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    bgcolor: task.progress >= 100 ? 'success.main' : 'primary.main',
                  },
                }}
              />
            </Box>
            {task.type === 'monetary' && task.monetary && (
              <Box
                sx={{
                  bgcolor: 'action.hover',
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1.5,
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.25 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Budget
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    {task.investedHistory && task.investedHistory.length > 0 && (
                      <Tooltip title="View history" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            setInvestedHistoryDialog(true)
                          }}
                          sx={{
                            width: 26,
                            height: 26,
                            bgcolor: 'grey.100',
                            border: '1px solid',
                            borderColor: 'grey.300',
                            color: 'text.secondary',
                            '&:hover': {
                              bgcolor: 'secondary.light',
                              borderColor: 'secondary.main',
                              color: 'white',
                            },
                          }}
                        >
                          <HistoryIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {onIncrementInvested && (
                      <Tooltip title="Update investment" arrow>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation()
                            setInvestedDialog(true)
                          }}
                          sx={{
                            width: 26,
                            height: 26,
                            bgcolor: 'secondary.main',
                            color: 'white',
                            '&:hover': {
                              bgcolor: 'secondary.dark',
                            },
                          }}
                        >
                          <AddCircleOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                </Stack>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: 'text.primary' }}
                >
                  {formatAbbreviated(task.monetary.invested)}/{formatAbbreviated(task.monetary.amount)} TZS
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
    
    {/* Progress History Dialog */}
    <HistoryDialog
      open={progressHistoryDialog}
      onClose={() => setProgressHistoryDialog(false)}
      title="Progress History"
      history={task.progressHistory || []}
      type="progress"
    />

    {/* Invested History Dialog */}
    <HistoryDialog
      open={investedHistoryDialog}
      onClose={() => setInvestedHistoryDialog(false)}
      title="Investment History"
      history={task.investedHistory || []}
      type="invested"
    />
    
    {/* Progress Increment Dialog */}
    <Dialog open={progressDialog} onClose={() => setProgressDialog(false)} maxWidth="xs" fullWidth onClick={(e) => e.stopPropagation()}>
      <DialogTitle>Increment Progress</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Progress Increment (%)"
          type="number"
          fullWidth
          value={progressValue}
          onChange={(e) => setProgressValue(e.target.value)}
          placeholder="e.g., 10 or -5"
          helperText="Enter positive value to increase or negative to decrease"
        />
        <TextField
          margin="dense"
          label="Description (optional)"
          fullWidth
          multiline
          rows={2}
          value={progressDescription}
          onChange={(e) => setProgressDescription(e.target.value)}
          placeholder="What was accomplished?"
          helperText="Describe what this progress represents"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setProgressDialog(false)}>Cancel</Button>
        <Button onClick={handleProgressIncrement} variant="contained">Apply</Button>
      </DialogActions>
    </Dialog>

    {/* Invested Amount Increment Dialog */}
    <Dialog open={investedDialog} onClose={() => setInvestedDialog(false)} maxWidth="xs" fullWidth onClick={(e) => e.stopPropagation()}>
      <DialogTitle>Increment Invested Amount</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Amount Increment (TZS)"
          fullWidth
          value={investedValue}
          onChange={(e) => {
            const formatted = formatInputValue(e.target.value)
            setInvestedValue(formatted)
          }}
          placeholder="e.g., 100,000 or 1,000,000"
          helperText="Enter the amount to add to invested"
        />
        <TextField
          margin="dense"
          label="Description (optional)"
          fullWidth
          multiline
          rows={2}
          value={investedDescription}
          onChange={(e) => setInvestedDescription(e.target.value)}
          placeholder="What was this investment for?"
          helperText="Describe what this investment represents"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setInvestedDialog(false)}>Cancel</Button>
        <Button onClick={handleInvestedIncrement} variant="contained">Apply</Button>
      </DialogActions>
    </Dialog>
  </>
  )
})

TaskCard.displayName = 'TaskCard'
