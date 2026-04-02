/**
 * Internal linking suggestions for blog articles
 */

interface ArticleSummary {
  id: string;
  title: string;
  slug: string;
  keywords?: string[] | null;
  category?: string | null;
}

export interface LinkSuggestion {
  articleTitle: string;
  articleSlug: string;
  suggestedAnchorText: string;
  relevanceScore: number;
}

/**
 * Suggest internal links based on keyword overlap between
 * the current article content and other published articles.
 */
export function suggestInternalLinks(
  content: string,
  currentArticleId: string | undefined,
  allArticles: ArticleSummary[]
): LinkSuggestion[] {
  if (!content || allArticles.length === 0) return [];

  const contentLower = content.toLowerCase();
  const suggestions: LinkSuggestion[] = [];

  for (const article of allArticles) {
    // Skip current article
    if (article.id === currentArticleId) continue;

    let score = 0;
    let bestAnchor = article.title;

    // Check if article title words appear in content
    const titleWords = article.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 4); // only meaningful words

    const titleMatches = titleWords.filter((w) => contentLower.includes(w));
    score += titleMatches.length * 2;

    // Check keywords overlap
    if (article.keywords && article.keywords.length > 0) {
      for (const kw of article.keywords) {
        if (contentLower.includes(kw.toLowerCase())) {
          score += 3;
          bestAnchor = kw; // Use matching keyword as anchor text
        }
      }
    }

    // Check if already linked
    const alreadyLinked = content.includes(`/blog/${article.slug}`);
    if (alreadyLinked) continue;

    if (score >= 3) {
      suggestions.push({
        articleTitle: article.title,
        articleSlug: article.slug,
        suggestedAnchorText: bestAnchor,
        relevanceScore: score,
      });
    }
  }

  // Sort by relevance and limit to 5
  return suggestions
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, 5);
}
