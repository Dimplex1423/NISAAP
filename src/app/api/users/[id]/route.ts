import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { checkAuth } from '@/lib/auth-middleware';
import { logAudit } from '@/lib/audit';
import { updateUserSchema, resetPasswordSchema, formatZodErrors } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.isAdmin) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true, username: true, email: true, fullName: true,
        role: true, department: true, isActive: true, lastLogin: true, createdAt: true,
      },
    });

    if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.isAdmin) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    // Check if this is a password reset request
    if (body._action === 'reset-password') {
      const parsed = resetPasswordSchema.safeParse({ password: body.password });
      if (!parsed.success) {
        return NextResponse.json({ success: false, error: formatZodErrors(parsed.error) }, { status: 400 });
      }
      const existing = await db.user.findUnique({ where: { id } });
      if (!existing) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

      await db.user.update({ where: { id }, data: { password: hashPassword(parsed.data.password) } });
      await logAudit(auth.userId, 'RESET_PASSWORD', 'Users', `Reset password for user ${existing.username}`);

      return NextResponse.json({ success: true, message: 'Password reset successfully' });
    }

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    if (data.email || data.username) {
      const conflict = await db.user.findFirst({
        where: {
          OR: [
            ...(data.email ? [{ email: data.email }] : []),
            ...(data.username ? [{ username: data.username }] : []),
          ],
          NOT: { id },
        },
      });
      if (conflict) return NextResponse.json({ success: false, error: 'Username or email already exists' }, { status: 400 });
    }

    // Prevent admin from deactivating themselves
    if (data.isActive === false && existing.id === auth.userId) {
      return NextResponse.json({ success: false, error: 'Cannot deactivate your own account' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (data.username) updateData.username = data.username;
    if (data.email) updateData.email = data.email;
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.role) updateData.role = data.role;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.password) updateData.password = hashPassword(data.password);

    const user = await db.user.update({ where: { id }, data: updateData });

    const changedFields = Object.keys(updateData).filter(k => k !== 'password');
    await logAudit(auth.userId, 'UPDATE_USER', 'Users', `Updated user ${user.username}${changedFields.length ? ` (${changedFields.join(', ')})` : ''}`);

    return NextResponse.json({
      success: true,
      data: {
        id: user.id, username: user.username, email: user.email,
        fullName: user.fullName, role: user.role, department: user.department, isActive: user.isActive,
        lastLogin: user.lastLogin, createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.isAdmin) return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    const { id } = await params;
    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });

    if (existing.id === auth.userId) {
      return NextResponse.json({ success: false, error: 'Cannot delete your own account' }, { status: 400 });
    }

    // Prevent deleting the last admin
    if (existing.role === 'admin') {
      const adminCount = await db.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return NextResponse.json({ success: false, error: 'Cannot delete the last admin account' }, { status: 400 });
      }
    }

    await db.user.delete({ where: { id } });
    await logAudit(auth.userId, 'DELETE_USER', 'Users', `Deleted user ${existing.username}`);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
