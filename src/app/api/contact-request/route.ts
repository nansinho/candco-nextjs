import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendNotificationEmail, contactRequestEmailHtml } from "@/lib/email";

interface ContactRequest {
  formation_id?: string;
  formation_title: string;
  type: "inscription" | "devis";
  civilite?: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  nombre_participants?: number;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const clientIp = request.headers.get("x-forwarded-for") || "unknown";
    if (!checkRateLimit(`contact-request:${clientIp}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Trop de demandes, veuillez réessayer plus tard" },
        { status: 429 }
      );
    }

    const body: ContactRequest = await request.json();
    const { formation_title, type, civilite, prenom, nom, email, telephone, entreprise, nombre_participants, message } = body;

    if (!prenom || !nom || !email) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants (prénom, nom, email)" },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    const subject = type === "devis"
      ? `Demande de devis — ${formation_title}`
      : `Demande d'inscription (sans session) — ${formation_title}`;

    const messageParts = [
      civilite ? `Civilité : ${civilite}` : "",
      entreprise ? `Entreprise : ${entreprise}` : "",
      nombre_participants ? `Nombre de participants : ${nombre_participants}` : "",
      message || "",
    ].filter(Boolean).join("\n");

    const { error } = await supabase
      .from("contact_submissions")
      .insert({
        first_name: prenom,
        last_name: nom,
        email,
        phone: telephone || null,
        subject,
        message: messageParts || "—",
      });

    if (error) {
      console.error("Contact request error:", error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de la demande" },
        { status: 500 }
      );
    }

    // Send email notification (non-blocking)
    sendNotificationEmail({
      subject,
      html: contactRequestEmailHtml({
        type,
        formation_title,
        civilite,
        prenom,
        nom,
        email,
        telephone,
        entreprise,
        nombre_participants,
        message,
      }),
      replyTo: email,
    }).catch((err) => console.error("[contact-request] Email send failed:", err));

    return NextResponse.json({
      success: true,
      message: type === "devis"
        ? "Votre demande de devis a été envoyée. Nous vous recontacterons rapidement."
        : "Votre demande a été enregistrée. Nous vous contacterons dès qu'une session sera planifiée.",
    });
  } catch (error) {
    console.error("Contact request API error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
