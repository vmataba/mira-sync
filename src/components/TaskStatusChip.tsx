import React from 'react'
import { Chip } from '@mui/material'
import FiberNewIcon from '@mui/icons-material/FiberNew'
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import type { TaskStatus } from '../models'

const statusConfig: Record<TaskStatus, { label: string; color: string; bgcolor: string; icon: React.ReactElement }> = {
  new: {
    label: 'New',
    color: '#1565c0',
    bgcolor: '#e3f2fd',
    icon: <FiberNewIcon sx={{ fontSize: 16 }} />,
  },
  pending: {
    label: 'Pending',
    color: '#e65100',
    bgcolor: '#fff3e0',
    icon: <HourglassEmptyIcon sx={{ fontSize: 16 }} />,
  },
  in_progress: {
    label: 'In Progress',
    color: '#6a1b9a',
    bgcolor: '#f3e5f5',
    icon: <PlayCircleOutlineIcon sx={{ fontSize: 16 }} />,
  },
  completed: {
    label: 'Completed',
    color: '#2e7d32',
    bgcolor: '#e8f5e9',
    icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
  },
  discarded: {
    label: 'Discarded',
    color: '#616161',
    bgcolor: '#f5f5f5',
    icon: <CancelIcon sx={{ fontSize: 16 }} />,
  },
}

interface TaskStatusChipProps {
  status: TaskStatus
}

export const TaskStatusChip: React.FC<TaskStatusChipProps> = ({ status }) => {
  const config = statusConfig[status]

  return (
    <Chip
      size="small"
      icon={config.icon}
      label={config.label}
      sx={{
        color: config.color,
        bgcolor: config.bgcolor,
        fontWeight: 600,
        '& .MuiChip-icon': {
          color: config.color,
        },
      }}
    />
  )
}
