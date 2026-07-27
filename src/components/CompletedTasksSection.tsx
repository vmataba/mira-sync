import React, { useState } from 'react'
import {
  Box,
  Chip,
  Collapse,
  IconButton,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

interface CompletedTasksSectionProps {
  count: number
  children: React.ReactNode
}

export const CompletedTasksSection: React.FC<CompletedTasksSectionProps> = ({
  count,
  children,
}) => {
  const [expanded, setExpanded] = useState(false)

  if (count === 0) return null

  return (
    <Box>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          cursor: 'pointer',
          py: 1.5,
          px: 2,
          borderRadius: 2,
          bgcolor: expanded ? 'rgba(46, 125, 50, 0.04)' : 'background.paper',
          border: '1px solid',
          borderColor: expanded ? 'success.light' : 'divider',
          transition: 'all 200ms ease',
          userSelect: 'none',
          '&:hover': {
            bgcolor: 'rgba(46, 125, 50, 0.04)',
            borderColor: 'success.light',
          },
        }}
      >
        <CheckCircleIcon sx={{ color: 'success.main', fontSize: 22 }} />
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'success.main', flex: 1, fontSize: '1rem' }}>
          Completed & Resolved
        </Typography>
        <Chip
          size="small"
          label={count}
          sx={{ fontWeight: 700, bgcolor: 'success.main', color: 'white', minWidth: 32 }}
        />
        <IconButton size="small" sx={{ color: 'text.secondary' }}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  )
}
