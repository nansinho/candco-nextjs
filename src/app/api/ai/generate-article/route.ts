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

  // Rate limit: 5 requests per minute
  if (!checkRateLimit(`ai-generate:${user.id}`, 5, 60_000)) {
    return NextResponse.json({ error: "Trop de requêtes. Réessayez dans 1 minute." }, { status: 429 });
  }

  const body = await request.json();
  const { topic, category, targetKeyword, localSeoCity } = body;

  if (!topic) {
    return NextResponse.json({ error: "Le sujet est requis" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Clé API Anthropic non configurée" }, { status: 500 });
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const localSeoInstruction = localSeoCity
      ? `Intègre naturellement du référencement local pour la ville/région "${localSeoCity}" (ex: "formation SST à ${localSeoCity}", "centre de formation ${localSeoCity}"). Mentionne la ville 2-3 fois dans le contenu de manière naturelle.`
      : "";

    const keywordInstruction = targetKeyword
      ? `Le mot-clé focus principal est "${targetKeyword}". Assure-toi qu'il apparaît dans le titre, le premier paragraphe, au moins un H2, et la meta description. Densité cible : 1-2%.`
      : "";

    const systemPrompt = `Tu es un expert en rédaction SEO pour C&Co Formation, un centre de formation professionnelle certifié Qualiopi spécialisé en Sécurité/Prévention, Petite Enfance et Santé, basé à Bouc-Bel-Air (13).

RÈGLES STRICTES :
- Écris en français, ton professionnel mais accessible
- Article de 800 à 1200 mots maximum (pas trop long pour ne pas perdre le lecteur)
- Hiérarchie : utilise H2 et H3 (JAMAIS de H1, c'est le titre de la page)
- Paragraphes courts (3-4 phrases max)
- NE JAMAIS inventer de certifications, statistiques, chiffres légaux ou réglementations
- NE JAMAIS halluciner des informations que tu ne connais pas avec certitude
- Utilise des listes à puces quand c'est pertinent
- Inclus un appel à l'action en fin d'article vers C&Co Formation

${keywordInstruction}
${localSeoInstruction}

RETOURNE UNIQUEMENT du JSON valide avec cette structure exacte :
{
  "title": "Titre de l'article (50-65 caractères)",
  "slug": "titre-en-kebab-case",
  "excerpt": "Résumé accrocheur de 2 phrases (150-160 caractères)",
  "content": "Contenu en Markdown avec ## et ### pour les titres",
  "meta_title": "Meta title SEO (50-60 caractères)",
  "meta_description": "Meta description SEO (120-155 caractères)",
  "focus_keyword": "mot-clé principal",
  "secondary_keywords": ["mot-clé 2", "mot-clé 3", "mot-clé 4"],
  "keywords": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "read_time": 5
}`;

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: `Rédige un article de blog optimisé SEO sur le sujet suivant : "${topic}"
Catégorie : ${category || "Actualités"}
${targetKeyword ? `Mot-clé cible : ${targetKeyword}` : ""}
${localSeoCity ? `Ville/région cible pour le SEO local : ${localSeoCity}` : ""}

Retourne UNIQUEMENT le JSON, sans texte avant ou après.`,
        },
      ],
      system: systemPrompt,
    });

    // Extract text content
    const textContent = message.content.find((c) => c.type === "text");
    if (!textContent || textContent.type !== "text") {
      return NextResponse.json({ error: "Réponse IA invalide" }, { status: 500 });
    }

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = textContent.text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const articleData = JSON.parse(jsonStr);

    // Validate required fields
    const requiredFields = ["title", "slug", "excerpt", "content", "meta_title", "meta_description"];
    for (const field of requiredFields) {
      if (!articleData[field]) {
        return NextResponse.json({ error: `Champ manquant dans la réponse IA : ${field}` }, { status: 500 });
      }
    }

    return NextResponse.json({
      ...articleData,
      ai_generated: true,
      category: category || "Actualités",
    });
  } catch (error) {
    console.error("[AI Generate] Error:", error);
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Erreur de parsing de la réponse IA" }, { status: 500 });
    }
    return NextResponse.json({ error: "Erreur lors de la génération" }, { status: 500 });
  }
}
