"use client";

/**
 * @file AdminLayoutWrapper.tsx
 * @description Wrapper client-only pour le layout admin
 * Ce composant contient tous les providers et le layout client
 * Il est chargé dynamiquement avec ssr: false pour éviter les erreurs d'hydratation
 */

import { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AdminLayoutClient } from "./AdminLayoutClient";

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <AdminLayoutClient>{children}</AdminLayoutClient>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
