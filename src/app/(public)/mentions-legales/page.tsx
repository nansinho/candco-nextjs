import { Metadata } from "next";
import Link from "next/link";
import {
  Building,
  User,
  Server,
  Mail,
  Shield,
  Award,
  Palette,
  Globe,
  Scale,
  Link2,
  AlertTriangle,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Mentions Légales | C&Co Formation",
  description:
    "Mentions légales de C&Co Formation. Informations sur l'éditeur, l'hébergeur, la conception du site, la propriété intellectuelle et la certification Qualiopi.",
};

const linkStyle = { color: "#F8A991" };
const strongStyle = { color: "#fff" };
const textStyle = { color: "rgba(255,255,255,0.6)" };

const sections = [
  {
    icon: Building,
    title: "1. Éditeur du site",
    content: (
      <div className="space-y-2">
        <p>
          <strong style={strongStyle}>C&Co Formation</strong>
        </p>
        <p>Organisme de formation professionnelle</p>
        <p>
          Siège social : 340 chemin du plan marseillais, 13320 Bouc-bel-air
        </p>
        <p>
          N° de déclaration d&apos;activité : En cours d&apos;enregistrement auprès de la
          DREETS PACA
        </p>
        <p>
          Email :{" "}
          <a
            href="mailto:contact@candco.fr"
            className="hover:underline"
            style={linkStyle}
          >
            contact@candco.fr
          </a>
        </p>
        <p>
          Téléphone :{" "}
          <a
            href="tel:+33762596653"
            className="hover:underline"
            style={linkStyle}
          >
            07 62 59 66 53
          </a>
        </p>
      </div>
    ),
  },
  {
    icon: User,
    title: "2. Directeur de la publication",
    content: (
      <div className="space-y-2">
        <p>
          <strong style={strongStyle}>Nicolas</strong>
        </p>
        <p>Dirigeant de C&Co Formation</p>
        <p>Responsable de l&apos;ensemble des contenus publiés sur ce site.</p>
      </div>
    ),
  },
  {
    icon: Palette,
    title: "3. Conception et réalisation",
    content: (
      <div className="space-y-2">
        <p>
          <strong style={strongStyle}>Agence HDS</strong>
        </p>
        <p>SIRET : 810 696 096 00034</p>
        <p>Responsable : Nans Harua</p>
        <p>Adresse : 350 Route des Milles</p>
        <p>
          Email :{" "}
          <a
            href="mailto:contact@harua-ds.com"
            className="hover:underline"
            style={linkStyle}
          >
            contact@harua-ds.com
          </a>
        </p>
        <p>
          Sites :{" "}
          <a
            href="https://harua-ds.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={linkStyle}
          >
            harua-ds.com
          </a>{" "}
          |{" "}
          <a
            href="https://agencehds.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
            style={linkStyle}
          >
            agencehds.fr
          </a>
        </p>
      </div>
    ),
  },
  {
    icon: Server,
    title: "4. Hébergement",
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-medium mb-1" style={strongStyle}>
            Hébergement du domaine :
          </p>
          <p>
            <strong style={strongStyle}>IONOS SARL</strong>
          </p>
          <p>7 Place de la Gare, BP 70109</p>
          <p>57201 Sarreguemines Cedex, France</p>
          <p>Siège : Elgendorfer Str. 57, 56410 Montabaur, Allemagne</p>
          <p>
            Téléphone :{" "}
            <a
              href="tel:+33970808911"
              className="hover:underline"
              style={linkStyle}
            >
              09 70 80 89 11
            </a>
          </p>
          <p>
            Site :{" "}
            <a
              href="https://www.ionos.fr"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={linkStyle}
            >
              www.ionos.fr
            </a>
          </p>
        </div>
        <div>
          <p className="font-medium mb-1" style={strongStyle}>
            Infrastructure applicative :
          </p>
          <p>
            <strong style={strongStyle}>Supabase Inc.</strong> (Backend
            & Base de données)
          </p>
          <p>970 Toa Payoh North, #07-04, Singapore 318992</p>
          <p>
            Site :{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={linkStyle}
            >
              supabase.com
            </a>
          </p>
        </div>
        <div>
          <p className="font-medium mb-1" style={strongStyle}>Code source :</p>
          <p>
            <strong style={strongStyle}>GitHub Inc.</strong>
          </p>
          <p>88 Colin P Kelly Jr St, San Francisco, CA 94107, États-Unis</p>
        </div>
      </div>
    ),
  },
  {
    icon: Award,
    title: "5. Certification Qualiopi",
    content: (
      <div className="space-y-2">
        <p>
          C&Co Formation est certifié{" "}
          <strong style={strongStyle}>Qualiopi</strong> pour ses actions
          de formation professionnelle.
        </p>
        <p>
          Cette certification atteste de la qualité du processus mis en œuvre
          par notre organisme concourant au développement des compétences.
        </p>
        <p>Organisme certificateur : QUALIANOR Certification</p>
        <p>Numéro de certificat : 3279 OF</p>
        <p>Date de validité : 23 novembre 2027</p>
        <p className="text-sm italic mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
          La certification Qualiopi est délivrée au titre de la catégorie
          « Actions de formation ».
        </p>
      </div>
    ),
  },
  {
    icon: Shield,
    title: "6. Propriété intellectuelle",
    content: (
      <div className="space-y-3">
        <p>
          L&apos;ensemble du contenu du site candco.fr (textes, images, vidéos,
          graphismes, logo, icônes, sons, logiciels, etc.) est la propriété
          exclusive de C&Co Formation ou de ses partenaires.
        </p>
        <p>
          Toute reproduction, représentation, modification, publication,
          adaptation de tout ou partie des éléments du site, quel que soit le
          moyen ou le procédé utilisé, est interdite, sauf autorisation écrite
          préalable de C&Co Formation.
        </p>
        <p>
          Toute exploitation non autorisée du site ou de l&apos;un quelconque des
          éléments qu&apos;il contient sera considérée comme constitutive d&apos;une
          contrefaçon et poursuivie conformément aux dispositions des articles
          L.335-2 et suivants du Code de la Propriété Intellectuelle.
        </p>
      </div>
    ),
  },
  {
    icon: Globe,
    title: "7. Protection des données personnelles",
    content: (
      <div className="space-y-3">
        <p>
          Conformément au Règlement Général sur la Protection des Données (RGPD)
          et à la loi Informatique et Libertés, vous disposez d&apos;un droit
          d&apos;accès, de rectification, d&apos;effacement et de portabilité de vos
          données.
        </p>
        <p>
          Pour exercer ces droits ou pour toute question relative à vos données
          personnelles, contactez-nous à :{" "}
          <a
            href="mailto:contact@candco.fr"
            className="hover:underline"
            style={linkStyle}
          >
            contact@candco.fr
          </a>
        </p>
        <p>
          Pour plus d&apos;informations, consultez notre{" "}
          <Link href="/confidentialite" className="hover:underline" style={linkStyle}>
            Politique de confidentialité
          </Link>{" "}
          et notre{" "}
          <Link href="/cookies" className="hover:underline" style={linkStyle}>
            Politique de cookies
          </Link>
          .
        </p>
      </div>
    ),
  },
  {
    icon: Link2,
    title: "8. Liens hypertextes",
    content: (
      <div className="space-y-3">
        <p>
          <strong style={strongStyle}>Liens sortants :</strong> Le site
          candco.fr peut contenir des liens vers d&apos;autres sites internet. C&Co
          Formation n&apos;exerce aucun contrôle sur ces sites et décline toute
          responsabilité quant à leur contenu.
        </p>
        <p>
          <strong style={strongStyle}>Liens entrants :</strong> Tout
          lien vers le site candco.fr est soumis à l&apos;accord préalable de C&Co
          Formation. Les liens profonds (deep linking) et le framing sont
          interdits sans autorisation.
        </p>
      </div>
    ),
  },
  {
    icon: AlertTriangle,
    title: "9. Limitation de responsabilité",
    content: (
      <div className="space-y-3">
        <p>
          C&Co Formation s&apos;efforce d&apos;assurer l&apos;exactitude et la mise à jour des
          informations diffusées sur ce site. Toutefois, C&Co Formation ne peut
          garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations
          mises à disposition.
        </p>
        <p>
          C&Co Formation décline toute responsabilité pour tout dommage direct
          ou indirect résultant de l&apos;utilisation du site, notamment en cas
          d&apos;interruption ou d&apos;inaccessibilité du site, de survenance de bugs, ou
          de tout dommage résultant d&apos;une intrusion frauduleuse d&apos;un tiers.
        </p>
        <p>
          L&apos;utilisateur est seul responsable de l&apos;utilisation qu&apos;il fait des
          informations et contenus présents sur le site.
        </p>
      </div>
    ),
  },
  {
    icon: Scale,
    title: "10. Droit applicable et juridiction",
    content: (
      <div className="space-y-3">
        <p>
          Les présentes mentions légales sont régies par le droit français.
        </p>
        <p>
          En cas de litige, et après tentative de recherche d&apos;une solution
          amiable, les tribunaux français seront seuls compétents.
        </p>
        <p>
          Le tribunal compétent sera celui du ressort du siège social de C&Co
          Formation, soit le Tribunal de Commerce d&apos;Aix-en-Provence.
        </p>
      </div>
    ),
  },
  {
    icon: FileText,
    title: "11. Crédits",
    content: (
      <div className="space-y-2">
        <p>
          <strong style={strongStyle}>
            Conception et développement :
          </strong>{" "}
          Agence HDS
        </p>
        <p>
          <strong style={strongStyle}>Icônes :</strong> Lucide Icons
          (licence MIT)
        </p>
        <p>
          <strong style={strongStyle}>Typographies :</strong> Inter
          (licence OFL)
        </p>
        <p className="text-sm italic mt-2" style={{ color: "rgba(255,255,255,0.45)" }}>
          Dernière mise à jour : Mars 2026
        </p>
      </div>
    ),
  },
];

export default function MentionsLegalesPage() {
  return (
    <>
      {/* Hero Section */}
      <section
        className="relative py-16 md:py-24"
        style={{
          background:
            "linear-gradient(180deg, #1a6faa 0%, #1F628E 40%, #17567d 60%, #151F2D 100%)",
        }}
      >
        <div className="container-custom relative z-10">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm">
            <ol className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.5)" }}>
              <li>
                <Link
                  href="/"
                  className="hover:underline transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  Accueil
                </Link>
              </li>
              <li>/</li>
              <li style={{ color: "#fff" }}>Mentions légales</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <p
              className="text-sm mb-4 tracking-widest uppercase"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              Informations légales
            </p>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-6"
              style={{ color: "#fff" }}
            >
              Mentions{" "}
              <span style={{ color: "#F8A991" }}>légales</span>
            </h1>
            <p
              className="text-lg"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Toutes les informations légales concernant C&Co Formation,
              l&apos;éditeur et l&apos;hébergeur de ce site web.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: "#0f1923" }}
      >
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
                      style={{ backgroundColor: "rgba(31,98,142,0.15)" }}
                    >
                      <Icon className="w-6 h-6" style={{ color: "#1F628E" }} />
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

          {/* Contact CTA */}
          <div
            className="mt-12 p-8 rounded-2xl text-center"
            style={{
              backgroundColor: "rgba(31,98,142,0.1)",
              border: "1px solid rgba(31,98,142,0.3)",
            }}
          >
            <Mail className="w-10 h-10 mx-auto mb-4" style={{ color: "#1F628E" }} />
            <h3
              className="text-xl font-bold mb-2"
              style={{ color: "#fff" }}
            >
              Une question ?
            </h3>
            <p
              className="mb-4"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              Pour toute question concernant ces mentions légales, n&apos;hésitez pas
              à nous contacter.
            </p>
            <a
              href="mailto:contact@candco.fr"
              className="inline-flex items-center gap-2 hover:underline font-medium"
              style={{ color: "#F8A991" }}
            >
              contact@candco.fr
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
