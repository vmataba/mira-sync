import {
  Typography,
  IconButton,
  Box,
  Divider,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import dayjs from 'dayjs'
import type { Expense } from '../models'

interface ExpenseCardProps {
  expense: Expense
  onEdit?: (expense: Expense) => void
  onDelete?: (expenseId: string) => void
  currentUserId?: string
  isLast?: boolean
}

export function ExpenseCard({ expense, onEdit, onDelete, currentUserId, isLast = false }: ExpenseCardProps) {
  const isOwner = currentUserId === expense.userId
  const formattedAmount = `${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TZS`

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('MMM DD, YYYY')
  }

  return (
    <>
      <Box sx={{ py: { xs: 1.5, sm: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1, gap: 1 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'baseline', 
              gap: { xs: 1, sm: 2 }, 
              mb: 0.5,
              flexWrap: 'wrap'
            }}>
              <Typography 
                variant="h6" 
                component="div" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: 'primary.main',
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                {formattedAmount}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {formatDate(expense.date)}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              color="text.primary" 
              sx={{ 
                mb: 1,
                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                wordBreak: 'break-word'
              }}
            >
              {expense.purpose}
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 1, sm: 2 },
              flexWrap: 'wrap'
            }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                By {expense.userName}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {dayjs(expense.createdAt).format('MMM DD, YYYY HH:mm')}
              </Typography>
            </Box>
          </Box>
          {isOwner && (
            <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
              {onEdit && (
                <IconButton size="small" onClick={() => onEdit(expense)} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {onDelete && (
                <IconButton size="small" onClick={() => onDelete(expense.id)} color="error">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </Box>
      </Box>
      {!isLast && <Divider />}
    </>
  )
}
