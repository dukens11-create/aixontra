import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import ht from '@/locales/ht.json';
import pt from '@/locales/pt.json';
import { DEFAULT_LOCALE, type SupportedLocale } from './config';

export type TranslationMessages = typeof en;

export const messagesByLocale: Record<SupportedLocale, TranslationMessages> = {
  en,
  ht,
  fr,
  es,
  pt,
};

function getNestedValue(source: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((value, key) => {
    if (value && typeof value === 'object' && key in value) {
      return (value as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

export function getMessages(locale: SupportedLocale) {
  return messagesByLocale[locale] ?? messagesByLocale[DEFAULT_LOCALE];
}

export function getMessageValue(locale: SupportedLocale, path: string): unknown {
  return getNestedValue(getMessages(locale), path) ?? getNestedValue(getMessages(DEFAULT_LOCALE), path);
}
