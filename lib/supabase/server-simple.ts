import { createServerClient } from '@supabase/ssr';

// Simplified server client without cookie handling
export function createSimpleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // No-op for simple client
        },
      },
    }
  );
}
