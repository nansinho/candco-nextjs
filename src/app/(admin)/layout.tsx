import type { Metadata, Viewport } from "next";
import "../globals.css";

// Admin-specific metadata (no SEO indexing)
export const metadata: Metadata = {
  title: {
    default: "Administration | C&Co",
    template: "%s | Admin C&Co",
  },
  robots: {
    index: false,
    follow: false,
  },
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
  ],
};

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        {/* Preconnect pour Supabase - accélère les requêtes */}
        <link rel="preconnect" href="https://sxadbvezilpcldmncjrk.supabase.co" />
        <link rel="dns-prefetch" href="https://sxadbvezilpcldmncjrk.supabase.co" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
