import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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
  Clock,
} from "lucide-react";
import PartnersSection from "@/components/home/PartnersSection";
import Testimonials from "@/components/home/Testimonials";
import BlogPreview from "@/components/home/BlogPreview";
import HeroCarousel from "@/components/home/HeroCarousel";

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

const polesConfig = [
  {
    id: "securite-prevention",
    title: "Sécurité Prévention",
    description: "Développez vos compétences en prévention des risques et premiers secours. Formations certifiantes éligibles au financement OPCO.",
    image: "/pole-security.jpg",
    icon: Shield,
    color: "pole-securite",
  },
  {
    id: "petite-enfance",
    title: "Petite Enfance",
    description: "Accompagnez le développement des tout-petits avec bienveillance et pédagogies innovantes.",
    image: "/pole-childhood.jpg",
    icon: Baby,
    color: "pole-petite-enfance",
  },
  {
    id: "sante",
    title: "Santé",
    description: "Maîtrisez les gestes essentiels du soin et de l'urgence. Formations pratiques certifiées et reconnues.",
    image: "/pole-health.jpg",
    icon: HeartPulse,
    color: "pole-sante",
  },
];

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

  // Paralléliser les requêtes Supabase pour de meilleures performances
  const [popularResult, poleCountsResult] = await Promise.all([
    supabase
      .from("formations")
      .select("id, title, subtitle, slug, duration, price, pole, pole_name, image_url")
      .eq("active", true)
      .eq("popular", true)
      .limit(4),
    supabase
      .from("formations")
      .select("pole")
      .eq("active", true),
  ]);

  let formations = popularResult.data;

  // Si pas assez de formations populaires, récupérer les plus récentes
  if (!formations || formations.length < 4) {
    const { data: recentFormations } = await supabase
      .from("formations")
      .select("id, title, subtitle, slug, duration, price, pole, pole_name, image_url")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(4);
    formations = recentFormations;
  }

  const poleCounts = poleCountsResult.data;

  const counts: Record<string, number> = {};
  poleCounts?.forEach((f) => {
    counts[f.pole] = (counts[f.pole] || 0) + 1;
  });

  return (
    <>
      {/* Hero Section with Ken Burns Effect */}
      <HeroCarousel />

      {/* Partners Section */}
      <PartnersSection />

      {/* Training Poles Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Nos domaines d'expertise
            </p>
            <h2 className="heading-section">
              Trois pôles de formation pour accompagner votre évolution professionnelle.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {polesConfig.map((pole) => {
              const Icon = pole.icon;
              const count = counts[pole.id] || 0;
              return (
                <Link
                  key={pole.id}
                  href={`/pole/${pole.id}`}
                  className="group block h-full"
                >
                  <article className="relative h-full bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <Image
                        src={pole.image}
                        alt={`Formation ${pole.title}`}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                      />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-all duration-500"
                        style={{ backgroundColor: `hsl(var(--${pole.color}))` }}
                      />
                      {/* Icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center scale-50 group-hover:scale-100 transition-transform duration-500"
                          style={{ backgroundColor: `hsl(var(--${pole.color}) / 0.9)` }}
                        >
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Colored bar */}
                    <div
                      className="h-1 w-0 group-hover:w-full transition-all duration-500"
                      style={{ backgroundColor: `hsl(var(--${pole.color}))` }}
                    />

                    {/* Content */}
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <h3
                          className="text-lg font-medium"
                          style={{ color: `hsl(var(--${pole.color}))` }}
                        >
                          {pole.title}
                        </h3>
                        <ArrowRight
                          className="w-4 h-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 mt-1"
                          style={{ color: `hsl(var(--${pole.color}))` }}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {pole.description}
                      </p>
                      <p
                        className="text-xs font-medium"
                        style={{ color: `hsl(var(--${pole.color}) / 0.8)` }}
                      >
                        {count} {count > 1 ? "formations" : "formation"}
                      </p>
                    </div>
                  </article>
                </Link>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/formations"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Voir toutes les formations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Formations Section */}
      {formations && formations.length > 0 && (
        <section className="section-padding border-t border-border/50">
          <div className="container-custom">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
              <div className="max-w-xl">
                <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                  Formations populaires
                </p>
                <h2 className="heading-section">
                  Nos formations les plus demandées.
                </h2>
              </div>

              <Link
                href="/formations"
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Voir tout
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {formations.map((formation) => {
                // Map pole to color
                const poleColorMap: Record<string, string> = {
                  "securite-prevention": "pole-securite",
                  "petite-enfance": "pole-petite-enfance",
                  "sante": "pole-sante",
                };
                const poleColor = poleColorMap[formation.pole] || "primary";

                return (
                  <Link
                    key={formation.id}
                    href={`/formations/${formation.pole}/${formation.slug || formation.id}`}
                    className="group block h-full"
                  >
                    <article className="h-full bg-card rounded-xl border border-border/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                      {/* Image */}
                      <div className="aspect-[3/2] overflow-hidden relative bg-secondary">
                        {formation.image_url ? (
                          <Image
                            src={formation.image_url}
                            alt={formation.title}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            className="object-cover transition-all duration-700 group-hover:scale-110"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center"
                            style={{
                              background: `linear-gradient(135deg, hsl(var(--${poleColor}) / 0.2), hsl(var(--${poleColor}) / 0.05))`,
                            }}
                          >
                            <BookOpen
                              className="w-8 h-8"
                              style={{ color: `hsl(var(--${poleColor}) / 0.5)` }}
                            />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span
                            className="text-xs px-2.5 py-1 rounded-full"
                            style={{
                              backgroundColor: `hsl(var(--${poleColor}))`,
                              color: `hsl(var(--${poleColor}-foreground))`,
                            }}
                          >
                            {formation.pole_name}
                          </span>
                        </div>
                      </div>

                      {/* Colored bar */}
                      <div
                        className="h-1 w-0 group-hover:w-full transition-all duration-500"
                        style={{ backgroundColor: `hsl(var(--${poleColor}))` }}
                      />

                      {/* Content */}
                      <div className="p-5">
                        <h3
                          className="font-medium mb-1 transition-colors"
                          style={{
                            color: `hsl(var(--${poleColor}))`,
                          }}
                        >
                          {formation.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {formation.subtitle}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formation.duration}
                          </div>
                          <span
                            className="font-medium transition-colors"
                            style={{ color: `hsl(var(--${poleColor}))` }}
                          >
                            {formation.price}
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
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

      {/* Testimonials Section */}
      <Testimonials />

      {/* Blog Preview Section */}
      <BlogPreview />

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Prêt à vous former ?
            </p>
            <h2 className="heading-section mb-6">
              Commencez votre formation dès aujourd'hui.
            </h2>
            <p className="text-body-lg text-muted-foreground mb-8">
              Rejoignez les professionnels qui ont fait confiance à C&Co Formation.
              Accompagnement personnalisé, 100% finançable via OPCO.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/formations"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Voir les formations
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
