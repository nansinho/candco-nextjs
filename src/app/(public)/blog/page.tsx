import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import CTASectionV2 from "@/components/home/v2/CTASectionV2";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Actualités, conseils et informations sur la formation professionnelle. SST, sécurité, petite enfance, santé.",
};

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function BlogPage() {
  const supabase = await createClient();

  const { data: articles } = await supabase
    .from("blog_articles")
    .select("id, title, slug, excerpt, image_url, published_at, category, read_time")
    .eq("published", true)
    .order("published_at", { ascending: false });

  const categories = [
    ...new Set(articles?.map((a) => a.category).filter(Boolean)),
  ];

  const featured = articles?.[0];
  const rest = articles?.slice(1) || [];

  return (
    <>
      {/* ═══ 1. HERO — gradient bleu ═══ */}
      <section className="min-h-[60vh] flex items-center" style={{ background: "linear-gradient(180deg, #1a6faa 0%, #1F628E 50%, #17567d 100%)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-20 sm:pb-28 text-center">
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">Blog</span>
          </nav>
          <span className="inline-block text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "#F8A991" }}>
            Blog
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-4xl mx-auto mb-6">
            Actualités &amp; <span style={{ color: "#F8A991" }}>conseils formation</span>
          </h1>
          <p className="text-base sm:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
            Retrouvez nos articles sur la formation professionnelle, la sécurité, la petite enfance et la santé.
          </p>
        </div>
      </section>

      {/* ═══ 2. CATEGORY FILTER — sticky ═══ */}
      {categories.length > 0 && (
        <section
          className="py-5 sticky top-16 z-40"
          style={{ backgroundColor: "rgba(245,247,250,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid #e5e7eb" }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white shadow-sm"
                style={{ backgroundColor: "#1F628E" }}
              >
                Tous les articles
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/blog?category=${category}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold bg-white text-gray-500 border border-gray-200 hover:text-[#1F628E] transition-all"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ 3. ARTICLES ═══ */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles && articles.length > 0 ? (
            <>
              {/* Featured article */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="group block mb-12">
                  <article className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300">
                    {/* Image */}
                    <div className="relative aspect-[4/3] lg:aspect-auto overflow-hidden">
                      {featured.image_url ? (
                        <Image
                          src={featured.image_url}
                          alt={featured.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full min-h-[300px]" style={{ backgroundColor: "#F5F7FA" }} />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="p-8 lg:p-10 flex flex-col justify-center" style={{ backgroundColor: "#F5F7FA" }}>
                      {featured.category && (
                        <span
                          className="inline-block w-fit text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white mb-4"
                          style={{ backgroundColor: "#1F628E" }}
                        >
                          {featured.category}
                        </span>
                      )}
                      <h2 className="text-2xl sm:text-3xl font-normal tracking-tight mb-3 group-hover:text-[#1F628E] transition-colors" style={{ color: "#151F2D" }}>
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-base leading-relaxed mb-6 line-clamp-3" style={{ color: "#64748b" }}>
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-[13px] mb-4" style={{ color: "#94a3b8" }}>
                        {featured.published_at && (
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {fmtDate(featured.published_at)}
                          </span>
                        )}
                        {featured.read_time && (
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {featured.read_time} min
                          </span>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-2 text-[13px] font-bold group-hover:gap-3 transition-all" style={{ color: "#F8A991" }}>
                        Lire l&apos;article <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </article>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((article) => (
                    <Link key={article.id} href={`/blog/${article.slug}`} className="group">
                      <article
                        className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col"
                        style={{ backgroundColor: "#F5F7FA" }}
                      >
                        {/* Image */}
                        <div className="relative aspect-video overflow-hidden">
                          {article.image_url ? (
                            <Image
                              src={article.image_url}
                              alt={article.title}
                              fill
                              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full" style={{ backgroundColor: "#e2e8f0" }} />
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          {article.category && (
                            <span
                              className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white"
                              style={{ backgroundColor: "#1F628E" }}
                            >
                              {article.category}
                            </span>
                          )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-bold text-base leading-snug mb-3 line-clamp-2 group-hover:text-[#1F628E] transition-colors" style={{ color: "#151F2D" }}>
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-[13px] line-clamp-2 flex-1 mb-4" style={{ color: "#64748b" }}>
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid #e5e7eb" }}>
                            <span className="flex items-center gap-1.5 text-xs" style={{ color: "#94a3b8" }}>
                              <Calendar className="w-3 h-3" />
                              {fmtDate(article.published_at)}
                            </span>
                            {article.read_time && (
                              <span className="text-xs" style={{ color: "#94a3b8" }}>
                                {article.read_time} min
                              </span>
                            )}
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p style={{ color: "#64748b" }}>Aucun article disponible pour le moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ 4. CTA ═══ */}
      <CTASectionV2 />
    </>
  );
}
