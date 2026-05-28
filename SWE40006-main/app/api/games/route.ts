import { NextResponse } from 'next/server'
import { fetchTopSellers } from '@/lib/steam'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await fetchTopSellers()
    if (!items || items.length === 0) {
      // To satisfy the "Steam API fails" scenario
      throw new Error('No items returned from Steam API')
    }
    return NextResponse.json({ games: items })
  } catch (error) {
    console.error('GET /api/games failed:', error)
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
  }
}
