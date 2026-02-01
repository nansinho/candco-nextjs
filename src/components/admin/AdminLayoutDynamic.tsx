"use client";

/**
 * @file AdminLayoutDynamic.tsx
 * @description Composant client qui charge le layout admin dynamiquement
 * Utilise ssr: false pour éviter les erreurs d'hydratation
 */

import { ReactNode } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Charger le wrapper admin dynamiquement avec ssr: false
// Cela évite TOUTES les erreurs d'hydratation car aucun code admin ne s'exécute côté serveur
const AdminLayoutWrapper = dynamic(
  () => import("./AdminLayoutWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-sm text-zinc-400">Chargement...</p>
        </div>
      </div>
    ),
  }
);

interface AdminLayoutDynamicProps {
  children: ReactNode;
}

export function AdminLayoutDynamic({ children }: AdminLayoutDynamicProps) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
