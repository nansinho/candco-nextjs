import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Shield,
  Baby,
  HeartPulse,
  Clock,
  Users,
  Award,
  BookOpen,
  CheckCircle,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

// Configuration des pôles
const polesConfig: Record<
  string,
  {
    title: string;
    subtitle: string;
    description: string;
    longDescription: string;
    image: string;
    icon: typeof Shield;
    cssVar: string;
    features: { title: string; description: string }[];
    certifications: string[];
  }
> = {
  "securite-prevention": {
    title: "Sécurité & Prévention",
    subtitle: "Protéger, prévenir, intervenir",
    description:
      "Formations certifiantes en sécurité au travail : SST, prévention incendie, habilitations électriques et gestes d'urgence.",
    longDescription:
      "Notre pôle Sécurité & Prévention vous accompagne dans la maîtrise des risques professionnels. Des formations certifiantes et reconnues pour devenir acteur de la sécurité dans votre entreprise.",
    image: "/pole-security.jpg",
    icon: Shield,
    cssVar: "pole-securite",
    features: [
      {
        title: "Formateurs experts",
        description: "Professionnels de la sécurité en activité",
      },
      {
        title: "Mises en situation",
        description: "Exercices pratiques sur équipements professionnels",
      },
      {
        title: "Certifications reconnues",
        description: "SST, EPI, équipier de première intervention",
      },
      {
        title: "Financement OPCO",
        description: "Formations éligibles aux financements entreprise",
      },
    ],
    certifications: ["SST - Sauveteur Secouriste du Travail", "EPI - Équipier de Première Intervention", "Habilitations électriques", "SSIAP"],
  },
  "petite-enfance": {
    title: "Petite Enfance",
    subtitle: "Accompagner l'éveil et le développement",
    description:
      "Formations en petite enfance : éveil, pédagogies alternatives, accompagnement du développement de l'enfant.",
    longDescription:
      "Notre pôle Petite Enfance forme les professionnels à l'accompagnement bienveillant des tout-petits. Découvrez nos formations sur les pédagogies alternatives, l'éveil sensoriel et le développement de l'enfant.",
    image: "/pole-childhood.jpg",
    icon: Baby,
    cssVar: "pole-petite-enfance",
    features: [
      {
        title: "Pédagogies alternatives",
        description: "Montessori, Pikler, Reggio Emilia",
      },
      {
        title: "Approche bienveillante",
        description: "Communication positive et écoute active",
      },
      {
        title: "Éveil sensoriel",
        description: "Activités adaptées au développement",
      },
      {
        title: "Formation continue",
        description: "Mise à jour des compétences régulière",
      },
    ],
    certifications: ["CAP AEPE", "Éveil et développement", "Pédagogies alternatives", "Communication bienveillante"],
  },
  sante: {
    title: "Santé",
    subtitle: "Soigner, accompagner, prévenir",
    description:
      "Formations santé : gestes d'urgence, accompagnement des patients, soins et prévention pour les professionnels de santé.",
    longDescription:
      "Notre pôle Santé propose des formations adaptées aux professionnels du secteur médical et paramédical. Maîtrisez les gestes essentiels et développez vos compétences en accompagnement des patients.",
    image: "/pole-health.jpg",
    icon: HeartPulse,
    cssVar: "pole-sante",
    features: [
      {
        title: "Gestes d'urgence",
        description: "AFGSU, premiers secours",
      },
      {
        title: "Accompagnement patient",
        description: "Relation d'aide et communication",
      },
      {
        title: "Prévention",
        description: "Hygiène et sécurité des soins",
      },
      {
        title: "Certification reconnue",
        description: "Formations validées par les autorités de santé",
      },
    ],
    certifications: ["AFGSU", "Gestes et soins d'urgence", "Accompagnement fin de vie", "Hygiène hospitalière"],
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pole = polesConfig[slug];

  if (!pole) {
    return { title: "Pôle non trouvé" };
  }

  return {
    title: `${pole.title} | Formations Professionnelles`,
    description: pole.description,
    keywords: [
      pole.title.toLowerCase(),
      "formation professionnelle",
      "formation certifiante",
      "Qualiopi",
      "OPCO",
      ...pole.certifications.map((c) => c.toLowerCase()),
    ],
    openGraph: {
      title: `${pole.title} | C&Co Formation`,
      description: pole.description,
      images: [{ url: pole.image, width: 1200, height: 630, alt: pole.title }],
    },
  };
}

export async function generateStaticParams() {
  return [
    { slug: "securite-prevention" },
    { slug: "petite-enfance" },
    { slug: "sante" },
  ];
}

export default async function PolePage({ params }: Props) {
  const { slug } = await params;
  const pole = polesConfig[slug];

  if (!pole) {
    notFound();
  }

  const supabase = await createClient();

  // Récupérer les formations de ce pôle
  const { data: formations } = await supabase
    .from("formations")
    .select("id, title, slug, subtitle, duration, price, image_url")
    .eq("pole", slug)
    .eq("active", true)
    .order("title");

  const Icon = pole.icon;

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={pole.image}
            alt={pole.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/80 to-background" />
        </div>

        <div className="container-custom relative z-10 text-center py-20">
          {/* Icon Badge */}
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
            style={{ backgroundColor: `hsl(var(--${pole.cssVar}) / 0.15)` }}
          >
            <Icon
              className="w-8 h-8"
              style={{ color: `hsl(var(--${pole.cssVar}))` }}
            />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-4 max-w-4xl mx-auto">
            {pole.title}
          </h1>

          <p
            className="text-xl font-medium mb-6"
            style={{ color: `hsl(var(--${pole.cssVar}))` }}
          >
            {pole.subtitle}
          </p>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            {pole.longDescription}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#formations"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Voir les formations
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Nos atouts
            </p>
            <h2 className="heading-section">
              Pourquoi choisir nos formations {pole.title.toLowerCase()} ?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pole.features.map((feature, index) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl border border-border/50 hover:bg-card/50 transition-all duration-300"
                style={{
                  "--hover-border-color": `hsl(var(--${pole.cssVar}) / 0.3)`,
                } as React.CSSProperties}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: `hsl(var(--${pole.cssVar}) / 0.15)` }}
                >
                  <CheckCircle
                    className="w-5 h-5"
                    style={{ color: `hsl(var(--${pole.cssVar}))` }}
                  />
                </div>
                <h3 className="font-medium mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section className="section-padding border-t border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Certifications
            </p>
            <h2 className="heading-section mb-12">
              Formations certifiantes reconnues
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {pole.certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border/50"
                >
                  <Award
                    className="w-4 h-4"
                    style={{ color: `hsl(var(--${pole.cssVar}))` }}
                  />
                  <span className="text-sm font-medium">{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Formations Section */}
      <section id="formations" className="section-padding border-t border-border/50">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                Nos formations
              </p>
              <h2 className="heading-section">
                {formations?.length || 0} formations disponibles
              </h2>
            </div>

            <Link
              href="/formations"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Tout le catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {formations && formations.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {formations.map((formation) => (
                <Link
                  key={formation.id}
                  href={`/formations/${slug}/${formation.slug || formation.id}`}
                  className="group block h-full"
                >
                  <article className="h-full bg-card rounded-xl border border-border/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                    {/* Image */}
                    <div className="aspect-[3/2] overflow-hidden relative bg-secondary">
                      {formation.image_url ? (
                        <img
                          src={formation.image_url}
                          alt={formation.title}
                          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{
                            background: `linear-gradient(135deg, hsl(var(--${pole.cssVar}) / 0.2), hsl(var(--${pole.cssVar}) / 0.05))`,
                          }}
                        >
                          <BookOpen
                            className="w-8 h-8"
                            style={{ color: `hsl(var(--${pole.cssVar}) / 0.5)` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Colored bar */}
                    <div
                      className="h-1 w-0 group-hover:w-full transition-all duration-500"
                      style={{ backgroundColor: `hsl(var(--${pole.cssVar}))` }}
                    />

                    {/* Content */}
                    <div className="p-5">
                      <h3
                        className="font-medium mb-2 transition-colors"
                        style={{ color: `hsl(var(--${pole.cssVar}))` }}
                      >
                        {formation.title}
                      </h3>
                      {formation.subtitle && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {formation.subtitle}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                        {formation.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formation.duration}
                          </div>
                        )}
                        {formation.price && (
                          <span
                            className="font-medium transition-colors"
                            style={{ color: `hsl(var(--${pole.cssVar}))` }}
                          >
                            {formation.price}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-2xl border border-border/50">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Aucune formation disponible pour le moment dans ce pôle.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                Contactez-nous pour plus d'informations
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding border-t border-border/50">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "25 000+", label: "Stagiaires formés", icon: Users },
              { value: "98%", label: "Taux de réussite", icon: Award },
              { value: "15+", label: "Années d'expérience", icon: Clock },
              { value: "100%", label: "Finançable OPCO", icon: CheckCircle },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <StatIcon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-light text-primary mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Prêt à vous former ?
            </p>
            <h2 className="heading-section mb-6">
              Lancez-vous dans la formation {pole.title.toLowerCase()}
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Nos conseillers sont à votre disposition pour vous accompagner
              dans votre projet de formation. Financement, planning, contenu...
              nous répondons à toutes vos questions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Demander un devis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/formations"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                Voir toutes les formations
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
