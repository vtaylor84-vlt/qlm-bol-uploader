import en, { type MessageKey } from './en.ts';
import es from './es.ts';
import bs from './bs.ts';
import type { AppLocale, MessageParams } from '../types.ts';

const catalogs: Record<AppLocale, Partial<Record<MessageKey, string>>> = {
  en,
  es,
  bs,
};

export function translate(
  locale: AppLocale,
  key: MessageKey,
  params?: MessageParams
): string {
  const raw = catalogs[locale]?.[key] ?? en[key] ?? String(key);
  if (!params) return raw;
  return Object.keys(params).reduce(
    (text, name) => text.replace(new RegExp(`\\{${name}\\}`, 'g'), String(params[name])),
    raw
  );
}

export function hasMessageKey(key: string): key is MessageKey {
  return Object.prototype.hasOwnProperty.call(en, key);
}

export { en, es, bs };
export type { MessageKey };
