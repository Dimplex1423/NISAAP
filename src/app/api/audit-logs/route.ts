import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';
import { safeParseInt } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.isAdmin) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const moduleFilter = searchParams.get('module');
    const action = searchParams.get('action');
    const userId = searchParams.get('userId');
    const page = safeParseInt(searchParams.get('page'), 1);
    const limit = safeParseInt(searchParams.get('limit'), 100, 1, 500);

    const where: Record<string, unknown> = {};
    if (moduleFilter) where.module = moduleFilter;
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        include: { user: { select: { fullName: true, username: true } } },
        orderBy: { timestamp: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
