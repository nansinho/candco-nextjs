import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("blog_articles")
    .select("title, excerpt, featured_image")
    .eq("slug", slug)
    .single();

  if (!article) {
    return { title: "Article non trouvé" };
  }

  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt || undefined,
      images: article.featured_image ? [article.featured_image] : undefined,
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
    .eq("status", "published")
    .single();

  if (!article) {
    notFound();
  }

  // Récupérer les articles similaires
  const { data: relatedArticles } = await supabase
    .from("blog_articles")
    .select("id, title, slug, excerpt, featured_image")
    .eq("status", "published")
    .eq("category", article.category)
    .neq("id", article.id)
    .limit(3);

  return (
    <main className="min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container-custom py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
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
            <span className="text-foreground line-clamp-1">{article.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="section-padding-sm">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              {article.category && (
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {article.category}
                </span>
              )}
              {article.reading_time && (
                <span className="text-sm text-muted-foreground">
                  {article.reading_time} min de lecture
                </span>
              )}
            </div>
            <h1 className="heading-hero mb-6">{article.title}</h1>
            {article.excerpt && (
              <p className="text-body-lg text-muted-foreground">
                {article.excerpt}
              </p>
            )}
            {article.published_at && (
              <p className="text-sm text-muted-foreground mt-6">
                Publié le{" "}
                {new Date(article.published_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Image */}
      {article.featured_image && (
        <section className="pb-12">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <img
                src={article.featured_image}
                alt={article.title}
                className="w-full rounded-lg"
              />
            </div>
          </div>
        </section>
      )}

      {/* Contenu */}
      <section className="pb-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div
              className="prose prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content || "" }}
            />
          </div>
        </div>
      </section>

      {/* Articles similaires */}
      {relatedArticles && relatedArticles.length > 0 && (
        <section className="section-padding-sm bg-card">
          <div className="container-custom">
            <h2 className="heading-section text-center mb-12">
              Articles similaires
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="card-minimal-hover overflow-hidden group"
                >
                  {related.featured_image && (
                    <div className="aspect-video bg-secondary overflow-hidden">
                      <img
                        src={related.featured_image}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                      {related.title}
                    </h3>
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

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container-custom text-center text-muted-foreground">
          <p>© 2024 C&Co Formation. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
}
