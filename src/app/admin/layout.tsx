import { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { AdminLayoutClient } from "@/components/admin/AdminLayoutClient";

export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s | Admin C&Co",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <AuthProvider>
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </AuthProvider>
    </QueryProvider>
  );
}
