import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''
  const tursoToken = process.env.TURSO_AUTH_TOKEN || ''

  // If TURSO_DATABASE_URL is set with libsql://, use Turso driver adapter
  if (tursoUrl.startsWith('libsql://') && tursoToken.length > 0) {
    console.log('[DB] Connecting to Turso cloud database:', tursoUrl.substring(0, 40) + '...')
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoToken,
    })
    return new PrismaClient({ adapter } as any)
  }

  // Otherwise, use local SQLite (for development)
  console.log('[DB] Using local SQLite database')
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

// In production (Vercel serverless), always create a fresh client per cold start.
// In development, reuse the client to avoid connection pool exhaustion.
const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db
}

export { db }
