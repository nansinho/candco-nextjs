import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
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
      <PageHero
        badge="Catalogue de formations"
        title="Trouvez la formation qui vous correspond."
        highlightedWord="formation"
        description="Plus de 50 formations certifiantes dans les domaines de la Sécurité, de la Petite Enfance et de la Santé."
      />

      {/* Client Component with Filters */}
      <FormationsClient
        formations={formations || []}
        categories={categories || []}
        sessionCounts={sessionCounts}
      />
    </>
  );
}
