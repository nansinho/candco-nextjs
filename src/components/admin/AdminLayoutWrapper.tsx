"use client";

import { ReactNode } from "react";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminLayoutClient } from "./AdminLayoutClient";

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </AuthProvider>
    </QueryProvider>
  );
}
