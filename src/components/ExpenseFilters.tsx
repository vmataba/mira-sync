import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
  Button,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import FilterListIcon from '@mui/icons-material/FilterList'
import TodayIcon from '@mui/icons-material/Today'
import ClearIcon from '@mui/icons-material/Clear'
import dayjs, { Dayjs } from 'dayjs'
import type { Assignment } from '../models'

interface ExpenseFiltersProps {
  selectedUserId: string
  selectedTimeRange: string
  selectedDate: Dayjs | null
  users: Assignment[]
  onUserChange: (userId: string) => void
  onTimeRangeChange: (range: string) => void
  onDateChange: (date: Dayjs | null) => void
}

const TIME_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Specific Date' },
]

export function ExpenseFilters({
  selectedUserId,
  selectedTimeRange,
  selectedDate,
  users,
  onUserChange,
  onTimeRangeChange,
  onDateChange,
}: ExpenseFiltersProps) {
  const handleQuickDateSelect = (daysAgo: number) => {
    onDateChange(dayjs().subtract(daysAgo, 'day'))
    onTimeRangeChange('custom')
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        }}
      >
        <Stack spacing={2.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterListIcon color="primary" fontSize="small" />
              <Typography variant="subtitle2" color="text.primary" fontWeight={600}>
                Filters
              </Typography>
            </Box>
            {(selectedUserId !== 'all' || selectedTimeRange !== 'today' || selectedDate) && (
              <Button
                size="small"
                startIcon={<ClearIcon />}
                onClick={() => {
                  onUserChange('all')
                  onTimeRangeChange('today')
                  onDateChange(null)
                }}
                sx={{ fontSize: '0.75rem' }}
              >
                Reset
              </Button>
            )}
          </Box>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            sx={{ width: '100%' }}
          >
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
              <InputLabel>User</InputLabel>
              <Select
                value={selectedUserId}
                label="User"
                onChange={(e) => onUserChange(e.target.value)}
              >
                <MenuItem value="all">All Users</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
              <InputLabel>Time Period</InputLabel>
              <Select
                value={selectedTimeRange}
                label="Time Period"
                onChange={(e) => {
                  onTimeRangeChange(e.target.value)
                  if (e.target.value !== 'custom') {
                    onDateChange(null)
                  }
                }}
              >
                {TIME_RANGES.map((range) => (
                  <MenuItem key={range.value} value={range.value}>
                    {range.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedTimeRange === 'custom' && (
              <DatePicker
                label="Select Date"
                value={selectedDate}
                onChange={(newDate) => onDateChange(newDate)}
                slotProps={{
                  textField: {
                    size: 'small',
                    sx: { minWidth: { xs: '100%', sm: 160 } },
                  },
                }}
                maxDate={dayjs()}
              />
            )}
          </Stack>

          {/* Quick date selection chips */}
          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
              <TodayIcon sx={{ fontSize: 14, mr: 0.5 }} />
              Quick:
            </Typography>
            {[
              { label: 'Today', days: 0 },
              { label: 'Yesterday', days: 1 },
              { label: '2 days ago', days: 2 },
              { label: '3 days ago', days: 3 },
              { label: 'Week ago', days: 7 },
            ].map((item) => (
              <Chip
                key={item.days}
                label={item.label}
                size="small"
                variant={selectedTimeRange === 'custom' && selectedDate?.isSame(dayjs().subtract(item.days, 'day'), 'day') ? 'filled' : 'outlined'}
                color={selectedTimeRange === 'custom' && selectedDate?.isSame(dayjs().subtract(item.days, 'day'), 'day') ? 'primary' : 'default'}
                onClick={() => handleQuickDateSelect(item.days)}
                sx={{ 
                  cursor: 'pointer',
                  fontWeight: 500,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Box>
    </LocalizationProvider>
  )
}
