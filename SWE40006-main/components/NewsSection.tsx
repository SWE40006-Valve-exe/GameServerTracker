import type { NewsItem } from '@/lib/market'

function formatDate(unix: number): string {
  return new Date(unix * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function stripMarkup(text: string): string {
  return text
    .replace(/\[.*?\]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function NewsSection({ items }: { items: NewsItem[] }) {
  if (items.length === 0) {
    return <p className="skin-empty">No news available right now.</p>
  }

  return (
    <div className="news-grid">
      {items.map((item) => (
        <a
          key={item.gid}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="news-card"
          style={{ textDecoration: 'none' }}
        >
          <div className="news-card-header">
            <div className="news-feed-tag">{item.feedlabel || 'CS2 Update'}</div>
            <div className="news-card-title">{item.title}</div>
          </div>
          <div className="news-card-body">
            <p className="news-card-excerpt">{stripMarkup(item.contents)}</p>
            <div className="news-card-meta">
              <span>{formatDate(item.date)}</span>
              <span className="news-read-more">Read more →</span>
            </div>
          </div>
        </a>
      ))}
    </div>
  )
}
