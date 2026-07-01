import { useCallback, useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          start_param?: string;
        };
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          setText: (text: string) => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
          enable: () => void;
          disable: () => void;
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        themeParams: {
          bg_color?: string;
          text_color?: string;
          hint_color?: string;
          link_color?: string;
          button_color?: string;
          button_text_color?: string;
          secondary_bg_color?: string;
        };
        colorScheme: 'light' | 'dark';
        isExpanded: boolean;
        viewportHeight: number;
        viewportStableHeight: number;
        setHeaderColor: (color: string) => void;
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
        sendData: (data: string) => void;
        BackButton: {
          isVisible: boolean;
          show: () => void;
          hide: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
      };
    };
  }
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [colorScheme, setColorScheme] = useState<'light' | 'dark'>('dark');

  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg) {
      setIsReady(true);
      return;
    }

    tg.ready();
    tg.expand();

    try {
      tg.setHeaderColor('#0a0a0a');
    } catch {
      // Older Telegram clients don't support setHeaderColor
    }

    setColorScheme(tg.colorScheme || 'dark');

    const handleThemeChange = () => {
      setColorScheme(tg.colorScheme || 'dark');
      applyThemeParams(tg.themeParams);
    };

    tg.onEvent('themeChanged', handleThemeChange);

    applyThemeParams(tg.themeParams);
    setIsReady(true);

    return () => {
      tg.offEvent('themeChanged', handleThemeChange);
    };
  }, []);

  const applyThemeParams = (params: NonNullable<Window['Telegram']>['WebApp']['themeParams']) => {
    if (!params) return;
    const root = document.documentElement;
    if (params.bg_color) root.style.setProperty('--tg-bg', params.bg_color);
    if (params.text_color) root.style.setProperty('--tg-text', params.text_color);
    if (params.button_color) root.style.setProperty('--tg-button', params.button_color);
    if (params.secondary_bg_color) root.style.setProperty('--tg-secondary-bg', params.secondary_bg_color);
  };

  const showMainButton = useCallback((text: string, callback: () => void) => {
    if (!tg?.MainButton) return;
    tg.MainButton.setText(text);
    tg.MainButton.color = '#f5c518';
    tg.MainButton.textColor = '#0a0a0a';
    tg.MainButton.show();
    tg.MainButton.onClick(callback);
  }, [tg]);

  const hideMainButton = useCallback(() => {
    if (!tg?.MainButton) return;
    tg.MainButton.hide();
  }, [tg]);

  const hapticImpact = useCallback((style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
    tg?.HapticFeedback?.impactOccurred(style);
  }, [tg]);

  const hapticNotify = useCallback((type: 'error' | 'success' | 'warning' = 'success') => {
    tg?.HapticFeedback?.notificationOccurred(type);
  }, [tg]);

  const showBackButton = useCallback((callback: () => void) => {
    if (!tg?.BackButton) return;
    tg.BackButton.show();
    tg.BackButton.onClick(callback);
  }, [tg]);

  const hideBackButton = useCallback(() => {
    if (!tg?.BackButton) return;
    tg.BackButton.hide();
  }, [tg]);

  return {
    tg,
    isReady,
    colorScheme,
    isDark: colorScheme === 'dark',
    user: tg?.initDataUnsafe?.user,
    initData: tg?.initData,
    showMainButton,
    hideMainButton,
    hapticImpact,
    hapticNotify,
    showBackButton,
    hideBackButton,
  };
}
