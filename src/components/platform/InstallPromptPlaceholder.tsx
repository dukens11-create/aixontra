'use client';

import { useState } from 'react';
import { useI18n } from '@/components/providers/I18nProvider';

export function InstallPromptPlaceholder() {
  const [dismissed, setDismissed] = useState(false);
  const { t } = useI18n();
  if (dismissed) return null;

  return (
    <div className="fixed bottom-32 right-3 z-40 max-w-xs rounded-xl border border-cyan-500/30 bg-slate-950/90 p-3 text-xs shadow-xl md:bottom-24">
      <p className="font-semibold text-cyan-200">{t('installPrompt.title')}</p>
      <p className="mt-1 text-slate-300">{t('installPrompt.body')}</p>
      <button className="badge mt-2" onClick={() => setDismissed(true)}>{t('installPrompt.dismiss')}</button>
    </div>
  );
}
