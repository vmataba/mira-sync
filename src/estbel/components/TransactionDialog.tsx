import React, { useState, useEffect, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Box,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  alpha,
} from '@mui/material'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import type { TransactionFormData, Scheme, Transaction } from '../types'
import { DEFAULT_TRANSACTION_FORM } from '../types'
import { estbelColors } from '../../theme'
import { formatInputValue, parseFormattedNumber } from '../../utils/currency'

interface TransactionDialogProps {
  open: boolean
  schemes: Scheme[]
  defaultSchemeId?: string
  editingTransaction?: Transaction | null
  onClose: () => void
  onSave: (data: TransactionFormData) => Promise<void>
}

export const TransactionDialog = React.memo(({
  open,
  schemes,
  defaultSchemeId,
  editingTransaction,
  onClose,
  onSave,
}: TransactionDialogProps) => {
  const [form, setForm] = useState<TransactionFormData>(DEFAULT_TRANSACTION_FORM)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingTransaction) {
      setForm({
        type: editingTransaction.type,
        unitPrice: formatInputValue(editingTransaction.unitPrice.toString()),
        quantity: editingTransaction.quantity.toString(),
        date: editingTransaction.date,
        description: editingTransaction.description,
        schemeId: editingTransaction.schemeId,
      })
    } else {
      setForm({
        ...DEFAULT_TRANSACTION_FORM,
        schemeId: defaultSchemeId || schemes[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
      })
    }
  }, [editingTransaction, defaultSchemeId, schemes, open])

  const computedTotal = useMemo(() => {
    const unitPrice = parseFormattedNumber(form.unitPrice)
    const quantity = parseFloat(form.quantity) || 1
    return unitPrice * quantity
  }, [form.unitPrice, form.quantity])

  const handleSave = async () => {
    if (!form.schemeId || !form.unitPrice) return
    
    setLoading(true)
    try {
      await onSave(form)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      onClose()
    }
  }

  const handleUnitPriceChange = (value: string) => {
    setForm({ ...form, unitPrice: formatInputValue(value) })
  }

  const isIn = form.type === 'in'
  const typeColor = isIn ? estbelColors.success.main : estbelColors.error.main

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {editingTransaction
            ? 'Update the transaction details'
            : 'Record a new cash flow entry'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={3}>
          {/* Transaction Type */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Transaction Type
            </Typography>
            <ToggleButtonGroup
              value={form.type}
              exclusive
              onChange={(_, value) => value && setForm({ ...form, type: value })}
              fullWidth
              sx={{
                '& .MuiToggleButton-root': {
                  py: 1.5,
                  fontWeight: 600,
                  borderRadius: 2,
                  '&.Mui-selected': {
                    color: 'white',
                  },
                },
              }}
            >
              <ToggleButton
                value="in"
                sx={{
                  '&.Mui-selected': {
                    bgcolor: estbelColors.success.main,
                    '&:hover': { bgcolor: estbelColors.success.dark },
                  },
                }}
              >
                <ArrowDownwardIcon sx={{ mr: 1 }} />
                Cash In
              </ToggleButton>
              <ToggleButton
                value="out"
                sx={{
                  '&.Mui-selected': {
                    bgcolor: estbelColors.error.main,
                    '&:hover': { bgcolor: estbelColors.error.dark },
                  },
                }}
              >
                <ArrowUpwardIcon sx={{ mr: 1 }} />
                Cash Out
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Scheme Selection */}
          <FormControl fullWidth>
            <InputLabel>Scheme</InputLabel>
            <Select
              value={form.schemeId}
              label="Scheme"
              onChange={(e) => setForm({ ...form, schemeId: e.target.value })}
            >
              {schemes.map((scheme) => (
                <MenuItem key={scheme.id} value={scheme.id}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: scheme.color,
                      }}
                    />
                    <span>{scheme.name}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Amount Fields */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Unit Price (TZS)"
              value={form.unitPrice}
              onChange={(e) => handleUnitPriceChange(e.target.value)}
              fullWidth
              required
              placeholder="0"
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              label="Quantity"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              sx={{ width: 120 }}
              type="number"
              inputProps={{ min: 1, step: 1 }}
            />
          </Stack>

          {/* Date */}
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          {/* Description */}
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="What is this transaction for?"
            inputProps={{ maxLength: 200 }}
          />

          {/* Total Preview */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              bgcolor: alpha(typeColor, 0.08),
              borderLeft: `4px solid ${typeColor}`,
            }}
          >
            <Typography variant="overline" color="text.secondary" fontWeight={600}>
              TOTAL AMOUNT
            </Typography>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: typeColor, mt: 0.5 }}
            >
              {isIn ? '+' : '-'}TZS {computedTotal.toLocaleString('en-US')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {parseFormattedNumber(form.unitPrice).toLocaleString('en-US')} × {form.quantity || 1}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 2 }}>
        <Button onClick={handleClose} disabled={loading} size="large">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!form.schemeId || !form.unitPrice || loading}
          size="large"
          sx={{
            bgcolor: typeColor,
            '&:hover': {
              bgcolor: isIn ? estbelColors.success.dark : estbelColors.error.dark,
            },
          }}
        >
          {loading ? 'Saving...' : editingTransaction ? 'Update' : isIn ? 'Record Cash In' : 'Record Cash Out'}
        </Button>
      </DialogActions>
    </Dialog>
  )
})

TransactionDialog.displayName = 'TransactionDialog'
