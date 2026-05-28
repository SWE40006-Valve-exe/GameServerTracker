export interface MarketItem {
  name: string
  hash_name: string
  sell_listings: number
  sell_price: number       // cents
  sell_price_text: string
  icon_url: string         // full CDN URL
}

interface RawMarketResult {
  name: string
  hash_name: string
  sell_listings: number
  sell_price: number
  sell_price_text: string
  asset_description: { icon_url: string }
}

const STEAM_MARKET_SEARCH = 'https://steamcommunity.com/market/search/render/'
const STEAM_CDN = 'https://community.cloudflare.steamstatic.com/economy/image'

export interface NewsItem {
  gid: string
  title: string
  url: string
  author: string
  contents: string
  feedlabel: string
  date: number
}

export async function fetchCSGONews(count = 6): Promise<NewsItem[]> {
  try {
    const params = new URLSearchParams({
      appid: '730',
      count: String(count),
      maxlength: '300',
      format: 'json',
    })
    const res = await fetch(
      `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?${params}`
    )
    if (!res.ok) throw new Error(`Steam news API responded with ${res.status}`)
    const data = await res.json()
    return (data.appnews?.newsitems ?? []) as NewsItem[]
  } catch (error) {
    console.error('fetchCSGONews failed:', error)
    return []
  }
}

export async function fetchHotSkins(appid = 730, count = 15): Promise<MarketItem[]> {
  try {
    const params = new URLSearchParams({
      appid: String(appid),
      norender: '1',
      count: String(count),
      sort_column: 'popular',
      sort_dir: 'desc',
    })
    const res = await fetch(`${STEAM_MARKET_SEARCH}?${params}`)
    if (!res.ok) throw new Error(`Steam Market API responded with ${res.status}`)
    const data = await res.json()
    const results = (data.results ?? []) as RawMarketResult[]
    return results.map((item) => ({
      name: item.name,
      hash_name: item.hash_name,
      sell_listings: item.sell_listings,
      sell_price: item.sell_price,
      sell_price_text: item.sell_price_text,
      icon_url: `${STEAM_CDN}/${item.asset_description.icon_url}/128x96`,
    }))
  } catch (error) {
    console.error('fetchHotSkins failed:', error)
    return []
  }
}
