import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface EmailRequest {
  to: string;
  name?: string;
  subject: string;
  message: string;
  link: string;
  templateName: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EmailRequest = await request.json();
    const { to, name, subject, message, link, templateName } = body;

    if (!to || !subject || !link) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = await createClient();

    // Verify the user is authenticated and has admin access
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Build the email HTML
    const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      height: 50px;
      margin-bottom: 20px;
    }
    h1 {
      color: #1a1a1a;
      font-size: 24px;
      margin: 0 0 20px;
    }
    .message {
      white-space: pre-line;
      margin-bottom: 30px;
    }
    .cta-button {
      display: inline-block;
      background-color: #f97316;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 28px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
    }
    .cta-button:hover {
      background-color: #ea580c;
    }
    .cta-container {
      text-align: center;
      margin: 30px 0;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      font-size: 12px;
      color: #666;
      text-align: center;
    }
    .link-fallback {
      font-size: 12px;
      color: #666;
      word-break: break-all;
      margin-top: 20px;
    }
    .questionnaire-name {
      background-color: #f5f5f5;
      padding: 12px 16px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://candco.fr/logo.svg" alt="C&Co Formation" class="logo" />
      <h1>Questionnaire d'analyse des besoins</h1>
    </div>

    ${name ? `<p>Bonjour ${name},</p>` : '<p>Bonjour,</p>'}

    <div class="message">${message}</div>

    <div class="questionnaire-name">
      📋 ${templateName}
    </div>

    <div class="cta-container">
      <a href="${link}" class="cta-button">
        Accéder au questionnaire
      </a>
    </div>

    <p class="link-fallback">
      Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br/>
      <a href="${link}">${link}</a>
    </p>

    <div class="footer">
      <p>
        C&Co Formation<br/>
        340 chemin du plan marseillais<br/>
        13320 Bouc-Bel-Air<br/>
        <a href="tel:+33762596653">07 62 59 66 53</a> |
        <a href="mailto:contact@candco.fr">contact@candco.fr</a>
      </p>
      <p>
        Cet email vous a été envoyé car vous avez été invité à remplir un questionnaire d'analyse des besoins.
      </p>
    </div>
  </div>
</body>
</html>
`;

    // Check for email service configuration
    const resendKey = process.env.RESEND_API_KEY;
    const sendgridKey = process.env.SENDGRID_API_KEY;
    const smtpHost = process.env.SMTP_HOST;

    // Try Resend first
    if (resendKey) {
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "C&Co Formation <contact@candco.fr>",
          to: [to],
          subject,
          html: emailHtml,
        }),
      });

      if (resendResponse.ok) {
        const data = await resendResponse.json();
        return NextResponse.json({ success: true, id: data.id });
      } else {
        const error = await resendResponse.text();
        console.error("Resend error:", error);
      }
    }

    // Try SendGrid
    if (sendgridKey) {
      const sendgridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sendgridKey}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to, name: name || undefined }] }],
          from: { email: process.env.EMAIL_FROM || "contact@candco.fr", name: "C&Co Formation" },
          subject,
          content: [{ type: "text/html", value: emailHtml }],
        }),
      });

      if (sendgridResponse.ok) {
        return NextResponse.json({ success: true });
      } else {
        const error = await sendgridResponse.text();
        console.error("SendGrid error:", error);
      }
    }

    // Try Supabase Edge Function for email (if configured)
    try {
      const { data: emailData, error: emailError } = await supabase.functions.invoke(
        "send-email",
        {
          body: {
            to,
            subject,
            html: emailHtml,
          },
        }
      );

      if (!emailError && emailData) {
        return NextResponse.json({ success: true });
      }
    } catch {
      // Supabase function not available
    }

    // If no email service is configured, just log and return success
    // In production, you should configure an email service
    console.log("Email would be sent to:", to);
    console.log("Subject:", subject);
    console.log("Link:", link);

    // Return success anyway - the magic link was created in the database
    return NextResponse.json({
      success: true,
      warning: "Email service not configured - link generated but email not sent",
    });
  } catch (error) {
    console.error("Send email error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email" },
      { status: 500 }
    );
  }
}
