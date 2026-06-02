import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkAuth } from '@/lib/auth-middleware';
import { hashPassword } from '@/lib/auth';
import { logAudit } from '@/lib/audit';

// Date helpers
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await checkAuth(request);
    if (!auth) return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    if (auth.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });

    // Step 1: Delete all data in reverse dependency order
    console.log('Re-seed: Deleting existing data...');
    await db.securitySolution.deleteMany();
    await db.assessment.deleteMany();
    await db.auditLog.deleteMany();
    await db.vulnerability.deleteMany();
    await db.ioTDevice.deleteMany();
    // Delete other users but keep the current admin
    const currentAdmin = await db.user.findFirst({ where: { id: auth.userId } });
    if (!currentAdmin) return NextResponse.json({ success: false, error: 'Current admin session invalid' }, { status: 401 });
    await db.user.deleteMany({ where: { id: { not: currentAdmin.id } } });
    const admin = currentAdmin;
    console.log('Re-seed: Existing data deleted (kept current admin user)');

    // Step 2: Re-seed users
    const users = await Promise.all([
      db.user.upsert({ where: { username: 'tariro' }, update: {}, create: { username: 'tariro', password: hashPassword('password123'), email: 'tariro.moyo@gmail.com', fullName: 'Tariro Moyo', role: 'analyst', department: 'Network Operations', isActive: true, lastLogin: hoursAgo(3) } }),
      db.user.upsert({ where: { username: 'chenai' }, update: {}, create: { username: 'chenai', password: hashPassword('password123'), email: 'chenai.dube@gmail.com', fullName: 'Chenai Dube', role: 'viewer', department: 'Management', isActive: true, lastLogin: daysAgo(1) } }),
      db.user.upsert({ where: { username: 'tapiwa' }, update: {}, create: { username: 'tapiwa', password: hashPassword('password123'), email: 'tapiwa.ncube@gmail.com', fullName: 'Tapiwa Ncube', role: 'analyst', department: 'Cybersecurity', isActive: true, lastLogin: hoursAgo(6) } }),
      db.user.upsert({ where: { username: 'rupondo' }, update: {}, create: { username: 'rupondo', password: hashPassword('password123'), email: 'rupondo.gumbo@gmail.com', fullName: 'Rupondo Gumbo', role: 'analyst', department: 'IT Security', isActive: true, lastLogin: daysAgo(2) } }),
      db.user.upsert({ where: { username: 'nyasha' }, update: {}, create: { username: 'nyasha', password: hashPassword('password123'), email: 'nyasha.mahachi@gmail.com', fullName: 'Nyasha Mahachi', role: 'viewer', department: 'Operations', isActive: true, lastLogin: daysAgo(5) } }),
      db.user.upsert({ where: { username: 'kudzai' }, update: {}, create: { username: 'kudzai', password: hashPassword('password123'), email: 'kudzai.chikumba@gmail.com', fullName: 'Kudzai Chikumba', role: 'analyst', department: 'Network Operations', isActive: false, lastLogin: daysAgo(30) } }),
      db.user.upsert({ where: { username: 'blessing' }, update: {}, create: { username: 'blessing', password: hashPassword('password123'), email: 'blessing.shumba@gmail.com', fullName: 'Blessing Shumba', role: 'admin', department: 'IT Security', isActive: true, lastLogin: hoursAgo(12) } }),
      db.user.upsert({ where: { username: 'farai' }, update: {}, create: { username: 'farai', password: hashPassword('password123'), email: 'farai.mujuru@gmail.com', fullName: 'Farai Mujuru', role: 'viewer', department: 'Finance', isActive: true, lastLogin: daysAgo(3) } }),
      db.user.upsert({ where: { username: 'mufaro' }, update: {}, create: { username: 'mufaro', password: hashPassword('password123'), email: 'mufaro.zvobgo@gmail.com', fullName: 'Mufaro Zvobgo', role: 'analyst', department: 'Cybersecurity', isActive: true, lastLogin: hoursAgo(8) } }),
    ]);

    // Admin user already found above (currentAdmin / admin variable)

    // Step 3: Create devices (same as seed.ts but with corrected risk levels)
    const deviceData = [
      { deviceName: 'Signal Controller - Harare Station', deviceType: 'controller', ipAddress: '10.0.1.10', macAddress: '00:1A:2B:3C:4D:01', location: 'Harare Main Station', station: 'Harare', status: 'active', firmwareVersion: 'v2.3.1', riskLevel: 'critical', networkSegment: '10.0.1.0/24', lastScanDate: daysAgo(1) },
      { deviceName: 'Signal Controller - Bulawayo', deviceType: 'controller', ipAddress: '10.0.1.11', macAddress: '00:1A:2B:3C:4D:07', location: 'Bulawayo Main Station', station: 'Bulawayo', status: 'active', firmwareVersion: 'v2.3.0', riskLevel: 'critical', networkSegment: '10.0.1.0/24', lastScanDate: daysAgo(2) },
      { deviceName: 'Signal Controller - Mutare', deviceType: 'controller', ipAddress: '10.0.1.12', macAddress: '00:1A:2B:3C:4D:09', location: 'Mutare Station Signal Room', station: 'Mutare', status: 'active', firmwareVersion: 'v2.2.8', riskLevel: 'high', networkSegment: '10.0.1.0/24', lastScanDate: daysAgo(3) },
      { deviceName: 'Signal Controller - Gweru', deviceType: 'controller', ipAddress: '10.0.1.13', macAddress: '00:1A:2B:3C:4D:0A', location: 'Gweru Station Control Room', station: 'Gweru', status: 'active', firmwareVersion: 'v2.3.1', riskLevel: 'critical', networkSegment: '10.0.1.0/24', lastScanDate: daysAgo(5) },
      { deviceName: 'Point Machine Controller - Harare Yard', deviceType: 'controller', ipAddress: '10.0.1.14', macAddress: '00:1A:2B:3C:4D:1A', location: 'Harare Marshalling Yard', station: 'Harare', status: 'active', firmwareVersion: 'v1.9.4', riskLevel: 'critical', networkSegment: '10.0.1.0/24', lastScanDate: daysAgo(2) },
      { deviceName: 'CCTV Camera - Platform A Bulawayo', deviceType: 'camera', ipAddress: '10.0.2.20', macAddress: '00:1A:2B:3C:4D:02', location: 'Bulawayo Station - Platform A', station: 'Bulawayo', status: 'active', firmwareVersion: 'v1.8.5', riskLevel: 'critical', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(2) },
      { deviceName: 'CCTV Camera - Freight Yard Harare', deviceType: 'camera', ipAddress: '10.0.2.21', macAddress: '00:1A:2B:3C:4D:08', location: 'Harare Freight Yard', station: 'Harare', status: 'inactive', firmwareVersion: 'v1.7.2', riskLevel: 'low', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(22) },
      { deviceName: 'CCTV Camera - Ticket Hall Mutare', deviceType: 'camera', ipAddress: '10.0.2.22', macAddress: '00:1A:2B:3C:4D:0B', location: 'Mutare Station Ticket Hall', station: 'Mutare', status: 'active', firmwareVersion: 'v2.0.1', riskLevel: 'high', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(4) },
      { deviceName: 'CCTV Camera - Locomotive Depot', deviceType: 'camera', ipAddress: '10.0.2.23', macAddress: '00:1A:2B:3C:4D:0C', location: 'Bulawayo Locomotive Depot', station: 'Bulawayo', status: 'active', firmwareVersion: 'v1.8.5', riskLevel: 'high', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(3) },
      { deviceName: 'CCTV Camera - Warehouse Gweru', deviceType: 'camera', ipAddress: '10.0.2.24', macAddress: '00:1A:2B:3C:4D:1B', location: 'Gweru Goods Warehouse', station: 'Gweru', status: 'active', firmwareVersion: 'v2.0.1', riskLevel: 'medium', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(7) },
      { deviceName: 'CCTV Camera - Platform B Harare', deviceType: 'camera', ipAddress: '10.0.2.25', macAddress: '00:1A:2B:3C:4D:1C', location: 'Harare Station Platform B', station: 'Harare', status: 'active', firmwareVersion: 'v2.0.3', riskLevel: 'medium', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(1) },
      { deviceName: 'CCTV Camera - Bridge Monitoring', deviceType: 'camera', ipAddress: '10.0.2.26', macAddress: '00:1A:2B:3C:4D:1D', location: 'Birchenough Bridge Rail Section', station: 'Mutare', status: 'maintenance', firmwareVersion: 'v1.9.0', riskLevel: 'low', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(14) },
      { deviceName: 'Track Sensor - KM 45 Hre-Blwyo', deviceType: 'sensor', ipAddress: '10.0.3.30', macAddress: '00:1A:2B:3C:4D:03', location: 'Harare-Bulawayo Line KM 45', station: 'Gweru', status: 'active', firmwareVersion: 'v3.1.0', riskLevel: 'medium', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(4) },
      { deviceName: 'Track Sensor - KM 120 Hre-Blwyo', deviceType: 'sensor', ipAddress: '10.0.3.31', macAddress: '00:1A:2B:3C:4D:0D', location: 'Harare-Bulawayo Line KM 120', station: 'Gweru', status: 'active', firmwareVersion: 'v3.1.0', riskLevel: 'medium', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(5) },
      { deviceName: 'Temperature Sensor - Transformer 1', deviceType: 'sensor', ipAddress: '10.0.3.32', macAddress: '00:1A:2B:3C:4D:0E', location: 'Harare Substation Transformer 1', station: 'Harare', status: 'active', firmwareVersion: 'v2.5.2', riskLevel: 'low', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(3) },
      { deviceName: 'Vibration Sensor - Bridge 7', deviceType: 'sensor', ipAddress: '10.0.3.33', macAddress: '00:1A:2B:3C:4D:0F', location: 'Save River Bridge Structural Monitor', station: 'Mutare', status: 'active', firmwareVersion: 'v2.5.2', riskLevel: 'medium', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(6) },
      { deviceName: 'Weather Station - Dabuka', deviceType: 'sensor', ipAddress: '10.0.3.34', macAddress: '00:1A:2B:3C:4D:1E', location: 'Dabuka Wayside Station', station: 'Gweru', status: 'active', firmwareVersion: 'v1.3.8', riskLevel: 'low', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(8) },
      { deviceName: 'Axle Counter - Entry Harare', deviceType: 'sensor', ipAddress: '10.0.3.35', macAddress: '00:1A:2B:3C:4D:1F', location: 'Harare Yard Entry Point', station: 'Harare', status: 'active', firmwareVersion: 'v3.2.1', riskLevel: 'high', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(2) },
      { deviceName: 'Network Gateway - Mutare', deviceType: 'gateway', ipAddress: '10.0.4.1', macAddress: '00:1A:2B:3C:4D:04', location: 'Mutare Station Server Room', station: 'Mutare', status: 'active', firmwareVersion: 'v4.0.2', riskLevel: 'high', networkSegment: '10.0.4.0/24', lastScanDate: daysAgo(5) },
      { deviceName: 'Network Gateway - Harare Central', deviceType: 'gateway', ipAddress: '10.0.4.2', macAddress: '00:1A:2B:3C:4D:10', location: 'Harare Central Data Center', station: 'Harare', status: 'active', firmwareVersion: 'v4.2.1', riskLevel: 'medium', networkSegment: '10.0.4.0/24', lastScanDate: daysAgo(1) },
      { deviceName: 'Network Gateway - Bulawayo', deviceType: 'gateway', ipAddress: '10.0.4.3', macAddress: '00:1A:2B:3C:4D:11', location: 'Bulawayo Station Server Room', station: 'Bulawayo', status: 'active', firmwareVersion: 'v4.0.2', riskLevel: 'high', networkSegment: '10.0.4.0/24', lastScanDate: daysAgo(4) },
      { deviceName: 'Edge Gateway - Gweru', deviceType: 'gateway', ipAddress: '10.0.4.4', macAddress: '00:1A:2B:3C:4D:20', location: 'Gweru Station Comms Cabinet', station: 'Gweru', status: 'maintenance', firmwareVersion: 'v3.8.0', riskLevel: 'high', networkSegment: '10.0.4.0/24', lastScanDate: daysAgo(10) },
      { deviceName: 'Router - Kadoma', deviceType: 'router', ipAddress: '10.0.5.1', macAddress: '00:1A:2B:3C:4D:05', location: 'Kadoma Station Comms Room', station: 'Kadoma', status: 'maintenance', firmwareVersion: 'v2.1.7', riskLevel: 'high', networkSegment: '10.0.5.0/24', lastScanDate: daysAgo(10) },
      { deviceName: 'Router - Kwekwe', deviceType: 'router', ipAddress: '10.0.5.2', macAddress: '00:1A:2B:3C:4D:12', location: 'Kwekwe Station Comms Room', station: 'Kwekwe', status: 'active', firmwareVersion: 'v2.1.7', riskLevel: 'low', networkSegment: '10.0.5.0/24', lastScanDate: daysAgo(6) },
      { deviceName: 'Core Router - Harare DC', deviceType: 'router', ipAddress: '10.0.5.3', macAddress: '00:1A:2B:3C:4D:13', location: 'Harare Data Center Core Rack', station: 'Harare', status: 'active', firmwareVersion: 'v3.5.0', riskLevel: 'critical', networkSegment: '10.0.5.0/24', lastScanDate: daysAgo(1) },
      { deviceName: 'Router - Masvingo', deviceType: 'router', ipAddress: '10.0.5.4', macAddress: '00:1A:2B:3C:4D:21', location: 'Masvingo Station Comms Room', station: 'Masvingo', status: 'active', firmwareVersion: 'v2.1.7', riskLevel: 'low', networkSegment: '10.0.5.0/24', lastScanDate: daysAgo(9) },
      { deviceName: 'GPS Tracker - Locomotive 14', deviceType: 'tracker', ipAddress: '10.0.6.50', macAddress: '00:1A:2B:3C:4D:06', location: 'Locomotive 14 - Harare Yard', station: 'Harare', status: 'active', firmwareVersion: 'v1.5.3', riskLevel: 'low', networkSegment: '10.0.6.0/24', lastScanDate: daysAgo(3) },
      { deviceName: 'GPS Tracker - Locomotive 07', deviceType: 'tracker', ipAddress: '10.0.6.51', macAddress: '00:1A:2B:3C:4D:14', location: 'Locomotive 07 - En Route Bulawayo', station: 'Gweru', status: 'active', firmwareVersion: 'v1.5.3', riskLevel: 'low', networkSegment: '10.0.6.0/24', lastScanDate: daysAgo(2) },
      { deviceName: 'GPS Tracker - Wagon Set 22', deviceType: 'tracker', ipAddress: '10.0.6.52', macAddress: '00:1A:2B:3C:4D:15', location: 'Freight Wagon Set 22 - Mutare Line', station: 'Mutare', status: 'active', firmwareVersion: 'v1.5.1', riskLevel: 'medium', networkSegment: '10.0.6.0/24', lastScanDate: daysAgo(4) },
      { deviceName: 'GPS Tracker - Locomotive 03', deviceType: 'tracker', ipAddress: '10.0.6.53', macAddress: '00:1A:2B:3C:4D:16', location: 'Locomotive 03 - Harare Yard', station: 'Harare', status: 'inactive', firmwareVersion: 'v1.4.0', riskLevel: 'low', networkSegment: '10.0.6.0/24', lastScanDate: daysAgo(30) },
      { deviceName: 'GPS Tracker - Maintenance Vehicle', deviceType: 'tracker', ipAddress: '10.0.6.54', macAddress: '00:1A:2B:3C:4D:22', location: 'Track Maintenance Vehicle - Gweru', station: 'Gweru', status: 'active', firmwareVersion: 'v1.5.3', riskLevel: 'low', networkSegment: '10.0.6.0/24', lastScanDate: daysAgo(5) },
    ];

    const devices = await Promise.all(
      deviceData.map(d => db.ioTDevice.create({ data: d }))
    );

    // Step 4: Create vulnerabilities (corrected device assignments)
    const vulnData = [
      // Critical (5)
      { deviceId: devices[0].id, title: 'Unencrypted Signal Communication Protocol', description: 'The signal controller communicates using an unencrypted protocol, allowing potential man-in-the-middle attacks that could compromise railway signal integrity.', severity: 'critical', cvssScore: 9.8, cveId: 'CVE-2024-NRZ-001', status: 'in_progress', discoveredDate: daysAgo(60), remediation: 'Implement TLS 1.3 encryption for all signal communication protocols.' },
      { deviceId: devices[5].id, title: 'Default Credentials on CCTV System', description: 'CCTV camera at Bulawayo Platform A is using factory default username and password credentials, allowing unauthorized access to video feeds.', severity: 'critical', cvssScore: 9.1, cveId: 'CVE-2024-NRZ-002', status: 'open', discoveredDate: daysAgo(55), remediation: 'Change all default credentials immediately. Implement password rotation policy.' },
      { deviceId: devices[4].id, title: 'Buffer Overflow in Point Machine Controller', description: 'The point machine controller firmware contains a buffer overflow vulnerability in the command parsing module.', severity: 'critical', cvssScore: 9.7, cveId: 'CVE-2024-NRZ-006', status: 'open', discoveredDate: daysAgo(10), remediation: 'Apply emergency firmware patch v1.9.5.' },
      { deviceId: devices[3].id, title: 'Remote Code Execution via Signal Firmware', description: 'Signal controller at Gweru Station runs firmware v2.2.8 which contains a remote code execution vulnerability.', severity: 'critical', cvssScore: 9.6, cveId: 'CVE-2024-NRZ-005', status: 'acknowledged', discoveredDate: daysAgo(15), remediation: 'Update firmware to v2.3.2. Disable diagnostic interface.' },
      { deviceId: devices[24].id, title: 'Authentication Bypass in Core Router', description: 'The core router at Harare Data Center has an authentication bypass vulnerability in the web management interface.', severity: 'critical', cvssScore: 9.4, cveId: 'CVE-2024-NRZ-010', status: 'in_progress', discoveredDate: daysAgo(5), remediation: 'Apply vendor security patch immediately.' },
      // High (7)
      { deviceId: devices[18].id, title: 'Outdated Firmware with Known Exploits', description: 'Gateway at Mutare Station is running firmware version v4.0.2 with multiple known CVE vulnerabilities.', severity: 'high', cvssScore: 8.5, cveId: 'CVE-2024-NRZ-003', status: 'acknowledged', discoveredDate: daysAgo(50), remediation: 'Update firmware to latest version v4.2.1.' },
      { deviceId: devices[22].id, title: 'Missing Network Segmentation on Kadoma Router', description: 'Router at Kadoma Station lacks proper VLAN segmentation, allowing lateral movement.', severity: 'high', cvssScore: 7.8, status: 'in_progress', discoveredDate: daysAgo(45), remediation: 'Implement VLAN segmentation. Deploy firewall rules.' },
      { deviceId: devices[7].id, title: 'CCTV Camera Unauthenticated RTSP Stream', description: 'CCTV camera at Mutare Ticket Hall exposes an unauthenticated RTSP video stream.', severity: 'high', cvssScore: 8.2, cveId: 'CVE-2024-NRZ-007', status: 'open', discoveredDate: daysAgo(20), remediation: 'Enable RTSP authentication. Implement stream encryption.' },
      { deviceId: devices[21].id, title: 'Edge Gateway Weak SNMP Community String', description: 'Edge gateway at Gweru uses default "public" SNMP community string.', severity: 'high', cvssScore: 7.5, status: 'acknowledged', discoveredDate: daysAgo(12), remediation: 'Change SNMP community strings. Migrate to SNMPv3.' },
      { deviceId: devices[8].id, title: 'CCTV Camera Hardcoded Telnet Backdoor', description: 'CCTV camera at Bulawayo Locomotive Depot contains a hardcoded Telnet backdoor account.', severity: 'high', cvssScore: 8.8, cveId: 'CVE-2024-NRZ-008', status: 'in_progress', discoveredDate: daysAgo(8), remediation: 'Apply vendor firmware update. Block Telnet at network level.' },
      { deviceId: devices[20].id, title: 'Gateway Denial of Service Vulnerability', description: 'Bulawayo network gateway has a DoS vulnerability in the packet processing engine.', severity: 'high', cvssScore: 7.9, cveId: 'CVE-2024-NRZ-009', status: 'open', discoveredDate: daysAgo(7), remediation: 'Deploy rate limiting and packet filtering rules.' },
      { deviceId: devices[17].id, title: 'Exposed Management Interface on Axle Counter', description: 'The axle counter sensor at Harare Yard has its HTTP management interface exposed on the general network.', severity: 'high', cvssScore: 8.0, status: 'open', discoveredDate: daysAgo(4), remediation: 'Move management interface to dedicated VLAN.' },
      // Medium (7)
      { deviceId: devices[12].id, title: 'Weak Authentication Mechanism on Track Sensor', description: 'Track sensor at KM 45 uses simple 4-digit PIN for authentication.', severity: 'medium', cvssScore: 6.5, cveId: 'CVE-2024-NRZ-004', status: 'open', discoveredDate: daysAgo(40), remediation: 'Upgrade to certificate-based authentication.' },
      { deviceId: devices[28].id, title: 'GPS Spoofing Vulnerability on Wagon Set 22', description: 'GPS tracker on freight wagon set 22 lacks signal authentication.', severity: 'medium', cvssScore: 5.9, status: 'acknowledged', discoveredDate: daysAgo(35), remediation: 'Implement GPS signal authentication.' },
      { deviceId: devices[13].id, title: 'Sensor Firmware Missing Integrity Verification', description: 'Track sensor at KM 120 does not verify firmware integrity during boot.', severity: 'medium', cvssScore: 6.2, status: 'acknowledged', discoveredDate: daysAgo(18), remediation: 'Implement secure boot with firmware signature verification.' },
      { deviceId: devices[9].id, title: 'CCTV Camera Unencrypted Video Storage', description: 'CCTV camera at Gweru Warehouse stores recorded footage without encryption.', severity: 'medium', cvssScore: 5.5, status: 'acknowledged', discoveredDate: daysAgo(25), remediation: 'Enable AES-256 encryption for local storage.' },
      { deviceId: devices[19].id, title: 'Gateway SNMP Information Disclosure', description: 'Harare Central Gateway reveals system information through SNMP queries without authentication.', severity: 'medium', cvssScore: 5.3, status: 'resolved', discoveredDate: daysAgo(60), resolvedDate: daysAgo(30), remediation: 'Configure SNMP access controls. Move to SNMPv3.' },
      { deviceId: devices[10].id, title: 'CCTV Camera Outdated TLS Configuration', description: 'CCTV camera on Platform B at Harare Station supports only TLS 1.0 and TLS 1.1.', severity: 'medium', cvssScore: 6.0, status: 'in_progress', discoveredDate: daysAgo(14), remediation: 'Update camera firmware to support TLS 1.2 minimum.' },
      { deviceId: devices[15].id, title: 'Vibration Sensor Insecure Data Transmission', description: 'The vibration sensor at Save River Bridge transmits data over HTTP without encryption.', severity: 'medium', cvssScore: 5.7, status: 'open', discoveredDate: daysAgo(9), remediation: 'Implement HTTPS for data transmission.' },
      // Low (7)
      { deviceId: devices[0].id, title: 'Insufficient Logging and Monitoring', description: 'Signal controller at Harare Station does not generate adequate security logs.', severity: 'low', cvssScore: 4.3, status: 'resolved', discoveredDate: daysAgo(90), resolvedDate: daysAgo(40), remediation: 'Deploy centralized logging system with SIEM integration.' },
      { deviceId: devices[14].id, title: 'Temperature Sensor Unencrypted MQTT Broker', description: 'The temperature sensor communicates via MQTT to an unencrypted broker.', severity: 'low', cvssScore: 3.5, status: 'acknowledged', discoveredDate: daysAgo(22), remediation: 'Configure MQTT broker to use TLS.' },
      { deviceId: devices[7].id, title: 'CCTV Camera Missing Privacy Masking', description: 'CCTV camera at Mutare Ticket Hall does not have privacy masking configured.', severity: 'low', cvssScore: 2.5, status: 'resolved', discoveredDate: daysAgo(45), resolvedDate: daysAgo(20), remediation: 'Configure privacy masking zones on all CCTV cameras.' },
      { deviceId: devices[23].id, title: 'Router at Kwekwe - No NTP Authentication', description: 'Kwekwe station router does not use authenticated NTP for time synchronization.', severity: 'low', cvssScore: 3.1, status: 'open', discoveredDate: daysAgo(30), remediation: 'Configure authenticated NTP using symmetric keys.' },
      { deviceId: devices[29].id, title: 'GPS Tracker - Missing Asset Tag', description: 'GPS tracker on Locomotive 03 is not registered in the asset management database.', severity: 'low', cvssScore: 2.0, status: 'acknowledged', discoveredDate: daysAgo(60), remediation: 'Register device in asset management database.' },
      { deviceId: devices[11].id, title: 'CCTV Camera - Insufficient Retention Period', description: 'CCTV camera at Bridge Monitoring site only retains 7 days of footage.', severity: 'low', cvssScore: 2.8, status: 'in_progress', discoveredDate: daysAgo(16), remediation: 'Increase storage capacity. Update retention policy to 30 days.' },
      { deviceId: devices[16].id, title: 'Weather Station - No Firmware Update Mechanism', description: 'Weather station at Dabuka does not support remote firmware updates.', severity: 'low', cvssScore: 3.0, status: 'acknowledged', discoveredDate: daysAgo(28), remediation: 'Implement secure over-the-air firmware update capability.' },
    ];

    const vulnerabilities = await Promise.all(
      vulnData.map(v => db.vulnerability.create({ data: v }))
    );

    // Step 5: Create solutions (corrected vulnerability references)
    const solData = [
      { vulnerabilityId: vulnerabilities[0].id, title: 'Implement TLS 1.3 Encryption for Signal Communications', description: 'Deploy TLS 1.3 encryption protocol across all signal communication channels.', implementationStatus: 'in_progress', priority: 'critical', assignedTo: 'Munyaradzi Chigama', dueDate: daysAgo(-30), costEstimate: '$45,000' },
      { vulnerabilityId: vulnerabilities[1].id, title: 'Credential Rotation and MFA Implementation for CCTV', description: 'Change all default credentials on CCTV systems and implement multi-factor authentication.', implementationStatus: 'proposed', priority: 'critical', assignedTo: 'Tariro Moyo', dueDate: daysAgo(-15), costEstimate: '$12,000' },
      { vulnerabilityId: vulnerabilities[2].id, title: 'Emergency Firmware Patch for Point Machine Controller', description: 'Apply emergency firmware patch v1.9.5 to the point machine controller.', implementationStatus: 'in_progress', priority: 'critical', assignedTo: 'Munyaradzi Chigama', dueDate: daysAgo(-5), costEstimate: '$5,000' },
      { vulnerabilityId: vulnerabilities[3].id, title: 'Signal Controller Firmware Upgrade - Gweru', description: 'Update Gweru signal controller firmware from v2.2.8 to v2.3.2.', implementationStatus: 'proposed', priority: 'critical', assignedTo: 'Tapiwa Ncube', dueDate: daysAgo(-10), costEstimate: '$8,000' },
      { vulnerabilityId: vulnerabilities[4].id, title: 'Core Router Security Hardening', description: 'Apply vendor security patch for authentication bypass in core router.', implementationStatus: 'in_progress', priority: 'critical', assignedTo: 'Munyaradzi Chigama', dueDate: daysAgo(-3), costEstimate: '$22,000' },
      { vulnerabilityId: vulnerabilities[5].id, title: 'Firmware Update and Patch Management Program', description: 'Update all gateway devices to firmware v4.2.1.', implementationStatus: 'proposed', priority: 'high', assignedTo: 'Tariro Moyo', dueDate: daysAgo(-45), costEstimate: '$8,000' },
      { vulnerabilityId: vulnerabilities[6].id, title: 'Network Segmentation and Firewall Deployment', description: 'Implement VLAN segmentation across Kadoma Station network.', implementationStatus: 'in_progress', priority: 'high', assignedTo: 'Munyaradzi Chigama', dueDate: daysAgo(-60), costEstimate: '$65,000' },
      { vulnerabilityId: vulnerabilities[7].id, title: 'RTSP Stream Authentication and Encryption', description: 'Enable RTSP authentication on all CCTV cameras.', implementationStatus: 'proposed', priority: 'high', assignedTo: 'Rupondo Gumbo', dueDate: daysAgo(-20), costEstimate: '$15,000' },
      { vulnerabilityId: vulnerabilities[8].id, title: 'SNMP Security Hardening - Gweru Edge Gateway', description: 'Change SNMP community strings on Gweru edge gateway.', implementationStatus: 'proposed', priority: 'high', assignedTo: 'Tapiwa Ncube', dueDate: daysAgo(-14), costEstimate: '$3,000' },
      { vulnerabilityId: vulnerabilities[9].id, title: 'CCTV Telnet Backdoor Removal', description: 'Apply vendor firmware update that removes hardcoded Telnet backdoor.', implementationStatus: 'in_progress', priority: 'high', assignedTo: 'Rupondo Gumbo', dueDate: daysAgo(-7), costEstimate: '$4,000' },
      { vulnerabilityId: vulnerabilities[10].id, title: 'Gateway DoS Mitigation - Bulawayo', description: 'Deploy rate limiting and packet filtering rules on Bulawayo gateway.', implementationStatus: 'proposed', priority: 'high', assignedTo: 'Tapiwa Ncube', dueDate: daysAgo(-25), costEstimate: '$18,000' },
      { vulnerabilityId: vulnerabilities[11].id, title: 'Axle Counter Management Interface Protection', description: 'Move axle counter HTTP management interface to dedicated management VLAN.', implementationStatus: 'proposed', priority: 'high', assignedTo: 'Rupondo Gumbo', dueDate: daysAgo(-12), costEstimate: '$6,000' },
      { vulnerabilityId: vulnerabilities[12].id, title: 'Certificate-Based Authentication for Track Sensors', description: 'Upgrade all track sensors from 4-digit PIN to certificate-based authentication.', implementationStatus: 'proposed', priority: 'medium', assignedTo: 'Tariro Moyo', dueDate: daysAgo(-50), costEstimate: '$25,000' },
      { vulnerabilityId: vulnerabilities[13].id, title: 'GPS Signal Authentication for Freight Tracking', description: 'Implement GPS signal authentication on all locomotive and wagon trackers.', implementationStatus: 'proposed', priority: 'medium', assignedTo: 'Mufaro Zvobgo', dueDate: daysAgo(-40), costEstimate: '$30,000' },
      { vulnerabilityId: vulnerabilities[14].id, title: 'Secure Boot Implementation for Track Sensors', description: 'Implement secure boot with firmware signature verification on all track sensors.', implementationStatus: 'proposed', priority: 'medium', assignedTo: 'Rupondo Gumbo', dueDate: daysAgo(-30), costEstimate: '$15,000' },
      { vulnerabilityId: vulnerabilities[15].id, title: 'CCTV Video Storage Encryption', description: 'Enable AES-256 encryption for local SD card storage on all CCTV cameras.', implementationStatus: 'proposed', priority: 'medium', assignedTo: 'Mufaro Zvobgo', dueDate: daysAgo(-35), costEstimate: '$20,000' },
      { vulnerabilityId: vulnerabilities[17].id, title: 'TLS Upgrade for CCTV Management Interfaces', description: 'Update camera firmware to support TLS 1.2 minimum.', implementationStatus: 'in_progress', priority: 'medium', assignedTo: 'Tariro Moyo', dueDate: daysAgo(-20), costEstimate: '$10,000' },
      { vulnerabilityId: vulnerabilities[18].id, title: 'Vibration Sensor Data Encryption Deployment', description: 'Implement HTTPS for vibration sensor data transmission.', implementationStatus: 'proposed', priority: 'medium', assignedTo: 'Rupondo Gumbo', dueDate: daysAgo(-10), costEstimate: '$8,000' },
      { vulnerabilityId: vulnerabilities[19].id, title: 'Centralized Logging and SIEM Deployment', description: 'Deploy centralized logging infrastructure with SIEM capabilities.', implementationStatus: 'implemented', priority: 'low', assignedTo: 'Tariro Moyo', completedDate: daysAgo(30), costEstimate: '$35,000' },
      { vulnerabilityId: vulnerabilities[16].id, title: 'SNMP Access Control Hardening - Harare Gateway', description: 'Configured SNMP access controls on Harare Central Gateway.', implementationStatus: 'implemented', priority: 'medium', assignedTo: 'Munyaradzi Chigama', completedDate: daysAgo(30), costEstimate: '$3,000' },
      { vulnerabilityId: vulnerabilities[21].id, title: 'Privacy Masking Configuration - CCTV Network', description: 'Configured privacy masking zones on all CCTV cameras.', implementationStatus: 'implemented', priority: 'low', assignedTo: 'Tariro Moyo', completedDate: daysAgo(20), costEstimate: '$2,000' },
      { vulnerabilityId: vulnerabilities[22].id, title: 'Authenticated NTP Deployment', description: 'Configure authenticated NTP using symmetric keys on Kwekwe router.', implementationStatus: 'proposed', priority: 'low', assignedTo: 'Mufaro Zvobgo', dueDate: daysAgo(-60), costEstimate: '$1,500' },
      { vulnerabilityId: vulnerabilities[23].id, title: 'Asset Registration for Inactive GPS Tracker', description: 'Register inactive GPS tracker on Locomotive 03 in the asset management database.', implementationStatus: 'proposed', priority: 'low', assignedTo: 'Mufaro Zvobgo', dueDate: daysAgo(-45), costEstimate: '$1,000' },
    ];

    await Promise.all(solData.map(s => db.securitySolution.create({ data: s })));

    // Step 6: Create assessments (14 total - matching document claim)
    const analyst1 = users[0]; // tariro
    const analyst2 = users[2]; // tapiwa
    const analyst3 = users[3]; // rupondo
    const analyst5 = users[8]; // mufaro
    const admin2 = users[6]; // blessing

    const assessmentData = [
      { deviceId: devices[0].id, assessorId: admin.id, findings: 'Signal controller at Harare Station has critical security gaps including unencrypted communications and insufficient logging. The device runs outdated firmware v2.3.1 with known vulnerabilities.', recommendations: '1. Implement TLS 1.3 encryption immediately. 2. Update firmware to v2.3.2. 3. Deploy centralized logging. 4. Implement certificate-based authentication.', riskRating: 'critical', assessmentDate: daysAgo(50) },
      { deviceId: devices[18].id, assessorId: analyst1.id, findings: 'Network gateway at Mutare Station running outdated firmware v4.0.2 with multiple known CVEs. Device lacks proper access controls and monitoring capabilities.', recommendations: '1. Update firmware to latest version v4.2.1. 2. Implement network segmentation. 3. Enable detailed logging. 4. Deploy intrusion detection system.', riskRating: 'high', assessmentDate: daysAgo(45) },
      { deviceId: devices[12].id, assessorId: admin.id, findings: 'Track sensor at KM 45 Harare-Bulawayo line uses weak 4-digit PIN authentication. GPS tracking data lacks integrity verification.', recommendations: '1. Upgrade authentication to certificate-based. 2. Implement data integrity checks. 3. Encrypt communication channels. 4. Implement secure boot mechanism.', riskRating: 'medium', assessmentDate: daysAgo(40) },
      { deviceId: devices[4].id, assessorId: analyst2.id, findings: 'Point machine controller at Harare Marshalling Yard runs firmware v1.9.4 with buffer overflow vulnerability in command parsing.', recommendations: '1. Apply emergency firmware patch v1.9.5 immediately. 2. Disable diagnostic port on production network. 3. Implement command validation and filtering.', riskRating: 'critical', assessmentDate: daysAgo(10) },
      { deviceId: devices[24].id, assessorId: admin.id, findings: 'Core router at Harare Data Center has authentication bypass in web management interface. Session tokens can be manipulated to gain admin access.', recommendations: '1. Apply vendor security patch immediately. 2. Restrict web management to localhost only. 3. Deploy out-of-band management network.', riskRating: 'critical', assessmentDate: daysAgo(5) },
      { deviceId: devices[5].id, assessorId: analyst3.id, findings: 'CCTV camera at Bulawayo Platform A uses factory default credentials. Video feeds are accessible without authentication.', recommendations: '1. Change default credentials immediately. 2. Update firmware. 3. Implement video stream authentication. 4. Deploy network segmentation for CCTV VLAN.', riskRating: 'critical', assessmentDate: daysAgo(35) },
      { deviceId: devices[21].id, assessorId: analyst2.id, findings: 'Edge gateway at Gweru Station uses default SNMP community strings. Device is currently in maintenance mode but still connected to the network.', recommendations: '1. Change SNMP credentials immediately. 2. Update firmware when maintenance is complete. 3. Configure access logging. 4. Implement SNMPv3.', riskRating: 'high', assessmentDate: daysAgo(12) },
      { deviceId: devices[17].id, assessorId: analyst3.id, findings: 'Axle counter at Harare Yard entry point has HTTP management interface exposed on general network without authentication.', recommendations: '1. Move management interface to dedicated VLAN. 2. Implement authentication. 3. Deploy HTTPS with certificate pinning.', riskRating: 'high', assessmentDate: daysAgo(4) },
      { deviceId: devices[8].id, assessorId: analyst1.id, findings: 'CCTV camera at Bulawayo Locomotive Depot contains a hardcoded Telnet backdoor account from factory debugging.', recommendations: '1. Apply vendor firmware update to remove backdoor. 2. Block Telnet at network level. 3. Monitor for unauthorized Telnet access.', riskRating: 'high', assessmentDate: daysAgo(8) },
      { deviceId: devices[19].id, assessorId: admin.id, findings: 'Harare Central Gateway firmware v4.2.1 is up to date. SNMP information disclosure vulnerability has been resolved with migration to SNMPv3.', recommendations: '1. Continue quarterly ACL reviews. 2. Monitor SIEM alerts. 3. Maintain firmware update schedule.', riskRating: 'low', assessmentDate: daysAgo(7) },
      { deviceId: devices[9].id, assessorId: analyst5.id, findings: 'CCTV camera at Gweru Warehouse stores footage on local SD card without encryption. Camera firmware v2.0.1 is relatively current.', recommendations: '1. Enable AES-256 encryption for local SD card storage. 2. Deploy centralized NVR storage with encryption.', riskRating: 'medium', assessmentDate: daysAgo(25) },
      { deviceId: devices[20].id, assessorId: analyst5.id, findings: 'Bulawayo network gateway firmware v4.0.2 has a DoS vulnerability in the packet processing engine. No redundancy exists for this gateway.', recommendations: '1. Deploy rate limiting and packet filtering. 2. Apply firmware patch v4.1.0. 3. Implement gateway redundancy with automatic failover.', riskRating: 'high', assessmentDate: daysAgo(7) },
      { deviceId: devices[13].id, assessorId: analyst3.id, findings: 'Track sensor at KM 120 runs current firmware v3.1.0 but lacks secure boot capability. Authentication uses shared 4-digit PIN.', recommendations: '1. Implement secure boot with firmware signature verification. 2. Upgrade to unique per-device authentication credentials.', riskRating: 'medium', assessmentDate: daysAgo(18) },
      { deviceId: devices[14].id, assessorId: analyst2.id, findings: 'Temperature sensor at Harare Substation uses unencrypted MQTT broker for data transmission. False temperature readings could trigger unnecessary equipment shutdowns.', recommendations: '1. Configure MQTT broker for TLS encryption. 2. Implement client certificate authentication. 3. Add data validation rules.', riskRating: 'low', assessmentDate: daysAgo(22) },
    ];

    await Promise.all(
      assessmentData.map(a => db.assessment.create({ data: a }))
    );

    // Step 7: Create audit logs (93 entries matching document claim)
    const auditLogData = [
      { userId: admin.id, action: 'SYSTEM_INIT', module: 'System', details: 'NISAAP system initialized and seeded with comprehensive data', ipAddress: '10.10.1.100', timestamp: daysAgo(60) },
      { userId: admin.id, action: 'CONFIG_UPDATE', module: 'System', details: 'System security policies updated - password complexity rules enforced', ipAddress: '10.10.1.100', timestamp: daysAgo(58) },
      { userId: admin2.id, action: 'CONFIG_UPDATE', module: 'System', details: 'Firewall rules updated for Harare Data Center network segment', ipAddress: '10.10.1.101', timestamp: daysAgo(55) },
      { userId: admin.id, action: 'LOGIN', module: 'Authentication', details: 'Admin user Munyaradzi Chigama logged in from Harare DC', ipAddress: '10.10.1.100', timestamp: daysAgo(55) },
      { userId: analyst1.id, action: 'LOGIN', module: 'Authentication', details: 'Analyst Tariro Moyo logged in from Network Operations Center', ipAddress: '10.10.1.102', timestamp: daysAgo(54) },
      { userId: users[1].id, action: 'LOGIN', module: 'Authentication', details: 'Viewer Chenai Dube logged in from Management office', ipAddress: '10.10.1.103', timestamp: daysAgo(53) },
      { userId: analyst2.id, action: 'LOGIN', module: 'Authentication', details: 'Analyst Tapiwa Ncube logged in from Cybersecurity lab', ipAddress: '10.10.1.104', timestamp: daysAgo(52) },
      { userId: admin2.id, action: 'LOGIN', module: 'Authentication', details: 'Admin Blessing Shumba logged in from IT Security office', ipAddress: '10.10.1.101', timestamp: daysAgo(51) },
      { userId: analyst3.id, action: 'LOGIN', module: 'Authentication', details: 'Analyst Rupondo Gumbo logged in from IT Security office', ipAddress: '10.10.1.105', timestamp: daysAgo(50) },
      { userId: admin.id, action: 'LOGIN', module: 'Authentication', details: 'Admin user logged in from mobile device', ipAddress: '10.10.1.110', timestamp: daysAgo(48) },
      { userId: analyst5.id, action: 'LOGIN', module: 'Authentication', details: 'Analyst Mufaro Zvobgo logged in from Cybersecurity lab', ipAddress: '10.10.1.107', timestamp: daysAgo(47) },
      { userId: analyst1.id, action: 'LOGIN', module: 'Authentication', details: 'Analyst Tariro Moyo logged in after hours for incident response', ipAddress: '10.10.1.102', timestamp: daysAgo(10) },
      { userId: admin.id, action: 'LOGIN', module: 'Authentication', details: 'Admin Munyaradzi Chigama emergency login for critical vulnerability', ipAddress: '10.10.1.100', timestamp: daysAgo(5) },
      { userId: admin.id, action: 'LOGIN', module: 'Authentication', details: 'Admin Munyaradzi Chigama logged in', ipAddress: '10.10.1.100', timestamp: hoursAgo(3) },
      { userId: analyst2.id, action: 'LOGIN', module: 'Authentication', details: 'Analyst Tapiwa Ncube logged in for assessment review', ipAddress: '10.10.1.104', timestamp: hoursAgo(6) },
      { userId: admin2.id, action: 'LOGIN', module: 'Authentication', details: 'Admin Blessing Shumba logged in for system maintenance', ipAddress: '10.10.1.101', timestamp: hoursAgo(12) },
      { userId: analyst1.id, action: 'LOGIN', module: 'Authentication', details: 'Analyst Tariro Moyo logged in for daily monitoring', ipAddress: '10.10.1.102', timestamp: hoursAgo(2) },
      { userId: null, action: 'LOGIN_FAILED', module: 'Authentication', details: 'Failed login attempt for username admin from unknown IP 192.168.1.55', ipAddress: '192.168.1.55', timestamp: daysAgo(15) },
      { userId: null, action: 'LOGIN_FAILED', module: 'Authentication', details: 'Failed login attempt for username root from unknown IP 45.33.32.156', ipAddress: '45.33.32.156', timestamp: daysAgo(12) },
      { userId: null, action: 'LOGIN_FAILED', module: 'Authentication', details: 'Multiple failed login attempts detected from IP 192.168.1.55 - possible brute force attack', ipAddress: '192.168.1.55', timestamp: daysAgo(15) },
      { userId: null, action: 'LOGIN_FAILED', module: 'Authentication', details: 'Failed login attempt for username administrator from external IP', ipAddress: '203.0.113.50', timestamp: daysAgo(3) },
      { userId: admin.id, action: 'DEVICE_REGISTERED', module: 'IoT Devices', details: 'Registered new IoT device: Signal Controller - Gweru', ipAddress: '10.10.1.100', timestamp: daysAgo(58) },
      { userId: admin.id, action: 'DEVICE_REGISTERED', module: 'IoT Devices', details: 'Registered new IoT device: Point Machine Controller - Harare Yard', ipAddress: '10.10.1.100', timestamp: daysAgo(58) },
      { userId: analyst1.id, action: 'DEVICE_REGISTERED', module: 'IoT Devices', details: 'Registered new IoT device: CCTV Camera - Platform B Harare', ipAddress: '10.10.1.102', timestamp: daysAgo(55) },
      { userId: analyst2.id, action: 'DEVICE_REGISTERED', module: 'IoT Devices', details: 'Registered new IoT device: Axle Counter - Entry Harare', ipAddress: '10.10.1.104', timestamp: daysAgo(52) },
      { userId: admin.id, action: 'DEVICE_UPDATED', module: 'IoT Devices', details: 'Updated status of Router - Kadoma to maintenance', ipAddress: '10.10.1.100', timestamp: daysAgo(30) },
      { userId: analyst1.id, action: 'DEVICE_UPDATED', module: 'IoT Devices', details: 'Updated firmware version for CCTV Camera - Platform A Bulawayo to v1.8.5', ipAddress: '10.10.1.102', timestamp: daysAgo(28) },
      { userId: admin.id, action: 'DEVICE_UPDATED', module: 'IoT Devices', details: 'Updated risk level for Core Router - Harare DC to critical', ipAddress: '10.10.1.100', timestamp: daysAgo(5) },
      { userId: analyst3.id, action: 'DEVICE_UPDATED', module: 'IoT Devices', details: 'Updated GPS Tracker - Locomotive 03 status to inactive', ipAddress: '10.10.1.105', timestamp: daysAgo(30) },
      { userId: admin.id, action: 'DEVICE_SCANNED', module: 'IoT Devices', details: 'Network vulnerability scan completed for Harare station devices - 3 critical findings', ipAddress: '10.10.1.100', timestamp: daysAgo(3) },
      { userId: analyst2.id, action: 'DEVICE_SCANNED', module: 'IoT Devices', details: 'Port scan completed for Bulawayo station network - all expected ports active', ipAddress: '10.10.1.104', timestamp: daysAgo(5) },
      { userId: analyst1.id, action: 'DEVICE_SCANNED', module: 'IoT Devices', details: 'Firmware compliance scan for all gateways - 2 devices need updates', ipAddress: '10.10.1.102', timestamp: daysAgo(7) },
      { userId: admin.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'Critical vulnerability CVE-2024-NRZ-001 discovered: Unencrypted Signal Communication Protocol', ipAddress: '10.10.1.100', timestamp: daysAgo(60) },
      { userId: analyst1.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'Critical vulnerability CVE-2024-NRZ-002 discovered: Default Credentials on CCTV System', ipAddress: '10.10.1.102', timestamp: daysAgo(55) },
      { userId: admin.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'High vulnerability CVE-2024-NRZ-003 discovered: Outdated Firmware with Known Exploits on Mutare Gateway', ipAddress: '10.10.1.100', timestamp: daysAgo(50) },
      { userId: analyst2.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'Medium vulnerability CVE-2024-NRZ-004 discovered: Weak Authentication Mechanism on Track Sensor', ipAddress: '10.10.1.104', timestamp: daysAgo(40) },
      { userId: admin.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'Critical vulnerability CVE-2024-NRZ-005 discovered: Remote Code Execution in Gweru Signal Controller', ipAddress: '10.10.1.100', timestamp: daysAgo(15) },
      { userId: admin.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'Critical vulnerability CVE-2024-NRZ-006 discovered: Buffer Overflow in Point Machine Controller', ipAddress: '10.10.1.100', timestamp: daysAgo(10) },
      { userId: analyst2.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'High vulnerability CVE-2024-NRZ-007 discovered: Unauthenticated RTSP Stream on Mutare CCTV', ipAddress: '10.10.1.104', timestamp: daysAgo(20) },
      { userId: analyst3.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'High vulnerability CVE-2024-NRZ-008 discovered: Hardcoded Telnet Backdoor on Bulawayo CCTV', ipAddress: '10.10.1.105', timestamp: daysAgo(8) },
      { userId: analyst5.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'High vulnerability CVE-2024-NRZ-009 discovered: DoS Vulnerability on Bulawayo Gateway', ipAddress: '10.10.1.107', timestamp: daysAgo(7) },
      { userId: admin.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'Critical vulnerability CVE-2024-NRZ-010 discovered: Authentication Bypass in Core Router', ipAddress: '10.10.1.100', timestamp: daysAgo(5) },
      { userId: analyst2.id, action: 'VULNERABILITY_UPDATED', module: 'Vulnerabilities', details: 'Updated CVE-2024-NRZ-001 status from open to in_progress', ipAddress: '10.10.1.104', timestamp: daysAgo(30) },
      { userId: admin.id, action: 'VULNERABILITY_RESOLVED', module: 'Vulnerabilities', details: 'Resolved: Insufficient Logging and Monitoring on Harare Signal Controller', ipAddress: '10.10.1.100', timestamp: daysAgo(40) },
      { userId: admin.id, action: 'VULNERABILITY_RESOLVED', module: 'Vulnerabilities', details: 'Resolved: SNMP Information Disclosure on Harare Central Gateway', ipAddress: '10.10.1.100', timestamp: daysAgo(30) },
      { userId: analyst1.id, action: 'VULNERABILITY_RESOLVED', module: 'Vulnerabilities', details: 'Resolved: Privacy Masking missing on Mutare CCTV Camera', ipAddress: '10.10.1.102', timestamp: daysAgo(20) },
      { userId: analyst2.id, action: 'VULNERABILITY_ACKNOWLEDGED', module: 'Vulnerabilities', details: 'Acknowledged CVE-2024-NRZ-003: Outdated firmware on Mutare Gateway - scheduled for next maintenance window', ipAddress: '10.10.1.104', timestamp: daysAgo(48) },
      { userId: analyst5.id, action: 'VULNERABILITY_ACKNOWLEDGED', module: 'Vulnerabilities', details: 'Acknowledged GPS Spoofing vulnerability on Wagon Set 22 - cross-validation project initiated', ipAddress: '10.10.1.107', timestamp: daysAgo(33) },
      { userId: admin.id, action: 'SOLUTION_CREATED', module: 'Security Solutions', details: 'Created solution: Implement TLS 1.3 Encryption for Signal Communications - Priority: Critical', ipAddress: '10.10.1.100', timestamp: daysAgo(58) },
      { userId: analyst1.id, action: 'SOLUTION_CREATED', module: 'Security Solutions', details: 'Created solution: Credential Rotation and MFA Implementation - Priority: Critical', ipAddress: '10.10.1.102', timestamp: daysAgo(55) },
      { userId: admin.id, action: 'SOLUTION_UPDATED', module: 'Security Solutions', details: 'Updated TLS 1.3 implementation status to in_progress - Harare controller deployment started', ipAddress: '10.10.1.100', timestamp: daysAgo(25) },
      { userId: analyst1.id, action: 'SOLUTION_IMPLEMENTED', module: 'Security Solutions', details: 'Marked as implemented: Centralized Logging and SIEM Deployment', ipAddress: '10.10.1.102', timestamp: daysAgo(30) },
      { userId: admin.id, action: 'SOLUTION_IMPLEMENTED', module: 'Security Solutions', details: 'Marked as implemented: SNMP Access Control Hardening on Harare Gateway', ipAddress: '10.10.1.100', timestamp: daysAgo(30) },
      { userId: analyst1.id, action: 'SOLUTION_IMPLEMENTED', module: 'Security Solutions', details: 'Marked as implemented: Privacy Masking Configuration for CCTV Network', ipAddress: '10.10.1.102', timestamp: daysAgo(20) },
      { userId: admin.id, action: 'SOLUTION_CREATED', module: 'Security Solutions', details: 'Created emergency solution: Core Router Security Hardening - out-of-band management deployment', ipAddress: '10.10.1.100', timestamp: daysAgo(5) },
      { userId: analyst3.id, action: 'SOLUTION_CREATED', module: 'Security Solutions', details: 'Created solution: CCTV Telnet Backdoor Removal for Bulawayo Depot camera', ipAddress: '10.10.1.105', timestamp: daysAgo(8) },
      { userId: admin.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed critical assessment of Signal Controller - Harare Station', ipAddress: '10.10.1.100', timestamp: daysAgo(50) },
      { userId: analyst1.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of Network Gateway - Mutare Station', ipAddress: '10.10.1.102', timestamp: daysAgo(45) },
      { userId: admin.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed medium-risk assessment of Track Sensor - KM 45', ipAddress: '10.10.1.100', timestamp: daysAgo(40) },
      { userId: analyst2.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed critical assessment of Point Machine Controller - Harare Yard', ipAddress: '10.10.1.104', timestamp: daysAgo(10) },
      { userId: admin.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed critical assessment of Core Router - Harare DC', ipAddress: '10.10.1.100', timestamp: daysAgo(5) },
      { userId: analyst3.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed critical assessment of CCTV Camera - Platform A Bulawayo', ipAddress: '10.10.1.105', timestamp: daysAgo(35) },
      { userId: analyst2.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of Edge Gateway - Gweru', ipAddress: '10.10.1.104', timestamp: daysAgo(12) },
      { userId: analyst3.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of Axle Counter - Entry Harare', ipAddress: '10.10.1.105', timestamp: daysAgo(4) },
      { userId: analyst1.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of CCTV Camera - Locomotive Depot', ipAddress: '10.10.1.102', timestamp: daysAgo(8) },
      { userId: admin.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed low-risk assessment of Network Gateway - Harare Central', ipAddress: '10.10.1.100', timestamp: daysAgo(7) },
      { userId: analyst5.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed medium-risk assessment of CCTV Camera - Warehouse Gweru', ipAddress: '10.10.1.107', timestamp: daysAgo(25) },
      { userId: analyst5.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of Network Gateway - Bulawayo', ipAddress: '10.10.1.107', timestamp: daysAgo(7) },
      { userId: admin.id, action: 'USER_CREATED', module: 'User Management', details: 'Created new analyst account: Tapiwa Ncube - Cybersecurity department', ipAddress: '10.10.1.100', timestamp: daysAgo(52) },
      { userId: admin.id, action: 'USER_CREATED', module: 'User Management', details: 'Created new analyst account: Rupondo Gumbo - IT Security department', ipAddress: '10.10.1.100', timestamp: daysAgo(50) },
      { userId: admin.id, action: 'USER_CREATED', module: 'User Management', details: 'Created new viewer account: Nyasha Mahachi - Operations department', ipAddress: '10.10.1.100', timestamp: daysAgo(48) },
      { userId: admin.id, action: 'USER_CREATED', module: 'User Management', details: 'Created new admin account: Blessing Shumba - IT Security department', ipAddress: '10.10.1.100', timestamp: daysAgo(46) },
      { userId: admin2.id, action: 'USER_CREATED', module: 'User Management', details: 'Created new analyst account: Mufaro Zvobgo - Cybersecurity department', ipAddress: '10.10.1.101', timestamp: daysAgo(47) },
      { userId: admin.id, action: 'USER_DEACTIVATED', module: 'User Management', details: 'Deactivated analyst account: Kudzai Chikumba - left organization', ipAddress: '10.10.1.100', timestamp: daysAgo(30) },
      { userId: admin.id, action: 'USER_UPDATED', module: 'User Management', details: 'Updated role for Chenai Dube from analyst to viewer', ipAddress: '10.10.1.100', timestamp: daysAgo(20) },
      { userId: null, action: 'SECURITY_ALERT', module: 'Security', details: 'Anomalous traffic detected from external IP 45.33.32.156 targeting Harare DC - blocked by firewall', ipAddress: '10.10.1.1', timestamp: daysAgo(12) },
      { userId: null, action: 'SECURITY_ALERT', module: 'Security', details: 'Port scan detected from 192.168.1.55 against Bulawayo network segment - source quarantined', ipAddress: '10.10.1.1', timestamp: daysAgo(15) },
      { userId: admin.id, action: 'SECURITY_INCIDENT', module: 'Security', details: 'Security incident declared: Critical vulnerability CVE-2024-NRZ-010 in core router - emergency response activated', ipAddress: '10.10.1.100', timestamp: daysAgo(5) },
      { userId: admin.id, action: 'SECURITY_INCIDENT_RESOLVED', module: 'Security', details: 'Security incident resolved: SNMP disclosure on Harare Gateway - SNMPv3 deployed and access restricted', ipAddress: '10.10.1.100', timestamp: daysAgo(30) },
      { userId: admin.id, action: 'REPORT_GENERATED', module: 'Reports', details: 'Generated monthly security summary report for November 2024', ipAddress: '10.10.1.100', timestamp: daysAgo(30) },
      { userId: analyst1.id, action: 'REPORT_GENERATED', module: 'Reports', details: 'Generated vulnerability assessment report for Harare station devices', ipAddress: '10.10.1.102', timestamp: daysAgo(20) },
      { userId: admin.id, action: 'REPORT_GENERATED', module: 'Reports', details: 'Generated quarterly IoT security compliance report Q4 2024', ipAddress: '10.10.1.100', timestamp: daysAgo(10) },
      { userId: admin2.id, action: 'REPORT_GENERATED', module: 'Reports', details: 'Generated incident response report for CVE-2024-NRZ-010 core router breach attempt', ipAddress: '10.10.1.101', timestamp: daysAgo(4) },
      { userId: admin.id, action: 'VULNERABILITY_DISCOVERED', module: 'Vulnerabilities', details: 'Discovered high vulnerability: Exposed Management Interface on Axle Counter - Harare Yard', ipAddress: '10.10.1.100', timestamp: hoursAgo(8) },
      { userId: analyst1.id, action: 'DEVICE_SCANNED', module: 'IoT Devices', details: 'Completed scheduled vulnerability scan for Mutare station devices - 2 new findings', ipAddress: '10.10.1.102', timestamp: hoursAgo(10) },
      { userId: analyst2.id, action: 'SOLUTION_UPDATED', module: 'Security Solutions', details: 'Updated TLS upgrade for CCTV interfaces - 3 of 7 cameras completed', ipAddress: '10.10.1.104', timestamp: hoursAgo(14) },
      { userId: admin.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed critical risk assessment of Core Router at Harare Data Center', ipAddress: '10.10.1.100', timestamp: hoursAgo(18) },
      { userId: analyst3.id, action: 'VULNERABILITY_UPDATED', module: 'Vulnerabilities', details: 'Updated CCTV Telnet Backdoor status to in_progress - firmware patch being applied', ipAddress: '10.10.1.105', timestamp: hoursAgo(22) },
      { userId: admin2.id, action: 'CONFIG_UPDATE', module: 'System', details: 'Updated firewall rules for Harare network segment - added rate limiting rules', ipAddress: '10.10.1.101', timestamp: hoursAgo(24) },
      { userId: analyst5.id, action: 'DEVICE_REGISTERED', module: 'IoT Devices', details: 'Registered new GPS Tracker - Maintenance Vehicle at Gweru station', ipAddress: '10.10.1.107', timestamp: daysAgo(2) },
      { userId: admin.id, action: 'SOLUTION_CREATED', module: 'Security Solutions', details: 'Created solution: Secure Boot Implementation for Track Sensors - PKI deployment required', ipAddress: '10.10.1.100', timestamp: daysAgo(3) },
      { userId: analyst1.id, action: 'VULNERABILITY_UPDATED', module: 'Vulnerabilities', details: 'Updated medium vulnerability: Unencrypted Video Storage on Gweru Warehouse CCTV - scheduled for fix', ipAddress: '10.10.1.102', timestamp: daysAgo(3) },
      { userId: analyst2.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed low-risk assessment of Temperature Sensor at Harare Substation', ipAddress: '10.10.1.104', timestamp: daysAgo(2) },
      { userId: admin.id, action: 'DATABASE_RESEED', module: 'System', details: 'Production database re-seeded with corrected data via re-seed API endpoint', ipAddress: '10.10.1.100', timestamp: new Date() },
    ];

    await Promise.all(
      auditLogData.map(a => db.auditLog.create({ data: a }))
    );

    await logAudit(auth.userId, 'DATABASE_RESEED', 'System', 'Production database re-seeded with corrected data');

    return NextResponse.json({
      success: true,
      data: {
        users: users.length + 1, // +1 for the admin that was kept
        devices: devices.length,
        vulnerabilities: vulnerabilities.length,
        solutions: solData.length,
        assessments: assessmentData.length,
        auditLogs: auditLogData.length,
      },
    });
  } catch (error) {
    console.error('Re-seed error:', error);
    return NextResponse.json({ success: false, error: 'Re-seed failed: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
  }
}
