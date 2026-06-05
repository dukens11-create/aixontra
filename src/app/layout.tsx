import "./globals.css";
import Nav from "@/components/Nav";
import { GlobalPlayer } from "@/components/platform/GlobalPlayer";
import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "AIXENTRA - AI Music Platform",
  description: "Create, stream, remix, and monetize AI music with a premium mobile-first experience.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-background">
        <Nav />
        <main className="container">{children}</main>
        <GlobalPlayer />
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
