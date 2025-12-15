import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Chip,
} from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import type { Assignment } from '../models'

interface ExpenseFiltersProps {
  selectedUserId: string
  selectedTimeRange: string
  users: Assignment[]
  onUserChange: (userId: string) => void
  onTimeRangeChange: (range: string) => void
}

const TIME_RANGES = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
]

export function ExpenseFilters({
  selectedUserId,
  selectedTimeRange,
  users,
  onUserChange,
  onTimeRangeChange,
}: ExpenseFiltersProps) {
  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        bgcolor: 'background.paper',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="action" fontSize="small" />
          <Chip label="Filters" size="small" variant="outlined" />
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

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={selectedTimeRange}
              label="Time Period"
              onChange={(e) => onTimeRangeChange(e.target.value)}
            >
              {TIME_RANGES.map((range) => (
                <MenuItem key={range.value} value={range.value}>
                  {range.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  )
}
