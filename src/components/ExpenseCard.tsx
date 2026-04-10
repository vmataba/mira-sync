import {
  Typography,
  IconButton,
  Box,
  Chip,
  Tooltip,
  alpha,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import PersonIcon from '@mui/icons-material/Person'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import dayjs from 'dayjs'
import type { Expense } from '../models'

interface ExpenseCardProps {
  expense: Expense
  onEdit?: (expense: Expense) => void
  onDelete?: (expenseId: string) => void
  currentUserId?: string
}

export function ExpenseCard({ expense, onEdit, onDelete, currentUserId }: ExpenseCardProps) {
  const isOwner = currentUserId === expense.userId
  const formattedAmount = `${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TZS`

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY')
  }

  const isToday = dayjs(expense.date).isSame(dayjs(), 'day')
  const isYesterday = dayjs(expense.date).isSame(dayjs().subtract(1, 'day'), 'day')

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        borderRadius: 2,
        bgcolor: isOwner ? (theme) => alpha(theme.palette.primary.main, 0.03) : 'background.paper',
        border: '1px solid',
        borderColor: isOwner ? 'primary.light' : 'divider',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          borderColor: 'primary.main',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Amount and Purpose */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 700,
                color: 'primary.main',
                fontSize: { xs: '1.1rem', sm: '1.3rem' },
                letterSpacing: '-0.02em',
              }}
            >
              {formattedAmount}
            </Typography>
            <Chip
              label={expense.purpose}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                bgcolor: (theme) => alpha(theme.palette.secondary.main, 0.1),
                color: 'secondary.dark',
              }}
            />
          </Box>

          {/* Description if exists */}
          {expense.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 1.5,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                wordBreak: 'break-word',
                fontStyle: 'italic',
                pl: 1,
                borderLeft: '2px solid',
                borderColor: 'divider',
              }}
            >
              {expense.description}
            </Typography>
          )}

          {/* Meta info */}
          <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2.5 }, flexWrap: 'wrap', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {isToday ? 'Today' : isYesterday ? 'Yesterday' : formatDate(expense.date)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PersonIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {expense.userName}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">
                {dayjs(expense.createdAt).format('HH:mm')}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Actions */}
        {isOwner && (
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            {onEdit && (
              <Tooltip title="Edit expense" arrow>
                <IconButton
                  size="small"
                  onClick={() => onEdit(expense)}
                  sx={{
                    bgcolor: 'primary.lighter',
                    color: 'primary.main',
                    '&:hover': { bgcolor: 'primary.light' },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Delete expense" arrow>
                <IconButton
                  size="small"
                  onClick={() => onDelete(expense.id)}
                  sx={{
                    bgcolor: 'error.lighter',
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.light' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
