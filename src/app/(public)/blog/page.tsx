import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ArrowRight, Newspaper } from "lucide-react";
import CTASectionV2 from "@/components/home/v2/CTASectionV2";

export const metadata: Metadata = {
  title: "Actualités & Blog",
  description:
    "Actualités, conseils et informations sur la formation professionnelle. SST, sécurité, petite enfance, santé.",
};

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export const revalidate = 60;

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
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0F2D42 0%, #1F628E 100%)" }}>
        {/* Decorative circles */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/[0.04]" />
        <div className="absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-white/[0.03]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16 sm:pb-24 relative z-10">
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-8" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">Actualités</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#F8A991] mb-5">
              <Newspaper className="w-4 h-4" />
              Blog & Actualités
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-white mb-6">
              Nos <span className="text-[#F8A991]">actualités</span>
            </h1>
            <p className="text-base sm:text-lg leading-relaxed text-white/50 max-w-xl mx-auto">
              Conseils, réglementations et bonnes pratiques en formation professionnelle.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ CATEGORY FILTER ═══ */}
      {categories.length > 0 && (
        <section className="py-4 sticky top-16 z-40 bg-white/90 backdrop-blur-md border-b border-[#cbd8e3]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              <Link
                href="/blog"
                className="inline-flex items-center px-4 py-2 rounded-lg text-[13px] font-semibold text-white"
                style={{ backgroundColor: "#1F628E" }}
              >
                Tous
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/blog?category=${category}`}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-[13px] font-semibold text-[#5a7a8f] bg-[#e4edf3] hover:bg-[#d4e2ed] hover:text-[#0e2438] transition-all"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ ARTICLES ═══ */}
      <section className="py-16 sm:py-20" style={{ backgroundColor: "#F5F7FA" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles && articles.length > 0 ? (
            <>
              {/* Featured article */}
              {featured && (
                <Link href={`/blog/${featured.slug}`} className="group block mb-10">
                  <article className="grid lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden bg-white border border-[#cbd8e3]/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[360px] overflow-hidden">
                      {featured.image_url ? (
                        <Image
                          src={featured.image_url}
                          alt={featured.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full min-h-[300px] bg-gradient-to-br from-[#0F2D42] to-[#1F628E] flex items-center justify-center">
                          <Newspaper className="w-16 h-16 text-white/20" />
                        </div>
                      )}
                    </div>
                    <div className="p-8 lg:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        {featured.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full text-white bg-[#1F628E]">
                            {featured.category}
                          </span>
                        )}
                        {featured.read_time && (
                          <span className="text-[11px] text-[#94a3b8] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {featured.read_time} min
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0e2438] mb-3 group-hover:text-[#1F628E] transition-colors leading-tight">
                        {featured.title}
                      </h2>
                      {featured.excerpt && (
                        <p className="text-[15px] leading-relaxed text-[#5a7a8f] mb-6 line-clamp-3">
                          {featured.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-auto">
                        <span className="flex items-center gap-1.5 text-xs text-[#94a3b8]">
                          <Calendar className="w-3.5 h-3.5" />
                          {fmtDate(featured.published_at)}
                        </span>
                        <span className="inline-flex items-center gap-2 text-[13px] font-bold text-[#F8A991] group-hover:gap-3 transition-all">
                          Lire <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.map((article) => (
                    <Link key={article.id} href={`/blog/${article.slug}`} className="group">
                      <article className="rounded-xl overflow-hidden bg-white border border-[#cbd8e3]/40 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
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
                            <div className="w-full h-full bg-gradient-to-br from-[#0F2D42] to-[#1F628E] flex items-center justify-center">
                              <Newspaper className="w-10 h-10 text-white/20" />
                            </div>
                          )}
                          {article.category && (
                            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white bg-[#1F628E]/90 backdrop-blur-sm">
                              {article.category}
                            </span>
                          )}
                        </div>
                        <div className="p-5 flex flex-col flex-1">
                          <h3 className="font-bold text-[15px] leading-snug text-[#0e2438] mb-2 line-clamp-2 group-hover:text-[#1F628E] transition-colors">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-[13px] text-[#5a7a8f] line-clamp-2 flex-1 mb-4">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t border-[#e4edf3]">
                            <span className="flex items-center gap-1.5 text-[11px] text-[#94a3b8]">
                              <Calendar className="w-3 h-3" />
                              {fmtDate(article.published_at)}
                            </span>
                            <span className="text-[11px] font-semibold text-[#F8A991] flex items-center gap-1 group-hover:gap-2 transition-all">
                              Lire <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-[#e4edf3] flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-7 h-7 text-[#5a7a8f]" />
              </div>
              <p className="text-[#5a7a8f] text-lg font-medium">Aucun article pour le moment</p>
              <p className="text-[#94a3b8] text-sm mt-1">Revenez bientôt pour découvrir nos actualités.</p>
            </div>
          )}
        </div>
      </section>

      <CTASectionV2 />
    </>
  );
}
