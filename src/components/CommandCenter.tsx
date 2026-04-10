import React from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Avatar,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import AssignmentIcon from '@mui/icons-material/Assignment'
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import SecurityIcon from '@mui/icons-material/Security'
import { estbelColors } from '../theme'

type AppModule = 'tracker' | 'estbel'

interface CommandCenterProps {
  userName: string
  onSelectModule: (module: AppModule) => void
}

interface ModuleCardProps {
  title: string
  subtitle: string
  description: string
  icon: React.ReactNode
  gradient: string
  accentColor: string
  onClick: () => void
  isSmall: boolean
}

const ModuleCard = React.memo(({
  title,
  subtitle,
  description,
  icon,
  gradient,
  accentColor,
  onClick,
  isSmall,
}: ModuleCardProps) => (
  <Card
    onClick={onClick}
    sx={{
      cursor: 'pointer',
      height: '100%',
      minHeight: isSmall ? 200 : 260,
      position: 'relative',
      overflow: 'hidden',
      background: gradient,
      border: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: `0 20px 40px ${alpha(accentColor, 0.3)}`,
      },
      '&:active': {
        transform: 'translateY(-4px)',
      },
      '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.15) 0%, transparent 60%)',
        pointerEvents: 'none',
      },
    }}
  >
    <CardContent
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: { xs: 3, sm: 4 },
        position: 'relative',
        zIndex: 1,
      }}
    >
      <Avatar
        sx={{
          width: isSmall ? 48 : 64,
          height: isSmall ? 48 : 64,
          bgcolor: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          mb: 2,
        }}
      >
        {icon}
      </Avatar>
      
      <Typography
        variant="overline"
        sx={{
          color: 'rgba(255,255,255,0.8)',
          fontWeight: 700,
          letterSpacing: 2,
          mb: 0.5,
        }}
      >
        {subtitle}
      </Typography>
      
      <Typography
        variant={isSmall ? 'h5' : 'h4'}
        sx={{
          color: 'white',
          fontWeight: 700,
          mb: 1.5,
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </Typography>
      
      <Typography
        variant="body2"
        sx={{
          color: 'rgba(255,255,255,0.85)',
          lineHeight: 1.6,
          flex: 1,
        }}
      >
        {description}
      </Typography>
      
      <Box
        sx={{
          mt: 2,
          display: 'flex',
          alignItems: 'center',
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        <Typography variant="button" sx={{ fontWeight: 600 }}>
          Open Module
        </Typography>
        <Box
          component="span"
          sx={{
            ml: 1,
            display: 'inline-flex',
            transition: 'transform 0.2s',
            '.MuiCard-root:hover &': {
              transform: 'translateX(4px)',
            },
          }}
        >
          →
        </Box>
      </Box>
    </CardContent>
  </Card>
))

ModuleCard.displayName = 'ModuleCard'

export const CommandCenter = React.memo(({ userName, onSelectModule }: CommandCenterProps) => {
  const theme = useTheme()
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'))
  
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(180deg, ${estbelColors.background.default} 0%, ${estbelColors.background.subtle} 100%)`,
        px: { xs: 2, sm: 4, md: 6 },
        py: { xs: 4, sm: 6, md: 8 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        {/* Header */}
        <Stack spacing={1} sx={{ mb: { xs: 4, sm: 6 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 1 }}
          >
            <SecurityIcon
              sx={{
                fontSize: 20,
                color: estbelColors.secondary.main,
              }}
            />
            <Typography
              variant="overline"
              sx={{
                color: estbelColors.secondary.main,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              Estbel Suite
            </Typography>
          </Stack>
          
          <Typography
            variant={isSmall ? 'h4' : 'h2'}
            sx={{
              fontWeight: 700,
              color: estbelColors.text.primary,
              letterSpacing: '-0.02em',
            }}
          >
            {getGreeting()}, {userName}
          </Typography>
          
          <Typography
            variant="body1"
            sx={{
              color: estbelColors.text.secondary,
              maxWidth: 500,
            }}
          >
            Select a module to manage your tasks, expenses, or professional cash flow.
          </Typography>
        </Stack>

        {/* Module Cards */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={3}
          sx={{ mb: 6 }}
        >
          <Box sx={{ flex: 1 }}>
            <ModuleCard
              title="Tracker"
              subtitle="Task & Expense"
              description="Manage family tasks, plan windows, and track daily expenses. Perfect for household organization and budget monitoring."
              icon={<AssignmentIcon sx={{ fontSize: isSmall ? 24 : 32, color: 'white' }} />}
              gradient="linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)"
              accentColor="#6366F1"
              onClick={() => onSelectModule('tracker')}
              isSmall={isSmall}
            />
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <ModuleCard
              title="Estbel"
              subtitle="Cash Flow Engine"
              description="Professional multi-scheme ledger system. Manage business and personal finances with isolated accounts and detailed reporting."
              icon={<AccountBalanceIcon sx={{ fontSize: isSmall ? 24 : 32, color: 'white' }} />}
              gradient={`linear-gradient(135deg, ${estbelColors.primary.main} 0%, ${estbelColors.primary.light} 100%)`}
              accentColor={estbelColors.primary.main}
              onClick={() => onSelectModule('estbel')}
              isSmall={isSmall}
            />
          </Box>
        </Stack>

        {/* Features Banner */}
        <Card
          sx={{
            background: estbelColors.background.paper,
            border: `1px solid ${estbelColors.border}`,
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              divider={
                <Box
                  sx={{
                    width: { xs: '100%', sm: 1 },
                    height: { xs: 1, sm: 'auto' },
                    bgcolor: estbelColors.divider,
                  }}
                />
              }
            >
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(estbelColors.secondary.main, 0.1),
                    color: estbelColors.secondary.main,
                  }}
                >
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Real-time Sync
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    All data synced across devices
                  </Typography>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(estbelColors.primary.main, 0.1),
                    color: estbelColors.primary.main,
                  }}
                >
                  <SecurityIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    Secure & Private
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your data stays protected
                  </Typography>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(estbelColors.success.main, 0.1),
                    color: estbelColors.success.main,
                  }}
                >
                  <AccountBalanceIcon />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    TZS Currency
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Optimized for Tanzania
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  )
})

CommandCenter.displayName = 'CommandCenter'
