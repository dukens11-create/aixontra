import "./globals.css";
import Nav from "@/components/Nav";
import { GlobalPlayer } from "@/components/platform/GlobalPlayer";
import { MobileBottomNav } from "@/components/platform/MobileBottomNav";
import { InstallPromptPlaceholder } from "@/components/platform/InstallPromptPlaceholder";
import { I18nProvider } from "@/components/providers/I18nProvider";
import { Toaster } from "react-hot-toast";
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: "AIXENTRA - AI Music Platform",
  description: "Create, stream, remix, and monetize AI music with a premium mobile-first experience.",
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0b1020',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background">
        <I18nProvider>
          <Nav />
          <main className="container">{children}</main>
          <MobileBottomNav />
          <InstallPromptPlaceholder />
          <GlobalPlayer />
          <Toaster position="top-right" />
        </I18nProvider>
      </body>
    </html>
  );
}
