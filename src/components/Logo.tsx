import React from 'react'
import { Box, Typography, Stack } from '@mui/material'
import { estbelColors } from '../theme'

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
        borderRadius: '10px',
        background: `linear-gradient(135deg, ${estbelColors.primary.main} 0%, ${estbelColors.primary.light} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 4px 12px ${estbelColors.primary.main}40`,
      }}
    >
      {/* Stylized "E" for Estbel */}
      <Typography
        sx={{
          color: 'white',
          fontWeight: 800,
          fontSize: '1.25rem',
          letterSpacing: '-0.05em',
        }}
      >
        E
      </Typography>
    </Box>
    <Stack spacing={-0.5}>
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: estbelColors.text.primary,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
        }}
      >
        Tracker
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: estbelColors.text.secondary,
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}
      >
        by Estbel
      </Typography>
    </Stack>
  </Box>
))

MiraSyncLogo.displayName = 'MiraSyncLogo'
