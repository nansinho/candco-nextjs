"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatsCard, StatsCardSkeleton } from "@/components/admin/StatsCard";
import { adminStyles } from "@/components/admin/AdminDesignSystem";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Image,
  HelpCircle,
  Mail,
  ArrowRightLeft,
} from "lucide-react";

async function fetchStats() {
  const supabase = createClient();

  const [articlesRes, articlesPublishedRes, faqRes, mediaRes, contactsRes, contactsUnreadRes, redirectsRes] = await Promise.all([
    supabase.from("blog_articles").select("id", { count: "exact", head: true }),
    supabase.from("blog_articles").select("id", { count: "exact", head: true }).eq("published", true),
    supabase.from("faq_items").select("id", { count: "exact", head: true }),
    supabase.from("media").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }),
    supabase.from("contact_submissions").select("id", { count: "exact", head: true }).or("read.is.null,read.eq.false"),
    supabase.from("redirects").select("id", { count: "exact", head: true }),
  ]);

  return {
    articles: articlesRes.count || 0,
    articlesPublished: articlesPublishedRes.count || 0,
    faq: faqRes.count || 0,
    media: mediaRes.count || 0,
    contacts: contactsRes.count || 0,
    contactsUnread: contactsUnreadRes.count || 0,
    redirects: redirectsRes.count || 0,
  };
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: fetchStats,
    staleTime: 60 * 1000,
  });

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      <AdminPageHeader
        icon={LayoutDashboard}
        title="Tableau de bord"
        description="Administration du site vitrine C&Co Formation"
      />

      {/* Stats Grid */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Articles"
              value={stats?.articles ?? 0}
              description={`${stats?.articlesPublished ?? 0} publiés`}
              icon={FileText}
              href="/admin/articles"
            />
            <StatsCard
              title="FAQ"
              value={stats?.faq ?? 0}
              description="Questions/réponses"
              icon={HelpCircle}
              href="/admin/faq"
            />
            <StatsCard
              title="Médias"
              value={stats?.media ?? 0}
              description="Fichiers uploadés"
              icon={Image}
              href="/admin/media"
            />
            <StatsCard
              title="Contacts"
              value={stats?.contacts ?? 0}
              description={`${stats?.contactsUnread ?? 0} non lus`}
              icon={Mail}
              href="/admin/contacts"
            />
            <StatsCard
              title="Redirections"
              value={stats?.redirects ?? 0}
              description="Règles actives"
              icon={ArrowRightLeft}
              href="/admin/redirects"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="border-0 bg-secondary/30">
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className={adminStyles.cardTitle}>Actions rapides</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Accès rapide aux fonctionnalités du site vitrine
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:gap-3 sm:grid-cols-2 lg:grid-cols-4 p-3 sm:p-6 pt-0 sm:pt-0">
          <Button asChild variant="ghost" className="justify-start text-xs sm:text-sm h-9 sm:h-10 bg-background/50 hover:bg-background">
            <Link href="/admin/articles">
              <FileText className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Gérer les articles
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start text-xs sm:text-sm h-9 sm:h-10 bg-background/50 hover:bg-background">
            <Link href="/admin/faq">
              <HelpCircle className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Gérer la FAQ
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start text-xs sm:text-sm h-9 sm:h-10 bg-background/50 hover:bg-background">
            <Link href="/admin/media">
              <Image className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Médiathèque
            </Link>
          </Button>
          <Button asChild variant="ghost" className="justify-start text-xs sm:text-sm h-9 sm:h-10 bg-background/50 hover:bg-background">
            <Link href="/admin/contacts">
              <Mail className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Voir les contacts
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
