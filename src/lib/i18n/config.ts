export const SUPPORTED_UI_LOCALES = [
  {
    code: 'en',
    intlLocale: 'en-US',
    lyricLanguage: 'English',
    nativeName: 'English',
    dir: 'ltr' as const,
  },
  {
    code: 'ht',
    intlLocale: 'ht',
    lyricLanguage: 'Haitian Creole',
    nativeName: 'Kreyòl Ayisyen',
    dir: 'ltr' as const,
  },
  {
    code: 'fr',
    intlLocale: 'fr-FR',
    lyricLanguage: 'French',
    nativeName: 'Français',
    dir: 'ltr' as const,
  },
  {
    code: 'es',
    intlLocale: 'es-ES',
    lyricLanguage: 'Spanish',
    nativeName: 'Español',
    dir: 'ltr' as const,
  },
  {
    code: 'pt',
    intlLocale: 'pt-BR',
    lyricLanguage: 'Portuguese',
    nativeName: 'Português',
    dir: 'ltr' as const,
  },
] as const;

export type SupportedLocale = (typeof SUPPORTED_UI_LOCALES)[number]['code'];

export const DEFAULT_LOCALE: SupportedLocale = 'en';
export const LOCALE_STORAGE_KEY = 'aixontra:locale';
export const SUPPORTED_AI_LANGUAGES = SUPPORTED_UI_LOCALES.map((entry) => entry.lyricLanguage);

export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_UI_LOCALES.some((entry) => entry.code === value);
}

export function resolveLocale(value?: string | null): SupportedLocale {
  if (!value) return DEFAULT_LOCALE;

  const normalized = value.toLowerCase();
  if (isSupportedLocale(normalized)) {
    return normalized;
  }

  const matched = SUPPORTED_UI_LOCALES.find((entry) => normalized.startsWith(entry.code));
  return matched?.code ?? DEFAULT_LOCALE;
}

export function getLocaleConfig(locale: SupportedLocale) {
  return SUPPORTED_UI_LOCALES.find((entry) => entry.code === locale) ?? SUPPORTED_UI_LOCALES[0];
}

export function getLyricLanguageName(locale: SupportedLocale) {
  return getLocaleConfig(locale).lyricLanguage;
}

export function getSupportedLocaleCodes() {
  return SUPPORTED_UI_LOCALES.map((entry) => entry.code);
}
