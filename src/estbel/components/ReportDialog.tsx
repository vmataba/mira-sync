import React, { useState, useMemo } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Box,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  Divider,
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ShareIcon from '@mui/icons-material/Share'
import DateRangeIcon from '@mui/icons-material/DateRange'
import type { Scheme, Transaction, DateRange } from '../types'
import { estbelColors } from '../../theme'
import type { DurationPreset } from '../utils/formatters'
import { 
  getDateRangeForPreset,
  formatAbbreviated,
  formatDate,
} from '../utils/formatters'
import { downloadPDF, shareViaWhatsApp } from '../utils/pdfReport'

interface ReportDialogProps {
  open: boolean
  scheme: Scheme
  transactions: Transaction[]
  generatedBy: string
  onClose: () => void
  onSuccess: (message: string) => void
}

const DURATION_PRESETS: { value: DurationPreset; label: string; icon?: React.ReactNode }[] = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this_week', label: 'This Week' },
  { value: 'last_week', label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom', label: 'Custom' },
]

export const ReportDialog = React.memo(({
  open,
  scheme,
  transactions,
  generatedBy,
  onClose,
  onSuccess,
}: ReportDialogProps) => {
  const [selectedPreset, setSelectedPreset] = useState<DurationPreset>('this_month')
  const [customRange, setCustomRange] = useState<DateRange>({ startDate: null, endDate: null })
  const [loading, setLoading] = useState(false)

  // Get effective date range
  const dateRange = useMemo(() => {
    if (selectedPreset === 'custom') {
      return customRange
    }
    const range = getDateRangeForPreset(selectedPreset)
    return { startDate: range.startDate, endDate: range.endDate }
  }, [selectedPreset, customRange])

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      if (dateRange.startDate && tx.date < dateRange.startDate) return false
      if (dateRange.endDate && tx.date > dateRange.endDate) return false
      return true
    })
  }, [transactions, dateRange])

  // Calculate summary
  const summary = useMemo(() => {
    return filteredTransactions.reduce(
      (acc, tx) => {
        if (tx.type === 'in') {
          acc.totalIn += tx.total
        } else {
          acc.totalOut += tx.total
        }
        return acc
      },
      { totalIn: 0, totalOut: 0 }
    )
  }, [filteredTransactions])

  const handleDownload = async () => {
    setLoading(true)
    try {
      downloadPDF({
        scheme,
        transactions: filteredTransactions,
        dateRange,
        generatedBy,
      })
      onSuccess('PDF downloaded successfully')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handleShare = async () => {
    setLoading(true)
    try {
      await shareViaWhatsApp({
        scheme,
        transactions: filteredTransactions,
        dateRange,
        generatedBy,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const handlePresetChange = (_: React.MouseEvent<HTMLElement>, value: DurationPreset | null) => {
    if (value) {
      setSelectedPreset(value)
      if (value !== 'custom') {
        setCustomRange({ startDate: null, endDate: null })
      }
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, m: { xs: 1, sm: 2 } },
      }}
    >
      <DialogTitle sx={{ pb: 1, px: { xs: 2, sm: 3 } }}>
        <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Generate Report
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {scheme.name} • Select duration
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2.5}>
          {/* Duration Presets */}
          <Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mb: 1, display: 'block', fontSize: '0.75rem' }}
            >
              Duration
            </Typography>
            <ToggleButtonGroup
              value={selectedPreset}
              exclusive
              onChange={handlePresetChange}
              size="small"
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 0.5,
                '& .MuiToggleButton-root': {
                  border: `1px solid ${estbelColors.border}`,
                  borderRadius: '8px !important',
                  px: 1.5,
                  py: 0.5,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    bgcolor: alpha(scheme.color, 0.1),
                    color: scheme.color,
                    borderColor: scheme.color,
                    '&:hover': {
                      bgcolor: alpha(scheme.color, 0.15),
                    },
                  },
                },
              }}
            >
              {DURATION_PRESETS.map((preset) => (
                <ToggleButton key={preset.value} value={preset.value}>
                  {preset.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {/* Custom Date Range */}
          {selectedPreset === 'custom' && (
            <Stack direction="row" spacing={1} alignItems="center">
              <TextField
                type="date"
                size="small"
                label="From"
                value={customRange.startDate || ''}
                onChange={(e) => setCustomRange({ ...customRange, startDate: e.target.value || null })}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  flex: 1,
                  '& .MuiInputBase-root': { 
                    fontSize: '0.8rem',
                    borderRadius: 1.5,
                    bgcolor: alpha(scheme.color, 0.04),
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(scheme.color, 0.3),
                  },
                  '& input[type="date"]::-webkit-calendar-picker-indicator': {
                    cursor: 'pointer',
                    opacity: 0.7,
                    '&:hover': { opacity: 1 },
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">—</Typography>
              <TextField
                type="date"
                size="small"
                label="To"
                value={customRange.endDate || ''}
                onChange={(e) => setCustomRange({ ...customRange, endDate: e.target.value || null })}
                InputLabelProps={{ shrink: true }}
                sx={{ 
                  flex: 1,
                  '& .MuiInputBase-root': { 
                    fontSize: '0.8rem',
                    borderRadius: 1.5,
                    bgcolor: alpha(scheme.color, 0.04),
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(scheme.color, 0.3),
                  },
                  '& input[type="date"]::-webkit-calendar-picker-indicator': {
                    cursor: 'pointer',
                    opacity: 0.7,
                    '&:hover': { opacity: 1 },
                  },
                }}
              />
            </Stack>
          )}

          <Divider />

          {/* Report Preview */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(scheme.color, 0.05),
              border: `1px solid ${alpha(scheme.color, 0.2)}`,
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ fontSize: '0.65rem', mb: 1.5, display: 'block' }}
            >
              REPORT PREVIEW
            </Typography>
            
            <Stack spacing={1.5}>
              {/* Date Range Display */}
              <Stack direction="row" alignItems="center" spacing={1}>
                <DateRangeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" fontWeight={500}>
                  {dateRange.startDate && dateRange.endDate ? (
                    dateRange.startDate === dateRange.endDate 
                      ? formatDate(dateRange.startDate)
                      : `${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`
                  ) : (
                    'All time'
                  )}
                </Typography>
              </Stack>

              {/* Summary Stats */}
              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    Transactions
                  </Typography>
                  <Typography fontWeight={700} sx={{ fontSize: '1rem' }}>
                    {filteredTransactions.length}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    Total In
                  </Typography>
                  <Typography fontWeight={700} sx={{ fontSize: '1rem', color: estbelColors.success.main }}>
                    +{formatAbbreviated(summary.totalIn)}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                    Total Out
                  </Typography>
                  <Typography fontWeight={700} sx={{ fontSize: '1rem', color: estbelColors.error.main }}>
                    -{formatAbbreviated(summary.totalOut)}
                  </Typography>
                </Box>
              </Stack>

              {/* Net */}
              <Box 
                sx={{ 
                  pt: 1.5, 
                  mt: 0.5, 
                  borderTop: `1px dashed ${estbelColors.border}` 
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">
                    Net Balance
                  </Typography>
                  <Typography 
                    fontWeight={700} 
                    sx={{ 
                      fontSize: '1.1rem',
                      color: summary.totalIn - summary.totalOut >= 0 
                        ? estbelColors.success.main 
                        : estbelColors.error.main,
                    }}
                  >
                    TZS {formatAbbreviated(summary.totalIn - summary.totalOut)}
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>

          {filteredTransactions.length === 0 && (
            <Typography 
              variant="body2" 
              color="warning.main" 
              textAlign="center"
              sx={{ py: 1 }}
            >
              No transactions found for this period
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ p: 2, px: { xs: 2, sm: 3 }, gap: 1 }}>
        <Button onClick={onClose} disabled={loading} size="small">
          Cancel
        </Button>
        <Button
          onClick={handleShare}
          variant="outlined"
          disabled={loading || filteredTransactions.length === 0}
          size="small"
          startIcon={<ShareIcon sx={{ fontSize: 16 }} />}
          sx={{ borderColor: scheme.color, color: scheme.color }}
        >
          WhatsApp
        </Button>
        <Button
          onClick={handleDownload}
          variant="contained"
          disabled={loading || filteredTransactions.length === 0}
          size="small"
          startIcon={<PictureAsPdfIcon sx={{ fontSize: 16 }} />}
          sx={{ bgcolor: scheme.color }}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  )
})

ReportDialog.displayName = 'ReportDialog'
