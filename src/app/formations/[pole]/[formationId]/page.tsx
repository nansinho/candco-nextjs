import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ pole: string; formationId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { formationId } = await params;
  const supabase = await createClient();

  const { data: formation } = await supabase
    .from("formations")
    .select("title, description, meta_title, meta_description")
    .eq("slug", formationId)
    .single();

  if (!formation) {
    return { title: "Formation non trouvée" };
  }

  return {
    title: formation.meta_title || formation.title,
    description: formation.meta_description || formation.description,
  };
}

export default async function FormationDetailPage({ params }: Props) {
  const { pole, formationId } = await params;
  const supabase = await createClient();

  // Récupérer la formation
  const { data: formation } = await supabase
    .from("formations")
    .select("*")
    .eq("slug", formationId)
    .single();

  if (!formation) {
    notFound();
  }

  // Récupérer les prochaines sessions
  const { data: sessions } = await supabase
    .from("sessions")
    .select("*")
    .eq("formation_id", formation.id)
    .gte("start_date", new Date().toISOString())
    .order("start_date")
    .limit(5);

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
              href="/formations"
              className="hover:text-foreground transition-colors"
            >
              Formations
            </Link>
            <span>/</span>
            <span className="text-foreground">{formation.title}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="section-padding-sm bg-gradient-to-b from-background to-card">
        <div className="container-custom">
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                {formation.pole_name}
              </span>
              {formation.certification && (
                <span className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                  {formation.certification}
                </span>
              )}
            </div>
            <h1 className="heading-hero mb-6">{formation.title}</h1>
            {formation.subtitle && (
              <p className="text-xl text-muted-foreground mb-4">{formation.subtitle}</p>
            )}
            <p className="text-body-lg">{formation.description}</p>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="section-padding-sm">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Colonne principale */}
            <div className="lg:col-span-2 space-y-12">
              {/* Objectifs généraux */}
              {formation.objectifs_generaux && Array.isArray(formation.objectifs_generaux) && formation.objectifs_generaux.length > 0 && (
                <div>
                  <h2 className="heading-card mb-4">Objectifs de la formation</h2>
                  <ul className="space-y-2">
                    {formation.objectifs_generaux.map((obj: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-body">
                        <span className="text-primary mt-1">✓</span>
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Programme */}
              {formation.programme && Array.isArray(formation.programme) && formation.programme.length > 0 && (
                <div>
                  <h2 className="heading-card mb-4">Programme</h2>
                  <div className="space-y-4">
                    {formation.programme.map((item: any, i: number) => (
                      <div key={i} className="p-4 bg-card rounded-lg border border-border">
                        <h3 className="font-medium mb-2">{item.title || item}</h3>
                        {item.content && <p className="text-muted-foreground text-sm">{item.content}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Prérequis */}
              {formation.prerequis && Array.isArray(formation.prerequis) && formation.prerequis.length > 0 && (
                <div>
                  <h2 className="heading-card mb-4">Prérequis</h2>
                  <ul className="space-y-2">
                    {formation.prerequis.map((prereq: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-body">
                        <span className="text-muted-foreground">•</span>
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Public visé */}
              {formation.public_vise && Array.isArray(formation.public_vise) && formation.public_vise.length > 0 && (
                <div>
                  <h2 className="heading-card mb-4">Public concerné</h2>
                  <ul className="space-y-2">
                    {formation.public_vise.map((pub: string, i: number) => (
                      <li key={i} className="flex items-start gap-3 text-body">
                        <span className="text-muted-foreground">•</span>
                        {pub}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="card-minimal p-6 sticky top-8">
                <h3 className="heading-card mb-6">Informations pratiques</h3>

                <div className="space-y-4 mb-8">
                  {formation.duration && (
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground">Durée</span>
                      <span className="font-medium">{formation.duration}</span>
                    </div>
                  )}
                  {formation.price && (
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground">Tarif</span>
                      <span className="font-medium text-primary">
                        {formation.price}
                      </span>
                    </div>
                  )}
                  {formation.nombre_participants && (
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground">Participants</span>
                      <span className="font-medium">{formation.nombre_participants}</span>
                    </div>
                  )}
                  {formation.format_lieu && (
                    <div className="flex justify-between items-center py-3 border-b border-border">
                      <span className="text-muted-foreground">Lieu</span>
                      <span className="font-medium">{formation.format_lieu}</span>
                    </div>
                  )}
                </div>

                {/* Prochaines sessions */}
                {sessions && sessions.length > 0 && (
                  <div className="mb-8">
                    <h4 className="font-medium mb-4">Prochaines sessions</h4>
                    <div className="space-y-2">
                      {sessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          className="p-3 bg-secondary/50 rounded-lg text-sm"
                        >
                          {new Date(session.start_date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {session.location && (
                            <span className="text-muted-foreground ml-2">
                              - {session.location}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href="/contact"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
                >
                  Demander un devis
                </Link>
              </div>
            </div>
          </div>
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
