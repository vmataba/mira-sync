import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'
import type { Comment, Task } from '../../models'
import type { AuthUser } from '../../auth/authService'
import { commentService } from '../../services/firestoreService'
import { CommentInput } from './CommentInput'
import { CommentItem } from './CommentItem'

interface TaskCommentsDialogProps {
  open: boolean
  onClose: () => void
  task: Task | null
  currentUser: AuthUser
}

export const TaskCommentsDialog: React.FC<TaskCommentsDialogProps> = ({
  open,
  onClose,
  task,
  currentUser,
}) => {
  const [comments, setComments] = useState<Comment[]>([])
  const [replyingTo, setReplyingTo] = useState<string | null>(null)

  useEffect(() => {
    if (!task || !open) {
      setComments([])
      setReplyingTo(null)
      return
    }

    const taskId = task.id
    const unsubscribe = commentService.subscribeToTaskComments(taskId, (fetched) => {
      setComments(fetched)
    })

    return () => unsubscribe()
  }, [task, open])

  const topLevelComments = useMemo(() =>
    comments
      .filter((c) => !c.parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),
    [comments]
  )

  const repliesByParent = useMemo(() => {
    const map: Record<string, Comment[]> = {}
    comments
      .filter((c) => c.parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .forEach((c) => {
        if (!map[c.parentId!]) map[c.parentId!] = []
        map[c.parentId!].push(c)
      })
    return map
  }, [comments])

  const handleAddComment = async (text: string, parentId?: string) => {
    if (!task) return
    await commentService.addComment({
      taskId: task.id,
      userId: currentUser.id,
      userName: currentUser.name,
      text,
      createdAt: new Date().toISOString(),
      parentId,
    })
    setReplyingTo(null)
  }

  const handleEditComment = async (commentId: string, text: string) => {
    await commentService.updateComment(commentId, text)
  }

  const handleDeleteComment = async (commentId: string) => {
    const replies = comments.filter((c) => c.parentId === commentId)
    for (const reply of replies) {
      await commentService.deleteComment(reply.id)
    }
    await commentService.deleteComment(commentId)
  }

  if (!task) return null

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, maxHeight: '80vh' } }}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1}>
            <ChatBubbleOutlineIcon sx={{ color: 'primary.main' }} />
            <Box>
              <Typography variant="h6" sx={{ fontSize: '1rem' }}>Comments</Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 300, display: 'block' }}>
                {task.title}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 2, maxHeight: '50vh', overflowY: 'auto' }}>
          {topLevelComments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
              <Typography color="text.secondary">
                No comments yet. Start the conversation!
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {topLevelComments.map((comment) => (
                <Box key={comment.id}>
                  <CommentItem
                    comment={comment}
                    currentUserId={currentUser.id}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    onReply={(parentId) => setReplyingTo(parentId)}
                  />
                  {repliesByParent[comment.id]?.map((reply) => (
                    <Box key={reply.id} sx={{ mt: 1 }}>
                      <CommentItem
                        comment={reply}
                        currentUserId={currentUser.id}
                        onEdit={handleEditComment}
                        onDelete={handleDeleteComment}
                        onReply={() => setReplyingTo(comment.id)}
                        isReply
                      />
                    </Box>
                  ))}
                  {replyingTo === comment.id && (
                    <Box sx={{ pl: 5, mt: 1 }}>
                      <CommentInput
                        userName={currentUser.name}
                        onSubmit={(text) => handleAddComment(text, comment.id)}
                        placeholder="Write a reply..."
                        autoFocus
                      />
                    </Box>
                  )}
                </Box>
              ))}
            </Stack>
          )}
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <CommentInput
            userName={currentUser.name}
            onSubmit={(text) => handleAddComment(text)}
            placeholder="Write a comment..."
          />
        </Box>
      </DialogContent>
    </Dialog>
  )
}
