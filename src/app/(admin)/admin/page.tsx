"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatsCard, StatsCardSkeleton } from "@/components/admin/StatsCard";
import Link from "next/link";
import {
  FileText,
  Image,
  HelpCircle,
  Mail,
  ArrowRightLeft,
  Sparkles,
  BookOpen,
  MessageSquare,
  ImageIcon,
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

const quickActions = [
  { icon: BookOpen, label: "Gérer les articles", description: "Blog & contenus", href: "/admin/articles", color: "#F8A991", bg: "#FFF5F2" },
  { icon: HelpCircle, label: "Gérer la FAQ", description: "Questions/réponses", href: "/admin/faq", color: "#507395", bg: "#EEF3F8" },
  { icon: ImageIcon, label: "Médiathèque", description: "Images & fichiers", href: "/admin/media", color: "#2D867E", bg: "#EEFAF8" },
  { icon: MessageSquare, label: "Voir les contacts", description: "Messages reçus", href: "/admin/contacts", color: "#A82424", bg: "#FEF0F0" },
];

export default function AdminDashboard() {
  const { userProfile, user } = useAuth();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: fetchStats,
    staleTime: 60 * 1000,
  });

  const now = new Date();
  const displayName = userProfile?.first_name
    ? `${userProfile.first_name} ${userProfile.last_name || ""}`.trim()
    : user?.email?.split("@")[0] || "Admin";

  return (
    <div className="space-y-6 min-w-0">
      {/* Welcome Banner */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 sm:p-8"
        style={{
          background: "linear-gradient(135deg, #0F2D42 0%, #1F628E 100%)",
        }}
      >
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/50 font-medium mb-1">
              {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              {getGreeting()},{" "}
              <span style={{ color: "#F8A991" }}>{displayName}</span>
            </h1>
            <p className="text-sm text-white/60 mt-2">
              Bienvenue sur votre espace d&apos;administration C&Co Formation
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-center text-white/80">
            <span className="text-4xl font-bold">{now.getDate()}</span>
            <span className="text-xs uppercase tracking-wider">
              {now.toLocaleDateString("fr-FR", { month: "long" })} {now.getFullYear()}
            </span>
            <span className="text-xs text-white/40 mt-1">
              {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <Sparkles className="w-full h-full" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {isLoading ? (
          <>
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
              iconColor="#F8A991"
              iconBg="#FFF5F2"
            />
            <StatsCard
              title="FAQ"
              value={stats?.faq ?? 0}
              description="Questions/réponses"
              icon={HelpCircle}
              href="/admin/faq"
              iconColor="#507395"
              iconBg="#EEF3F8"
            />
            <StatsCard
              title="Médias"
              value={stats?.media ?? 0}
              description="Fichiers uploadés"
              icon={Image}
              href="/admin/media"
              iconColor="#2D867E"
              iconBg="#EEFAF8"
            />
            <StatsCard
              title="Contacts"
              value={stats?.contacts ?? 0}
              description={`${stats?.contactsUnread ?? 0} non lus`}
              icon={Mail}
              href="/admin/contacts"
              iconColor="#A82424"
              iconBg="#FEF0F0"
            />
            <StatsCard
              title="Redirections"
              value={stats?.redirects ?? 0}
              description="Règles actives"
              icon={ArrowRightLeft}
              href="/admin/redirects"
              iconColor="#1F628E"
              iconBg="#EDF2F9"
            />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Actions rapides</h2>
        <p className="text-sm text-gray-500 mb-4">Accès rapide aux fonctionnalités du site vitrine</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer group p-4 flex items-center gap-4">
                <div
                  className="h-12 w-12 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: action.bg }}
                >
                  <action.icon className="h-5 w-5" style={{ color: action.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{action.label}</p>
                  <p className="text-xs text-gray-400">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
