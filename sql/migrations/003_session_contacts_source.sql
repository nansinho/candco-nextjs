-- Migration: Ajout du tracking de source sur session_contacts
-- Pour la fonctionnalite "Contact sur place" dans Session -> Formateur

-- 1. Ajout des colonnes de tracking
ALTER TABLE session_contacts
  ADD COLUMN IF NOT EXISTS contact_source text
    CHECK (contact_source IN ('devis', 'rf', 'direction', 'manuel'))
    DEFAULT 'manuel',
  ADD COLUMN IF NOT EXISTS source_ref_id uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS contact_type text
    CHECK (contact_type IN ('formateur', 'sur_place', 'administratif'))
    DEFAULT 'sur_place';

-- 2. Index unique partiel : 1 seul contact "sur_place" par session
CREATE UNIQUE INDEX IF NOT EXISTS idx_session_contacts_sur_place
  ON session_contacts (session_id)
  WHERE contact_type = 'sur_place';

-- 3. RLS
ALTER TABLE session_contacts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'session_contacts'
      AND policyname = 'admin_full_access_session_contacts'
  ) THEN
    CREATE POLICY admin_full_access_session_contacts
      ON session_contacts FOR ALL
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

COMMENT ON COLUMN session_contacts.contact_source IS
  'Origine du contact: devis, rf (responsable_formation), direction, ou manuel';
COMMENT ON COLUMN session_contacts.source_ref_id IS
  'Reference vers l''enregistrement source (devis_requests.id, client_users.id, ou client_contacts.id)';
COMMENT ON COLUMN session_contacts.contact_type IS
  'Type de contact sur la session: sur_place, formateur, administratif';
