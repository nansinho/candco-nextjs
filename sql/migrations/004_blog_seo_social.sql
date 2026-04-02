-- Migration 004: Blog SEO + AI + Social fields
-- Adds SEO analysis, AI generation tracking, and social media fields to blog_articles

ALTER TABLE public.blog_articles
  ADD COLUMN IF NOT EXISTS focus_keyword text,
  ADD COLUMN IF NOT EXISTS secondary_keywords text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS keywords text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS seo_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS social_linkedin_text text,
  ADD COLUMN IF NOT EXISTS social_facebook_text text,
  ADD COLUMN IF NOT EXISTS ai_generated boolean DEFAULT false;

-- Index for SEO keyword lookups
CREATE INDEX IF NOT EXISTS idx_blog_articles_focus_keyword ON public.blog_articles(focus_keyword);
