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
import { formatAbbreviated } from '../utils/formatters'

interface SchemeCardProps {
  scheme: Scheme
  isSelected?: boolean
  onClick: () => void
  onEdit: () => void
  onDelete: () => void
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
        transition: 'all 0.2s ease-out',
        '&:hover': {
          borderColor: scheme.color,
          transform: 'translateY(-2px)',
          boxShadow: `0 8px 16px ${alpha(scheme.color, 0.12)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: scheme.color,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pt: { xs: 2.5, sm: 3 } }}>
        <Stack spacing={1.5}>
          {/* Header - compact */}
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                fontWeight={700}
                noWrap
                sx={{ 
                  color: estbelColors.text.primary,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                }}
              >
                {scheme.name}
              </Typography>
              {scheme.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  }}
                >
                  {scheme.description}
                </Typography>
              )}
            </Box>
            <Stack direction="row" spacing={0}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
                sx={{
                  p: 0.5,
                  color: 'text.disabled',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                <EditIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                sx={{
                  p: 0.5,
                  color: 'text.disabled',
                  '&:hover': { color: 'error.main' },
                }}
              >
                <DeleteIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />
              </IconButton>
            </Stack>
          </Stack>

          {/* Balance */}
          <Box
            sx={{
              p: { xs: 1.5, sm: 2 },
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
                fontSize: { xs: '0.6rem', sm: '0.65rem' },
              }}
            >
              Balance
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography
                sx={{
                  fontWeight: 700,
                  color: isPositive ? estbelColors.success.main : estbelColors.error.main,
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                }}
              >
                {isPositive ? '' : '-'}TZS {formatAbbreviated(Math.abs(scheme.balance))}
              </Typography>
              {isPositive ? (
                <TrendingUpIcon sx={{ color: estbelColors.success.main, fontSize: { xs: 18, sm: 22 } }} />
              ) : (
                <TrendingDownIcon sx={{ color: estbelColors.error.main, fontSize: { xs: 18, sm: 22 } }} />
              )}
            </Stack>
          </Box>

          {/* Stats - compact */}
          <Stack direction="row" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={500}
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              >
                In
              </Typography>
              <Typography
                fontWeight={700}
                sx={{ 
                  color: estbelColors.success.main,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                +{formatAbbreviated(scheme.totalIn)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="caption" 
                color="text.secondary" 
                fontWeight={500}
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              >
                Out
              </Typography>
              <Typography
                fontWeight={700}
                sx={{ 
                  color: estbelColors.error.main,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                }}
              >
                -{formatAbbreviated(scheme.totalOut)}
              </Typography>
            </Box>
          </Stack>

          {/* Transaction Count */}
          <Chip
            size="small"
            label={`${scheme.transactionCount} txn${scheme.transactionCount !== 1 ? 's' : ''}`}
            sx={{
              alignSelf: 'flex-start',
              height: 22,
              bgcolor: alpha(scheme.color, 0.1),
              color: scheme.color,
              fontWeight: 600,
              fontSize: '0.7rem',
            }}
          />
        </Stack>
      </CardContent>
    </Card>
  )
})

SchemeCard.displayName = 'SchemeCard'
