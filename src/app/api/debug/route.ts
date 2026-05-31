import { NextResponse } from 'next/server'

export async function GET() {
  const databaseUrl = process.env.DATABASE_URL
  const tursoUrl = process.env.TURSO_DATABASE_URL
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  return NextResponse.json({
    DATABASE_URL: databaseUrl ? `${databaseUrl.substring(0, 20)}...` : 'NOT SET',
    TURSO_DATABASE_URL: tursoUrl ? `${tursoUrl.substring(0, 20)}...` : 'NOT SET',
    TURSO_AUTH_TOKEN: tursoToken ? 'SET (hidden)' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV || 'NOT SET',
  })
}
