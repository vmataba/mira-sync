import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

interface MemberFormState {
  id: string
  name: string
  type: 'user' | 'group'
  username: string
  password: string
}

interface MemberDialogProps {
  open: boolean
  form: MemberFormState
  editingId: string | null
  onClose: () => void
  onChange: (form: MemberFormState) => void
  onSave: () => void
}

export const MemberDialog = React.memo(({
  open,
  form,
  editingId,
  onClose,
  onChange,
  onSave,
}: MemberDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ p: 2.5, pb: 2 }}>
        <Typography variant="h6" component="div">
          {editingId ? 'Edit Member' : 'Add Family Member'}
        </Typography>
      </DialogTitle>
      <DialogContent dividers sx={{ pt: 2.5 }}>
        <Stack spacing={2.5} sx={{ minWidth: { xs: 260, sm: 400 } }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => {
              const newName = e.target.value
              // Auto-generate username from name if creating new member and username is empty or matches previous auto-generated
              if (!editingId && (!form.username || form.username === form.name.toLowerCase().replace(/\s+/g, ''))) {
                onChange({ ...form, name: newName, username: newName.toLowerCase().replace(/\s+/g, '') })
              } else {
                onChange({ ...form, name: newName })
              }
            }}
            fullWidth
            autoFocus
            required
          />
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => onChange({ ...form, username: e.target.value })}
            fullWidth
            required
            helperText="Used for login (auto-generated from name)"
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => onChange({ ...form, password: e.target.value })}
            fullWidth
            required
            helperText="Keep this secure"
          />
          <FormControl fullWidth>
            <InputLabel id="member-type-label">Type</InputLabel>
            <Select
              labelId="member-type-label"
              label="Type"
              value={form.type}
              onChange={(e) => onChange({ ...form, type: e.target.value as 'user' | 'group' })}
            >
              <MenuItem value="user">Individual</MenuItem>
              <MenuItem value="group">Group</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, pt: 2 }}>
        <Button onClick={onClose} size="large">Cancel</Button>
        <Button onClick={onSave} variant="contained" size="large">
          {editingId ? 'Update' : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  )
})

MemberDialog.displayName = 'MemberDialog'
