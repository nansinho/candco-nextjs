import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Auth check
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Check admin role
  const serviceClient = createServiceClient();
  const { data: userData } = await serviceClient
    .from("utilisateurs")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!userData || !["superadmin", "admin"].includes(userData.role)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Rate limit
  if (!checkRateLimit(`ai-social:${user.id}`, 10, 60_000)) {
    return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });
  }

  const body = await request.json();
  const { title, excerpt, content, platform, url } = body;

  if (!title || !platform) {
    return NextResponse.json({ error: "Titre et plateforme requis" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Clé API Anthropic non configurée" }, { status: 500 });
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const platformInstructions: Record<string, string> = {
      linkedin: `Génère un post LinkedIn professionnel pour C&Co Formation.
- Ton professionnel mais engageant
- 150-250 mots
- Commence par une accroche forte (question ou stat)
- Structure avec des sauts de ligne pour la lisibilité
- Termine par un CTA et l'URL de l'article
- Ajoute 3-5 hashtags pertinents à la fin (#Formation #Sécurité etc.)
- PAS d'emojis excessifs (1-2 max, en début de paragraphe)`,
      facebook: `Génère un post Facebook engageant pour C&Co Formation.
- Ton accessible et chaleureux
- 80-150 mots (court et percutant)
- Commence par une accroche qui donne envie de cliquer
- Utilise 2-3 emojis pertinents
- Termine par un CTA clair et l'URL
- PAS de hashtags excessifs (2-3 max)`,
    };

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Génère un post ${platform === "linkedin" ? "LinkedIn" : "Facebook"} basé sur cet article :

Titre : ${title}
Résumé : ${excerpt || ""}
${content ? `Extrait du contenu : ${content.substring(0, 500)}...` : ""}
${url ? `URL de l'article : ${url}` : ""}

Retourne UNIQUEMENT le texte du post, sans JSON ni formatage supplémentaire.`,
        },
      ],
      system: platformInstructions[platform] || platformInstructions.linkedin,
    });

    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json({ error: "Réponse IA invalide" }, { status: 500 });
    }

    return NextResponse.json({ text: textContent.text.trim() });
  } catch (error) {
    console.error("[AI Social] Error:", error);
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
