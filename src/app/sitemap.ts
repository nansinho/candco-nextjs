import { MetadataRoute } from "next";
import { createServiceClient, ORG_ID } from "@/lib/supabase/service";
import { getPoleFromDomaine } from "@/lib/domaines";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://candco.fr";
  const supabase = createServiceClient();

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/formations`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/a-propos`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/pole/securite-prevention`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/pole/petite-enfance`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/pole/sante`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/mentions-legales`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/confidentialite`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/cookies`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Formations dynamiques
  const { data: formations } = await supabase
    .from("produits_formation")
    .select("slug, domaine, updated_at")
    .eq("organisation_id", ORG_ID)
    .eq("publie", true);

  const formationPages: MetadataRoute.Sitemap = (formations || []).map(
    (f: Record<string, unknown>) => {
      const pole = getPoleFromDomaine(f.domaine as string).pole;
      return {
        url: `${baseUrl}/formations/${pole}/${f.slug}`,
        lastModified: f.updated_at ? new Date(f.updated_at as string) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    }
  );

  // Articles de blog (table propre au site vitrine)
  const { data: articles } = await supabase
    .from("blog_articles")
    .select("slug, updated_at")
    .eq("published", true);

  const blogPages: MetadataRoute.Sitemap = (articles || []).map(
    (article: Record<string, unknown>) => ({
      url: `${baseUrl}/blog/${article.slug}`,
      lastModified: article.updated_at ? new Date(article.updated_at as string) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })
  );

  return [...staticPages, ...formationPages, ...blogPages];
}
