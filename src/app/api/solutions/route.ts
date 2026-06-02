import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';
import { logAudit } from '@/lib/audit';
import { createSolutionSchema, formatZodErrors } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const implementationStatus = searchParams.get('implementationStatus');
    const priority = searchParams.get('priority');
    const vulnerabilityId = searchParams.get('vulnerabilityId');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (implementationStatus) where.implementationStatus = implementationStatus;
    if (priority) where.priority = priority;
    if (vulnerabilityId) where.vulnerabilityId = vulnerabilityId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const solutions = await db.securitySolution.findMany({
      where,
      include: {
        vulnerability: { select: { title: true, severity: true, device: { select: { deviceName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: solutions });
  } catch (error) {
    console.error('Solutions list error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth(request, false, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.canWrite) return NextResponse.json({ success: false, error: 'Write access required' }, { status: 403 });

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }
    const parsed = createSolutionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;

    const solution = await db.securitySolution.create({
      data: {
        vulnerabilityId: data.vulnerabilityId,
        title: data.title,
        description: data.description,
        implementationStatus: data.implementationStatus || 'proposed',
        priority: data.priority || 'medium',
        assignedTo: data.assignedTo,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        costEstimate: data.costEstimate,
      },
    });

    await logAudit(auth.userId, 'CREATE_SOLUTION', 'Solutions', `Created solution: ${data.title}`);

    return NextResponse.json({ success: true, data: solution }, { status: 201 });
  } catch (error) {
    console.error('Create solution error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
