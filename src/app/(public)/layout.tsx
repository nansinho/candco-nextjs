import type { Metadata, Viewport } from "next";
import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClientWidgets } from "@/components/ClientWidgets";

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0d0d0d" },
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
    <html lang="fr" suppressHydrationWarning>
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
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <Header />
          <main className="pt-16 lg:pt-20">{children}</main>
          <Footer />
          {/* Widgets lazy-loaded côté client */}
          <ClientWidgets />
        </ThemeProvider>
      </body>
    </html>
  );
}
