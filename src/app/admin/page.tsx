"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatsCard, StatsCardSkeleton } from "@/components/admin/StatsCard";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { queryKeys } from "@/lib/queryKeys";
import Link from "next/link";
import {
  LayoutDashboard,
  GraduationCap,
  Calendar,
  MessageSquare,
  Users,
  FileText,
  ArrowRight,
  UserCheck,
} from "lucide-react";

// Fetch stats
async function fetchStats() {
  const supabase = createClient();

  const [formationsRes, articlesRes, contactsRes, unreadContactsRes, usersRes, sessionsRes] = await Promise.all([
    supabase.from("formations").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("blog_articles").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }).eq("read", false),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("sessions").select("id", { count: "exact", head: true }).in("status", ["planifiee", "confirmee"]),
  ]);

  return {
    formations: formationsRes.count || 0,
    articles: articlesRes.count || 0,
    contacts: contactsRes.count || 0,
    unreadContacts: unreadContactsRes.count || 0,
    users: usersRes.count || 0,
    sessions: sessionsRes.count || 0,
  };
}

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.admin.dashboard.stats(),
    queryFn: fetchStats,
    staleTime: 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <AdminPageHeader
        icon={LayoutDashboard}
        title="Tableau de bord"
        description="Bienvenue dans l'administration C&Co Formation"
      />

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4" role="list" aria-label="Statistiques">
        {statsLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Formations"
              value={stats?.formations ?? 0}
              description="Formations actives"
              icon={GraduationCap}
              href="/admin/formations"
            />
            <StatsCard
              title="Sessions"
              value={stats?.sessions ?? 0}
              description="Sessions à venir"
              icon={Calendar}
              href="/admin/sessions"
            />
            <StatsCard
              title="Utilisateurs"
              value={stats?.users ?? 0}
              description="Utilisateurs inscrits"
              icon={UserCheck}
              href="/admin/users"
            />
            <StatsCard
              title="Messages"
              value={stats?.contacts ?? 0}
              description={`${stats?.unreadContacts ?? 0} non lus`}
              icon={MessageSquare}
              href="/admin/contacts"
            />
          </>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2 min-w-0">
        {/* Sessions Widget Placeholder */}
        <Card className="lg:col-span-1 border-0 bg-secondary/30 min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 p-3 sm:p-6 sm:pb-2">
            <div>
              <CardTitle className={`flex items-center gap-2 ${adminStyles.cardTitle}`}>
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                Prochaines sessions
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Sessions planifiées avec inscriptions
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="text-xs sm:text-sm">
              <Link href="/admin/sessions">
                <span className="hidden sm:inline">Voir tout</span>
                <ArrowRight className="sm:ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-background/50">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Page Sessions en cours de développement
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="border-0 bg-secondary/30">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className={adminStyles.cardTitle}>Actions rapides</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Accès rapide aux fonctionnalités principales
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:gap-3 p-3 sm:p-6 pt-0 sm:pt-0">
            <Button asChild variant="ghost" className="justify-start text-xs sm:text-sm h-9 sm:h-10 bg-background/50 hover:bg-background">
              <Link href="/admin/formations">
                <GraduationCap className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Gérer les formations
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start text-xs sm:text-sm h-9 sm:h-10 bg-background/50 hover:bg-background">
              <Link href="/admin/sessions">
                <Calendar className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Gérer les sessions
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start text-xs sm:text-sm h-9 sm:h-10 bg-background/50 hover:bg-background">
              <Link href="/admin/articles">
                <FileText className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Gérer les articles
              </Link>
            </Button>
            <Button asChild variant="ghost" className="justify-start text-xs sm:text-sm h-9 sm:h-10 bg-background/50 hover:bg-background">
              <Link href="/admin/users">
                <Users className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Gérer les utilisateurs
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
