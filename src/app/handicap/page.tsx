import { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  Users,
  FileText,
  MessageSquare,
  CheckCircle,
  Phone,
  Mail,
  ChevronDown,
  Eye,
  Ear,
  Brain,
  Accessibility,
  Hand,
  HeartPulse,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Handicap & Inclusion | Accompagnement Personnalisé",
  description:
    "C&Co Formation accompagne les personnes en situation de handicap dans leur parcours de formation. Référent handicap dédié, aménagements personnalisés et accessibilité garantie.",
  keywords: [
    "handicap formation",
    "accessibilité formation",
    "référent handicap",
    "formation inclusive",
    "aménagement handicap",
    "RQTH formation",
    "formation professionnelle handicap",
  ],
  openGraph: {
    title: "Handicap & Inclusion | C&Co Formation",
    description:
      "Accompagnement personnalisé des personnes en situation de handicap. Référent dédié et aménagements adaptés.",
  },
};

const etapes = [
  {
    number: "1",
    title: "Premier contact",
    description:
      "Échangez avec notre équipe pour nous faire part de votre situation et de vos besoins.",
    icon: MessageSquare,
  },
  {
    number: "2",
    title: "Analyse des besoins",
    description:
      "Notre référent handicap évalue avec vous les aménagements nécessaires.",
    icon: FileText,
  },
  {
    number: "3",
    title: "Mise en place",
    description:
      "Nous adaptons la formation à vos besoins : rythme, supports, environnement.",
    icon: CheckCircle,
  },
];

const engagements = [
  {
    title: "Écoute & Confidentialité",
    description:
      "Vos informations sont traitées avec la plus stricte confidentialité.",
    icon: Heart,
  },
  {
    title: "Accompagnement personnalisé",
    description:
      "Un suivi individualisé tout au long de votre parcours de formation.",
    icon: Users,
  },
  {
    title: "Aménagements adaptés",
    description:
      "Supports pédagogiques, durée, rythme... tout est adaptable.",
    icon: Accessibility,
  },
  {
    title: "Réseau de partenaires",
    description:
      "Collaboration avec les structures spécialisées (AGEFIPH, Cap Emploi...).",
    icon: Award,
  },
];

const typesHandicap = [
  {
    name: "Handicap visuel",
    description: "Cécité, malvoyance, daltonisme",
    icon: Eye,
  },
  {
    name: "Handicap auditif",
    description: "Surdité, malentendance, acouphènes",
    icon: Ear,
  },
  {
    name: "Handicap moteur",
    description: "Mobilité réduite, troubles musculaires",
    icon: Hand,
  },
  {
    name: "Handicap psychique",
    description: "Troubles anxieux, dépression, bipolarité",
    icon: Brain,
  },
  {
    name: "Handicap cognitif",
    description: "Troubles DYS, TDAH, troubles de la mémoire",
    icon: Brain,
  },
  {
    name: "Maladies invalidantes",
    description: "Diabète, cancer, maladies auto-immunes",
    icon: HeartPulse,
  },
];

const faqItems = [
  {
    question: "Dois-je informer le centre de mon handicap ?",
    answer:
      "La déclaration de votre situation de handicap est facultative mais fortement recommandée. Elle nous permet de mettre en place les aménagements nécessaires pour optimiser votre parcours de formation et garantir votre réussite.",
  },
  {
    question: "Quels types d'aménagements sont possibles ?",
    answer:
      "Nous proposons de nombreux aménagements : tiers-temps pour les évaluations, supports adaptés (grands caractères, contraste renforcé), pauses supplémentaires, salle accessible PMR, interprète LSF, logiciels spécialisés, etc.",
  },
  {
    question: "Ma formation peut-elle être financée ?",
    answer:
      "Oui, plusieurs dispositifs de financement existent pour les personnes en situation de handicap : AGEFIPH, FIPHFP, CPF, Pôle Emploi... Notre équipe vous accompagne dans vos démarches de financement.",
  },
  {
    question: "Qui est le référent handicap ?",
    answer:
      "Le référent handicap est votre interlocuteur privilégié au sein de C&Co Formation. Il assure le lien entre vous, les formateurs et les partenaires spécialisés pour garantir la bonne mise en place des aménagements.",
  },
  {
    question: "Les locaux sont-ils accessibles ?",
    answer:
      "Nos locaux sont accessibles aux personnes à mobilité réduite (PMR). Si vous avez des besoins spécifiques, contactez-nous en amont pour vérifier l'accessibilité du lieu de formation.",
  },
];

export default function HandicapPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background">
        <div className="container-custom relative z-10 text-center py-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
            <Heart className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Handicap & Inclusion
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6 max-w-4xl mx-auto">
            Votre handicap ne doit pas être un{" "}
            <span className="text-primary font-medium">obstacle</span> à votre
            formation
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            C&Co Formation s'engage à rendre ses formations accessibles à tous.
            Notre référent handicap vous accompagne pour adapter votre parcours
            à vos besoins.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Contacter le référent handicap
            </Link>
            <Link
              href="#demarche"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Découvrir notre démarche
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section id="demarche" className="section-padding border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Notre démarche
            </p>
            <h2 className="heading-section">
              Un accompagnement en 3 étapes simples
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {etapes.map((etape, index) => {
              const Icon = etape.icon;
              return (
                <div
                  key={etape.number}
                  className="relative group"
                >
                  {/* Connector line */}
                  {index < etapes.length - 1 && (
                    <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
                  )}

                  <div className="relative bg-card rounded-2xl border border-border/50 p-8 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {etape.number}
                        </span>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                        <Icon className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </div>
                    <h3 className="text-lg font-medium mb-3">{etape.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      {etape.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Engagements Section */}
      <section className="section-padding border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Nos engagements
            </p>
            <h2 className="heading-section">
              Ce que nous mettons en place pour vous
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {engagements.map((engagement) => {
              const Icon = engagement.icon;
              return (
                <div
                  key={engagement.title}
                  className="group p-6 rounded-2xl border border-border/50 hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-medium mb-2">{engagement.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {engagement.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Référent Handicap Section */}
      <section className="section-padding border-t border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                  Votre interlocuteur dédié
                </p>
                <h2 className="heading-section mb-6">
                  Le référent handicap, votre allié
                </h2>
                <p className="text-muted-foreground mb-6">
                  Notre référent handicap est formé pour vous accompagner dans
                  toutes les étapes de votre parcours. Il est votre
                  interlocuteur privilégié pour :
                </p>
                <ul className="space-y-3">
                  {[
                    "Analyser vos besoins spécifiques",
                    "Proposer des aménagements adaptés",
                    "Coordonner avec les formateurs",
                    "Assurer le suivi de votre formation",
                    "Vous orienter vers les partenaires spécialisés",
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
                    <Users className="w-10 h-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">
                    Référent Handicap
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    À votre écoute pour adapter votre formation
                  </p>
                  <div className="space-y-3">
                    <a
                      href="tel:+33762596653"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      07 62 59 66 53
                    </a>
                    <a
                      href="mailto:handicap@candco.fr"
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      handicap@candco.fr
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types de handicap Section */}
      <section className="section-padding border-t border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Tous les handicaps
            </p>
            <h2 className="heading-section">
              Nous accompagnons toutes les situations
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {typesHandicap.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.name}
                  className="flex items-start gap-4 p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">{type.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {type.description}
                    </p>
                  </div>
                </div>
              );
            })}
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
              Besoin d'aide ?
            </p>
            <h2 className="heading-section mb-6">
              N'hésitez pas à nous contacter
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Notre référent handicap est à votre disposition pour répondre à
              toutes vos questions et vous accompagner dans votre projet de
              formation.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Phone className="w-4 h-4" />
                Nous contacter
              </Link>
              <Link
                href="/formations"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-border text-foreground rounded-lg font-medium hover:bg-secondary transition-colors"
              >
                Voir nos formations
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
