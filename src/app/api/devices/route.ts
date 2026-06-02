import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';
import { logAudit } from '@/lib/audit';
import { createDeviceSchema, formatZodErrors, safeParseInt } from '@/lib/validations';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const riskLevel = searchParams.get('riskLevel');
    const deviceType = searchParams.get('deviceType');
    const search = searchParams.get('search');
    const page = safeParseInt(searchParams.get('page'), 1);
    const limit = safeParseInt(searchParams.get('limit'), 50, 1, 100);

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;
    if (deviceType) where.deviceType = deviceType;
    if (search) {
      where.OR = [
        { deviceName: { contains: search } },
        { ipAddress: { contains: search } },
        { location: { contains: search } },
        { station: { contains: search } },
      ];
    }

    const [devices, total] = await Promise.all([
      db.ioTDevice.findMany({
        where,
        include: { _count: { select: { vulnerabilities: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.ioTDevice.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: devices,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Devices list error:', error);
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
    const parsed = createDeviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: formatZodErrors(parsed.error) }, { status: 400 });
    }
    const data = parsed.data;

    const device = await db.ioTDevice.create({
      data: {
        deviceName: data.deviceName,
        deviceType: data.deviceType,
        ipAddress: data.ipAddress,
        macAddress: data.macAddress,
        location: data.location,
        station: data.station,
        status: data.status || 'active',
        firmwareVersion: data.firmwareVersion,
        riskLevel: data.riskLevel || 'low',
        networkSegment: data.networkSegment,
      },
    });

    await logAudit(auth.userId, 'CREATE_DEVICE', 'Devices', `Created device ${data.deviceName}`);

    return NextResponse.json({ success: true, data: device }, { status: 201 });
  } catch (error) {
    console.error('Create device error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
