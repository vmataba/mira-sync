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
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import type { Transaction, Scheme } from '../types'
import { estbelColors } from '../../theme'

interface TransactionCardProps {
  transaction: Transaction
  scheme?: Scheme
  onEdit: () => void
  onDelete: () => void
}

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export const TransactionCard = React.memo(({
  transaction,
  scheme,
  onEdit,
  onDelete,
}: TransactionCardProps) => {
  const isIn = transaction.type === 'in'
  const typeColor = isIn ? estbelColors.success.main : estbelColors.error.main
  const typeBgColor = isIn ? estbelColors.success.light : estbelColors.error.light

  return (
    <Card
      sx={{
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: `0 8px 24px ${alpha(typeColor, 0.15)}`,
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          bgcolor: typeColor,
        },
      }}
    >
      <CardContent sx={{ p: 2.5, pl: 3 }}>
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          {/* Type Icon */}
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              bgcolor: alpha(typeColor, 0.1),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            {isIn ? (
              <ArrowDownwardIcon sx={{ color: typeColor, fontSize: 24 }} />
            ) : (
              <ArrowUpwardIcon sx={{ color: typeColor, fontSize: 24 }} />
            )}
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  fontWeight={600}
                  sx={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {transaction.description || (isIn ? 'Cash In' : 'Cash Out')}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(transaction.date)}
                  </Typography>
                  {scheme && (
                    <>
                      <Box
                        sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          bgcolor: 'text.disabled',
                        }}
                      />
                      <Chip
                        size="small"
                        label={scheme.name}
                        sx={{
                          height: 20,
                          fontSize: '0.6875rem',
                          bgcolor: alpha(scheme.color, 0.1),
                          color: scheme.color,
                          fontWeight: 600,
                        }}
                      />
                    </>
                  )}
                </Stack>
              </Box>

              {/* Actions */}
              <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                <IconButton
                  size="small"
                  onClick={onEdit}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={onDelete}
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'error.main' },
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>

            {/* Amount Details */}
            <Stack
              direction="row"
              spacing={3}
              sx={{
                mt: 1.5,
                pt: 1.5,
                borderTop: `1px solid ${estbelColors.divider}`,
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Unit Price
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  TZS {formatNumber(transaction.unitPrice)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Quantity
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {transaction.quantity}
                </Typography>
              </Box>
              <Box sx={{ flex: 1, textAlign: 'right' }}>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: typeColor }}
                >
                  {isIn ? '+' : '-'}TZS {formatNumber(transaction.total)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
})

TransactionCard.displayName = 'TransactionCard'
