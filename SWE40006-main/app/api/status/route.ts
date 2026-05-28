import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

let requestCount = 0

export async function GET() {
  requestCount++
  return NextResponse.json({
    status: 'ok',
    uptime_seconds: Math.floor(process.uptime()),
    request_count: requestCount,
  })
}
