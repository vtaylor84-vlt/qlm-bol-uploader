import type { AppLocale } from './types.ts';
import { APP_LOCALES, LOCALE_STORAGE_KEY } from './types.ts';
import { translate } from './messages/index.ts';
import type { MessageKey } from './messages/en.ts';
import type { MessageParams } from './types.ts';

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === 'string' && (APP_LOCALES as readonly string[]).includes(value);
}

export function readStoredLocale(): AppLocale {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (isAppLocale(raw)) return raw;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function writeStoredLocale(locale: AppLocale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
}

export function applyDocumentLocale(locale: AppLocale): void {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = locale === 'bs' ? 'bs' : locale;
}

/** Pure translator for non-React callers (tests, utilities). */
export function tLocale(
  locale: AppLocale,
  key: MessageKey,
  params?: MessageParams
): string {
  return translate(locale, key, params);
}

export { translate };
export type { AppLocale, MessageKey, MessageParams };
export {
  APP_LOCALES,
  LOCALE_NATIVE_NAMES,
  LOCALE_STORAGE_KEY,
} from './types.ts';
