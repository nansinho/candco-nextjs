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
import { LogOut, User, Home, ChevronDown, Search, Bell } from "lucide-react";
import { roleLabels } from "@/lib/roles";

function getUserInitials(data: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const { firstName, lastName, email } = data;
  if (firstName && lastName) return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  if (firstName) return firstName.charAt(0).toUpperCase();
  if (email) return email.charAt(0).toUpperCase();
  return "?";
}

function getUserDisplayName(data: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}): string {
  const { firstName, lastName, email } = data;
  if (firstName && lastName) return `${firstName} ${lastName}`;
  if (firstName) return firstName;
  if (email) return email.split("@")[0];
  return "Utilisateur";
}

export function AdminHeader() {
  const { user, signOut, effectiveRole, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

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

  // Breadcrumb: extract current page title from path
  const segments = pathname.split("/").filter(Boolean);
  const currentPage = segments.length > 1 ? segments[segments.length - 1] : "Tableau de bord";
  const pageTitle = currentPage === "admin" ? "Tableau de bord" : currentPage.charAt(0).toUpperCase() + currentPage.slice(1);

  return (
    <header className="h-14 bg-white border-b border-[#eaeff4] sticky z-50" style={{ top: 0 }}>
      <div className="flex h-full items-center px-4 sm:px-5 lg:px-6">
        {/* Left — Breadcrumb */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="h-7 w-7 sm:hidden" />
          <Link
            href="/admin"
            className="h-7 w-7 rounded-md flex items-center justify-center text-[#94a3b8] hover:text-[#3d5a6e] hover:bg-[#f2f5f8] transition-colors"
          >
            <Home className="h-4 w-4" />
          </Link>
          <span className="text-[#94a3b8] text-sm">&gt;</span>
          <span className="text-sm font-medium text-[#2c3e50]">{pageTitle}</span>
        </div>

        {/* Center — Search */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#94a3b8]" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="h-[34px] w-[260px] lg:w-[300px] rounded-lg border border-[#dce3ea] bg-[#f7f9fb] px-3 pl-9 text-[13px] text-[#2c3e50] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#bfccd8] focus:shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-[#bfccd8] transition-all"
            />
            <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#94a3b8] bg-white border border-[#dce3ea] rounded px-1.5 py-0.5 font-mono">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Notifications */}
          <button className="h-10 w-10 rounded-lg flex items-center justify-center text-[#5A7A8F] hover:text-[#0E2438] hover:bg-[#E4EDF3] transition-colors">
            <Bell className="h-[18px] w-[18px]" />
          </button>

          {/* Separator */}
          <div className="w-px h-6 bg-[#e8edf2] mx-1.5 hidden sm:block" />

          {/* User menu */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 h-9 rounded-lg pl-1 pr-2 hover:bg-[#f2f5f8] transition-colors cursor-pointer">
                <div className="h-7 w-7 rounded-md overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#0f2d42] to-[#1a5276]">
                  <span className="text-[11px] font-bold text-white">{userInitials}</span>
                </div>
                <span className="text-[13px] font-medium text-[#2c3e50] hidden sm:block">{userDisplayName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-[#94a3b8] hidden sm:block" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 flex flex-col">
              <SheetHeader className="p-4 bg-gradient-to-br from-[#1f628e]/10 via-[#1f628e]/5 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#0f2d42] to-[#1a5276]">
                    <span className="text-sm font-bold text-white">{userInitials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <SheetTitle className="text-base font-semibold truncate">
                      {userDisplayName}
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                    <p className="text-[11px] text-[#1f628e] font-medium mt-1">
                      {roleLabels[effectiveRole || "user"] || effectiveRole}
                    </p>
                  </div>
                </div>
              </SheetHeader>
              <div className="flex-1 overflow-y-auto py-2">
                <nav className="space-y-1 px-2">
                  <button
                    onClick={() => router.push("/mon-compte")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-[#e4edf3] transition-colors"
                  >
                    <User className="h-4 w-4 text-[#5a7a8f]" />
                    Mon profil
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-[#e4edf3] transition-colors"
                  >
                    <Home className="h-4 w-4 text-[#5a7a8f]" />
                    Retour au site
                  </button>
                </nav>
              </div>
              <div className="p-4 border-t border-[#eaeff4]">
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
