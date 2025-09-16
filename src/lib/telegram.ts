// Type definitions for Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            is_premium?: boolean;
            photo_url?: string;
          };
          chat_instance?: string;
          chat_type?: string;
          chat?: {
            id: number;
            type: string;
            title?: string;
            username?: string;
            photo_url?: string;
          };
          query_id?: string;
          receiver?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          start_param?: string;
          can_send_after?: number;
          auth_date: number;
          hash: string;
        };
        version: string;
        platform: string;
        colorScheme: 'light' | 'dark' | 'system';
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        headerColor: string;
        backgroundColor: string;
        isClosingConfirmationEnabled: boolean;
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          isProgressVisible: boolean;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          showProgress: (leaveActive?: boolean) => void;
          hideProgress: () => void;
          setParams: (params: { color?: string; text_color?: string; is_active?: boolean; is_visible?: boolean }) => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        enableClosingConfirmation: () => void;
        disableClosingConfirmation: () => void;
        setHeaderColor: (color: string) => void;
        setBackgroundColor: (color: string) => void;
        onEvent: (eventType: string, eventHandler: Function) => void;
        offEvent: (eventType: string, eventHandler: Function) => void;
        sendData: (data: any) => void;
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
        openLink: (url: string, options?: { try_instant_view?: boolean }) => void;
        openTelegramLink: (url: string) => void;
        openInvoice: (url: string, callback?: (status: 'paid' | 'cancelled' | 'failed' | 'pending') => void) => void;
      };
    };
  }
}

type TelegramUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
};

class TelegramWebApp {
  private static instance: TelegramWebApp;
  private webApp: any;
  private isInitialized = false;

  private constructor() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.webApp = window.Telegram.WebApp;
      this.isInitialized = true;
      this.init();
    }
  }

  public static getInstance(): TelegramWebApp {
    if (!TelegramWebApp.instance) {
      TelegramWebApp.instance = new TelegramWebApp();
    }
    return TelegramWebApp.instance;
  }

  private init(): void {
    if (!this.isInitialized) return;
    
    // Expand the WebApp to full height
    this.webApp.expand();
    
    // Enable closing confirmation
    this.webApp.enableClosingConfirmation();
    
    // Set theme change handler
    this.webApp.onEvent('themeChanged', this.handleThemeChange);
    this.webApp.onEvent('viewportChanged', this.handleViewportChange);
  }

  private handleThemeChange = (): void => {
    const theme = this.getTheme();
    document.documentElement.setAttribute('data-theme', theme);
    // Dispatch a custom event that other parts of the app can listen to
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  };

  private handleViewportChange = (): void => {
    // Handle viewport changes if needed
    console.log('Viewport changed:', this.getViewport());
  };

  // Public methods
  public isTelegramWebApp(): boolean {
    return this.isInitialized;
  }

  public getTheme(): 'light' | 'dark' | 'system' {
    if (!this.isInitialized) return 'light';
    return this.webApp.colorScheme;
  }

  public getUser(): TelegramUser | null {
    if (!this.isInitialized) return null;
    return this.webApp.initDataUnsafe?.user || null;
  }

  public getUserId(): number | null {
    const user = this.getUser();
    return user?.id || null;
  }

  public getInitData(): string {
    if (!this.isInitialized) return '';
    return this.webApp.initData;
  }

  public getViewport(): { height: number; width: number; isExpanded: boolean } {
    if (!this.isInitialized) return { height: 0, width: 0, isExpanded: false };
    return {
      height: this.webApp.viewportHeight,
      width: window.innerWidth,
      isExpanded: this.webApp.isExpanded
    };
  }

  public showMainButton(params: { text: string; color?: string; textColor?: string; isActive?: boolean }): void {
    if (!this.isInitialized) return;
    
    const { text, color, textColor, isActive = true } = params;
    
    this.webApp.MainButton.setText(text);
    
    if (color) {
      this.webApp.MainButton.color = color;
    }
    
    if (textColor) {
      this.webApp.MainButton.textColor = textColor;
    }
    
    if (isActive) {
      this.webApp.MainButton.enable();
    } else {
      this.webApp.MainButton.disable();
    }
    
    this.webApp.MainButton.show();
  }

  public hideMainButton(): void {
    if (!this.isInitialized) return;
    this.webApp.MainButton.hide();
  }

  public onMainButtonClick(callback: () => void): () => void {
    if (!this.isInitialized) return () => {};
    
    this.webApp.MainButton.onClick(callback);
    
    // Return cleanup function
    return () => this.webApp.MainButton.offClick(callback);
  }

  public showBackButton(show: boolean = true): void {
    if (!this.isInitialized) return;
    
    if (show) {
      this.webApp.BackButton.show();
    } else {
      this.webApp.BackButton.hide();
    }
  }

  public onBackButtonClick(callback: () => void): () => void {
    if (!this.isInitialized) return () => {};
    
    this.webApp.BackButton.onClick(callback);
    
    // Return cleanup function
    return () => this.webApp.BackButton.offClick(callback);
  }

  public showHapticFeedback(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium'): void {
    if (!this.isInitialized) return;
    this.webApp.HapticFeedback.impactOccurred(style);
  }

  public showNotification(type: 'error' | 'success' | 'warning' = 'success'): void {
    if (!this.isInitialized) return;
    this.webApp.HapticFeedback.notificationOccurred(type);
  }

  public closeWebApp(): void {
    if (!this.isInitialized) return;
    this.webApp.close();
  }

  public sendData(data: any): void {
    if (!this.isInitialized) return;
    this.webApp.sendData(JSON.stringify(data));
  }

  public openLink(url: string, options: { try_instant_view?: boolean } = {}): void {
    if (!this.isInitialized) {
      window.open(url, '_blank');
      return;
    }
    this.webApp.openLink(url, options);
  }
}

// Export a singleton instance
export const telegramWebApp = TelegramWebApp.getInstance();

// Export hook for React components
export const useTelegram = () => {
  return {
    webApp: telegramWebApp,
    user: telegramWebApp.getUser(),
    userId: telegramWebApp.getUserId(),
    theme: telegramWebApp.getTheme(),
    isTelegramWebApp: telegramWebApp.isTelegramWebApp(),
    viewport: telegramWebApp.getViewport(),
  };
};

// Initialize theme on load
if (typeof window !== 'undefined') {
  const theme = telegramWebApp.getTheme();
  document.documentElement.setAttribute('data-theme', theme);
}

export default telegramWebApp;
