import { NextResponse } from 'next/server';

export async function GET() {
  const health: Record<string, unknown> = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'unknown',
  };

  // Check if required environment variables are set
  const tursoUrl = process.env.TURSO_DATABASE_URL || '';
  const tursoToken = process.env.TURSO_AUTH_TOKEN || '';
  const hasSessionSecret = !!process.env.SESSION_SECRET;

  health.env = {
    tursoConfigured: tursoUrl.startsWith('libsql://') && tursoToken.length > 0,
    sessionSecretSet: hasSessionSecret,
  };

  // Test database connectivity
  try {
    const { createClient } = require('@libsql/client');
    const client = createClient({ url: tursoUrl, authToken: tursoToken });
    const result = await client.execute("SELECT 1 as ok");
    health.database = result.rows[0]?.ok === 1 ? 'connected' : 'error';
  } catch (error: any) {
    health.database = 'disconnected';
    health.dbError = error.message;
    health.status = 'degraded';
  }

  const statusCode = health.status === 'ok' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
