import { Metadata } from "next";
import Link from "next/link";
import {
  Accessibility,
  Eye,
  MousePointer,
  Keyboard,
  Volume2,
  Type,
  Contrast,
  ZoomIn,
  Settings,
  CheckCircle,
  Award,
  ChevronDown,
  ArrowRight,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Accessibilité Numérique | Notre Engagement",
  description:
    "C&Co Formation s'engage pour l'accessibilité numérique. Découvrez nos fonctionnalités d'accessibilité, notre conformité RGAA et WCAG, et notre démarche d'amélioration continue.",
  keywords: [
    "accessibilité numérique",
    "RGAA",
    "WCAG",
    "site accessible",
    "handicap numérique",
    "accessibilité web",
    "formation accessible",
  ],
  openGraph: {
    title: "Accessibilité Numérique | C&Co Formation",
    description:
      "Notre engagement pour un site web accessible à tous. Conformité RGAA et WCAG.",
  },
};

const fonctionnalites = [
  {
    icon: Type,
    title: "Taille du texte",
    description: "Agrandissez ou réduisez la taille des textes selon vos besoins.",
  },
  {
    icon: Contrast,
    title: "Contraste élevé",
    description: "Activez un mode à contraste renforcé pour une meilleure lisibilité.",
  },
  {
    icon: Eye,
    title: "Mode dyslexie",
    description: "Une police adaptée pour faciliter la lecture.",
  },
  {
    icon: MousePointer,
    title: "Curseur agrandi",
    description: "Augmentez la taille du curseur pour une meilleure visibilité.",
  },
  {
    icon: Keyboard,
    title: "Navigation clavier",
    description: "Naviguez sur le site uniquement avec votre clavier.",
  },
  {
    icon: Volume2,
    title: "Lecteur d'écran",
    description: "Compatible avec les technologies d'assistance (JAWS, NVDA, VoiceOver).",
  },
  {
    icon: ZoomIn,
    title: "Zoom",
    description: "Zoomez jusqu'à 200% sans perte de fonctionnalité.",
  },
  {
    icon: Settings,
    title: "Personnalisation",
    description: "Sauvegardez vos préférences pour vos prochaines visites.",
  },
];

const engagements = [
  {
    title: "Design inclusif",
    description:
      "Nos interfaces sont conçues dès le départ pour être accessibles à tous.",
  },
  {
    title: "Tests réguliers",
    description:
      "Nous auditons régulièrement notre site avec des outils automatisés et des tests manuels.",
  },
  {
    title: "Formation continue",
    description:
      "Nos équipes sont formées aux bonnes pratiques d'accessibilité numérique.",
  },
  {
    title: "Amélioration continue",
    description:
      "Nous corrigeons rapidement les problèmes d'accessibilité identifiés.",
  },
];

const normes = [
  {
    title: "RGAA 4.1",
    description:
      "Référentiel Général d'Amélioration de l'Accessibilité, version française du standard.",
    compliance: "En cours d'audit",
  },
  {
    title: "WCAG 2.1",
    description:
      "Web Content Accessibility Guidelines, normes internationales niveau AA.",
    compliance: "Objectif visé",
  },
  {
    title: "Loi du 11 février 2005",
    description:
      "Pour l'égalité des droits et des chances des personnes handicapées.",
    compliance: "Conforme",
  },
];

const faqItems = [
  {
    question: "Comment activer les options d'accessibilité ?",
    answer:
      "Cliquez sur le bouton d'accessibilité (icône en forme de personnage) situé en bas à droite de l'écran. Un panneau s'ouvrira avec toutes les options disponibles : taille de texte, contraste, espacement, etc.",
  },
  {
    question: "Le site est-il compatible avec les lecteurs d'écran ?",
    answer:
      "Oui, notre site est développé en suivant les standards ARIA et testé avec les principaux lecteurs d'écran : JAWS, NVDA sur Windows et VoiceOver sur Mac/iOS.",
  },
  {
    question: "Puis-je naviguer uniquement au clavier ?",
    answer:
      "Absolument. Toutes les fonctionnalités sont accessibles au clavier. Utilisez Tab pour naviguer, Entrée pour activer, et Échap pour fermer les modales.",
  },
  {
    question: "Que faire si je rencontre un problème d'accessibilité ?",
    answer:
      "Contactez-nous via le formulaire de contact en précisant la page concernée et la difficulté rencontrée. Nous nous engageons à répondre sous 48h et à corriger le problème rapidement.",
  },
  {
    question: "Mes préférences sont-elles sauvegardées ?",
    answer:
      "Oui, vos préférences d'accessibilité sont automatiquement sauvegardées dans votre navigateur. Elles seront appliquées lors de vos prochaines visites.",
  },
];

export default function AccessibilitePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container-custom relative z-10 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Accessibility className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Accessibilité Numérique
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6 max-w-4xl mx-auto">
            Un site{" "}
            <span className="text-primary font-medium">accessible</span> à tous
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            C&Co Formation s'engage à rendre son site web accessible à toutes
            les personnes, quelles que soient leurs capacités ou leurs
            technologies d'assistance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="#fonctionnalites"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Découvrir les fonctionnalités
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Signaler un problème
            </Link>
          </div>
        </div>
      </section>

      {/* Fonctionnalités Section */}
      <section
        id="fonctionnalites"
        className="section-padding border-t border-border/50"
      >
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Fonctionnalités
            </p>
            <h2 className="heading-section">
              Des outils pour personnaliser votre expérience
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {fonctionnalites.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group p-6 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Engagements Section */}
      <section className="section-padding border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                Notre engagement
              </p>
              <h2 className="heading-section">
                L'accessibilité au coeur de notre démarche
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {engagements.map((engagement, index) => (
                <div
                  key={engagement.title}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">{engagement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {engagement.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Normes Section */}
      <section className="section-padding border-t border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Conformité
            </p>
            <h2 className="heading-section">
              Les normes que nous respectons
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {normes.map((norme) => (
              <div
                key={norme.title}
                className="bg-card rounded-2xl border border-border/50 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium">{norme.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {norme.description}
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {norme.compliance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Widget Info Section */}
      <section className="section-padding border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                  Widget d'accessibilité
                </p>
                <h2 className="heading-section mb-6">
                  Personnalisez votre navigation
                </h2>
                <p className="text-muted-foreground mb-6">
                  Notre widget d'accessibilité vous permet d'adapter le site à
                  vos besoins en quelques clics. Accessible depuis toutes les
                  pages, il offre de nombreuses options de personnalisation.
                </p>
                <ul className="space-y-3">
                  {[
                    "Ajustement de la taille des textes",
                    "Mode contraste élevé",
                    "Police adaptée à la dyslexie",
                    "Espacement des lignes et lettres",
                    "Masquage des images",
                    "Mode lecture focalisée",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-card rounded-2xl border border-border/50 p-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Accessibility className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    Activez le widget
                  </h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    Cliquez sur l'icône d'accessibilité en bas à droite de
                    l'écran pour ouvrir le panneau de configuration.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-sm text-primary">
                    <Settings className="w-4 h-4" />
                    Vos préférences sont automatiquement sauvegardées
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                Questions fréquentes
              </p>
              <h2 className="heading-section">Vos questions, nos réponses</h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <details
                  key={index}
                  className="group bg-card rounded-xl border border-border/50 overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                    <span className="font-medium pr-4">{item.question}</span>
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-muted-foreground">{item.answer}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Un problème ?
            </p>
            <h2 className="heading-section mb-6">
              Aidez-nous à nous améliorer
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Si vous rencontrez des difficultés d'accessibilité sur notre site,
              n'hésitez pas à nous le signaler. Nous nous engageons à corriger
              tout problème dans les meilleurs délais.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Signaler un problème
              </Link>
              <Link
                href="/handicap"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                Handicap & Inclusion
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
