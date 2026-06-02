import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';
import { logAudit } from '@/lib/audit';
import { updateDeviceSchema, formatZodErrors } from '@/lib/validations';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    const { id } = await params;
    const device = await db.ioTDevice.findUnique({
      where: { id },
      include: { vulnerabilities: true, assessments: true },
    });

    if (!device) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: device });
  } catch (error) {
    console.error('Get device error:', error);
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

    const existing = await db.ioTDevice.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });

    const parsed = updateDeviceSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }
    const updateData = parsed.data;

    const device = await db.ioTDevice.update({
      where: { id },
      data: {
        ...(updateData.deviceName && { deviceName: updateData.deviceName }),
        ...(updateData.deviceType && { deviceType: updateData.deviceType }),
        ...(updateData.ipAddress && { ipAddress: updateData.ipAddress }),
        ...(updateData.macAddress !== undefined && { macAddress: updateData.macAddress }),
        ...(updateData.location && { location: updateData.location }),
        ...(updateData.station !== undefined && { station: updateData.station }),
        ...(updateData.status && { status: updateData.status }),
        ...(updateData.firmwareVersion !== undefined && { firmwareVersion: updateData.firmwareVersion }),
        ...(updateData.riskLevel && { riskLevel: updateData.riskLevel }),
        ...(updateData.networkSegment !== undefined && { networkSegment: updateData.networkSegment }),
        lastScanDate: new Date(),
      },
    });

    await logAudit(auth.userId, 'UPDATE_DEVICE', 'Devices', `Updated device ${device.deviceName}`);
    return NextResponse.json({ success: true, data: device });
  } catch (error) {
    console.error('Update device error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const auth = await checkAuth(request, false, true);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (!auth.canWrite) return NextResponse.json({ success: false, error: 'Write access required' }, { status: 403 });

    const { id } = await params;
    const existing = await db.ioTDevice.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 });

    await db.ioTDevice.delete({ where: { id } });
    await logAudit(auth.userId, 'DELETE_DEVICE', 'Devices', `Deleted device ${existing.deviceName}`);

    return NextResponse.json({ success: true, message: 'Device deleted successfully' });
  } catch (error) {
    console.error('Delete device error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
