"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";

const navigation = [
  { name: "Accueil", href: "/" },
  {
    name: "Formations",
    href: "/formations",
    submenu: [
      { name: "Toutes les formations", href: "/formations" },
      { name: "Sécurité Prévention", href: "/formations?pole=securite-prevention" },
      { name: "Petite Enfance", href: "/formations?pole=petite-enfance" },
      { name: "Santé", href: "/formations?pole=sante" },
    ],
  },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="container-custom">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold">
              <span className="text-primary">C</span>
              <span className="text-foreground">&</span>
              <span className="text-primary">Co</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <div key={item.name} className="relative group">
                {item.submenu ? (
                  <>
                    <button
                      className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      onMouseEnter={() => setOpenSubmenu(item.name)}
                      onMouseLeave={() => setOpenSubmenu(null)}
                    >
                      {item.name}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {openSubmenu === item.name && (
                      <div
                        className="absolute top-full left-0 pt-2"
                        onMouseEnter={() => setOpenSubmenu(item.name)}
                        onMouseLeave={() => setOpenSubmenu(null)}
                      >
                        <div className="bg-card border border-border rounded-lg shadow-lg py-2 min-w-[200px]">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              className="block px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors"
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href="/auth"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Nous contacter
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-border">
            <div className="space-y-2">
              {navigation.map((item) => (
                <div key={item.name}>
                  {item.submenu ? (
                    <div>
                      <button
                        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium"
                        onClick={() =>
                          setOpenSubmenu(
                            openSubmenu === item.name ? null : item.name
                          )
                        }
                      >
                        {item.name}
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            openSubmenu === item.name ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {openSubmenu === item.name && (
                        <div className="pl-4 space-y-1">
                          {item.submenu.map((subitem) => (
                            <Link
                              key={subitem.name}
                              href={subitem.href}
                              className="block px-4 py-2 text-sm text-muted-foreground"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              {subitem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className="block px-4 py-2 text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-4 px-4 space-y-2">
                <Link
                  href="/auth"
                  className="block w-full py-2 text-center text-sm font-medium border border-border rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  href="/contact"
                  className="block w-full py-2 text-center text-sm font-medium bg-primary text-primary-foreground rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Nous contacter
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
