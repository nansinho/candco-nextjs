"use client";

import { ReactNode, useEffect } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminBottomNav } from "./AdminBottomNav";
import { SidebarProvider } from "@/components/ui/sidebar";

interface AdminLayoutClientProps {
  children: ReactNode;
}

/**
 * AdminLayoutClient - Version simplifiée
 *
 * Le middleware (middleware.ts) gère DÉJÀ :
 * - Vérification authentification (ligne 41)
 * - Redirection vers /auth si pas connecté (lignes 43-45)
 * - Vérification du rôle admin (lignes 48-53)
 * - Redirection vers / si pas admin (lignes 58-60)
 *
 * Donc ce composant n'a PAS besoin de vérifier l'auth.
 * Si on arrive ici, c'est que l'utilisateur est déjà validé.
 */
export function AdminLayoutClient({ children }: AdminLayoutClientProps) {
  useEffect(() => {
    document.body.classList.add("admin-layout");
    return () => {
      document.body.classList.remove("admin-layout");
    };
  }, []);

  return (
    <SidebarProvider>
      <div className="fixed inset-0 z-[100] h-screen flex w-full bg-background overflow-hidden max-w-[100vw]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 max-w-full">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 pb-20 sm:pb-6 overflow-y-auto overflow-x-hidden min-w-0 max-w-full">
            {children}
          </main>
        </div>
        <AdminBottomNav />
      </div>
    </SidebarProvider>
  );
}
