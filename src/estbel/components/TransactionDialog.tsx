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
        sx: { borderRadius: 3, m: { xs: 1, sm: 2 } },
      }}
    >
      <DialogTitle sx={{ pb: 1, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          {editingTransaction ? 'Edit Transaction' : 'New Transaction'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          {/* Transaction Type - compact */}
          <ToggleButtonGroup
            value={form.type}
            exclusive
            onChange={(_, value) => value && setForm({ ...form, type: value })}
            fullWidth
            size="small"
            sx={{
              '& .MuiToggleButton-root': {
                py: 1,
                fontWeight: 600,
                fontSize: '0.8rem',
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
              <ArrowDownwardIcon sx={{ mr: 0.5, fontSize: 18 }} />
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
              <ArrowUpwardIcon sx={{ mr: 0.5, fontSize: 18 }} />
              Cash Out
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Scheme Selection - compact */}
          <FormControl fullWidth size="small">
            <InputLabel>Scheme</InputLabel>
            <Select
              value={form.schemeId}
              label="Scheme"
              onChange={(e) => setForm({ ...form, schemeId: e.target.value })}
            >
              {schemes.map((scheme) => (
                <MenuItem key={scheme.id} value={scheme.id}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: scheme.color,
                      }}
                    />
                    <span style={{ fontSize: '0.875rem' }}>{scheme.name}</span>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Amount Fields - compact */}
          <Stack direction="row" spacing={1.5}>
            <TextField
              label="Unit Price (TZS)"
              value={form.unitPrice}
              onChange={(e) => handleUnitPriceChange(e.target.value)}
              fullWidth
              required
              placeholder="0"
              size="small"
              inputProps={{ inputMode: 'numeric' }}
            />
            <TextField
              label="Qty"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              sx={{ width: 80 }}
              size="small"
              type="number"
              inputProps={{ min: 1, step: 1 }}
            />
          </Stack>

          {/* Date - styled */}
          <TextField
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            sx={{
              '& .MuiInputBase-root': {
                borderRadius: 1.5,
                bgcolor: alpha(typeColor, 0.04),
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: alpha(typeColor, 0.2),
              },
              '& input[type="date"]::-webkit-calendar-picker-indicator': {
                cursor: 'pointer',
                opacity: 0.7,
                '&:hover': { opacity: 1 },
              },
            }}
          />

          {/* Description - compact */}
          <TextField
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            size="small"
            multiline
            rows={2}
            placeholder="What is this for?"
            inputProps={{ maxLength: 200 }}
          />

          {/* Total Preview - compact */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(typeColor, 0.08),
              borderLeft: `3px solid ${typeColor}`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontWeight={600}
                  sx={{ fontSize: '0.65rem' }}
                >
                  TOTAL
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {parseFormattedNumber(form.unitPrice).toLocaleString('en-US')} × {form.quantity || 1}
                </Typography>
              </Box>
              <Typography
                fontWeight={700}
                sx={{ color: typeColor, fontSize: '1.25rem' }}
              >
                {isIn ? '+' : '-'}TZS {computedTotal.toLocaleString('en-US')}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: { xs: 2, sm: 3 } }}>
        <Button onClick={handleClose} disabled={loading} size="small">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!form.schemeId || !form.unitPrice || loading}
          size="small"
          sx={{
            bgcolor: typeColor,
            px: 2,
            '&:hover': {
              bgcolor: isIn ? estbelColors.success.dark : estbelColors.error.dark,
            },
          }}
        >
          {loading ? 'Saving...' : editingTransaction ? 'Update' : isIn ? 'Record In' : 'Record Out'}
        </Button>
      </DialogActions>
    </Dialog>
  )
})

TransactionDialog.displayName = 'TransactionDialog'
