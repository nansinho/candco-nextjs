import { Metadata } from "next";
import Link from "next/link";
import {
  Cookie,
  Settings,
  BarChart,
  Target,
  Shield,
  Clock,
  HelpCircle,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Cookies | C&Co Formation",
  description:
    "Politique de cookies de C&Co Formation. Découvrez quels cookies nous utilisons et comment les gérer.",
};

const cookieTypes = [
  {
    icon: Shield,
    title: "Cookies essentiels",
    description:
      "Ces cookies sont nécessaires au fonctionnement du site et ne peuvent pas être désactivés. Ils permettent notamment de mémoriser vos préférences de connexion et d'assurer la sécurité du site.",
    examples: ["Session utilisateur", "Authentification", "Sécurité"],
    required: true,
  },
  {
    icon: Settings,
    title: "Cookies fonctionnels",
    description:
      "Ces cookies permettent d'améliorer les fonctionnalités du site et de personnaliser votre expérience, comme la mémorisation de vos préférences de langue ou de région.",
    examples: ["Préférences de langue", "Personnalisation", "Accessibilité"],
    required: false,
  },
  {
    icon: BarChart,
    title: "Cookies analytiques",
    description:
      "Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site en collectant des informations de manière anonyme. Cela nous permet d'améliorer continuellement notre contenu.",
    examples: [
      "Google Analytics",
      "Statistiques de pages",
      "Analyse de navigation",
    ],
    required: false,
  },
  {
    icon: Target,
    title: "Cookies marketing",
    description:
      "Ces cookies sont utilisés pour vous proposer des publicités pertinentes. Ils peuvent être placés par nos partenaires publicitaires à travers notre site.",
    examples: [
      "Publicités ciblées",
      "Réseaux sociaux",
      "Suivi des conversions",
    ],
    required: false,
  },
];

const sections = [
  {
    icon: Cookie,
    title: "1. Qu'est-ce qu'un cookie ?",
    content:
      "Un cookie est un petit fichier texte déposé sur votre navigateur lors de la visite d'un site web. Il permet au site de mémoriser des informations sur votre visite, comme votre langue préférée et d'autres paramètres, afin de faciliter votre prochaine visite et de rendre le site plus utile pour vous.",
  },
  {
    icon: Settings,
    title: "2. Comment gérer les cookies ?",
    content: (
      <>
        <p className="mb-4">
          Vous pouvez gérer vos préférences en matière de cookies à tout moment
          :
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>
            <strong>Via notre bandeau de consentement :</strong> Cliquez sur
            « Paramètres des cookies » pour modifier vos préférences
          </li>
          <li>
            <strong>Via les paramètres de votre navigateur :</strong> Consultez
            l'aide de votre navigateur pour savoir comment modifier vos
            paramètres de cookies
          </li>
        </ul>
        <p className="text-sm text-muted-foreground">
          Note : La désactivation de certains cookies peut affecter votre
          expérience de navigation sur notre site.
        </p>
      </>
    ),
  },
  {
    icon: Clock,
    title: "3. Durée de conservation",
    content: (
      <>
        <p className="mb-4">
          La durée de conservation des cookies varie selon leur type :
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Cookies de session :</strong> Supprimés à la fermeture du
            navigateur
          </li>
          <li>
            <strong>Cookies persistants :</strong> Conservés jusqu'à 13 mois
            maximum conformément aux recommandations de la CNIL
          </li>
          <li>
            <strong>Consentement :</strong> Votre choix est conservé pendant 6
            mois
          </li>
        </ul>
      </>
    ),
  },
  {
    icon: HelpCircle,
    title: "4. En savoir plus",
    content: (
      <>
        <p className="mb-4">
          Pour plus d'informations sur les cookies et vos droits, vous pouvez
          consulter :
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <a
              href="https://www.cnil.fr/fr/cookies-et-autres-traceurs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Le site de la CNIL
            </a>
          </li>
          <li>
            Notre{" "}
            <Link
              href="/confidentialite"
              className="text-primary hover:underline"
            >
              Politique de confidentialité
            </Link>
          </li>
        </ul>
      </>
    ),
  },
];

export default function CookiesPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="section-padding border-b border-border/50">
        <div className="container-custom">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-muted-foreground">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Accueil
                </Link>
              </li>
              <li>/</li>
              <li className="text-foreground">Cookies</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <p className="text-sm text-muted-foreground mb-4 tracking-widest uppercase">
              Gestion des cookies
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-6">
              Politique de <span className="text-primary">cookies</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Découvrez quels cookies nous utilisons et comment les gérer selon
              vos préférences.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Dernière mise à jour : Janvier 2026
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Types */}
      <section className="section-padding border-b border-border/50">
        <div className="container-custom">
          <div className="max-w-2xl mb-12">
            <h2 className="text-2xl font-semibold mb-4">Types de cookies</h2>
            <p className="text-muted-foreground">
              Notre site utilise différents types de cookies pour vous offrir la
              meilleure expérience possible.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {cookieTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.title}
                  className="bg-card border border-border/50 rounded-2xl p-6 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{type.title}</h3>
                        {type.required && (
                          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                            Requis
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {type.description}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {type.examples.map((example) => (
                          <span
                            key={example}
                            className="text-xs px-2 py-1 bg-secondary rounded-full"
                          >
                            {example}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* More Info Sections */}
      <section className="section-padding">
        <div className="container-custom max-w-4xl">
          <div className="space-y-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold mb-4 text-foreground">
                        {section.title}
                      </h2>
                      <div className="text-muted-foreground leading-relaxed">
                        {section.content}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Contact */}
          <div className="mt-12 p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center">
            <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Une question ?</h3>
            <p className="text-muted-foreground mb-4">
              Pour toute question concernant notre utilisation des cookies,
              contactez-nous.
            </p>
            <a
              href="mailto:contact@candco.fr"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              contact@candco.fr
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
