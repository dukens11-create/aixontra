'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_LOCALE,
  getLocaleConfig,
  LOCALE_STORAGE_KEY,
  resolveLocale,
  SUPPORTED_UI_LOCALES,
  type SupportedLocale,
} from '@/lib/i18n/config';
import { getMessageValue } from '@/lib/i18n/messages';

type TranslationStatus = 'loading' | 'ready' | 'fallback';

type MessageValue = string | string[] | Record<string, unknown>;

type I18nContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
  tm: (key: string) => MessageValue;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
  formatDateTime: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string;
  ready: boolean;
  status: TranslationStatus;
  dir: 'ltr' | 'rtl';
};

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, values?: Record<string, string | number>) {
  if (!values) return template;
  return Object.entries(values).reduce((message, [key, value]) => {
    return message.replaceAll(`{${key}}`, String(value));
  }, template);
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<SupportedLocale>(DEFAULT_LOCALE);
  const [status, setStatus] = useState<TranslationStatus>('loading');

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    const browserLocale = window.navigator.languages?.[0] ?? window.navigator.language;
    const sourceValue = storedLocale ?? browserLocale;
    const resolvedLocale = resolveLocale(sourceValue);
    const normalizedSource = sourceValue?.toLowerCase() ?? '';
    const isDirectMatch = normalizedSource === resolvedLocale || normalizedSource.startsWith(`${resolvedLocale}-`);

    setLocale(resolvedLocale);
    setStatus(sourceValue && !isDirectMatch ? 'fallback' : 'ready');
  }, []);

  useEffect(() => {
    const localeConfig = getLocaleConfig(locale);
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = localeConfig.dir;
    if (status === 'loading') {
      setStatus('ready');
    }
  }, [locale, status]);

  const value = useMemo<I18nContextValue>(() => {
    const localeConfig = getLocaleConfig(locale);
    const intlLocale = localeConfig.intlLocale;

    return {
      locale,
      setLocale,
      ready: status !== 'loading',
      status,
      dir: localeConfig.dir,
      t: (key, values) => {
        const message = getMessageValue(locale, key);
        return typeof message === 'string' ? interpolate(message, values) : key;
      },
      tm: (key) => getMessageValue(locale, key) as MessageValue,
      formatNumber: (number, options) => new Intl.NumberFormat(intlLocale, options).format(number),
      formatCurrency: (number, currency = 'USD') =>
        new Intl.NumberFormat(intlLocale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(number),
      formatDateTime: (value, options) =>
        new Intl.DateTimeFormat(intlLocale, options).format(value instanceof Date ? value : new Date(value)),
    };
  }, [locale, status]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export function useLocaleOptions() {
  const { t } = useI18n();
  return useMemo(
    () =>
      SUPPORTED_UI_LOCALES.map((entry) => ({
        code: entry.code,
        label: t(`options.languages.${entry.lyricLanguage}`),
        nativeName: entry.nativeName,
      })),
    [t],
  );
}
