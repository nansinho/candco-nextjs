import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, ORG_ID } from "@/lib/supabase/service";
import { getPoleFromDomaine } from "@/lib/domaines";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  // Fetch formation with all related data
  const { data: f } = await supabase
    .from("produits_formation")
    .select(`
      *,
      produit_objectifs(objectif, ordre),
      produit_prerequis(texte, ordre),
      produit_programme(titre, contenu, duree, ordre),
      produit_public_vise(texte, ordre),
      produit_competences(texte, ordre),
      produit_tarifs(nom, prix_ht, taux_tva, unite, is_default)
    `)
    .eq("organisation_id", ORG_ID)
    .eq("slug", id)
    .eq("publie", true)
    .single();

  if (!f) {
    return NextResponse.json({ error: "Formation not found" }, { status: 404 });
  }

  const poleInfo = getPoleFromDomaine(f.domaine as string);
  const tarifs = f.produit_tarifs as Array<{ nom: string; prix_ht: number; taux_tva: number; unite: string; is_default: boolean }> | null;
  const defaultTarif = tarifs?.find((t) => t.is_default) || tarifs?.[0];

  const objectifs = (f.produit_objectifs as Array<{ objectif: string; ordre: number }> || [])
    .sort((a, b) => a.ordre - b.ordre).map((o) => o.objectif);
  const prerequis = (f.produit_prerequis as Array<{ texte: string; ordre: number }> || [])
    .sort((a, b) => a.ordre - b.ordre).map((p) => p.texte);
  const programme = (f.produit_programme as Array<{ titre: string; contenu: string; duree: string; ordre: number }> || [])
    .sort((a, b) => a.ordre - b.ordre).map((p) => ({ titre: p.titre, contenu: p.contenu, duree: p.duree }));
  const publicVise = (f.produit_public_vise as Array<{ texte: string; ordre: number }> || [])
    .sort((a, b) => a.ordre - b.ordre).map((p) => p.texte);
  const competences = (f.produit_competences as Array<{ texte: string; ordre: number }> || [])
    .sort((a, b) => a.ordre - b.ordre).map((c) => c.texte);

  // Fetch upcoming sessions
  const { data: rawSessions } = await supabase
    .from("sessions")
    .select("id, date_debut, date_fin, places_max, lieu_nom, lieu_ville, lieu_type, inscriptions(count)")
    .eq("produit_id", f.id)
    .eq("organisation_id", ORG_ID)
    .in("statut", ["planifiee", "confirmee"])
    .gte("date_debut", new Date().toISOString().split("T")[0])
    .order("date_debut")
    .limit(5);

  const sessions = (rawSessions || []).map((s: Record<string, unknown>) => {
    const inscriptions = s.inscriptions as Array<{ count: number }> | null;
    const inscriptionCount = inscriptions?.[0]?.count || 0;
    const placesMax = (s.places_max as number) || 0;
    return {
      id: s.id,
      date_debut: s.date_debut,
      date_fin: s.date_fin,
      lieu: (s.lieu_nom as string) || (s.lieu_ville as string) || "À définir",
      places_disponibles: Math.max(0, placesMax - inscriptionCount),
    };
  });

  // Clean category
  const rawCat = (f.categorie as string) || "";
  const categorie = rawCat.replace(/^[A-Z]{2,4}-\d+[A-Z]?\s*[–-]\s*/i, "").trim();

  return NextResponse.json({
    id: f.id,
    slug: f.slug,
    title: f.intitule,
    subtitle: f.sous_titre || null,
    description: f.description || null,
    pole: poleInfo.pole,
    pole_name: poleInfo.pole_name,
    categorie: categorie || null,
    image_url: f.image_url || null,
    certification: f.certification || null,
    duration: f.duree_jours ? `${f.duree_jours}j (${f.duree_heures || ""}h)` : f.duree_heures ? `${f.duree_heures}h` : "",
    duree_heures: f.duree_heures || null,
    duree_jours: f.duree_jours || null,
    format_lieu: f.lieu_format || null,
    nombre_participants_max: f.nombre_participants_max || null,
    nombre_participants_min: f.nombre_participants_min || null,
    price_ht: defaultTarif ? defaultTarif.prix_ht : null,
    price_ttc: defaultTarif ? Math.round(defaultTarif.prix_ht * (1 + (defaultTarif.taux_tva || 0) / 100)) : null,
    tarifs: (tarifs || []).map((t) => ({
      nom: t.nom,
      prix_ht: t.prix_ht,
      taux_tva: t.taux_tva,
      unite: t.unite,
      is_default: t.is_default,
    })),
    objectifs,
    prerequis,
    programme,
    public_vise: publicVise,
    competences,
    modalites: f.modalites as { methodes?: string[]; moyens?: string[]; evaluation?: string[] } | null,
    encadrement_pedagogique: f.encadrement_pedagogique || null,
    financement: f.financement || null,
    modalites_paiement: f.modalites_paiement || null,
    accessibilite: f.accessibilite || null,
    sessions,
  });
}
