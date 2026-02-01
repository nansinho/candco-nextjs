import { Metadata } from "next";
import { AdminLayoutDynamic } from "@/components/admin/AdminLayoutDynamic";

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
  return <AdminLayoutDynamic>{children}</AdminLayoutDynamic>;
}
