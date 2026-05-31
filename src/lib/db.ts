import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL || ''
  const tursoToken = process.env.TURSO_AUTH_TOKEN

  // If DATABASE_URL starts with libsql://, use Turso driver adapter
  if (databaseUrl.startsWith('libsql://') && tursoToken) {
    console.log('[DB] Connecting to Turso cloud database:', databaseUrl.substring(0, 40) + '...')
    const libsql = createClient({
      url: databaseUrl,
      authToken: tursoToken,
    })
    const adapter = new PrismaLibSql(libsql)
    return new PrismaClient({ adapter })
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
