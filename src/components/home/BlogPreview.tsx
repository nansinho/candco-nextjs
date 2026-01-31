import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

interface BlogArticle {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  image_url: string | null;
  published_at: string | null;
  category: string | null;
}

function formatDate(dateString: string | null) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function estimateReadTime(excerpt: string | null) {
  const words = (excerpt || "").split(/\s+/).length;
  const minutes = Math.max(3, Math.ceil(words / 50));
  return `${minutes} min`;
}

export default async function BlogPreview() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("blog_articles")
    .select("id, title, excerpt, slug, image_url, published_at, category")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(3);

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="section-padding border-t border-border/50">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div className="max-w-xl">
            <p className="text-sm text-muted-foreground mb-4 tracking-widest uppercase">
              Blog
            </p>
            <h2 className="heading-section">
              Dernières actualités.
            </h2>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            Tous les articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Articles grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article: BlogArticle) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug}`}
              className="group block h-full"
            >
              <article className="relative h-full bg-card rounded-2xl border border-border/50 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 flex flex-col">
                {/* Image */}
                <div className="aspect-video overflow-hidden relative bg-secondary">
                  {article.image_url ? (
                    <img
                      src={article.image_url}
                      alt={article.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl text-muted-foreground/30">📝</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
                </div>

                {/* Progress bar */}
                <div className="h-1 w-0 group-hover:w-full transition-all duration-500 bg-primary" />

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-medium group-hover:text-foreground transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <ArrowRight className="w-4 h-4 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0 mt-1 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                    {article.excerpt || "Découvrez cet article..."}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{formatDate(article.published_at)}</span>
                    <span>{estimateReadTime(article.excerpt)}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
