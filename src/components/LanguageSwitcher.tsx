'use client';

import { useI18n, useLocaleOptions } from '@/components/providers/I18nProvider';
import type { SupportedLocale } from '@/lib/i18n/config';

export function LanguageSwitcher() {
  const { locale, setLocale, ready, status, t } = useI18n();
  const options = useLocaleOptions();

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-slate-400" htmlFor="language-switcher">
        {t('common.language')}
      </label>
      <select
        id="language-switcher"
        className="select min-w-[12rem]"
        value={locale}
        onChange={(event) => setLocale(event.target.value as SupportedLocale)}
        aria-label={t('common.language')}
      >
        {options.map((option) => (
          <option key={option.code} value={option.code}>
            {option.nativeName} · {option.label}
          </option>
        ))}
      </select>
      {!ready && <span className="text-[11px] text-slate-500">{t('common.loadingTranslations')}</span>}
      {ready && status === 'fallback' && <span className="text-[11px] text-amber-300">{t('common.fallbackNotice')}</span>}
    </div>
  );
}
