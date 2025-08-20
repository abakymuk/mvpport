import { createServerClient } from '@supabase/ssr';

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  console.log('createClient - Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET');
  console.log(
    'createClient - Supabase Anon Key:',
    supabaseAnonKey ? 'SET' : 'NOT SET'
  );

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. Please check your .env.local file.'
    );
  }

  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    console.log('createClient - Cookies loaded successfully');

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    });
  } catch {
    // The `cookies` function was called from a Server Component.
    // This can be ignored if you have middleware refreshing
    // user sessions.
    console.log('createClient - Using fallback client (no cookies)');

    return createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        },
      },
    });
  }
}
