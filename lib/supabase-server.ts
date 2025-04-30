import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Creates a Supabase client for server components with async cookie handling
export async function createServerSupabaseClient() {
  const cookieStore = await cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: { path: string; maxAge: number; domain?: string }) {
          // In server components, we need to be careful about setting cookies
          // This implementation only works for reading cookies
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: { path: string; domain?: string }) {
          // Same caution for removing cookies
          cookieStore.set(name, '', { ...options, maxAge: 0 })
        },
      },
    }
  )
}
