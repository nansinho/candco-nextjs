import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

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
    { media: "(prefers-color-scheme: light)", color: "#0B1120" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
};

// Polyfill script to protect against browser extensions (like MetaMask) that may block crypto.randomUUID
const cryptoPolyfillScript = `
(function() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID !== 'function') {
    crypto.randomUUID = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0;
        var v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }
})();
`;

export default function AdminRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning data-scroll-behavior="smooth" className={jakarta.variable}>
      <head>
        {/* Polyfill for crypto.randomUUID - must run before any other scripts */}
        <script dangerouslySetInnerHTML={{ __html: cryptoPolyfillScript }} />
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
