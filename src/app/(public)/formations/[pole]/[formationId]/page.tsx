import { createServiceClient, ORG_ID } from "@/lib/supabase/service";
import { getFormationImage } from "@/lib/formations-utils";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import FormationDetailContent, { poleColors, type FormationDetailData } from "@/components/formations/FormationDetailContent";

type Props = {
  params: Promise<{ pole: string; formationId: string }>;
};

// ─── SEO: dynamic metadata ───
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pole, formationId } = await params;
  const supabase = createServiceClient();

  const { data: formation } = await supabase
    .from("produits_formation")
    .select("intitule, sous_titre, description, meta_titre, meta_description, image_url, domaine")
    .eq("organisation_id", ORG_ID)
    .eq("slug", formationId)
    .single();

  if (!formation) {
    return { title: "Formation non trouvée" };
  }

  const title = formation.meta_titre || `${formation.intitule} - Formation ${formation.domaine}`;
  const description = formation.meta_description || formation.description?.slice(0, 160) || formation.sous_titre;

  return {
    title,
    description,
    keywords: [
      formation.intitule,
      `formation ${formation.domaine?.toLowerCase()}`,
      "formation professionnelle",
      "Qualiopi",
      "OPCO",
      formation.domaine,
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://candco.fr/formations/${pole}/${formationId}`,
      images: formation.image_url
        ? [{ url: formation.image_url, width: 1200, height: 630, alt: formation.intitule }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: formation.image_url ? [formation.image_url] : undefined,
    },
    alternates: { canonical: `/formations/${pole}/${formationId}` },
  };
}

// ─── SEO: JSON-LD Course ───
function CourseJsonLd({ formation, pole }: { formation: FormationDetailData; pole: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `https://candco.fr/formations/${pole}/${formation.slug}`,
    name: formation.title,
    description: formation.description,
    provider: { "@type": "Organization", "@id": "https://candco.fr/#organization", name: "C&Co Formation", sameAs: "https://candco.fr" },
    offers: formation.price_ht
      ? { "@type": "Offer", price: String(formation.price_ht), priceCurrency: "EUR", availability: "https://schema.org/InStock", validFrom: new Date().toISOString() }
      : undefined,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: String(formation.format_lieu || "").includes("distanciel") ? "online" : "onsite",
      duration: formation.duree_heures ? `PT${formation.duree_heures}H` : undefined,
    },
    educationalLevel: "Professional",
    inLanguage: "fr",
    image: formation.image_url,
    coursePrerequisites: formation.prerequis.join(", "),
    teaches: formation.objectifs.join(", "),
    audience: { "@type": "Audience", audienceType: formation.public_vise.length > 0 ? formation.public_vise.join(", ") : "Professionnels" },
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ─── SEO: JSON-LD Breadcrumb ───
function BreadcrumbJsonLd({ formation, pole }: { formation: FormationDetailData; pole: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://candco.fr" },
      { "@type": "ListItem", position: 2, name: "Formations", item: "https://candco.fr/formations" },
      { "@type": "ListItem", position: 3, name: formation.pole_name, item: `https://candco.fr/pole/${pole}` },
      { "@type": "ListItem", position: 4, name: formation.title, item: `https://candco.fr/formations/${pole}/${formation.slug}` },
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

// ─── Page component ───
export default async function FormationDetailPage({ params }: Props) {
  const { pole, formationId } = await params;
  const supabase = createServiceClient();

  // Fetch formation with sub-tables
  const { data: rawFormation } = await supabase
    .from("produits_formation")
    .select(`
      *,
      produit_objectifs(objectif, ordre),
      produit_prerequis(texte, ordre),
      produit_programme(titre, contenu, duree, ordre),
      produit_public_vise(texte, ordre),
      produit_competences(texte, ordre),
      produit_tarifs(nom, prix_ht, taux_tva, unite, is_default)
    `)
    .eq("organisation_id", ORG_ID)
    .eq("slug", formationId)
    .single();

  if (!rawFormation) {
    notFound();
  }

  // Map sub-tables
  const allTarifs = (rawFormation.produit_tarifs as Array<{ nom: string; prix_ht: number; taux_tva: number; unite: string; is_default: boolean }>) || [];
  // Only show intra/inter tariffs publicly — never show private/group-specific rates
  const tarifs = allTarifs.filter((t) => {
    const nom = (t.nom || "").toLowerCase();
    return nom.includes("intra") || nom.includes("inter");
  });
  const defaultTarif = tarifs.find((t) => t.is_default) || tarifs[0];
  const objectifs = (rawFormation.produit_objectifs as Array<{ objectif: string; ordre: number }> || [])
    .sort((a, b) => a.ordre - b.ordre).map((o) => o.objectif);
  const prerequis = (rawFormation.produit_prerequis as Array<{ texte: string; ordre: number }> || [])
    .sort((a, b) => a.ordre - b.ordre).map((p) => p.texte);
  const programme = (rawFormation.produit_programme as Array<{ titre: string; contenu: string; duree: string; ordre: number }> || [])
    .sort((a, b) => a.ordre - b.ordre);
  const publicVise = (rawFormation.produit_public_vise as Array<{ texte: string; ordre: number }> || [])
    .sort((a, b) => a.ordre - b.ordre).map((p) => p.texte);
  const competences = (rawFormation.produit_competences as Array<{ texte: string; ordre: number }> || [])
    .sort((a, b) => a.ordre - b.ordre).map((c) => c.texte);

  // Fetch upcoming sessions
  const { data: rawSessions } = await supabase
    .from("sessions")
    .select("id, produit_id, nom, statut, date_debut, date_fin, places_max, lieu_nom, lieu_ville, lieu_type, inscriptions(count)")
    .eq("produit_id", rawFormation.id)
    .eq("organisation_id", ORG_ID)
    .in("statut", ["planifiee", "confirmee"])
    .gte("date_debut", new Date().toISOString().split("T")[0])
    .order("date_debut")
    .limit(5);

  interface RawSession {
    id: string;
    produit_id: string;
    nom: string;
    statut: string;
    date_debut: string;
    date_fin: string;
    places_max: number | null;
    lieu_nom: string | null;
    lieu_ville: string | null;
    lieu_type: string | null;
    inscriptions: Array<{ count: number }> | null;
  }

  const sessions = (rawSessions || []).map((s: RawSession) => {
    const inscriptionCount = s.inscriptions?.[0]?.count || 0;
    const placesMax = s.places_max || 0;
    return {
      id: s.id,
      date_debut: s.date_debut,
      date_fin: s.date_fin,
      lieu: s.lieu_nom || s.lieu_ville || "À définir",
      places_disponibles: Math.max(0, placesMax - inscriptionCount),
    };
  });

  // Build formation object (same shape as API response / modal)
  const formation: FormationDetailData = {
    id: rawFormation.id,
    slug: rawFormation.slug,
    title: rawFormation.intitule,
    subtitle: rawFormation.sous_titre,
    description: rawFormation.description,
    pole,
    pole_name: rawFormation.domaine,
    categorie: rawFormation.categorie || null,
    image_url: rawFormation.image_url,
    certification: rawFormation.certification,
    duree_heures: rawFormation.duree_heures,
    duree_jours: rawFormation.duree_jours,
    format_lieu: rawFormation.lieu_format,
    nombre_participants_min: rawFormation.nombre_participants_min,
    nombre_participants_max: rawFormation.nombre_participants_max,
    price_ht: defaultTarif?.prix_ht ?? null,
    price_ttc: defaultTarif ? Math.round(defaultTarif.prix_ht * (1 + defaultTarif.taux_tva / 100) * 100) / 100 : null,
    objectifs,
    prerequis,
    programme: programme.map((p) => ({ titre: p.titre, contenu: p.contenu, duree: p.duree })),
    public_vise: publicVise,
    competences,
    tarifs,
    modalites: rawFormation.modalites as FormationDetailData["modalites"],
    encadrement_pedagogique: rawFormation.encadrement_pedagogique as string | null,
    financement: rawFormation.financement as string[] | null,
    accessibilite: rawFormation.accessibilite as string | null,
    sessions,
  };

  const formationImage = getFormationImage({ id: formation.id, pole: formation.pole, image_url: formation.image_url });

  return (
    <>
      {/* JSON-LD Schemas */}
      <CourseJsonLd formation={formation} pole={pole} />
      <BreadcrumbJsonLd formation={formation} pole={pole} />

      {/* Dark top section — behind fixed header */}
      <section style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32">
          {/* Breadcrumb */}
          <nav className="mb-6" aria-label="Fil d'Ariane">
            <ol className="flex flex-wrap items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
              <li><Link href="/" className="hover:text-white transition-colors">Accueil</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/formations" className="hover:text-white transition-colors">Formations</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href={`/pole/${pole}`} className="hover:text-white transition-colors">{formation.pole_name}</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-white truncate max-w-[200px]" aria-current="page">{formation.title}</li>
            </ol>
          </nav>

          {/* Image Banner (in dark zone) */}
          <div className="relative w-full h-44 sm:h-52 rounded-2xl overflow-hidden">
            <Image
              src={formationImage}
              alt={formation.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <div className="absolute bottom-4 right-4 bg-white rounded-xl px-3 py-2 shadow-lg">
              <Image src="/logo-qualiopi.png" alt="Certification Qualiopi" width={120} height={48} className="h-10 w-auto" />
            </div>
          </div>

          <div className="h-8 sm:h-10" />
        </div>
      </section>

      {/* Light content area — shared template */}
      <div className="bg-[#F5F6F8] pb-16">
        <FormationDetailContent
          formation={formation}
          showBanner={false}
          titleAs="h1"
        />
      </div>
    </>
  );
}
