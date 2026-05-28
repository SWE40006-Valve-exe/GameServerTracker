export interface GameServer {
  addr: string
  name: string
  appid: number
  game: string
  map: string
  players: number
  max_players: number
  bots: number
  secure: boolean
  dedicated: boolean
  os: string
}

export type TrackedGameKey = 'csgo' | '7dtd' | 'rust' | 'tf2'

export const TRACKED_GAMES: Record<TrackedGameKey, { appid: number; label: string }> = {
  csgo: { appid: 730, label: 'CS:GO / CS2' },
  '7dtd': { appid: 251570, label: '7 Days to Die' },
  rust: { appid: 252490, label: 'Rust' },
  tf2: { appid: 440, label: 'Team Fortress 2' },
}

const STEAM_SERVER_LIST = 'https://api.steampowered.com/IGameServersService/GetServerList/v1/'

export async function fetchGameServers(appid: number, limit = 20): Promise<GameServer[]> {
  const key = process.env.STEAM_API_KEY
  if (!key) {
    console.warn('STEAM_API_KEY not set — skipping server fetch')
    return []
  }
  try {
    const params = new URLSearchParams({
      key,
      filter: `\\appid\\${appid}`,
      limit: String(limit),
    })
    const res = await fetch(`${STEAM_SERVER_LIST}?${params}`)
    if (!res.ok) throw new Error(`Steam server API responded with ${res.status}`)
    const data = await res.json()
    return (data.response?.servers ?? []) as GameServer[]
  } catch (error) {
    console.error(`fetchGameServers(${appid}) failed:`, error)
    return []
  }
}
