import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ServerList from '@/components/ServerList'
import SkinList from '@/components/SkinList'
import NewsSection from '@/components/NewsSection'
import type { GameServer } from '@/lib/gameServers'
import type { PinnedServer } from '@/lib/pinnedServers'
import type { MarketItem, NewsItem } from '@/lib/market'

const mockServer: GameServer = {
  addr: '1.2.3.4:27015',
  name: 'Test CS:GO Server',
  appid: 730,
  game: 'csgo',
  map: 'de_dust2',
  players: 10,
  max_players: 20,
  bots: 0,
  secure: true,
  dedicated: true,
  os: 'l',
}

const mockSkin: MarketItem = {
  name: 'AK-47 | Redline (Field-Tested)',
  hash_name: 'AK-47 | Redline (Field-Tested)',
  sell_listings: 12345,
  sell_price: 500,
  sell_price_text: '$5.00',
  icon_url: 'https://example.com/icon.png',
}

const mockNews: NewsItem = {
  gid: '1',
  title: 'CS2 Update — New Operation',
  url: 'https://store.steampowered.com/news/app/730',
  author: 'Valve',
  contents: 'A brand new operation has launched with new missions.',
  feedlabel: 'CS2 Update',
  date: 1700000000,
}

describe('NewsSection', () => {
  it('renders news title and feed label', () => {
    render(<NewsSection items={[mockNews]} />)
    expect(screen.getByText('CS2 Update — New Operation')).toBeInTheDocument()
    expect(screen.getByText('CS2 Update')).toBeInTheDocument()
  })

  it('renders excerpt text', () => {
    render(<NewsSection items={[mockNews]} />)
    expect(screen.getByText(/brand new operation/)).toBeInTheDocument()
  })

  it('shows empty message when no items', () => {
    render(<NewsSection items={[]} />)
    expect(screen.getByText(/No news available/)).toBeInTheDocument()
  })
})

const mockPinned: PinnedServer = {
  id: 'pin-1',
  addr: '1.2.3.4:27015',
  label: 'My Favourite Server',
  tag: 'Official',
}

describe('ServerList — view toggle', () => {
  it('defaults to grid view (server-grid present)', () => {
    const { container } = render(<ServerList servers={[mockServer]} />)
    expect(container.querySelector('.server-grid')).toBeInTheDocument()
    expect(container.querySelector('.server-list')).not.toBeInTheDocument()
  })

  it('switches to list view when list button is pressed', () => {
    const { container } = render(<ServerList servers={[mockServer]} />)
    fireEvent.click(screen.getByRole('button', { name: 'List view' }))
    expect(container.querySelector('.server-list')).toBeInTheDocument()
    expect(container.querySelector('.server-grid')).not.toBeInTheDocument()
  })

  it('switches back to grid view from list view', () => {
    const { container } = render(<ServerList servers={[mockServer]} />)
    fireEvent.click(screen.getByRole('button', { name: 'List view' }))
    fireEvent.click(screen.getByRole('button', { name: 'Grid view' }))
    expect(container.querySelector('.server-grid')).toBeInTheDocument()
    expect(container.querySelector('.server-list')).not.toBeInTheDocument()
  })

  it('shows list header row in list view', () => {
    render(<ServerList servers={[mockServer]} />)
    fireEvent.click(screen.getByRole('button', { name: 'List view' }))
    expect(screen.getByText('Server / IP')).toBeInTheDocument()
  })
})

describe('ServerList', () => {
  it('renders server name, map, and IP', () => {
    render(<ServerList servers={[mockServer]} />)
    expect(screen.getByText('Test CS:GO Server')).toBeInTheDocument()
    expect(screen.getByText('de_dust2')).toBeInTheDocument()
    expect(screen.getByText('1.2.3.4:27015')).toBeInTheDocument()
  })

  it('renders player count', () => {
    render(<ServerList servers={[mockServer]} />)
    expect(screen.getByText('10/20')).toBeInTheDocument()
  })

  it('shows empty state when list is empty', () => {
    render(<ServerList servers={[]} />)
    expect(screen.getByText(/No servers available/)).toBeInTheDocument()
  })

  it('shows VAC badge for secure servers', () => {
    render(<ServerList servers={[mockServer]} />)
    expect(screen.getByText('VAC')).toBeInTheDocument()
  })

  it('shows NO VAC badge for insecure servers', () => {
    render(<ServerList servers={[{ ...mockServer, secure: false }]} />)
    expect(screen.getByText('NO VAC')).toBeInTheDocument()
  })

  it('filters servers by search query', () => {
    const other: GameServer = { ...mockServer, addr: '9.9.9.9:27015', name: 'Other Server', map: 'de_inferno' }
    render(<ServerList servers={[mockServer, other]} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'inferno' } })
    expect(screen.getByText('Other Server')).toBeInTheDocument()
    expect(screen.queryByText('Test CS:GO Server')).not.toBeInTheDocument()
  })
})

describe('ServerList — pinned servers', () => {
  it('shows pinned section with label and tag when server is live', () => {
    render(<ServerList servers={[mockServer]} pinned={[mockPinned]} />)
    expect(screen.getByText('Pinned Servers')).toBeInTheDocument()
    expect(screen.getByText('My Favourite Server')).toBeInTheDocument()
    expect(screen.getByText('Official')).toBeInTheDocument()
  })

  it('shows Pinned badge on pinned card', () => {
    render(<ServerList servers={[mockServer]} pinned={[mockPinned]} />)
    expect(screen.getByText('● Pinned')).toBeInTheDocument()
  })

  it('excludes pinned server from the live list', () => {
    render(<ServerList servers={[mockServer]} pinned={[mockPinned]} />)
    const ips = screen.getAllByText('1.2.3.4:27015')
    expect(ips).toHaveLength(1)
  })

  it('shows offline card when pinned server is not in live list', () => {
    render(<ServerList servers={[]} pinned={[mockPinned]} />)
    expect(screen.getByText('Offline')).toBeInTheDocument()
    expect(screen.getByText('My Favourite Server')).toBeInTheDocument()
  })

  it('shows no pinned section when pinned list is empty', () => {
    render(<ServerList servers={[mockServer]} pinned={[]} />)
    expect(screen.queryByText('Pinned Servers')).not.toBeInTheDocument()
  })
})

describe('ServerList — pin/unpin buttons', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ pinned: { id: 'new-id', addr: '1.2.3.4:27015', label: null, tag: null } }),
    } as Response)
  })
  afterEach(() => jest.restoreAllMocks())

  it('shows Pin server button on non-pinned server card', () => {
    render(<ServerList servers={[mockServer]} pinned={[]} />)
    expect(screen.getByRole('button', { name: 'Pin server' })).toBeInTheDocument()
  })

  it('shows Unpin server button on pinned server card', () => {
    render(<ServerList servers={[mockServer]} pinned={[mockPinned]} />)
    expect(screen.getByRole('button', { name: 'Unpin server' })).toBeInTheDocument()
  })

  it('clicking Pin server calls POST /api/pinned', async () => {
    render(<ServerList servers={[mockServer]} pinned={[]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pin server' }))
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/pinned',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('clicking Unpin server calls DELETE /api/pinned', async () => {
    render(<ServerList servers={[mockServer]} pinned={[mockPinned]} />)
    fireEvent.click(screen.getByRole('button', { name: 'Unpin server' }))
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/pinned?addr='),
      expect.objectContaining({ method: 'DELETE' })
    )
  })

  it('optimistically moves server to pinned section on pin click', async () => {
    render(<ServerList servers={[mockServer]} pinned={[]} />)
    expect(screen.queryByText('Pinned Servers')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Pin server' }))
    expect(screen.getByText('Pinned Servers')).toBeInTheDocument()
  })

  it('optimistically removes server from pinned section on unpin click', async () => {
    render(<ServerList servers={[mockServer]} pinned={[mockPinned]} />)
    expect(screen.getByText('Pinned Servers')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Unpin server' }))
    expect(screen.queryByText('Pinned Servers')).not.toBeInTheDocument()
  })
})

describe('SkinList', () => {
  it('renders skin name and price', () => {
    render(<SkinList items={[mockSkin]} />)
    expect(screen.getByText('AK-47 | Redline (Field-Tested)')).toBeInTheDocument()
    expect(screen.getByText('$5.00')).toBeInTheDocument()
  })

  it('shows listing count', () => {
    render(<SkinList items={[mockSkin]} />)
    expect(screen.getByText('12,345 listed')).toBeInTheDocument()
  })

  it('renders rank number', () => {
    render(<SkinList items={[mockSkin]} />)
    expect(screen.getByText('#1')).toBeInTheDocument()
  })

  it('shows empty message when list is empty', () => {
    render(<SkinList items={[]} />)
    expect(screen.getByText(/No market data available/)).toBeInTheDocument()
  })

  it('filters items by search query', () => {
    const awp: MarketItem = {
      ...mockSkin,
      name: 'AWP | Dragon Lore (Factory New)',
      hash_name: 'AWP | Dragon Lore (Factory New)',
    }
    render(<SkinList items={[mockSkin, awp]} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'AWP' } })
    expect(screen.getByText('AWP | Dragon Lore (Factory New)')).toBeInTheDocument()
    expect(screen.queryByText('AK-47 | Redline (Field-Tested)')).not.toBeInTheDocument()
  })

  it('shows no-results message when search matches nothing', () => {
    render(<SkinList items={[mockSkin]} />)
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'xyznotfound' } })
    expect(screen.getByText(/No skins found for "xyznotfound"/)).toBeInTheDocument()
  })

  it('renders the skin image', () => {
    render(<SkinList items={[mockSkin]} />)
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', mockSkin.icon_url)
    expect(img).toHaveAttribute('alt', mockSkin.name)
  })
})
