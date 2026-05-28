import { NextRequest, NextResponse } from 'next/server'
import { fetchGameServers, TRACKED_GAMES, TrackedGameKey } from '@/lib/gameServers'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const game = searchParams.get('game') as TrackedGameKey | null

  if (game) {
    const config = TRACKED_GAMES[game]
    if (!config) {
      return NextResponse.json({ error: `Unknown game: ${game}` }, { status: 400 })
    }
    const servers = await fetchGameServers(config.appid, 50)
    return NextResponse.json({ game, servers })
  }

  // Fetch all if no game specified
  const results: Record<string, any[]> = {}
  await Promise.all(
    Object.entries(TRACKED_GAMES).map(async ([key, config]) => {
      results[key] = await fetchGameServers(config.appid, 10)
    })
  )

  return NextResponse.json({ servers: results })
}
