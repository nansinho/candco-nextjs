import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Calendar, Clock, User, Share2, ArrowLeft } from "lucide-react";
import { MarkdownContent } from "@/components/blog/MarkdownContent";
import { TableOfContents } from "@/components/blog/TableOfContents";
import { ArticleIntro } from "@/components/blog/ArticleIntro";

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

  if (!article) {
    return { title: "Article non trouvé" };
  }

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

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  // Récupérer l'article
  const { data: article } = await supabase
    .from("blog_articles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!article) {
    notFound();
  }

  // Récupérer les articles similaires
  const { data: relatedArticles } = await supabase
    .from("blog_articles")
    .select("id, title, slug, excerpt, image_url, category, read_time")
    .eq("published", true)
    .eq("category", article.category)
    .neq("id", article.id)
    .limit(3);

  const publishedDate = article.published_at
    ? new Date(article.published_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <>
      {/* Hero Section with Image Overlay */}
      <section className="relative min-h-[400px] lg:min-h-[500px]">
        {/* Background Image */}
        {article.image_url && (
          <div className="absolute inset-0">
            <Image
              src={article.image_url}
              alt={article.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
          </div>
        )}

        {/* Content */}
        <div className="relative container-custom pt-8 pb-12 flex flex-col justify-end min-h-[400px] lg:min-h-[500px]">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Accueil
            </Link>
            <span>/</span>
            <Link
              href="/blog"
              className="hover:text-foreground transition-colors"
            >
              Blog
            </Link>
            <span>/</span>
            <span className="text-foreground/70 line-clamp-1">
              {article.title}
            </span>
          </nav>

          {/* Category Badge */}
          {article.category && (
            <span className="inline-flex w-fit px-3 py-1.5 bg-primary text-primary-foreground rounded-full text-sm font-medium mb-4">
              {article.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-6 max-w-4xl">
            {article.title}
          </h1>

          {/* Meta Info Row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {article.author && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {article.author}
              </span>
            )}
            {publishedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {publishedDate}
              </span>
            )}
            {article.read_time && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.read_time} min
              </span>
            )}
            <button
              className="flex items-center gap-1.5 hover:text-primary transition-colors ml-auto"
              title="Partager"
            >
              <Share2 className="w-4 h-4" />
              Partager
            </button>
          </div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="section-padding-sm">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Content */}
            <article className="lg:col-span-8">
              {/* Introduction Box */}
              {article.excerpt && <ArticleIntro excerpt={article.excerpt} />}

              {/* Article Content */}
              <div className="prose-custom">
                <MarkdownContent content={article.content || ""} />
              </div>
            </article>

            {/* Sidebar - Table of Contents */}
            <aside className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-24">
                <div className="p-5 rounded-xl bg-card border border-border">
                  <TableOfContents content={article.content || ""} />
                </div>

                {/* Back to Blog Link */}
                <Link
                  href="/blog"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retour au blog
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Articles */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="section-padding-sm bg-card border-t border-border">
          <div className="container-custom">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Vous aimerez également</h2>
                <p className="text-sm text-muted-foreground">
                  Découvrez nos autres articles
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group block overflow-hidden rounded-xl border border-border bg-background hover:border-primary/50 transition-all"
                >
                  {related.image_url && (
                    <div className="aspect-video overflow-hidden relative">
                      <Image
                        src={related.image_url}
                        alt={related.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {related.category && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-primary text-primary-foreground rounded text-xs font-medium">
                          {related.category}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {related.title}
                    </h3>
                    {related.excerpt && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {related.excerpt}
                      </p>
                    )}
                    {related.read_time && (
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {related.read_time} min
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="section-padding-sm">
        <div className="container-custom text-center">
          <h2 className="heading-section mb-4">
            Vous souhaitez vous former ?
          </h2>
          <p className="text-body-lg mb-8 max-w-2xl mx-auto">
            Découvrez notre catalogue de formations professionnelles.
          </p>
          <Link
            href="/formations"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Voir nos formations
          </Link>
        </div>
      </section>

      {/* Back to Blog - Mobile */}
      <div className="lg:hidden container-custom pb-8">
        <Link
          href="/blog"
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-4 border-t border-border"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au blog
        </Link>
      </div>
    </>
  );
}
