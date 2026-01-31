import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ pole: string; formationId: string }>;
};

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pole, formationId } = await params;
  const supabase = await createClient();

  const { data: formation } = await supabase
    .from("formations")
    .select("title, subtitle, description, meta_title, meta_description, image_url, pole_name, price, duration")
    .eq("slug", formationId)
    .single();

  if (!formation) {
    return { title: "Formation non trouvée" };
  }

  const title = formation.meta_title || `${formation.title} - Formation ${formation.pole_name}`;
  const description = formation.meta_description || formation.description?.slice(0, 160) || formation.subtitle;

  return {
    title,
    description,
    keywords: [
      formation.title,
      `formation ${formation.pole_name?.toLowerCase()}`,
      "formation professionnelle",
      "Qualiopi",
      "OPCO",
      formation.pole_name,
    ],
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://candco.fr/formations/${pole}/${formationId}`,
      images: formation.image_url ? [
        {
          url: formation.image_url,
          width: 1200,
          height: 630,
          alt: formation.title,
        },
      ] : undefined,
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
function CourseJsonLd({ formation, pole }: { formation: any; pole: string }) {
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
    offers: formation.price ? {
      "@type": "Offer",
      price: formation.price.replace(/[^0-9]/g, ""),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      validFrom: new Date().toISOString(),
    } : undefined,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: formation.format_lieu?.includes("distanciel") ? "online" : "onsite",
      duration: formation.duration,
    },
    educationalLevel: "Professional",
    inLanguage: "fr",
    image: formation.image_url,
    coursePrerequisites: formation.prerequis?.join(", "),
    teaches: formation.objectifs_generaux?.join(", "),
    audience: {
      "@type": "Audience",
      audienceType: formation.public_vise?.join(", ") || "Professionnels",
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
function BreadcrumbJsonLd({ formation, pole }: { formation: any; pole: string }) {
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

export default async function FormationDetailPage({ params }: Props) {
  const { pole, formationId } = await params;
  const supabase = await createClient();

  // Récupérer la formation
  const { data: formation } = await supabase
    .from("formations")
    .select("*")
    .eq("slug", formationId)
    .single();

  if (!formation) {
    notFound();
  }

  // Récupérer les prochaines sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("formation_id", formation.id)
    .gte("start_date", new Date().toISOString())
    .order("start_date")
    .limit(5);

  return (
    <>
      {/* JSON-LD Schemas */}
      <CourseJsonLd formation={formation} pole={pole} />
      <BreadcrumbJsonLd formation={formation} pole={pole} />

      <main className="min-h-screen">
        {/* Breadcrumb */}
        <nav
          className="bg-card border-b border-border"
          aria-label="Fil d'Ariane"
        >
          <div className="container-custom py-4">
            <ol className="flex items-center gap-2 text-sm text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-foreground transition-colors">
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
              <li className="text-foreground" aria-current="page">
                {formation.title}
              </li>
            </ol>
          </div>
        </nav>

        {/* Hero */}
        <header className="section-padding-sm bg-gradient-to-b from-background to-card">
          <div className="container-custom">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {formation.pole_name}
                </span>
                {formation.certification && (
                  <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                    {formation.certification}
                  </span>
                )}
              </div>
              <h1 className="heading-hero mb-6">{formation.title}</h1>
              {formation.subtitle && (
                <p className="text-xl text-muted-foreground mb-4">{formation.subtitle}</p>
              )}
              <p className="text-body-lg">{formation.description}</p>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <section className="section-padding-sm" aria-labelledby="formation-details">
          <h2 id="formation-details" className="sr-only">
            Détails de la formation
          </h2>
          <div className="container-custom">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Colonne principale */}
              <div className="lg:col-span-2 space-y-12">
                {/* Objectifs généraux */}
                {formation.objectifs_generaux && Array.isArray(formation.objectifs_generaux) && formation.objectifs_generaux.length > 0 && (
                  <section aria-labelledby="objectifs">
                    <h2 id="objectifs" className="heading-card mb-4">Objectifs de la formation</h2>
                    <ul className="space-y-2">
                      {formation.objectifs_generaux.map((obj: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-body">
                          <span className="text-primary mt-1" aria-hidden="true">✓</span>
                          {obj}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Programme */}
                {formation.programme && Array.isArray(formation.programme) && formation.programme.length > 0 && (
                  <section aria-labelledby="programme">
                    <h2 id="programme" className="heading-card mb-4">Programme</h2>
                    <div className="space-y-4">
                      {formation.programme.map((item: any, i: number) => (
                        <article key={i} className="p-4 bg-card rounded-lg border border-border">
                          <h3 className="font-medium mb-2">{item.title || item}</h3>
                          {item.content && <p className="text-muted-foreground text-sm">{item.content}</p>}
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {/* Prérequis */}
                {formation.prerequis && Array.isArray(formation.prerequis) && formation.prerequis.length > 0 && (
                  <section aria-labelledby="prerequis">
                    <h2 id="prerequis" className="heading-card mb-4">Prérequis</h2>
                    <ul className="space-y-2">
                      {formation.prerequis.map((prereq: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-body">
                          <span className="text-muted-foreground" aria-hidden="true">•</span>
                          {prereq}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* Public visé */}
                {formation.public_vise && Array.isArray(formation.public_vise) && formation.public_vise.length > 0 && (
                  <section aria-labelledby="public">
                    <h2 id="public" className="heading-card mb-4">Public concerné</h2>
                    <ul className="space-y-2">
                      {formation.public_vise.map((pub: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-body">
                          <span className="text-muted-foreground" aria-hidden="true">•</span>
                          {pub}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="card-minimal p-6 sticky top-24">
                  <h2 className="heading-card mb-6">Informations pratiques</h2>

                  <dl className="space-y-4 mb-8">
                    {formation.duration && (
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <dt className="text-muted-foreground">Durée</dt>
                        <dd className="font-medium">{formation.duration}</dd>
                      </div>
                    )}
                    {formation.price && (
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <dt className="text-muted-foreground">Tarif</dt>
                        <dd className="font-medium text-primary">{formation.price}</dd>
                      </div>
                    )}
                    {formation.nombre_participants && (
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <dt className="text-muted-foreground">Participants</dt>
                        <dd className="font-medium">{formation.nombre_participants}</dd>
                      </div>
                    )}
                    {formation.format_lieu && (
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <dt className="text-muted-foreground">Lieu</dt>
                        <dd className="font-medium">{formation.format_lieu}</dd>
                      </div>
                    )}
                  </dl>

                  {/* Prochaines sessions */}
                  {sessions && sessions.length > 0 && (
                    <div className="mb-8">
                      <h3 className="font-medium mb-4">Prochaines sessions</h3>
                      <ul className="space-y-2">
                        {sessions.slice(0, 3).map((session) => (
                          <li
                            key={session.id}
                            className="p-3 bg-secondary/50 rounded-lg text-sm"
                          >
                            <time dateTime={session.start_date}>
                              {new Date(session.start_date).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </time>
                            {session.location && (
                              <span className="text-muted-foreground ml-2">
                                - {session.location}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Link
                    href="/contact"
                    className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                  >
                    Demander un devis
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
