import { createClient } from '@libsql/client';

// Database-backed rate limiter that works in Vercel serverless
// Uses the same Turso database to persist rate limit state

const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getClient() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || '';
  const tursoToken = process.env.TURSO_AUTH_TOKEN || '';
  if (!tursoUrl.startsWith('libsql://') || !tursoToken) {
    // Fallback: if no Turso config, use a simple in-memory approach (dev only)
    return null;
  }
  return createClient({ url: tursoUrl, authToken: tursoToken });
}

// Ensure the rate_limits table exists
let tableInitialized = false;

async function ensureTable() {
  if (tableInitialized) return;
  const client = getClient();
  if (!client) return;
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS _rate_limits (
        ip TEXT NOT NULL PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        blocked_until INTEGER NOT NULL DEFAULT 0,
        updated_at INTEGER NOT NULL
      )
    `);
    tableInitialized = true;
  } catch {
    // Table might already exist, that's fine
    tableInitialized = true;
  }
}

export async function isIpBlocked(ip: string): Promise<boolean> {
  const client = getClient();
  if (!client) return false; // Dev fallback: no rate limiting

  await ensureTable();

  try {
    const result = await client.execute({
      sql: 'SELECT count, blocked_until FROM _rate_limits WHERE ip = ?',
      args: [ip],
    });

    if (result.rows.length === 0) return false;

    const blockedUntil = result.rows[0].blocked_until as number;
    if (blockedUntil && Date.now() < blockedUntil) return true;

    // Clean up expired blocks
    if (blockedUntil && Date.now() >= blockedUntil) {
      await client.execute({
        sql: 'DELETE FROM _rate_limits WHERE ip = ?',
        args: [ip],
      });
    }

    return false;
  } catch {
    return false; // On error, don't block
  }
}

export async function recordFailedAttempt(ip: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  await ensureTable();

  try {
    // Check existing
    const result = await client.execute({
      sql: 'SELECT count FROM _rate_limits WHERE ip = ?',
      args: [ip],
    });

    const currentCount = result.rows.length > 0 ? (result.rows[0].count as number) : 0;
    const newCount = currentCount + 1;

    if (newCount >= MAX_FAILED_ATTEMPTS) {
      const blockedUntil = Date.now() + BLOCK_DURATION_MS;
      await client.execute({
        sql: 'INSERT OR REPLACE INTO _rate_limits (ip, count, blocked_until, updated_at) VALUES (?, ?, ?, ?)',
        args: [ip, newCount, blockedUntil, Date.now()],
      });
    } else {
      await client.execute({
        sql: 'INSERT OR REPLACE INTO _rate_limits (ip, count, blocked_until, updated_at) VALUES (?, ?, 0, ?)',
        args: [ip, newCount, Date.now()],
      });
    }
  } catch {
    // Silently fail — rate limiting shouldn't break login
  }
}

export async function resetFailedAttempts(ip: string): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    await client.execute({
      sql: 'DELETE FROM _rate_limits WHERE ip = ?',
      args: [ip],
    });
  } catch {
    // Silently fail
  }
}

// Cleanup old entries (call periodically)
export async function cleanupRateLimits(): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    await client.execute({
      sql: 'DELETE FROM _rate_limits WHERE blocked_until > 0 AND blocked_until < ?',
      args: [Date.now()],
    });
    // Also clean up entries older than 1 hour with no block
    await client.execute({
      sql: 'DELETE FROM _rate_limits WHERE blocked_until = 0 AND updated_at < ?',
      args: [Date.now() - 60 * 60 * 1000],
    });
  } catch {
    // Silently fail
  }
}
