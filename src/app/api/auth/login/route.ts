import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword, createSessionCookie } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import { loginSchema, formatZodErrors } from '@/lib/validations';
import { isIpBlocked, recordFailedAttempt, resetFailedAttempts, cleanupRateLimits } from '@/lib/rate-limiter';

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);

    // Check rate limit (database-backed, works on Vercel)
    if (await isIpBlocked(ip)) {
      return NextResponse.json(
        { success: false, error: 'Too many failed login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid JSON body' },
        { status: 400 }
      );
    }

    // Validate with Zod
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { username, password } = parsed.data;

    const user = await db.user.findUnique({ where: { username } });
    if (!user) {
      await recordFailedAttempt(ip);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is deactivated' },
        { status: 401 }
      );
    }

    const isValid = verifyPassword(password, user.password);
    if (!isValid) {
      await recordFailedAttempt(ip);
      await logAudit(user.id, 'LOGIN_FAILED', 'Authentication', `Failed login attempt for ${username}`);
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    await resetFailedAttempts(ip);

    // Periodically clean up old rate limit entries
    cleanupRateLimits().catch(() => {});

    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const sessionData = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const cookie = createSessionCookie(sessionData);

    await logAudit(user.id, 'LOGIN', 'Authentication', `User ${username} logged in successfully`);

    const response = NextResponse.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        department: user.department,
        isActive: user.isActive,
      },
    });

    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
