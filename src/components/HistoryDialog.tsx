import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Chip,
  Button,
  Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import DeleteIcon from '@mui/icons-material/Delete'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import type { HistoryEntry } from '../models'
import { formatAbbreviated } from '../utils/currency'

interface HistoryDialogProps {
  open: boolean
  onClose: () => void
  title: string
  history: HistoryEntry[]
  type: 'progress' | 'invested'
  onDeleteEntry?: (index: number) => void
  onClearHistory?: () => void
}

export const HistoryDialog: React.FC<HistoryDialogProps> = ({
  open,
  onClose,
  title,
  history,
  type,
  onDeleteEntry,
  onClearHistory,
}) => {
  const [confirmClear, setConfirmClear] = useState(false)
  
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
  
  const getOriginalIndex = (sortedIndex: number) => {
    const entry = sortedHistory[sortedIndex]
    return history.findIndex(h => h.timestamp === entry.timestamp && h.value === entry.value)
  }

  const formatValue = (value: number) => {
    if (type === 'progress') {
      return `${value}%`
    }
    return `${formatAbbreviated(value)} TZS`
  }

  const getTrend = (index: number) => {
    if (index >= sortedHistory.length - 1) return null
    const current = sortedHistory[index].value
    const previous = sortedHistory[index + 1].value
    return current > previous ? 'up' : current < previous ? 'down' : 'same'
  }

  const handleClearHistory = () => {
    if (confirmClear && onClearHistory) {
      onClearHistory()
      setConfirmClear(false)
    } else {
      setConfirmClear(true)
    }
  }

  return (
    <Dialog open={open} onClose={() => { onClose(); setConfirmClear(false) }} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {onClearHistory && sortedHistory.length > 0 && (
              <Tooltip title={confirmClear ? 'Click again to confirm' : 'Clear all history'} arrow>
                <Button
                  size="small"
                  color={confirmClear ? 'error' : 'inherit'}
                  variant={confirmClear ? 'contained' : 'text'}
                  startIcon={<DeleteSweepIcon />}
                  onClick={handleClearHistory}
                  sx={{ 
                    minWidth: 'auto',
                    fontSize: '0.75rem',
                  }}
                >
                  {confirmClear ? 'Confirm' : 'Clear'}
                </Button>
              </Tooltip>
            )}
            <IconButton onClick={() => { onClose(); setConfirmClear(false) }} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {sortedHistory.length === 0 ? (
          <Typography color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
            No history available
          </Typography>
        ) : (
          <List sx={{ p: 0 }}>
            {sortedHistory.map((entry, index) => {
              const trend = getTrend(index)
              const originalIndex = getOriginalIndex(index)
              return (
                <ListItem
                  key={index}
                  sx={{
                    borderBottom: index < sortedHistory.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    py: 2,
                  }}
                  secondaryAction={
                    onDeleteEntry && (
                      <Tooltip title="Delete this entry" arrow>
                        <IconButton
                          edge="end"
                          size="small"
                          onClick={() => onDeleteEntry(originalIndex)}
                          sx={{
                            color: 'text.secondary',
                            '&:hover': {
                              color: 'error.main',
                              bgcolor: 'error.lighter',
                            },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', pr: onDeleteEntry ? 4 : 0 }}>
                        <Typography variant="body1" fontWeight={600}>
                          {formatValue(entry.value)}
                        </Typography>
                        {trend === 'up' && (
                          <TrendingUpIcon fontSize="small" sx={{ color: 'success.main' }} />
                        )}
                        {trend === 'down' && (
                          <TrendingDownIcon fontSize="small" sx={{ color: 'error.main' }} />
                        )}
                        {entry.note && (
                          <Chip
                            label={entry.note.split(' - ')[0]}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 0.5, pr: onDeleteEntry ? 4 : 0 }}>
                        {entry.note && entry.note.includes(' - ') && (
                          <Typography 
                            variant="body2" 
                            color="text.primary"
                            sx={{ 
                              mb: 1,
                              p: 1,
                              bgcolor: 'grey.50',
                              borderRadius: 1,
                              borderLeft: '3px solid',
                              borderColor: 'primary.main',
                            }}
                          >
                            {entry.note.split(' - ').slice(1).join(' - ')}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {new Date(entry.timestamp).toLocaleString()}
                        </Typography>
                        {entry.changedBy && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                            by {entry.changedBy}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
              )
            })}
          </List>
        )}
      </DialogContent>
    </Dialog>
  )
}
