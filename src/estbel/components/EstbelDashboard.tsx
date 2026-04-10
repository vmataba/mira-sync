import React, { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
  Button,
  IconButton,
  Fab,
  Grid2 as Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  alpha,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SearchIcon from '@mui/icons-material/Search'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import ShareIcon from '@mui/icons-material/Share'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import { SchemeCard } from './SchemeCard'
import { SchemeDialog } from './SchemeDialog'
import { TransactionCard } from './TransactionCard'
import { TransactionDialog } from './TransactionDialog'
import { useSchemes, useTransactions, useSchemeSelection } from '../hooks/useEstbel'
import { downloadPDF, shareViaWhatsApp } from '../utils/pdfReport'
import type { Scheme, Transaction, SchemeFormData, TransactionFormData } from '../types'
import { estbelColors } from '../../theme'
import type { AuthUser } from '../../auth/authService'

interface EstbelDashboardProps {
  currentUser: AuthUser
  onBack: () => void
}

const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

export const EstbelDashboard = React.memo(({ currentUser, onBack }: EstbelDashboardProps) => {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  
  // Hooks
  const { schemes, stats, createScheme, updateScheme, deleteScheme } = useSchemes()
  const { selectedSchemeId, selectedScheme, selectScheme } = useSchemeSelection()
  const {
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' })

  // Handlers
  const handleCreateScheme = useCallback(async (data: SchemeFormData) => {
    console.log('handleCreateScheme called with:', data)
    console.log('currentUser:', currentUser)
    const id = await createScheme(data, currentUser.id)
    console.log('createScheme returned:', id)
    if (id) {
      setSnackbar({ open: true, message: 'Scheme created successfully', severity: 'success' })
    } else {
      setSnackbar({ open: true, message: 'Failed to create scheme', severity: 'error' })
    }
  }, [createScheme, currentUser])

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

  const handleDownloadPDF = useCallback(() => {
    if (!selectedScheme) return
    downloadPDF({
      scheme: selectedScheme,
      transactions: filteredTransactions,
      dateRange: filters.dateRange,
      generatedBy: currentUser.name,
    })
    setSnackbar({ open: true, message: 'PDF downloaded successfully', severity: 'success' })
  }, [selectedScheme, filteredTransactions, filters.dateRange, currentUser.name])

  const handleShareWhatsApp = useCallback(async () => {
    if (!selectedScheme) return
    await shareViaWhatsApp({
      scheme: selectedScheme,
      transactions: filteredTransactions,
      dateRange: filters.dateRange,
      generatedBy: currentUser.name,
    })
  }, [selectedScheme, filteredTransactions, filters.dateRange, currentUser.name])

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
            py: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton onClick={onBack} sx={{ color: estbelColors.text.primary }}>
              <ArrowBackIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700}>
                Estbel
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Multi-Scheme Cash Flow
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setEditingScheme(null)
                setSchemeDialogOpen(true)
              }}
              size={isSmall ? 'small' : 'medium'}
            >
              {isSmall ? 'New' : 'New Scheme'}
            </Button>
          </Stack>
        </Box>

        {/* Stats Cards */}
        <Box sx={{ px: { xs: 2, sm: 3 }, py: 3 }}>
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: estbelColors.primary.main, color: 'white', border: 'none' }}>
                <CardContent sx={{ p: 2 }}>
                  <AccountBalanceWalletIcon sx={{ fontSize: 28, opacity: 0.8, mb: 1 }} />
                  <Typography variant="overline" sx={{ opacity: 0.8 }}>
                    Total Balance
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    TZS {formatNumber(stats.totalBalance)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: estbelColors.success.main, color: 'white', border: 'none' }}>
                <CardContent sx={{ p: 2 }}>
                  <TrendingUpIcon sx={{ fontSize: 28, opacity: 0.8, mb: 1 }} />
                  <Typography variant="overline" sx={{ opacity: 0.8 }}>
                    Total In
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    +{formatNumber(stats.totalIn)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ bgcolor: estbelColors.error.main, color: 'white', border: 'none' }}>
                <CardContent sx={{ p: 2 }}>
                  <TrendingDownIcon sx={{ fontSize: 28, opacity: 0.8, mb: 1 }} />
                  <Typography variant="overline" sx={{ opacity: 0.8 }}>
                    Total Out
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    -{formatNumber(stats.totalOut)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <Card sx={{ border: `1px solid ${estbelColors.border}` }}>
                <CardContent sx={{ p: 2 }}>
                  <Typography variant="overline" color="text.secondary">
                    Schemes
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary">
                    {stats.schemeCount}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stats.transactionCount} transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Schemes Grid */}
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Your Schemes
          </Typography>
          
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
      {/* Header */}
      <Box
        sx={{
          bgcolor: selectedScheme?.color || estbelColors.primary.main,
          color: 'white',
          px: { xs: 2, sm: 3 },
          py: 3,
        }}
      >
        <Stack direction="row" alignItems="flex-start" spacing={2}>
          <IconButton onClick={() => selectScheme(null)} sx={{ color: 'white', mt: -0.5 }}>
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" sx={{ opacity: 0.8 }}>
              SCHEME
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {selectedScheme?.name}
            </Typography>
            {selectedScheme?.description && (
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                {selectedScheme.description}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton onClick={handleDownloadPDF} sx={{ color: 'white' }}>
              <PictureAsPdfIcon />
            </IconButton>
            <IconButton onClick={handleShareWhatsApp} sx={{ color: 'white' }}>
              <ShareIcon />
            </IconButton>
          </Stack>
        </Stack>

        {/* Balance Stats */}
        <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Balance
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              TZS {formatNumber(selectedScheme?.balance || 0)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              In
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              +{formatNumber(selectedScheme?.totalIn || 0)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Out
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              -{formatNumber(selectedScheme?.totalOut || 0)}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Filters */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 2, bgcolor: estbelColors.background.paper }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            size="small"
            placeholder="Search transactions..."
            value={filters.searchQuery}
            onChange={(e) => updateFilters({ searchQuery: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ flex: 1 }}
          />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={filters.type}
              label="Type"
              onChange={(e) => updateFilters({ type: e.target.value as any })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="in">Cash In</MenuItem>
              <MenuItem value="out">Cash Out</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Transactions List */}
      <Box sx={{ px: { xs: 2, sm: 3 }, py: 3, pb: 12 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </Typography>

        {filteredTransactions.length === 0 ? (
          <Card
            sx={{
              p: 4,
              textAlign: 'center',
              border: `2px dashed ${estbelColors.border}`,
              bgcolor: 'transparent',
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No transactions found
            </Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
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

      {/* FAB */}
      <Fab
        color="primary"
        onClick={() => {
          setEditingTransaction(null)
          setTransactionDialogOpen(true)
        }}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
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
