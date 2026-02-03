import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import { Info, ExternalLink, FileCode } from "lucide-react";

export const metadata: Metadata = {
  title: "Plan du site XML",
  description:
    "Fichier sitemap XML destiné aux moteurs de recherche. Liste de toutes les pages indexables du site.",
};

interface SitemapEntry {
  url: string;
  lastModified: string;
  priority: number;
  changeFrequency: string;
}

const BASE_URL = "https://candco.fr";

async function getSitemapData(): Promise<SitemapEntry[]> {
  const supabase = await createClient();
  const now = new Date().toISOString().split("T")[0];

  const entries: SitemapEntry[] = [];

  // Static pages
  const staticPages = [
    { path: "/", priority: 1.0, changeFrequency: "weekly" },
    { path: "/formations", priority: 0.9, changeFrequency: "weekly" },
    { path: "/formations/securite-prevention", priority: 0.85, changeFrequency: "weekly" },
    { path: "/formations/petite-enfance", priority: 0.85, changeFrequency: "weekly" },
    { path: "/formations/sante", priority: 0.85, changeFrequency: "weekly" },
    { path: "/a-propos", priority: 0.8, changeFrequency: "monthly" },
    { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
    { path: "/blog", priority: 0.8, changeFrequency: "weekly" },
    { path: "/pole/securite-prevention", priority: 0.8, changeFrequency: "monthly" },
    { path: "/pole/petite-enfance", priority: 0.8, changeFrequency: "monthly" },
    { path: "/pole/sante", priority: 0.8, changeFrequency: "monthly" },
    { path: "/faq", priority: 0.7, changeFrequency: "weekly" },
    { path: "/handicap", priority: 0.7, changeFrequency: "monthly" },
    { path: "/accessibilite", priority: 0.7, changeFrequency: "monthly" },
    { path: "/mon-compte", priority: 0.5, changeFrequency: "monthly" },
    { path: "/auth", priority: 0.5, changeFrequency: "monthly" },
    { path: "/s-inscrire", priority: 0.5, changeFrequency: "monthly" },
    { path: "/sitemap", priority: 0.5, changeFrequency: "weekly" },
    { path: "/mentions-legales", priority: 0.3, changeFrequency: "yearly" },
    { path: "/confidentialite", priority: 0.3, changeFrequency: "yearly" },
    { path: "/cookies", priority: 0.3, changeFrequency: "yearly" },
  ];

  staticPages.forEach((page) => {
    entries.push({
      url: `${BASE_URL}${page.path}`,
      lastModified: now,
      priority: page.priority,
      changeFrequency: page.changeFrequency,
    });
  });

  // Dynamic formations
  const { data: formations } = await supabase
    .from("formations")
    .select("slug, pole, updated_at")
    .eq("active", true);

  formations?.forEach((f) => {
    entries.push({
      url: `${BASE_URL}/formations/${f.pole}/${f.slug}`,
      lastModified: f.updated_at?.split("T")[0] || now,
      priority: 0.7,
      changeFrequency: "weekly",
    });
  });

  // Dynamic blog articles
  const { data: articles } = await supabase
    .from("blog_articles")
    .select("slug, updated_at")
    .eq("published", true);

  articles?.forEach((a) => {
    entries.push({
      url: `${BASE_URL}/blog/${a.slug}`,
      lastModified: a.updated_at?.split("T")[0] || now,
      priority: 0.6,
      changeFrequency: "monthly",
    });
  });

  // Sort by priority descending
  entries.sort((a, b) => b.priority - a.priority);

  return entries;
}

function PriorityBar({ priority }: { priority: number }) {
  const percentage = priority * 100;
  const getColor = () => {
    if (priority >= 0.8) return "bg-primary";
    if (priority >= 0.6) return "bg-amber-500";
    if (priority >= 0.4) return "bg-blue-500";
    return "bg-slate-500";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className={`h-full ${getColor()} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{priority.toFixed(1)}</span>
    </div>
  );
}

export default async function SitemapXmlPage() {
  const entries = await getSitemapData();
  const lastUpdate = new Date().toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 lg:py-20 text-center">
        <div className="container-custom">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileCode className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-semibold">C&Co Formation</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">Plan du site XML</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Ce fichier XML est un sitemap destiné aux moteurs de recherche. Il contient
            la liste de toutes les pages indexables du site.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary" />
              <strong>{entries.length}</strong> URLs
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Dernière mise à jour : <strong>{lastUpdate}</strong>
            </span>
          </div>
        </div>
      </section>

      {/* Info Banner */}
      <section className="pb-8">
        <div className="container-custom">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-3">
              <Info className="w-5 h-5 text-muted-foreground shrink-0" />
              <span className="text-sm text-muted-foreground">
                Vous cherchez le plan du site interactif ?
              </span>
            </div>
            <Link
              href="/sitemap"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              Voir le plan du site HTML
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Table Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 p-4 bg-secondary/50 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-6 lg:col-span-5">URL</div>
              <div className="col-span-3 lg:col-span-3 hidden sm:block">Dernière modification</div>
              <div className="col-span-3 lg:col-span-2">Priorité</div>
              <div className="col-span-3 lg:col-span-2 hidden lg:block">Fréquence</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {entries.map((entry, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-4 p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="col-span-6 lg:col-span-5">
                    <a
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline break-all"
                    >
                      {entry.url.replace(BASE_URL, "")}
                    </a>
                  </div>
                  <div className="col-span-3 lg:col-span-3 hidden sm:flex items-center">
                    <span className="text-sm text-muted-foreground">
                      {entry.lastModified}
                    </span>
                  </div>
                  <div className="col-span-3 lg:col-span-2 flex items-center">
                    <PriorityBar priority={entry.priority} />
                  </div>
                  <div className="col-span-3 lg:col-span-2 hidden lg:flex items-center">
                    <span className="text-xs px-2 py-1 rounded bg-secondary text-muted-foreground capitalize">
                      {entry.changeFrequency}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw XML Link */}
          <div className="mt-8 text-center">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <FileCode className="w-4 h-4" />
              Voir le fichier sitemap.xml brut
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer Navigation */}
      <section className="py-8 border-t border-border">
        <div className="container-custom">
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Accueil
            </Link>
            <Link href="/formations" className="hover:text-foreground transition-colors">
              Formations
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
            <Link href="/mentions-legales" className="hover:text-foreground transition-colors">
              Mentions légales
            </Link>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} C&Co Formation · Centre de formation professionnelle
          </p>
        </div>
      </section>
    </>
  );
}
