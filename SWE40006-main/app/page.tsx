import Header from '@/components/Header'
import ServerList from '@/components/ServerList'

export const revalidate = 30

export default async function HomePage() {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

  let servers: any[] = []
  let pinned: any[] = []

  try {
    const [serversRes, pinnedRes] = await Promise.all([
      fetch(`${backendUrl}/api/servers/730?limit=50`, { next: { revalidate: 30 } }).catch(() => null),
      fetch(`${backendUrl}/api/pinned-servers`, { next: { revalidate: 30 } }).catch(() => null),
    ])

    if (serversRes && serversRes.ok) {
      const data = await serversRes.json()
      servers = data.servers || []
    }
    if (pinnedRes && pinnedRes.ok) {
      const data = await pinnedRes.json()
      pinned = data.pinned || []
    }
  } catch (err) {
    console.error('Failed to fetch home page data:', err)
  }

  const totalPlayers = servers.reduce((s: any, srv: any) => s + srv.players, 0)
  const vacCount = servers.filter((srv: any) => srv.secure).length

  return (
    <>
      <Header />

      <div className="page-hero">
        <div className="page-hero-inner">
          <p className="page-eyebrow">Live · Steam Server Browser</p>
          <h1 className="page-title">CS:GO Server Tracker</h1>
          <p className="page-sub">
            Real-time IP server list for Counter-Strike 2 — refreshed every 30 seconds.
          </p>
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-label">Servers Found</span>
          <span className="stat-value orange">{servers.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Players Online</span>
          <span className="stat-value green">{totalPlayers.toLocaleString()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">VAC Secured</span>
          <span className="stat-value">{vacCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Unsecured</span>
          <span className="stat-value red">{servers.length - vacCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pinned</span>
          <span className="stat-value gold">{pinned.length}</span>
        </div>
      </div>

      <main>
        <ServerList servers={servers} pinned={pinned} />
      </main>

      <footer>
        <strong>CS:GO Server Tracker</strong> — data sourced from the Steam public API · updates every 30 s
      </footer>
    </>
  )
}
