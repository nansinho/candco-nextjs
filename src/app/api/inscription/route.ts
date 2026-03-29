import { NextRequest, NextResponse } from "next/server";
import { createServiceClient, ORG_ID } from "@/lib/supabase/service";
import { checkRateLimit } from "@/lib/rate-limit";

interface InscriptionRequest {
  session_id: string;
  civilite: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 inscriptions per minute per IP
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`inscription:${clientIp}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Trop de demandes, veuillez réessayer plus tard" },
        { status: 429 }
      );
    }

    const body: InscriptionRequest = await request.json();
    const { session_id, civilite, prenom, nom, email, telephone, entreprise, notes } = body;

    // Validate required fields
    if (!session_id || !prenom || !nom || !email) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (session, prénom, nom, email)" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Verify session exists and belongs to our organization
    const { data: session } = await supabase
      .from("sessions")
      .select("id, produit_id, statut, places_max, date_debut")
      .eq("id", session_id)
      .eq("organisation_id", ORG_ID)
      .in("statut", ["planifiee", "confirmee"])
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Session non trouvée ou non disponible" },
        { status: 404 }
      );
    }

    // Check available places
    const { count: inscriptionCount } = await supabase
      .from("inscriptions")
      .select("id", { count: "exact", head: true })
      .eq("session_id", session_id)
      .neq("statut", "annulee");

    const placesUsed = inscriptionCount || 0;
    if (session.places_max && placesUsed >= session.places_max) {
      return NextResponse.json(
        { error: "Désolé, cette session est complète" },
        { status: 409 }
      );
    }

    // Upsert apprenant (find by email + organisation_id or create)
    let apprenantId: string;

    const { data: existingApprenant } = await supabase
      .from("apprenants")
      .select("id")
      .eq("organisation_id", ORG_ID)
      .eq("email", email)
      .maybeSingle();

    if (existingApprenant) {
      apprenantId = existingApprenant.id;
      // Update info if needed
      await supabase
        .from("apprenants")
        .update({
          civilite: civilite || undefined,
          prenom,
          nom,
          telephone: telephone || undefined,
        })
        .eq("id", apprenantId);
    } else {
      const { data: newApprenant, error: apprenantError } = await supabase
        .from("apprenants")
        .insert({
          organisation_id: ORG_ID,
          civilite: civilite || null,
          prenom,
          nom,
          email,
          telephone: telephone || null,
        })
        .select("id")
        .single();

      if (apprenantError || !newApprenant) {
        console.error("Apprenant creation error:", apprenantError);
        return NextResponse.json(
          { error: "Erreur lors de la création du profil" },
          { status: 500 }
        );
      }
      apprenantId = newApprenant.id;
    }

    // Check if already inscribed to this session
    const { data: existingInscription } = await supabase
      .from("inscriptions")
      .select("id")
      .eq("session_id", session_id)
      .eq("apprenant_id", apprenantId)
      .neq("statut", "annulee")
      .maybeSingle();

    if (existingInscription) {
      return NextResponse.json(
        { error: "Vous êtes déjà inscrit à cette session" },
        { status: 409 }
      );
    }

    // Create inscription
    const { data: inscription, error: inscriptionError } = await supabase
      .from("inscriptions")
      .insert({
        session_id,
        apprenant_id: apprenantId,
        statut: "en_attente",
        notes: [entreprise ? `Entreprise: ${entreprise}` : "", notes || ""].filter(Boolean).join("\n") || null,
      })
      .select("id")
      .single();

    if (inscriptionError) {
      console.error("Inscription error:", inscriptionError);
      return NextResponse.json(
        { error: "Erreur lors de l'inscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      inscription_id: inscription.id,
      message: "Votre demande d'inscription a été enregistrée. Nous vous contacterons dans les plus brefs délais.",
    });
  } catch (error) {
    console.error("Inscription API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
