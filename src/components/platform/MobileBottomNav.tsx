'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/feed', label: 'Feed' },
  { href: '/generate', label: 'Create' },
  { href: '/trending', label: 'Trend' },
  { href: '/marketplace', label: 'Shop' },
  { href: '/audio-studio', label: 'Studio' },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-16 left-0 right-0 z-40 border-t border-white/10 bg-black/80 px-2 py-2 backdrop-blur md:hidden">
      <ul className="grid grid-cols-5 gap-1 text-center text-xs">
        {links.map((link) => {
          const active = pathname.startsWith(link.href);
          return (
            <li key={link.href}>
              <Link href={link.href} className={`block rounded-lg px-2 py-2 ${active ? 'bg-cyan-500/20 text-cyan-200' : 'text-slate-300'}`}>
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
