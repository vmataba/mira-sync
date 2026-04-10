import React, { useState, useEffect } from 'react'
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
  alpha,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import type { SchemeFormData } from '../types'
import { SCHEME_COLORS, DEFAULT_SCHEME_FORM } from '../types'
import { estbelColors } from '../../theme'

interface SchemeDialogProps {
  open: boolean
  editingScheme?: { id: string; data: SchemeFormData } | null
  onClose: () => void
  onSave: (data: SchemeFormData) => Promise<void>
}

export const SchemeDialog = React.memo(({
  open,
  editingScheme,
  onClose,
  onSave,
}: SchemeDialogProps) => {
  const [form, setForm] = useState<SchemeFormData>(DEFAULT_SCHEME_FORM)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingScheme) {
      setForm(editingScheme.data)
    } else {
      setForm(DEFAULT_SCHEME_FORM)
    }
  }, [editingScheme, open])

  const handleSave = async () => {
    if (!form.name.trim()) return
    
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
          {editingScheme ? 'Edit Scheme' : 'New Scheme'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {editingScheme ? 'Update details' : 'Create an isolated ledger'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <TextField
            label="Scheme Name"
            placeholder="e.g., Business, Personal"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            required
            autoFocus
            size="small"
            inputProps={{ maxLength: 50 }}
          />

          <TextField
            label="Description (Optional)"
            placeholder="Brief description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            size="small"
            multiline
            rows={2}
            inputProps={{ maxLength: 200 }}
          />

          <Box>
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ mb: 1, display: 'block', fontSize: '0.75rem' }}
            >
              Color
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1}>
              {SCHEME_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: color,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: form.color === color ? '2px solid' : '2px solid transparent',
                    borderColor: form.color === color ? estbelColors.primary.main : 'transparent',
                    transition: 'all 0.15s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {form.color === color && (
                    <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Preview - compact */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(form.color, 0.08),
              borderLeft: `3px solid ${form.color}`,
            }}
          >
            <Typography 
              variant="caption" 
              color="text.secondary" 
              fontWeight={600}
              sx={{ fontSize: '0.65rem' }}
            >
              PREVIEW
            </Typography>
            <Typography fontWeight={700} sx={{ fontSize: '0.95rem' }}>
              {form.name || 'Scheme Name'}
            </Typography>
            {form.description && (
              <Typography variant="caption" color="text.secondary">
                {form.description}
              </Typography>
            )}
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
          disabled={!form.name.trim() || loading}
          size="small"
        >
          {loading ? 'Saving...' : editingScheme ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
})

SchemeDialog.displayName = 'SchemeDialog'
