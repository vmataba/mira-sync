import React, { useState } from 'react'
import {
  Avatar,
  Box,
  IconButton,
  Stack,
  TextField,
} from '@mui/material'
import SendIcon from '@mui/icons-material/Send'

interface CommentInputProps {
  userName: string
  onSubmit: (text: string) => void
  placeholder?: string
  autoFocus?: boolean
}

export const CommentInput: React.FC<CommentInputProps> = ({
  userName,
  onSubmit,
  placeholder = 'Write a comment...',
  autoFocus = false,
}) => {
  const [text, setText] = useState('')

  const handleSubmit = () => {
    const trimmed = text.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setText('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: 'primary.main',
          fontSize: '0.8rem',
          fontWeight: 600,
          mt: 0.5,
        }}
      >
        {userName.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, position: 'relative' }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          size="small"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              bgcolor: 'grey.50',
              pr: 5,
            },
          }}
        />
        <IconButton
          onClick={handleSubmit}
          disabled={!text.trim()}
          size="small"
          sx={{
            position: 'absolute',
            right: 8,
            bottom: 8,
            color: text.trim() ? 'primary.main' : 'text.disabled',
          }}
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Box>
    </Stack>
  )
}
