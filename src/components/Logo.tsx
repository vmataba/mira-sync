import React from 'react'
import { Box, Typography } from '@mui/material'

export const MiraSyncLogo = React.memo(() => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          width: 20,
          height: 20,
          borderRadius: '50%',
          border: '3px solid white',
          position: 'absolute',
          top: 8,
          left: 8,
        }}
      />
      <Box
        sx={{
          width: 12,
          height: 12,
          bgcolor: 'white',
          borderRadius: '2px',
          position: 'absolute',
          bottom: 6,
          right: 6,
        }}
      />
    </Box>
    <Typography
      variant="h6"
      sx={{
        fontWeight: 700,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.02em',
      }}
    >
      Mira Sync
    </Typography>
  </Box>
))

MiraSyncLogo.displayName = 'MiraSyncLogo'
