import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const assessment = await db.assessment.findUnique({
      where: { id },
      include: { device: true, assessor: { select: { fullName: true, username: true } } },
    });

    if (!assessment) return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: assessment });
  } catch (error) {
    console.error('Get assessment error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request, false, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.canWrite) return NextResponse.json({ success: false, error: 'Write access required' }, { status: 403 });

    const { id } = await params;
    const body = await request.json();

    const existing = await db.assessment.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (body.findings) updateData.findings = body.findings;
    if (body.recommendations) updateData.recommendations = body.recommendations;
    if (body.riskRating) updateData.riskRating = body.riskRating;

    const assessment = await db.assessment.update({ where: { id }, data: updateData });

    await logAudit(auth.userId, 'UPDATE_ASSESSMENT', 'Assessments', `Updated assessment ${id}`);
    return NextResponse.json({ success: true, data: assessment });
  } catch (error) {
    console.error('Update assessment error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request, false, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.canWrite) return NextResponse.json({ success: false, error: 'Write access required' }, { status: 403 });

    const { id } = await params;
    const existing = await db.assessment.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Assessment not found' }, { status: 404 });

    await db.assessment.delete({ where: { id } });
    await logAudit(auth.userId, 'DELETE_ASSESSMENT', 'Assessments', `Deleted assessment ${id}`);

    return NextResponse.json({ success: true, message: 'Assessment deleted successfully' });
  } catch (error) {
    console.error('Delete assessment error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
