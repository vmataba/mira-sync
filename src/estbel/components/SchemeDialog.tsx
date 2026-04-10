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
    console.log('SchemeDialog handleSave called')
    console.log('Current form state:', form)
    
    if (!form.name.trim()) {
      console.log('Form validation failed: name is empty')
      return
    }
    
    setLoading(true)
    try {
      console.log('Calling onSave with form:', form)
      await onSave(form)
      console.log('onSave completed successfully')
      onClose()
    } catch (error) {
      console.error('Error in onSave:', error)
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
        sx: { borderRadius: 3 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h5" fontWeight={700}>
          {editingScheme ? 'Edit Scheme' : 'Create New Scheme'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {editingScheme
            ? 'Update the scheme details below'
            : 'Create an isolated ledger for tracking cash flow'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Stack spacing={3}>
          <TextField
            label="Scheme Name"
            placeholder="e.g., Business Account, Personal Savings"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            required
            autoFocus
            inputProps={{ maxLength: 50 }}
          />

          <TextField
            label="Description (Optional)"
            placeholder="Brief description of this scheme"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            multiline
            rows={2}
            inputProps={{ maxLength: 200 }}
          />

          <Box>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
              Scheme Color
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={1.5}>
              {SCHEME_COLORS.map((color) => (
                <Box
                  key={color}
                  onClick={() => setForm({ ...form, color })}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: color,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: form.color === color ? '3px solid' : '2px solid transparent',
                    borderColor: form.color === color ? estbelColors.primary.main : 'transparent',
                    boxShadow: form.color === color
                      ? `0 0 0 2px ${alpha(color, 0.3)}`
                      : 'none',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
                    },
                  }}
                >
                  {form.color === color && (
                    <CheckIcon sx={{ color: 'white', fontSize: 20 }} />
                  )}
                </Box>
              ))}
            </Stack>
          </Box>

          {/* Preview */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: alpha(form.color, 0.08),
              borderLeft: `4px solid ${form.color}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              PREVIEW
            </Typography>
            <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
              {form.name || 'Scheme Name'}
            </Typography>
            {form.description && (
              <Typography variant="body2" color="text.secondary">
                {form.description}
              </Typography>
            )}
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
          disabled={!form.name.trim() || loading}
          size="large"
        >
          {loading ? 'Saving...' : editingScheme ? 'Update Scheme' : 'Create Scheme'}
        </Button>
      </DialogActions>
    </Dialog>
  )
})

SchemeDialog.displayName = 'SchemeDialog'
