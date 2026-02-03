import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import {
  Home,
  BookOpen,
  Building2,
  FileText,
  User,
  Scale,
  Shield,
  Baby,
  HeartPulse,
  Search,
  Map,
  ExternalLink,
  Bot,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Plan du site",
  description:
    "Retrouvez facilement toutes les pages de notre site. Navigation rapide vers nos formations, articles et informations pratiques.",
};

const staticPages = {
  accueil: [
    { name: "Page d'accueil", href: "/" },
  ],
  formations: [
    { name: "Toutes les formations", href: "/formations" },
  ],
  entreprise: [
    { name: "À propos de C&Co", href: "/a-propos" },
    { name: "Handicap & Inclusion", href: "/handicap" },
    { name: "Accessibilité", href: "/accessibilite" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ],
  blog: [
    { name: "Tous les articles", href: "/blog" },
  ],
  espace: [
    { name: "Connexion / Inscription", href: "/auth" },
    { name: "Mon compte", href: "/mon-compte" },
  ],
  legal: [
    { name: "Mentions légales", href: "/mentions-legales" },
    { name: "Politique de confidentialité", href: "/confidentialite" },
    { name: "Déclaration d'accessibilité", href: "/accessibilite" },
  ],
};

const poleConfig = [
  {
    id: "securite-prevention",
    name: "Sécurité Prévention",
    icon: Shield,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    id: "petite-enfance",
    name: "Petite Enfance",
    icon: Baby,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
  },
  {
    id: "sante",
    name: "Santé",
    icon: HeartPulse,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
  },
];

export default async function SitemapPage() {
  const supabase = await createClient();

  // Fetch formations grouped by pole
  const { data: formations } = await supabase
    .from("formations")
    .select("id, title, slug, pole")
    .eq("active", true)
    .order("title");

  // Fetch blog articles
  const { data: articles } = await supabase
    .from("blog_articles")
    .select("id, title, slug")
    .eq("published", true)
    .order("title");

  // Group formations by pole
  const formationsByPole: Record<string, typeof formations> = {};
  formations?.forEach((f) => {
    if (!formationsByPole[f.pole]) {
      formationsByPole[f.pole] = [];
    }
    formationsByPole[f.pole]?.push(f);
  });

  const totalFormations = formations?.length || 0;
  const totalArticles = articles?.length || 0;

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="container-custom relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <Link href="/" className="hover:text-foreground transition-colors">
                  Accueil
                </Link>
                <span>/</span>
                <span className="text-foreground">Plan du site</span>
              </nav>
              <p className="text-sm font-medium text-primary uppercase tracking-wider mb-2">
                Navigation
              </p>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">Plan du site.</h1>
              <p className="text-lg text-muted-foreground">
                Retrouvez facilement toutes vos pages de notre site. Navigation
                rapide vers nos formations, articles et informations pratiques.
              </p>
              <div className="flex flex-wrap gap-4 mt-6 text-sm">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary" />
                  <strong>{totalFormations}</strong> formations
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <strong>{totalArticles}</strong> articles
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <strong>6</strong> sections
                </span>
              </div>
            </div>
            <div className="hidden lg:flex w-32 h-32 rounded-2xl bg-primary/10 items-center justify-center">
              <Map className="w-16 h-16 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Search Hint */}
      <section className="pb-8">
        <div className="container-custom">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <Search className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">
              Rechercher une page, une formation, un article...
            </span>
            <kbd className="ml-auto hidden sm:inline-flex h-6 items-center gap-1 rounded border border-border bg-secondary px-2 font-mono text-xs text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </section>

      {/* All Pages Section */}
      <section className="section-padding bg-card border-y border-border">
        <div className="container-custom">
          <div className="mb-12">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Toutes nos pages
            </p>
            <h2 className="text-2xl lg:text-3xl font-semibold">
              Explorez l'ensemble du site.
            </h2>
            <p className="text-muted-foreground mt-2">
              Naviguez facilement à travers nos différentes sections : formations
              professionnelles, articles de blog, informations pratiques et bien plus
              encore.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Accueil */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Home className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold">Accueil</h3>
              </div>
              <ul className="space-y-2">
                {staticPages.accueil.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Formations */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="font-semibold">Formations</h3>
              </div>
              <ul className="space-y-2">
                {staticPages.formations.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Entreprise */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="font-semibold">Entreprise</h3>
              </div>
              <ul className="space-y-2">
                {staticPages.entreprise.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Blog */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-500" />
                </div>
                <h3 className="font-semibold">Blog</h3>
              </div>
              <ul className="space-y-2 max-h-64 overflow-y-auto pr-2">
                {staticPages.blog.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
                {articles?.map((article) => (
                  <li key={article.id}>
                    <Link
                      href={`/blog/${article.slug}`}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Espace Personnel */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-cyan-500" />
                </div>
                <h3 className="font-semibold">Espace Personnel</h3>
              </div>
              <ul className="space-y-2">
                {staticPages.espace.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                  <Scale className="w-5 h-5 text-slate-500" />
                </div>
                <h3 className="font-semibold">Informations Légales</h3>
              </div>
              <ul className="space-y-2">
                {staticPages.legal.map((page) => (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {page.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Formations by Pole Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="mb-12">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Nos pôles de formation
            </p>
            <h2 className="text-2xl lg:text-3xl font-semibold">
              Formations par domaine.
            </h2>
            <p className="text-muted-foreground mt-2">
              Découvrez l'ensemble de nos formations organisées par pôle d'expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {poleConfig.map((pole) => {
              const Icon = pole.icon;
              const poleFormations = formationsByPole[pole.id] || [];
              return (
                <div key={pole.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg ${pole.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${pole.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{pole.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {poleFormations.length} formations
                      </p>
                    </div>
                  </div>
                  <ul className="space-y-2 max-h-80 overflow-y-auto pr-2">
                    {poleFormations.map((formation) => (
                      <li key={formation.id}>
                        <Link
                          href={`/formations/${formation.pole}/${formation.slug || formation.id}`}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors line-clamp-1"
                        >
                          {formation.title}
                        </Link>
                      </li>
                    ))}
                    {poleFormations.length === 0 && (
                      <li className="text-sm text-muted-foreground italic">
                        Aucune formation disponible
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* XML Sitemap Link */}
      <section className="py-12 bg-card border-t border-border">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bot className="w-5 h-5" />
              <span>Vous êtes un robot ou un moteur de recherche ?</span>
            </div>
            <Link
              href="/plan-du-site/xml"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              Consultez notre sitemap XML
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
