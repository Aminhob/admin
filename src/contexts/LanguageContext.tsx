import React, { createContext, useContext, useState } from 'react';
import { Language } from '../types';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'so', name: 'Somali', flag: '🇸🇴' },
];

const translations = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.users': 'Users',
    'nav.notifications': 'Notifications',
    'nav.logout': 'Logout',
    
    // Login
    'login.title': 'Admin Login',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.submit': 'Sign In',
    'login.error': 'Invalid credentials',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.totalUsers': 'Total Users',
    'dashboard.activeUsers': 'Active Users',
    'dashboard.expiredUsers': 'Expired Users',
    'dashboard.revenue': 'Revenue',
    
    // Users
    'users.title': 'User Management',
    'users.search': 'Search users...',
    'users.name': 'Name',
    'users.email': 'Email',
    'users.status': 'Status',
    'users.expiry': 'Expiry Date',
    'users.actions': 'Actions',
    'users.suspend': 'Suspend',
    'users.activate': 'Activate',
    'users.extend': 'Extend',
    
    // Status
    'status.active': 'Active',
    'status.expired': 'Expired',
    'status.suspended': 'Suspended',
    
    // Notifications
    'notifications.title': 'Send Notification',
    'notifications.messageTitle': 'Title',
    'notifications.message': 'Message',
    'notifications.send': 'Send',
    'notifications.success': 'Notification sent successfully',
  },
  so: {
    // Navigation
    'nav.dashboard': 'Shabakada',
    'nav.users': 'Isticmaalayaasha',
    'nav.notifications': 'Ogeysiisyo',
    'nav.logout': 'Ka bax',
    
    // Login
    'login.title': 'Gelitaanka Maamulaha',
    'login.email': 'Iimayl',
    'login.password': 'Furaha sirta ah',
    'login.submit': 'Gal',
    'login.error': 'Xog khaldan',
    
    // Dashboard
    'dashboard.title': 'Shabakada',
    'dashboard.totalUsers': 'Wadarta Isticmaalayaasha',
    'dashboard.activeUsers': 'Isticmaalayaasha Firfircoon',
    'dashboard.expiredUsers': 'Isticmaalayaasha Dhacay',
    'dashboard.revenue': 'Dakhliga',
    
    // Users
    'users.title': 'Maaraynta Isticmaalayaasha',
    'users.search': 'Raadi isticmaalayaasha...',
    'users.name': 'Magaca',
    'users.email': 'Iimayl',
    'users.status': 'Xaalada',
    'users.expiry': 'Taariikhda Dhicitaanka',
    'users.actions': 'Ficillada',
    'users.suspend': 'Jooji',
    'users.activate': 'Firfircooni',
    'users.extend': 'Kordhii',
    
    // Status
    'status.active': 'Firfircoon',
    'status.expired': 'Dhacay',
    'status.suspended': 'La joojiyay',
    
    // Notifications
    'notifications.title': 'Dir Ogeysiis',
    'notifications.messageTitle': 'Cinwaanka',
    'notifications.message': 'Fariinta',
    'notifications.send': 'Dir',
    'notifications.success': 'Ogeysiiska si guul leh ayaa loo diray',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
  };

  const t = (key: string): string => {
    return (translations[currentLanguage.code] as any)[key] || key;
  };

  const value = {
    currentLanguage,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};
