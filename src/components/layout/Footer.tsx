import Link from "next/link";
import Image from "next/image";
import { Mail, Phone, MapPin, Linkedin, Facebook, Youtube, ArrowRight } from "lucide-react";

const footerLinks = {
  formations: [
    { name: "Sécurité Prévention", href: "/pole/securite-prevention" },
    { name: "Petite Enfance", href: "/pole/petite-enfance" },
    { name: "Santé", href: "/pole/sante" },
  ],
  entreprise: [
    { name: "À propos", href: "/a-propos" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "Confidentialité", href: "/confidentialite" },
    { name: "Cookies", href: "/cookies" },
    { name: "Accessibilité", href: "/accessibilite" },
    { name: "Plan du site", href: "/sitemap" },
  ],
};

// Custom X/Twitter icon component
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const socialLinks = [
  { name: "LinkedIn", href: "https://fr.linkedin.com/company/candco-formation", icon: Linkedin },
  { name: "Facebook", href: "https://www.facebook.com/CandCoFormation", icon: Facebook },
  { name: "X", href: "https://x.com/Nicolas_candco", icon: XIcon },
  { name: "YouTube", href: "https://www.youtube.com/@CandCoFormation", icon: Youtube },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/50 bg-muted/20" role="contentinfo" aria-label="Pied de page">
      {/* Main footer */}
      <div className="container-custom py-10 lg:py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-8 lg:gap-8">
          {/* Brand & Contact */}
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <Link href="/" aria-label="Retour à l'accueil - C&Co Formation">
              <Image
                src="/logo.svg"
                alt="C&Co Formation"
                width={120}
                height={36}
                className="h-9 w-auto"
              />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Centre de formation professionnelle certifié Qualiopi.
              Formations en Sécurité, Petite Enfance et Santé.
            </p>

            {/* Contact info */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a
                href="mailto:contact@candco.fr"
                className="flex items-center gap-2 hover:text-primary transition-colors group"
              >
                <Mail className="w-4 h-4 text-primary/70 group-hover:text-primary" />
                contact@candco.fr
              </a>
              <a
                href="tel:+33762596653"
                className="flex items-center gap-2 hover:text-primary transition-colors group"
              >
                <Phone className="w-4 h-4 text-primary/70 group-hover:text-primary" />
                07 62 59 66 53
              </a>
            </div>

            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-primary/70 shrink-0 mt-0.5" />
              <span>340 chemin du plan marseillais, 13320 Bouc-bel-air</span>
            </div>

            {/* Qualiopi logo */}
            <div className="pt-1">
              <Image
                src="/logo-qualiopi.png"
                alt="Certification Qualiopi - Actions de Formation"
                width={140}
                height={56}
                className="h-14 w-auto"
              />
            </div>
          </div>

          {/* Links - Formations */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Formations</h4>
            <ul className="space-y-2">
              {footerLinks.formations.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Entreprise */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Entreprise</h4>
            <ul className="space-y-2">
              {footerLinks.entreprise.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links - Légal (hidden on mobile) */}
          <div className="hidden lg:block">
            <h4 className="text-sm font-semibold mb-3">Légal</h4>
            <ul className="space-y-2">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile only: Légal links inline */}
          <div className="col-span-2 lg:hidden border-t border-border/50 pt-4">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section - Desktop only */}
        <div className="hidden lg:flex items-center justify-between mt-8 pt-8 border-t border-border/50">
          <div>
            <h4 className="text-sm font-semibold mb-1">Besoin d'une formation sur mesure ?</h4>
            <p className="text-sm text-muted-foreground">
              Nous adaptons nos formations à vos besoins spécifiques
            </p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Demander un devis
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/50">
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-3 text-xs text-muted-foreground">
            <p>&copy; {currentYear} C&Co Formation. Tous droits réservés.</p>
            <span className="hidden sm:inline">&bull;</span>
            <p>
              Un site créé avec{" "}
              <span className="text-red-500" role="img" aria-label="amour">
                &hearts;
              </span>{" "}
              par{" "}
              <a
                href="https://agencehds.fr/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-primary transition-colors underline-offset-2 hover:underline"
              >
                Agence HDS
              </a>
            </p>
          </div>

          {/* Social links */}
          <nav className="flex items-center gap-3" aria-label="Réseaux sociaux">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-full bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all"
                aria-label={`Suivez-nous sur ${social.name}`}
              >
                <social.icon className="w-4 h-4" aria-hidden="true" />
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
