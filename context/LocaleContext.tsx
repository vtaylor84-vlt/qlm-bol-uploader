import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AppLocale, MessageParams } from '../i18n/types.ts';
import type { MessageKey } from '../i18n/messages/en.ts';
import { applyDocumentLocale, readStoredLocale, writeStoredLocale } from '../i18n/index.ts';
import { translate as translateFn } from '../i18n/messages/index.ts';

interface LocaleContextValue {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  t: (key: MessageKey, params?: MessageParams) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<AppLocale>(() => readStoredLocale());

  useEffect(() => {
    applyDocumentLocale(locale);
  }, [locale]);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    writeStoredLocale(next);
    applyDocumentLocale(next);
  }, []);

  const t = useCallback(
    (key: MessageKey, params?: MessageParams) => translateFn(locale, key, params),
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
};

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function useT(): LocaleContextValue['t'] {
  return useLocale().t;
}

/** Optional hook when a component may render outside the provider during migration. */
export function useLocaleOptional(): LocaleContextValue | null {
  return useContext(LocaleContext);
}
