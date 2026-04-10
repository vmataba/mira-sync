import React from 'react'
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Box,
  IconButton,
  Chip,
  alpha,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import type { Scheme } from '../types'
import { estbelColors } from '../../theme'

interface SchemeCardProps {
  scheme: Scheme
  isSelected?: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
}

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export const SchemeCard = React.memo(({
  scheme,
  isSelected,
  onClick,
  onEdit,
  onDelete,
}: SchemeCardProps) => {
  const isPositive = scheme.balance >= 0

  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: 'pointer',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? scheme.color : estbelColors.border,
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: scheme.color,
          transform: 'translateY(-4px)',
          boxShadow: `0 12px 24px ${alpha(scheme.color, 0.15)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: scheme.color,
        },
      }}
    >
      <CardContent sx={{ p: 3, pt: 4 }}>
        <Stack spacing={2}>
          {/* Header */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                noWrap
                sx={{ color: estbelColors.text.primary }}
              >
                {scheme.name}
              </Typography>
              {scheme.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {scheme.description}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main', bgcolor: alpha(estbelColors.primary.main, 0.08) },
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                sx={{
                  color: 'text.secondary',
                  '&:hover': { color: 'error.main', bgcolor: alpha(estbelColors.error.main, 0.08) },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>

          {/* Balance */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(scheme.color, 0.06),
            }}
          >
            <Typography
              variant="overline"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              Current Balance
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: isPositive ? estbelColors.success.main : estbelColors.error.main,
                  letterSpacing: '-0.02em',
                }}
              >
                {isPositive ? '' : '-'}TZS {formatNumber(Math.abs(scheme.balance))}
              </Typography>
              {isPositive ? (
                <TrendingUpIcon sx={{ color: estbelColors.success.main }} />
              ) : (
                <TrendingDownIcon sx={{ color: estbelColors.error.main }} />
              )}
            </Stack>
          </Box>

          {/* Stats */}
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total In
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ color: estbelColors.success.main }}
              >
                +{formatNumber(scheme.totalIn)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Total Out
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                sx={{ color: estbelColors.error.main }}
              >
                -{formatNumber(scheme.totalOut)}
              </Typography>
            </Box>
          </Stack>

          {/* Transaction Count */}
          <Chip
            size="small"
            label={`${scheme.transactionCount} transaction${scheme.transactionCount !== 1 ? 's' : ''}`}
            sx={{
              alignSelf: 'flex-start',
              bgcolor: alpha(scheme.color, 0.1),
              color: scheme.color,
              fontWeight: 600,
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  )
})

SchemeCard.displayName = 'SchemeCard'
