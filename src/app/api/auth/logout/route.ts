import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromCookie, getDestroySessionCookie } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromCookie(request.headers.get('cookie'));
    if (session) {
      await logAudit(session.userId, 'LOGOUT', 'Authentication', `User ${session.username} logged out`);
    }

    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.headers.set('Set-Cookie', getDestroySessionCookie());
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
