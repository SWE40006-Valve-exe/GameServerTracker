import { NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
  }

  try {
    const body = await req.json()
    const { addr, label, tag } = body

    if (!addr) {
      return NextResponse.json({ error: 'addr is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('pinned_servers')
      .insert({ addr, label, tag })
      .select()
      .single()

    if (error) {
      console.error('Failed to insert pinned server:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ pinned: data }, { status: 201 })
  } catch (error) {
    console.error('POST /api/pinned failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase()
  if (!supabase) {
    return NextResponse.json({ error: 'Database service unavailable' }, { status: 503 })
  }

  const { searchParams } = new URL(req.url)
  const addr = searchParams.get('addr')

  if (!addr) {
    return NextResponse.json({ error: 'addr is required' }, { status: 400 })
  }

  try {
    const { error } = await supabase
      .from('pinned_servers')
      .delete()
      .eq('addr', addr)

    if (error) {
      console.error('Failed to delete pinned server:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('DELETE /api/pinned failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
