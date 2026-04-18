import React, { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Stack,
  Card,
  Button,
  IconButton,
  Fab,
  Grid2 as Grid,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  alpha,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  Chip,
} from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import dayjs from 'dayjs'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { SchemeCard } from './SchemeCard'
import { SchemeDialog } from './SchemeDialog'
import { TransactionCard } from './TransactionCard'
import { TransactionDialog } from './TransactionDialog'
import { ReportDialog } from './ReportDialog'
import { useSchemes, useTransactions, useSchemeSelection } from '../hooks/useEstbel'
import { formatAbbreviated } from '../utils/formatters'
import type { Scheme, Transaction, SchemeFormData, TransactionFormData } from '../types'
import { estbelColors } from '../../theme'
import type { AuthUser } from '../../auth/authService'

interface EstbelDashboardProps {
  currentUser: AuthUser
  onBack: () => void
}

export const EstbelDashboard = React.memo(({ currentUser, onBack }: EstbelDashboardProps) => {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  
  // Hooks
  const { schemes, createScheme, updateScheme, deleteScheme } = useSchemes()
  const { selectedSchemeId, selectedScheme, selectScheme } = useSchemeSelection()
  const {
    transactions,
    filteredTransactions,
    filters,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    updateFilters,
  } = useTransactions(selectedSchemeId || undefined)

  // Dialog states
  const [schemeDialogOpen, setSchemeDialogOpen] = useState(false)
  const [editingScheme, setEditingScheme] = useState<{ id: string; data: SchemeFormData } | null>(null)
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Handlers
  const handleCreateScheme = useCallback(async (data: SchemeFormData) => {
    const id = await createScheme(data, currentUser.id)
    if (id) {
      setSnackbar({ open: true, message: 'Scheme created successfully', severity: 'success' })
    } else {
      setSnackbar({ open: true, message: 'Failed to create scheme', severity: 'error' })
    }
  }, [createScheme, currentUser.id])

  const handleUpdateScheme = useCallback(async (data: SchemeFormData) => {
    if (!editingScheme) return
    const success = await updateScheme(editingScheme.id, data)
    if (success) {
      setSnackbar({ open: true, message: 'Scheme updated successfully', severity: 'success' })
    } else {
      setSnackbar({ open: true, message: 'Failed to update scheme', severity: 'error' })
    }
  }, [editingScheme, updateScheme])

  const handleDeleteScheme = useCallback(async (scheme: Scheme) => {
    if (!window.confirm(`Delete "${scheme.name}"? This will also delete all transactions.`)) return
    const success = await deleteScheme(scheme.id)
    if (success) {
      setSnackbar({ open: true, message: 'Scheme deleted successfully', severity: 'success' })
      if (selectedSchemeId === scheme.id) {
        selectScheme(null)
      }
    } else {
      setSnackbar({ open: true, message: 'Failed to delete scheme', severity: 'error' })
    }
  }, [deleteScheme, selectedSchemeId, selectScheme])

  const handleCreateTransaction = useCallback(async (data: TransactionFormData) => {
    const id = await createTransaction(data, currentUser.id, currentUser.name)
    if (id) {
      setSnackbar({ open: true, message: 'Transaction recorded successfully', severity: 'success' })
    } else {
      setSnackbar({ open: true, message: 'Failed to record transaction', severity: 'error' })
    }
  }, [createTransaction, currentUser])

  const handleUpdateTransaction = useCallback(async (data: TransactionFormData) => {
    if (!editingTransaction) return
    const success = await updateTransaction(editingTransaction.id, data, editingTransaction.schemeId)
    if (success) {
      setSnackbar({ open: true, message: 'Transaction updated successfully', severity: 'success' })
    } else {
      setSnackbar({ open: true, message: 'Failed to update transaction', severity: 'error' })
    }
  }, [editingTransaction, updateTransaction])

  const handleDeleteTransaction = useCallback(async (tx: Transaction) => {
    if (!window.confirm('Delete this transaction?')) return
    const success = await deleteTransaction(tx.id, tx.schemeId)
    if (success) {
      setSnackbar({ open: true, message: 'Transaction deleted successfully', severity: 'success' })
    } else {
      setSnackbar({ open: true, message: 'Failed to delete transaction', severity: 'error' })
    }
  }, [deleteTransaction])

  const handleOpenReport = useCallback(() => {
    setReportDialogOpen(true)
  }, [])

  // Scheme view
  if (!selectedSchemeId) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: estbelColors.background.default }}>
        {/* Header */}
        <Box
          sx={{
            bgcolor: estbelColors.background.paper,
            borderBottom: `1px solid ${estbelColors.border}`,
            px: { xs: 2, sm: 3 },
            py: { xs: 1.5, sm: 2 },
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton 
              onClick={onBack} 
              size="small"
              sx={{ color: estbelColors.text.primary }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                fontWeight={700}
                sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
              >
                Estbel
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Select a scheme to view analytics
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingScheme(null)
                setSchemeDialogOpen(true)
              }}
              size="small"
              sx={{ 
                px: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              {isSmall ? 'New' : 'New Scheme'}
            </Button>
          </Stack>
        </Box>

        {/* Schemes Grid - No collective stats, just schemes */}
        <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600}
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              Your Schemes
            </Typography>
            <Chip
              size="small"
              label={`${schemes.length} scheme${schemes.length !== 1 ? 's' : ''}`}
              sx={{ 
                height: 22,
                fontSize: '0.7rem',
                bgcolor: alpha(estbelColors.primary.main, 0.1),
                color: estbelColors.primary.main,
              }}
            />
          </Stack>
          
          {schemes.length === 0 ? (
            <Card
              sx={{
                p: 4,
                textAlign: 'center',
                border: `2px dashed ${estbelColors.border}`,
                bgcolor: 'transparent',
              }}
            >
              <AccountBalanceWalletIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No schemes yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Create your first scheme to start tracking cash flow
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setEditingScheme(null)
                  setSchemeDialogOpen(true)
                }}
              >
                Create Scheme
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {schemes.map((scheme) => (
                <Grid key={scheme.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <SchemeCard
                    scheme={scheme}
                    onClick={() => selectScheme(scheme.id)}
                    onEdit={() => {
                      setEditingScheme({
                        id: scheme.id,
                        data: {
                          name: scheme.name,
                          description: scheme.description || '',
                          color: scheme.color,
                        },
                      })
                      setSchemeDialogOpen(true)
                    }}
                    onDelete={() => handleDeleteScheme(scheme)}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Dialogs */}
        <SchemeDialog
          open={schemeDialogOpen}
          editingScheme={editingScheme}
          onClose={() => {
            setSchemeDialogOpen(false)
            setEditingScheme(null)
          }}
          onSave={editingScheme ? handleUpdateScheme : handleCreateScheme}
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity={snackbar.severity} variant="filled">
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    )
  }

  // Transaction view (scheme selected)
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: estbelColors.background.default }}>
      {/* Header with scheme analytics */}
      <Box
        sx={{
          bgcolor: selectedScheme?.color || estbelColors.primary.main,
          color: 'white',
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
        }}
      >
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          <IconButton 
            onClick={() => selectScheme(null)} 
            size="small"
            sx={{ color: 'white', mt: -0.25 }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="overline" 
              sx={{ opacity: 0.8, fontSize: { xs: '0.6rem', sm: '0.65rem' } }}
            >
              SCHEME ANALYTICS
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight={700}
              noWrap
              sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
            >
              {selectedScheme?.name}
            </Typography>
          </Box>
          <Button
            onClick={handleOpenReport}
            size="small"
            variant="contained"
            startIcon={<PictureAsPdfIcon sx={{ fontSize: 16 }} />}
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)',
              color: 'white',
              fontSize: '0.75rem',
              px: 1.5,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            Report
          </Button>
        </Stack>

        {/* Analytics Cards - scheme specific */}
        <Stack 
          direction="row" 
          spacing={1} 
          sx={{ mt: 2 }}
        >
          {/* Balance */}
          <Box
            sx={{
              flex: 1,
              bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              p: { xs: 1, sm: 1.5 },
              textAlign: 'center',
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ opacity: 0.9, fontSize: { xs: '0.6rem', sm: '0.7rem' }, display: 'block' }}
            >
              Balance
            </Typography>
            <Typography 
              fontWeight={700}
              sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, mt: 0.25 }}
            >
              {formatAbbreviated(selectedScheme?.balance || 0)}
            </Typography>
          </Box>
          
          {/* Total In */}
          <Box
            sx={{
              flex: 1,
              bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              p: { xs: 1, sm: 1.5 },
              textAlign: 'center',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
              <TrendingUpIcon sx={{ fontSize: { xs: 12, sm: 14 }, opacity: 0.9 }} />
              <Typography 
                variant="caption" 
                sx={{ opacity: 0.9, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
              >
                In
              </Typography>
            </Stack>
            <Typography 
              fontWeight={700}
              sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, mt: 0.25 }}
            >
              +{formatAbbreviated(selectedScheme?.totalIn || 0)}
            </Typography>
          </Box>
          
          {/* Total Out */}
          <Box
            sx={{
              flex: 1,
              bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 2,
              p: { xs: 1, sm: 1.5 },
              textAlign: 'center',
            }}
          >
            <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
              <TrendingDownIcon sx={{ fontSize: { xs: 12, sm: 14 }, opacity: 0.9 }} />
              <Typography 
                variant="caption" 
                sx={{ opacity: 0.9, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
              >
                Out
              </Typography>
            </Stack>
            <Typography 
              fontWeight={700}
              sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, mt: 0.25 }}
            >
              -{formatAbbreviated(selectedScheme?.totalOut || 0)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Filters - compact and mobile-friendly */}
      <Box 
        sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: 1.5, 
          bgcolor: estbelColors.background.paper,
          borderBottom: `1px solid ${estbelColors.border}`,
        }}
      >
        <Stack spacing={1.5}>
          {/* Search and Type filter row */}
          <Stack direction="row" spacing={1}>
            <TextField
              size="small"
              placeholder="Search..."
              value={filters.searchQuery}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                flex: 1,
                '& .MuiInputBase-root': { 
                  height: 36,
                  fontSize: '0.875rem',
                },
              }}
            />
            <FormControl size="small" sx={{ minWidth: 90 }}>
              <Select
                value={filters.type}
                onChange={(e) => updateFilters({ type: e.target.value as 'all' | 'in' | 'out' })}
                displayEmpty
                sx={{ 
                  height: 36,
                  fontSize: '0.875rem',
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="in">In</MenuItem>
                <MenuItem value="out">Out</MenuItem>
              </Select>
            </FormControl>
          </Stack>
          
          {/* Date filters row */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack direction="row" spacing={1} alignItems="center">
              <DatePicker
                label="From"
                value={filters.dateRange.startDate ? dayjs(filters.dateRange.startDate) : null}
                onChange={(date) => updateFilters({ 
                  dateRange: { ...filters.dateRange, startDate: date ? date.format('YYYY-MM-DD') : null } 
                })}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { 
                      flex: 1,
                      '& .MuiInputBase-root': { 
                        height: 40,
                        fontSize: '0.85rem',
                        borderRadius: 2,
                      },
                    },
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary">—</Typography>
              <DatePicker
                label="To"
                value={filters.dateRange.endDate ? dayjs(filters.dateRange.endDate) : null}
                onChange={(date) => updateFilters({ 
                  dateRange: { ...filters.dateRange, endDate: date ? date.format('YYYY-MM-DD') : null } 
                })}
                format="DD/MM/YYYY"
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { 
                      flex: 1,
                      '& .MuiInputBase-root': { 
                        height: 40,
                        fontSize: '0.85rem',
                        borderRadius: 2,
                      },
                    },
                  },
                }}
              />
              {(filters.dateRange.startDate || filters.dateRange.endDate) && (
                <Button 
                  size="small" 
                  onClick={() => updateFilters({ dateRange: { startDate: null, endDate: null } })}
                  sx={{ 
                    minWidth: 'auto',
                    px: 1.5,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                  }}
                >
                  Clear
                </Button>
              )}
            </Stack>
          </LocalizationProvider>
        </Stack>
      </Box>

      {/* Transactions List */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, pb: 10 }}>
        <Typography 
          variant="caption" 
          color="text.secondary" 
          sx={{ mb: 1.5, display: 'block', fontSize: '0.75rem' }}
        >
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </Typography>

        {filteredTransactions.length === 0 ? (
          <Card
            sx={{
              p: 3,
              textAlign: 'center',
              border: `2px dashed ${estbelColors.border}`,
              bgcolor: 'transparent',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              No transactions found
            </Typography>
          </Card>
        ) : (
          <Stack spacing={1.5}>
            {filteredTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onEdit={() => {
                  setEditingTransaction(tx)
                  setTransactionDialogOpen(true)
                }}
                onDelete={() => handleDeleteTransaction(tx)}
              />
            ))}
          </Stack>
        )}
      </Box>

      {/* FAB - smaller on mobile */}
      <Fab
        color="primary"
        size={isSmall ? 'medium' : 'large'}
        onClick={() => {
          setEditingTransaction(null)
          setTransactionDialogOpen(true)
        }}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          right: { xs: 16, sm: 24 },
          bgcolor: selectedScheme?.color,
          '&:hover': {
            bgcolor: alpha(selectedScheme?.color || estbelColors.primary.main, 0.9),
          },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Dialogs */}
      <TransactionDialog
        open={transactionDialogOpen}
        schemes={schemes}
        defaultSchemeId={selectedSchemeId || undefined}
        editingTransaction={editingTransaction}
        onClose={() => {
          setTransactionDialogOpen(false)
          setEditingTransaction(null)
        }}
        onSave={editingTransaction ? handleUpdateTransaction : handleCreateTransaction}
      />

      {selectedScheme && (
        <ReportDialog
          open={reportDialogOpen}
          scheme={selectedScheme}
          transactions={transactions}
          generatedBy={currentUser.name}
          onClose={() => setReportDialogOpen(false)}
          onSuccess={(message) => setSnackbar({ open: true, message, severity: 'success' })}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
})

EstbelDashboard.displayName = 'EstbelDashboard'
