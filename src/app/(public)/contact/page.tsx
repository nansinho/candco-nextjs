import { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact | C&Co Formation",
  description:
    "Contactez C&Co Formation pour vos projets de formation professionnelle. Demande de devis, informations, inscriptions. Réponse sous 24h.",
  keywords: [
    "contact formation",
    "devis formation",
    "inscription formation",
    "C&Co Formation contact",
    "formation professionnelle contact",
  ],
  openGraph: {
    title: "Contactez-nous | C&Co Formation",
    description:
      "Une question sur nos formations ? Notre équipe est à votre disposition pour vous accompagner dans votre projet.",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
