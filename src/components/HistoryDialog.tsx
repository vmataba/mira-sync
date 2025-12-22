import React from 'react'
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
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import type { HistoryEntry } from '../models'
import { formatAbbreviated } from '../utils/currency'

interface HistoryDialogProps {
  open: boolean
  onClose: () => void
  title: string
  history: HistoryEntry[]
  type: 'progress' | 'invested'
}

export const HistoryDialog: React.FC<HistoryDialogProps> = ({
  open,
  onClose,
  title,
  history,
  type,
}) => {
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
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
              return (
                <ListItem
                  key={index}
                  sx={{
                    borderBottom: index < sortedHistory.length - 1 ? '1px solid' : 'none',
                    borderColor: 'divider',
                    py: 2,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
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
                      <Box sx={{ mt: 0.5 }}>
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
