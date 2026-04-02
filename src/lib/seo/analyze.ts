/**
 * SEO Analysis Engine — Client-side, Rank Math-like scoring
 * Runs entirely in the browser for instant feedback
 */

export interface SeoCheck {
  id: string;
  label: string;
  status: "good" | "warning" | "error";
  score: number; // 0-100
  message: string;
}

export interface SeoAnalysis {
  score: number; // 0-100 weighted average
  checks: SeoCheck[];
}

interface ArticleData {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  meta_title?: string;
  meta_description?: string;
  focus_keyword?: string;
  secondary_keywords?: string[];
  image_url?: string;
}

function countOccurrences(text: string, keyword: string): number {
  if (!text || !keyword) return 0;
  const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return (text.match(regex) || []).length;
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function extractHeadings(markdown: string): { level: number; text: string }[] {
  if (!markdown) return [];
  const regex = /^(#{2,6})\s+(.+)$/gm;
  const headings: { level: number; text: string }[] = [];
  let match;
  while ((match = regex.exec(markdown)) !== null) {
    headings.push({ level: match[1].length, text: match[2] });
  }
  return headings;
}

function countInternalLinks(markdown: string): number {
  if (!markdown) return 0;
  const linkRegex = /\[([^\]]+)\]\((\/(blog|formations|pole|contact|faq|a-propos)[^\)]*)\)/g;
  return (markdown.match(linkRegex) || []).length;
}

function countImages(markdown: string): number {
  if (!markdown) return 0;
  const imgRegex = /!\[([^\]]*)\]\([^\)]+\)/g;
  return (markdown.match(imgRegex) || []).length;
}

function averageSentenceLength(text: string): number {
  if (!text) return 0;
  // Strip markdown syntax
  const clean = text.replace(/[#*_`\[\]()]/g, "").replace(/\n+/g, " ");
  const sentences = clean.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  if (sentences.length === 0) return 0;
  const totalWords = sentences.reduce((sum, s) => sum + countWords(s), 0);
  return Math.round(totalWords / sentences.length);
}

export function analyzeSeo(article: ArticleData): SeoAnalysis {
  const checks: SeoCheck[] = [];
  const kw = article.focus_keyword?.toLowerCase().trim() || "";
  const title = article.title || "";
  const content = article.content || "";
  const metaTitle = article.meta_title || title;
  const metaDesc = article.meta_description || "";
  const slug = article.slug || "";
  const wordCount = countWords(content);

  // 1. Focus keyword in title (weight: 10)
  if (kw) {
    const inTitle = title.toLowerCase().includes(kw);
    checks.push({
      id: "kw-title",
      label: "Mot-clé dans le titre",
      status: inTitle ? "good" : "error",
      score: inTitle ? 100 : 0,
      message: inTitle ? "Le mot-clé focus apparaît dans le titre" : "Ajoutez le mot-clé focus dans le titre",
    });
  }

  // 2. Focus keyword in first paragraph (weight: 8)
  if (kw && content) {
    const firstParagraph = content.split("\n\n")[0]?.toLowerCase() || "";
    const inFirst = firstParagraph.includes(kw);
    checks.push({
      id: "kw-intro",
      label: "Mot-clé dans l'introduction",
      status: inFirst ? "good" : "warning",
      score: inFirst ? 100 : 30,
      message: inFirst ? "Le mot-clé apparaît dans le premier paragraphe" : "Ajoutez le mot-clé dans le premier paragraphe",
    });
  }

  // 3. Focus keyword in meta title (weight: 8)
  if (kw) {
    const inMeta = metaTitle.toLowerCase().includes(kw);
    checks.push({
      id: "kw-meta-title",
      label: "Mot-clé dans le meta title",
      status: inMeta ? "good" : "error",
      score: inMeta ? 100 : 0,
      message: inMeta ? "Le mot-clé est dans le meta title" : "Le meta title devrait contenir le mot-clé focus",
    });
  }

  // 4. Focus keyword in meta description (weight: 7)
  if (kw) {
    const inDesc = metaDesc.toLowerCase().includes(kw);
    checks.push({
      id: "kw-meta-desc",
      label: "Mot-clé dans la meta description",
      status: inDesc ? "good" : "warning",
      score: inDesc ? 100 : 20,
      message: inDesc ? "Le mot-clé est dans la meta description" : "Ajoutez le mot-clé dans la meta description",
    });
  }

  // 5. Focus keyword in slug (weight: 6)
  if (kw) {
    const kwSlug = kw.replace(/\s+/g, "-");
    const inSlug = slug.includes(kwSlug) || slug.includes(kw.replace(/\s+/g, "-"));
    checks.push({
      id: "kw-slug",
      label: "Mot-clé dans l'URL",
      status: inSlug ? "good" : "warning",
      score: inSlug ? 100 : 30,
      message: inSlug ? "Le mot-clé apparaît dans le slug" : "Intégrez le mot-clé dans l'URL",
    });
  }

  // 6. Meta title length (weight: 7)
  const mtLen = metaTitle.length;
  checks.push({
    id: "meta-title-len",
    label: `Meta title (${mtLen} car.)`,
    status: mtLen >= 50 && mtLen <= 60 ? "good" : mtLen >= 30 && mtLen <= 70 ? "warning" : "error",
    score: mtLen >= 50 && mtLen <= 60 ? 100 : mtLen >= 30 && mtLen <= 70 ? 60 : 0,
    message: mtLen < 30 ? "Meta title trop court (min 50)" : mtLen > 70 ? "Meta title trop long (max 60)" : mtLen >= 50 && mtLen <= 60 ? "Longueur optimale" : "Visez 50-60 caractères",
  });

  // 7. Meta description length (weight: 7)
  const mdLen = metaDesc.length;
  checks.push({
    id: "meta-desc-len",
    label: `Meta description (${mdLen} car.)`,
    status: mdLen >= 120 && mdLen <= 155 ? "good" : mdLen >= 80 && mdLen <= 170 ? "warning" : "error",
    score: mdLen >= 120 && mdLen <= 155 ? 100 : mdLen >= 80 && mdLen <= 170 ? 60 : 0,
    message: mdLen < 80 ? "Meta description trop courte (min 120)" : mdLen > 170 ? "Meta description trop longue (max 155)" : mdLen >= 120 && mdLen <= 155 ? "Longueur optimale" : "Visez 120-155 caractères",
  });

  // 8. Heading hierarchy (weight: 8)
  const headings = extractHeadings(content);
  const hasH1 = content.includes("\n# ") || content.startsWith("# ");
  const hasH2 = headings.some((h) => h.level === 2);
  if (hasH1) {
    checks.push({
      id: "heading-h1",
      label: "Pas de H1 dans le contenu",
      status: "error",
      score: 0,
      message: "Retirez les H1 (#) du contenu — le titre de la page fait déjà H1",
    });
  } else if (!hasH2) {
    checks.push({
      id: "heading-structure",
      label: "Structure des titres",
      status: "error",
      score: 0,
      message: "Ajoutez au moins un sous-titre H2 (##) pour structurer l'article",
    });
  } else {
    checks.push({
      id: "heading-structure",
      label: "Structure des titres",
      status: "good",
      score: 100,
      message: `${headings.length} sous-titres détectés — bonne structure`,
    });
  }

  // 9. Keyword density (weight: 6)
  if (kw && wordCount > 50) {
    const kwCount = countOccurrences(content, kw);
    const density = (kwCount / wordCount) * 100;
    checks.push({
      id: "kw-density",
      label: `Densité mot-clé (${density.toFixed(1)}%)`,
      status: density >= 0.8 && density <= 3 ? "good" : density > 0 ? "warning" : "error",
      score: density >= 0.8 && density <= 3 ? 100 : density > 0 ? 40 : 0,
      message: density < 0.5 ? "Mot-clé trop rare — augmentez les occurrences" : density > 3 ? "Attention au suroptimisation (>3%)" : "Densité optimale",
    });
  }

  // 10. Content length (weight: 8)
  checks.push({
    id: "content-length",
    label: `Longueur du contenu (${wordCount} mots)`,
    status: wordCount >= 800 && wordCount <= 2000 ? "good" : wordCount >= 400 ? "warning" : "error",
    score: wordCount >= 800 && wordCount <= 2000 ? 100 : wordCount >= 400 ? 50 : wordCount > 0 ? 20 : 0,
    message: wordCount < 400 ? "Contenu trop court (min 800 mots)" : wordCount > 2000 ? "Contenu long — assurez-vous que le lecteur reste engagé" : wordCount >= 800 ? "Longueur optimale" : "Visez 800-1500 mots",
  });

  // 11. Internal links (weight: 7)
  const internalLinks = countInternalLinks(content);
  checks.push({
    id: "internal-links",
    label: `Liens internes (${internalLinks})`,
    status: internalLinks >= 2 ? "good" : internalLinks >= 1 ? "warning" : "error",
    score: internalLinks >= 2 ? 100 : internalLinks >= 1 ? 50 : 0,
    message: internalLinks === 0 ? "Ajoutez des liens vers d'autres pages du site (maillage interne)" : internalLinks < 2 ? "Ajoutez 1-2 liens internes supplémentaires" : "Bon maillage interne",
  });

  // 12. Image presence (weight: 5)
  const hasImage = !!article.image_url || countImages(content) > 0;
  checks.push({
    id: "image",
    label: "Image présente",
    status: hasImage ? "good" : "warning",
    score: hasImage ? 100 : 20,
    message: hasImage ? "L'article contient une image" : "Ajoutez une image pour améliorer l'engagement",
  });

  // 13. Readability (weight: 6)
  if (wordCount > 50) {
    const avgLen = averageSentenceLength(content);
    checks.push({
      id: "readability",
      label: `Lisibilité (${avgLen} mots/phrase)`,
      status: avgLen <= 20 ? "good" : avgLen <= 25 ? "warning" : "error",
      score: avgLen <= 20 ? 100 : avgLen <= 25 ? 60 : 20,
      message: avgLen > 25 ? "Phrases trop longues — raccourcissez-les" : avgLen <= 20 ? "Bonne lisibilité" : "Essayez de raccourcir certaines phrases",
    });
  }

  // 14. Secondary keywords (weight: 5)
  if (article.secondary_keywords && article.secondary_keywords.length > 0) {
    const used = article.secondary_keywords.filter((sk) => content.toLowerCase().includes(sk.toLowerCase()));
    const ratio = used.length / article.secondary_keywords.length;
    checks.push({
      id: "secondary-kw",
      label: `Mots-clés secondaires (${used.length}/${article.secondary_keywords.length})`,
      status: ratio >= 0.6 ? "good" : ratio >= 0.3 ? "warning" : "error",
      score: Math.round(ratio * 100),
      message: ratio >= 0.6 ? "Bonne utilisation des mots-clés secondaires" : "Intégrez davantage de mots-clés secondaires dans le contenu",
    });
  }

  // 15. Focus keyword present (weight: 10)
  if (!kw) {
    checks.unshift({
      id: "no-keyword",
      label: "Mot-clé focus manquant",
      status: "error",
      score: 0,
      message: "Définissez un mot-clé focus pour activer l'analyse SEO complète",
    });
  }

  // Calculate weighted score
  const weights: Record<string, number> = {
    "no-keyword": 10, "kw-title": 10, "kw-intro": 8, "kw-meta-title": 8,
    "kw-meta-desc": 7, "kw-slug": 6, "meta-title-len": 7, "meta-desc-len": 7,
    "heading-h1": 8, "heading-structure": 8, "kw-density": 6, "content-length": 8,
    "internal-links": 7, "image": 5, "readability": 6, "secondary-kw": 5,
  };

  let totalWeight = 0;
  let totalScore = 0;
  for (const check of checks) {
    const w = weights[check.id] || 5;
    totalWeight += w;
    totalScore += check.score * w;
  }

  const score = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

  return { score, checks };
}
