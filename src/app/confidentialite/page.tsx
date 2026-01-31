import { Metadata } from "next";
import Link from "next/link";
import {
  Shield,
  User,
  Database,
  Target,
  Scale,
  Clock,
  Lock,
  Cookie,
  Mail,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Politique de Confidentialité | C&Co Formation",
  description:
    "Politique de confidentialité RGPD de C&Co Formation. Découvrez comment nous collectons, utilisons et protégeons vos données personnelles.",
};

const sections = [
  {
    icon: Shield,
    title: "1. Introduction",
    content:
      "C&Co Formation s'engage à protéger la vie privée des utilisateurs de son site web et de ses services. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).",
  },
  {
    icon: User,
    title: "2. Responsable du traitement",
    content: (
      <>
        Le responsable du traitement des données est :<br />
        <strong className="text-foreground">C&Co Formation</strong>
        <br />
        340 chemin du plan marseillais, 13320 Bouc-bel-air
        <br />
        Email :{" "}
        <a
          href="mailto:contact@candco.fr"
          className="text-primary hover:underline"
        >
          contact@candco.fr
        </a>
      </>
    ),
  },
  {
    icon: Database,
    title: "3. Données collectées",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li>Données d'identification (nom, prénom, email, téléphone)</li>
        <li>Données professionnelles (entreprise, fonction)</li>
        <li>Données de navigation (cookies, adresse IP)</li>
        <li>
          Données relatives aux formations (inscriptions, progression,
          certifications)
        </li>
      </ul>
    ),
  },
  {
    icon: Target,
    title: "4. Finalités du traitement",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li>La gestion de votre inscription aux formations</li>
        <li>
          L'envoi d'informations sur nos formations (avec votre consentement)
        </li>
        <li>L'amélioration de nos services</li>
        <li>Le respect de nos obligations légales</li>
      </ul>
    ),
  },
  {
    icon: Scale,
    title: "5. Base légale",
    content: (
      <ul className="list-disc pl-6 space-y-2">
        <li>L'exécution d'un contrat (inscription à une formation)</li>
        <li>Votre consentement (newsletter, cookies)</li>
        <li>Notre intérêt légitime (amélioration des services)</li>
        <li>Une obligation légale (conservation des documents)</li>
      </ul>
    ),
  },
  {
    icon: Clock,
    title: "6. Durée de conservation",
    content:
      "Vos données sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées, et dans le respect des durées légales de conservation.",
  },
  {
    icon: Lock,
    title: "7. Vos droits",
    content: (
      <>
        <p className="mb-4">
          Conformément au RGPD, vous disposez des droits suivants :
        </p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Droit d'accès à vos données</li>
          <li>Droit de rectification</li>
          <li>Droit à l'effacement</li>
          <li>Droit à la limitation du traitement</li>
          <li>Droit à la portabilité</li>
          <li>Droit d'opposition</li>
        </ul>
        <p>
          Pour exercer ces droits, contactez-nous à :{" "}
          <a
            href="mailto:contact@candco.fr"
            className="text-primary hover:underline"
          >
            contact@candco.fr
          </a>
        </p>
      </>
    ),
  },
  {
    icon: Cookie,
    title: "8. Cookies",
    content: (
      <>
        Notre site utilise des cookies pour améliorer votre expérience. Vous
        pouvez gérer vos préférences via notre bandeau de consentement aux
        cookies. Pour plus d'informations, consultez notre{" "}
        <Link href="/cookies" className="text-primary hover:underline">
          Politique de cookies
        </Link>
        .
      </>
    ),
  },
  {
    icon: Mail,
    title: "9. Contact",
    content: (
      <>
        Pour toute question concernant cette politique de confidentialité :
        <br />
        Email :{" "}
        <a
          href="mailto:contact@candco.fr"
          className="text-primary hover:underline"
        >
          contact@candco.fr
        </a>
        <br />
        Courrier : C&Co Formation, 340 chemin du plan marseillais, 13320
        Bouc-bel-air
      </>
    ),
  },
];

export default function ConfidentialitePage() {
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
              <li className="text-foreground">Confidentialité</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <p className="text-sm text-muted-foreground mb-4 tracking-widest uppercase">
              Protection des données
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-6">
              Politique de{" "}
              <span className="text-primary">confidentialité</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Découvrez comment nous protégeons vos données personnelles
              conformément au RGPD.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Dernière mise à jour : Janvier 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
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
        </div>
      </section>
    </>
  );
}
