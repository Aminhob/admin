import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { telegramWebApp } from '@/lib/telegram';
import { toast } from 'react-hot-toast';

type AppContextType = {
  // Authentication
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  
  // Theme
  theme: string;
  setTheme: (theme: string) => void;
  
  // Language
  language: string;
  setLanguage: (language: string) => void;
  
  // UI State
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  
  // Methods
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

type AppProviderProps = {
  children: ReactNode;
};

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Authentication state
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isAgent, setIsAgent] = useState<boolean>(false);
  
 // UI state
  const [theme, setThemeState] = useState<string>(() => {
    // Get theme from localStorage or use system preference
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('telegram_admin_theme');
      if (savedTheme) return savedTheme;
      
      // Check for Telegram theme
      if (telegramWebApp.isTelegramWebApp()) {
        return telegramWebApp.getTheme();
      }
      
      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });
  
  const [language, setLanguageState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('telegram_admin_language') || 'en';
    }
    return 'en';
  });
  
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  // Set theme in localStorage and update document
  const setTheme = useCallback((newTheme: string) => {
    setThemeState(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, []);
  
  useEffect(() => {
    if (theme) {
      localStorage.setItem('telegram_admin_theme', theme);
    }
  }, [theme]);
  
  // Set language in localStorage
  const setLanguage = useCallback((newLanguage: string) => {
    setLanguageState(newLanguage);
  }, []);
  
  useEffect(() => {
    localStorage.setItem('telegram_admin_language', language);
  }, [language]);
  
  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);
  
  // Check if user has admin or agent role
  const checkUserRole = useCallback(async (currentUser: User | null) => {
    if (!currentUser) {
      setIsAdmin(false);
      setIsAgent(false);
      return;
    }
    
    try {
      // Here you would typically fetch the user's role from your database
      // For now, we'll use a simple check based on email
      if (currentUser.email?.endsWith('@admin.com')) {
        setIsAdmin(true);
        setIsAgent(false);
      } else if (currentUser.email?.endsWith('@agent.com')) {
        setIsAdmin(false);
        setIsAgent(true);
      } else {
        setIsAdmin(false);
        setIsAgent(false);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsAdmin(false);
      setIsAgent(false);
    }
  }, []);
  
  // Handle user authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await checkUserRole(currentUser);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, [checkUserRole]);
  
  // Apply theme on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  // Handle Telegram theme changes
  useEffect(() => {
    if (!telegramWebApp.isTelegramWebApp()) return;
    
    const handleThemeChange = () => {
      const newTheme = telegramWebApp.getTheme();
      setTheme(newTheme);
    };

    // Set initial theme
    const tgTheme = telegramWebApp.getTheme();
    setTheme(tgTheme);
    
    // Listen for theme changes through the window event
    // Telegram WebApp will dispatch this event when theme changes
    window.addEventListener('themeChanged', handleThemeChange);
    
    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, [setTheme]);
  
  // Logout handler
  const logout = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      setIsAdmin(false);
      setIsAgent(false);
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out. Please try again.');
    }
  }, []);
  
  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!user) return;
    
    try {
      // Refresh the user's token
      await user.getIdToken(true);
      
      // Here you would typically fetch the latest user data from your database
      // and update the user state accordingly
      await checkUserRole(user);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [user, checkUserRole]);
  
  // Context value
  const value = {
    // Authentication
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin,
    isAgent,
    
    // Theme
    theme,
    setTheme,
    
    // Language
    language,
    setLanguage,
    
    // UI State
    isSidebarOpen,
    toggleSidebar,
    
    // Methods
    logout,
    refreshUser,
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the app context
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
