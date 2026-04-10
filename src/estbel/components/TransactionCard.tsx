import React, { useState } from 'react'
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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import type { Transaction, Scheme } from '../types'
import { estbelColors } from '../../theme'
import { formatAbbreviated, formatNumber, formatDateShort } from '../utils/formatters'

interface TransactionCardProps {
  transaction: Transaction
  scheme?: Scheme
  onEdit: () => void
  onDelete: () => void
}

export const TransactionCard = React.memo(({
  transaction,
  scheme,
  onEdit,
  onDelete,
}: TransactionCardProps) => {
  const [expanded, setExpanded] = useState(false)
  const isIn = transaction.type === 'in'
  const typeColor = isIn ? estbelColors.success.main : estbelColors.error.main
  
  const description = transaction.description || (isIn ? 'Cash In' : 'Cash Out')
  const isLongDescription = description.length > 40
  const displayDescription = isLongDescription && !expanded 
    ? `${description.slice(0, 40).trim()}...` 
    : description

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 4px 16px ${alpha(typeColor, 0.12)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          bgcolor: typeColor,
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1.5, sm: 2 }, pl: { xs: 2, sm: 2.5 } }}>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          {/* Type Icon - smaller on mobile */}
          <Box
            sx={{
              width: { xs: 36, sm: 40 },
              height: { xs: 36, sm: 40 },
              borderRadius: 1.5,
              bgcolor: alpha(typeColor, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isIn ? (
              <ArrowDownwardIcon sx={{ color: typeColor, fontSize: { xs: 18, sm: 22 } }} />
            ) : (
              <ArrowUpwardIcon sx={{ color: typeColor, fontSize: { xs: 18, sm: 22 } }} />
            )}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Header row with amount and actions */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {/* Amount - prominent */}
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ 
                    color: typeColor,
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    lineHeight: 1.2,
                  }}
                >
                  {isIn ? '+' : '-'}TZS {formatAbbreviated(transaction.total)}
                </Typography>
                {/* Date */}
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  {formatDateShort(transaction.date)}
                </Typography>
              </Box>

              {/* Actions - compact */}
              <Stack direction="row" spacing={0}>
                <IconButton
                  size="small"
                  onClick={onEdit}
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
                  onClick={onDelete}
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

            {/* Description with expand */}
            <Box sx={{ mt: 0.5 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  lineHeight: 1.4,
                  cursor: isLongDescription ? 'pointer' : 'default',
                }}
                onClick={() => isLongDescription && setExpanded(!expanded)}
              >
                {displayDescription}
                {isLongDescription && (
                  <Typography
                    component="span"
                    sx={{
                      color: 'primary.main',
                      fontSize: 'inherit',
                      ml: 0.5,
                      fontWeight: 500,
                    }}
                  >
                    {expanded ? 'less' : 'more'}
                  </Typography>
                )}
              </Typography>
            </Box>

            {/* Compact details row */}
            <Stack 
              direction="row" 
              spacing={1.5} 
              alignItems="center"
              sx={{ mt: 1, flexWrap: 'wrap', gap: 0.5 }}
            >
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
              >
                {formatNumber(transaction.unitPrice)} × {transaction.quantity}
              </Typography>
              {scheme && (
                <Chip
                  size="small"
                  label={scheme.name}
                  sx={{
                    height: 18,
                    fontSize: '0.65rem',
                    bgcolor: alpha(scheme.color, 0.1),
                    color: scheme.color,
                    fontWeight: 600,
                    '& .MuiChip-label': { px: 1 },
                  }}
                />
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
})

TransactionCard.displayName = 'TransactionCard'
