import Link from "next/link";

const footerLinks = {
  formations: [
    { name: "Sécurité Prévention", href: "/formations?pole=securite-prevention" },
    { name: "Petite Enfance", href: "/formations?pole=petite-enfance" },
    { name: "Santé", href: "/formations?pole=sante" },
    { name: "Toutes les formations", href: "/formations" },
  ],
  entreprise: [
    { name: "À propos", href: "/a-propos" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "Politique de confidentialité", href: "/confidentialite" },
    { name: "Cookies", href: "/cookies" },
    { name: "Accessibilité", href: "/accessibilite" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container-custom py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Logo et description */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold">
                <span className="text-primary">C</span>
                <span className="text-foreground">&</span>
                <span className="text-primary">Co</span>
                <span className="text-muted-foreground ml-2 text-lg font-normal">
                  Formation
                </span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Centre de formation professionnelle certifié Qualiopi. Formations
              en Sécurité, Petite Enfance et Santé.
            </p>
            <div className="flex items-center gap-2">
              <img
                src="https://www.qualiopi.fr/wp-content/uploads/2020/02/Logo-Qualiopi-72dpi-Web-56.png"
                alt="Qualiopi"
                className="h-12 object-contain"
              />
            </div>
          </div>

          {/* Formations */}
          <div>
            <h3 className="font-semibold mb-4">Formations</h3>
            <ul className="space-y-2">
              {footerLinks.formations.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className="font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-2">
              {footerLinks.entreprise.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a
                  href="tel:+33100000000"
                  className="hover:text-foreground transition-colors"
                >
                  01 00 00 00 00
                </a>
              </li>
              <li>
                <a
                  href="mailto:contact@candco-formation.fr"
                  className="hover:text-foreground transition-colors"
                >
                  contact@candco-formation.fr
                </a>
              </li>
              <li>Paris, France</li>
            </ul>
            <div className="mt-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} C&Co Formation. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
