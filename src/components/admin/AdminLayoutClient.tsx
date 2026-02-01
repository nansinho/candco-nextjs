"use client";

import { ReactNode, useEffect, useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminBottomNav } from "./AdminBottomNav";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AdminLayoutClientProps {
  children: ReactNode;
}

export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  const { user, loading, userRole } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Add admin-layout class to body
  useEffect(() => {
    document.body.classList.add("admin-layout");
    return () => {
      document.body.classList.remove("admin-layout");
    };
  }, []);

  // Handle redirects in useEffect to avoid infinite loop
  // NEVER call router.push during render!
  const adminRoles = ["superadmin", "admin", "org_manager", "moderator"];

  useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;

    // Redirect if not authenticated
    if (!user) {
      setIsRedirecting(true);
      router.push("/auth?redirect=/admin");
      return;
    }

    // Redirect if not admin
    if (!adminRoles.includes(userRole || "")) {
      setIsRedirecting(true);
      router.push("/");
      return;
    }
  }, [loading, user, userRole, router]);

  // Show loading state while auth is loading OR while redirecting
  if (loading || isRedirecting || !user || !adminRoles.includes(userRole || "")) {
    return (
      <div className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-zinc-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {/* Fixed position to cover root layout Header/Footer */}
      <div className="fixed inset-0 z-[100] h-screen flex w-full bg-background overflow-hidden max-w-[100vw]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 max-w-full">
          <AdminHeader />
          {/* Added pb-20 on mobile for bottom nav clearance */}
          <main className="flex-1 p-4 sm:p-6 pb-20 sm:pb-6 overflow-y-auto overflow-x-hidden min-w-0 max-w-full">
            {children}
          </main>
        </div>
        {/* Mobile bottom navigation */}
        <AdminBottomNav />
      </div>
    </SidebarProvider>
  );
}
