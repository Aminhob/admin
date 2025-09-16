import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { createThemeByMode, ThemeSettings } from './index';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { APP_CONFIG } from '@/config/app';
import { telegramWeb } from '@/lib/telegram';

type ThemeMode = 'light' | 'dark' | 'system';

type ThemeContextType = {
  mode: ThemeMode;
  theme: ThemeSettings;
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
  const [mode, setMode] = useLocalStorage<ThemeMode>('themeMode', defaultMode);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [isMounted, setIsMounted] = useState(false);

  // Get the effective theme mode (resolving 'system' to either 'light' or 'dark')
  const effectiveMode: 'light' | 'dark' = useMemo(() => {
    if (mode === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return mode;
  }, [mode, prefersDarkMode]);

  // Create the theme based on the effective mode
  const theme = useMemo(() => {
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
    // Apply theme class to document
    document.documentElement.setAttribute('data-theme', effectiveMode);
    
    // Set theme color meta tag for mobile browsers
    const themeColor = effectiveMode === 'dark' ? '#121212' : '#ffffff';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor);
    
    // Handle Telegram theme changes if in Telegram WebApp
    if (telegramWeb.isTelegramWebApp()) {
      const handleThemeChange = () => {
        const tgTheme = telegramWeb.getTheme();
        setMode(tgTheme);
      };
      
      // Set initial theme from Telegram
      const tgTheme = telegramWeb.getTheme();
      if (tgTheme !== effectiveMode) {
        setMode(tgTheme);
      }
      
      // Listen for theme changes
      // Note: You'll need to implement the actual event listener in the Telegram WebApp
      // This is a simplified version
      window.addEventListener('themeChanged', handleThemeChange);
      
      return () => {
        window.removeEventListener('themeChanged', handleThemeChange);
      };
    }
  }, [effectiveMode, setMode]);

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
    isDark: effectiveMode === 'dark',
    toggleTheme,
    setThemeMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
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
