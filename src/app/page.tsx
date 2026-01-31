import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  Users,
  BookOpen,
  Headphones,
  CheckCircle,
  TrendingUp,
  Shield,
  Baby,
  HeartPulse,
} from "lucide-react";

export const metadata: Metadata = {
  title: "C&Co Formation | Centre de Formation Professionnelle Certifié Qualiopi",
  description:
    "C&Co Formation, organisme certifié Qualiopi. Formations en Sécurité (SST, prévention incendie), Petite Enfance (éveil, pédagogies alternatives) et Santé. Financement OPCO et entreprises. Plus de 25 000 stagiaires formés.",
  keywords: [
    "formation professionnelle",
    "organisme formation certifié",
    "formation SST",
    "formation prévention incendie",
    "formation petite enfance",
    "Qualiopi",
    "financement OPCO",
  ],
};

const stats = [
  { value: "25 000+", label: "Professionnels formés" },
  { value: "98%", label: "Taux de réussite" },
  { value: "15+", label: "Années d'expertise" },
];

const poleIcons = {
  "securite-prevention": Shield,
  "petite-enfance": Baby,
  sante: HeartPulse,
};

const poleDescriptions: Record<string, string> = {
  "securite-prevention":
    "SST, incendie, habilitations électriques. Protégez vos équipes avec nos formations certifiantes.",
  "petite-enfance":
    "Éveil, pédagogies alternatives, formations continues. Accompagnez le développement des tout-petits.",
  sante:
    "Gestes d'urgence, soins, accompagnement. Des formations pour les professionnels de santé.",
};

const features = [
  {
    icon: Award,
    title: "Certification Qualiopi",
    description: "Garantie qualité et éligibilité aux financements.",
  },
  {
    icon: Users,
    title: "Formateurs experts",
    description: "Professionnels en activité avec expertise terrain.",
  },
  {
    icon: BookOpen,
    title: "Pédagogie pratique",
    description: "Apprentissage concret avec équipements pro.",
  },
  {
    icon: Headphones,
    title: "Accompagnement",
    description: "Conseiller dédié de A à Z.",
  },
  {
    icon: CheckCircle,
    title: "98% de réussite",
    description: "Méthodologie éprouvée et suivi individualisé.",
  },
  {
    icon: TrendingUp,
    title: "Financement facilité",
    description: "OPCO, Entreprises, Pôle Emploi... Solutions adaptées.",
  },
];

export default async function HomePage() {
  const supabase = await createClient();

  // Récupérer les formations depuis Supabase
  const { data: formations } = await supabase
    .from("formations")
    .select(
      "id, title, slug, description, duration, price, pole, pole_name, image_url"
    )
    .eq("active", true)
    .order("title")
    .limit(6);

  // Récupérer les pôles uniques depuis les formations
  const { data: polesData } = await supabase
    .from("formations")
    .select("pole, pole_name")
    .eq("active", true);

  // Dédupliquer les pôles
  const polesMap = new Map();
  polesData?.forEach((f) => {
    if (f.pole && !polesMap.has(f.pole)) {
      polesMap.set(f.pole, { slug: f.pole, name: f.pole_name });
    }
  });
  const poles = Array.from(polesMap.values());

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-b from-background via-background/95 to-card overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        </div>

        <div className="container-custom relative z-10 text-center py-20">
          {/* Badge */}
          <p className="text-sm text-muted-foreground mb-6 tracking-widest uppercase">
            Centre de formation certifié Qualiopi
          </p>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-tight mb-8 max-w-4xl mx-auto">
            Construisez votre{" "}
            <span className="text-primary font-medium">avenir professionnel</span>{" "}
            avec excellence
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Sécurité, Petite Enfance, Santé. Des formations certifiantes
            finançables via OPCO et dispositifs entreprise, conçues pour votre
            réussite.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/formations"
              className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Découvrir nos formations
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto sm:min-w-[220px] inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Nous contacter
            </Link>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-6 sm:gap-12 lg:gap-20">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="text-center min-w-[60px] sm:min-w-[80px] lg:min-w-[100px]"
              >
                <p className="text-2xl sm:text-3xl lg:text-4xl font-light mb-1 tabular-nums text-primary">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pôles Section */}
      {poles && poles.length > 0 && (
        <section className="section-padding border-t border-border/50">
          <div className="container-custom">
            <div className="max-w-2xl mb-12">
              <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                Nos domaines d'expertise
              </p>
              <h2 className="heading-section">
                Trois pôles de formation pour répondre à vos besoins.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {poles.map((pole) => {
                const Icon =
                  poleIcons[pole.slug as keyof typeof poleIcons] || BookOpen;
                const description = poleDescriptions[pole.slug] || "";
                return (
                  <Link
                    key={pole.slug}
                    href={`/pole/${pole.slug}`}
                    className="group relative p-8 rounded-2xl border border-border/50 bg-card/30 hover:border-primary/30 hover:bg-card/60 transition-all duration-300"
                  >
                    <div className="mb-6">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                        <Icon className="w-7 h-7 text-primary" />
                      </div>
                    </div>
                    <h3 className="heading-card mb-3 group-hover:text-primary transition-colors">
                      {pole.name}
                    </h3>
                    <p className="text-body text-muted-foreground">
                      {description}
                    </p>
                    <div className="mt-6 flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Voir les formations
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Formations Section */}
      {formations && formations.length > 0 && (
        <section className="section-padding bg-card/30 border-t border-border/50">
          <div className="container-custom">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
              <div className="max-w-2xl">
                <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                  Nos formations
                </p>
                <h2 className="heading-section">
                  Des formations adaptées à votre parcours.
                </h2>
              </div>
              <Link
                href="/formations"
                className="inline-flex items-center gap-2 text-primary hover:underline underline-offset-4"
              >
                Voir toutes les formations
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formations.map((formation) => (
                <Link
                  key={formation.id}
                  href={`/formations/${formation.pole}/${formation.slug}`}
                  className="group card-minimal-hover p-6 flex flex-col"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded">
                      {formation.pole_name}
                    </span>
                  </div>
                  <h3 className="heading-card mb-2 group-hover:text-primary transition-colors">
                    {formation.title}
                  </h3>
                  <p className="text-body text-muted-foreground line-clamp-3 flex-1 mb-4">
                    {formation.description}
                  </p>
                  <div className="flex items-center justify-between text-sm pt-4 border-t border-border/50">
                    {formation.duration && (
                      <span className="text-muted-foreground">
                        {formation.duration}
                      </span>
                    )}
                    {formation.price && (
                      <span className="text-primary font-medium">
                        {formation.price}€
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Choose Us Section */}
      <section className="section-padding border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Pourquoi nous choisir
            </p>
            <h2 className="heading-section">
              L'excellence au service de votre réussite professionnelle.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative p-6 rounded-2xl border border-transparent hover:border-border/50 hover:bg-card/50 transition-all duration-300"
                >
                  <div className="relative mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <h3 className="font-medium mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
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
            <h2 className="heading-section mb-6">
              Prêt à développer vos compétences ?
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8">
              Contactez-nous pour discuter de votre projet de formation. Notre
              équipe vous accompagne dans le choix de la formation adaptée et les
              démarches de financement.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Demander un devis gratuit
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/formations"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                Parcourir le catalogue
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
