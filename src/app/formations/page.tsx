import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Nos Formations",
  description:
    "Découvrez notre catalogue de formations professionnelles : SST, sécurité incendie, petite enfance, santé. Formations certifiantes et qualifiantes.",
};

export default async function FormationsPage() {
  const supabase = await createClient();

  // Récupérer les formations avec leurs pôles
  const { data: formations } = await supabase
    .from("formations")
    .select(`
      id,
      title,
      slug,
      description,
      duration,
      price,
      pole_id,
      poles (
        id,
        name,
        slug
      )
    `)
    .eq("is_active", true)
    .order("title");

  // Récupérer les pôles pour le filtre
  const { data: poles } = await supabase
    .from("poles")
    .select("id, name, slug, description")
    .order("name");

  // Grouper les formations par pôle
  const formationsByPole = poles?.map((pole) => ({
    ...pole,
    formations: formations?.filter((f) => f.pole_id === pole.id) || [],
  }));

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="section-padding-sm bg-gradient-to-b from-background to-card">
        <div className="container-custom text-center">
          <h1 className="heading-hero mb-4">Nos Formations</h1>
          <p className="text-body-lg max-w-2xl mx-auto">
            Découvrez notre catalogue complet de formations professionnelles
            certifiantes et qualifiantes.
          </p>
        </div>
      </section>

      {/* Filtres par pôle */}
      <section className="py-8 border-b border-border">
        <div className="container-custom">
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/formations"
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium"
            >
              Toutes
            </Link>
            {poles?.map((pole) => (
              <Link
                key={pole.id}
                href={`/formations?pole=${pole.slug}`}
                className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                {pole.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Liste des formations par pôle */}
      <section className="section-padding-sm">
        <div className="container-custom">
          {formationsByPole?.map(
            (pole) =>
              pole.formations.length > 0 && (
                <div key={pole.id} className="mb-16 last:mb-0">
                  <h2 className="heading-section mb-8">{pole.name}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pole.formations.map((formation: any) => (
                      <Link
                        key={formation.id}
                        href={`/formations/${pole.slug}/${formation.slug}`}
                        className="card-minimal-hover p-6 flex flex-col"
                      >
                        <h3 className="heading-card mb-2">{formation.title}</h3>
                        <p className="text-body line-clamp-3 flex-1 mb-4">
                          {formation.description}
                        </p>
                        <div className="flex items-center justify-between text-sm text-muted-foreground pt-4 border-t border-border">
                          {formation.duration && (
                            <span>Durée: {formation.duration}</span>
                          )}
                          {formation.price && (
                            <span className="text-primary font-medium">
                              {formation.price}€
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )
          )}

          {(!formations || formations.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucune formation disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding-sm bg-card">
        <div className="container-custom text-center">
          <h2 className="heading-section mb-4">
            Vous ne trouvez pas la formation recherchée ?
          </h2>
          <p className="text-body-lg mb-8 max-w-2xl mx-auto">
            Contactez-nous pour discuter de vos besoins spécifiques. Nous
            pouvons créer des formations sur mesure.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Nous contacter
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
