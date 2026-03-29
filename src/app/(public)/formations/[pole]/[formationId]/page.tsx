import { createServiceClient, ORG_ID } from "@/lib/supabase/service";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Users,
  MapPin,
  Euro,
  Award,
  Target,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  Zap,
  Accessibility,
  FileText,
  ArrowRight,
} from "lucide-react";
import { InscriptionButton } from "@/components/inscription/InscriptionButton";

type Props = {
  params: Promise<{ pole: string; formationId: string }>;
};

interface FormationData {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  pole: string;
  pole_name: string;
  price: string;
  duration: string;
  format_lieu: string | null;
  nombre_participants: string | null;
  image_url: string | null;
  certification: string | null;
  objectifs_generaux: string[];
  prerequis: string[];
  programme: { titre: string; contenu: string; duree: string }[];
  public_vise: string[];
  competences_visees: string[];
  categories: { name: string } | null;
  modalites: {
    methodes?: string[];
    moyens?: string[];
    evaluation?: string[];
  } | null;
  encadrement_pedagogique: string | null;
  financement: string[] | null;
  modalites_paiement: string | null;
  accessibilite: string | null;
  meta_title: string | null;
}

// Pole colors
const getPoleColor = (poleId: string): string => {
  const colors: Record<string, string> = {
    "securite-prevention": "pole-securite",
    "petite-enfance": "pole-petite-enfance",
    sante: "pole-sante",
  };
  return colors[poleId] || "primary";
};

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pole, formationId } = await params;
  const supabase = createServiceClient();

  const { data: formation } = await supabase
    .from("produits_formation")
    .select(
      "intitule, sous_titre, description, meta_titre, meta_description, image_url, domaine"
    )
    .eq("organisation_id", ORG_ID)
    .eq("slug", formationId)
    .single();

  if (!formation) {
    return { title: "Formation non trouvée" };
  }

  const title =
    formation.meta_titre ||
    `${formation.intitule} - Formation ${formation.domaine}`;
  const description =
    formation.meta_description ||
    formation.description?.slice(0, 160) ||
    formation.sous_titre;

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
        ? [
            {
              url: formation.image_url,
              width: 1200,
              height: 630,
              alt: formation.intitule,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: formation.image_url ? [formation.image_url] : undefined,
    },
    alternates: {
      canonical: `/formations/${pole}/${formationId}`,
    },
  };
}

// JSON-LD Schema for Course
function CourseJsonLd({
  formation,
  pole,
}: {
  formation: FormationData;
  pole: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    "@id": `https://candco.fr/formations/${pole}/${formation.slug}`,
    name: formation.title,
    description: formation.description,
    provider: {
      "@type": "Organization",
      "@id": "https://candco.fr/#organization",
      name: "C&Co Formation",
      sameAs: "https://candco.fr",
    },
    offers: formation.price
      ? {
          "@type": "Offer",
          price: String(formation.price).replace(/[^0-9]/g, ""),
          priceCurrency: "EUR",
          availability: "https://schema.org/InStock",
          validFrom: new Date().toISOString(),
        }
      : undefined,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: String(formation.format_lieu || "").includes("distanciel")
        ? "online"
        : "onsite",
      duration: formation.duration,
    },
    educationalLevel: "Professional",
    inLanguage: "fr",
    image: formation.image_url,
    coursePrerequisites: Array.isArray(formation.prerequis)
      ? (formation.prerequis as string[]).join(", ")
      : "",
    teaches: Array.isArray(formation.objectifs_generaux)
      ? (formation.objectifs_generaux as string[]).join(", ")
      : "",
    audience: {
      "@type": "Audience",
      audienceType: Array.isArray(formation.public_vise)
        ? (formation.public_vise as string[]).join(", ")
        : "Professionnels",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// BreadcrumbList JSON-LD
function BreadcrumbJsonLd({
  formation,
  pole,
}: {
  formation: FormationData;
  pole: string;
}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Accueil",
        item: "https://candco.fr",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Formations",
        item: "https://candco.fr/formations",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: formation.pole_name,
        item: `https://candco.fr/pole/${pole}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: formation.title,
        item: `https://candco.fr/formations/${pole}/${formation.slug}`,
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// Section Title Component
function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-primary/10">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <h2 className="text-lg font-medium">{children}</h2>
    </div>
  );
}

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

  // Map to expected format
  const tarifs = rawFormation.produit_tarifs as Array<{ nom: string; prix_ht: number; taux_tva: number; unite: string; is_default: boolean }> | null;
  const defaultTarif = tarifs?.find((t) => t.is_default) || tarifs?.[0];
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

  // Build a compatible formation object for the existing template
  const formation: FormationData = {
    id: rawFormation.id,
    slug: rawFormation.slug,
    title: rawFormation.intitule,
    subtitle: rawFormation.sous_titre,
    description: rawFormation.description,
    pole: pole,
    pole_name: rawFormation.domaine,
    price: defaultTarif ? `${defaultTarif.prix_ht}€ HT` : "",
    duration: rawFormation.duree_jours ? `${rawFormation.duree_jours} jours` : rawFormation.duree_heures ? `${rawFormation.duree_heures} heures` : "",
    format_lieu: rawFormation.lieu_format,
    nombre_participants: rawFormation.nombre_participants_max ? `${rawFormation.nombre_participants_min || 1} à ${rawFormation.nombre_participants_max}` : null,
    image_url: rawFormation.image_url,
    certification: rawFormation.certification,
    objectifs_generaux: objectifs,
    prerequis: prerequis,
    programme: programme.map((p) => ({ titre: p.titre, contenu: p.contenu, duree: p.duree })),
    public_vise: publicVise,
    competences_visees: competences,
    categories: null,
    modalites: rawFormation.modalites as FormationData["modalites"],
    encadrement_pedagogique: rawFormation.encadrement_pedagogique as string | null,
    financement: rawFormation.financement as string[] | null,
    modalites_paiement: rawFormation.modalites_paiement as string | null,
    accessibilite: rawFormation.accessibilite as string | null,
    meta_title: rawFormation.meta_titre,
  };

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

  // Map sessions to expected format
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
    const placesDisponibles = Math.max(0, placesMax - inscriptionCount);
    return {
      id: s.id,
      formation_id: s.produit_id,
      start_date: s.date_debut,
      end_date: s.date_fin,
      lieu: s.lieu_nom || s.lieu_ville || "À définir",
      status: s.statut,
      places_max: placesMax,
      places_disponibles: placesDisponibles,
      format_type: s.lieu_type,
    };
  });

  const poleColorVar = getPoleColor(pole);

  // Parse modalites
  const modalites = formation.modalites;
  const modalitesMethodes = modalites?.methodes || [];
  const modalitesMoyens = modalites?.moyens || [];
  const modalitesEvaluation = modalites?.evaluation || [];

  // Default image based on pole
  const defaultImages: Record<string, string> = {
    "securite-prevention": "/images/formations/securite-default.jpg",
    "petite-enfance": "/images/formations/petite-enfance-default.jpg",
    sante: "/images/formations/sante-default.jpg",
  };
  const formationImage =
    formation.image_url || defaultImages[formation.pole] || "/images/formation-default.jpg";

  return (
    <>
      {/* JSON-LD Schemas */}
      <CourseJsonLd formation={formation} pole={pole} />
      <BreadcrumbJsonLd formation={formation} pole={pole} />

      {/* Breadcrumb */}
      <nav className="bg-card border-b border-border" aria-label="Fil d'Ariane">
        <div className="container-custom py-4">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <li>
              <Link
                href="/"
                className="hover:text-foreground transition-colors"
              >
                Accueil
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/formations"
                className="hover:text-foreground transition-colors"
              >
                Formations
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href={`/pole/${pole}`}
                className="hover:text-foreground transition-colors"
              >
                {formation.pole_name}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground truncate max-w-[200px]" aria-current="page">
              {formation.title}
            </li>
          </ol>
        </div>
      </nav>

      {/* Main Layout */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-[1fr_380px] gap-10">
            {/* Main Content */}
            <div className="space-y-8">
              {/* Hero Header */}
              <header>
                {/* Mobile Image */}
                <div className="lg:hidden mb-6 rounded-2xl overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={formationImage}
                      alt={formation.title}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span
                    className="px-3 py-1.5 rounded-lg text-xs font-medium text-white"
                    style={{ backgroundColor: `hsl(var(--${poleColorVar}))` }}
                  >
                    {formation.pole_name}
                  </span>
                  {formation.categories && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-secondary">
                      {formation.categories.name}
                    </span>
                  )}
                  {formation.certification && (
                    <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/10 text-green-600 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Certifiante
                    </span>
                  )}
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-light leading-tight mb-4">
                  {formation.title}
                </h1>

                {/* Quick Stats Mobile */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4 lg:hidden">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-primary" />
                    {formation.duration}
                  </span>
                  {formation.format_lieu && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      {formation.format_lieu}
                    </span>
                  )}
                </div>

                {/* Description */}
                {formation.description && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {formation.description}
                  </p>
                )}
              </header>

              {/* Objectifs */}
              {formation.objectifs_generaux &&
                Array.isArray(formation.objectifs_generaux) &&
                formation.objectifs_generaux.length > 0 && (
                  <section className="p-6 rounded-2xl border border-primary/20 bg-secondary/50">
                    <SectionTitle icon={Target}>
                      Objectifs de la formation
                    </SectionTitle>
                    <ul className="space-y-3">
                      {formation.objectifs_generaux.map(
                        (obj, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{obj}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </section>
                )}

              {/* Compétences visées */}
              {formation.competences_visees &&
                Array.isArray(formation.competences_visees) &&
                formation.competences_visees.length > 0 && (
                  <section className="p-6 rounded-2xl border border-border bg-card">
                    <SectionTitle icon={Award}>Compétences visées</SectionTitle>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {formation.competences_visees.map(
                        (comp, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-3 p-4 rounded-xl border border-border bg-secondary/30"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-primary">
                                {i + 1}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {comp}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </section>
                )}

              {/* Profil des bénéficiaires */}
              {((formation.public_vise &&
                Array.isArray(formation.public_vise) &&
                formation.public_vise.length > 0) ||
                (formation.prerequis &&
                  Array.isArray(formation.prerequis) &&
                  formation.prerequis.length > 0)) && (
                <section className="p-6 rounded-2xl border border-border bg-card">
                  <SectionTitle icon={Users}>
                    Profil des bénéficiaires
                  </SectionTitle>
                  <div className="grid md:grid-cols-2 gap-6">
                    {formation.public_vise &&
                      Array.isArray(formation.public_vise) &&
                      formation.public_vise.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Pour qui ?
                          </h3>
                          <ul className="space-y-2">
                            {formation.public_vise.map(
                              (item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    {formation.prerequis &&
                      Array.isArray(formation.prerequis) &&
                      formation.prerequis.length > 0 && (
                        <div>
                          <h3 className="font-medium mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" />
                            Prérequis
                          </h3>
                          <ul className="space-y-2">
                            {formation.prerequis.map(
                              (item, i) => (
                                <li
                                  key={i}
                                  className="flex items-start gap-2 text-sm text-muted-foreground"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </div>
                </section>
              )}

              {/* Programme */}
              {formation.programme &&
                Array.isArray(formation.programme) &&
                formation.programme.length > 0 && (
                  <section className="p-6 rounded-2xl border border-border bg-card">
                    <SectionTitle icon={BookOpen}>
                      Programme détaillé
                    </SectionTitle>
                    <div className="space-y-4">
                      {formation.programme.map((module, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl border border-border bg-secondary/30"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <span className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium bg-primary/10 text-primary">
                              {i + 1}
                            </span>
                            <h3 className="font-medium">{module.titre}</h3>
                            {module.duree && (
                              <span className="text-xs text-muted-foreground ml-auto">{module.duree}</span>
                            )}
                          </div>
                          {module.contenu && (
                            <p className="ml-11 text-sm text-muted-foreground">{module.contenu}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              {/* Modalités pédagogiques */}
              {(modalitesMethodes.length > 0 ||
                modalitesMoyens.length > 0 ||
                modalitesEvaluation.length > 0) && (
                <section className="p-6 rounded-2xl border border-border bg-card">
                  <SectionTitle icon={Zap}>Approche pédagogique</SectionTitle>
                  <div className="grid md:grid-cols-3 gap-4">
                    {modalitesMethodes.length > 0 && (
                      <div className="p-4 rounded-xl border border-border bg-secondary/30">
                        <h3 className="font-medium mb-3 flex items-center gap-2 text-sm">
                          <Zap className="w-4 h-4 text-primary" />
                          Méthodes
                        </h3>
                        <ul className="space-y-2">
                          {modalitesMethodes.map((method, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{method}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {modalitesMoyens.length > 0 && (
                      <div className="p-4 rounded-xl border border-border bg-secondary/30">
                        <h3 className="font-medium mb-3 flex items-center gap-2 text-sm">
                          <BookOpen className="w-4 h-4 text-primary" />
                          Moyens
                        </h3>
                        <ul className="space-y-2">
                          {modalitesMoyens.map((moyen, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{moyen}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {modalitesEvaluation.length > 0 && (
                      <div className="p-4 rounded-xl border border-border bg-secondary/30">
                        <h3 className="font-medium mb-3 flex items-center gap-2 text-sm">
                          <Target className="w-4 h-4 text-primary" />
                          Évaluation
                        </h3>
                        <ul className="space-y-2">
                          {modalitesEvaluation.map((item, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-muted-foreground"
                            >
                              <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Équipe pédagogique */}
              {formation.encadrement_pedagogique && (
                <section className="p-6 rounded-2xl border border-border bg-card">
                  <SectionTitle icon={GraduationCap}>
                    Équipe pédagogique
                  </SectionTitle>
                  <p className="text-muted-foreground leading-relaxed">
                    {formation.encadrement_pedagogique}
                  </p>
                </section>
              )}

              {/* Financement */}
              {formation.financement &&
                Array.isArray(formation.financement) &&
                formation.financement.length > 0 && (
                  <section className="p-6 rounded-2xl border border-border bg-card">
                    <SectionTitle icon={Euro}>
                      Options de financement
                    </SectionTitle>
                    <div className="flex flex-wrap gap-3">
                      {formation.financement!.map((fin, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 rounded-full border border-border bg-secondary text-sm"
                        >
                          {fin}
                        </span>
                      ))}
                    </div>
                    {formation.modalites_paiement && (
                      <div className="mt-4 p-4 rounded-xl border border-border bg-secondary/30">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Euro className="w-4 h-4 text-primary" />
                          <span className="font-medium">
                            Modalités de paiement
                          </span>
                        </div>
                        <p className="text-sm">{formation.modalites_paiement}</p>
                      </div>
                    )}
                  </section>
                )}

              {/* Accessibilité */}
              {formation.accessibilite && (
                <section className="p-6 rounded-2xl border border-border bg-card">
                  <SectionTitle icon={Accessibility}>Accessibilité</SectionTitle>
                  <p className="text-muted-foreground leading-relaxed">
                    {formation.accessibilite}
                  </p>
                </section>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:block">
              <div className="sticky top-24 space-y-6">
                {/* Image Desktop */}
                <div className="hidden lg:block rounded-2xl overflow-hidden">
                  <div className="relative aspect-video">
                    <Image
                      src={formationImage}
                      alt={formation.title}
                      fill
                      sizes="100vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Info Card */}
                <div className="p-6 rounded-2xl border border-border bg-card shadow-sm">
                  <h2 className="font-semibold mb-4 line-clamp-2">
                    {formation.title}
                  </h2>

                  {/* Info Grid */}
                  <dl className="space-y-4 mb-6">
                    {formation.duration && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <dt className="text-xs text-muted-foreground">
                            Durée
                          </dt>
                          <dd className="font-medium text-sm">
                            {formation.duration}
                          </dd>
                        </div>
                      </div>
                    )}
                    {formation.format_lieu && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <dt className="text-xs text-muted-foreground">
                            Lieu
                          </dt>
                          <dd className="font-medium text-sm">
                            {formation.format_lieu}
                          </dd>
                        </div>
                      </div>
                    )}
                    {formation.nombre_participants && (
                      <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div className="flex-1">
                          <dt className="text-xs text-muted-foreground">
                            Participants
                          </dt>
                          <dd className="font-medium text-sm">
                            {formation.nombre_participants}
                          </dd>
                        </div>
                      </div>
                    )}
                  </dl>

                  {/* Price */}
                  {formation.price && (
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
                      <p className="text-xs text-muted-foreground text-center mb-1">
                        Tarif de la formation
                      </p>
                      <p className="text-2xl font-bold text-primary text-center">
                        {formation.price}
                      </p>
                    </div>
                  )}

                  {/* Sessions */}
                  {sessions && sessions.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-medium mb-3 text-sm">
                        Prochaines sessions
                      </h3>
                      <ul className="space-y-2">
                        {sessions.slice(0, 3).map((session) => (
                          <li
                            key={session.id}
                            className="p-3 bg-secondary/50 rounded-lg text-sm"
                          >
                            <time dateTime={session.start_date}>
                              {new Date(session.start_date).toLocaleDateString(
                                "fr-FR",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </time>
                            {session.lieu && (
                              <span className="text-muted-foreground block text-xs mt-1">
                                {session.lieu}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* CTA Buttons */}
                  <div className="space-y-3">
                    <InscriptionButton
                      formation={{
                        id: formation.id,
                        title: formation.title,
                        price: formation.price,
                      }}
                    />
                    <Link
                      href={`/contact?formation=${encodeURIComponent(formation.title)}`}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-primary/20 text-foreground rounded-lg font-medium hover:bg-secondary transition-colors"
                    >
                      Demander un devis
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Qualiopi Badge */}
                <div className="p-4 rounded-xl border border-primary/20 bg-card text-center">
                  <p className="text-sm font-medium">Organisme certifié</p>
                  <p className="text-xs text-muted-foreground">
                    Qualiopi - Actions de formation
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
