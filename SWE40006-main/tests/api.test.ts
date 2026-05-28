import { GET as healthGET } from '@/app/api/health/route'
import { POST as pinnedPOST, DELETE as pinnedDELETE } from '@/app/api/pinned/route'
import { GET as statusGET } from '@/app/api/status/route'
import { GET as gamesGET } from '@/app/api/games/route'
import { GET as serversGET } from '@/app/api/servers/route'
import { GET as marketGET } from '@/app/api/market/route'
import { NextRequest } from 'next/server'

describe('GET /api/health', () => {
  it('returns 200 with status ok', async () => {
    const res = await healthGET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
  })
})

describe('GET /api/status', () => {
  it('returns 200 with uptime_seconds as a number', async () => {
    const res = await statusGET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(typeof body.uptime_seconds).toBe('number')
    expect(typeof body.request_count).toBe('number')
    expect(body.request_count).toBeGreaterThan(0)
  })
})

describe('GET /api/games', () => {
  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        top_sellers: {
          items: [
            {
              id: 730,
              name: 'Counter-Strike 2',
              discount_percent: 0,
              original_price: 0,
              final_price: 0,
              currency: 'USD',
              large_capsule_image: '',
              small_capsule_image: '',
              windows_available: true,
              mac_available: false,
              linux_available: true,
              streamingvideo_available: false,
              discount_expiration: 0,
              header_image: '',
            },
          ],
        },
      }),
    } as Response)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns a games array', async () => {
    const res = await gamesGET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.games)).toBe(true)
    expect(body.games).toHaveLength(1)
    expect(body.games[0].name).toBe('Counter-Strike 2')
  })

  it('returns 500 when Steam API fails', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))
    const res = await gamesGET()
    expect(res.status).toBe(500)
    const body = await res.json()
    expect(body.error).toBe('Failed to fetch games')
  })
})

describe('GET /api/servers', () => {
  const mockServer = {
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

  beforeEach(() => {
    process.env.STEAM_API_KEY = 'test-key'
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: { servers: [mockServer] } }),
    } as Response)
  })

  afterEach(() => {
    jest.restoreAllMocks()
    delete process.env.STEAM_API_KEY
  })

  it('returns servers for ?game=csgo', async () => {
    const req = new NextRequest('http://localhost/api/servers?game=csgo')
    const res = await serversGET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.game).toBe('csgo')
    expect(Array.isArray(body.servers)).toBe(true)
    expect(body.servers[0].name).toBe('Test CS:GO Server')
  })

  it('returns servers for ?game=7dtd', async () => {
    const req = new NextRequest('http://localhost/api/servers?game=7dtd')
    const res = await serversGET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.game).toBe('7dtd')
  })

  it('returns servers for ?game=rust', async () => {
    const req = new NextRequest('http://localhost/api/servers?game=rust')
    const res = await serversGET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.game).toBe('rust')
  })

  it('returns servers for ?game=tf2', async () => {
    const req = new NextRequest('http://localhost/api/servers?game=tf2')
    const res = await serversGET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.game).toBe('tf2')
  })

  it('returns all tracked games when no game param', async () => {
    const req = new NextRequest('http://localhost/api/servers')
    const res = await serversGET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.servers).toHaveProperty('csgo')
    expect(body.servers).toHaveProperty('7dtd')
    expect(body.servers).toHaveProperty('rust')
    expect(body.servers).toHaveProperty('tf2')
  })

  it('returns 400 for unknown game param', async () => {
    const req = new NextRequest('http://localhost/api/servers?game=minecraft')
    const res = await serversGET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Unknown game/)
  })
})

jest.mock('@/lib/supabase', () => ({ getSupabase: jest.fn() }))
import { getSupabase } from '@/lib/supabase'
const mockGetSupabase = getSupabase as jest.MockedFunction<typeof getSupabase>

function makeSupabaseMock(insertResult: object, deleteResult: object) {
  const mockSingle = jest.fn().mockResolvedValue(insertResult)
  const mockSelect = jest.fn(() => ({ single: mockSingle }))
  const mockInsert = jest.fn(() => ({ select: mockSelect }))
  const mockEq = jest.fn().mockResolvedValue(deleteResult)
  const mockDelete = jest.fn(() => ({ eq: mockEq }))
  const mockFrom = jest.fn(() => ({ insert: mockInsert, delete: mockDelete }))
  return { from: mockFrom } as unknown as ReturnType<typeof getSupabase>
}

describe('POST /api/pinned', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 503 when Supabase is not configured', async () => {
    mockGetSupabase.mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/pinned', {
      method: 'POST',
      body: JSON.stringify({ addr: '1.2.3.4:27015' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await pinnedPOST(req)
    expect(res.status).toBe(503)
  })

  it('returns 400 when addr is missing', async () => {
    mockGetSupabase.mockReturnValue(makeSupabaseMock({}, {}))
    const req = new NextRequest('http://localhost/api/pinned', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await pinnedPOST(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/addr/)
  })

  it('returns 201 with pinned entry on success', async () => {
    const saved = { id: 'abc', addr: '1.2.3.4:27015', label: null, tag: null }
    mockGetSupabase.mockReturnValue(makeSupabaseMock({ data: saved, error: null }, {}))
    const req = new NextRequest('http://localhost/api/pinned', {
      method: 'POST',
      body: JSON.stringify({ addr: '1.2.3.4:27015' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await pinnedPOST(req)
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.pinned.addr).toBe('1.2.3.4:27015')
  })
})

describe('DELETE /api/pinned', () => {
  afterEach(() => jest.resetAllMocks())

  it('returns 503 when Supabase is not configured', async () => {
    mockGetSupabase.mockReturnValue(null)
    const req = new NextRequest('http://localhost/api/pinned?addr=1.2.3.4:27015', { method: 'DELETE' })
    const res = await pinnedDELETE(req)
    expect(res.status).toBe(503)
  })

  it('returns 400 when addr param is missing', async () => {
    mockGetSupabase.mockReturnValue(makeSupabaseMock({}, {}))
    const req = new NextRequest('http://localhost/api/pinned', { method: 'DELETE' })
    const res = await pinnedDELETE(req)
    expect(res.status).toBe(400)
  })

  it('returns 200 with ok:true on success', async () => {
    mockGetSupabase.mockReturnValue(makeSupabaseMock({}, { error: null }))
    const req = new NextRequest('http://localhost/api/pinned?addr=1.2.3.4:27015', { method: 'DELETE' })
    const res = await pinnedDELETE(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.ok).toBe(true)
  })
})

describe('GET /api/market', () => {
  const mockSkin = {
    name: 'AK-47 | Redline (Field-Tested)',
    hash_name: 'AK-47 | Redline (Field-Tested)',
    sell_listings: 12345,
    sell_price: 500,
    sell_price_text: '$5.00',
    asset_description: { icon_url: 'test-icon-hash' },
  }

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [mockSkin] }),
    } as Response)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns CS:GO hot skins by default', async () => {
    const req = new NextRequest('http://localhost/api/market')
    const res = await marketGET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.game).toBe('csgo')
    expect(Array.isArray(body.items)).toBe(true)
    expect(body.items[0].name).toBe('AK-47 | Redline (Field-Tested)')
    expect(body.items[0].sell_price_text).toBe('$5.00')
  })

  it('returns TF2 skins for ?game=tf2', async () => {
    const req = new NextRequest('http://localhost/api/market?game=tf2')
    const res = await marketGET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.game).toBe('tf2')
  })

  it('returns 400 for unknown game', async () => {
    const req = new NextRequest('http://localhost/api/market?game=minecraft')
    const res = await marketGET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/Unknown game/)
  })
})
