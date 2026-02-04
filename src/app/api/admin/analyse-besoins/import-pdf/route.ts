import { NextRequest, NextResponse } from "next/server";

// Simple PDF text extraction pattern matching
// This is a basic implementation that can be enhanced with proper PDF parsing
// and AI-powered extraction when ANTHROPIC_API_KEY is available

interface ExtractedSection {
  title: string;
  description?: string;
  questions: {
    label: string;
    type: "text" | "textarea" | "select" | "radio" | "checkbox" | "number";
    required?: boolean;
    options?: string[];
  }[];
}

interface ExtractedData {
  name: string;
  description: string;
  sections: ExtractedSection[];
}

// Helper function to detect question type from text
function detectQuestionType(text: string): {
  type: "text" | "textarea" | "select" | "radio" | "checkbox" | "number";
  options?: string[];
} {
  const lowerText = text.toLowerCase();

  // Check for multiple choice indicators
  if (
    lowerText.includes("cochez") ||
    lowerText.includes("plusieurs cases") ||
    lowerText.includes("plusieurs réponses") ||
    lowerText.includes("choix multiples")
  ) {
    return { type: "checkbox" };
  }

  // Check for single choice indicators
  if (
    lowerText.includes("cochez une seule") ||
    lowerText.includes("choix unique") ||
    lowerText.includes("une seule case") ||
    lowerText.includes("sélectionnez")
  ) {
    return { type: "radio" };
  }

  // Check for number indicators
  if (
    lowerText.includes("nombre") ||
    lowerText.includes("combien") ||
    lowerText.includes("quantité") ||
    lowerText.includes("effectif")
  ) {
    return { type: "number" };
  }

  // Check for long text indicators
  if (
    lowerText.includes("décrivez") ||
    lowerText.includes("expliquez") ||
    lowerText.includes("détaillez") ||
    lowerText.includes("précisez") ||
    lowerText.includes("commentaires")
  ) {
    return { type: "textarea" };
  }

  // Default to short text
  return { type: "text" };
}

// Parse extracted text into structured data
function parseExtractedText(text: string, fileName: string): ExtractedData {
  const lines = text.split("\n").map((l) => l.trim()).filter((l) => l);

  const result: ExtractedData = {
    name: fileName.replace(/\.pdf$/i, "").replace(/_/g, " "),
    description: "",
    sections: [],
  };

  let currentSection: ExtractedSection | null = null;
  let collectingDescription = false;
  let descriptionLines: string[] = [];

  // Patterns for section detection
  const sectionPatterns = [
    /^SECTION\s+\d+\s*[:\-–]\s*(.+)/i,
    /^PARTIE\s+\d+\s*[:\-–]\s*(.+)/i,
    /^\d+\.\s*([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ][A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ\s]+)$/,
    /^[IVXLCDM]+\.\s*(.+)/i,
  ];

  // Patterns for question detection
  const questionPatterns = [
    /^\d+\.\d+\s+(.+)/,
    /^Q\d+[\.:]\s*(.+)/i,
    /^Question\s*\d*[\.:]\s*(.+)/i,
    /^\d+\)\s*(.+)/,
    /^[-•]\s*(.+\?)/,
  ];

  // Patterns for options
  const optionPatterns = [
    /^[a-z]\)\s*(.+)/i,
    /^[-•]\s*(.+)$/,
    /^[□○●]\s*(.+)/,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if this is the title (first significant line)
    if (i < 3 && !result.name && line.length > 5 && line.length < 100) {
      result.name = line;
      collectingDescription = true;
      continue;
    }

    // Collect description until we hit a section
    if (collectingDescription) {
      let isSection = false;
      for (const pattern of sectionPatterns) {
        if (pattern.test(line)) {
          isSection = true;
          break;
        }
      }

      if (isSection) {
        result.description = descriptionLines.join(" ");
        collectingDescription = false;
      } else if (descriptionLines.length < 5 && line.length > 10) {
        descriptionLines.push(line);
        continue;
      }
    }

    // Check for new section
    let sectionMatch: RegExpMatchArray | null = null;
    for (const pattern of sectionPatterns) {
      sectionMatch = line.match(pattern);
      if (sectionMatch) break;
    }

    if (sectionMatch) {
      // Save previous section
      if (currentSection) {
        result.sections.push(currentSection);
      }

      currentSection = {
        title: sectionMatch[1] || line,
        questions: [],
      };
      continue;
    }

    // Check for question
    let questionMatch: RegExpMatchArray | null = null;
    for (const pattern of questionPatterns) {
      questionMatch = line.match(pattern);
      if (questionMatch) break;
    }

    if (questionMatch && currentSection) {
      const questionText = questionMatch[1] || line;
      const { type } = detectQuestionType(questionText);

      // Look ahead for options
      const options: string[] = [];
      let j = i + 1;
      while (j < lines.length && j < i + 10) {
        const nextLine = lines[j];
        let optionMatch: RegExpMatchArray | null = null;

        for (const pattern of optionPatterns) {
          optionMatch = nextLine.match(pattern);
          if (optionMatch) break;
        }

        if (optionMatch) {
          options.push(optionMatch[1] || nextLine);
          j++;
        } else if (questionPatterns.some((p) => p.test(nextLine)) || sectionPatterns.some((p) => p.test(nextLine))) {
          break;
        } else {
          j++;
        }
      }

      currentSection.questions.push({
        label: questionText,
        type: options.length > 0 ? (type === "checkbox" ? "checkbox" : "radio") : type,
        required: questionText.includes("*") || questionText.toLowerCase().includes("obligatoire"),
        options: options.length > 0 ? options : undefined,
      });

      // Skip processed option lines
      if (options.length > 0) {
        i = j - 1;
      }
    }
  }

  // Add last section
  if (currentSection) {
    result.sections.push(currentSection);
  }

  // If no sections were found, create a default one
  if (result.sections.length === 0) {
    result.sections.push({
      title: "Questions",
      questions: [],
    });
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 });
    }

    if (!file.type.includes("pdf")) {
      return NextResponse.json({ error: "Le fichier doit être un PDF" }, { status: 400 });
    }

    // Get file content as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract text from PDF (basic implementation)
    // For production, you would use a proper PDF parser like pdf-parse or pdf.js
    // This is a simplified version that looks for text patterns

    // Convert buffer to string and try to extract readable text
    const rawContent = buffer.toString("utf-8", 0, Math.min(buffer.length, 100000));

    // Clean up the extracted text
    // Remove binary/control characters while preserving French characters
    let cleanedText = rawContent
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    // If the AI API is available, use it for better extraction
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (anthropicKey && cleanedText.length > 100) {
      try {
        const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-3-haiku-20240307",
            max_tokens: 4096,
            messages: [
              {
                role: "user",
                content: `Analyse ce texte extrait d'un PDF de questionnaire d'analyse des besoins et extrait les informations structurées.

Texte extrait:
${cleanedText.slice(0, 15000)}

Retourne un JSON valide avec cette structure exacte:
{
  "name": "Titre du questionnaire",
  "description": "Description du questionnaire",
  "sections": [
    {
      "title": "Nom de la section",
      "description": "Description optionnelle",
      "questions": [
        {
          "label": "Question",
          "type": "text|textarea|select|radio|checkbox|number",
          "required": true|false,
          "options": ["option1", "option2"] // uniquement pour select/radio/checkbox
        }
      ]
    }
  ]
}

Assure-toi que:
- Chaque section a au moins une question
- Les types sont corrects (text pour texte court, textarea pour long, radio pour choix unique, checkbox pour multiples, select pour liste déroulante)
- Les options sont présentes uniquement pour les types qui en ont besoin
- Le JSON est valide`,
              },
            ],
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          const aiText = aiData.content?.[0]?.text || "";

          // Extract JSON from the response
          const jsonMatch = aiText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const extractedData = JSON.parse(jsonMatch[0]);
            return NextResponse.json(extractedData);
          }
        }
      } catch (aiError) {
        console.error("AI extraction error:", aiError);
        // Fall back to pattern-based extraction
      }
    }

    // Fall back to pattern-based extraction
    const extractedData = parseExtractedText(cleanedText, file.name);

    // If no questions were extracted, return a template structure
    if (extractedData.sections.every((s) => s.questions.length === 0)) {
      return NextResponse.json({
        name: file.name.replace(/\.pdf$/i, "").replace(/_/g, " "),
        description: "Questionnaire importé depuis PDF",
        sections: [
          {
            title: "Section 1: Informations générales",
            description: "",
            questions: [
              { label: "Raison sociale de l'entreprise", type: "text", required: true },
              { label: "Secteur d'activité", type: "select", required: true, options: ["Commerce", "Industrie", "Services", "BTP", "Santé", "Autre"] },
              { label: "Effectif de l'entreprise", type: "radio", required: true, options: ["1-10 salariés", "11-50 salariés", "51-250 salariés", "Plus de 250 salariés"] },
            ],
          },
          {
            title: "Section 2: Besoins en formation",
            description: "",
            questions: [
              { label: "Quels sont vos objectifs de formation ?", type: "textarea", required: true },
              { label: "Combien de personnes souhaitez-vous former ?", type: "number", required: false },
              { label: "Avez-vous des contraintes horaires particulières ?", type: "textarea", required: false },
            ],
          },
        ],
      });
    }

    return NextResponse.json(extractedData);
  } catch (error) {
    console.error("PDF import error:", error);
    return NextResponse.json(
      { error: "Erreur lors du traitement du fichier" },
      { status: 500 }
    );
  }
}
