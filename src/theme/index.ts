import { createTheme } from '@mui/material/styles';
import { APP_CONFIG } from '@/config/app';

// Define the theme settings interface
interface ThemeSettings {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  background: {
    default: string;
    paper: string;
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
  spacing: (factor: number) => number;
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
    tooltip: number;
  };
  transitions: {
    duration: {
      shortest: number;
      shorter: number;
      short: number;
      standard: number;
      complex: number;
      enteringScreen: number;
      leavingScreen: number;
    };
    easing: {
      easeInOut: string;
      easeOut: string;
      easeIn: string;
      sharp: string;
    };
  };
  components?: any;
}

// Default theme settings
const defaultThemeSettings: Partial<ThemeSettings> = {
  spacing: (factor: number) => `${0.25 * factor}rem`, // 4px grid
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
      color: 'text.secondary',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      textTransform: 'uppercase',
    },
  },
  zIndex: {
    appBar: 1200,
    drawer: 1100,
    modal: 1300,
    snackbar: 1400,
    tooltip: 1500,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)', // This is the default in MUI
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
};

// Light theme
const lightTheme: ThemeSettings = {
  mode: 'light',
  primaryColor: '#1976d2',
  secondaryColor: '#9c27b0',
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
  error: '#d32f2f',
  warning: '#ed6c02',
  success: '#2e7d32',
  info: '#0288d1',
  divider: 'rgba(0, 0, 0, 0.12)',
  ...defaultThemeSettings,
};

// Dark theme
const darkTheme: ThemeSettings = {
  mode: 'dark',
  primaryColor: '#90caf9',
  secondaryColor: '#ce93d8',
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: 'rgba(255, 255, 255, 0.87)',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  error: '#f44336',
  warning: '#ffa726',
  success: '#66bb6a',
  info: '#29b6f6',
  divider: 'rgba(255, 255, 255, 0.12)',
  ...defaultThemeSettings,
};

// Create theme based on mode
export const createThemeByMode = (mode: 'light' | 'dark') => {
  const baseTheme = mode === 'dark' ? darkTheme : lightTheme;
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: baseTheme.primaryColor,
        contrastText: mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
      },
      secondary: {
        main: baseTheme.secondaryColor,
        contrastText: mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
      },
      background: {
        default: baseTheme.background.default,
        paper: baseTheme.background.paper,
      },
      text: {
        primary: baseTheme.text.primary,
        secondary: baseTheme.text.secondary,
        disabled: baseTheme.text.disabled,
      },
      error: {
        main: baseTheme.error,
      },
      warning: {
        main: baseTheme.warning,
      },
      info: {
        main: baseTheme.info,
      },
      success: {
        main: baseTheme.success,
      },
      divider: baseTheme.divider,
    },
    typography: baseTheme.typography,
    shape: baseTheme.shape,
    spacing: baseTheme.spacing,
    zIndex: baseTheme.zIndex,
    transitions: baseTheme.transitions,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: baseTheme.shape.borderRadius,
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
