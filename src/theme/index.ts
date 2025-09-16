import { createTheme, ThemeOptions } from '@mui/material/styles';

type CustomThemeOptions = ThemeOptions & {
  spacing: (factor: number) => string;
  shape: {
    borderRadius: number;
  };
};
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
  error: string;
  warning: string;
  success: string;
  info: string;
  divider: string;
  spacing: (factor: number) => number | string;
  shape: {
    borderRadius: number;
  };
  typography: {
    fontFamily: string;
    h1: {
      fontSize: string;
      fontWeight: number;
    };
    h2: {
      fontSize: string;
      fontWeight: number;
    };
    h3: {
      fontSize: string;
      fontWeight: number;
    };
    h4: {
      fontSize: string;
      fontWeight: number;
    };
    h5: {
      fontSize: string;
      fontWeight: number;
    };
    h6: {
      fontSize: string;
      fontWeight: number;
    };
    subtitle1: {
      fontSize: string;
      fontWeight: number;
    };
    subtitle2: {
      fontSize: string;
      fontWeight: number;
    };
    body1: {
      fontSize: string;
      lineHeight: number;
    };
    body2: {
      fontSize: string;
      lineHeight: number;
    };
    button: {
      textTransform: 'none';
      fontWeight: number;
    };
    caption: {
      fontSize: string;
      color: string;
    };
    overline: {
      fontSize: string;
      fontWeight: number;
      textTransform: 'uppercase';
    };
  };
  zIndex: {
    appBar: number;
    drawer: number;
    modal: number;
    snackbar: number;

// Base theme settings
const baseTheme: ThemeOptions = {
  spacing: 4, // 4px grid
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    h5: { fontSize: '1.25rem', fontWeight: 500 },
    h6: { fontSize: '1rem', fontWeight: 500 },
    subtitle1: { fontSize: '1rem', fontWeight: 400 },
    subtitle2: { fontSize: '0.875rem', fontWeight: 500 },
    body1: { fontSize: '1rem', fontWeight: 400 },
    body2: { fontSize: '0.875rem', fontWeight: 400 },
    button: { textTransform: 'none', fontWeight: 500 },
    caption: { fontSize: '0.75rem', fontWeight: 400 },
    overline: { 
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
    },
  },
};

// Theme mode configurations
const themeModes: Record<'light' | 'dark', ThemeConfig> = {
  light: {
    mode: 'light',
    primary: {
      light: '#63a4ff',
      main: '#1976d2',
      dark: '#004ba0',
      contrastText: '#fff',
    },
    secondary: {
      light: '#e33371',
      main: '#dc004e',
      dark: '#9a0036',
      contrastText: '#fff',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
      disabled: 'rgba(0, 0, 0, 0.38)',
    },
    error: {
      light: '#e57373',
      main: '#f44336',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
    warning: {
      light: '#ffb74d',
      main: '#ff9800',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    success: {
      light: '#81c784',
      main: '#4caf50',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      light: '#64b5f6',
      main: '#2196f3',
      dark: '#1976d2',
      contrastText: '#fff',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
  dark: {
    mode: 'dark',
    primary: {
      light: '#63a4ff',
      main: '#1976d2',
      dark: '#004ba0',
      contrastText: '#fff',
    },
    secondary: {
      light: '#f48fb1',
      main: '#f06292',
      dark: '#c2185b',
      contrastText: '#fff',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.87)',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    error: {
      light: '#e57373',
      main: '#f44336',
      dark: '#d32f2f',
      contrastText: '#fff',
    },
    warning: {
      light: '#ffb74d',
      main: '#ff9800',
      dark: '#f57c00',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    success: {
      light: '#81c784',
      main: '#4caf50',
      dark: '#388e3c',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    info: {
      light: '#4fc3f7',
      main: '#29b6f6',
      dark: '#0288d1',
      contrastText: 'rgba(0, 0, 0, 0.87)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
};

// Create theme based on mode
export const createThemeByMode = (mode: 'light' | 'dark' = 'light') => {
  const modeConfig = themeModes[mode];
  
  return createTheme({
    ...baseTheme,
    palette: {
      mode,
      primary: modeConfig.primary,
      secondary: modeConfig.secondary,
      background: modeConfig.background,
      text: modeConfig.text,
      error: modeConfig.error,
      warning: modeConfig.warning,
      success: modeConfig.success,
      info: modeConfig.info,
      divider: modeConfig.divider,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: modeConfig.background.default,
            color: modeConfig.text.primary,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: baseTheme.shape?.borderRadius ?? 8,
            padding: '8px 16px',
            textTransform: 'none',
            fontWeight: 500,
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
            },
            '&.Mui-disabled': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
              color: mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.26)',
            },
          },
          contained: {
            '&:hover': {
              boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
            },
          },
          outlined: {
            border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)'}`,
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
          text: {
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
              boxShadow: 'none',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: baseTheme.shape.borderRadius * 2,
            boxShadow: '0px 2px 1px -1px rgba(0,0,0,0.02), 0px 1px 1px 0px rgba(0,0,0,0.04), 0px 1px 3px 0px rgba(0,0,0,0.08)',
            '&:hover': {
              boxShadow: '0px 3px 3px -2px rgba(0,0,0,0.06), 0px 3px 4px 0px rgba(0,0,0,0.06), 0px 1px 8px 0px rgba(0,0,0,0.1)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: baseTheme.shape.borderRadius,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: baseTheme.shape.borderRadius,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            backgroundImage: 'none',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: baseTheme.shape.borderRadius,
            margin: '4px 8px',
            '&.Mui-selected': {
              backgroundColor: mode === 'dark' ? 'rgba(144, 202, 249, 0.16)' : 'rgba(25, 118, 210, 0.08)',
              '&:hover': {
                backgroundColor: mode === 'dark' ? 'rgba(144, 202, 249, 0.24)' : 'rgba(25, 118, 210, 0.12)',
              },
            },
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)',
            },
          },
        },
      },
    },
  });
};

// Default theme (light)
export const defaultTheme = createThemeByMode('light');

export default defaultTheme;
