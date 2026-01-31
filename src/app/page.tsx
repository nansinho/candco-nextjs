import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function HomePage() {
  const supabase = await createClient();

  // Récupérer les formations depuis Supabase (côté serveur = SEO optimisé)
  const { data: formations, error } = await supabase
    .from("formations")
    .select("id, title, slug, description, duration, price, pole, pole_name, image_url")
    .eq("active", true)
    .order("title")
    .limit(6);

  // Récupérer les pôles uniques depuis les formations
  const { data: polesData } = await supabase
    .from("formations")
    .select("pole, pole_name")
    .eq("active", true);

  // Dédupliquer les pôles
  const polesMap = new Map();
  polesData?.forEach((f) => {
    if (f.pole && !polesMap.has(f.pole)) {
      polesMap.set(f.pole, { slug: f.pole, name: f.pole_name });
    }
  });
  const poles = Array.from(polesMap.values());

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="section-padding bg-gradient-to-b from-background to-card">
        <div className="container-custom text-center">
          <h1 className="heading-hero mb-6">
            <span className="text-primary">C&Co</span> Formation
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto mb-8">
            Votre centre de formation professionnelle certifié Qualiopi.
            Formations en Sécurité, Petite Enfance et Santé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/formations"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Voir nos formations
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>

      {/* Pôles Section */}
      {poles && poles.length > 0 && (
        <section className="section-padding-sm">
          <div className="container-custom">
            <h2 className="heading-section text-center mb-12">Nos pôles de formation</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {poles.map((pole) => (
                <Link
                  key={pole.id}
                  href={`/pole/${pole.slug}`}
                  className="card-minimal-hover p-6 text-center"
                >
                  <h3 className="heading-card mb-2">{pole.name}</h3>
                  <p className="text-body line-clamp-2">{pole.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Formations Section */}
      {formations && formations.length > 0 && (
        <section className="section-padding-sm bg-card/50">
          <div className="container-custom">
            <h2 className="heading-section text-center mb-12">Nos formations</h2>
            {error && (
              <p className="text-destructive text-center">
                Erreur lors du chargement des formations
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {formations.map((formation) => (
                <article
                  key={formation.id}
                  className="card-minimal-hover p-6 flex flex-col"
                >
                  <h3 className="heading-card mb-2">{formation.title}</h3>
                  <p className="text-body line-clamp-3 flex-1 mb-4">
                    {formation.description}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    {formation.duration && <span>{formation.duration}</span>}
                    {formation.price && <span>{formation.price}€</span>}
                  </div>
                </article>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/formations"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Voir toutes les formations
              </Link>
            </div>
          </div>
        </section>
      )}

    </main>
  );
}
