import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar } from "lucide-react";
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

function fmtDate(d: string | null) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default async function BlogPreviewV2() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("blog_articles")
    .select("id, title, excerpt, slug, image_url, published_at, category")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(3);

  if (!articles?.length) return null;

  return (
    <section className="py-24 sm:py-28 bg-[#151F2D]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-14">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#F8A991] mb-3 block">
              Blog
            </span>
            <h2 className="text-3xl sm:text-[2.5rem] font-normal tracking-tight text-white">
              Dernières <span style={{ color: "#F8A991" }}>actualités</span>
            </h2>
          </div>
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-bold text-[#F8A991] hover:text-[#f69b80] transition-colors">
            Tous les articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {(articles as BlogArticle[]).map((a) => (
            <Link key={a.id} href={`/blog/${a.slug}`} className="group">
              <article className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                <div className="relative aspect-video overflow-hidden">
                  {a.image_url ? (
                    <Image
                      src={a.image_url}
                      alt={a.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <span className="text-2xl text-white/20">📝</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#151F2D]/50 to-transparent" />
                  {a.category && (
                    <span className="absolute top-4 left-4 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[#1F628E] text-white">
                      {a.category}
                    </span>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-bold text-base text-white leading-snug mb-3 line-clamp-2 group-hover:text-[#F8A991] transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-[13px] text-white/40 line-clamp-2 flex-1 mb-4">
                    {a.excerpt || "Découvrez cet article..."}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="flex items-center gap-1.5 text-xs text-white/30">
                      <Calendar className="w-3 h-3" />
                      {fmtDate(a.published_at)}
                    </span>
                    <span className="text-xs font-bold text-white/50 group-hover:text-[#F8A991] transition-colors flex items-center gap-1">
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
  );
}
