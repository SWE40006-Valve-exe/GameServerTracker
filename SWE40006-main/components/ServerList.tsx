'use client'

import { useState, useMemo } from 'react'
import type { GameServer } from '@/lib/gameServers'
import type { PinnedServer } from '@/lib/pinnedServers'

interface ServerListProps {
  servers: GameServer[]
  pinned?: PinnedServer[]
}

type SortKey = 'players' | 'name' | 'map'
type ViewMode = 'grid' | 'list'

// ── Shared helpers ────────────────────────────────────────────────────────────

function fillPct(srv: GameServer) {
  return srv.max_players > 0
    ? Math.round((srv.players / srv.max_players) * 100)
    : 0
}

function PlayerBar({ srv }: { srv: GameServer }) {
  const pct = fillPct(srv)
  const full = srv.players >= srv.max_players
  return (
    <div className="server-fill-bar">
      <div
        className={`server-fill-inner${full ? ' full' : ''}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ── Icon components ───────────────────────────────────────────────────────────

function IconGrid({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"
      style={{ opacity: active ? 1 : 0.45 }}>
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  )
}

function IconList({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"
      style={{ opacity: active ? 1 : 0.45 }}>
      <rect x="1" y="2" width="14" height="2" rx="1" />
      <rect x="1" y="7" width="14" height="2" rx="1" />
      <rect x="1" y="12" width="14" height="2" rx="1" />
    </svg>
  )
}

function PinButton({
  pinned,
  pending,
  onClick,
  label,
}: {
  pinned: boolean
  pending?: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      className={`pin-btn${pinned ? ' pinned' : ''}`}
      onClick={onClick}
      disabled={pending}
      aria-label={label}
      title={label}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        {pinned ? (
          <path d="M3 2h10a1 1 0 011 1v11.5l-6-3-6 3V3a1 1 0 011-1z" />
        ) : (
          <path
            fillRule="evenodd"
            d="M3 2h10a1 1 0 011 1v11.5l-6-3-6 3V3a1 1 0 011-1zm1 1.5v9.3l5-2.5 5 2.5V3.5H4z"
          />
        )}
      </svg>
    </button>
  )
}

// ── Grid card ─────────────────────────────────────────────────────────────────

function ServerCard({
  srv,
  pinnedMeta,
  onPin,
  onUnpin,
  pending,
}: {
  srv: GameServer
  pinnedMeta?: PinnedServer
  onPin: (addr: string) => void
  onUnpin: (addr: string) => void
  pending?: boolean
}) {
  const pct = fillPct(srv)
  const full = srv.players >= srv.max_players
  return (
    <div className={`server-card${pinnedMeta ? ' pinned' : ''}`}>
      <div className="server-card-head">
        <div className="server-card-head-left">
          {pinnedMeta && <span className="pin-badge">&#9679; Pinned</span>}
          {pinnedMeta?.tag && <span className="tag-badge">{pinnedMeta.tag}</span>}
        </div>
        <div className="server-card-head-right">
          <span className={`vac-badge ${srv.secure ? 'vac-on' : 'vac-off'}`}>
            {srv.secure ? 'VAC' : 'NO VAC'}
          </span>
          <span className="server-os">{srv.os === 'l' ? 'Linux' : 'Windows'}</span>
          <PinButton
            pinned={!!pinnedMeta}
            pending={pending}
            onClick={() => pinnedMeta ? onUnpin(srv.addr) : onPin(srv.addr)}
            label={pinnedMeta ? 'Unpin server' : 'Pin server'}
          />
        </div>
      </div>

      <div className="server-name" title={srv.name}>
        {pinnedMeta?.label ?? srv.name}
      </div>
      {pinnedMeta?.label && pinnedMeta.label !== srv.name && (
        <div className="server-name-raw">{srv.name}</div>
      )}

      <div className="server-meta-row">
        <span className="server-ip">{srv.addr}</span>
      </div>

      <div className="server-map-row">
        <span className="server-map-label">Map</span>
        <span className="server-map">{srv.map}</span>
      </div>

      <div className="server-players-row">
        <span className={`server-players-count${full ? ' full' : ''}`}>
          {`${srv.players}/${srv.max_players}`}
          {srv.bots > 0 && <span className="bot-tag">{` +${srv.bots} bots`}</span>}
        </span>
        <span className="server-fill-pct">{pct}%</span>
      </div>

      <PlayerBar srv={srv} />
    </div>
  )
}

// ── List row ──────────────────────────────────────────────────────────────────

function ServerRow({
  srv,
  pinnedMeta,
  onPin,
  onUnpin,
  pending,
}: {
  srv: GameServer
  pinnedMeta?: PinnedServer
  onPin: (addr: string) => void
  onUnpin: (addr: string) => void
  pending?: boolean
}) {
  const pct = fillPct(srv)
  const full = srv.players >= srv.max_players
  return (
    <div className={`server-row${pinnedMeta ? ' pinned' : ''}`}>
      <div className="sr-name-col">
        <div className="sr-name" title={srv.name}>
          {pinnedMeta?.label ?? srv.name}
          {pinnedMeta && <span className="pin-badge sr-pin">&#9679;</span>}
        </div>
        <div className="server-ip">{srv.addr}</div>
      </div>

      <div className="sr-map-col">
        <span className="server-map">{srv.map}</span>
      </div>

      <div className="sr-players-col">
        <span className={`server-players-count${full ? ' full' : ''}`}>
          {`${srv.players}/${srv.max_players}`}
        </span>
        <div className="sr-fill-bar">
          <div
            className={`server-fill-inner${full ? ' full' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="sr-badges-col">
        <span className={`vac-badge ${srv.secure ? 'vac-on' : 'vac-off'}`}>
          {srv.secure ? 'VAC' : 'NO VAC'}
        </span>
        {pinnedMeta?.tag && <span className="tag-badge">{pinnedMeta.tag}</span>}
      </div>

      <div className="sr-os-col">
        <span className="server-os">{srv.os === 'l' ? 'Linux' : 'Win'}</span>
      </div>

      <div className="sr-pin-col">
        <PinButton
          pinned={!!pinnedMeta}
          pending={pending}
          onClick={() => pinnedMeta ? onUnpin(srv.addr) : onPin(srv.addr)}
          label={pinnedMeta ? 'Unpin server' : 'Pin server'}
        />
      </div>
    </div>
  )
}

// ── Offline pinned ────────────────────────────────────────────────────────────

function OfflinePinnedCard({
  p,
  onUnpin,
  pending,
}: {
  p: PinnedServer
  onUnpin: (addr: string) => void
  pending?: boolean
}) {
  return (
    <div className="server-card pinned offline">
      <div className="server-card-head">
        <div className="server-card-head-left">
          <span className="pin-badge">&#9679; Pinned</span>
          {p.tag && <span className="tag-badge">{p.tag}</span>}
        </div>
        <div className="server-card-head-right">
          <span className="offline-badge">Offline</span>
          <PinButton
            pinned
            pending={pending}
            onClick={() => onUnpin(p.addr)}
            label="Unpin server"
          />
        </div>
      </div>
      <div className="server-name">{p.label ?? p.addr}</div>
      <div className="server-meta-row">
        <span className="server-ip">{p.addr}</span>
      </div>
    </div>
  )
}

function OfflinePinnedRow({
  p,
  onUnpin,
  pending,
}: {
  p: PinnedServer
  onUnpin: (addr: string) => void
  pending?: boolean
}) {
  return (
    <div className="server-row pinned offline">
      <div className="sr-name-col">
        <div className="sr-name">
          {p.label ?? p.addr}
          <span className="pin-badge sr-pin">&#9679;</span>
        </div>
        <div className="server-ip">{p.addr}</div>
      </div>
      <div className="sr-map-col">—</div>
      <div className="sr-players-col">—</div>
      <div className="sr-badges-col">
        <span className="offline-badge">Offline</span>
        {p.tag && <span className="tag-badge">{p.tag}</span>}
      </div>
      <div className="sr-os-col">—</div>
      <div className="sr-pin-col">
        <PinButton
          pinned
          pending={pending}
          onClick={() => onUnpin(p.addr)}
          label="Unpin server"
        />
      </div>
    </div>
  )
}

// ── List-view header row ──────────────────────────────────────────────────────

function ListHeader() {
  return (
    <div className="server-list-header">
      <div className="sr-name-col">Server / IP</div>
      <div className="sr-map-col">Map</div>
      <div className="sr-players-col">Players</div>
      <div className="sr-badges-col">Status</div>
      <div className="sr-os-col">OS</div>
      <div className="sr-pin-col"></div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ServerList({ servers, pinned: initialPinned = [] }: ServerListProps) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('players')
  const [vacOnly, setVacOnly] = useState(false)
  const [view, setView] = useState<ViewMode>('grid')
  const [localPinned, setLocalPinned] = useState<PinnedServer[]>(initialPinned)
  const [pendingAddrs, setPendingAddrs] = useState<Set<string>>(new Set())

  const liveByAddr = useMemo(
    () => new Map(servers.map((s) => [s.addr, s])),
    [servers]
  )
  const pinnedAddrs = useMemo(() => new Set(localPinned.map((p) => p.addr)), [localPinned])

  const pinnedCards = useMemo(
    () => localPinned.map((p) => ({ pinned: p, live: liveByAddr.get(p.addr) })),
    [localPinned, liveByAddr]
  )

  const liveSorted = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = servers.filter((s) => !pinnedAddrs.has(s.addr))
    if (vacOnly) list = list.filter((s) => s.secure)
    if (q) list = list.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.addr.includes(q) ||
      s.map.toLowerCase().includes(q)
    )
    const sorted = [...list]
    if (sort === 'players') sorted.sort((a, b) => b.players - a.players)
    else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'map') sorted.sort((a, b) => a.map.localeCompare(b.map))
    return sorted
  }, [servers, pinnedAddrs, query, sort, vacOnly])

  async function handlePin(addr: string) {
    if (pendingAddrs.has(addr)) return
    setPendingAddrs((prev) => new Set(prev).add(addr))
    const tempEntry: PinnedServer = { id: `temp-${addr}`, addr, label: null, tag: null }
    setLocalPinned((prev) => [...prev, tempEntry])
    try {
      const res = await fetch('/api/pinned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addr }),
      })
      if (res.ok) {
        const { pinned: saved } = await res.json() as { pinned: PinnedServer }
        setLocalPinned((prev) => prev.map((p) => p.id === tempEntry.id ? saved : p))
      } else {
        setLocalPinned((prev) => prev.filter((p) => p.id !== tempEntry.id))
      }
    } catch {
      setLocalPinned((prev) => prev.filter((p) => p.id !== tempEntry.id))
    } finally {
      setPendingAddrs((prev) => { const s = new Set(prev); s.delete(addr); return s })
    }
  }

  async function handleUnpin(addr: string) {
    if (pendingAddrs.has(addr)) return
    const snapshot = localPinned.find((p) => p.addr === addr)
    if (!snapshot) return
    setPendingAddrs((prev) => new Set(prev).add(addr))
    setLocalPinned((prev) => prev.filter((p) => p.addr !== addr))
    try {
      const res = await fetch(`/api/pinned?addr=${encodeURIComponent(addr)}`, { method: 'DELETE' })
      if (!res.ok) setLocalPinned((prev) => [...prev, snapshot])
    } catch {
      setLocalPinned((prev) => [...prev, snapshot])
    } finally {
      setPendingAddrs((prev) => { const s = new Set(prev); s.delete(addr); return s })
    }
  }

  if (servers.length === 0 && localPinned.length === 0) {
    return (
      <div className="server-empty-box">
        <div className="server-empty-icon">⚠</div>
        <p className="server-empty-title">No servers available</p>
        <p className="server-empty-hint">
          Set <code>STEAM_API_KEY</code> in your environment variables to enable live server tracking.
        </p>
      </div>
    )
  }

  const isGrid = view === 'grid'

  return (
    <>
      {/* ── PINNED SECTION ── */}
      {pinnedCards.length > 0 && (
        <section className="pinned-section">
          <div className="section-header">
            <h2 className="section-title">Pinned Servers</h2>
            <span className="section-link">{pinnedCards.length} pinned</span>
          </div>
          {isGrid ? (
            <div className="server-grid">
              {pinnedCards.map(({ pinned: p, live }) =>
                live
                  ? <ServerCard key={p.id} srv={live} pinnedMeta={p} onPin={handlePin} onUnpin={handleUnpin} pending={pendingAddrs.has(p.addr)} />
                  : <OfflinePinnedCard key={p.id} p={p} onUnpin={handleUnpin} pending={pendingAddrs.has(p.addr)} />
              )}
            </div>
          ) : (
            <div className="server-list">
              <ListHeader />
              {pinnedCards.map(({ pinned: p, live }) =>
                live
                  ? <ServerRow key={p.id} srv={live} pinnedMeta={p} onPin={handlePin} onUnpin={handleUnpin} pending={pendingAddrs.has(p.addr)} />
                  : <OfflinePinnedRow key={p.id} p={p} onUnpin={handleUnpin} pending={pendingAddrs.has(p.addr)} />
              )}
            </div>
          )}
        </section>
      )}

      {/* ── LIVE SERVERS ── */}
      <section>
        <div className="section-header">
          <h2 className="section-title">Live Servers</h2>
          <span className="section-link">CS:GO · AppID 730</span>
        </div>

        <div className="server-filter-row">
          <input
            className="search-bar"
            type="text"
            placeholder="Search by name, IP, or map…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="players">Most Players</option>
            <option value="name">Name A–Z</option>
            <option value="map">Map A–Z</option>
          </select>
          <label className="vac-toggle">
            <input
              type="checkbox"
              checked={vacOnly}
              onChange={(e) => setVacOnly(e.target.checked)}
            />
            VAC only
          </label>

          <div className="view-toggle" role="group" aria-label="View mode">
            <button
              className={`view-btn${isGrid ? ' active' : ''}`}
              onClick={() => setView('grid')}
              aria-label="Grid view"
              aria-pressed={isGrid}
            >
              <IconGrid active={isGrid} />
            </button>
            <button
              className={`view-btn${!isGrid ? ' active' : ''}`}
              onClick={() => setView('list')}
              aria-label="List view"
              aria-pressed={!isGrid}
            >
              <IconList active={!isGrid} />
            </button>
          </div>
        </div>

        {liveSorted.length === 0 ? (
          <p className="server-no-results">No servers match your filters.</p>
        ) : isGrid ? (
          <div className="server-grid">
            {liveSorted.map((srv) => (
              <ServerCard key={srv.addr} srv={srv} onPin={handlePin} onUnpin={handleUnpin} pending={pendingAddrs.has(srv.addr)} />
            ))}
          </div>
        ) : (
          <div className="server-list">
            <ListHeader />
            {liveSorted.map((srv) => (
              <ServerRow key={srv.addr} srv={srv} onPin={handlePin} onUnpin={handleUnpin} pending={pendingAddrs.has(srv.addr)} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
