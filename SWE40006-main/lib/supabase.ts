import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || url.includes('your-project-id') || !key || key.includes('your_supabase')) {
    console.warn('Supabase env credentials missing or placeholders - client deactivated')
    return null
  }

  _client = createClient(url, key)
  return _client
}
