"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Données considérées fraîches pendant 5 minutes
            staleTime: 5 * 60 * 1000,
            // Garder en cache 30 minutes
            gcTime: 30 * 60 * 1000,
            // Priorité au cache offline
            networkMode: "offlineFirst",
            // Ne pas refetch automatiquement au focus
            refetchOnWindowFocus: false,
            // Retry 1 fois en cas d'erreur
            retry: 1,
          },
          mutations: {
            // Retry 0 fois pour les mutations
            retry: 0,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
