import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    name: 'NISAAP API',
    version: '1.0.0',
    description: 'Network Infrastructure Security Assessment & Action Platform',
    endpoints: {
      auth: ['/api/auth/login', '/api/auth/logout', '/api/auth/session', '/api/auth/change-password'],
      dashboard: ['/api/dashboard/stats'],
      devices: ['/api/devices', '/api/devices/[id]'],
      vulnerabilities: ['/api/vulnerabilities', '/api/vulnerabilities/[id]'],
      solutions: ['/api/solutions', '/api/solutions/[id]'],
      assessments: ['/api/assessments', '/api/assessments/[id]'],
      users: ['/api/users', '/api/users/[id]'],
      auditLogs: ['/api/audit-logs'],
    },
  });
}
