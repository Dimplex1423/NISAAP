import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    // Total devices
    const totalDevices = await db.ioTDevice.count();

    // Active devices
    const activeDevices = await db.ioTDevice.count({ where: { status: 'active' } });

    // Open vulnerabilities
    const openVulnerabilities = await db.vulnerability.count({
      where: { status: { notIn: ['resolved', 'accepted_risk'] } },
    });

    // Critical alerts
    const criticalVulnerabilities = await db.vulnerability.count({
      where: { severity: 'critical', status: { notIn: ['resolved', 'accepted_risk'] } },
    });

    // High severity
    const highVulnerabilities = await db.vulnerability.count({
      where: { severity: 'high', status: { notIn: ['resolved', 'accepted_risk'] } },
    });

    // Risk distribution
    const riskDistribution = {
      critical: await db.ioTDevice.count({ where: { riskLevel: 'critical' } }),
      high: await db.ioTDevice.count({ where: { riskLevel: 'high' } }),
      medium: await db.ioTDevice.count({ where: { riskLevel: 'medium' } }),
      low: await db.ioTDevice.count({ where: { riskLevel: 'low' } }),
    };

    // Severity distribution of vulnerabilities
    const severityDistribution = {
      critical: await db.vulnerability.count({ where: { severity: 'critical' } }),
      high: await db.vulnerability.count({ where: { severity: 'high' } }),
      medium: await db.vulnerability.count({ where: { severity: 'medium' } }),
      low: await db.vulnerability.count({ where: { severity: 'low' } }),
    };

    // Solutions implemented
    const solutionsImplemented = await db.securitySolution.count({
      where: { implementationStatus: { in: ['implemented', 'verified'] } },
    });

    const totalSolutions = await db.securitySolution.count();

    // Device type distribution
    const deviceTypes = await db.ioTDevice.groupBy({
      by: ['deviceType'],
      _count: { deviceType: true },
    });

    // Recent activities (audit logs)
    const recentActivities = await db.auditLog.findMany({
      take: 10,
      orderBy: { timestamp: 'desc' },
      include: { user: { select: { fullName: true, username: true } } },
    });

    // Total users
    const totalUsers = await db.user.count();
    const activeUsers = await db.user.count({ where: { isActive: true } });

    // Total assessments
    const totalAssessments = await db.assessment.count();

    return NextResponse.json({
      success: true,
      data: {
        totalDevices,
        activeDevices,
        openVulnerabilities,
        criticalVulnerabilities,
        highVulnerabilities,
        riskDistribution,
        severityDistribution,
        solutionsImplemented,
        totalSolutions,
        deviceTypes: deviceTypes.map(dt => ({ type: dt.deviceType, count: dt._count.deviceType })),
        recentActivities,
        totalUsers,
        activeUsers,
        totalAssessments,
      },
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
