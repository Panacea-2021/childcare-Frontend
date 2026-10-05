'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { translateParent } from './translations';
import {
  DEFAULT_PARENT_LANGUAGE,
  isParentLanguage,
  PARENT_LOCALE_STORAGE_KEY,
  type ParentLanguage,
  type ParentMessageKey,
} from './types';

type ParentLocaleContextValue = {
  ready: boolean;
  language: ParentLanguage;
  setLanguage: (language: ParentLanguage) => void;
  t: (key: ParentMessageKey) => string;
};

const ParentLocaleContext = createContext<ParentLocaleContextValue | null>(null);

function readStoredLanguage(): ParentLanguage {
  try {
    const raw = window.localStorage.getItem(PARENT_LOCALE_STORAGE_KEY);
    if (raw && isParentLanguage(raw)) return raw;
  } catch {
    /* ignore */
  }
  return DEFAULT_PARENT_LANGUAGE;
}

export function ParentLocaleProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [language, setLanguageState] = useState<ParentLanguage>(DEFAULT_PARENT_LANGUAGE);

  useEffect(() => {
    setLanguageState(readStoredLanguage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.lang =
      language === 'English' || language === 'English (UK)'
        ? 'en'
        : language === 'Hindi'
          ? 'hi'
          : language === 'Dutch'
            ? 'nl'
            : language === 'French'
              ? 'fr'
              : language === 'German'
                ? 'de'
                : language === 'Spanish'
                  ? 'es'
                  : language === 'Arabic'
                    ? 'ar'
                    : 'en';
    document.documentElement.dir = language === 'Arabic' ? 'rtl' : 'ltr';
  }, [language, ready]);

  const setLanguage = useCallback((next: ParentLanguage) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(PARENT_LOCALE_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  const t = useCallback(
    (key: ParentMessageKey) => translateParent(language, key),
    [language],
  );

  const value = useMemo(
    () => ({ ready, language, setLanguage, t }),
    [ready, language, setLanguage, t],
  );

  return <ParentLocaleContext.Provider value={value}>{children}</ParentLocaleContext.Provider>;
}

export function useParentLocale() {
  const ctx = useContext(ParentLocaleContext);
  if (!ctx) {
    throw new Error('useParentLocale must be used within ParentLocaleProvider');
  }
  return ctx;
}
