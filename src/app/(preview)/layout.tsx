import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClientWidgets } from "@/components/ClientWidgets";
import { SearchProvider } from "@/components/search";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { AuthProvider } from "@/contexts/AuthContext";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Preview | C&Co Formation", template: "%s | C&Co Formation" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f1929",
};

/* Shared dark vars for header & footer */
const darkVars = {
  "--background": "216 30% 12%",
  "--foreground": "0 0% 98%",
  "--primary": "204 64% 45%",
  "--primary-foreground": "0 0% 100%",
  "--secondary": "216 25% 18%",
  "--secondary-foreground": "0 0% 95%",
  "--muted": "216 20% 18%",
  "--muted-foreground": "215 15% 75%",
  "--accent": "216 25% 18%",
  "--accent-foreground": "0 0% 95%",
  "--border": "216 20% 22%",
  "--input": "216 20% 22%",
  "--ring": "204 64% 45%",
  "--card": "216 30% 14%",
  "--card-foreground": "0 0% 98%",
  "--popover": "216 30% 14%",
  "--popover-foreground": "0 0% 98%",
  "--destructive": "0 84% 60%",
  "--destructive-foreground": "0 0% 100%",
  backgroundColor: "#121B2A",
  color: "#f8fafc",
} as React.CSSProperties;

/* Light vars for main content */
const lightVars = {
  "--primary": "204 64% 34%",
  "--primary-foreground": "0 0% 100%",
  "--ring": "204 64% 34%",
  "--background": "0 0% 100%",
  "--foreground": "0 0% 7%",
  "--card": "0 0% 100%",
  "--card-foreground": "0 0% 7%",
  "--popover": "0 0% 100%",
  "--popover-foreground": "0 0% 7%",
  "--secondary": "210 20% 96%",
  "--secondary-foreground": "0 0% 20%",
  "--muted": "210 15% 96%",
  "--muted-foreground": "0 0% 45%",
  "--accent": "210 15% 96%",
  "--accent-foreground": "0 0% 20%",
  "--border": "210 10% 92%",
  "--input": "210 10% 92%",
  "--destructive": "0 84% 60%",
  "--destructive-foreground": "0 0% 100%",
  backgroundColor: "#ffffff",
  color: "#111827",
} as React.CSSProperties;

export default function PreviewLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning className={jakarta.variable} data-scroll-behavior="smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://sxadbvezilpcldmncjrk.supabase.co" />
        <style dangerouslySetInnerHTML={{ __html: `
          .preview-font, .preview-font * { font-family: var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif !important; }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes heroKenBurns { 0% { transform: scale(1) translate(0,0); } 100% { transform: scale(1.12) translate(-1.5%,-1%); } }
          @keyframes slideProgress { 0% { width: 0%; } 100% { width: 100%; } }
          @keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          @media (prefers-reduced-motion: reduce) { .preview-font * { animation: none !important; } }
          .preview-header {
            --primary: 204 64% 45% !important;
            --primary-foreground: 0 0% 100% !important;
            --background: 216 30% 12% !important;
            --foreground: 0 0% 98% !important;
            --muted-foreground: 215 15% 75% !important;
            --secondary: 216 25% 18% !important;
            --secondary-foreground: 0 0% 95% !important;
            --border: 216 20% 22% !important;
            --ring: 204 64% 45% !important;
          }
          .preview-header > header { background: transparent !important; }
          .preview-header > header.h-16 { background: rgba(18,27,42,0.95) !important; backdrop-filter: blur(16px) !important; }
          .preview-light {
            --primary: 204 64% 34% !important;
            --primary-foreground: 0 0% 100% !important;
          }
          .preview-footer {
            --primary: 204 64% 45% !important;
            --primary-foreground: 0 0% 100% !important;
          }
        `}} />
      </head>
      <body className="antialiased preview-font">
        <AuthProvider>
          <ThemeProvider>
            <SearchProvider>
              {/* Header — transparent, fond au scroll */}
              <div className="preview-header" style={{ ...darkVars, backgroundColor: "transparent", position: "relative", zIndex: 50 }}>
                <Header />
              </div>

              {/* Main content — light */}
              <div className="light preview-light" style={lightVars}>
                <main>{children}</main>
              </div>

              {/* Footer — dark navy */}
              <div className="preview-footer" style={darkVars}>
                <Footer />
              </div>

              <ClientWidgets />
              <GoogleAnalytics />
            </SearchProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
