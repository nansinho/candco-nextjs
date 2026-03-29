import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, ORG_ID } from "@/lib/supabase/service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createServiceClient();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, date_debut, date_fin, places_max, lieu_nom, lieu_ville, lieu_type, inscriptions(count)")
    .eq("produit_id", id)
    .eq("organisation_id", ORG_ID)
    .in("statut", ["planifiee", "confirmee"])
    .gte("date_debut", new Date().toISOString().split("T")[0])
    .order("date_debut");

  const mapped = (sessions || []).map((s: Record<string, unknown>) => {
    const inscriptions = s.inscriptions as Array<{ count: number }> | null;
    const inscriptionCount = inscriptions?.[0]?.count || 0;
    const placesMax = (s.places_max as number) || 0;

    return {
      id: s.id,
      date_debut: s.date_debut,
      date_fin: s.date_fin,
      lieu_nom: s.lieu_nom || "",
      lieu_ville: s.lieu_ville || "",
      places_disponibles: Math.max(0, placesMax - inscriptionCount),
      format_type: s.lieu_type || "presentiel",
    };
  });

  return NextResponse.json(mapped);
}
