import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';
import { logAudit } from '@/lib/audit';
import { updateSolutionSchema, formatZodErrors } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const solution = await db.securitySolution.findUnique({
      where: { id },
      include: { vulnerability: true },
    });

    if (!solution) return NextResponse.json({ success: false, error: 'Solution not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: solution });
  } catch (error) {
    console.error('Get solution error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request, false, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.canWrite) return NextResponse.json({ success: false, error: 'Write access required' }, { status: 403 });

    const { id } = await params;
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const existing = await db.securitySolution.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Solution not found' }, { status: 404 });

    const parsed = updateSolutionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }
    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.implementationStatus === 'implemented' || updateData.implementationStatus === 'verified') {
      updateData.completedDate = new Date();
    }
    if (updateData.dueDate !== undefined) {
      updateData.dueDate = updateData.dueDate ? new Date(updateData.dueDate as string) : null;
    }

    const solution = await db.securitySolution.update({ where: { id }, data: updateData });

    await logAudit(auth.userId, 'UPDATE_SOLUTION', 'Solutions', `Updated solution: ${solution.title}`);
    return NextResponse.json({ success: true, data: solution });
  } catch (error) {
    console.error('Update solution error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request, false, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.canWrite) return NextResponse.json({ success: false, error: 'Write access required' }, { status: 403 });

    const { id } = await params;
    const existing = await db.securitySolution.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Solution not found' }, { status: 404 });

    await db.securitySolution.delete({ where: { id } });
    await logAudit(auth.userId, 'DELETE_SOLUTION', 'Solutions', `Deleted solution: ${existing.title}`);

    return NextResponse.json({ success: true, message: 'Solution deleted successfully' });
  } catch (error) {
    console.error('Delete solution error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
