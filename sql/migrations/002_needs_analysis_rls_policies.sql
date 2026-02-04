-- =====================================================
-- Migration: Add RLS policies for needs_analysis tables
-- Description: Enable admin access to needs_analysis_templates and needs_analysis_responses
-- Date: 2026-02-04
-- =====================================================

-- =====================================================
-- needs_analysis_templates RLS policies
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE needs_analysis_templates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (to avoid conflicts)
DROP POLICY IF EXISTS "Service role full access templates" ON needs_analysis_templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON needs_analysis_templates;
DROP POLICY IF EXISTS "Authenticated users can read active templates" ON needs_analysis_templates;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access templates"
ON needs_analysis_templates
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Admins can manage templates
CREATE POLICY "Admins can manage templates"
ON needs_analysis_templates
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

-- Policy: All authenticated users can read active templates
CREATE POLICY "Authenticated users can read active templates"
ON needs_analysis_templates
FOR SELECT
TO authenticated
USING (active = true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON needs_analysis_templates TO authenticated;

-- =====================================================
-- needs_analysis_responses RLS policies
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE needs_analysis_responses ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Service role full access responses" ON needs_analysis_responses;
DROP POLICY IF EXISTS "Admins can manage responses" ON needs_analysis_responses;
DROP POLICY IF EXISTS "Anon can insert responses" ON needs_analysis_responses;
DROP POLICY IF EXISTS "Users can read own responses" ON needs_analysis_responses;

-- Policy: Service role can do everything
CREATE POLICY "Service role full access responses"
ON needs_analysis_responses
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Admins can manage all responses
CREATE POLICY "Admins can manage responses"
ON needs_analysis_responses
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

-- Policy: Anonymous users can insert responses (for public questionnaire)
CREATE POLICY "Anon can insert responses"
ON needs_analysis_responses
FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Users can read their own responses (by email match)
CREATE POLICY "Users can read own responses"
ON needs_analysis_responses
FOR SELECT
TO authenticated
USING (
    respondent_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON needs_analysis_responses TO authenticated;
GRANT INSERT ON needs_analysis_responses TO anon;

-- =====================================================
-- Comments for documentation
-- =====================================================

COMMENT ON POLICY "Admins can manage templates" ON needs_analysis_templates IS
'Allows admin, super_admin, and formateur roles to fully manage questionnaire templates';

COMMENT ON POLICY "Admins can manage responses" ON needs_analysis_responses IS
'Allows admin, super_admin, and formateur roles to read and manage all questionnaire responses';

-- =====================================================
-- Verify the policies are created
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'RLS policies for needs_analysis_templates and needs_analysis_responses have been created successfully';
END $$;
