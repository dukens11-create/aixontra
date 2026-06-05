'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '@/components/providers/I18nProvider';

const links = [
  { href: '/feed', labelKey: 'mobileNav.feed' },
  { href: '/generate', labelKey: 'mobileNav.create' },
  { href: '/lyrics-studio', labelKey: 'mobileNav.lyrics' },
  { href: '/trending', labelKey: 'mobileNav.trend' },
  { href: '/marketplace', labelKey: 'mobileNav.shop' },
  { href: '/dashboard/creator', labelKey: 'mobileNav.studio' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <nav className="fixed bottom-16 left-0 right-0 z-40 border-t border-white/10 bg-black/80 px-2 py-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-6 gap-1 text-center text-xs">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link href={link.href} className={`block rounded-lg px-2 py-2 ${active ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300'}`}>
                {t(link.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
