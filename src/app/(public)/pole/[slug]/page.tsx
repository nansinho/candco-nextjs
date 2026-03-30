import { createServiceClient, ORG_ID } from "@/lib/supabase/service";
import { getPoleFromDomaine } from "@/lib/domaines";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  Shield,
  Baby,
  HeartPulse,
  Briefcase,
  Clock,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  Star,
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
    hex: string;
    features: { title: string; description: string }[];
    certifications: string[];
  }
> = {
  "securite-prevention": {
    title: "Sécurité & Prévention",
    subtitle: "Protéger, prévenir, intervenir",
    description:
      "Formations certifiantes en sécurité au travail : SST, prévention incendie, habilitations électriques et gestes d’urgence.",
    longDescription:
      "Notre pôle Sécurité & Prévention vous accompagne dans la maîtrise des risques professionnels. Des formations certifiantes et reconnues pour devenir acteur de la sécurité dans votre entreprise.",
    image: "/images/poles/pole-security.jpg",
    icon: Shield,
    cssVar: "pole-securite",
    hex: "#A82424",
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
    subtitle: "Accompagner l’éveil et le développement",
    description:
      "Formations en petite enfance : éveil, pédagogies alternatives, accompagnement du développement de l’enfant.",
    longDescription:
      "Notre pôle Petite Enfance forme les professionnels à l’accompagnement bienveillant des tout-petits. Découvrez nos formations sur les pédagogies alternatives, l’éveil sensoriel et le développement de l’enfant.",
    image: "/images/poles/pole-childhood.jpg",
    icon: Baby,
    cssVar: "pole-petite-enfance",
    hex: "#2D867E",
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
      "Formations santé : gestes d’urgence, accompagnement des patients, soins et prévention pour les professionnels de santé.",
    longDescription:
      "Notre pôle Santé propose des formations adaptées aux professionnels du secteur médical et paramédical. Maîtrisez les gestes essentiels et développez vos compétences en accompagnement des patients.",
    image: "/images/poles/pole-health.jpg",
    icon: HeartPulse,
    cssVar: "pole-sante",
    hex: "#507395",
    features: [
      {
        title: "Gestes d’urgence",
        description: "AFGSU, premiers secours",
      },
      {
        title: "Accompagnement patient",
        description: "Relation d’aide et communication",
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
    certifications: ["AFGSU", "Gestes et soins d’urgence", "Accompagnement fin de vie", "Hygiène hospitalière"],
  },
  entrepreneuriat: {
    title: "Entrepreneuriat",
    subtitle: "Créer, développer, réussir",
    description: "Formations pour entrepreneurs et porteurs de projets : création d’entreprise, gestion, développement commercial.",
    longDescription: "Notre pôle Entrepreneuriat accompagne les créateurs et dirigeants d’entreprise. Des formations pratiques pour développer votre activité et acquérir les compétences clés de la gestion d’entreprise.",
    image: "/images/poles/pole-company.jpg",
    icon: Briefcase,
    cssVar: "primary",
    hex: "#1F628E",
    features: [
      { title: "Création d’entreprise", description: "Accompagnement de A à Z dans votre projet" },
      { title: "Gestion financière", description: "Maîtriser les bases de la comptabilité et du budget" },
      { title: "Développement commercial", description: "Stratégies pour développer votre clientèle" },
      { title: "Accompagnement personnalisé", description: "Suivi individuel de votre progression" },
    ],
    certifications: ["Création d’entreprise", "Gestion et comptabilité", "Marketing digital", "Management"],
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
    { slug: "entrepreneuriat" },
  ];
}

export default async function PolePage({ params }: Props) {
  const { slug } = await params;
  const pole = polesConfig[slug];

  if (!pole) {
    notFound();
  }

  const supabase = createServiceClient();

  // Domaine keyword for ilike filter
  const slugToKeyword: Record<string, string> = {
    "securite-prevention": "%écurité%",
    "petite-enfance": "%nfance%",
    "sante": "%anté%",
    "entrepreneuriat": "%ntrepreneuriat%",
  };
  const keyword = slugToKeyword[slug];

  // Récupérer les formations de ce pôle (ilike to match all domaine variants)
  const query = supabase
    .from("produits_formation")
    .select("id, intitule, slug, sous_titre, duree_heures, duree_jours, image_url, domaine, produit_tarifs(prix_ht, is_default)")
    .eq("organisation_id", ORG_ID)
    .eq("publie", true)
    .order("intitule");

  if (keyword) {
    query.ilike("domaine", keyword);
  }

  const { data: rawFormations } = await query;

  const formations = (rawFormations || []).map((f: Record<string, unknown>) => {
    const tarifs = f.produit_tarifs as Array<{ prix_ht: number; is_default: boolean }> | null;
    const defaultTarif = tarifs?.find((t) => t.is_default) || tarifs?.[0];
    return {
      id: f.id as string,
      title: f.intitule as string,
      slug: f.slug as string,
      subtitle: (f.sous_titre as string) || "",
      duration: f.duree_jours ? `${f.duree_jours}j` : f.duree_heures ? `${f.duree_heures}h` : "",
      price: defaultTarif ? `${defaultTarif.prix_ht}€ HT` : "",
      image_url: f.image_url as string | null,
    };
  });

  const Icon = pole.icon;
  const hex = pole.hex;

  // Compute rgba from hex for icon backgrounds
  const hexToRgb = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    return `${r},${g},${b}`;
  };
  const rgb = hexToRgb(hex);

  return (
    <>
      {/* Hero */}
      <section
        className="relative z-10"
        style={{ background: "linear-gradient(180deg, #1a6faa 0%, #1F628E 40%, #17567d 60%, #151F2D 60%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 text-center">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="hover:text-white transition-colors">Pôle</span>
            <span>/</span>
            <span style={{ color: "#ffffff" }}>{pole.title}</span>
          </nav>

          {/* Rating pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-5 border border-white/10">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.8)" }}>4.9 · Plus de 50 avis</span>
          </div>

          {/* H1 */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight max-w-5xl mx-auto mb-6" style={{ color: "#ffffff" }}>
            Pôle <span style={{ color: "#F8A991" }}>{pole.title}</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            {pole.subtitle}
          </p>
          <p className="text-base max-w-2xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            {pole.longDescription}
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-10">
            {[
              { icon: Users, text: "25 000+ Formés" },
              { icon: CheckCircle, text: "98% Réussite" },
              { icon: Award, text: "Certifié Qualiopi" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
                <b.icon className="w-4 h-4" />
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Hero image */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl shadow-black/30 ring-[12px] ring-[#151F2D]">
            <Image
              src={pole.image}
              alt={pole.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10">
              <div className="space-y-2 sm:space-y-3">
                <span
                  className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: hex, color: "#ffffff" }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {pole.title}
                </span>
                <h2 className="text-lg sm:text-2xl md:text-3xl font-bold leading-tight" style={{ color: "#ffffff" }}>
                  {pole.subtitle}
                </h2>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12" />
      </section>

      {/* Features */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-16">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#F8A991" }}>
              Nos atouts
            </span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight leading-[1.1] mb-4" style={{ color: "#ffffff" }}>
              Pourquoi choisir nos formations <span style={{ color: "#F8A991" }}>{pole.title.toLowerCase()}</span> ?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pole.features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl p-7 hover:-translate-y-1 transition-all duration-300"
                style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: `rgba(${rgb},0.1)` }}
                >
                  <CheckCircle className="w-5 h-5" style={{ color: hex }} />
                </div>
                <h3 className="text-base font-bold mb-2" style={{ color: "#ffffff" }}>{feature.title}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#F8A991" }}>
              Certifications
            </span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight leading-[1.1] mb-12" style={{ color: "#ffffff" }}>
              Formations certifiantes <span style={{ color: "#F8A991" }}>reconnues</span>
            </h2>

            <div className="flex flex-wrap justify-center gap-4">
              {pole.certifications.map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <Award className="w-4 h-4" style={{ color: hex }} />
                  <span className="text-sm font-medium" style={{ color: "#ffffff" }}>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Formations */}
      <section id="formations" className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div className="max-w-xl">
              <span className="inline-block text-xs font-bold uppercase tracking-widest mb-5" style={{ color: "#F8A991" }}>
                Nos formations
              </span>
              <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight leading-[1.1]" style={{ color: "#ffffff" }}>
                <span style={{ color: "#F8A991" }}>{formations?.length || 0}</span> formations disponibles
              </h2>
            </div>

            <Link
              href="/formations"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "#ffffff", border: "1px solid rgba(255,255,255,0.08)" }}
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
                  <article
                    className="h-full rounded-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
                    style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {/* Image */}
                    <div className="aspect-[3/2] overflow-hidden relative" style={{ backgroundColor: "rgba(255,255,255,0.02)" }}>
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
                            background: `linear-gradient(135deg, rgba(${rgb},0.2), rgba(${rgb},0.05))`,
                          }}
                        >
                          <BookOpen
                            className="w-8 h-8"
                            style={{ color: `rgba(${rgb},0.5)` }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Colored bar */}
                    <div
                      className="h-1 w-0 group-hover:w-full transition-all duration-500"
                      style={{ backgroundColor: hex }}
                    />

                    {/* Content */}
                    <div className="p-5">
                      <h3
                        className="font-medium mb-2 transition-colors"
                        style={{ color: hex }}
                      >
                        {formation.title}
                      </h3>
                      {formation.subtitle && (
                        <p className="text-sm mb-4 line-clamp-2" style={{ color: "rgba(255,255,255,0.55)" }}>
                          {formation.subtitle}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs pt-4" style={{ color: "rgba(255,255,255,0.4)", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        {formation.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formation.duration}
                          </div>
                        )}
                        {formation.price && (
                          <span
                            className="font-medium transition-colors"
                            style={{ color: hex }}
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
            <div
              className="text-center py-16 rounded-2xl"
              style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: "rgba(255,255,255,0.25)" }} />
              <p className="mb-4" style={{ color: "rgba(255,255,255,0.55)" }}>
                Aucune formation disponible pour le moment dans ce pôle.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 hover:underline"
                style={{ color: hex }}
              >
                Contactez-nous pour plus d&apos;informations
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#151F2D" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4">
            {[
              { value: "25 000+", label: "Stagiaires formés" },
              { value: "98%", label: "Taux de réussite" },
              { value: "15+", label: "Années d’expérience" },
              { value: "100%", label: "Finançable OPCO" },
            ].map((stat, idx) => (
              <div
                key={stat.label}
                className="py-8 text-center"
                style={idx > 0 ? { borderLeft: "1px solid rgba(255,255,255,0.08)" } : undefined}
              >
                <p className="text-5xl sm:text-6xl font-normal tracking-tight" style={{ color: "#ffffff" }}>
                  {stat.value}
                </p>
                <p className="text-[13px] mt-2" style={{ color: "rgba(255,255,255,0.35)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 sm:py-32" style={{ backgroundColor: "#1F628E" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>
              Prêt à vous former ?
            </span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight leading-[1.1] mb-6" style={{ color: "#ffffff" }}>
              Lancez-vous dans la formation <span style={{ color: "#F8A991" }}>{pole.title.toLowerCase()}</span>
            </h2>
            <p className="text-base max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
              Nos conseillers sont à votre disposition pour vous accompagner
              dans votre projet de formation. Financement, planning, contenu...
              nous répondons à toutes vos questions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-lg font-medium transition-colors hover:opacity-90"
                style={{ backgroundColor: "#F8A991", color: "#151F2D" }}
              >
                Demander un devis
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/formations"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-lg font-medium transition-colors hover:bg-white/10"
                style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#ffffff" }}
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
