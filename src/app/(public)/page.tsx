import { createServiceClient, ORG_ID } from "@/lib/supabase/service";
import { getPoleFromDomaine } from "@/lib/domaines";
import { Metadata } from "next";

import HeroSectionV2, { type HeroSlide } from "@/components/home/v2/HeroSectionV2";
import UpcomingSessionsV2 from "@/components/home/v2/PartnersSectionV2";
import WhyChooseUsV2 from "@/components/home/v2/WhyChooseUsV2";
import PolesSectionV2 from "@/components/home/v2/PolesSectionV2";
import FeaturedFormationsV2 from "@/components/home/v2/FeaturedFormationsV2";
import TestimonialsV2 from "@/components/home/v2/TestimonialsV2";
import GoogleReviewsV2 from "@/components/home/v2/GoogleReviewsV2";
import BlogPreviewV2 from "@/components/home/v2/BlogPreviewV2";
import CTASectionV2 from "@/components/home/v2/CTASectionV2";

export const metadata: Metadata = {
  title: "C&Co Formation | Centre de Formation Professionnelle Certifié Qualiopi",
  description:
    "Formations certifiantes en Sécurité, Petite Enfance et Santé. Organisme certifié Qualiopi. 25 000+ professionnels formés. Financement OPCO et CPF.",
  keywords: [
    "formation professionnelle",
    "organisme formation certifié",
    "formation SST",
    "formation prévention incendie",
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
  openGraph: {
    title: "C&Co Formation | Centre de Formation Professionnelle Certifié Qualiopi",
    description:
      "Formations certifiantes en Sécurité, Petite Enfance et Santé. Organisme certifié Qualiopi. 25 000+ professionnels formés. Financement OPCO et CPF.",
    type: "website",
    locale: "fr_FR",
  },
  alternates: {
    canonical: "https://candco-formation.fr",
  },
};

const polesConfig = [
  {
    id: "securite-prevention",
    title: "Sécurité Prévention",
    description: "Développez vos compétences en prévention des risques et premiers secours. Formations certifiantes éligibles au financement OPCO.",
    image: "/images/poles/pole-security.jpg",
    icon: "Shield",
    color: "pole-securite",
  },
  {
    id: "petite-enfance",
    title: "Petite Enfance",
    description: "Accompagnez le développement des tout-petits avec bienveillance et pédagogies innovantes.",
    image: "/images/poles/pole-childhood.jpg",
    icon: "Baby",
    color: "pole-petite-enfance",
  },
  {
    id: "sante",
    title: "Santé",
    description: "Maîtrisez les gestes essentiels du soin et de l'urgence. Formations pratiques certifiées et reconnues.",
    image: "/images/poles/pole-health.jpg",
    icon: "HeartPulse",
    color: "pole-sante",
  },
  {
    id: "entrepreneuriat",
    title: "Entrepreneuriat",
    description: "Créez et développez votre activité professionnelle. Formations pratiques pour entrepreneurs et porteurs de projets.",
    image: "/images/poles/pole-company.jpg",
    icon: "Briefcase",
    color: "primary",
  },
];

export const revalidate = 60;

export default async function HomePage() {
  const supabase = createServiceClient();

  const [popularResult, poleCountsResult] = await Promise.all([
    supabase
      .from("produits_formation")
      .select("id, intitule, sous_titre, slug, duree_heures, duree_jours, domaine, image_url, produit_tarifs(prix_ht, is_default)")
      .eq("organisation_id", ORG_ID)
      .eq("publie", true)
      .eq("populaire", true)
      .limit(18),
    supabase
      .from("produits_formation")
      .select("domaine")
      .eq("organisation_id", ORG_ID)
      .eq("publie", true),
  ]);

  let rawFormations = popularResult.data;
  if (!rawFormations || rawFormations.length < 3) {
    const { data } = await supabase
      .from("produits_formation")
      .select("id, intitule, sous_titre, slug, duree_heures, duree_jours, domaine, image_url, produit_tarifs(prix_ht, is_default)")
      .eq("organisation_id", ORG_ID)
      .eq("publie", true)
      .order("created_at", { ascending: false })
      .limit(18);
    rawFormations = data;
  }

  interface RawFormation {
    id: string;
    intitule: string;
    sous_titre: string | null;
    slug: string;
    duree_heures: number | null;
    duree_jours: number | null;
    domaine: string;
    image_url: string | null;
    produit_tarifs: Array<{ prix_ht: number; is_default: boolean }> | null;
  }

  const formations = rawFormations?.map((f: RawFormation) => {
    const tarif = f.produit_tarifs?.find((t) => t.is_default) || f.produit_tarifs?.[0];
    const pole = getPoleFromDomaine(f.domaine);
    const duree = f.duree_jours ? `${f.duree_jours}j` : f.duree_heures ? `${f.duree_heures}h` : "";
    return {
      id: f.id,
      title: f.intitule,
      subtitle: f.sous_titre || "",
      slug: f.slug,
      duration: duree,
      price: tarif ? `${tarif.prix_ht}€ HT` : "",
      pole: pole.pole,
      pole_name: pole.pole_name,
      image_url: f.image_url,
    };
  }) || [];

  // Shuffle formations randomly
  for (let i = formations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [formations[i], formations[j]] = [formations[j], formations[i]];
  }

  const counts: Record<string, number> = {};
  poleCountsResult.data?.forEach((f: { domaine: string }) => {
    const p = getPoleFromDomaine(f.domaine);
    counts[p.pole] = (counts[p.pole] || 0) + 1;
  });

  // Fetch latest blog articles for the hero slider
  const { data: blogArticles } = await supabase
    .from("blog_articles")
    .select("id, title, excerpt, slug, image_url, published_at, category")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(5);

  const heroSlides: HeroSlide[] = (blogArticles || [])
    .filter((a: any) => a.image_url)
    .map((a: any) => ({
      title: a.title,
      category: a.category || "Actualité",
      category_color: "#1F628E",
      date: a.published_at
        ? new Date(a.published_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : undefined,
      image_url: a.image_url,
      href: `/blog/${a.slug}`,
    }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "C&Co Formation",
    description:
      "Formations certifiantes en Sécurité, Petite Enfance et Santé. Organisme certifié Qualiopi. 25 000+ professionnels formés. Financement OPCO et CPF.",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "50",
    },
    areaServed: "FR",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <HeroSectionV2 slides={heroSlides.length ? heroSlides : undefined} />
      <PolesSectionV2 polesConfig={polesConfig} counts={counts} />
      <WhyChooseUsV2 />
      <FeaturedFormationsV2 formations={formations} />
      <BlogPreviewV2 />
      <TestimonialsV2 />
      <GoogleReviewsV2 />
      <CTASectionV2 />
    </>
  );
}
