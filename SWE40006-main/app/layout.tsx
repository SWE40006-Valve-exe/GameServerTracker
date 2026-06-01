import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CS Server Tracker',
  description: 'Track Counter Strike servers',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
