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

const sections = [
  {
    icon: Building,
    title: "1. Éditeur du site",
    content: (
      <div className="space-y-2">
        <p>
          <strong className="text-foreground">C&Co Formation</strong>
        </p>
        <p>Organisme de formation professionnelle</p>
        <p>
          Siège social : 340 chemin du plan marseillais, 13320 Bouc-bel-air
        </p>
        <p>
          N° de déclaration d'activité : En cours d'enregistrement auprès de la
          DREETS PACA
        </p>
        <p>
          Email :{" "}
          <a
            href="mailto:contact@candco.fr"
            className="text-primary hover:underline"
          >
            contact@candco.fr
          </a>
        </p>
        <p>
          Téléphone :{" "}
          <a
            href="tel:+33762596653"
            className="text-primary hover:underline"
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
          <strong className="text-foreground">Nicolas</strong>
        </p>
        <p>Dirigeant de C&Co Formation</p>
        <p>Responsable de l'ensemble des contenus publiés sur ce site.</p>
      </div>
    ),
  },
  {
    icon: Palette,
    title: "3. Conception et réalisation",
    content: (
      <div className="space-y-2">
        <p>
          <strong className="text-foreground">Agence HDS</strong>
        </p>
        <p>SIRET : 810 696 096 00034</p>
        <p>Responsable : Nans Harua</p>
        <p>Adresse : 350 Route des Milles</p>
        <p>
          Email :{" "}
          <a
            href="mailto:contact@harua-ds.com"
            className="text-primary hover:underline"
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
            className="text-primary hover:underline"
          >
            harua-ds.com
          </a>{" "}
          |{" "}
          <a
            href="https://agencehds.fr"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
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
          <p className="font-medium text-foreground mb-1">
            Hébergement du domaine :
          </p>
          <p>
            <strong className="text-foreground">IONOS SARL</strong>
          </p>
          <p>7 Place de la Gare, BP 70109</p>
          <p>57201 Sarreguemines Cedex, France</p>
          <p>Siège : Elgendorfer Str. 57, 56410 Montabaur, Allemagne</p>
          <p>
            Téléphone :{" "}
            <a
              href="tel:+33970808911"
              className="text-primary hover:underline"
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
              className="text-primary hover:underline"
            >
              www.ionos.fr
            </a>
          </p>
        </div>
        <div>
          <p className="font-medium text-foreground mb-1">
            Infrastructure applicative :
          </p>
          <p>
            <strong className="text-foreground">Supabase Inc.</strong> (Backend
            & Base de données)
          </p>
          <p>970 Toa Payoh North, #07-04, Singapore 318992</p>
          <p>
            Site :{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              supabase.com
            </a>
          </p>
        </div>
        <div>
          <p className="font-medium text-foreground mb-1">Code source :</p>
          <p>
            <strong className="text-foreground">GitHub Inc.</strong>
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
          <strong className="text-foreground">Qualiopi</strong> pour ses actions
          de formation professionnelle.
        </p>
        <p>
          Cette certification atteste de la qualité du processus mis en œuvre
          par notre organisme concourant au développement des compétences.
        </p>
        <p>Organisme certificateur : QUALIANOR Certification</p>
        <p>Numéro de certificat : 3279 OF</p>
        <p>Date de validité : 23 novembre 2027</p>
        <p className="text-sm italic mt-2">
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
          L'ensemble du contenu du site candco.fr (textes, images, vidéos,
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
          Toute exploitation non autorisée du site ou de l'un quelconque des
          éléments qu'il contient sera considérée comme constitutive d'une
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
          et à la loi Informatique et Libertés, vous disposez d'un droit
          d'accès, de rectification, d'effacement et de portabilité de vos
          données.
        </p>
        <p>
          Pour exercer ces droits ou pour toute question relative à vos données
          personnelles, contactez-nous à :{" "}
          <a
            href="mailto:contact@candco.fr"
            className="text-primary hover:underline"
          >
            contact@candco.fr
          </a>
        </p>
        <p>
          Pour plus d'informations, consultez notre{" "}
          <Link href="/confidentialite" className="text-primary hover:underline">
            Politique de confidentialité
          </Link>{" "}
          et notre{" "}
          <Link href="/cookies" className="text-primary hover:underline">
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
          <strong className="text-foreground">Liens sortants :</strong> Le site
          candco.fr peut contenir des liens vers d'autres sites internet. C&Co
          Formation n'exerce aucun contrôle sur ces sites et décline toute
          responsabilité quant à leur contenu.
        </p>
        <p>
          <strong className="text-foreground">Liens entrants :</strong> Tout
          lien vers le site candco.fr est soumis à l'accord préalable de C&Co
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
          C&Co Formation s'efforce d'assurer l'exactitude et la mise à jour des
          informations diffusées sur ce site. Toutefois, C&Co Formation ne peut
          garantir l'exactitude, la précision ou l'exhaustivité des informations
          mises à disposition.
        </p>
        <p>
          C&Co Formation décline toute responsabilité pour tout dommage direct
          ou indirect résultant de l'utilisation du site, notamment en cas
          d'interruption ou d'inaccessibilité du site, de survenance de bugs, ou
          de tout dommage résultant d'une intrusion frauduleuse d'un tiers.
        </p>
        <p>
          L'utilisateur est seul responsable de l'utilisation qu'il fait des
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
          En cas de litige, et après tentative de recherche d'une solution
          amiable, les tribunaux français seront seuls compétents.
        </p>
        <p>
          Le tribunal compétent sera celui du ressort du siège social de C&Co
          Formation, soit le Tribunal de Commerce d'Aix-en-Provence.
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
          <strong className="text-foreground">
            Conception et développement :
          </strong>{" "}
          Agence HDS
        </p>
        <p>
          <strong className="text-foreground">Icônes :</strong> Lucide Icons
          (licence MIT)
        </p>
        <p>
          <strong className="text-foreground">Typographies :</strong> Inter
          (licence OFL)
        </p>
        <p className="text-sm italic mt-2">
          Dernière mise à jour : Janvier 2026
        </p>
      </div>
    ),
  },
];

export default function MentionsLegalesPage() {
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
              <li className="text-foreground">Mentions légales</li>
            </ol>
          </nav>

          <div className="max-w-3xl">
            <p className="text-sm text-muted-foreground mb-4 tracking-widest uppercase">
              Informations légales
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light leading-tight mb-6">
              Mentions <span className="text-primary">légales</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Toutes les informations légales concernant C&Co Formation,
              l'éditeur et l'hébergeur de ce site web.
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

          {/* Contact CTA */}
          <div className="mt-12 p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center">
            <Mail className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Une question ?</h3>
            <p className="text-muted-foreground mb-4">
              Pour toute question concernant ces mentions légales, n'hésitez pas
              à nous contacter.
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
