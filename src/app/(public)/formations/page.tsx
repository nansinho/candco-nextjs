import { createServiceClient, ORG_ID } from "@/lib/supabase/service";
import { getPoleFromDomaine } from "@/lib/domaines";
import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Award, Users, Star } from "lucide-react";
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
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>
            <Link href="/" className="hover:text-white transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-white">Formations</span>
          </nav>

          {/* Rating pill */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-5 py-2 mb-8 border border-white/10">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[13px] font-medium text-white/80">4.9 · Plus de 50 avis</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.1] tracking-tight text-white max-w-5xl mx-auto mb-6">
            Notre catalogue de formations,{" "}
            <span className="block" style={{ color: "#F8A991" }}>à votre service.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-blue-100/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Plus de 50 formations certifiantes en Sécurité, Petite Enfance et Santé. Trouvez la formation qui correspond à vos besoins.
          </p>

          {/* CTA */}
          <a
            href="#catalogue"
            className="inline-flex items-center gap-2 bg-[#F8A991] text-[#151F2D] px-8 py-3 rounded-xl font-bold text-[15px] hover:bg-[#f69b80] transition-colors shadow-xl shadow-black/10 mb-10"
          >
            Explorer le catalogue
          </a>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[
              { icon: Users, text: "25 000+ Formés" },
              { icon: CheckCircle, text: "Certifié Qualiopi" },
              { icon: Award, text: "Financement OPCO" },
            ].map((b) => (
              <div key={b.text} className="flex items-center gap-2 text-[13px] font-semibold text-white/70">
                <b.icon className="w-4 h-4" />
                {b.text}
              </div>
            ))}
          </div>
        </div>

        {/* Stamp badge — floating top right */}
        <div className="absolute top-28 right-8 lg:right-16 hidden lg:block rotate-12" style={{ animation: "float 5s ease-in-out infinite" }}>
          <svg width="110" height="110" viewBox="0 0 110 110" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Note de satisfaction 4.9 sur 5">
            <circle cx="55" cy="55" r="50" stroke="white" strokeWidth="2" strokeDasharray="4 3" opacity="0.4" />
            <circle cx="55" cy="55" r="42" stroke="white" strokeWidth="1.5" opacity="0.3" />
            <text x="55" y="42" textAnchor="middle" fill="white" fontSize="24" fontWeight="800" fontFamily="&apos;Plus Jakarta Sans&apos;,sans-serif">4.9</text>
            <text x="55" y="57" textAnchor="middle" fill="white" fontSize="9" fontWeight="600" fontFamily="&apos;Plus Jakarta Sans&apos;,sans-serif" opacity="0.8" letterSpacing="1.5">SATISFACTION</text>
            <text x="55" y="72" textAnchor="middle" fill="#fbbf24" fontSize="14" fontFamily="&apos;Plus Jakarta Sans&apos;,sans-serif">★★★★★</text>
          </svg>
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
