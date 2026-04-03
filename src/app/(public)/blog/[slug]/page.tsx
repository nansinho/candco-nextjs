import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, Share2, ArrowLeft, ArrowRight } from "lucide-react";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ArticleIntro } from "@/components/blog/ArticleIntro";
import CTASectionV2 from "@/components/home/v2/CTASectionV2";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase
    .from("blog_articles")
    .select("title, excerpt, image_url, meta_title, meta_description")
    .eq("slug", slug)
    .single();

  if (!article) return { title: "Article non trouvé" };

  return {
    title: article.meta_title || article.title,
    description: article.meta_description || article.excerpt,
    openGraph: {
      title: article.meta_title || article.title,
      description: article.meta_description || article.excerpt || undefined,
      images: article.image_url ? [article.image_url] : undefined,
    },
  };
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!article) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  const { data: relatedArticles } = await supabase
    .from("blog_articles")
    .select("id, title, slug, excerpt, image_url, category, read_time, published_at")
    .eq("published", true)
    .eq("category", article.category)
    .neq("id", article.id)
    .limit(3);

  const publishedDate = fmtDate(article.published_at);

  // JSON-LD
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || article.meta_description || "",
    image: article.image_url || "https://candco.fr/og-image.jpg",
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at || article.created_at,
    author: { "@type": "Organization", name: article.author || "C&Co Formation", url: "https://candco.fr" },
    publisher: { "@type": "Organization", name: "C&Co Formation", logo: { "@type": "ImageObject", url: "https://candco.fr/logo.svg" } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://candco.fr/blog/${slug}` },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://candco.fr" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://candco.fr/blog" },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://candco.fr/blog/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ═══ 1. HERO — image overlay ═══ */}
      <section className="relative min-h-[450px] lg:min-h-[550px]">
        {article.image_url && (
          <div className="absolute inset-0">
            <Image src={article.image_url} alt={article.title} fill sizes="100vw" className="object-cover" priority />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0F2D42 0%, rgba(15,45,66,0.8) 50%, rgba(15,45,66,0.3) 100%)" }} />
          </div>
        )}
        {!article.image_url && <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0F2D42 0%, #1F628E 100%)" }} />}

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 flex flex-col justify-end min-h-[450px] lg:min-h-[550px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <span style={{ color: "rgba(255,255,255,0.3)" }}>/</span>
            <span className="line-clamp-1" style={{ color: "rgba(255,255,255,0.7)" }}>{article.title}</span>
          </nav>

          {/* Category */}
          {article.category && (
            <span
              className="inline-flex w-fit px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-white mb-4"
              style={{ backgroundColor: "#1F628E" }}
            >
              {article.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-[3rem] font-semibold text-white leading-[1.1] mb-6 max-w-4xl tracking-tight">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-5 text-[13px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            {article.author && (
              <span className="flex items-center gap-1.5"><User className="w-4 h-4" />{article.author}</span>
            )}
            {publishedDate && (
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{publishedDate}</span>
            )}
            {article.read_time && (
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{article.read_time} min</span>
            )}
            <button className="flex items-center gap-1.5 hover:text-[#F8A991] transition-colors ml-auto" title="Partager">
              <Share2 className="w-4 h-4" /> Partager
            </button>
          </div>
        </div>
      </section>

      {/* ═══ 2. CONTENT + SIDEBAR ═══ */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "#F5F7FA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14">
            {/* Main */}
            <article className="lg:col-span-8">
              {article.excerpt && <ArticleIntro excerpt={article.excerpt} />}
              <div className="prose-custom">
                <MarkdownContent content={article.content || ""} />
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-24">
                <div className="p-6 rounded-2xl border border-[#cbd8e3]/50 bg-white shadow-sm">
                  <TableOfContents content={article.content || ""} />
                </div>
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-[13px] hover:text-[#1F628E] transition-colors mt-6"
                  style={{ color: "#94a3b8" }}
                >
                  <ArrowLeft className="w-4 h-4" /> Retour au blog
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ═══ 3. RELATED ARTICLES — dark ═══ */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="py-20 sm:py-24" style={{ backgroundColor: "#0F2D42" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>
                  À lire aussi
                </span>
                <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white leading-[1.15]">
                  Vous aimerez <span style={{ color: "#F8A991" }}>également</span>
                </h2>
              </div>
              <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold transition-colors hover:text-[#f69b80]" style={{ color: "#F8A991" }}>
                Tous les articles <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="group">
                  <article className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden">
                      {related.image_url ? (
                        <Image
                          src={related.image_url}
                          alt={related.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F2D42]/50 to-transparent" />
                      {related.category && (
                        <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white" style={{ backgroundColor: "#1F628E" }}>
                          {related.category}
                        </span>
                      )}
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="font-bold text-base text-white leading-snug mb-3 line-clamp-2 group-hover:text-[#F8A991] transition-colors">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-[13px] line-clamp-2 flex-1 mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                          {related.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <span className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                          <Calendar className="w-3 h-3" />
                          {fmtDate(related.published_at)}
                        </span>
                        <span className="text-xs font-bold group-hover:text-[#F8A991] transition-colors flex items-center gap-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                          Lire <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 4. CTA ═══ */}
      <CTASectionV2 />

      {/* ═══ 5. BACK — mobile ═══ */}
      <div className="lg:hidden py-6" style={{ backgroundColor: "#0F2D42" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="flex items-center justify-center gap-2 text-[13px] transition-colors py-4 hover:text-[#F8A991]"
            style={{ color: "rgba(255,255,255,0.5)", borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <ArrowLeft className="w-4 h-4" /> Retour au blog
          </Link>
        </div>
      </div>
    </>
  );
}
