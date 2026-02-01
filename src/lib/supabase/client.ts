import { createBrowserClient } from '@supabase/ssr'

// SINGLETON - un seul client pour toute l'application
// Évite les boucles infinies avec TanStack Query causées par
// la création de multiples instances
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabaseClient
}

// Export direct pour compatibilité avec le pattern original
export const supabase = createClient()
