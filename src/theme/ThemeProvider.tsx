import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { createThemeByMode } from './theme';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Theme } from '@mui/material/styles';

// Define the AppTheme type
type AppTheme = Theme & {
  custom: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
};

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  mode: ThemeMode;
  theme: AppTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type ThemeProviderProps = {
  children: ReactNode;
  defaultMode?: ThemeMode;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'system',
}) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useLocalStorage<ThemeMode>('themeMode', defaultMode);
  const [isMounted, setIsMounted] = useState(false);
  
  const isDark = mode === 'system' ? prefersDarkMode : mode === 'dark';
  const effectiveMode = isDark ? 'dark' : 'light';

  const theme = useMemo<AppTheme>(() => {
    return createThemeByMode(effectiveMode);
  }, [effectiveMode]);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Set a specific theme mode
  const setThemeMode = (newMode: ThemeMode) => {
    setMode(newMode);
  };

  // Apply theme to document and handle Telegram theme changes
  useEffect(() => {
    // Set document theme attribute for CSS theming
    document.documentElement.setAttribute('data-theme', effectiveMode);
    
    // Set meta theme color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#121212' : '#ffffff');
    }

    // Handle Telegram theme changes if in Telegram WebApp
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const webApp = (window as any).Telegram.WebApp;
      
      try {
        if (webApp.setHeaderColor) {
          webApp.setHeaderColor(isDark ? 'secondary_bg_color' : 'bg_color');
        }
        if (webApp.setBackgroundColor) {
          webApp.setBackgroundColor(isDark ? '#1a1a1a' : '#ffffff');
        }
        
        // Set up theme change handler
        const handleThemeChange = () => {
          if (webApp) {
            const isDarkMode = webApp.colorScheme === 'dark';
            setMode(isDarkMode ? 'dark' : 'light');
          }
        };

        // Listen for theme changes
        webApp.onEvent('themeChanged', handleThemeChange);

        // Cleanup
        return () => {
          webApp.offEvent('themeChanged', handleThemeChange);
        };
      } catch (error) {
        console.error('Error initializing Telegram WebApp theme:', error);
      }
    }
  }, [effectiveMode, isDark, setMode]);

  // Mark as mounted after first render to avoid hydration issues
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything until we're mounted on the client
  if (!isMounted) {
    return null;
  }

  const contextValue = {
    mode,
    theme,
    isDark,
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
