import { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle,
  Phone,
  Mail,
  MessageSquare,
  Settings,
  Clock,
  Users,
  Building,
  FileText,
  Laptop,
  Heart,
  HelpCircle,
  ExternalLink,
  HeartHandshake,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Personnes en situation de handicap | C&Co Formation",
  description:
    "C&Co Formation accompagne les personnes en situation de handicap. Référent handicap dédié, adaptations personnalisées, accessibilité des locaux et des formations.",
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

// Custom accessibility icon
function AccessibilityIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Icône accessibilité handicap"
    >
      <circle cx="12" cy="4" r="2.5" />
      <line x1="12" y1="6.5" x2="12" y2="14" />
      <line x1="5" y1="9" x2="19" y2="9" />
      <line x1="12" y1="14" x2="7" y2="22" />
      <line x1="12" y1="14" x2="17" y2="22" />
    </svg>
  );
}

const etapes = [
  {
    numero: "01",
    icon: MessageSquare,
    title: "Prise de contact et analyse",
    description:
      "Nous échangeons sur vos besoins, vos contraintes et vos objectifs. Le référent handicap analyse votre situation pour proposer des adaptations appropriées.",
  },
  {
    numero: "02",
    icon: Settings,
    title: "Mise en place des adaptations",
    description:
      "En fonction de vos besoins, nous adaptons les supports pédagogiques, les modalités d'évaluation, le rythme de formation et l'environnement physique.",
  },
  {
    numero: "03",
    icon: Clock,
    title: "Suivi personnalisé",
    description:
      "Tout au long de votre formation, nous assurons un suivi régulier pour ajuster les adaptations si nécessaire et garantir votre réussite.",
  },
];

const engagements = [
  {
    icon: Building,
    title: "Accessibilité des locaux",
    description:
      "Nos locaux sont accessibles aux personnes à mobilité réduite : rampes d'accès, ascenseurs, places de parking adaptées, sanitaires accessibles.",
  },
  {
    icon: FileText,
    title: "Supports adaptés",
    description:
      "Documents en grands caractères, formats numériques accessibles, sous-titrage des vidéos, interprétation LSF sur demande.",
  },
  {
    icon: Clock,
    title: "Rythme personnalisé",
    description:
      "Aménagement du temps de formation, pauses régulières, durée des évaluations adaptée selon vos besoins.",
  },
  {
    icon: Users,
    title: "Accompagnement individualisé",
    description:
      "Un référent handicap dédié vous accompagne avant, pendant et après votre formation pour assurer votre réussite.",
  },
  {
    icon: Laptop,
    title: "Technologies d'assistance",
    description:
      "Logiciels de lecture d'écran, synthèse vocale, claviers adaptés, loupes électroniques disponibles sur demande.",
  },
  {
    icon: Heart,
    title: "Communication inclusive",
    description:
      "Une équipe formée et sensibilisée au handicap, à votre écoute pour comprendre et répondre à vos besoins.",
  },
];

const typesHandicap = [
  {
    title: "Handicap moteur",
    adaptations: [
      "Locaux accessibles PMR",
      "Mobilier adapté",
      "Temps supplémentaire",
      "Pauses régulières",
    ],
  },
  {
    title: "Handicap visuel",
    adaptations: [
      "Documents en grands caractères",
      "Synthèse vocale",
      "Loupes électroniques",
      "Format audio",
    ],
  },
  {
    title: "Handicap auditif",
    adaptations: [
      "Sous-titrage",
      "Interprétation LSF",
      "Supports visuels",
      "Communication écrite",
    ],
  },
  {
    title: "Handicap cognitif",
    adaptations: [
      "Documents simplifiés",
      "Consignes claires",
      "Rythme adapté",
      "Accompagnement renforcé",
    ],
  },
  {
    title: "Troubles psychiques",
    adaptations: [
      "Environnement calme",
      "Pauses aménagées",
      "Soutien personnalisé",
      "Flexibilité horaire",
    ],
  },
  {
    title: "Maladies invalidantes",
    adaptations: [
      "Aménagement du temps",
      "Possibilité de pauses",
      "Suivi médical facilité",
      "Formation à distance",
    ],
  },
];

const reconnaissances = [
  {
    sigle: "RQTH",
    nom: "Reconnaissance de la Qualité de Travailleur Handicapé",
    description:
      "Délivrée par la MDPH, elle permet d'accéder à des mesures d'accompagnement et d'aides à l'emploi.",
  },
  {
    sigle: "AAH",
    nom: "Allocation aux Adultes Handicapés",
    description:
      "Aide financière pour les personnes handicapées ayant un taux d'incapacité d'au moins 80%.",
  },
  {
    sigle: "IPP",
    nom: "Invalidité Professionnelle Permanente",
    description:
      "Reconnaissance d'une incapacité permanente suite à un accident du travail ou une maladie professionnelle.",
  },
  {
    sigle: "Pension",
    nom: "Pension d'invalidité",
    description:
      "Versée par la Sécurité sociale aux personnes dont la capacité de travail est réduite d'au moins 2/3.",
  },
];

const organismes = [
  {
    nom: "AGEFIPH",
    description:
      "Fonds pour l'insertion professionnelle des personnes handicapées dans le secteur privé.",
    lien: "https://www.agefiph.fr",
  },
  {
    nom: "FIPHFP",
    description:
      "Fonds pour l'insertion des personnes handicapées dans la fonction publique.",
    lien: "https://www.fiphfp.fr",
  },
  {
    nom: "Cap Emploi",
    description:
      "Accompagnement vers l'emploi des personnes en situation de handicap.",
    lien: "https://www.capemploi.info",
  },
  {
    nom: "MDPH",
    description:
      "Maison Départementale des Personnes Handicapées : guichet unique pour toutes vos démarches.",
    lien: "https://www.monparcourshandicap.gouv.fr",
  },
  {
    nom: "France Travail",
    description:
      "Accompagnement spécifique pour les demandeurs d'emploi en situation de handicap.",
    lien: "https://www.francetravail.fr",
  },
];

const faqItems = [
  {
    question: "Comment puis-je signaler mon handicap avant une formation ?",
    answer:
      "Vous pouvez contacter notre référent handicap dès votre inscription. Toutes les informations sont confidentielles. Nous échangerons ensemble pour identifier les adaptations nécessaires à votre parcours de formation.",
  },
  {
    question: "Les formations sont-elles éligibles aux aides AGEFIPH ou FIPHFP ?",
    answer:
      "Oui, nos formations sont éligibles aux financements AGEFIPH (secteur privé) et FIPHFP (fonction publique). Notre équipe peut vous accompagner dans vos démarches de demande de financement.",
  },
  {
    question: "Proposez-vous des formations à distance ?",
    answer:
      "Oui, certaines de nos formations sont disponibles en format distanciel ou hybride. Cette modalité peut être particulièrement adaptée selon votre situation et vos contraintes.",
  },
  {
    question: "Quels types d'adaptations pouvez-vous mettre en place ?",
    answer:
      "Nous pouvons adapter les supports (grands caractères, format audio), le temps de formation, les modalités d'évaluation, l'environnement physique, et proposer des technologies d'assistance. Chaque adaptation est personnalisée.",
  },
  {
    question: "La RQTH est-elle obligatoire pour bénéficier d'adaptations ?",
    answer:
      "Non, la RQTH n'est pas obligatoire. Nous accueillons toute personne ayant besoin d'adaptations, avec ou sans reconnaissance administrative de son handicap. La RQTH est cependant nécessaire pour accéder à certains financements spécifiques.",
  },
];

export default function HandicapPage() {
  return (
    <>
      {/* Hero */}
      <PageHero
        badge="Handicap & Inclusion"
        badgeIcon="accessibility"
        title="Un accompagnement sur mesure."
        highlightedWord="sur mesure"
        description="Notre référent handicap adapte votre parcours à vos besoins pour garantir votre réussite. Locaux accessibles PMR et aménagements personnalisés."
        backgroundImage="/handicap-hero.jpg"
        minHeight="medium"
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Handicap & Inclusion" },
        ]}
        ctas={[
          { label: "Contacter le référent", href: "#contact-referent", variant: "primary" },
        ]}
      />

      {/* Accompagnement en 3 étapes */}
      <section className="section-padding border-b border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Notre démarche
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-4">
              Un accompagnement en 3 étapes.
            </h2>
            <p className="text-muted-foreground">
              De votre premier contact jusqu'à la fin de votre formation, nous
              vous accompagnons à chaque étape pour garantir une expérience
              adaptée à vos besoins.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {etapes.map((etape) => {
              const Icon = etape.icon;
              return (
                <div
                  key={etape.numero}
                  className="group relative p-6 rounded-2xl border border-transparent hover:border-border/50 hover:bg-card/50 transition-all duration-500"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl font-light text-primary/30">
                      {etape.numero}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                  </div>

                  <h3 className="font-medium mb-3 group-hover:text-primary transition-colors duration-300">
                    {etape.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {etape.description}
                  </p>

                  <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Nos engagements */}
      <section className="section-padding border-b border-border/50 bg-muted/30">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Nos engagements
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-4">
              Des adaptations concrètes pour votre réussite.
            </h2>
            <p className="text-muted-foreground">
              Nous nous engageons à mettre en place toutes les adaptations
              nécessaires pour vous permettre de suivre votre formation dans les
              meilleures conditions.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {engagements.map((engagement) => {
              const Icon = engagement.icon;
              return (
                <div
                  key={engagement.title}
                  className="group relative p-6 rounded-2xl border border-transparent hover:border-border/50 hover:bg-card/50 transition-all duration-500 h-full"
                >
                  <div className="relative mb-5">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
                      <Icon className="w-5 h-5 text-primary transition-transform duration-500 group-hover:scale-110" />
                    </div>
                    <div className="absolute inset-0 w-12 h-12 rounded-xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-50 transition-opacity duration-500" />
                  </div>

                  <h3 className="font-medium mb-3 group-hover:text-primary transition-colors duration-300">
                    {engagement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {engagement.description}
                  </p>

                  <div className="absolute top-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-primary/30 rounded-tr-lg" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Référent Handicap */}
      <section className="section-padding border-b border-border/50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
                Votre interlocuteur
              </p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-6">
                Le référent handicap : à votre écoute.
              </h2>

              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  Notre référent handicap est votre interlocuteur privilégié. Il
                  vous accompagne tout au long de votre parcours pour identifier
                  vos besoins, mettre en place les adaptations nécessaires et
                  assurer le suivi de votre formation.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  <strong className="text-foreground">Sa mission :</strong> vous
                  garantir les meilleures conditions d'apprentissage et vous
                  aider à réussir votre formation, quelles que soient les
                  contraintes liées à votre situation.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <a
                  href="tel:+33762596653"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  07 62 59 66 53
                </a>
                <a
                  href="mailto:handicap@candco.fr"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  handicap@candco.fr
                </a>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="w-full max-w-md p-8 rounded-2xl border border-border/50 bg-card/50 mx-auto">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <HeartHandshake className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Référent Handicap</h3>
                    <p className="text-sm text-muted-foreground">
                      C&Co Formation
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Écoute et confidentialité</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Analyse personnalisée</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Suivi tout au long de la formation</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span>Lien avec les organismes partenaires</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types de handicap */}
      <section className="section-padding border-b border-border/50 bg-muted/30">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Adaptations possibles
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-4">
              Comprendre le handicap en formation.
            </h2>
            <p className="text-muted-foreground">
              Nous adaptons nos formations à tous les types de handicap. Voici
              quelques exemples d'adaptations que nous pouvons mettre en place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {typesHandicap.map((type) => (
              <div
                key={type.title}
                className="p-6 rounded-2xl border border-border/50 bg-background/50 hover:border-primary/30 transition-all duration-300"
              >
                <h3 className="font-medium mb-4">{type.title}</h3>
                <ul className="space-y-2">
                  {type.adaptations.map((adaptation) => (
                    <li
                      key={adaptation}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle className="w-3 h-3 text-primary shrink-0" />
                      {adaptation}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reconnaissances */}
      <section className="section-padding border-b border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Bon à savoir
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-4">
              Types de reconnaissance du handicap.
            </h2>
            <p className="text-muted-foreground">
              Plusieurs types de reconnaissance administrative peuvent ouvrir
              des droits à des aides et des financements pour votre formation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {reconnaissances.map((rec) => (
              <div
                key={rec.sigle}
                className="flex items-start gap-4 p-6 rounded-2xl border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className="px-3 py-1 rounded-lg bg-primary/10 text-primary font-semibold text-sm shrink-0">
                  {rec.sigle}
                </div>
                <div>
                  <h3 className="font-medium mb-2">{rec.nom}</h3>
                  <p className="text-sm text-muted-foreground">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Organismes */}
      <section className="section-padding border-b border-border/50 bg-muted/30">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Ressources utiles
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-4">
              Organismes et contacts utiles.
            </h2>
            <p className="text-muted-foreground">
              Ces organismes peuvent vous accompagner dans vos démarches et vous
              aider à financer votre formation.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {organismes.map((org) => (
              <a
                key={org.nom}
                href={org.lien}
                target="_blank"
                rel="noopener noreferrer"
                className="group p-6 rounded-2xl border border-border/50 bg-background/50 hover:border-primary/30 hover:bg-card/50 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-primary">{org.nom}</h3>
                  <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {org.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding border-b border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-16">
            <p className="text-sm text-muted-foreground tracking-widest uppercase mb-4">
              Questions fréquentes
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-light leading-tight mb-4">
              Vos questions, nos réponses.
            </h2>
          </div>

          <div className="max-w-3xl">
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="group border border-border/50 rounded-2xl px-6 hover:border-primary/30 hover:bg-card/50 transition-all duration-300 data-[state=open]:border-primary/30 data-[state=open]:bg-card/50"
                >
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 group-data-[state=open]:bg-primary/20 transition-all duration-300">
                        <HelpCircle className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium group-hover:text-primary group-data-[state=open]:text-primary transition-colors">
                        {item.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 pl-14 text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="relative mb-8">
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                <HeartHandshake className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">
              Besoin d'un accompagnement ?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              Notre référent handicap est à votre écoute pour étudier ensemble
              votre projet de formation et identifier les adaptations dont vous
              pourriez avoir besoin.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Contacter le référent
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/accessibilite"
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
              >
                Voir l'accessibilité numérique
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 justify-center mt-8 pt-8 border-t border-border/50">
              <Link
                href="/a-propos"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Découvrir C&Co Formation →
              </Link>
              <Link
                href="/formations"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Voir nos formations →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
