import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';
import { logAudit } from '@/lib/audit';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const vulnerability = await db.vulnerability.findUnique({
      where: { id },
      include: { device: true, solutions: true },
    });

    if (!vulnerability) return NextResponse.json({ success: false, error: 'Vulnerability not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: vulnerability });
  } catch (error) {
    console.error('Get vulnerability error:', error);
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

    const existing = await db.vulnerability.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Vulnerability not found' }, { status: 404 });

    const updateData: Record<string, unknown> = {};
    if (body.title) updateData.title = body.title;
    if (body.description) updateData.description = body.description;
    if (body.severity) updateData.severity = body.severity;
    if (body.cvssScore !== undefined) updateData.cvssScore = body.cvssScore;
    if (body.cveId !== undefined) updateData.cveId = body.cveId;
    if (body.status) {
      updateData.status = body.status;
      if (body.status === 'resolved') updateData.resolvedDate = new Date();
    }
    if (body.remediation !== undefined) updateData.remediation = body.remediation;

    const vulnerability = await db.vulnerability.update({ where: { id }, data: updateData });

    await logAudit(auth.userId, 'UPDATE_VULNERABILITY', 'Vulnerabilities', `Updated vulnerability: ${vulnerability.title}`);
    return NextResponse.json({ success: true, data: vulnerability });
  } catch (error) {
    console.error('Update vulnerability error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request, false, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.canWrite) return NextResponse.json({ success: false, error: 'Write access required' }, { status: 403 });

    const { id } = await params;
    const existing = await db.vulnerability.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Vulnerability not found' }, { status: 404 });

    await db.vulnerability.delete({ where: { id } });
    await logAudit(auth.userId, 'DELETE_VULNERABILITY', 'Vulnerabilities', `Deleted vulnerability: ${existing.title}`);

    return NextResponse.json({ success: true, message: 'Vulnerability deleted successfully' });
  } catch (error) {
    console.error('Delete vulnerability error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
