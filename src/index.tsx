import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

declare global {
  interface Window {
    Telegram: {
      WebApp: any;
    };
  }
}

// Initialize WebApp
const initTelegramWebApp = () => {
  if (window.Telegram?.WebApp) {
    // Expand the Mini App to full viewport
    window.Telegram.WebApp.expand();
    
    // Set the app header color
    window.Telegram.WebApp.setHeaderColor('#000000');
    
    // Enable the back button
    window.Telegram.WebApp.BackButton.show();
    
    // Handle back button click
    window.Telegram.WebApp.BackButton.onClick(() => {
      window.Telegram.WebApp.close();
    });
    
    // Log WebApp initialization
    console.log('Telegram WebApp initialized:', window.Telegram.WebApp.initData);
  } else {
    console.warn('Telegram WebApp not detected. Running in browser mode.');
  }
};

// Initialize the app
const initApp = () => {
  const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
  );

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Initialize WebApp and then the React app
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initTelegramWebApp();
    initApp();
  });
} else {
  initTelegramWebApp();
  initApp();
}
