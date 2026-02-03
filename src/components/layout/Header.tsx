"use client";

import { useState, useEffect, useRef } from "react";
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
import { ThemeToggle } from "@/components/ThemeToggle";
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
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen: setSearchOpen } = useSearch();

  // Swipe to close state
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipingMenu, setIsSwipingMenu] = useState(false);

  // Check auth state
  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Get profile and role
          const [profileRes, roleRes] = await Promise.all([
            supabase
              .from("profiles")
              .select("first_name, last_name, avatar_url")
              .eq("id", session.user.id)
              .single(),
            supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", session.user.id)
              .single(),
          ]);

          setUser({
            id: session.user.id,
            email: session.user.email || "",
            first_name: profileRes.data?.first_name || session.user.user_metadata?.first_name,
            last_name: profileRes.data?.last_name || session.user.user_metadata?.last_name,
            avatar_url: profileRes.data?.avatar_url,
            role: roleRes.data?.role || "user",
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: { user?: { id: string } } | null) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "SIGNED_IN" && session?.user) {
        checkUser();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
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
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            <ThemeToggle />

            <div className="w-px h-6 bg-border/50 mx-2" />

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
                  <DropdownMenuItem asChild>
                    <Link href="/mon-compte" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mon compte
                    </Link>
                  </DropdownMenuItem>
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
                className="flex items-center gap-2 text-xs font-normal uppercase tracking-wider px-4 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="w-4 h-4" />
                Connexion
              </Link>
            )}

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
              onClick={() => setSearchOpen(true)}
              className="p-2 rounded-full hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Rechercher"
            >
              <Search className="w-5 h-5" />
            </button>

            <ThemeToggle />

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

            {/* User info if logged in */}
            {!loading && user && (
              <div className="px-4 py-3 border-b border-border/30 bg-gradient-to-br from-primary/5 via-background to-background">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-primary/20">
                    <AvatarImage src={user.avatar_url} alt={getUserDisplayName()} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{getUserDisplayName()}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] px-1.5 py-0 h-4 mt-0.5",
                        roleColors[user.role || "user"]
                      )}
                    >
                      {roleLabels[user.role || "user"]}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

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
              {!loading && user ? (
                <>
                  <Link
                    href="/mon-compte"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                  >
                    <User className="w-4 h-4 text-muted-foreground" />
                    Mon compte
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Administration
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Déconnexion
                  </button>
                </>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 h-9 text-sm font-medium rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Connexion
                </Link>
              )}
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
