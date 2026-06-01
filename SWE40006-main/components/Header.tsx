export default function Header() {
  return (
    <header>
      <a href="/" className="logo-link" aria-label="CS:GO Server Tracker">
        <svg className="logo-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0z" />
        </svg>
        CS Servers
      </a>

      <nav className="header-nav">
        <a href="/api/servers?game=csgo" target="_blank" rel="noopener noreferrer">API</a>
        <a href="/api/status" target="_blank" rel="noopener noreferrer">Status</a>
        <span className="header-badge">Live</span>
      </nav>
    </header>
  )
}
