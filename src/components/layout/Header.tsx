"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/components/search";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

// Role labels and colors
const roleLabels: Record<string, string> = {
  superadmin: "Super Admin",
  admin: "Admin",
  org_manager: "Manager",
  moderator: "Modérateur",
  formateur: "Formateur",
  client_manager: "Client",
  user: "Utilisateur",
};

const roleColors: Record<string, string> = {
  superadmin: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  admin: "bg-red-500/10 text-red-600 border-red-500/20",
  org_manager: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  moderator: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  formateur: "bg-green-500/10 text-green-600 border-green-500/20",
  client_manager: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
  user: "bg-muted text-muted-foreground border-border/30",
};

interface UserData {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  role?: string;
}

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredSubmenu, setHoveredSubmenu] = useState<string | null>(null);
  const submenuTimeout = useRef<NodeJS.Timeout | null>(null);

  const openSubmenu = (name: string) => {
    if (submenuTimeout.current) clearTimeout(submenuTimeout.current);
    setHoveredSubmenu(name);
  };
  const closeSubmenu = () => {
    submenuTimeout.current = setTimeout(() => setHoveredSubmenu(null), 200);
  };
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen: setSearchOpen } = useSearch();

  // Swipe to close state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipingMenu, setIsSwipingMenu] = useState(false);

  // Use AuthContext instead of separate fetch
  const { user: authUser, loading, userRole, userProfile, signOut } = useAuth();

  const user = useMemo<UserData | null>(() => {
    if (!authUser) return null;
    return {
      id: authUser.id,
      email: authUser.email || "",
      first_name: userProfile?.first_name || authUser.user_metadata?.first_name,
      last_name: userProfile?.last_name || authUser.user_metadata?.last_name,
      avatar_url: userProfile?.avatar_url || undefined,
      role: userRole || "user",
    };
  }, [authUser, userRole, userProfile]);

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

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "?";
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return user?.email?.split("@")[0] || "Utilisateur";
  };

  const isAdmin = user?.role && ["superadmin", "admin", "org_manager", "moderator"].includes(user.role);

  return (
    <>
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "h-16 bg-background/95 backdrop-blur-xl border-b border-border/30 shadow-sm"
          : "h-20 bg-background/50 backdrop-blur-sm"
      )}
    >
      <div className="w-full h-full">
        <div className="flex items-center h-full w-[96%] mx-auto">
          {/* Logo */}
          <Link
            href="/"
            className="hover:opacity-80 transition-all duration-300 hover:scale-105 shrink-0"
            aria-label="Retour à l'accueil - C&Co Formation"
          >
            <div className={cn(
              "relative transition-all duration-300",
              isScrolled ? "h-10 md:h-12" : "h-12 md:h-14"
            )} style={{ aspectRatio: "140/48" }}>
              <Image
                src="/logo.svg"
                alt="C&Co Formation"
                fill
                className="object-contain"
                priority
              />
            </div>
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
                    onMouseEnter={() => openSubmenu(item.name)}
                    onMouseLeave={() => closeSubmenu()}
                  >
                    <button
                      className={cn(
                        "relative px-3 py-2 text-[11px] font-medium uppercase tracking-wider transition-all duration-300 flex items-center gap-1 rounded-full",
                        isScrolled
                          ? isActiveRoute(item.href, item.submenu)
                            ? "text-primary bg-primary/10"
                            : hoveredSubmenu === item.name
                            ? "text-foreground bg-secondary/50"
                            : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                          : isActiveRoute(item.href, item.submenu)
                            ? "text-[#ffffff] bg-[#1F628E]"
                            : hoveredSubmenu === item.name
                            ? "text-[#ffffff] bg-[#1F628E]"
                            : "text-[#ffffff] hover:bg-[#1F628E]"
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

                    {/* Submenu dropdown — pt-4 acts as invisible bridge */}
                    <div
                      className={cn(
                        "absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200",
                        hoveredSubmenu === item.name
                          ? "opacity-100 visible translate-y-0"
                          : "opacity-0 invisible -translate-y-1 pointer-events-none"
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
                      "relative px-3 py-2 text-[11px] font-medium uppercase tracking-wider transition-all duration-300 rounded-full",
                      isScrolled
                        ? isActiveRoute(item.href)
                          ? "text-primary bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                        : isActiveRoute(item.href)
                          ? "text-[#ffffff] bg-[#1F628E]"
                          : "text-[#ffffff] hover:bg-[#1F628E]"
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
              onClick={() => setSearchOpen(true)}
              className={cn(
                "p-2 rounded-full transition-colors",
                isScrolled
                  ? "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              )}
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className={cn("w-px h-6 mx-2", isScrolled ? "bg-border/50" : "bg-white/20")} />

            {/* User Auth Section */}
            {!loading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-secondary/50 transition-colors">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src={user.avatar_url} alt={getUserDisplayName()} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium leading-tight">{getUserDisplayName()}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] px-1.5 py-0 h-4",
                          roleColors[user.role || "user"]
                        )}
                      >
                        {roleLabels[user.role || "user"]}
                      </Badge>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2 border-b border-border/50">
                    <p className="text-sm font-medium">{getUserDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Administration
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth"
                className={cn(
                  "flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider px-4 py-2.5 transition-colors",
                  isScrolled
                    ? "text-muted-foreground hover:text-foreground"
                    : "text-white/80 hover:text-white"
                )}
              >
                <User className="w-4 h-4" />
                Connexion
              </Link>
            )}

            <Link
              href="/contact"
              className={cn(
                "inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-[11px] font-medium uppercase tracking-wider transition-colors",
                isScrolled
                  ? "border border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground"
                  : "bg-[#1F628E] text-white hover:bg-[#1a5579] border border-white/10"
              )}
            >
              Nous contacter
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="xl:hidden flex items-center gap-2 ml-auto">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Mobile user avatar */}
            {!loading && user && (
              <Link href="/mon-compte" className="p-1">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                  <AvatarImage src={user.avatar_url} alt={getUserDisplayName()} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            )}

            <button
              className="p-2.5 text-foreground bg-secondary/80 hover:bg-secondary transition-colors rounded-lg border border-border/50 shadow-sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Mobile Navigation — Fullscreen */}
      <div
        className={cn(
          "xl:hidden fixed inset-0 z-[9999]",
          isOpen ? "visible" : "invisible pointer-events-none"
        )}
      >
        {/* Fullscreen Panel */}
        <div
          className={cn(
            "fixed inset-0 flex flex-col overflow-hidden transition-all duration-400 ease-out",
            isOpen ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"
          )}
          style={{ background: "linear-gradient(180deg, #1a6faa 0%, #1F628E 30%, #17567d 60%, #151F2D 100%)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 shrink-0">
            <Link href="/" onClick={() => setIsOpen(false)}>
              <div className="relative h-10" style={{ aspectRatio: "140/48" }}>
                <Image
                  src="/logo.svg"
                  alt="C&Co Formation"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <button
              onClick={() => setIsOpen(false)}
              className="w-10 h-10 flex items-center justify-center rounded-xl transition-colors"
              style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User info if logged in */}
          {!loading && user && (
            <div className="mx-5 mb-4 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 ring-2 ring-white/20">
                  <AvatarImage src={user.avatar_url} alt={getUserDisplayName()} />
                  <AvatarFallback className="text-sm" style={{ backgroundColor: "#F8A991", color: "#151F2D" }}>
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{getUserDisplayName()}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {roleLabels[user.role || "user"]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto px-5">
            <nav className="space-y-1" aria-label="Menu mobile">
              {mobileNavigation.map((item, index) => {
                const Icon = item.icon;
                const active = isActiveRoute(item.href, item.submenu);
                return (
                  <div
                    key={item.name}
                    className={cn(
                      "transition-all duration-300",
                      isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                    )}
                    style={{ transitionDelay: isOpen ? `${index * 50}ms` : "0ms" }}
                  >
                    {item.submenu ? (
                      <>
                        <button
                          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all"
                          style={{
                            backgroundColor: active || mobileSubmenuOpen === item.name ? "rgba(255,255,255,0.08)" : "transparent",
                            color: active ? "#F8A991" : "#fff",
                          }}
                          onClick={() =>
                            setMobileSubmenuOpen(
                              mobileSubmenuOpen === item.name ? null : item.name
                            )
                          }
                        >
                          {Icon && (
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                              style={{ backgroundColor: active ? "rgba(248,169,145,0.15)" : "rgba(255,255,255,0.06)" }}
                            >
                              <span style={{ color: active ? "#F8A991" : "rgba(255,255,255,0.7)" }}><Icon className="w-5 h-5" /></span>
                            </div>
                          )}
                          <span className="flex-1 text-left text-[15px] font-medium">{item.name}</span>
                          <ChevronDown
                            className="w-4 h-4 transition-transform duration-300"
                            style={{
                              color: "rgba(255,255,255,0.4)",
                              transform: mobileSubmenuOpen === item.name ? "rotate(180deg)" : "rotate(0deg)",
                            }}
                          />
                        </button>

                        {/* Submenu */}
                        <div
                          className={cn(
                            "overflow-hidden transition-all duration-300",
                            mobileSubmenuOpen === item.name ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                          )}
                        >
                          <div className="pl-6 pr-2 py-2 space-y-1">
                            {item.submenu.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const subActive = pathname === subItem.href;
                              return (
                                <Link
                                  key={subItem.name}
                                  href={subItem.href}
                                  onClick={() => setIsOpen(false)}
                                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all"
                                  style={{
                                    backgroundColor: subActive ? "rgba(248,169,145,0.1)" : "transparent",
                                    color: subActive ? "#F8A991" : "rgba(255,255,255,0.6)",
                                  }}
                                >
                                  {SubIcon && <SubIcon className="w-4 h-4 shrink-0" />}
                                  <span className="text-sm font-medium">{subItem.name}</span>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all"
                        style={{
                          backgroundColor: active ? "rgba(255,255,255,0.08)" : "transparent",
                          color: active ? "#F8A991" : "#fff",
                        }}
                      >
                        {Icon && (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: active ? "rgba(248,169,145,0.15)" : "rgba(255,255,255,0.06)" }}
                          >
                            <span style={{ color: active ? "#F8A991" : "rgba(255,255,255,0.7)" }}><Icon className="w-5 h-5" /></span>
                          </div>
                        )}
                        <span className="flex-1 text-[15px] font-medium">{item.name}</span>
                        <ChevronRight className="w-4 h-4" style={{ color: "rgba(255,255,255,0.2)" }} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Bottom actions */}
          <div className="px-5 pb-6 pt-4 shrink-0 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {!loading && user ? (
              <>
                <div className="flex gap-2">
                  <Link
                    href="/mon-compte"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 flex items-center justify-center gap-2 h-11 text-sm font-medium rounded-xl transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <User className="w-4 h-4" />
                    Mon compte
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex-1 flex items-center justify-center gap-2 h-11 text-sm font-medium rounded-xl transition-colors"
                      style={{ backgroundColor: "rgba(31,98,142,0.3)", color: "#fff", border: "1px solid rgba(31,98,142,0.4)" }}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin
                    </Link>
                  )}
                </div>
                <button
                  onClick={() => { handleSignOut(); setIsOpen(false); }}
                  className="w-full flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.35)" }}
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 h-11 text-sm font-medium rounded-xl transition-colors"
                style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <User className="w-4 h-4" />
                Connexion
              </Link>
            )}
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center h-12 text-sm font-bold rounded-xl shadow-lg transition-colors"
              style={{ backgroundColor: "#F8A991", color: "#151F2D" }}
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
