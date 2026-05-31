import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { checkAuth } from '@/lib/auth-middleware';
import { logAudit } from '@/lib/audit';
import { createUserSchema, formatZodErrors } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.isAdmin) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        department: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Users list error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth(request, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.isAdmin) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;

    const existing = await db.user.findFirst({
      where: { OR: [{ username: data.username }, { email: data.email }] },
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Username or email already exists' }, { status: 400 });
    }

    const hashedPassword = hashPassword(data.password);
    const user = await db.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        department: data.department || 'IT Security',
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    await logAudit(auth.userId, 'CREATE_USER', 'Users', `Created user ${data.username}`);

    return NextResponse.json({
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
    }, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
