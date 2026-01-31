"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  ChevronDown,
  ChevronRight,
  X,
  Menu,
  Shield,
  GraduationCap,
  Search,
  Home,
  Newspaper,
  HelpCircle,
  Mail,
  BookOpen,
  Heart,
  Accessibility,
  Baby,
  HeartPulse,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavSubItem = {
  name: string;
  href: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type NavItem = {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  submenu?: NavSubItem[];
};

// Desktop navigation
const navigation: NavItem[] = [
  { name: "Accueil", href: "/" },
  {
    name: "Formations",
    href: "/formations",
    submenu: [
      {
        name: "Toutes les formations",
        href: "/formations",
        description: "Découvrez notre catalogue complet",
        icon: GraduationCap,
      },
      {
        name: "Sécurité & Prévention",
        href: "/pole/securite-prevention",
        description: "SST, Incendie, habilitations électriques",
        icon: Shield,
      },
      {
        name: "Petite Enfance",
        href: "/pole/petite-enfance",
        description: "Éveil, pédagogies alternatives, formations continues",
        icon: Baby,
      },
      {
        name: "Santé & Paramédical",
        href: "/pole/sante",
        description: "Gestes d'urgence, soins, accompagnement",
        icon: HeartPulse,
      },
    ],
  },
  {
    name: "À propos",
    href: "/a-propos",
    submenu: [
      {
        name: "Notre histoire",
        href: "/a-propos",
        description: "Découvrez C&Co Formation et son fondateur",
        icon: BookOpen,
      },
      {
        name: "Handicap & Inclusion",
        href: "/handicap",
        description: "Accompagnement des personnes en situation de handicap",
        icon: Heart,
      },
      {
        name: "Accessibilité",
        href: "/accessibilite",
        description: "Notre engagement pour l'accessibilité numérique",
        icon: Accessibility,
      },
    ],
  },
  { name: "Blog", href: "/blog" },
  { name: "FAQ", href: "/faq" },
  { name: "Contact", href: "/contact" },
];

// Mobile navigation with icons
const mobileNavigation: NavItem[] = [
  { name: "Accueil", href: "/", icon: Home },
  {
    name: "Formations",
    href: "/formations",
    icon: GraduationCap,
    submenu: [
      {
        name: "Toutes les formations",
        href: "/formations",
        description: "Découvrez notre catalogue complet",
        icon: GraduationCap,
      },
      {
        name: "Sécurité & Prévention",
        href: "/pole/securite-prevention",
        description: "SST, Incendie, habilitations électriques",
        icon: Shield,
      },
      {
        name: "Petite Enfance",
        href: "/pole/petite-enfance",
        description: "Éveil, pédagogies alternatives, formations continues",
        icon: Baby,
      },
      {
        name: "Santé & Paramédical",
        href: "/pole/sante",
        description: "Gestes d'urgence, soins, accompagnement",
        icon: HeartPulse,
      },
    ],
  },
  {
    name: "À propos",
    href: "/a-propos",
    icon: BookOpen,
    submenu: [
      {
        name: "Notre histoire",
        href: "/a-propos",
        description: "Découvrez C&Co Formation et son fondateur",
        icon: BookOpen,
      },
      {
        name: "Handicap & Inclusion",
        href: "/handicap",
        description: "Accompagnement des personnes en situation de handicap",
        icon: Heart,
      },
      {
        name: "Accessibilité",
        href: "/accessibilite",
        description: "Notre engagement pour l'accessibilité numérique",
        icon: Accessibility,
      },
    ],
  },
  { name: "Blog", href: "/blog", icon: Newspaper },
  { name: "FAQ", href: "/faq", icon: HelpCircle },
  { name: "Contact", href: "/contact", icon: Mail },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
  const pathname = usePathname();

  // Swipe to close state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipingMenu, setIsSwipingMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setHoveredSubmenu(null);
    setMobileSubmenuOpen(null);
  }, [pathname]);

  // Block body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflowY = "hidden";
    } else {
      document.body.style.overflowY = "";
    }
    return () => {
      document.body.style.overflowY = "";
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwipingMenu(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - touchStartX.current;
    const diffY = Math.abs(currentY - touchStartY.current);

    if (!isSwipingMenu && Math.abs(diffX) > 10) {
      setIsSwipingMenu(Math.abs(diffX) > diffY);
    }

    if (isSwipingMenu && diffX > 0) {
      setSwipeOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (swipeOffset > 60) {
      setIsOpen(false);
    }
    touchStartX.current = null;
    touchStartY.current = null;
    setSwipeOffset(0);
    setIsSwipingMenu(false);
  };

  const isActiveRoute = (href: string, submenu?: NavSubItem[]) => {
    if (submenu?.length) {
      return submenu.some((item) => pathname === item.href);
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "h-16 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-sm"
          : "h-20 bg-background/50 backdrop-blur-sm"
      )}
    >
      <div className="w-full h-full px-6 lg:px-10">
        <div className="flex items-center h-full max-w-[1800px] mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="hover:opacity-80 transition-all duration-300 hover:scale-105 shrink-0"
            aria-label="Retour à l'accueil - C&Co Formation"
          >
            <Image
              src="/logo.svg"
              alt="C&Co Formation"
              width={140}
              height={48}
              className={cn(
                "w-auto transition-all duration-300",
                isScrolled ? "h-10 md:h-12" : "h-12 md:h-14"
              )}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden xl:flex items-center justify-center absolute left-1/2 -translate-x-1/2"
            aria-label="Menu principal"
          >
            <div className="flex items-center gap-0.5">
              {navigation.map((item) =>
                item.submenu ? (
                  <div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setHoveredSubmenu(item.name)}
                    onMouseLeave={() => setHoveredSubmenu(null)}
                  >
                    <button
                      className={cn(
                        "relative px-3 py-2 text-[11px] font-normal uppercase tracking-wider transition-all duration-300 flex items-center gap-1 rounded-full",
                        isActiveRoute(item.href, item.submenu)
                          ? "text-primary bg-primary/10"
                          : hoveredSubmenu === item.name
                          ? "text-foreground bg-secondary/50"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      {item.name}
                      <ChevronDown
                        className={cn(
                          "w-3.5 h-3.5 transition-transform duration-200",
                          hoveredSubmenu === item.name && "rotate-180"
                        )}
                      />
                    </button>

                    {/* Submenu dropdown */}
                    <div
                      className={cn(
                        "absolute top-full left-1/2 -translate-x-1/2 pt-3 transition-all duration-300",
                        hoveredSubmenu === item.name
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-2"
                      )}
                    >
                      <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-xl p-3 min-w-[320px]">
                        <div className="space-y-1">
                          {item.submenu.map((subItem) => {
                            const Icon = subItem.icon;
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-xl transition-all duration-200 group",
                                  pathname === subItem.href
                                    ? "bg-primary/10 border border-primary/20"
                                    : "hover:bg-secondary/50"
                                )}
                              >
                                <div
                                  className={cn(
                                    "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                                    pathname === subItem.href
                                      ? "bg-primary/20"
                                      : "bg-secondary/50 group-hover:bg-primary/10"
                                  )}
                                >
                                  {Icon && (
                                    <Icon
                                      className={cn(
                                        "w-5 h-5 transition-colors",
                                        pathname === subItem.href
                                          ? "text-primary"
                                          : "text-muted-foreground group-hover:text-primary"
                                      )}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={cn(
                                      "font-normal text-sm transition-colors",
                                      pathname === subItem.href
                                        ? "text-primary"
                                        : "text-foreground group-hover:text-primary"
                                    )}
                                  >
                                    {subItem.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1 font-normal">
                                    {subItem.description}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative px-3 py-2 text-[11px] font-normal uppercase tracking-wider transition-all duration-300 rounded-full",
                      isActiveRoute(item.href)
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    {item.name}
                  </Link>
                )
              )}
            </div>
          </nav>

          {/* Desktop right side */}
          <div className="hidden xl:flex items-center gap-1.5 ml-auto">
            <button
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="w-px h-6 bg-border/50 mx-2" />

            <Link
              href="/auth"
              className="flex items-center gap-2 text-xs font-normal uppercase tracking-wider px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              <User className="w-4 h-4" />
              Connexion
            </Link>

            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-4 py-2.5 border border-primary/50 text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              Nous contacter
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden flex items-center gap-2 ml-auto">
            <button
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="xl:hidden fixed inset-0 z-[9999]" style={{ top: 0 }}>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Side Panel */}
          <div
            className="fixed top-0 right-0 h-full w-[80%] max-w-[300px] bg-background shadow-2xl flex flex-col overflow-hidden"
            style={{ transform: `translateX(${swipeOffset}px)` }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Header */}
            <div className="px-5 py-3 border-b border-border/30 shrink-0 bg-gradient-to-br from-primary/5 via-background to-background">
              <div className="flex items-center justify-between">
                <Link href="/" onClick={() => setIsOpen(false)}>
                  <Image
                    src="/logo.svg"
                    alt="C&Co Formation"
                    width={100}
                    height={32}
                    className="h-8 w-auto"
                  />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-secondary/50"
                  aria-label="Fermer le menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
              <nav className="py-2" aria-label="Menu mobile">
                {mobileNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.name}>
                      {item.submenu ? (
                        <div>
                          <button
                            className={cn(
                              "w-full px-4 py-2.5 text-left font-medium transition-all flex items-center gap-3 group",
                              isActiveRoute(item.href, item.submenu)
                                ? "text-primary bg-primary/5"
                                : "text-foreground hover:bg-secondary/30"
                            )}
                            onClick={() =>
                              setMobileSubmenuOpen(
                                mobileSubmenuOpen === item.name ? null : item.name
                              )
                            }
                          >
                            {Icon && (
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                  isActiveRoute(item.href, item.submenu)
                                    ? "bg-primary/20"
                                    : "bg-secondary/50 group-hover:bg-secondary"
                                )}
                              >
                                <Icon
                                  className={cn(
                                    "w-4 h-4 transition-colors",
                                    isActiveRoute(item.href, item.submenu)
                                      ? "text-primary"
                                      : "text-muted-foreground"
                                  )}
                                />
                              </div>
                            )}
                            <span className="flex-1 text-sm">{item.name}</span>
                            <ChevronDown
                              className={cn(
                                "w-4 h-4 text-muted-foreground transition-transform duration-300",
                                mobileSubmenuOpen === item.name &&
                                  "rotate-180 text-primary"
                              )}
                            />
                          </button>

                          {/* Submenu */}
                          {mobileSubmenuOpen === item.name && (
                            <div className="bg-gradient-to-b from-secondary/20 to-secondary/5 py-1.5 space-y-0.5">
                              {item.submenu.map((subItem) => {
                                const SubIcon = subItem.icon;
                                return (
                                  <Link
                                    key={subItem.name}
                                    href={subItem.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                      "flex items-center gap-3 px-4 py-2 mx-2 rounded-lg transition-all",
                                      pathname === subItem.href
                                        ? "text-primary bg-primary/10 border border-primary/20"
                                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                        pathname === subItem.href
                                          ? "bg-primary/20"
                                          : "bg-secondary/50"
                                      )}
                                    >
                                      {SubIcon && (
                                        <SubIcon className="w-3.5 h-3.5" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium">
                                        {subItem.name}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground line-clamp-1">
                                        {subItem.description}
                                      </p>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-4 py-2.5 transition-all group",
                            pathname === item.href
                              ? "text-primary bg-primary/5"
                              : "text-foreground hover:bg-secondary/30"
                          )}
                        >
                          {Icon && (
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                pathname === item.href
                                  ? "bg-primary/20"
                                  : "bg-secondary/50 group-hover:bg-secondary"
                              )}
                            >
                              <Icon
                                className={cn(
                                  "w-4 h-4 transition-colors",
                                  pathname === item.href
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                )}
                              />
                            </div>
                          )}
                          <span className="flex-1 text-sm font-medium">
                            {item.name}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-muted-foreground transition-opacity" />
                        </Link>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Bottom actions */}
            <div className="border-t border-border/30 px-4 py-4 shrink-0 space-y-2 bg-background">
              <Link
                href="/auth"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <User className="w-4 h-4 text-muted-foreground" />
                Connexion
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center h-10 text-sm font-medium rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
