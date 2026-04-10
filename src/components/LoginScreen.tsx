import React, { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
  alpha,
} from '@mui/material'
import SecurityIcon from '@mui/icons-material/Security'
import { estbelColors } from '../theme'

interface LoginScreenProps {
  onLogin: (username: string, password: string) => Promise<boolean>
}

export const LoginScreen = React.memo(({ onLogin }: LoginScreenProps) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password')
      return
    }

    setLoading(true)
    const success = await onLogin(username.trim(), password)
    setLoading(false)
    
    if (!success) {
      setError('Invalid username or password')
      setPassword('')
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${estbelColors.primary.main} 0%, ${estbelColors.primary.light} 50%, ${estbelColors.secondary.main} 100%)`,
        px: 2,
        py: 4,
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          borderRadius: 4,
          boxShadow: '0 24px 48px rgba(10, 37, 64, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Header Banner */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${estbelColors.primary.main} 0%, ${estbelColors.primary.light} 100%)`,
            py: 4,
            px: 3,
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              backdropFilter: 'blur(10px)',
            }}
          >
            <SecurityIcon sx={{ fontSize: 32, color: 'white' }} />
          </Box>
          <Typography
            variant="overline"
            sx={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            Estbel Suite
          </Typography>
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              fontWeight: 700,
              mt: 0.5,
            }}
          >
            Welcome Back
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              Sign in to access your dashboard
            </Typography>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 2,
                  bgcolor: alpha(estbelColors.error.main, 0.1),
                  color: estbelColors.error.dark,
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  fullWidth
                  autoFocus
                  autoComplete="username"
                  disabled={loading}
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  fullWidth
                  autoComplete="current-password"
                  disabled={loading}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ 
                    mt: 1, 
                    py: 1.5,
                    background: `linear-gradient(135deg, ${estbelColors.primary.main} 0%, ${estbelColors.primary.light} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${estbelColors.primary.dark} 0%, ${estbelColors.primary.main} 100%)`,
                    },
                  }}
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Stack>
            </form>

            <Typography 
              variant="caption" 
              color="text.disabled" 
              textAlign="center"
              sx={{ mt: 2 }}
            >
              Secure • Professional • Reliable
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
})

LoginScreen.displayName = 'LoginScreen'
