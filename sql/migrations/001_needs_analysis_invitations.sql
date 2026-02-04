-- =====================================================
-- Migration: Create needs_analysis_invitations table
-- Description: Store magic link invitations for needs analysis questionnaires
-- Date: 2026-02-04
-- =====================================================

-- Create the invitations table
CREATE TABLE IF NOT EXISTS needs_analysis_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES needs_analysis_templates(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    recipient_name TEXT,
    recipient_email TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Create index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_needs_analysis_invitations_token
ON needs_analysis_invitations(token);

-- Create index for template lookups
CREATE INDEX IF NOT EXISTS idx_needs_analysis_invitations_template_id
ON needs_analysis_invitations(template_id);

-- Create index for expiration checks
CREATE INDEX IF NOT EXISTS idx_needs_analysis_invitations_expires_at
ON needs_analysis_invitations(expires_at)
WHERE used_at IS NULL;

-- Enable Row Level Security
ALTER TABLE needs_analysis_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role has full access to invitations"
ON needs_analysis_invitations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Authenticated admins can manage invitations
CREATE POLICY "Admins can manage invitations"
ON needs_analysis_invitations
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND u.role IN ('super_admin', 'admin', 'formateur')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = auth.uid()
        AND u.role IN ('super_admin', 'admin', 'formateur')
    )
);

-- Policy: Anonymous users can read invitations by token (for the public questionnaire page)
CREATE POLICY "Anyone can read invitation by token"
ON needs_analysis_invitations
FOR SELECT
TO anon
USING (true);

-- Policy: Anonymous users can update used_at (mark as used)
CREATE POLICY "Anyone can mark invitation as used"
ON needs_analysis_invitations
FOR UPDATE
TO anon
USING (true)
WITH CHECK (
    -- Only allow updating used_at field
    used_at IS NOT NULL
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON needs_analysis_invitations TO authenticated;
GRANT SELECT, UPDATE ON needs_analysis_invitations TO anon;

-- =====================================================
-- Add visibility column to templates if not exists
-- =====================================================

-- Add visibility column for templates (public/private)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'needs_analysis_templates'
        AND column_name = 'visibility'
    ) THEN
        ALTER TABLE needs_analysis_templates
        ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private'));
    END IF;
END $$;

-- =====================================================
-- Function to clean up expired invitations
-- =====================================================

CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM needs_analysis_invitations
    WHERE expires_at < NOW() - INTERVAL '30 days'
    AND used_at IS NULL;

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON TABLE needs_analysis_invitations IS
'Stores magic link invitations for needs analysis questionnaires';

COMMENT ON COLUMN needs_analysis_invitations.token IS
'Unique token for the magic link URL';

COMMENT ON COLUMN needs_analysis_invitations.expires_at IS
'Timestamp when the invitation link expires';

COMMENT ON COLUMN needs_analysis_invitations.used_at IS
'Timestamp when the questionnaire was completed, NULL if not used';
