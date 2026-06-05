import "./globals.css";
import Nav from "@/components/Nav";
import { GlobalPlayer } from "@/components/platform/GlobalPlayer";
import { MobileBottomNav } from "@/components/platform/MobileBottomNav";
import { InstallPromptPlaceholder } from "@/components/platform/InstallPromptPlaceholder";
import { ServiceWorkerRegistration } from "@/components/platform/ServiceWorkerRegistration";
import { OfflinePlaybackPlaceholder } from "@/components/platform/OfflinePlaybackPlaceholder";
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
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background">
        <ServiceWorkerRegistration />
        <Nav />
        <main className="container">{children}</main>
        <MobileBottomNav />
        <OfflinePlaybackPlaceholder />
        <InstallPromptPlaceholder />
        <GlobalPlayer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
