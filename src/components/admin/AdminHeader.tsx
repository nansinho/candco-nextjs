"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

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
import { LogOut, User, Home, ChevronDown, ArrowLeft, GitCommit, Search } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { roleLabels, roleColorsGradient } from "@/lib/roles";

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

// Badge de rôle - Design amélioré
function RoleBadge({ role, size = "default" }: { role: string; size?: "default" | "large" }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium shadow-sm",
        size === "large" ? "text-[11px] px-2.5 py-0.5" : "text-[10px] px-2 py-0.5",
        roleColorsGradient[role] || roleColorsGradient.user
      )}
    >
      {roleLabels[role] || role}
    </Badge>
  );
}

// Build info from environment variables
const buildId = process.env.NEXT_PUBLIC_BUILD_ID || "dev";
const buildDate = process.env.NEXT_PUBLIC_BUILD_DATE || "";

// Format build date for display
const formatBuildDate = (dateStr: string): string => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
};

export function AdminHeader() {
  const { user, signOut, userRole, effectiveRole, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const parentPath = getParentPath(pathname);
  const formattedBuildDate = formatBuildDate(buildDate);

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
      className="h-16 bg-card border-b border-border/40 sticky z-50 shadow-sm"
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

          {/* Version badge */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="hidden sm:flex items-center gap-1 text-[10px] px-1.5 py-0.5 font-mono text-muted-foreground/70 border-border/30 bg-muted/30 hover:bg-muted/50 cursor-help"
                >
                  <GitCommit className="h-2.5 w-2.5" />
                  {buildId}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                <p className="font-semibold">Version: {buildId}</p>
                {formattedBuildDate && <p className="text-muted-foreground">Build: {formattedBuildDate}</p>}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Search bar - center */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="w-full h-9 pl-10 pr-4 rounded-lg bg-muted/50 border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Retour au site */}
          <Button variant="ghost" size="icon" asChild className="h-9 w-9 text-muted-foreground hover:text-foreground">
            <Link href="/">
              <Home className="h-4 w-4" />
            </Link>
          </Button>

          {/* User menu - Carte premium */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2.5 h-auto px-2.5 py-1.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all duration-200 cursor-pointer">
                <Avatar className="h-9 w-9 ring-2 ring-[#F8A991]/30">
                  <AvatarImage
                    src={userProfile?.avatar_url || undefined}
                    alt={userDisplayName}
                  />
                  <AvatarFallback className="bg-[#0f1929] text-white text-sm font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:flex flex-col">
                  <span className="text-sm font-semibold leading-tight text-gray-900">{userDisplayName}</span>
                  <span className="text-[11px] text-gray-400">{roleLabels[effectiveRole || "user"] || effectiveRole}</span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden md:block" />
              </button>
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
                    <div className="mt-1.5">
                      <RoleBadge role={effectiveRole || "user"} size="large" />
                    </div>
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
