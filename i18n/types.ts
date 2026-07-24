/** Supported Driver Workspace locales. */
export type AppLocale = 'en' | 'es' | 'bs';

export const APP_LOCALES: readonly AppLocale[] = ['en', 'es', 'bs'] as const;

/** Native language names shown in the selector (not translated). */
export const LOCALE_NATIVE_NAMES: Record<AppLocale, string> = {
  en: 'English',
  es: 'Español',
  bs: 'Bosanski',
};

export const LOCALE_STORAGE_KEY = 'elm_driver_locale';

export type MessageParams = Record<string, string | number>;
