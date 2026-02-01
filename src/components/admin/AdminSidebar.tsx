"use client";

/**
 * @file AdminSidebar.tsx
 * @description Barre latérale de navigation de l'interface d'administration.
 * Affiche les menus de manière dynamique selon le rôle de l'utilisateur.
 * @module Admin/Navigation
 */

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  FileText,
  MessageSquare,
  Users,
  Image,
  Settings,
  Calendar,
  FolderOpen,
  Megaphone,
  Shield,
  ChevronDown,
  MessageCircle,
  BarChart3,
  HelpCircle,
  Building2,
  Tags,
  Star,
  UserCog,
  ArrowRightLeft,
  Mail,
  Palette,
  Cookie,
  ShieldAlert,
  Lock,
  Code,
  Kanban,
  Archive,
  CheckCircle2,
  Trash2,
  Receipt,
  ClipboardList,
  Bell,
  Zap,
  Briefcase,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface MenuItem {
  title: string;
  url: string;
  icon: typeof LayoutDashboard;
}

interface MenuCategory {
  title: string;
  icon: typeof LayoutDashboard;
  items: MenuItem[];
  superadminOnly?: boolean;
  adminOnly?: boolean;
}

// Menu complet pour les admins
const allMenuCategories: MenuCategory[] = [
  {
    title: "Développement",
    icon: Code,
    adminOnly: true,
    items: [
      { title: "Demandes", url: "/admin/developpement", icon: Kanban },
      { title: "Résolues", url: "/admin/developpement/resolues", icon: CheckCircle2 },
      { title: "Archives", url: "/admin/developpement/archives", icon: Archive },
      { title: "Corbeille", url: "/admin/developpement/corbeille", icon: Trash2 },
    ],
  },
  {
    title: "Formations",
    icon: GraduationCap,
    items: [
      { title: "Catalogue", url: "/admin/formations", icon: FolderOpen },
      { title: "Sessions", url: "/admin/sessions", icon: Calendar },
      { title: "Formateurs", url: "/admin/formateurs", icon: UserCog },
      { title: "Clients", url: "/admin/clients", icon: Building2 },
      { title: "Facturation", url: "/admin/facturation", icon: Receipt },
      { title: "Analyse besoins", url: "/admin/analyse-besoins", icon: ClipboardList },
      { title: "Satisfaction", url: "/admin/satisfaction", icon: Star },
      { title: "Organismes", url: "/admin/organisations", icon: Building2 },
    ],
  },
  {
    title: "Contenu",
    icon: FileText,
    adminOnly: true,
    items: [
      { title: "Articles", url: "/admin/articles", icon: FileText },
      { title: "FAQ", url: "/admin/faq", icon: HelpCircle },
      { title: "Médias", url: "/admin/media", icon: Image },
    ],
  },
  {
    title: "Communication",
    icon: Megaphone,
    adminOnly: true,
    items: [
      { title: "Messages", url: "/admin/contacts", icon: MessageSquare },
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
      { title: "Emails", url: "/admin/email-stats", icon: Mail },
      { title: "Templates", url: "/admin/email-templates", icon: Palette },
      { title: "Chatbot", url: "/admin/chat-flows", icon: MessageCircle },
      { title: "Stats Chat", url: "/admin/chat-analytics", icon: BarChart3 },
    ],
  },
  {
    title: "Administration",
    icon: Shield,
    adminOnly: true,
    items: [
      { title: "Utilisateurs", url: "/admin/users", icon: Users },
      { title: "BPF", url: "/admin/bpf", icon: Briefcase },
      { title: "Automation", url: "/admin/automation", icon: Zap },
      { title: "Catégories", url: "/admin/categories", icon: Tags },
      { title: "Cat. Documents", url: "/admin/categories-documents", icon: FolderOpen },
      { title: "Paramètres", url: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "Système",
    icon: Lock,
    superadminOnly: true,
    items: [
      { title: "Rôles & Permissions", url: "/admin/roles", icon: ShieldAlert },
      { title: "Sécurité", url: "/admin/security", icon: Shield },
      { title: "Cookies RGPD", url: "/admin/cookies", icon: Cookie },
      { title: "Redirections", url: "/admin/redirects", icon: ArrowRightLeft },
    ],
  },
];

// Menu limité pour les org_managers
const orgManagerMenuCategories: MenuCategory[] = [
  {
    title: "Formations",
    icon: GraduationCap,
    items: [
      { title: "Mes formations", url: "/admin/formations", icon: FolderOpen },
      { title: "Sessions", url: "/admin/sessions", icon: Calendar },
      { title: "Formateurs", url: "/admin/formateurs", icon: UserCog },
      { title: "Clients", url: "/admin/clients", icon: Building2 },
      { title: "Facturation", url: "/admin/facturation", icon: Receipt },
      { title: "Analyse besoins", url: "/admin/analyse-besoins", icon: ClipboardList },
    ],
  },
];

// Menu limité pour les moderators
const moderatorMenuCategories: MenuCategory[] = [
  {
    title: "Contenu",
    icon: FileText,
    items: [
      { title: "Articles", url: "/admin/articles", icon: FileText },
      { title: "FAQ", url: "/admin/faq", icon: HelpCircle },
      { title: "Médias", url: "/admin/media", icon: Image },
    ],
  },
  {
    title: "Communication",
    icon: Megaphone,
    items: [
      { title: "Messages", url: "/admin/contacts", icon: MessageSquare },
      { title: "Notifications", url: "/admin/notifications", icon: Bell },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { effectiveRole } = useAuth();

  // Permissions basées sur le rôle effectif
  const effectiveIsSuperadmin = effectiveRole === "superadmin";
  const effectiveIsAdmin = effectiveRole === "admin" || effectiveRole === "superadmin";
  const effectiveIsOrgManager = effectiveRole === "org_manager";
  const effectiveIsModerator = effectiveRole === "moderator";

  // Map des badges pour chaque route (à connecter aux vraies données plus tard)
  const badgeCounts: Record<string, number> = {
    "/admin/contacts": 0,
    "/admin/sessions": 0,
  };

  // Sélectionner les menus selon le rôle effectif
  const menuCategories = useMemo(() => {
    let categories: MenuCategory[] = [];

    if (effectiveIsSuperadmin) {
      categories = allMenuCategories;
    } else if (effectiveIsAdmin) {
      categories = allMenuCategories.filter(cat => !cat.superadminOnly);
    } else if (effectiveIsOrgManager) {
      categories = orgManagerMenuCategories;
    } else if (effectiveIsModerator) {
      categories = moderatorMenuCategories;
    }

    return categories;
  }, [effectiveIsSuperadmin, effectiveIsAdmin, effectiveIsOrgManager, effectiveIsModerator]);

  // Track which categories are open - toutes ouvertes par défaut
  const [openCategories, setOpenCategories] = useState<string[]>([
    "Formations", "Contenu", "Communication", "Administration", "Système", "Développement"
  ]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const isCategoryActive = (category: MenuCategory) => {
    return category.items.some(item => isActive(item.url));
  };

  const toggleCategory = (title: string) => {
    setOpenCategories(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <Sidebar collapsible="icon" className="bg-sidebar">
      <SidebarHeader className="p-4">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">C&Co</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {/* Dashboard - Always visible */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === "/admin"}
                  tooltip="Tableau de bord"
                >
                  <Link href="/admin">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Tableau de bord</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Categorized Menu */}
        {menuCategories.map((category) => (
          <SidebarGroup key={category.title}>
            {collapsed ? (
              // When collapsed, show items directly without category wrapper
              <SidebarGroupContent>
                <SidebarMenu>
                  {category.items.map((item) => {
                    const badgeCount = badgeCounts[item.url] || 0;
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={`${item.title}${badgeCount > 0 ? ` (${badgeCount})` : ""}`}
                        >
                          <Link href={item.url} className="relative">
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                            {badgeCount > 0 && (
                              <Badge className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[9px] flex items-center justify-center bg-primary text-primary-foreground border-0">
                                {badgeCount > 9 ? "9+" : badgeCount}
                              </Badge>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            ) : (
              // When expanded, show collapsible categories
              <Collapsible
                open={openCategories.includes(category.title)}
                onOpenChange={() => toggleCategory(category.title)}
              >
                <CollapsibleTrigger asChild>
                  <SidebarGroupLabel
                    className={cn(
                      "flex items-center justify-between cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1.5 transition-colors",
                      isCategoryActive(category) && "text-primary",
                      category.superadminOnly && "text-amber-600 dark:text-amber-400"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <category.icon className="h-4 w-4" />
                      {category.title}
                      {category.superadminOnly && (
                        <Lock className="h-3 w-3 opacity-60" />
                      )}
                    </span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        openCategories.includes(category.title) && "rotate-180"
                      )}
                    />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {category.items.map((item) => {
                        const badgeCount = badgeCounts[item.url] || 0;
                        return (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(item.url)}
                            >
                              <Link href={item.url} className="pl-6 flex items-center justify-between w-full">
                                <span className="flex items-center gap-2">
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.title}</span>
                                </span>
                                {badgeCount > 0 && (
                                  <Badge className="h-5 min-w-5 px-1 text-[10px] flex items-center justify-center bg-primary text-primary-foreground border-0">
                                    {badgeCount > 99 ? "99+" : badgeCount}
                                  </Badge>
                                )}
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        );
                      })}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            )}
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
