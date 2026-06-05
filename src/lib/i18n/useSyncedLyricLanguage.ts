'use client';

import { type Dispatch, type SetStateAction, useEffect } from 'react';
import { getLyricLanguageName, type SupportedLocale } from './config';

export function useSyncedLyricLanguage(
  locale: SupportedLocale,
  initialLanguage: string,
  setLanguage: Dispatch<SetStateAction<string>>,
) {
  useEffect(() => {
    setLanguage((current) => (current === initialLanguage ? getLyricLanguageName(locale) : current));
  }, [initialLanguage, locale, setLanguage]);
}
