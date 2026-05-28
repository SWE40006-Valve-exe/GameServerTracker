import { NextRequest, NextResponse } from 'next/server'
import { fetchHotSkins } from '@/lib/market'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const game = searchParams.get('game') || 'csgo'

  let appid = 730
  if (game === 'csgo') {
    appid = 730
  } else if (game === 'tf2') {
    appid = 440
  } else {
    return NextResponse.json({ error: `Unknown game: ${game}` }, { status: 400 })
  }

  try {
    const items = await fetchHotSkins(appid, 15)
    return NextResponse.json({ game, items })
  } catch (error) {
    console.error(`GET /api/market for ${game} failed:`, error)
    return NextResponse.json({ error: 'Failed to fetch market skins' }, { status: 500 })
  }
}
