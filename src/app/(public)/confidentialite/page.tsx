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
        <strong style={{ color: "#fff" }}>C&Co Formation</strong>
        <br />
        340 chemin du plan marseillais, 13320 Bouc-bel-air
        <br />
        Email :{" "}
        <a
          href="mailto:contact@candco.fr"
          style={{ color: "#F8A991" }}
          className="hover:underline"
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
            style={{ color: "#F8A991" }}
            className="hover:underline"
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
        <Link
          href="/cookies"
          style={{ color: "#F8A991" }}
          className="hover:underline"
        >
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
          style={{ color: "#F8A991" }}
          className="hover:underline"
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
    <div style={{ backgroundColor: "#0f1923" }}>
      {/* Hero Section */}
      <section
        className="relative z-10"
        style={{ background: "linear-gradient(180deg, #1a6faa 0%, #1F628E 40%, #17567d 60%, #151F2D 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16 sm:pb-20 text-center">
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">Confidentialité</span>
          </nav>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-5xl mx-auto mb-6">
            Politique de{" "}
            <span className="block" style={{ color: "#F8A991" }}>confidentialité.</span>
          </h1>
          <p className="text-base sm:text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Découvrez comment nous protégeons vos données personnelles
            conformément au RGPD.
          </p>
          <p className="text-sm mt-4" style={{ color: "rgba(255,255,255,0.4)" }}>
            Dernière mise à jour : Mars 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24">
        <div className="container-custom max-w-4xl">
          <div className="space-y-6">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.title}
                  className="rounded-2xl p-6 md:p-8 transition-colors"
                  style={{
                    backgroundColor: "#151F2D",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "rgba(31,98,142,0.15)",
                      }}
                    >
                      <Icon
                        className="w-6 h-6"
                        style={{ color: "#1F628E" }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2
                        className="text-xl font-bold mb-4"
                        style={{ color: "#fff" }}
                      >
                        {section.title}
                      </h2>
                      <div
                        className="leading-relaxed"
                        style={{ color: "rgba(255,255,255,0.6)" }}
                      >
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
    </div>
  );
}
