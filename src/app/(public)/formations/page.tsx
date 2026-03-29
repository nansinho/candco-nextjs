import { createServiceClient, ORG_ID } from "@/lib/supabase/service";
import { getPoleFromDomaine } from "@/lib/domaines";
import { Metadata } from "next";
import Link from "next/link";
import { Shield, Baby, HeartPulse, CheckCircle, Award, Users, Star } from "lucide-react";
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


// Revalidate every 60 seconds
export const dynamic = "force-dynamic";

export default async function FormationsPage() {
  const supabase = createServiceClient();

  // Fetch formations from produits_formation
  const { data: rawFormations } = await supabase
    .from("produits_formation")
    .select(
      "id, intitule, sous_titre, description, domaine, categorie, duree_heures, duree_jours, image_url, populaire, slug, categorie_id, produit_tarifs(prix_ht, is_default)"
    )
    .eq("organisation_id", ORG_ID)
    .eq("publie", true)
    .order("intitule");

  // Fetch active sessions with inscription counts
  const { data: sessionsData } = await supabase
    .from("sessions")
    .select(
      "id, produit_id, date_debut, places_max, inscriptions(count)"
    )
    .eq("organisation_id", ORG_ID)
    .in("statut", ["planifiee", "confirmee"])
    .gte("date_debut", new Date().toISOString().split("T")[0]);

  // Map formations to expected format
  const formations = (rawFormations || []).map((f: Record<string, unknown>) => {
    const tarifs = f.produit_tarifs as Array<{ prix_ht: number; is_default: boolean }> | null;
    const defaultTarif = tarifs?.find((t) => t.is_default) || tarifs?.[0];
    const poleInfo = getPoleFromDomaine(f.domaine as string);
    const duree = f.duree_jours ? `${f.duree_jours}j` : f.duree_heures ? `${f.duree_heures}h` : "";

    // Clean category name: remove codes like "PEE-01 – " or "SPR-04A – "
    const rawCat = (f.categorie as string) || "";
    const cleanCategory = rawCat.replace(/^[A-Z]{2,4}-\d+[A-Z]?\s*[–-]\s*/i, "").trim();

    return {
      id: f.id as string,
      title: f.intitule as string,
      subtitle: (f.sous_titre as string) || "",
      description: (f.description as string) || "",
      pole: poleInfo.pole,
      pole_name: poleInfo.pole_name,
      duration: duree,
      price: defaultTarif ? `${defaultTarif.prix_ht}€ HT` : "",
      image_url: f.image_url as string | null,
      popular: f.populaire as boolean,
      active: true,
      category_id: cleanCategory || null,
      slug: f.slug as string,
    };
  });

  // Extract unique categories with their pole
  const categoryMap = new Map<string, { name: string; pole: string }>();
  formations.forEach((f) => {
    if (f.category_id) {
      if (!categoryMap.has(f.category_id)) {
        categoryMap.set(f.category_id, { name: f.category_id, pole: f.pole });
      }
    }
  });
  const categories = Array.from(categoryMap.entries()).map(([name, info]) => ({
    id: name,
    name: name,
    slug: name.toLowerCase().replace(/\s+/g, "-"),
    pole_id: info.pole,
  }));

  // Process session counts
  const sessionCounts: Record<string, {
    formation_id: string;
    count: number;
    next_session_date: string | null;
    total_places: number;
  }> = {};

  if (sessionsData) {
    sessionsData.forEach((session: Record<string, unknown>) => {
      const formationId = session.produit_id as string;
      const inscriptions = session.inscriptions as Array<{ count: number }> | null;
      const inscriptionCount = inscriptions?.[0]?.count || 0;
      const availablePlaces = Math.max(0, ((session.places_max as number) || 0) - inscriptionCount);

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

      const dateDebut = session.date_debut as string;
      if (!sessionCounts[formationId].next_session_date || dateDebut < sessionCounts[formationId].next_session_date!) {
        sessionCounts[formationId].next_session_date = dateDebut;
      }
    });
  }

  return (
    <>
      {/* ═══ HERO — dark V2 ═══ */}
      <section
        className="relative z-10"
        style={{ background: "linear-gradient(180deg, #1a6faa 0%, #1F628E 40%, #17567d 60%, #151F2D 100%)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 sm:pt-40 pb-16 sm:pb-20 text-center">
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">Formations</span>
          </nav>

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-5 border border-white/10">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[13px] font-medium text-white/80">4.9 · Plus de 50 avis</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-4xl mx-auto mb-6">
            Trouvez la <span style={{ color: "#F8A991" }}>formation</span> qui vous correspond.
          </h1>
          <p className="text-base sm:text-lg text-blue-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Plus de 50 formations certifiantes dans les domaines de la Sécurité, de la Petite Enfance et de la Santé.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-6">
            {[
              { icon: CheckCircle, text: "Certifié Qualiopi" },
              { icon: Award, text: "Financement OPCO" },
              { icon: Users, text: "25 000+ formés" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-[13px] font-semibold text-white/70">
                <b.icon className="w-4 h-4" />
                {b.text}
              </div>
            ))}
          </div>

          {/* Pole pills */}
          <div className="flex items-center justify-center gap-3">
            {[
              { icon: Shield, name: "Sécurité", color: "#e74c3c" },
              { icon: Baby, name: "Petite Enfance", color: "#f39c12" },
              { icon: HeartPulse, name: "Santé", color: "#27ae60" },
            ].map((p) => (
              <div key={p.name} className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-bold text-white/80" style={{ backgroundColor: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <p.icon className="w-4 h-4" style={{ color: p.color }} />
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <FormationsClient
        formations={formations}
        categories={categories}
        sessionCounts={sessionCounts}
      />
    </>
  );
}
