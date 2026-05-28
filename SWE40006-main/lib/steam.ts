export interface SteamGameItem {
  id: number
  name: string
  discount_percent: number
  original_price: number
  final_price: number
  currency: string
  large_capsule_image: string
  small_capsule_image: string
  windows_available: boolean
  mac_available: boolean
  linux_available: boolean
  streamingvideo_available: boolean
  discount_expiration: number
  header_image: string
}

export async function fetchTopSellers(): Promise<SteamGameItem[]> {
  try {
    const res = await fetch('https://store.steampowered.com/api/featured/')
    if (!res.ok) throw new Error(`Steam featured API responded with ${res.status}`)
    const data = await res.json()
    // Returns the array of top sellers
    return (data.top_sellers?.items ?? []) as SteamGameItem[]
  } catch (error) {
    console.error('fetchTopSellers failed:', error)
    return []
  }
}
