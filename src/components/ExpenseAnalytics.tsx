import {
  Card,
  CardContent,
  Typography,
  Grid2 as Grid,
  Box,
  Stack,
} from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import ReceiptIcon from '@mui/icons-material/Receipt'
import CalculateIcon from '@mui/icons-material/Calculate'
import dayjs from 'dayjs'

interface ExpenseAnalyticsProps {
  analytics: {
    totalAmount: number
    expenseCount: number
    averageExpense: number
    expensesByMonth: { [month: string]: number }
    expensesByPurpose: { [purpose: string]: number }
  }
}

export function ExpenseAnalytics({ analytics }: ExpenseAnalyticsProps) {
  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} TZS`
  }

  const getTopPurposes = () => {
    return Object.entries(analytics.expensesByPurpose)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
  }

  const getRecentMonths = () => {
    return Object.entries(analytics.expensesByMonth)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 6)
  }

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h6" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          <TrendingUpIcon color="primary" sx={{ fontSize: { xs: 20, sm: 24 } }} />
          Expense Analytics
        </Typography>

        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, bgcolor: 'primary.50', borderRadius: 1 }}>
              <AccountBalanceWalletIcon color="primary" sx={{ fontSize: { xs: 24, sm: 32 }, mb: 0.5 }} />
              <Typography variant="h6" color="primary" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                {formatCurrency(analytics.totalAmount)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                Total Spent
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, bgcolor: 'secondary.50', borderRadius: 1 }}>
              <ReceiptIcon color="secondary" sx={{ fontSize: { xs: 24, sm: 32 }, mb: 0.5 }} />
              <Typography variant="h6" color="secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                {analytics.expenseCount}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                Total Expenses
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, bgcolor: 'success.50', borderRadius: 1 }}>
              <CalculateIcon color="success" sx={{ fontSize: { xs: 24, sm: 32 }, mb: 0.5 }} />
              <Typography variant="h6" color="success" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                {formatCurrency(analytics.averageExpense)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                Average Expense
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Box sx={{ textAlign: 'center', p: { xs: 1.5, sm: 2 }, bgcolor: 'warning.50', borderRadius: 1 }}>
              <TrendingUpIcon color="warning" sx={{ fontSize: { xs: 24, sm: 32 }, mb: 0.5 }} />
              <Typography variant="h6" color="warning" sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}>
                {Object.keys(analytics.expensesByMonth).length}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                Active Months
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Top Expenses by Purpose
            </Typography>
            <Stack spacing={1}>
              {getTopPurposes().map(([purpose, amount]) => (
                <Box key={purpose} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {purpose}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {formatCurrency(amount)}
                  </Typography>
                </Box>
              ))}
              {getTopPurposes().length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No expenses recorded yet
                </Typography>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Monthly Spending
            </Typography>
            <Stack spacing={1}>
              {getRecentMonths().map(([month, amount]) => (
                <Box key={month} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {dayjs(month).format('MMMM YYYY')}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(amount)}
                  </Typography>
                </Box>
              ))}
              {getRecentMonths().length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No monthly data available
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}
