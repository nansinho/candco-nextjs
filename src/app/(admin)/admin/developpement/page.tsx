"use client";

/**
 * @file page.tsx
 * @description Page principale de gestion des demandes de développement
 * Utilise un import dynamique avec ssr: false pour éviter les erreurs d'hydratation React #185
 */

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Import dynamique avec ssr: false pour éviter les erreurs d'hydratation
// causées par TanStack Query qui a un état différent serveur/client
const DevRequestsPageContent = dynamic(
  () => import("@/components/admin/dev-requests/DevRequestsPageContent"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

export default function AdminDemandesPage() {
  return <DevRequestsPageContent />;
}
