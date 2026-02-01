"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, User, Building2, Home, Sun, Moon, ChevronDown, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

// Fonction pour obtenir les initiales
function getUserInitials(data: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const { firstName, lastName, email } = data;
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (firstName) {
    return firstName.charAt(0).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return "?";
}

// Fonction pour obtenir le nom d'affichage
function getUserDisplayName(data: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const { firstName, lastName, email } = data;
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (email) {
    return email.split("@")[0];
  }
  return "Utilisateur";
}

// Fonction pour calculer le chemin parent logique
const getParentPath = (pathname: string): string | null => {
  if (pathname === "/admin" || pathname === "/admin/") {
    return null;
  }

  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 2) {
    return "/" + segments.slice(0, -1).join("/");
  }

  return "/admin";
};

// Badge de rôle
function RoleBadge({ role }: { role: string }) {
  const roleLabels: Record<string, string> = {
    superadmin: "Super Admin",
    admin: "Admin",
    org_manager: "Org. Manager",
    moderator: "Modérateur",
    formateur: "Formateur",
    client_manager: "Client Manager",
    user: "Utilisateur",
  };

  const roleColors: Record<string, string> = {
    superadmin: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    admin: "bg-destructive/10 text-destructive border-destructive/20",
    org_manager: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    moderator: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    formateur: "bg-green-500/10 text-green-600 border-green-500/20",
    client_manager: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    user: "bg-muted text-muted-foreground border-border/30",
  };

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-[10px] px-1.5 py-0.5",
        roleColors[role] || roleColors.user
      )}
    >
      {roleLabels[role] || role}
    </Badge>
  );
}

export function AdminHeader() {
  const { user, signOut, userRole, userOrganizations, currentOrganizationId, effectiveRole, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const parentPath = getParentPath(pathname);

  const currentOrganization = userOrganizations.find(
    (org) => org.organization_id === currentOrganizationId
  );

  const handleSignOut = async () => {
    await signOut();
    router.push("/auth");
  };

  const userInitials = getUserInitials({
    firstName: userProfile?.first_name,
    lastName: userProfile?.last_name,
    email: user?.email,
  });

  const userDisplayName = getUserDisplayName({
    firstName: userProfile?.first_name,
    lastName: userProfile?.last_name,
    email: user?.email,
  });

  return (
    <header
      className="h-16 bg-background border-b border-border/50 sticky z-50"
      style={{ top: 0 }}
    >
      <div className="flex h-full items-center justify-between px-3 sm:px-4">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger className="h-10 w-10 sm:h-7 sm:w-7" />

          {/* Bouton retour mobile */}
          {parentPath && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push(parentPath)}
              className="sm:hidden h-9 w-9 text-muted-foreground hover:text-foreground"
              aria-label="Retour"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}

          {/* Afficher l'organisation courante pour les org_managers */}
          {userRole === "org_manager" && currentOrganization && userOrganizations.length === 1 && (
            <Badge variant="outline" className="hidden md:flex items-center gap-1.5 border-transparent bg-muted/50">
              <Building2 className="h-3 w-3" />
              {currentOrganization.organization_name}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle Dark/Light Mode */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Changer de thème</span>
          </Button>

          {/* Retour au site */}
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>

          {/* User menu - Sidebar droite */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2.5 h-10 px-3 rounded-xl hover:bg-muted/50">
                <div className="text-right hidden md:flex flex-col items-end gap-0.5">
                  <span className="text-sm font-medium block leading-tight">{userDisplayName}</span>
                  <RoleBadge role={effectiveRole || "user"} />
                </div>
                <Avatar className="h-8 w-8 ring-2 ring-border/30">
                  <AvatarImage
                    src={userProfile?.avatar_url || undefined}
                    alt={userDisplayName}
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
              {/* Header avec infos utilisateur */}
              <SheetHeader className="p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 ring-2 ring-primary/30">
                    <AvatarImage
                      src={userProfile?.avatar_url || undefined}
                      alt={userDisplayName}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-base font-semibold truncate">
                      {userDisplayName || "Administrateur"}
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                    <RoleBadge role={effectiveRole || "user"} />
                  </div>
                </div>
              </SheetHeader>

              {/* Navigation items */}
              <div className="flex-1 overflow-y-auto py-2">
                <nav className="space-y-1 px-2">
                  <button
                    onClick={() => router.push("/mon-compte")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    Mon profil
                  </button>

                  <button
                    onClick={() => router.push("/")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center">
                      <Home className="h-4 w-4 text-muted-foreground" />
                    </div>
                    Retour au site
                  </button>
                </nav>
              </div>

              {/* Footer - Déconnexion */}
              <div className="p-4 border-t border-border/50">
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="w-full h-10 text-sm font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
