import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Actualités, conseils et informations sur la formation professionnelle. SST, sécurité, petite enfance, santé.",
};

export default async function BlogPage() {
  const supabase = await createClient();

  // Récupérer les articles publiés
  const { data: articles } = await supabase
    .from("blog_articles")
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      category,
      reading_time
    `)
    .eq("status", "published")
    .order("published_at", { ascending: false });

  // Extraire les catégories uniques
  const categories = [
    ...new Set(articles?.map((a) => a.category).filter(Boolean)),
  ];

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="section-padding-sm bg-gradient-to-b from-background to-card">
        <div className="container-custom text-center">
          <h1 className="heading-hero mb-4">Notre Blog</h1>
          <p className="text-body-lg max-w-2xl mx-auto">
            Actualités, conseils et informations sur la formation
            professionnelle.
          </p>
        </div>
      </section>

      {/* Filtres par catégorie */}
      {categories.length > 0 && (
        <section className="py-8 border-b border-border">
          <div className="container-custom">
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/blog"
                className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
              >
                Tous les articles
              </Link>
              {categories.map((category) => (
                <Link
                  key={category}
                  href={`/blog?category=${category}`}
                  className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Liste des articles */}
      <section className="section-padding-sm">
        <div className="container-custom">
          {articles && articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.slug}`}
                  className="card-minimal-hover overflow-hidden group"
                >
                  {/* Image */}
                  {article.featured_image && (
                    <div className="aspect-video bg-secondary overflow-hidden">
                      <img
                        src={article.featured_image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {!article.featured_image && (
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5" />
                  )}

                  {/* Contenu */}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {article.category && (
                        <span className="text-xs font-medium text-primary">
                          {article.category}
                        </span>
                      )}
                      {article.reading_time && (
                        <span className="text-xs text-muted-foreground">
                          {article.reading_time} min de lecture
                        </span>
                      )}
                    </div>
                    <h2 className="heading-card mb-2 group-hover:text-primary transition-colors">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-body line-clamp-3">{article.excerpt}</p>
                    )}
                    {article.published_at && (
                      <p className="text-sm text-muted-foreground mt-4">
                        {new Date(article.published_at).toLocaleDateString(
                          "fr-FR",
                          {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucun article disponible pour le moment.
              </p>
            </div>
          )}
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
