import "./globals.css";
import Nav from "./components/Nav";

export const metadata = {
  title: "AIXENTRA",
  description: "Curated AI Music Gallery",
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
