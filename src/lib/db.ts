import { PrismaClient } from '@prisma/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // For Turso: use TURSO_DATABASE_URL for the actual connection
  // DATABASE_URL must be a valid SQLite URL (like file:./dev.db) for Prisma schema validation
  const tursoUrl = process.env.TURSO_DATABASE_URL || ''
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // If TURSO_DATABASE_URL is set with libsql://, use Turso driver adapter
  if (tursoUrl.startsWith('libsql://') && tursoToken) {
    console.log('[DB] Connecting to Turso cloud database:', tursoUrl.substring(0, 40) + '...')
    // PrismaLibSQL is a FACTORY that takes a config object {url, authToken}, NOT a client instance
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

// Lazy initialization - only create PrismaClient when first accessed
let _db: PrismaClient | undefined

export function getDb(): PrismaClient {
  if (!_db) {
    _db = globalForPrisma.prisma ?? createPrismaClient()
    if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = _db
  }
  return _db
}

// Backward-compatible export using Proxy for lazy access
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    return (getDb() as any)[prop]
  },
})
