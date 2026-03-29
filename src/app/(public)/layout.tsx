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

// SEO Metadata globales
export const metadata: Metadata = {
  title: {
    default: "C&Co Formation | Centre de Formation Professionnelle Certifié Qualiopi",
    template: "%s | C&Co Formation",
  },
  description:
    "C&Co Formation, organisme de formation certifié Qualiopi. Formations professionnelles en Sécurité (SST, incendie), Petite Enfance (CAP AEPE) et Santé. Financement OPCO. +25 000 stagiaires formés, 98% de réussite.",
  keywords: [
    "formation professionnelle",
    "centre de formation",
    "formation SST",
    "formation sécurité incendie",
    "formation petite enfance",
    "CAP AEPE",
    "formation santé",
    "Qualiopi",
    "formation continue",
    "OPCO",
    "financement formation",
    "formation certifiante",
    "organisme de formation",
    "formation entreprise",
  ],
  authors: [{ name: "C&Co Formation", url: "https://candco.fr" }],
  creator: "C&Co Formation",
  publisher: "C&Co Formation",
  metadataBase: new URL("https://candco.fr"),
  alternates: {
    canonical: "/",
    languages: {
      "fr-FR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://candco.fr",
    siteName: "C&Co Formation",
    title: "C&Co Formation | Centre de Formation Professionnelle Certifié Qualiopi",
    description:
      "Organisme certifié Qualiopi. Formations en Sécurité, Petite Enfance et Santé. Financement OPCO. +25 000 stagiaires, 98% réussite.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "C&Co Formation - Centre de Formation Professionnelle",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Nicolas_candco",
    creator: "@Nicolas_candco",
    title: "C&Co Formation | Centre de Formation Professionnelle",
    description:
      "Organisme certifié Qualiopi. Formations en Sécurité, Petite Enfance et Santé. +25 000 stagiaires formés.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Ajouter vos codes de vérification ici
    // google: "votre-code-google",
    // yandex: "votre-code-yandex",
    // bing: "votre-code-bing",
  },
  category: "education",
};

// Viewport configuration
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f1929",
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

// JSON-LD Structured Data Schemas
function JsonLdSchemas() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://candco.fr/#organization",
    name: "C&Co Formation",
    alternateName: "C&Co",
    url: "https://candco.fr",
    logo: {
      "@type": "ImageObject",
      url: "https://candco.fr/logo.svg",
      width: 200,
      height: 60,
    },
    image: "https://candco.fr/og-image.jpg",
    description:
      "Centre de formation professionnelle certifié Qualiopi spécialisé en Sécurité, Petite Enfance et Santé.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "340 chemin du plan marseillais",
      addressLocality: "Bouc-bel-air",
      postalCode: "13320",
      addressCountry: "FR",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+33762596653",
        contactType: "customer service",
        availableLanguage: ["French"],
        areaServed: "FR",
      },
    ],
    sameAs: [
      "https://www.facebook.com/CandCoFormation",
      "https://fr.linkedin.com/company/candco-formation",
      "https://x.com/Nicolas_candco",
      "https://www.youtube.com/@CandCoFormation",
    ],
    foundingDate: "2009",
    numberOfEmployees: {
      "@type": "QuantitativeValue",
      minValue: 10,
      maxValue: 50,
    },
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "@id": "https://candco.fr/#localbusiness",
    name: "C&Co Formation",
    image: "https://candco.fr/og-image.jpg",
    url: "https://candco.fr",
    telephone: "+33762596653",
    email: "contact@candco.fr",
    address: {
      "@type": "PostalAddress",
      streetAddress: "340 chemin du plan marseillais",
      addressLocality: "Bouc-bel-air",
      postalCode: "13320",
      addressRegion: "Provence-Alpes-Côte d'Azur",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.4533,
      longitude: 5.4128,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    priceRange: "€€",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "1200",
      bestRating: "5",
      worstRating: "1",
    },
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "Qualiopi",
      recognizedBy: {
        "@type": "Organization",
        name: "France Compétences",
      },
    },
  };

  const webSiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://candco.fr/#website",
    url: "https://candco.fr",
    name: "C&Co Formation",
    description: "Centre de formation professionnelle certifié Qualiopi",
    publisher: {
      "@id": "https://candco.fr/#organization",
    },
    inLanguage: "fr-FR",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://candco.fr/formations?search={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(localBusinessSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webSiteSchema),
        }}
      />
    </>
  );
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning className={jakarta.variable}>
      <head>
        {/* Polyfill for crypto.randomUUID - must run before any other scripts */}
        <script dangerouslySetInnerHTML={{ __html: cryptoPolyfillScript }} />
        <JsonLdSchemas />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Preconnect pour Supabase - accélère les requêtes */}
        <link rel="preconnect" href="https://sxadbvezilpcldmncjrk.supabase.co" />
        <link rel="dns-prefetch" href="https://sxadbvezilpcldmncjrk.supabase.co" />
        <style dangerouslySetInnerHTML={{ __html: `
          body, body * { font-family: var(--font-jakarta), 'Plus Jakarta Sans', system-ui, sans-serif !important; }
          @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes heroKenBurns { 0% { transform: scale(1) translate(0,0); } 100% { transform: scale(1.12) translate(-1.5%,-1%); } }
          @keyframes kenBurnsLoop { 0% { transform: scale(1) translate(0,0); } 50% { transform: scale(1.15) translate(-2%,-1.5%); } 100% { transform: scale(1) translate(0,0); } }
          @keyframes heroSlideKB { 0%{opacity:0;transform:scale(1)} 8%{opacity:1} 42%{opacity:1;transform:scale(1.12) translate(-1.5%,-1%)} 50%{opacity:0;transform:scale(1.12)} 100%{opacity:0;transform:scale(1)} }
          @keyframes slideProgress { 0% { width: 0%; } 100% { width: 100%; } }
          @keyframes fadeSlideUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          @media (prefers-reduced-motion: reduce) { body * { animation: none !important; } }
        `}} />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            <SearchProvider>
              {/* Header — dark navy */}
              <div style={{ ...darkVars, backgroundColor: "transparent", position: "relative", zIndex: 50 }}>
                <Header />
              </div>

              {/* Main content — light */}
              <div className="light" style={lightVars}>
                <main>{children}</main>
              </div>

              {/* Footer — dark navy */}
              <div style={darkVars}>
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
