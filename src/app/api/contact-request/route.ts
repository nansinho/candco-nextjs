import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendNotificationEmail, contactRequestEmailHtml } from "@/lib/email";
import { contactRequestSchema } from "@/lib/validations";
import { checkCsrf, getClientIp } from "@/lib/api-security";

export async function POST(request: NextRequest) {
  try {
    // CSRF protection
    const csrfError = checkCsrf(request);
    if (csrfError) return csrfError;

    // Rate limit
    const clientIp = getClientIp(request);
    if (!checkRateLimit(`contact-request:${clientIp}`, 5, 60_000)) {
      return NextResponse.json(
        { error: "Trop de demandes, veuillez réessayer plus tard" },
        { status: 429 }
      );
    }

    // Parse and validate input
    const rawBody = await request.json();
    const result = contactRequestSchema.safeParse(rawBody);

    if (!result.success) {
      const firstError = result.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "Données invalides" },
        { status: 400 }
      );
    }

    const { formation_title, type, civilite, prenom, nom, email, telephone, entreprise, nombre_participants, message } = result.data;

    // Per-email rate limit (prevent spam from same email)
    if (!checkRateLimit(`contact-email:${email}`, 3, 300_000)) {
      return NextResponse.json(
        { error: "Trop de demandes pour cet email, veuillez réessayer plus tard" },
        { status: 429 }
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
