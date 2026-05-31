import { NextRequest } from 'next/server';
import { getSessionFromCookie } from './auth';

interface AuthResult {
  userId: string;
  role: string;
  isAdmin: boolean;
  canWrite: boolean; // true for admin and analyst, false for viewer
}

export type { AuthResult };

export async function checkAuth(
  request: NextRequest,
  requireAdmin = false,
  requireWrite = false
): Promise<AuthResult | null> {
  const session = getSessionFromCookie(request.headers.get('cookie'));
  if (!session) return null;
  const isAdmin = session.role === 'admin';
  const canWrite = session.role === 'admin' || session.role === 'analyst';
  if (requireAdmin && !isAdmin) return { userId: session.userId, role: session.role, isAdmin, canWrite };
  if (requireWrite && !canWrite) return { userId: session.userId, role: session.role, isAdmin, canWrite };
  return { userId: session.userId, role: session.role, isAdmin, canWrite };
}
