import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';
import { logAudit } from '@/lib/audit';
import { createAssessmentSchema, formatZodErrors, safeParseInt } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const riskRating = searchParams.get('riskRating');
    const deviceId = searchParams.get('deviceId');
    const search = searchParams.get('search');
    const page = safeParseInt(searchParams.get('page'), 1);
    const limit = safeParseInt(searchParams.get('limit'), 50, 1, 100);

    const where: Record<string, unknown> = {};
    if (riskRating) where.riskRating = riskRating;
    if (deviceId) where.deviceId = deviceId;
    if (search) {
      where.OR = [
        { findings: { contains: search } },
        { recommendations: { contains: search } },
      ];
    }

    const [assessments, total] = await Promise.all([
      db.assessment.findMany({
        where,
        include: {
          device: { select: { deviceName: true, ipAddress: true } },
          assessor: { select: { fullName: true, username: true } },
        },
        orderBy: { assessmentDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.assessment.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: assessments,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Assessments list error:', error);
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
    const parsed = createAssessmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;

    const assessment = await db.assessment.create({
      data: {
        deviceId: data.deviceId,
        assessorId: auth.userId,
        findings: data.findings,
        recommendations: data.recommendations,
        riskRating: data.riskRating || 'medium',
      },
    });

    await logAudit(auth.userId, 'CREATE_ASSESSMENT', 'Assessments', `Created assessment for device ${data.deviceId}`);

    return NextResponse.json({ success: true, data: assessment }, { status: 201 });
  } catch (error) {
    console.error('Create assessment error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
