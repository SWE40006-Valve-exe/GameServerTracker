import { getSupabase } from './supabase'

export interface PinnedServer {
  id: string
  addr: string
  label: string | null
  tag: string | null
}

export async function fetchPinnedServers(): Promise<PinnedServer[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  try {
    const { data, error } = await supabase
      .from('pinned_servers')
      .select('id, addr, label, tag')
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data || []) as PinnedServer[]
  } catch (err) {
    console.error('fetchPinnedServers failed:', err)
    return []
  }
}
