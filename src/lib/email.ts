import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const EMAIL_FROM = process.env.EMAIL_FROM || "C&Co Formation <contact@candco.fr>";
const EMAIL_TO = (process.env.EMAIL_TO || "contact@candco.fr,contact@harua-ds.com").split(",").map(e => e.trim());

interface SendEmailOptions {
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendNotificationEmail({ subject, html, replyTo }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: EMAIL_TO,
      subject,
      html,
      replyTo,
    });

    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false, error };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[email] Send error:", err);
    return { success: false, error: err };
  }
}

export function contactRequestEmailHtml({
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
}: {
  type: string;
  formation_title: string;
  civilite?: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  nombre_participants?: number;
  message?: string;
}) {
  const typeLabel = type === "devis" ? "Demande de devis" : "Demande d'inscription";

  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: #1F628E; padding: 24px 32px;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">${typeLabel}</h1>
        <p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">${formation_title}</p>
      </div>
      <div style="padding: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          ${civilite ? row("Civilit\u00e9", civilite) : ""}
          ${row("Pr\u00e9nom", prenom)}
          ${row("Nom", nom)}
          ${row("Email", `<a href="mailto:${email}" style="color: #1F628E;">${email}</a>`)}
          ${telephone ? row("T\u00e9l\u00e9phone", `<a href="tel:${telephone}" style="color: #1F628E;">${telephone}</a>`) : ""}
          ${entreprise ? row("Entreprise", entreprise) : ""}
          ${nombre_participants ? row("Participants", String(nombre_participants)) : ""}
        </table>
        ${message ? `<div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #1F628E;"><p style="margin: 0; font-size: 14px; color: #334155; white-space: pre-line;">${message}</p></div>` : ""}
      </div>
      <div style="padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">Notification automatique — C&Co Formation</p>
      </div>
    </div>
  `;
}

export function inscriptionEmailHtml({
  civilite,
  prenom,
  nom,
  email,
  telephone,
  entreprise,
  notes,
  session_date,
  formation_title,
}: {
  civilite?: string;
  prenom: string;
  nom: string;
  email: string;
  telephone?: string;
  entreprise?: string;
  notes?: string;
  session_date?: string;
  formation_title?: string;
}) {
  return `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
      <div style="background: #1F628E; padding: 24px 32px;">
        <h1 style="color: #ffffff; font-size: 20px; margin: 0;">Nouvelle inscription</h1>
        ${formation_title ? `<p style="color: rgba(255,255,255,0.8); font-size: 14px; margin: 8px 0 0;">${formation_title}</p>` : ""}
      </div>
      <div style="padding: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          ${civilite ? row("Civilit\u00e9", civilite) : ""}
          ${row("Pr\u00e9nom", prenom)}
          ${row("Nom", nom)}
          ${row("Email", `<a href="mailto:${email}" style="color: #1F628E;">${email}</a>`)}
          ${telephone ? row("T\u00e9l\u00e9phone", `<a href="tel:${telephone}" style="color: #1F628E;">${telephone}</a>`) : ""}
          ${entreprise ? row("Entreprise", entreprise) : ""}
          ${session_date ? row("Date de session", session_date) : ""}
        </table>
        ${notes ? `<div style="margin-top: 20px; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #1F628E;"><p style="margin: 0; font-size: 14px; color: #334155; white-space: pre-line;">${notes}</p></div>` : ""}
      </div>
      <div style="padding: 16px 32px; background: #f8fafc; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; font-size: 12px; color: #94a3b8;">Notification automatique — C&Co Formation</p>
      </div>
    </div>
  `;
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding: 8px 0; font-size: 13px; color: #64748b; width: 140px; vertical-align: top;">${label}</td>
      <td style="padding: 8px 0; font-size: 14px; color: #1e293b; font-weight: 500;">${value}</td>
    </tr>
  `;
}
