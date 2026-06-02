import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });

    // Run all independent count queries in parallel for performance
    const [
      totalDevices,
      activeDevices,
      openVulnerabilities,
      criticalVulnerabilities,
      highVulnerabilities,
      riskCritical,
      riskHigh,
      riskMedium,
      riskLow,
      sevCritical,
      sevHigh,
      sevMedium,
      sevLow,
      solutionsImplemented,
      totalSolutions,
      deviceTypes,
      recentActivities,
      totalUsers,
      activeUsers,
      totalAssessments,
    ] = await Promise.all([
      db.ioTDevice.count(),
      db.ioTDevice.count({ where: { status: 'active' } }),
      db.vulnerability.count({ where: { status: { notIn: ['resolved', 'accepted_risk'] } } }),
      db.vulnerability.count({ where: { severity: 'critical', status: { notIn: ['resolved', 'accepted_risk'] } } }),
      db.vulnerability.count({ where: { severity: 'high', status: { notIn: ['resolved', 'accepted_risk'] } } }),
      db.ioTDevice.count({ where: { riskLevel: 'critical' } }),
      db.ioTDevice.count({ where: { riskLevel: 'high' } }),
      db.ioTDevice.count({ where: { riskLevel: 'medium' } }),
      db.ioTDevice.count({ where: { riskLevel: 'low' } }),
      db.vulnerability.count({ where: { severity: 'critical' } }),
      db.vulnerability.count({ where: { severity: 'high' } }),
      db.vulnerability.count({ where: { severity: 'medium' } }),
      db.vulnerability.count({ where: { severity: 'low' } }),
      db.securitySolution.count({ where: { implementationStatus: { in: ['implemented', 'verified'] } } }),
      db.securitySolution.count(),
      db.ioTDevice.groupBy({ by: ['deviceType'], _count: { deviceType: true } }),
      db.auditLog.findMany({ take: 10, orderBy: { timestamp: 'desc' }, include: { user: { select: { fullName: true, username: true } } } }),
      db.user.count(),
      db.user.count({ where: { isActive: true } }),
      db.assessment.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalDevices,
        activeDevices,
        openVulnerabilities,
        criticalVulnerabilities,
        highVulnerabilities,
        riskDistribution: { critical: riskCritical, high: riskHigh, medium: riskMedium, low: riskLow },
        severityDistribution: { critical: sevCritical, high: sevHigh, medium: sevMedium, low: sevLow },
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
