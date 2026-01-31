import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "C&Co Formation | Centre de Formation Professionnelle",
    template: "%s | C&Co Formation",
  },
  description:
    "C&Co Formation, votre centre de formation professionnelle certifié Qualiopi. Formations en Sécurité, Petite Enfance et Santé. Plus de 25 000 stagiaires formés.",
  keywords: [
    "formation professionnelle",
    "centre de formation",
    "SST",
    "sécurité incendie",
    "petite enfance",
    "CAP AEPE",
    "Qualiopi",
    "formation continue",
  ],
  authors: [{ name: "C&Co Formation" }],
  creator: "C&Co Formation",
  publisher: "C&Co Formation",
  metadataBase: new URL("https://candco-formation.fr"),
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "C&Co Formation",
    title: "C&Co Formation | Centre de Formation Professionnelle",
    description:
      "Votre centre de formation professionnelle certifié Qualiopi. Formations en Sécurité, Petite Enfance et Santé.",
  },
  twitter: {
    card: "summary_large_image",
    title: "C&Co Formation | Centre de Formation Professionnelle",
    description:
      "Votre centre de formation professionnelle certifié Qualiopi.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
