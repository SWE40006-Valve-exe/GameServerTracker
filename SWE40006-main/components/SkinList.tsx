'use client'

import { useState, useMemo } from 'react'
import type { MarketItem } from '@/lib/market'

interface SkinListProps {
  items: MarketItem[]
}

type SortKey = 'popular' | 'price_asc' | 'price_desc' | 'name'

export default function SkinList({ items }: SkinListProps) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortKey>('popular')

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = q ? items.filter((i) => i.name.toLowerCase().includes(q)) : items
    const sorted = [...filtered]
    if (sort === 'price_asc') sorted.sort((a, b) => a.sell_price - b.sell_price)
    else if (sort === 'price_desc') sorted.sort((a, b) => b.sell_price - a.sell_price)
    else if (sort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name))
    return sorted
  }, [items, query, sort])

  return (
    <>
      <div className="skin-search-row">
        <input
          className="search-bar"
          type="text"
          placeholder="Search skins..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          className="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="popular">Most Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </select>
      </div>

      {displayed.length === 0 ? (
        <p className="skin-empty">
          {query.trim() ? `No skins found for "${query.trim()}"` : 'No market data available.'}
        </p>
      ) : (
        <div className="skin-grid">
          {displayed.map((item, index) => (
            <div key={item.hash_name} className="skin-card">
              <div className="skin-card-img-wrap">
                <span className={`skin-rank${index < 3 ? ' top3' : ''}`}>
                  {`#${index + 1}`}
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.icon_url} alt={item.name} />
              </div>
              <div className="skin-card-body">
                <div className="skin-card-name" title={item.name}>
                  {item.name}
                </div>
                <div className="skin-card-footer">
                  <span className="skin-price">{item.sell_price_text}</span>
                  <span className="skin-listings">
                    {`${item.sell_listings.toLocaleString()} listed`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
