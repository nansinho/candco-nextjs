import { createServiceClient, ORG_ID } from "@/lib/supabase/service";
import { getFormationImage } from "@/lib/formations-utils";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Clock,
  Users,
  MapPin,
  Award,
  CheckCircle2,
  GraduationCap,
  FileText,
  CalendarDays,
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
  price_ht: number | null;
  price_ttc: number | null;
  duree_heures: number | null;
  duree_jours: number | null;
  format_lieu: string | null;
  nombre_participants_min: number | null;
  nombre_participants_max: number | null;
  image_url: string | null;
  certification: string | null;
  categorie: string | null;
  objectifs: string[];
  prerequis: string[];
  programme: { titre: string; contenu: string; duree: string }[];
  public_vise: string[];
  competences: string[];
  tarifs: { nom: string; prix_ht: number; taux_tva: number; unite: string; is_default: boolean }[];
  modalites: {
    methodes?: string[];
    moyens?: string[];
    evaluation?: string[];
  } | null;
  encadrement_pedagogique: string | null;
  financement: string[] | null;
  accessibilite: string | null;
  sessions: { id: string; date_debut: string; date_fin: string; lieu: string; places_disponibles: number }[];
}

const poleColors: Record<string, string> = {
  "securite-prevention": "#A82424",
  "petite-enfance": "#2D867E",
  sante: "#507395",
  entrepreneuriat: "#1F628E",
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
    offers: formation.price_ht
      ? {
          "@type": "Offer",
          price: String(formation.price_ht),
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
      duration: formation.duree_heures ? `PT${formation.duree_heures}H` : undefined,
    },
    educationalLevel: "Professional",
    inLanguage: "fr",
    image: formation.image_url,
    coursePrerequisites: formation.prerequis.join(", "),
    teaches: formation.objectifs.join(", "),
    audience: {
      "@type": "Audience",
      audienceType: formation.public_vise.length > 0
        ? formation.public_vise.join(", ")
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-bold text-gray-900 mb-4">{children}</h2>;
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

  // Map sub-tables
  const tarifs = (rawFormation.produit_tarifs as Array<{ nom: string; prix_ht: number; taux_tva: number; unite: string; is_default: boolean }>) || [];
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
    const placesDisponibles = Math.max(0, placesMax - inscriptionCount);
    return {
      id: s.id,
      date_debut: s.date_debut,
      date_fin: s.date_fin,
      lieu: s.lieu_nom || s.lieu_ville || "A definir",
      places_disponibles: placesDisponibles,
    };
  });

  // Build formation object
  const formation: FormationData = {
    id: rawFormation.id,
    slug: rawFormation.slug,
    title: rawFormation.intitule,
    subtitle: rawFormation.sous_titre,
    description: rawFormation.description,
    pole,
    pole_name: rawFormation.domaine,
    price_ht: defaultTarif?.prix_ht ?? null,
    price_ttc: defaultTarif ? Math.round(defaultTarif.prix_ht * (1 + defaultTarif.taux_tva / 100) * 100) / 100 : null,
    duree_heures: rawFormation.duree_heures,
    duree_jours: rawFormation.duree_jours,
    format_lieu: rawFormation.lieu_format,
    nombre_participants_min: rawFormation.nombre_participants_min,
    nombre_participants_max: rawFormation.nombre_participants_max,
    image_url: rawFormation.image_url,
    certification: rawFormation.certification,
    categorie: rawFormation.categorie || null,
    objectifs,
    prerequis,
    programme: programme.map((p) => ({ titre: p.titre, contenu: p.contenu, duree: p.duree })),
    public_vise: publicVise,
    competences,
    tarifs,
    modalites: rawFormation.modalites as FormationData["modalites"],
    encadrement_pedagogique: rawFormation.encadrement_pedagogique as string | null,
    financement: rawFormation.financement as string[] | null,
    accessibilite: rawFormation.accessibilite as string | null,
    sessions,
  };

  const accent = poleColors[pole] || "#1F628E";
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
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/formations" className="hover:text-white transition-colors">
                  Formations
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href={`/pole/${pole}`} className="hover:text-white transition-colors">
                  {formation.pole_name}
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="text-white truncate max-w-[200px]" aria-current="page">
                {formation.title}
              </li>
            </ol>
          </nav>

          {/* Image Banner */}
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
              <Image
                src="/logo-qualiopi.png"
                alt="Certification Qualiopi"
                width={120}
                height={48}
                className="h-10 w-auto"
              />
            </div>
          </div>

          {/* Spacer to transition into light area */}
          <div className="h-8 sm:h-10" />
        </div>
      </section>

      {/* Light content area */}
      <div className="bg-[#F5F6F8] min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10">

          {/* Two-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-10 pb-10">

            {/* Main Content */}
            <div className="flex-1 min-w-0">

              {/* Title + Badges */}
              <h1 className="text-2xl sm:text-[26px] font-bold text-gray-900 leading-tight">
                {formation.title}
              </h1>
              {formation.subtitle && (
                <p className="mt-1 text-[15px] text-gray-400">{formation.subtitle}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 mt-3 mb-8">
                <span
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: accent }}
                >
                  {formation.pole_name}
                </span>
                {formation.categorie && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium text-gray-600 bg-gray-100">
                    {formation.categorie}
                  </span>
                )}
                {formation.certification && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                    Certifiante
                  </span>
                )}
              </div>

              {/* Description */}
              {formation.description && (
                <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
                  <SectionTitle>Description</SectionTitle>
                  <p className="text-[15px] text-gray-600 leading-relaxed">{formation.description}</p>
                </section>
              )}

              {/* Objectifs */}
              {formation.objectifs.length > 0 && (
                <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
                  <SectionTitle>Objectifs de la formation</SectionTitle>
                  <ul className="space-y-3">
                    {formation.objectifs.map((o, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="w-[18px] h-[18px] shrink-0 mt-0.5" style={{ color: accent }} />
                        <span className="text-[15px] text-gray-600">{o}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Competences */}
              {formation.competences.length > 0 && (
                <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
                  <SectionTitle>Competences visees</SectionTitle>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {formation.competences.map((c, i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-gray-50">
                        <Award className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                        <span className="text-sm text-gray-600">{c}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Pour qui / Prerequisites */}
              {(formation.public_vise.length > 0 || formation.prerequis.length > 0) && (
                <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
                  <div className="grid sm:grid-cols-2 gap-8">
                    {formation.public_vise.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4" style={{ color: accent }} /> Pour qui ?
                        </h3>
                        <ul className="space-y-2">
                          {formation.public_vise.map((p, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                              <span className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: accent }} />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {formation.prerequis.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                          <FileText className="w-4 h-4" style={{ color: accent }} /> Prerequis
                        </h3>
                        <ul className="space-y-2">
                          {formation.prerequis.map((p, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                              {p}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Programme */}
              {formation.programme.length > 0 && (
                <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
                  <SectionTitle>Programme detaille</SectionTitle>
                  <div className="space-y-3">
                    {formation.programme.map((mod, i) => (
                      <div key={i} className="p-5 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-bold text-white"
                            style={{ backgroundColor: accent }}
                          >
                            {i + 1}
                          </span>
                          <h3 className="font-semibold text-[15px] text-gray-900">{mod.titre}</h3>
                        </div>
                        {mod.contenu && (
                          <p className="ml-10 text-sm text-gray-600 leading-relaxed whitespace-pre-line">{mod.contenu}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Approche pedagogique */}
              {formation.modalites && (() => {
                const m = formation.modalites!;
                const has = (m.methodes?.length || 0) + (m.moyens?.length || 0) + (m.evaluation?.length || 0) > 0;
                if (!has) return null;
                return (
                  <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
                    <SectionTitle>Approche pedagogique</SectionTitle>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        { title: "Methodes", items: m.methodes },
                        { title: "Moyens", items: m.moyens },
                        { title: "Evaluation", items: m.evaluation },
                      ].filter((s) => s.items && s.items.length > 0).map((s) => (
                        <div key={s.title} className="p-4 rounded-xl bg-gray-50">
                          <h3 className="font-semibold text-sm text-gray-900 mb-2">{s.title}</h3>
                          <p className="text-sm text-gray-600 leading-relaxed">{s.items!.join(", ")}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })()}

              {/* Equipe pedagogique */}
              {formation.encadrement_pedagogique && (
                <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
                  <SectionTitle>Equipe pedagogique</SectionTitle>
                  <p className="text-[15px] text-gray-600 leading-relaxed">{formation.encadrement_pedagogique}</p>
                </section>
              )}

              {/* Accessibilite */}
              {formation.accessibilite && (
                <section className="mb-6 p-6 rounded-2xl bg-white border border-gray-100">
                  <SectionTitle>Accessibilite</SectionTitle>
                  <p className="text-[15px] text-gray-600 leading-relaxed">{formation.accessibilite}</p>
                </section>
              )}

              {/* Footer */}
              <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                <p className="text-xs text-gray-400">
                  Organisme certifie <span className="font-semibold text-gray-600">Qualiopi</span> — Actions de formation
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <aside className="w-full lg:w-[300px] shrink-0">
              <div className="lg:sticky lg:top-24 space-y-6">

                {/* CTA card */}
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                  <div className="text-center mb-5">
                    {formation.price_ht ? (
                      <>
                        <p className="text-3xl font-bold text-gray-900">{formation.price_ht} &euro;</p>
                        <p className="text-sm text-gray-400 mt-1">
                          HT / stagiaire{formation.price_ttc ? ` \u00B7 ${formation.price_ttc} \u20AC TTC` : ""}
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-gray-900">Sur devis</p>
                    )}
                  </div>
                  <div className="space-y-3">
                    <InscriptionButton
                      formation={{ id: formation.id, title: formation.title, price: formation.price_ht ? `${formation.price_ht}\u20AC HT` : undefined }}
                    />
                    <InscriptionButton
                      formation={{ id: formation.id, title: formation.title, price: formation.price_ht ? `${formation.price_ht}\u20AC HT` : undefined }}
                      mode="devis"
                      variant="secondary"
                    />
                  </div>
                </div>

                {/* Infos pratiques */}
                <div className="rounded-2xl bg-white border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Infos pratiques</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <Clock className="w-4 h-4 shrink-0" style={{ color: accent }} />
                      <span className="text-sm text-gray-600">
                        {formation.duree_heures ? `${formation.duree_heures}h` : ""}
                        {formation.duree_jours ? ` (${formation.duree_jours}j)` : ""}
                        {!formation.duree_heures && !formation.duree_jours && "\u2014"}
                      </span>
                    </li>
                    <li className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 shrink-0" style={{ color: accent }} />
                      <span className="text-sm text-gray-600">{formation.format_lieu || "Presentiel"}</span>
                    </li>
                    {(formation.nombre_participants_min || formation.nombre_participants_max) && (
                      <li className="flex items-center gap-3">
                        <Users className="w-4 h-4 shrink-0" style={{ color: accent }} />
                        <span className="text-sm text-gray-600">
                          {formation.nombre_participants_min && formation.nombre_participants_max
                            ? `${formation.nombre_participants_min} a ${formation.nombre_participants_max} participants`
                            : formation.nombre_participants_max
                              ? `Max. ${formation.nombre_participants_max} participants`
                              : `Min. ${formation.nombre_participants_min} participants`}
                        </span>
                      </li>
                    )}
                    {formation.certification && (
                      <li className="flex items-start gap-3">
                        <GraduationCap className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accent }} />
                        <span className="text-sm text-gray-600">{formation.certification}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Prochaines sessions */}
                {formation.sessions.length > 0 && (
                  <div className="rounded-2xl bg-white border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Prochaines sessions</h3>
                    <div className="space-y-3">
                      {formation.sessions.map((s) => (
                        <div key={s.id} className="flex items-center gap-3">
                          <CalendarDays className="w-4 h-4 shrink-0" style={{ color: accent }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-600">
                              {new Date(s.date_debut).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                            <p className="text-xs text-gray-400">
                              {s.lieu} &middot; {s.places_disponibles} place{s.places_disponibles > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tarifs detailles */}
                {formation.tarifs.length > 1 && (
                  <div className="rounded-2xl bg-white border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-4">Tarifs</h3>
                    <div className="space-y-3">
                      {formation.tarifs.map((t, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">{t.nom || "Inter-entreprise"}</p>
                            <p className="text-xs text-gray-400">{t.unite || "Par stagiaire"}</p>
                          </div>
                          <p className="text-sm font-bold text-gray-900">{t.prix_ht} &euro; HT</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financement */}
                {formation.financement && formation.financement.length > 0 && (
                  <div className="rounded-2xl bg-white border border-gray-100 p-6">
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Financement</h3>
                    <div className="flex flex-wrap gap-2">
                      {formation.financement.map((fin, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-full bg-gray-50 text-xs text-gray-600">
                          {fin}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

          </div>
        </div>
      </div>
    </>
  );
}
