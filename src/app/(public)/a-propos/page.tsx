import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Award,
  Users,
  Target,
  Heart,
  ArrowRight,
  CheckCircle,
  BookOpen,
  Lightbulb,
  MessageCircle,
  Smile,
  Monitor,
  ShieldCheck,
  Accessibility,
  HeartHandshake,
  FileCheck,
} from "lucide-react";
import AboutClient from "./AboutClient";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "À Propos de C&Co Formation | Organisme de Formation Certifié Qualiopi",
  description:
    "Découvrez C&Co Formation, organisme certifié Qualiopi fondé par Nicolas Devaux. 15 ans d'expérience terrain, formations personnalisées en sécurité, petite enfance et santé.",
  keywords: [
    "C&Co Formation",
    "organisme de formation",
    "Qualiopi",
    "Nicolas Devaux",
    "formation professionnelle",
    "centre de formation",
  ],
  openGraph: {
    title: "À Propos | C&Co Formation",
    description:
      "Organisme certifié Qualiopi fondé par Nicolas Devaux. 15 ans d'expérience terrain.",
    images: [
      {
        url: "/og-about.jpg",
        width: 1200,
        height: 630,
        alt: "C&Co Formation - À propos",
      },
    ],
  },
};

const clesReussite = [
  {
    icon: BookOpen,
    title: "Pédagogie sur mesure",
    description:
      "Chaque formation est adaptée aux besoins spécifiques de nos apprenants et aux réalités du terrain.",
  },
  {
    icon: Lightbulb,
    title: "Apprentissage actif",
    description:
      "Nos méthodes innovantes, notamment la simulation immersive, permettent une acquisition rapide des compétences.",
  },
  {
    icon: MessageCircle,
    title: "Suivi personnalisé",
    description:
      "Un accompagnement individualisé tout au long de votre parcours, assuré par des formateurs expérimentés.",
  },
  {
    icon: Smile,
    title: "Ambiance conviviale",
    description:
      "Un environnement bienveillant qui favorise l'apprentissage et les échanges entre participants.",
  },
  {
    icon: Monitor,
    title: "Outils pédagogiques variés",
    description:
      "Supports numériques, mises en situation, études de cas : une diversité de méthodes pour mieux apprendre.",
  },
  {
    icon: ShieldCheck,
    title: "Expertise terrain",
    description:
      "Des formateurs issus du terrain, apportant leur expérience opérationnelle à chaque session.",
  },
];

const benefices = [
  {
    title: "Acquisition des compétences",
    description:
      "Des savoir-faire concrets et transférables dans votre vie professionnelle.",
  },
  {
    title: "Meilleure compréhension",
    description:
      "Une approche pédagogique qui favorise la compréhension en profondeur.",
  },
  {
    title: "Développement personnel",
    description:
      "Un accompagnement qui vous aide à évoluer personnellement et professionnellement.",
  },
  {
    title: "Satisfaction garantie",
    description:
      "98% de satisfaction et 95% de réussite attestent de la qualité de nos formations.",
  },
];

// Founder icon component
function FounderIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="7" r="4" />
      <path d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2" />
    </svg>
  );
}

export default async function AboutPage() {
  const supabase = await createClient();

  // Fetch dynamic stats
  const [formationsRes, inscriptionsRes, clientsRes, formateursRes] =
    await Promise.all([
      supabase
        .from("formations")
        .select("id", { count: "exact", head: true })
        .eq("active", true),
      supabase.from("inscriptions").select("id", { count: "exact", head: true }),
      supabase
        .from("clients")
        .select("id", { count: "exact", head: true })
        .eq("active", true)
        .or("client_type.is.null,client_type.neq.agence"),
      supabase
        .from("formateurs")
        .select("id", { count: "exact", head: true })
        .eq("active", true),
    ]);

  const stats = [
    { value: String(formationsRes.count || 69), label: "Formations" },
    { value: String(inscriptionsRes.count || 336), label: "Apprenants" },
    { value: String(clientsRes.count || 23), label: "Clients" },
    { value: String(formateursRes.count || 6), label: "Collaborateurs" },
  ];

  return (
    <>
      {/* Hero */}
      <PageHero
        badge="À propos"
        title="L'expertise terrain au service de votre réussite"
        highlightedWord="expertise"
        description="Formation sur mesure, certifiée Qualiopi, avec 15 ans d'expérience."
        stats={stats}
        ctas={[
          { label: "Nos formations", href: "/formations", variant: "primary" },
          { label: "Contact", href: "/contact", variant: "outline" },
        ]}
      />

      {/* Fondateur */}
      <section className="section-padding border-b border-border/50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-muted">
                <Image
                  src="/hero-training.jpg"
                  alt="Nicolas Devaux, fondateur de C&Co Formation"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-4 -right-4 bg-background border border-border/50 rounded-xl p-4 shadow-lg">
                <Image
                  src="/logo-qualiopi.png"
                  alt="Certification Qualiopi"
                  width={96}
                  height={48}
                  className="h-12 w-auto"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                Le fondateur
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-6">
                Nicolas Devaux, une expertise de terrain.
              </h2>

              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Nicolas Devaux</strong>,
                  diplômé en tant que Responsable de Formation (RNCP 36215) et
                  ancien sous-officier des Marins-Pompiers de Marseille, a fondé
                  C&Co Formation avec une conviction forte :{" "}
                  <strong className="text-foreground">
                    transmettre une expertise de terrain, concrète et humaine
                  </strong>
                  .
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Fort de plus de{" "}
                  <strong className="text-foreground">
                    15 ans d'expérience opérationnelle et pédagogique
                  </strong>
                  , il a conçu un organisme centré sur l'efficacité, la
                  personnalisation et l'engagement, où chaque apprenant
                  bénéficie d'un accompagnement sur mesure.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
                  <Award className="w-4 h-4 text-primary" />
                  RNCP 36215
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
                  <Target className="w-4 h-4 text-primary" />
                  Marins-Pompiers de Marseille
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Certification Qualiopi - Uses client component for modal */}
      <AboutClient />

      {/* Les clés de notre réussite */}
      <section className="section-padding border-b border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Notre approche
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-4">
              Les clés de notre réussite.
            </h2>
            <p className="text-muted-foreground">
              Nous avons développé une méthodologie pédagogique unique, alliant
              expertise terrain et innovation, pour garantir votre réussite.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {clesReussite.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group relative p-6 rounded-2xl border border-transparent hover:border-border/50 hover:bg-card/50 transition-all duration-500 h-full"
                >
                  {/* Icon with animated background */}
                  <div className="relative mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                      <Icon className="w-5 h-5 text-primary transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 w-12 h-12 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                  </div>

                  <h3 className="font-medium mb-3 group-hover:text-primary transition-colors duration-300">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>

                  {/* Decorative corner */}
                  <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Les bénéfices */}
      <section className="section-padding border-b border-border/50 bg-muted/30">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Vos avantages
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-4">
              Les bénéfices pour vous.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefices.map((benefice) => (
              <div key={benefice.title} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">{benefice.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {benefice.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solidarité et ouverture */}
      <section className="section-padding border-b border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Notre engagement social
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-4">
              Solidarité et ouverture à tous.
            </h2>
            <p className="text-muted-foreground">
              Nous croyons fermement que la formation doit être accessible à
              tous. Notre engagement envers l'inclusion et la solidarité se
              reflète dans chacune de nos actions.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-card/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Accessibility className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Accessibilité pour tous</h3>
                <p className="text-sm text-muted-foreground">
                  Nos locaux et nos formations sont adaptés pour accueillir les
                  personnes en situation de handicap.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-card/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <HeartHandshake className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Accompagnement personnalisé</h3>
                <p className="text-sm text-muted-foreground">
                  Un référent handicap vous accompagne pour adapter votre
                  parcours à vos besoins spécifiques.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-6 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-card/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium mb-2">Diversité et inclusion</h3>
                <p className="text-sm text-muted-foreground">
                  Nous accueillons des apprenants de tous horizons et favorisons
                  les échanges et la solidarité.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <Link
              href="/handicap"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              <Accessibility className="w-4 h-4" />
              Personnes en situation de handicap
            </Link>
            <Link
              href="/accessibilite"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              Accessibilité numérique
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative mb-8">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">
              Prêt à vous former avec nous ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Rejoignez les centaines d'apprenants qui nous font confiance
              chaque année. Ensemble, développons vos compétences.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/formations"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Découvrir nos formations
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
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
