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
  { icon: BookOpen, label: "Gérer les articles", description: "Blog & contenus", href: "/admin/articles", color: "#f8a991" },
  { icon: HelpCircle, label: "Gérer la FAQ", description: "Questions/réponses", href: "/admin/faq", color: "#1f628e" },
  { icon: ImageIcon, label: "Médiathèque", description: "Images & fichiers", href: "/admin/media", color: "#2D867E" },
  { icon: MessageSquare, label: "Voir les contacts", description: "Messages reçus", href: "/admin/contacts", color: "#A82424" },
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
      {/* Hero Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#163d5a] via-[#1f628e] to-[#2a7bab] shadow-lg shadow-[#1f628e]/10 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -right-10 -top-10 h-52 w-52 rounded-full bg-white/[0.05]" />
        <div className="absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-white/[0.03]" />

        <div className="flex items-start justify-between relative z-10 p-7">
          <div>
            <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-2">
              {now.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }).toUpperCase()}
            </p>
            <h1 className="text-2xl font-bold text-white">
              {getGreeting()},{" "}
              <span className="text-[#f8a991]">{displayName}</span>
            </h1>
            <p className="text-sm text-white/50 mt-2">
              Bienvenue sur votre espace d&apos;administration C&Co Formation
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-right">
            <span className="text-5xl font-black text-white leading-none">{now.getDate()}</span>
            <span className="text-white/70 text-xs uppercase tracking-wider font-medium mt-1">
              {now.toLocaleDateString("fr-FR", { month: "long" }).toUpperCase()} {now.getFullYear()}
            </span>
            <span className="text-white/40 text-xs mt-0.5">
              {now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div>
        <h2 className="text-sm font-semibold text-[#5a7a8f] mb-3">Ce mois-ci</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
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
              <StatsCard title="Articles" value={stats?.articles ?? 0} description={`${stats?.articlesPublished ?? 0} publiés`} icon={FileText} href="/admin/articles" iconColor="#1f628e" />
              <StatsCard title="FAQ" value={stats?.faq ?? 0} description="Questions/réponses" icon={HelpCircle} href="/admin/faq" iconColor="#2D867E" />
              <StatsCard title="Médias" value={stats?.media ?? 0} description="Fichiers uploadés" icon={Image} href="/admin/media" iconColor="#f59e0b" />
              <StatsCard title="Contacts" value={stats?.contacts ?? 0} description={`${stats?.contactsUnread ?? 0} non lus`} icon={Mail} href="/admin/contacts" iconColor="#A82424" />
              <StatsCard title="Redirections" value={stats?.redirects ?? 0} description="Règles actives" icon={ArrowRightLeft} href="/admin/redirects" iconColor="#8b5cf6" />
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-[#5a7a8f] mb-3">Actions rapides</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <div className="flex items-center gap-3 rounded-xl border border-[#cbd8e3]/50 bg-white p-3.5 hover:-translate-y-0.5 hover:shadow-lg hover:border-[#cbd8e3] transition-all duration-200 cursor-pointer group h-full">
                <div
                  className="h-9 w-9 shrink-0 flex items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${action.color}15` }}
                >
                  <action.icon className="h-4 w-4" style={{ color: action.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0e2438]">{action.label}</p>
                  <p className="text-xs text-[#5a7a8f]">{action.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
