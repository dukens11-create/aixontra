import "./globals.css";
import Nav from "@/components/Nav";

export const metadata = {
  title: "AIXONTRA - Curated AI Music Gallery",
  description: "Discover and share exceptional AI-generated music. AIXONTRA curates the best AI music from creators worldwide.",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="container">{children}</main>
      </body>
    </html>
  );
}
