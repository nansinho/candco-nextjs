import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js";

let serviceClient: SupabaseClient | null = null;

/**
 * Singleton Supabase client with service role key for server-side operations.
 * Bypasses RLS - use only in API routes and Server Components.
 * Never expose to the client.
 */
export function createServiceClient(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }
  return serviceClient;
}

/** C&Co organization ID */
export const ORG_ID = process.env.NEXT_PUBLIC_ORGANIZATION_ID!;
