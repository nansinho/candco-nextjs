import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import FAQClient from "./FAQClient";

export const metadata: Metadata = {
  title: "FAQ Formation | Questions sur OPCO, Qualiopi, Inscription",
  description:
    "Réponses aux questions fréquentes sur nos formations. Financement OPCO, certification Qualiopi, inscription, prérequis. Tout savoir avant de vous former.",
  keywords: [
    "FAQ formation",
    "questions formation",
    "financement OPCO",
    "Qualiopi",
    "inscription formation",
    "prérequis formation",
  ],
  openGraph: {
    title: "Questions Fréquentes | C&Co Formation",
    description:
      "Toutes les réponses à vos questions sur nos formations professionnelles.",
  },
};

export default async function FAQPage() {
  const supabase = await createClient();

  // Fetch categories and items
  const [categoriesRes, itemsRes] = await Promise.all([
    supabase
      .from("faq_categories")
      .select("*")
      .eq("active", true)
      .order("display_order"),
    supabase
      .from("faq_items")
      .select("*")
      .eq("active", true)
      .order("display_order"),
  ]);

  const categories = categoriesRes.data || [];
  const items = itemsRes.data || [];

  // Build FAQ schema for SEO
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <FAQClient categories={categories} items={items} />
    </>
  );
}
