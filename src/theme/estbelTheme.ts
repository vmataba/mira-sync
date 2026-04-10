import { createTheme, alpha } from '@mui/material'

// Estbel Suite Banking-Grade Color Palette
// Inspired by Tanzanian high-end banking apps (NMB, CRDB, Equity)
export const estbelColors = {
  // Primary - Deep Professional Blue
  primary: {
    main: '#0A2540',
    light: '#1A3A5C',
    dark: '#051629',
    contrastText: '#FFFFFF',
  },
  // Secondary - Accent Teal/Green (Trust & Growth)
  secondary: {
    main: '#00A67E',
    light: '#33B898',
    dark: '#007A5E',
    contrastText: '#FFFFFF',
  },
  // Success - Cash In (Green)
  success: {
    main: '#00C853',
    light: '#5EFC82',
    dark: '#009624',
    contrastText: '#FFFFFF',
  },
  // Error - Cash Out (Red)
  error: {
    main: '#D32F2F',
    light: '#EF5350',
    dark: '#C62828',
    contrastText: '#FFFFFF',
  },
  // Warning - Attention
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
    contrastText: '#000000',
  },
  // Info - Neutral Information
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
    contrastText: '#FFFFFF',
  },
  // Backgrounds
  background: {
    default: '#F5F7FA',
    paper: '#FFFFFF',
    elevated: '#FFFFFF',
    subtle: '#F0F4F8',
  },
  // Text
  text: {
    primary: '#0A2540',
    secondary: '#546E7A',
    disabled: '#90A4AE',
  },
  // Dividers & Borders
  divider: '#E0E6ED',
  border: '#D0D9E3',
  // Special
  gold: '#D4AF37',
  platinum: '#E5E4E2',
}

// Banking-Grade Material Design 3 Theme
export const estbelTheme = createTheme({
  palette: {
    mode: 'light',
    primary: estbelColors.primary,
    secondary: estbelColors.secondary,
    success: estbelColors.success,
    error: estbelColors.error,
    warning: estbelColors.warning,
    info: estbelColors.info,
    background: {
      default: estbelColors.background.default,
      paper: estbelColors.background.paper,
    },
    text: estbelColors.text,
    divider: estbelColors.divider,
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 2px rgba(10, 37, 64, 0.04)',
    '0px 2px 4px rgba(10, 37, 64, 0.06)',
    '0px 4px 8px rgba(10, 37, 64, 0.08)',
    '0px 6px 12px rgba(10, 37, 64, 0.10)',
    '0px 8px 16px rgba(10, 37, 64, 0.12)',
    '0px 12px 24px rgba(10, 37, 64, 0.14)',
    '0px 16px 32px rgba(10, 37, 64, 0.16)',
    '0px 20px 40px rgba(10, 37, 64, 0.18)',
    '0px 24px 48px rgba(10, 37, 64, 0.20)',
    '0px 28px 56px rgba(10, 37, 64, 0.22)',
    '0px 32px 64px rgba(10, 37, 64, 0.24)',
    '0px 36px 72px rgba(10, 37, 64, 0.26)',
    '0px 40px 80px rgba(10, 37, 64, 0.28)',
    '0px 44px 88px rgba(10, 37, 64, 0.30)',
    '0px 48px 96px rgba(10, 37, 64, 0.32)',
    '0px 52px 104px rgba(10, 37, 64, 0.34)',
    '0px 56px 112px rgba(10, 37, 64, 0.36)',
    '0px 60px 120px rgba(10, 37, 64, 0.38)',
    '0px 64px 128px rgba(10, 37, 64, 0.40)',
    '0px 68px 136px rgba(10, 37, 64, 0.42)',
    '0px 72px 144px rgba(10, 37, 64, 0.44)',
    '0px 76px 152px rgba(10, 37, 64, 0.46)',
    '0px 80px 160px rgba(10, 37, 64, 0.48)',
    '0px 84px 168px rgba(10, 37, 64, 0.50)',
  ],
  typography: {
    fontFamily: '"Inter", "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: '-0.02em',
      lineHeight: 1.25,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: '-0.01em',
      lineHeight: 1.35,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.005em',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      letterSpacing: 0,
      lineHeight: 1.45,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      letterSpacing: '0.01em',
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.02em',
      textTransform: 'uppercase' as const,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      letterSpacing: '0.01em',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      letterSpacing: '0.01em',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: '0.02em',
      textTransform: 'none' as const,
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.03em',
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 700,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      lineHeight: 1.5,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          scrollbarColor: `${estbelColors.border} transparent`,
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: estbelColors.border,
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: estbelColors.text.secondary,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: '12px 24px',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(10, 37, 64, 0.15)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 16px rgba(10, 37, 64, 0.2)',
          },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${estbelColors.primary.main} 0%, ${estbelColors.primary.light} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${estbelColors.primary.dark} 0%, ${estbelColors.primary.main} 100%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${estbelColors.secondary.main} 0%, ${estbelColors.secondary.light} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${estbelColors.secondary.dark} 0%, ${estbelColors.secondary.main} 100%)`,
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: alpha(estbelColors.primary.main, 0.04),
          },
        },
        outlinedPrimary: {
          borderColor: estbelColors.primary.main,
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: `1px solid ${estbelColors.border}`,
          boxShadow: '0 2px 8px rgba(10, 37, 64, 0.06)',
          transition: 'all 0.25s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(10, 37, 64, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(10, 37, 64, 0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(10, 37, 64, 0.08)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(10, 37, 64, 0.10)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 8,
          fontSize: '0.8125rem',
          letterSpacing: '0.01em',
        },
        colorSuccess: {
          backgroundColor: alpha(estbelColors.success.main, 0.12),
          color: estbelColors.success.dark,
        },
        colorError: {
          backgroundColor: alpha(estbelColors.error.main, 0.12),
          color: estbelColors.error.dark,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 10,
            backgroundColor: estbelColors.background.paper,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: estbelColors.background.subtle,
            },
            '&.Mui-focused': {
              backgroundColor: estbelColors.background.paper,
              boxShadow: `0 0 0 3px ${alpha(estbelColors.primary.main, 0.12)}`,
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          textTransform: 'none',
          letterSpacing: '0.01em',
          fontSize: '0.9375rem',
          minHeight: 52,
          padding: '12px 20px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            color: estbelColors.primary.main,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: '3px 3px 0 0',
          backgroundColor: estbelColors.primary.main,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: estbelColors.background.paper,
          color: estbelColors.text.primary,
          boxShadow: '0 1px 3px rgba(10, 37, 64, 0.08)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0 24px 48px rgba(10, 37, 64, 0.2)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
          padding: '24px 24px 16px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
          gap: 12,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.9375rem',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: 8,
          backgroundColor: alpha(estbelColors.primary.main, 0.1),
        },
        bar: {
          borderRadius: 4,
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 14px rgba(10, 37, 64, 0.25)',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(10, 37, 64, 0.35)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: alpha(estbelColors.primary.main, 0.08),
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: '2px 8px',
          padding: '10px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: alpha(estbelColors.primary.main, 0.06),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(estbelColors.primary.main, 0.1),
            '&:hover': {
              backgroundColor: alpha(estbelColors.primary.main, 0.14),
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: estbelColors.divider,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          backgroundColor: alpha(estbelColors.success.main, 0.1),
          color: estbelColors.success.dark,
        },
        standardError: {
          backgroundColor: alpha(estbelColors.error.main, 0.1),
          color: estbelColors.error.dark,
        },
      },
    },
  },
})

export default estbelTheme
