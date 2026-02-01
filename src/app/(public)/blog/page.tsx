import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";

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
    .select("id, title, slug, excerpt, image_url, published_at, category, read_time")
    .eq("published", true)
    .order("published_at", { ascending: false });

  // Extraire les catégories uniques
  const categories = [
    ...new Set(articles?.map((a) => a.category).filter(Boolean)),
  ];

  return (
    <>
      {/* Hero */}
      <PageHero
        badge="Blog"
        title="Actualités et conseils formation."
        highlightedWord="conseils"
        description="Retrouvez nos articles sur la formation professionnelle, la sécurité, la petite enfance et la santé."
      />

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
                  {article.image_url && (
                    <div className="aspect-video bg-secondary overflow-hidden relative">
                      <Image
                        src={article.image_url}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  )}
                  {!article.image_url && (
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
                      {article.read_time && (
                        <span className="text-xs text-muted-foreground">
                          {article.read_time} min de lecture
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
    </>
  );
}
