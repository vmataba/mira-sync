import React, { useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import type { Comment } from '../../models'
import { formatRelativeTime } from '../../utils/taskUtils'

interface CommentItemProps {
  comment: Comment
  currentUserId: string
  onEdit: (commentId: string, text: string) => void
  onDelete: (commentId: string) => void
  onReply: (parentId: string) => void
  isReply?: boolean
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  currentUserId,
  onEdit,
  onDelete,
  onReply,
  isReply = false,
}) => {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [editing, setEditing] = useState(false)
  const [editText, setEditText] = useState(comment.text)
  const isOwner = comment.userId === currentUserId

  const handleSaveEdit = () => {
    const trimmed = editText.trim()
    if (!trimmed || trimmed === comment.text) {
      setEditing(false)
      setEditText(comment.text)
      return
    }
    onEdit(comment.id, trimmed)
    setEditing(false)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setEditText(comment.text)
  }

  return (
    <Stack direction="row" spacing={1.5} sx={{ pl: isReply ? 5 : 0 }}>
      <Avatar
        sx={{
          width: isReply ? 28 : 32,
          height: isReply ? 28 : 32,
          bgcolor: 'primary.main',
          fontSize: isReply ? '0.7rem' : '0.8rem',
          fontWeight: 600,
          mt: 0.5,
        }}
      >
        {comment.userName.charAt(0).toUpperCase()}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            bgcolor: 'grey.100',
            borderRadius: 2,
            px: 2,
            py: 1.5,
            position: 'relative',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.8rem' }}>
              {comment.userName}
            </Typography>
            {isOwner && !editing && (
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                sx={{ ml: 1, p: 0.25, color: 'text.secondary' }}
              >
                <MoreHorizIcon sx={{ fontSize: 18 }} />
              </IconButton>
            )}
          </Stack>

          {editing ? (
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                size="small"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSaveEdit()
                  }
                  if (e.key === 'Escape') handleCancelEdit()
                }}
              />
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Button size="small" onClick={handleCancelEdit}>Cancel</Button>
                <Button size="small" variant="contained" onClick={handleSaveEdit}>Save</Button>
              </Stack>
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{ mt: 0.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {comment.text}
            </Typography>
          )}
        </Box>

        <Stack direction="row" spacing={2} sx={{ mt: 0.5, px: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {formatRelativeTime(comment.createdAt)}
            {comment.updatedAt && ' (edited)'}
          </Typography>
          {!isReply && (
            <Typography
              variant="caption"
              sx={{
                color: 'primary.main',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
              onClick={() => onReply(comment.id)}
            >
              Reply
            </Typography>
          )}
        </Stack>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null)
              setEditing(true)
            }}
            sx={{ fontSize: '0.875rem' }}
          >
            <EditIcon sx={{ fontSize: 18, mr: 1 }} /> Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              setMenuAnchor(null)
              onDelete(comment.id)
            }}
            sx={{ fontSize: '0.875rem', color: 'error.main' }}
          >
            <DeleteIcon sx={{ fontSize: 18, mr: 1 }} /> Delete
          </MenuItem>
        </Menu>
      </Box>
    </Stack>
  )
}
