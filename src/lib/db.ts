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
    if (process.env.NODE_ENV !== 'production') {
      console.log('[DB] Connecting to Turso cloud database:', tursoUrl.substring(0, 40) + '...')
    }
    const adapter = new PrismaLibSQL({
      url: tursoUrl,
      authToken: tursoToken,
    })
    return new PrismaClient({ adapter } as any)
  }

  // Production guard: if no Turso config in production, fail fast
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'FATAL: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required in production. ' +
      'Add them in Vercel Dashboard > Settings > Environment Variables.'
    )
  }

  // Otherwise, use local SQLite (for development only)
  console.warn('[DB] Warning: Using local SQLite — not suitable for production')
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

// In production (Vercel serverless), always create a fresh client per cold start.
// In development, reuse the client to avoid connection pool exhaustion.
// Lazy initialization to avoid build-time errors when env vars aren't available.
let _db: PrismaClient | undefined = undefined;

function getDb(): PrismaClient {
  if (!_db) {
    _db = createPrismaClient();
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = _db;
    }
  }
  return _db;
}

// Use a Proxy to lazily initialize the PrismaClient on first access
const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const actualDb = getDb();
    const value = Reflect.get(actualDb, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(actualDb);
    }
    return value;
  },
});

export { db }
