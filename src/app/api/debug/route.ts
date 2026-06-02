import { NextResponse } from 'next/server';

export async function GET() {
  const tursoUrl = process.env.TURSO_DATABASE_URL || '';
  const tursoToken = process.env.TURSO_AUTH_TOKEN || '';
  const databaseUrl = process.env.DATABASE_URL || '';
  const nodeEnv = process.env.NODE_ENV || '';

  const diagnostics = {
    nodeEnv,
    tursoUrlSet: tursoUrl.length > 0,
    tursoUrlPrefix: tursoUrl.length > 0 ? tursoUrl.substring(0, 30) + '...' : 'NOT SET',
    tursoTokenSet: tursoToken.length > 0,
    tursoTokenPrefix: tursoToken.length > 0 ? tursoToken.substring(0, 10) + '...' : 'NOT SET',
    databaseUrlSet: databaseUrl.length > 0,
    databaseUrl: databaseUrl || 'NOT SET',
    tursoStartsWithLibsql: tursoUrl.startsWith('libsql://'),
    bothSet: tursoUrl.startsWith('libsql://') && tursoToken.length > 0,
  };

  // Try to connect to the database directly
  try {
    const { createClient } = require('@libsql/client');
    const client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    const result = await client.execute("SELECT COUNT(*) as count FROM \"User\"");
    diagnostics.dbConnection = 'SUCCESS';
    diagnostics.userCount = result.rows[0].count;
  } catch (error: any) {
    diagnostics.dbConnection = 'FAILED';
    diagnostics.dbError = error.message;
  }

  // Try Prisma connection
  try {
    const { db } = require('@/lib/db');
    const userCount = await db.user.count();
    diagnostics.prismaConnection = 'SUCCESS';
    diagnostics.prismaUserCount = userCount;
  } catch (error: any) {
    diagnostics.prismaConnection = 'FAILED';
    diagnostics.prismaError = error.message;
  }

  return NextResponse.json({ diagnostics });
}
