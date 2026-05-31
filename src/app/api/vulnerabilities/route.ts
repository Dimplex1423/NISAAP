import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';
import { logAudit } from '@/lib/audit';
import { createVulnerabilitySchema, formatZodErrors } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const deviceId = searchParams.get('deviceId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: Record<string, unknown> = {};
    if (severity) where.severity = severity;
    if (status) where.status = status;
    if (deviceId) where.deviceId = deviceId;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { cveId: { contains: search } },
      ];
    }

    const [vulnerabilities, total] = await Promise.all([
      db.vulnerability.findMany({
        where,
        include: { device: { select: { deviceName: true, ipAddress: true } } },
        orderBy: { discoveredDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.vulnerability.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: vulnerabilities,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Vulnerabilities list error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth(request, false, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.canWrite) return NextResponse.json({ success: false, error: 'Write access required' }, { status: 403 });

    const body = await request.json();
    const parsed = createVulnerabilitySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;

    const vulnerability = await db.vulnerability.create({
      data: {
        deviceId: data.deviceId,
        title: data.title,
        description: data.description,
        severity: data.severity,
        cvssScore: data.cvssScore,
        cveId: data.cveId,
        status: data.status || 'open',
        remediation: data.remediation,
      },
    });

    // Update device risk level based on new vulnerability
    const criticalCount = await db.vulnerability.count({
      where: { deviceId: data.deviceId, severity: 'critical', status: { not: 'resolved' } },
    });
    const highCount = await db.vulnerability.count({
      where: { deviceId: data.deviceId, severity: 'high', status: { not: 'resolved' } },
    });

    let newRiskLevel = 'low';
    if (criticalCount > 0) newRiskLevel = 'critical';
    else if (highCount > 0) newRiskLevel = 'high';
    else {
      const medCount = await db.vulnerability.count({
        where: { deviceId: data.deviceId, severity: 'medium', status: { not: 'resolved' } },
      });
      if (medCount > 0) newRiskLevel = 'medium';
    }

    await db.ioTDevice.update({ where: { id: data.deviceId }, data: { riskLevel: newRiskLevel } });

    await logAudit(auth.userId, 'CREATE_VULNERABILITY', 'Vulnerabilities', `Created vulnerability: ${data.title}`);

    return NextResponse.json({ success: true, data: vulnerability }, { status: 201 });
  } catch (error) {
    console.error('Create vulnerability error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
