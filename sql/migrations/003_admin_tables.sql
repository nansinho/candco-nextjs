-- ============================================================
-- Migration 003: Tables admin du site vitrine C&Co Formation
-- Crée les tables manquantes pour le dashboard admin
-- Idempotent : peut être relancé sans erreur
-- ============================================================

-- =========================
-- 1. blog_articles
-- =========================
CREATE TABLE IF NOT EXISTS public.blog_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  category text NOT NULL,
  author text DEFAULT 'C&Co Formation',
  content text,
  excerpt text,
  image_url text,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  published_at timestamptz,
  read_time text,
  meta_title text,
  meta_description text,
  original_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_blog_articles_slug ON public.blog_articles(slug);
CREATE INDEX IF NOT EXISTS idx_blog_articles_published ON public.blog_articles(published);
CREATE INDEX IF NOT EXISTS idx_blog_articles_category ON public.blog_articles(category);

-- =========================
-- 2. faq_categories
-- =========================
CREATE TABLE IF NOT EXISTS public.faq_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- =========================
-- 3. faq_items
-- =========================
CREATE TABLE IF NOT EXISTS public.faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category_id uuid NOT NULL REFERENCES public.faq_categories(id) ON DELETE CASCADE,
  keywords text[],
  display_order integer DEFAULT 0,
  active boolean DEFAULT true,
  view_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  not_helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_faq_items_category ON public.faq_items(category_id);

-- =========================
-- 4. media
-- =========================
CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL,
  file_size bigint,
  alt_text text,
  description text,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_file_type ON public.media(file_type);

-- =========================
-- 5. contact_submissions
-- =========================
CREATE TABLE IF NOT EXISTS public.contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  replied boolean DEFAULT false,
  replied_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_read ON public.contact_submissions(read);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created ON public.contact_submissions(created_at DESC);

-- =========================
-- 6. redirects
-- =========================
CREATE TABLE IF NOT EXISTS public.redirects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_path text NOT NULL UNIQUE,
  target_path text NOT NULL,
  status_code integer DEFAULT 301,
  is_active boolean DEFAULT true,
  notes text,
  hit_count integer DEFAULT 0,
  last_hit_at timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_redirects_source ON public.redirects(source_path);
CREATE INDEX IF NOT EXISTS idx_redirects_active ON public.redirects(is_active);

-- =========================
-- 7. site_settings
-- =========================
CREATE TABLE IF NOT EXISTS public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- =========================
-- 8. cookie_consents
-- =========================
CREATE TABLE IF NOT EXISTS public.cookie_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  user_id uuid,
  essential boolean DEFAULT true,
  functional boolean DEFAULT false,
  analytics boolean DEFAULT false,
  consent_method text DEFAULT 'banner',
  consent_date timestamptz DEFAULT now() NOT NULL,
  ip_hash text,
  user_agent text,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cookie_consents_visitor ON public.cookie_consents(visitor_id);

-- =========================
-- 9. categories
-- =========================
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  pole_id uuid,
  count integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- =========================
-- 10. chat_nodes (chatbot vitrine)
-- =========================
CREATE TABLE IF NOT EXISTS public.chat_nodes (
  id text PRIMARY KEY,
  message text NOT NULL,
  is_end boolean DEFAULT false,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- =========================
-- 11. chat_options (réponses chatbot)
-- =========================
CREATE TABLE IF NOT EXISTS public.chat_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id text NOT NULL REFERENCES public.chat_nodes(id) ON DELETE CASCADE,
  label text NOT NULL,
  icon text,
  next_node_id text REFERENCES public.chat_nodes(id) ON DELETE SET NULL,
  action_type text,
  action_value text,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_options_node ON public.chat_options(node_id);

-- =========================
-- 12. chat_analytics (tracking chatbot)
-- =========================
CREATE TABLE IF NOT EXISTS public.chat_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  node_id text NOT NULL,
  option_id text,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================
-- RLS : Activer sur toutes les tables
-- ============================================================
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cookie_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_analytics ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies (DROP + CREATE pour idempotence)
-- ============================================================

-- blog_articles
DROP POLICY IF EXISTS "Public read blog_articles" ON public.blog_articles;
CREATE POLICY "Public read blog_articles" ON public.blog_articles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users manage blog_articles" ON public.blog_articles;
CREATE POLICY "Auth users manage blog_articles" ON public.blog_articles FOR ALL USING (auth.role() = 'authenticated');

-- faq_categories
DROP POLICY IF EXISTS "Public read faq_categories" ON public.faq_categories;
CREATE POLICY "Public read faq_categories" ON public.faq_categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users manage faq_categories" ON public.faq_categories;
CREATE POLICY "Auth users manage faq_categories" ON public.faq_categories FOR ALL USING (auth.role() = 'authenticated');

-- faq_items
DROP POLICY IF EXISTS "Public read faq_items" ON public.faq_items;
CREATE POLICY "Public read faq_items" ON public.faq_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users manage faq_items" ON public.faq_items;
CREATE POLICY "Auth users manage faq_items" ON public.faq_items FOR ALL USING (auth.role() = 'authenticated');

-- media
DROP POLICY IF EXISTS "Public read media" ON public.media;
CREATE POLICY "Public read media" ON public.media FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users manage media" ON public.media;
CREATE POLICY "Auth users manage media" ON public.media FOR ALL USING (auth.role() = 'authenticated');

-- contact_submissions
DROP POLICY IF EXISTS "Public insert contact_submissions" ON public.contact_submissions;
CREATE POLICY "Public insert contact_submissions" ON public.contact_submissions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Auth users manage contact_submissions" ON public.contact_submissions;
CREATE POLICY "Auth users manage contact_submissions" ON public.contact_submissions FOR ALL USING (auth.role() = 'authenticated');

-- redirects
DROP POLICY IF EXISTS "Public read redirects" ON public.redirects;
CREATE POLICY "Public read redirects" ON public.redirects FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users manage redirects" ON public.redirects;
CREATE POLICY "Auth users manage redirects" ON public.redirects FOR ALL USING (auth.role() = 'authenticated');

-- site_settings
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users manage site_settings" ON public.site_settings;
CREATE POLICY "Auth users manage site_settings" ON public.site_settings FOR ALL USING (auth.role() = 'authenticated');

-- cookie_consents
DROP POLICY IF EXISTS "Public insert cookie_consents" ON public.cookie_consents;
CREATE POLICY "Public insert cookie_consents" ON public.cookie_consents FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Auth users read cookie_consents" ON public.cookie_consents;
CREATE POLICY "Auth users read cookie_consents" ON public.cookie_consents FOR SELECT USING (auth.role() = 'authenticated');

-- categories
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users manage categories" ON public.categories;
CREATE POLICY "Auth users manage categories" ON public.categories FOR ALL USING (auth.role() = 'authenticated');

-- chat_nodes
DROP POLICY IF EXISTS "Public read chat_nodes" ON public.chat_nodes;
CREATE POLICY "Public read chat_nodes" ON public.chat_nodes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users manage chat_nodes" ON public.chat_nodes;
CREATE POLICY "Auth users manage chat_nodes" ON public.chat_nodes FOR ALL USING (auth.role() = 'authenticated');

-- chat_options
DROP POLICY IF EXISTS "Public read chat_options" ON public.chat_options;
CREATE POLICY "Public read chat_options" ON public.chat_options FOR SELECT USING (true);
DROP POLICY IF EXISTS "Auth users manage chat_options" ON public.chat_options;
CREATE POLICY "Auth users manage chat_options" ON public.chat_options FOR ALL USING (auth.role() = 'authenticated');

-- chat_analytics
DROP POLICY IF EXISTS "Public insert chat_analytics" ON public.chat_analytics;
CREATE POLICY "Public insert chat_analytics" ON public.chat_analytics FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Auth users read chat_analytics" ON public.chat_analytics;
CREATE POLICY "Auth users read chat_analytics" ON public.chat_analytics FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- Triggers pour updated_at automatique
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_blog_articles_updated_at ON public.blog_articles;
CREATE TRIGGER set_blog_articles_updated_at
  BEFORE UPDATE ON public.blog_articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_faq_categories_updated_at ON public.faq_categories;
CREATE TRIGGER set_faq_categories_updated_at
  BEFORE UPDATE ON public.faq_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_faq_items_updated_at ON public.faq_items;
CREATE TRIGGER set_faq_items_updated_at
  BEFORE UPDATE ON public.faq_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_redirects_updated_at ON public.redirects;
CREATE TRIGGER set_redirects_updated_at
  BEFORE UPDATE ON public.redirects
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON public.site_settings;
CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Commentaires pour identifier les tables vitrine
-- ============================================================
COMMENT ON TABLE public.blog_articles IS '[VITRINE] Articles de blog du site vitrine';
COMMENT ON TABLE public.faq_categories IS '[VITRINE] Catégories FAQ du site vitrine';
COMMENT ON TABLE public.faq_items IS '[VITRINE] Questions/réponses FAQ du site vitrine';
COMMENT ON TABLE public.media IS '[VITRINE] Médiathèque du site vitrine';
COMMENT ON TABLE public.contact_submissions IS '[VITRINE] Soumissions formulaire de contact';
COMMENT ON TABLE public.redirects IS '[VITRINE] Redirections URL (SEO)';
COMMENT ON TABLE public.site_settings IS '[VITRINE] Paramètres clé/valeur du site vitrine';
COMMENT ON TABLE public.cookie_consents IS '[VITRINE] Consentements cookies RGPD';
COMMENT ON TABLE public.categories IS '[VITRINE] Catégories de contenu du site vitrine';
COMMENT ON TABLE public.chat_nodes IS '[VITRINE] Noeuds de l''arbre de décision du chatbot';
COMMENT ON TABLE public.chat_options IS '[VITRINE] Options de réponse du chatbot';
COMMENT ON TABLE public.chat_analytics IS '[VITRINE] Analytics des interactions chatbot';
