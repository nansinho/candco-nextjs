"use client";

/**
 * @file AdminBottomNav.tsx
 * @description Mobile bottom navigation bar for admin section (iOS Safari optimized)
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Building2, GraduationCap, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

const navItems = [
  { path: "/admin", icon: LayoutDashboard, label: "Accueil", exact: true },
  { path: "/admin/sessions", icon: CalendarDays, label: "Sessions", exact: false },
  { path: "/admin/clients", icon: Building2, label: "Clients", exact: false },
  { path: "/admin/formateurs", icon: GraduationCap, label: "Formateurs", exact: false },
];

export function AdminBottomNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const isActive = (path: string, exact: boolean) => {
    if (exact) {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid grid-cols-5 h-14">
        {navItems.map((item) => {
          const active = isActive(item.path, item.exact);
          return (
            <Link
              key={item.path}
              href={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors",
                active
                  ? "text-primary"
                  : "text-muted-foreground active:text-foreground"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "text-primary")} />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}

        {/* Menu button to open sidebar */}
        <button
          onClick={() => setOpenMobile(true)}
          className="flex flex-col items-center justify-center gap-0.5 text-muted-foreground active:text-foreground transition-colors"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium leading-none">Menu</span>
        </button>
      </div>
    </nav>
  );
}
