import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import FormationsClient from "./FormationsClient";

export const metadata: Metadata = {
  title: "Nos Formations Professionnelles | Catalogue Complet",
  description:
    "Découvrez notre catalogue de formations professionnelles certifiantes : SST, sécurité incendie, petite enfance (CAP AEPE), santé. Formations éligibles OPCO et financement entreprise.",
  keywords: [
    "formation professionnelle",
    "formation SST",
    "formation sécurité",
    "formation petite enfance",
    "CAP AEPE",
    "formation santé",
    "AFGSU",
    "formation certifiante",
    "Qualiopi",
    "OPCO",
  ],
  openGraph: {
    title: "Catalogue de Formations | C&Co Formation",
    description:
      "+100 formations professionnelles certifiantes. Sécurité, Petite Enfance, Santé. Financement OPCO.",
    images: [
      {
        url: "/og-formations.jpg",
        width: 1200,
        height: 630,
        alt: "Catalogue de formations C&Co Formation",
      },
    ],
  },
};

export default async function FormationsPage() {
  const supabase = await createClient();

  // Fetch formations with all needed fields
  const { data: formations } = await supabase
    .from("formations")
    .select(
      "id, title, subtitle, description, pole, pole_name, duration, price, image_url, popular, active, category_id, slug"
    )
    .eq("active", true)
    .order("title");

  // Fetch categories
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug, pole_id")
    .order("name");

  // Fetch active sessions with inscription counts
  const { data: sessionsData } = await supabase
    .from("sessions")
    .select(
      `
      id,
      formation_id,
      start_date,
      max_participants,
      inscriptions:inscriptions(count)
    `
    )
    .eq("is_public", true)
    .in("status", ["planifiee", "confirmee"])
    .gte("start_date", new Date().toISOString().split("T")[0]);

  // Process session counts
  const sessionCounts: Record<
    string,
    {
      formation_id: string;
      count: number;
      next_session_date: string | null;
      total_places: number;
    }
  > = {};

  if (sessionsData) {
    sessionsData.forEach((session: any) => {
      const formationId = session.formation_id;
      const inscriptionCount =
        session.inscriptions?.[0]?.count || session.inscriptions?.length || 0;
      const availablePlaces = Math.max(
        0,
        (session.max_participants || 0) - inscriptionCount
      );

      if (!sessionCounts[formationId]) {
        sessionCounts[formationId] = {
          formation_id: formationId,
          count: 0,
          next_session_date: null,
          total_places: 0,
        };
      }

      sessionCounts[formationId].count += 1;
      sessionCounts[formationId].total_places += availablePlaces;

      // Track the earliest session date
      if (
        !sessionCounts[formationId].next_session_date ||
        session.start_date < sessionCounts[formationId].next_session_date
      ) {
        sessionCounts[formationId].next_session_date = session.start_date;
      }
    });
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

        <div className="container-custom relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm uppercase tracking-widest text-primary font-medium mb-4">
              Catalogue de formations
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight mb-6">
              Développez vos{" "}
              <span className="text-primary font-normal">compétences</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Découvrez notre catalogue complet de formations professionnelles
              certifiantes. Sécurité, Petite Enfance, Santé — trouvez la
              formation qui correspond à vos objectifs.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 mt-10">
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-light text-primary">
                  {formations?.length || 0}+
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Formations
                </p>
              </div>
              <div className="w-px h-8 bg-border hidden md:block" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-light text-primary">
                  3
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Pôles
                </p>
              </div>
              <div className="w-px h-8 bg-border hidden md:block" />
              <div className="text-center">
                <p className="text-2xl md:text-3xl font-light text-primary">
                  98%
                </p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">
                  Réussite
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Client Component with Filters */}
      <FormationsClient
        formations={formations || []}
        categories={categories || []}
        sessionCounts={sessionCounts}
      />
    </>
  );
}
