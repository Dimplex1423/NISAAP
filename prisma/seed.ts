import { PrismaClient } from '@prisma/client';
import { scryptSync, randomBytes } from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const key = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${key}`;
}

// Date helper: create dates relative to now
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

async function main() {
  console.log('Seeding database...');

  // ======================== USERS ========================
  console.log('Creating users...');

  const admin = await prisma.user.upsert({
    where: { username: 'munyaradzi' },
    update: {},
    create: {
      username: 'munyaradzi',
      password: hashPassword('dimplex'),
      email: 'munyaradzi.chigama@gmail.com',
      fullName: 'Munyaradzi Chigama',
      role: 'admin',
      department: 'IT Security',
      isActive: true,
      lastLogin: hoursAgo(1),
    },
  });

  const analyst1 = await prisma.user.upsert({
    where: { username: 'tariro' },
    update: {},
    create: {
      username: 'tariro',
      password: hashPassword('password123'),
      email: 'tariro.moyo@gmail.com',
      fullName: 'Tariro Moyo',
      role: 'analyst',
      department: 'Network Operations',
      isActive: true,
      lastLogin: hoursAgo(3),
    },
  });

  const viewer1 = await prisma.user.upsert({
    where: { username: 'chenai' },
    update: {},
    create: {
      username: 'chenai',
      password: hashPassword('password123'),
      email: 'chenai.dube@gmail.com',
      fullName: 'Chenai Dube',
      role: 'viewer',
      department: 'Management',
      isActive: true,
      lastLogin: daysAgo(1),
    },
  });

  const analyst2 = await prisma.user.upsert({
    where: { username: 'tapiwa' },
    update: {},
    create: {
      username: 'tapiwa',
      password: hashPassword('password123'),
      email: 'tapiwa.ncube@gmail.com',
      fullName: 'Tapiwa Ncube',
      role: 'analyst',
      department: 'Cybersecurity',
      isActive: true,
      lastLogin: hoursAgo(6),
    },
  });

  const analyst3 = await prisma.user.upsert({
    where: { username: 'rupondo' },
    update: {},
    create: {
      username: 'rupondo',
      password: hashPassword('password123'),
      email: 'rupondo.gumbo@gmail.com',
      fullName: 'Rupondo Gumbo',
      role: 'analyst',
      department: 'IT Security',
      isActive: true,
      lastLogin: daysAgo(2),
    },
  });

  const viewer2 = await prisma.user.upsert({
    where: { username: 'nyasha' },
    update: {},
    create: {
      username: 'nyasha',
      password: hashPassword('password123'),
      email: 'nyasha.mahachi@gmail.com',
      fullName: 'Nyasha Mahachi',
      role: 'viewer',
      department: 'Operations',
      isActive: true,
      lastLogin: daysAgo(5),
    },
  });

  const analyst4 = await prisma.user.upsert({
    where: { username: 'kudzai' },
    update: {},
    create: {
      username: 'kudzai',
      password: hashPassword('password123'),
      email: 'kudzai.chikumba@gmail.com',
      fullName: 'Kudzai Chikumba',
      role: 'analyst',
      department: 'Network Operations',
      isActive: false,
      lastLogin: daysAgo(30),
    },
  });

  const admin2 = await prisma.user.upsert({
    where: { username: 'blessing' },
    update: {},
    create: {
      username: 'blessing',
      password: hashPassword('password123'),
      email: 'blessing.shumba@gmail.com',
      fullName: 'Blessing Shumba',
      role: 'admin',
      department: 'IT Security',
      isActive: true,
      lastLogin: hoursAgo(12),
    },
  });

  const viewer3 = await prisma.user.upsert({
    where: { username: 'farai' },
    update: {},
    create: {
      username: 'farai',
      password: hashPassword('password123'),
      email: 'farai.mujuru@gmail.com',
      fullName: 'Farai Mujuru',
      role: 'viewer',
      department: 'Finance',
      isActive: true,
      lastLogin: daysAgo(3),
    },
  });

  const analyst5 = await prisma.user.upsert({
    where: { username: 'mufaro' },
    update: {},
    create: {
      username: 'mufaro',
      password: hashPassword('password123'),
      email: 'mufaro.zvobgo@gmail.com',
      fullName: 'Mufaro Zvobgo',
      role: 'analyst',
      department: 'Cybersecurity',
      isActive: true,
      lastLogin: hoursAgo(8),
    },
  });

  const users = [admin, analyst1, viewer1, analyst2, analyst3, viewer2, analyst4, admin2, viewer3, analyst5];
  console.log(`Created ${users.length} users`);

  // ======================== IoT DEVICES ========================
  console.log('Creating IoT devices...');

  const deviceData = [
    // Controllers
    { deviceName: 'Signal Controller - Harare Station', deviceType: 'controller', ipAddress: '10.0.1.10', macAddress: '00:1A:2B:3C:4D:01', location: 'Harare Main Station', station: 'Harare', status: 'active', firmwareVersion: 'v2.3.1', riskLevel: 'critical', networkSegment: '10.0.1.0/24', lastScanDate: daysAgo(1) },
    { deviceName: 'Signal Controller - Bulawayo', deviceType: 'controller', ipAddress: '10.0.1.11', macAddress: '00:1A:2B:3C:4D:07', location: 'Bulawayo Main Station', station: 'Bulawayo', status: 'active', firmwareVersion: 'v2.3.0', riskLevel: 'critical', networkSegment: '10.0.1.0/24', lastScanDate: daysAgo(2) },
    { deviceName: 'Signal Controller - Mutare', deviceType: 'controller', ipAddress: '10.0.1.12', macAddress: '00:1A:2B:3C:4D:09', location: 'Mutare Station Signal Room', station: 'Mutare', status: 'active', firmwareVersion: 'v2.2.8', riskLevel: 'high', networkSegment: '10.0.1.0/24', lastScanDate: daysAgo(3) },
    { deviceName: 'Signal Controller - Gweru', deviceType: 'controller', ipAddress: '10.0.1.13', macAddress: '00:1A:2B:3C:4D:0A', location: 'Gweru Station Control Room', station: 'Gweru', status: 'active', firmwareVersion: 'v2.3.1', riskLevel: 'high', networkSegment: '10.0.1.0/24', lastScanDate: daysAgo(5) },
    { deviceName: 'Point Machine Controller - Harare Yard', deviceType: 'controller', ipAddress: '10.0.1.14', macAddress: '00:1A:2B:3C:4D:1A', location: 'Harare Marshalling Yard', station: 'Harare', status: 'active', firmwareVersion: 'v1.9.4', riskLevel: 'critical', networkSegment: '10.0.1.0/24', lastScanDate: daysAgo(2) },

    // Cameras
    { deviceName: 'CCTV Camera - Platform A Bulawayo', deviceType: 'camera', ipAddress: '10.0.2.20', macAddress: '00:1A:2B:3C:4D:02', location: 'Bulawayo Station - Platform A', station: 'Bulawayo', status: 'active', firmwareVersion: 'v1.8.5', riskLevel: 'high', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(2) },
    { deviceName: 'CCTV Camera - Freight Yard Harare', deviceType: 'camera', ipAddress: '10.0.2.21', macAddress: '00:1A:2B:3C:4D:08', location: 'Harare Freight Yard', station: 'Harare', status: 'inactive', firmwareVersion: 'v1.7.2', riskLevel: 'low', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(22) },
    { deviceName: 'CCTV Camera - Ticket Hall Mutare', deviceType: 'camera', ipAddress: '10.0.2.22', macAddress: '00:1A:2B:3C:4D:0B', location: 'Mutare Station Ticket Hall', station: 'Mutare', status: 'active', firmwareVersion: 'v2.0.1', riskLevel: 'medium', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(4) },
    { deviceName: 'CCTV Camera - Locomotive Depot', deviceType: 'camera', ipAddress: '10.0.2.23', macAddress: '00:1A:2B:3C:4D:0C', location: 'Bulawayo Locomotive Depot', station: 'Bulawayo', status: 'active', firmwareVersion: 'v1.8.5', riskLevel: 'high', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(3) },
    { deviceName: 'CCTV Camera - Warehouse Gweru', deviceType: 'camera', ipAddress: '10.0.2.24', macAddress: '00:1A:2B:3C:4D:1B', location: 'Gweru Goods Warehouse', station: 'Gweru', status: 'active', firmwareVersion: 'v2.0.1', riskLevel: 'medium', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(7) },
    { deviceName: 'CCTV Camera - Platform B Harare', deviceType: 'camera', ipAddress: '10.0.2.25', macAddress: '00:1A:2B:3C:4D:1C', location: 'Harare Station Platform B', station: 'Harare', status: 'active', firmwareVersion: 'v2.0.3', riskLevel: 'low', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(1) },
    { deviceName: 'CCTV Camera - Bridge Monitoring', deviceType: 'camera', ipAddress: '10.0.2.26', macAddress: '00:1A:2B:3C:4D:1D', location: 'Birchenough Bridge Rail Section', station: 'Mutare', status: 'maintenance', firmwareVersion: 'v1.9.0', riskLevel: 'medium', networkSegment: '10.0.2.0/24', lastScanDate: daysAgo(14) },

    // Sensors
    { deviceName: 'Track Sensor - KM 45 Hre-Blwyo', deviceType: 'sensor', ipAddress: '10.0.3.30', macAddress: '00:1A:2B:3C:4D:03', location: 'Harare-Bulawayo Line KM 45', station: 'Gweru', status: 'active', firmwareVersion: 'v3.1.0', riskLevel: 'medium', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(4) },
    { deviceName: 'Track Sensor - KM 120 Hre-Blwyo', deviceType: 'sensor', ipAddress: '10.0.3.31', macAddress: '00:1A:2B:3C:4D:0D', location: 'Harare-Bulawayo Line KM 120', station: 'Gweru', status: 'active', firmwareVersion: 'v3.1.0', riskLevel: 'low', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(5) },
    { deviceName: 'Temperature Sensor - Transformer 1', deviceType: 'sensor', ipAddress: '10.0.3.32', macAddress: '00:1A:2B:3C:4D:0E', location: 'Harare Substation Transformer 1', station: 'Harare', status: 'active', firmwareVersion: 'v2.5.2', riskLevel: 'low', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(3) },
    { deviceName: 'Vibration Sensor - Bridge 7', deviceType: 'sensor', ipAddress: '10.0.3.33', macAddress: '00:1A:2B:3C:4D:0F', location: 'Save River Bridge Structural Monitor', station: 'Mutare', status: 'active', firmwareVersion: 'v2.5.2', riskLevel: 'medium', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(6) },
    { deviceName: 'Weather Station - Dabuka', deviceType: 'sensor', ipAddress: '10.0.3.34', macAddress: '00:1A:2B:3C:4D:1E', location: 'Dabuka Wayside Station', station: 'Gweru', status: 'active', firmwareVersion: 'v1.3.8', riskLevel: 'low', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(8) },
    { deviceName: 'Axle Counter - Entry Harare', deviceType: 'sensor', ipAddress: '10.0.3.35', macAddress: '00:1A:2B:3C:4D:1F', location: 'Harare Yard Entry Point', station: 'Harare', status: 'active', firmwareVersion: 'v3.2.1', riskLevel: 'high', networkSegment: '10.0.3.0/24', lastScanDate: daysAgo(2) },

    // Gateways
    { deviceName: 'Network Gateway - Mutare', deviceType: 'gateway', ipAddress: '10.0.4.1', macAddress: '00:1A:2B:3C:4D:04', location: 'Mutare Station Server Room', station: 'Mutare', status: 'active', firmwareVersion: 'v4.0.2', riskLevel: 'high', networkSegment: '10.0.4.0/24', lastScanDate: daysAgo(5) },
    { deviceName: 'Network Gateway - Harare Central', deviceType: 'gateway', ipAddress: '10.0.4.2', macAddress: '00:1A:2B:3C:4D:10', location: 'Harare Central Data Center', station: 'Harare', status: 'active', firmwareVersion: 'v4.2.1', riskLevel: 'medium', networkSegment: '10.0.4.0/24', lastScanDate: daysAgo(1) },
    { deviceName: 'Network Gateway - Bulawayo', deviceType: 'gateway', ipAddress: '10.0.4.3', macAddress: '00:1A:2B:3C:4D:11', location: 'Bulawayo Station Server Room', station: 'Bulawayo', status: 'active', firmwareVersion: 'v4.0.2', riskLevel: 'high', networkSegment: '10.0.4.0/24', lastScanDate: daysAgo(4) },
    { deviceName: 'Edge Gateway - Gweru', deviceType: 'gateway', ipAddress: '10.0.4.4', macAddress: '00:1A:2B:3C:4D:20', location: 'Gweru Station Comms Cabinet', station: 'Gweru', status: 'maintenance', firmwareVersion: 'v3.8.0', riskLevel: 'medium', networkSegment: '10.0.4.0/24', lastScanDate: daysAgo(10) },

    // Routers
    { deviceName: 'Router - Kadoma', deviceType: 'router', ipAddress: '10.0.5.1', macAddress: '00:1A:2B:3C:4D:05', location: 'Kadoma Station Comms Room', station: 'Kadoma', status: 'maintenance', firmwareVersion: 'v2.1.7', riskLevel: 'medium', networkSegment: '10.0.5.0/24', lastScanDate: daysAgo(10) },
    { deviceName: 'Router - Kwekwe', deviceType: 'router', ipAddress: '10.0.5.2', macAddress: '00:1A:2B:3C:4D:12', location: 'Kwekwe Station Comms Room', station: 'Kwekwe', status: 'active', firmwareVersion: 'v2.1.7', riskLevel: 'low', networkSegment: '10.0.5.0/24', lastScanDate: daysAgo(6) },
    { deviceName: 'Core Router - Harare DC', deviceType: 'router', ipAddress: '10.0.5.3', macAddress: '00:1A:2B:3C:4D:13', location: 'Harare Data Center Core Rack', station: 'Harare', status: 'active', firmwareVersion: 'v3.5.0', riskLevel: 'critical', networkSegment: '10.0.5.0/24', lastScanDate: daysAgo(1) },
    { deviceName: 'Router - Masvingo', deviceType: 'router', ipAddress: '10.0.5.4', macAddress: '00:1A:2B:3C:4D:21', location: 'Masvingo Station Comms Room', station: 'Masvingo', status: 'active', firmwareVersion: 'v2.1.7', riskLevel: 'low', networkSegment: '10.0.5.0/24', lastScanDate: daysAgo(9) },

    // Trackers
    { deviceName: 'GPS Tracker - Locomotive 14', deviceType: 'tracker', ipAddress: '10.0.6.50', macAddress: '00:1A:2B:3C:4D:06', location: 'Locomotive 14 - Harare Yard', station: 'Harare', status: 'active', firmwareVersion: 'v1.5.3', riskLevel: 'low', networkSegment: '10.0.6.0/24', lastScanDate: daysAgo(3) },
    { deviceName: 'GPS Tracker - Locomotive 07', deviceType: 'tracker', ipAddress: '10.0.6.51', macAddress: '00:1A:2B:3C:4D:14', location: 'Locomotive 07 - En Route Bulawayo', station: 'Gweru', status: 'active', firmwareVersion: 'v1.5.3', riskLevel: 'low', networkSegment: '10.0.6.0/24', lastScanDate: daysAgo(2) },
    { deviceName: 'GPS Tracker - Wagon Set 22', deviceType: 'tracker', ipAddress: '10.0.6.52', macAddress: '00:1A:2B:3C:4D:15', location: 'Freight Wagon Set 22 - Mutare Line', station: 'Mutare', status: 'active', firmwareVersion: 'v1.5.1', riskLevel: 'medium', networkSegment: '10.0.6.0/24', lastScanDate: daysAgo(4) },
    { deviceName: 'GPS Tracker - Locomotive 03', deviceType: 'tracker', ipAddress: '10.0.6.53', macAddress: '00:1A:2B:3C:4D:16', location: 'Locomotive 03 - Harare Yard', station: 'Harare', status: 'inactive', firmwareVersion: 'v1.4.0', riskLevel: 'low', networkSegment: '10.0.6.0/24', lastScanDate: daysAgo(30) },
    { deviceName: 'GPS Tracker - Maintenance Vehicle', deviceType: 'tracker', ipAddress: '10.0.6.54', macAddress: '00:1A:2B:3C:4D:22', location: 'Track Maintenance Vehicle - Gweru', station: 'Gweru', status: 'active', firmwareVersion: 'v1.5.3', riskLevel: 'low', networkSegment: '10.0.6.0/24', lastScanDate: daysAgo(5) },
  ];

  const devices = await Promise.all(
    deviceData.map(d => prisma.ioTDevice.create({ data: d }))
  );
  console.log(`Created ${devices.length} IoT devices`);

  // ======================== VULNERABILITIES ========================
  console.log('Creating vulnerabilities...');

  const vulnerabilityData = [
    // Critical vulnerabilities
    { deviceId: devices[0].id, title: 'Unencrypted Signal Communication Protocol', description: 'The signal controller communicates using an unencrypted protocol, allowing potential man-in-the-middle attacks that could compromise railway signal integrity. An attacker within radio range could intercept, modify, or inject signal commands leading to train collisions or derailments.', severity: 'critical', cvssScore: 9.8, cveId: 'CVE-2024-NRZ-001', status: 'in_progress', discoveredDate: daysAgo(60), remediation: 'Implement TLS 1.3 encryption for all signal communication protocols. Deploy certificate-based authentication between controllers and central system.' },
    { deviceId: devices[5].id, title: 'Default Credentials on CCTV System', description: 'CCTV camera system is using factory default username and password credentials, allowing unauthorized access to video feeds. Attackers could view, modify, or disable surveillance footage, compromising physical security monitoring at the station.', severity: 'critical', cvssScore: 9.1, cveId: 'CVE-2024-NRZ-002', status: 'open', discoveredDate: daysAgo(55), remediation: 'Change all default credentials immediately. Implement password rotation policy and multi-factor authentication for camera management interfaces.' },
    { deviceId: devices[4].id, title: 'Buffer Overflow in Point Machine Controller', description: 'The point machine controller firmware contains a buffer overflow vulnerability in the command parsing module. A specially crafted packet could trigger remote code execution, potentially allowing an attacker to change track points remotely.', severity: 'critical', cvssScore: 9.7, cveId: 'CVE-2024-NRZ-006', status: 'open', discoveredDate: daysAgo(10), remediation: 'Apply emergency firmware patch v1.9.5. Implement network-level filtering to restrict command sources. Add intrusion detection rules for anomalous point commands.' },
    { deviceId: devices[3].id, title: 'Remote Code Execution via Signal Firmware', description: 'Signal controller at Gweru Station runs firmware v2.2.8 which contains a remote code execution vulnerability in the diagnostic interface. The interface is exposed on the network without authentication.', severity: 'critical', cvssScore: 9.6, cveId: 'CVE-2024-NRZ-005', status: 'acknowledged', discoveredDate: daysAgo(15), remediation: 'Update firmware to v2.3.2. Disable diagnostic interface on production network. Implement network segmentation to isolate controllers.' },
    { deviceId: devices[27].id, title: 'Authentication Bypass in Core Router', description: 'The core router at Harare Data Center has an authentication bypass vulnerability in the web management interface. An attacker can access admin functions by manipulating session tokens, potentially reconfiguring the entire rail network routing.', severity: 'critical', cvssScore: 9.4, cveId: 'CVE-2024-NRZ-010', status: 'in_progress', discoveredDate: daysAgo(5), remediation: 'Apply vendor security patch immediately. Restrict web management access to localhost only. Deploy out-of-band management network.' },

    // High vulnerabilities
    { deviceId: devices[17].id, title: 'Outdated Firmware with Known Exploits', description: 'Gateway at Mutare Station is running firmware version v4.0.2 with multiple known CVE vulnerabilities that could allow remote code execution and privilege escalation. The device is critical as it routes all traffic from the eastern rail corridor.', severity: 'high', cvssScore: 8.5, cveId: 'CVE-2024-NRZ-003', status: 'acknowledged', discoveredDate: daysAgo(50), remediation: 'Update firmware to latest version v4.2.1 which patches all known vulnerabilities.' },
    { deviceId: devices[24].id, title: 'Missing Network Segmentation on Kadoma Router', description: 'Router at Kadoma Station lacks proper VLAN segmentation, allowing lateral movement between IoT device networks and corporate network. An attacker compromising one device could pivot to all connected systems.', severity: 'high', cvssScore: 7.8, status: 'in_progress', discoveredDate: daysAgo(45), remediation: 'Implement VLAN segmentation. Deploy firewall rules to restrict traffic between network zones.' },
    { deviceId: devices[8].id, title: 'CCTV Camera Unauthenticated RTSP Stream', description: 'CCTV camera at Mutare Ticket Hall exposes an unauthenticated RTSP video stream. Anyone on the network can view live surveillance footage without credentials, potentially aiding physical intrusion planning.', severity: 'high', cvssScore: 8.2, cveId: 'CVE-2024-NRZ-007', status: 'open', discoveredDate: daysAgo(20), remediation: 'Enable RTSP authentication on all cameras. Implement stream encryption. Restrict RTSP access to monitoring VLAN only.' },
    { deviceId: devices[19].id, title: 'Edge Gateway Weak SNMP Community String', description: 'Edge gateway at Gweru uses default "public" SNMP community string, allowing attackers to read device configuration, enumerate network topology, and potentially modify device settings via SNMP write access.', severity: 'high', cvssScore: 7.5, status: 'acknowledged', discoveredDate: daysAgo(12), remediation: 'Change SNMP community strings to complex values. Disable SNMPv1/v2c and migrate to SNMPv3 with authentication and encryption.' },
    { deviceId: devices[9].id, title: 'CCTV Camera Hardcoded Telnet Backdoor', description: 'CCTV camera at Bulawayo Locomotive Depot contains a hardcoded Telnet backdoor account that cannot be disabled through the management interface. Vendor confirmed this was left from factory debugging.', severity: 'high', cvssScore: 8.8, cveId: 'CVE-2024-NRZ-008', status: 'in_progress', discoveredDate: daysAgo(8), remediation: 'Apply vendor firmware update that removes backdoor account. Block Telnet access at network level using ACLs. Monitor for unauthorized Telnet connections.' },
    { deviceId: devices[21].id, title: 'Gateway Denial of Service Vulnerability', description: 'Bulawayo network gateway has a DoS vulnerability in the packet processing engine. A crafted packet sequence can cause the gateway to restart, creating a temporary outage for all connected IoT devices at Bulawayo station.', severity: 'high', cvssScore: 7.9, cveId: 'CVE-2024-NRZ-009', status: 'open', discoveredDate: daysAgo(7), remediation: 'Deploy rate limiting and packet filtering rules. Apply firmware patch v4.1.0 when available. Implement gateway redundancy.' },
    { deviceId: devices[22].id, title: 'Exposed Management Interface on Axle Counter', description: 'The axle counter sensor at Harare Yard entry point has its HTTP management interface exposed on the general network without access controls. This allows any network user to modify counting parameters and disrupt train detection.', severity: 'high', cvssScore: 8.0, status: 'open', discoveredDate: daysAgo(4), remediation: 'Move management interface to dedicated VLAN. Implement IP-based access control lists. Add authentication to management web interface.' },

    // Medium vulnerabilities
    { deviceId: devices[13].id, title: 'Weak Authentication Mechanism on Track Sensor', description: 'Track sensor at KM 45 uses simple 4-digit PIN for authentication which can be brute-forced within minutes using standard tools. The PIN is shared across all sensors on the line.', severity: 'medium', cvssScore: 6.5, cveId: 'CVE-2024-NRZ-004', status: 'open', discoveredDate: daysAgo(40), remediation: 'Upgrade to certificate-based authentication. Implement account lockout after failed attempts.' },
    { deviceId: devices[30].id, title: 'GPS Spoofing Vulnerability on Wagon Set 22', description: 'GPS tracker on freight wagon set 22 lacks signal authentication, making it susceptible to GPS spoofing attacks that could falsify locomotive location data. This could lead to incorrect scheduling and potential safety issues.', severity: 'medium', cvssScore: 5.9, status: 'acknowledged', discoveredDate: daysAgo(35), remediation: 'Implement GPS signal authentication and cross-validation with cellular triangulation.' },
    { deviceId: devices[14].id, title: 'Sensor Firmware Missing Integrity Verification', description: 'Track sensor at KM 120 Harare-Bulawayo line does not verify firmware integrity during boot. An attacker with physical access could replace firmware with a malicious version without detection.', severity: 'medium', cvssScore: 6.2, status: 'acknowledged', discoveredDate: daysAgo(18), remediation: 'Implement secure boot with firmware signature verification. Enable tamper detection alerts.' },
    { deviceId: devices[11].id, title: 'CCTV Camera Unencrypted Video Storage', description: 'CCTV camera at Gweru Warehouse stores recorded footage without encryption on the local SD card. If the device is physically accessed, recorded video could be extracted and viewed.', severity: 'medium', cvssScore: 5.5, status: 'acknowledged', discoveredDate: daysAgo(25), remediation: 'Enable AES-256 encryption for local storage. Implement secure key management. Move to central NVR storage with encryption.' },
    { deviceId: devices[18].id, title: 'Gateway SNMP Information Disclosure', description: 'Harare Central Gateway reveals system information including firmware version, uptime, and connected devices through SNMP queries without requiring authentication.', severity: 'medium', cvssScore: 5.3, status: 'resolved', discoveredDate: daysAgo(60), resolvedDate: daysAgo(30), remediation: 'Configure SNMP access controls. Move to SNMPv3. Restrict SNMP queries to management workstation only.' },
    { deviceId: devices[7].id, title: 'CCTV Camera Outdated TLS Configuration', description: 'CCTV camera on Platform B at Harare Station supports only TLS 1.0 and TLS 1.1 which are deprecated and have known vulnerabilities. The management web interface uses these weak protocols.', severity: 'medium', cvssScore: 6.0, status: 'in_progress', discoveredDate: daysAgo(14), remediation: 'Update camera firmware to support TLS 1.2 minimum. Disable TLS 1.0 and 1.1 on all IoT management interfaces.' },
    { deviceId: devices[16].id, title: 'Vibration Sensor Insecure Data Transmission', description: 'The vibration sensor at Save River Bridge transmits structural monitoring data over HTTP without encryption. This data could be intercepted and manipulated, potentially masking structural damage alerts.', severity: 'medium', cvssScore: 5.7, status: 'open', discoveredDate: daysAgo(9), remediation: 'Implement HTTPS for data transmission. Deploy certificate pinning on sensor communications.' },

    // Low vulnerabilities
    { deviceId: devices[0].id, title: 'Insufficient Logging and Monitoring', description: 'Signal controller at Harare Station does not generate adequate security logs, making it difficult to detect unauthorized access attempts or configuration changes.', severity: 'medium', cvssScore: 5.3, status: 'resolved', discoveredDate: daysAgo(90), resolvedDate: daysAgo(40), remediation: 'Deploy centralized logging system with SIEM integration. Configure alert thresholds for suspicious activities.' },
    { deviceId: devices[15].id, title: 'Temperature Sensor Unencrypted MQTT Broker', description: 'The temperature sensor communicates via MQTT to an unencrypted broker. While the data is not safety-critical, it could be manipulated to trigger false overheating alerts.', severity: 'low', cvssScore: 3.5, status: 'acknowledged', discoveredDate: daysAgo(22), remediation: 'Configure MQTT broker to use TLS. Implement client certificate authentication for all MQTT connections.' },
    { deviceId: devices[6].id, title: 'CCTV Camera Missing Privacy Masking', description: 'CCTV camera at Mutare Ticket Hall does not have privacy masking configured, potentially capturing areas outside the station perimeter that could raise privacy concerns.', severity: 'low', cvssScore: 2.5, status: 'resolved', discoveredDate: daysAgo(45), resolvedDate: daysAgo(20), remediation: 'Configure privacy masking zones on all CCTV cameras to exclude non-monitoring areas.' },
    { deviceId: devices[28].id, title: 'Router at Kwekwe - No NTP Authentication', description: 'Kwekwe station router does not use authenticated NTP for time synchronization. An attacker could potentially manipulate the device clock, affecting log timestamp accuracy.', severity: 'low', cvssScore: 3.1, status: 'open', discoveredDate: daysAgo(30), remediation: 'Configure authenticated NTP using symmetric keys. Point to trusted NRZ time servers only.' },
    { deviceId: devices[30].id, title: 'GPS Tracker - Missing Asset Tag', description: 'GPS tracker on Locomotive 03 is not registered in the asset management database. The device is currently inactive and unmonitored, creating a potential blind spot if reactivated without proper security review.', severity: 'low', cvssScore: 2.0, status: 'acknowledged', discoveredDate: daysAgo(60), remediation: 'Register device in asset management database. Perform security review before reactivation. Update firmware to latest version.' },
    { deviceId: devices[12].id, title: 'CCTV Camera - Insufficient Retention Period', description: 'CCTV camera at Bridge Monitoring site only retains 7 days of footage. NRZ security policy requires minimum 30 days retention for all surveillance data.', severity: 'low', cvssScore: 2.8, status: 'in_progress', discoveredDate: daysAgo(16), remediation: 'Increase storage capacity or configure offsite backup. Update retention policy to 30 days minimum.' },
    { deviceId: devices[20].id, title: 'Weather Station - No Firmware Update Mechanism', description: 'Weather station at Dabuka does not support remote firmware updates. All updates require physical access, making it difficult to deploy security patches in a timely manner.', severity: 'low', cvssScore: 3.0, status: 'acknowledged', discoveredDate: daysAgo(28), remediation: 'Implement secure over-the-air firmware update capability. Establish quarterly physical maintenance schedule as interim measure.' },
  ];

  const vulnerabilities = await Promise.all(
    vulnerabilityData.map(v => prisma.vulnerability.create({ data: v }))
  );
  console.log(`Created ${vulnerabilities.length} vulnerabilities`);

  // ======================== SECURITY SOLUTIONS ========================
  console.log('Creating security solutions...');

  const solutionData = [
    // Critical priority solutions
    { vulnerabilityId: vulnerabilities[0].id, title: 'Implement TLS 1.3 Encryption for Signal Communications', description: 'Deploy TLS 1.3 encryption protocol across all signal communication channels. This includes updating controller firmware, deploying X.509 certificates, and reconfiguring the central monitoring system to enforce encrypted communications. Phase 1 covers Harare and Bulawayo signal controllers.', implementationStatus: 'in_progress', priority: 'critical', assignedTo: 'Munyaradzi Chigama', dueDate: daysAgo(-30), costEstimate: '$45,000' },
    { vulnerabilityId: vulnerabilities[1].id, title: 'Credential Rotation and MFA Implementation for CCTV', description: 'Change all default credentials on CCTV systems and implement multi-factor authentication. Deploy a credential management system for all IoT devices with automatic rotation every 90 days. This covers all 7 CCTV cameras across the network.', implementationStatus: 'proposed', priority: 'critical', assignedTo: 'Tariro Moyo', dueDate: daysAgo(-15), costEstimate: '$12,000' },
    { vulnerabilityId: vulnerabilities[2].id, title: 'Emergency Firmware Patch for Point Machine Controller', description: 'Apply emergency firmware patch v1.9.5 to the point machine controller at Harare Yard. This patch addresses the buffer overflow vulnerability in the command parsing module. Includes network-level filtering to restrict command sources and IDS rules for anomalous point commands.', implementationStatus: 'in_progress', priority: 'critical', assignedTo: 'Munyaradzi Chigama', dueDate: daysAgo(-5), costEstimate: '$5,000' },
    { vulnerabilityId: vulnerabilities[3].id, title: 'Signal Controller Firmware Upgrade - Gweru', description: 'Update Gweru signal controller firmware from v2.2.8 to v2.3.2 which patches the remote code execution vulnerability. Disable diagnostic interface on production network and implement network segmentation to isolate controllers from general network.', implementationStatus: 'proposed', priority: 'critical', assignedTo: 'Tapiwa Ncube', dueDate: daysAgo(-10), costEstimate: '$8,000' },
    { vulnerabilityId: vulnerabilities[4].id, title: 'Core Router Security Hardening', description: 'Apply vendor security patch for authentication bypass in core router web management interface. Restrict web management access to localhost only via SSH tunnel. Deploy out-of-band management network for all critical network infrastructure.', implementationStatus: 'in_progress', priority: 'critical', assignedTo: 'Munyaradzi Chigama', dueDate: daysAgo(-3), costEstimate: '$22,000' },

    // High priority solutions
    { vulnerabilityId: vulnerabilities[5].id, title: 'Firmware Update and Patch Management Program', description: 'Update all gateway devices to firmware v4.2.1. Establish a regular patch management schedule with quarterly review cycles and automated update verification system. Covers Mutare, Bulawayo, and Gweru gateways.', implementationStatus: 'proposed', priority: 'high', assignedTo: 'Tariro Moyo', dueDate: daysAgo(-45), costEstimate: '$8,000' },
    { vulnerabilityId: vulnerabilities[6].id, title: 'Network Segmentation and Firewall Deployment', description: 'Implement VLAN segmentation across all network segments at Kadoma Station. Deploy next-generation firewall with IoT-specific rules. Configure traffic monitoring and anomaly detection. Separate IoT, management, and corporate traffic zones.', implementationStatus: 'in_progress', priority: 'high', assignedTo: 'Munyaradzi Chigama', dueDate: daysAgo(-60), costEstimate: '$65,000' },
    { vulnerabilityId: vulnerabilities[7].id, title: 'RTSP Stream Authentication and Encryption', description: 'Enable RTSP authentication on all CCTV cameras across the network. Implement stream encryption using SRTP. Restrict RTSP access to dedicated monitoring VLAN. Deploy media gateway for authorized external access.', implementationStatus: 'proposed', priority: 'high', assignedTo: 'Rupondo Gumbo', dueDate: daysAgo(-20), costEstimate: '$15,000' },
    { vulnerabilityId: vulnerabilities[8].id, title: 'SNMP Security Hardening - Gweru Edge Gateway', description: 'Change SNMP community strings from defaults to complex values on Gweru edge gateway. Disable SNMPv1/v2c and migrate to SNMPv3 with authentication and encryption. Configure access control lists for SNMP queries.', implementationStatus: 'proposed', priority: 'high', assignedTo: 'Tapiwa Ncube', dueDate: daysAgo(-14), costEstimate: '$3,000' },
    { vulnerabilityId: vulnerabilities[9].id, title: 'CCTV Telnet Backdoor Removal', description: 'Apply vendor firmware update that removes hardcoded Telnet backdoor account from Bulawayo depot camera. Block Telnet access at network level using ACLs on the gateway. Monitor for unauthorized Telnet connection attempts using IDS.', implementationStatus: 'in_progress', priority: 'high', assignedTo: 'Rupondo Gumbo', dueDate: daysAgo(-7), costEstimate: '$4,000' },
    { vulnerabilityId: vulnerabilities[10].id, title: 'Gateway DoS Mitigation - Bulawayo', description: 'Deploy rate limiting and packet filtering rules on Bulawayo gateway to mitigate DoS vulnerability. Apply firmware patch v4.1.0 when available from vendor. Implement gateway redundancy with automatic failover capability.', implementationStatus: 'proposed', priority: 'high', assignedTo: 'Tapiwa Ncube', dueDate: daysAgo(-25), costEstimate: '$18,000' },
    { vulnerabilityId: vulnerabilities[11].id, title: 'Axle Counter Management Interface Protection', description: 'Move axle counter HTTP management interface to dedicated management VLAN. Implement IP-based access control lists restricting access to authorized admin workstations only. Add authentication and HTTPS to management web interface.', implementationStatus: 'proposed', priority: 'high', assignedTo: 'Rupondo Gumbo', dueDate: daysAgo(-12), costEstimate: '$6,000' },

    // Medium priority solutions
    { vulnerabilityId: vulnerabilities[12].id, title: 'Certificate-Based Authentication for Track Sensors', description: 'Upgrade all track sensors from 4-digit PIN authentication to certificate-based authentication using X.509 certificates. Deploy PKI infrastructure for certificate management. Implement account lockout after 5 failed attempts.', implementationStatus: 'proposed', priority: 'medium', assignedTo: 'Tariro Moyo', dueDate: daysAgo(-50), costEstimate: '$25,000' },
    { vulnerabilityId: vulnerabilities[13].id, title: 'GPS Signal Authentication for Freight Tracking', description: 'Implement GPS signal authentication on all locomotive and wagon trackers. Deploy cross-validation system using cellular triangulation and inertial measurement units. Alert on discrepancies between GPS and secondary location data.', implementationStatus: 'proposed', priority: 'medium', assignedTo: 'Mufaro Zvobgo', dueDate: daysAgo(-40), costEstimate: '$30,000' },
    { vulnerabilityId: vulnerabilities[15].id, title: 'CCTV Video Storage Encryption', description: 'Enable AES-256 encryption for local SD card storage on all CCTV cameras. Implement secure key management system. Migrate to central NVR storage with encryption at rest and in transit for all surveillance data.', implementationStatus: 'proposed', priority: 'medium', assignedTo: 'Mufaro Zvobgo', dueDate: daysAgo(-35), costEstimate: '$20,000' },
    { vulnerabilityId: vulnerabilities[17].id, title: 'TLS Upgrade for CCTV Management Interfaces', description: 'Update camera firmware to support TLS 1.2 minimum on all CCTV management web interfaces. Disable TLS 1.0 and 1.1 across all devices. Deploy certificate management for HTTPS on all IoT management endpoints.', implementationStatus: 'in_progress', priority: 'medium', assignedTo: 'Tariro Moyo', dueDate: daysAgo(-20), costEstimate: '$10,000' },

    // Implemented solutions
    { vulnerabilityId: vulnerabilities[16].id, title: 'Centralized Logging and SIEM Deployment', description: 'Deploy centralized logging infrastructure with SIEM capabilities for all IoT devices. Configure automated alerting and reporting. Integration with existing network monitoring tools.', implementationStatus: 'implemented', priority: 'medium', assignedTo: 'Tariro Moyo', completedDate: daysAgo(30), costEstimate: '$35,000' },
    { vulnerabilityId: vulnerabilities[18].id, title: 'SNMP Access Control Hardening - Harare Gateway', description: 'Configured SNMP access controls on Harare Central Gateway. Migrated from SNMPv2c to SNMPv3 with authentication and encryption. Restricted SNMP queries to management workstation only.', implementationStatus: 'implemented', priority: 'medium', assignedTo: 'Munyaradzi Chigama', completedDate: daysAgo(30), costEstimate: '$3,000' },
    { vulnerabilityId: vulnerabilities[20].id, title: 'Privacy Masking Configuration - CCTV Network', description: 'Configured privacy masking zones on all CCTV cameras to exclude non-monitoring areas. Applied consistent privacy zones based on NRZ surveillance policy requirements.', implementationStatus: 'implemented', priority: 'low', assignedTo: 'Tariro Moyo', completedDate: daysAgo(20), costEstimate: '$2,000' },

    // Low priority solutions
    { vulnerabilityId: vulnerabilities[21].id, title: 'Authenticated NTP Deployment', description: 'Configure authenticated NTP using symmetric keys on Kwekwe router. Point to trusted NRZ time servers only. Implement NTP monitoring to detect time synchronization anomalies.', implementationStatus: 'proposed', priority: 'low', assignedTo: 'Mufaro Zvobgo', dueDate: daysAgo(-60), costEstimate: '$1,500' },
    { vulnerabilityId: vulnerabilities[22].id, title: 'Asset Registration for Inactive GPS Tracker', description: 'Register inactive GPS tracker on Locomotive 03 in the asset management database. Perform full security review before reactivation. Update firmware to latest version and configure monitoring.', implementationStatus: 'proposed', priority: 'low', assignedTo: 'Mufaro Zvobgo', dueDate: daysAgo(-45), costEstimate: '$1,000' },
    { vulnerabilityId: vulnerabilities[14].id, title: 'Secure Boot Implementation for Track Sensors', description: 'Implement secure boot with firmware signature verification on all track sensors. Enable tamper detection alerts and integrate with SIEM for real-time notification of firmware modifications.', implementationStatus: 'proposed', priority: 'medium', assignedTo: 'Rupondo Gumbo', dueDate: daysAgo(-30), costEstimate: '$15,000' },
  ];

  const solutions = await Promise.all(
    solutionData.map(s => prisma.securitySolution.create({ data: s }))
  );
  console.log(`Created ${solutions.length} security solutions`);

  // ======================== ASSESSMENTS ========================
  console.log('Creating assessments...');

  const assessmentData = [
    { deviceId: devices[0].id, assessorId: admin.id, findings: 'Signal controller at Harare Station has critical security gaps including unencrypted communications and insufficient logging. The device runs outdated firmware v2.3.1 with known vulnerabilities. Physical access controls to the signal room are adequate but network security needs immediate attention.', recommendations: '1. Implement TLS 1.3 encryption immediately. 2. Update firmware to v2.3.2. 3. Deploy centralized logging. 4. Implement certificate-based authentication. 5. Add network intrusion detection.', riskRating: 'critical', assessmentDate: daysAgo(50) },
    { deviceId: devices[17].id, assessorId: analyst1.id, findings: 'Network gateway at Mutare Station running outdated firmware v4.0.2 with multiple known CVEs. Device lacks proper access controls and monitoring capabilities. SNMP community strings are set to defaults. No rate limiting or DoS protection configured.', recommendations: '1. Update firmware to latest version v4.2.1. 2. Implement network segmentation. 3. Enable detailed logging. 4. Deploy intrusion detection system. 5. Change SNMP credentials.', riskRating: 'high', assessmentDate: daysAgo(45) },
    { deviceId: devices[13].id, assessorId: admin.id, findings: 'Track sensor at KM 45 Harare-Bulawayo line uses weak 4-digit PIN authentication. GPS tracking data lacks integrity verification. Device communicates on unencrypted channel. Firmware integrity cannot be verified during boot.', recommendations: '1. Upgrade authentication to certificate-based. 2. Implement data integrity checks. 3. Encrypt communication channels. 4. Implement secure boot mechanism.', riskRating: 'medium', assessmentDate: daysAgo(40) },
    { deviceId: devices[4].id, assessorId: analyst2.id, findings: 'Point machine controller at Harare Marshalling Yard runs firmware v1.9.4 with buffer overflow vulnerability in command parsing. The diagnostic port is accessible from the general network. No input validation is performed on received commands.', recommendations: '1. Apply emergency firmware patch v1.9.5 immediately. 2. Disable diagnostic port on production network. 3. Implement command validation and filtering. 4. Add anomaly detection for point commands.', riskRating: 'critical', assessmentDate: daysAgo(10) },
    { deviceId: devices[27].id, assessorId: admin.id, findings: 'Core router at Harare Data Center has authentication bypass in web management interface. Session tokens can be manipulated to gain admin access. The router handles all traffic for the northern rail corridor making this a critical risk.', recommendations: '1. Apply vendor security patch immediately. 2. Restrict web management to localhost only. 3. Deploy out-of-band management network. 4. Implement session token validation. 5. Add multi-factor authentication.', riskRating: 'critical', assessmentDate: daysAgo(5) },
    { deviceId: devices[5].id, assessorId: analyst3.id, findings: 'CCTV camera at Bulawayo Platform A uses factory default credentials. Video feeds are accessible without authentication. Camera firmware v1.8.5 is outdated and missing security patches from the last 2 years.', recommendations: '1. Change default credentials immediately. 2. Update firmware to latest version. 3. Implement video stream authentication. 4. Deploy network segmentation for CCTV VLAN.', riskRating: 'high', assessmentDate: daysAgo(35) },
    { deviceId: devices[19].id, assessorId: analyst2.id, findings: 'Edge gateway at Gweru Station uses default SNMP community strings. Device is currently in maintenance mode but still connected to the network. Firmware v3.8.0 has known vulnerabilities. No access logging is configured.', recommendations: '1. Change SNMP credentials immediately. 2. Update firmware when maintenance is complete. 3. Configure access logging. 4. Implement SNMPv3. 5. Review maintenance procedures to ensure security during downtime.', riskRating: 'high', assessmentDate: daysAgo(12) },
    { deviceId: devices[22].id, assessorId: analyst3.id, findings: 'Axle counter at Harare Yard entry point has HTTP management interface exposed on general network without authentication. This is a safety-critical device that counts train axles for track occupancy detection. Unauthorized modification could cause safety incidents.', recommendations: '1. Move management interface to dedicated VLAN. 2. Implement authentication on management interface. 3. Deploy HTTPS with certificate pinning. 4. Add IP-based access restrictions.', riskRating: 'high', assessmentDate: daysAgo(4) },
    { deviceId: devices[9].id, assessorId: analyst1.id, findings: 'CCTV camera at Bulawayo Locomotive Depot contains a hardcoded Telnet backdoor account. Vendor confirmed this was a factory debugging account left in production firmware. Camera is in a high-security area monitoring expensive locomotive assets.', recommendations: '1. Apply vendor firmware update to remove backdoor. 2. Block Telnet at network level. 3. Monitor for unauthorized Telnet access. 4. Review all camera models from same vendor for similar issues.', riskRating: 'high', assessmentDate: daysAgo(8) },
    { deviceId: devices[18].id, assessorId: admin.id, findings: 'Harare Central Gateway firmware v4.2.1 is up to date. SNMP information disclosure vulnerability has been resolved with migration to SNMPv3. Device logging is properly configured and integrated with SIEM. Minor recommendation to review access control lists quarterly.', recommendations: '1. Continue quarterly ACL reviews. 2. Monitor SIEM alerts for unauthorized access attempts. 3. Maintain firmware update schedule.', riskRating: 'low', assessmentDate: daysAgo(7) },
    { deviceId: devices[11].id, assessorId: analyst5.id, findings: 'CCTV camera at Gweru Warehouse stores footage on local SD card without encryption. Camera firmware v2.0.1 is relatively current. Video stream authentication is properly configured. Local storage encryption is the primary gap.', recommendations: '1. Enable AES-256 encryption for local SD card storage. 2. Deploy centralized NVR storage with encryption. 3. Implement secure key management system.', riskRating: 'medium', assessmentDate: daysAgo(25) },
    { deviceId: devices[21].id, assessorId: analyst5.id, findings: 'Bulawayo network gateway firmware v4.0.2 has a DoS vulnerability in the packet processing engine. A specific sequence of crafted packets can cause the device to restart. No redundancy exists for this gateway, meaning a successful attack would disable all Bulawayo IoT connectivity.', recommendations: '1. Deploy rate limiting and packet filtering. 2. Apply firmware patch v4.1.0. 3. Implement gateway redundancy with automatic failover. 4. Add DDoS protection at network perimeter.', riskRating: 'high', assessmentDate: daysAgo(7) },
    { deviceId: devices[14].id, assessorId: analyst3.id, findings: 'Track sensor at KM 120 runs current firmware v3.1.0 but lacks secure boot capability. Device does not verify firmware integrity during startup. Authentication uses the same shared 4-digit PIN as other sensors on the line. Physical tampering risk is moderate due to remote location.', recommendations: '1. Implement secure boot with firmware signature verification. 2. Upgrade to unique per-device authentication credentials. 3. Deploy tamper-evident enclosures. 4. Add physical tamper detection alerts.', riskRating: 'medium', assessmentDate: daysAgo(18) },
    { deviceId: devices[15].id, assessorId: analyst2.id, findings: 'Temperature sensor at Harare Substation uses unencrypted MQTT broker for data transmission. While the data is not directly safety-critical, false temperature readings could trigger unnecessary equipment shutdowns affecting rail operations.', recommendations: '1. Configure MQTT broker for TLS encryption. 2. Implement client certificate authentication. 3. Add data validation rules for temperature readings. 4. Deploy anomaly detection for sensor data.', riskRating: 'low', assessmentDate: daysAgo(22) },
  ];

  const assessments = await Promise.all(
    assessmentData.map(a => prisma.assessment.create({ data: a }))
  );
  console.log(`Created ${assessments.length} assessments`);

  // ======================== AUDIT LOGS ========================
  console.log('Creating audit logs...');

  const auditLogData = [
    // System events
    { userId: admin.id, action: 'SYSTEM_INIT', module: 'System', details: 'NISAAP system initialized and seeded with comprehensive data', ipAddress: '10.10.1.100', timestamp: daysAgo(60) },
    { userId: admin.id, action: 'CONFIG_UPDATE', module: 'System', details: 'System security policies updated - password complexity rules enforced', ipAddress: '10.10.1.100', timestamp: daysAgo(58) },
    { userId: admin2.id, action: 'CONFIG_UPDATE', module: 'System', details: 'Firewall rules updated for Harare Data Center network segment', ipAddress: '10.10.1.101', timestamp: daysAgo(55) },

    // User login events
    { userId: admin.id, action: 'LOGIN', module: 'Authentication', details: 'Admin user Munyaradzi Chigama logged in from Harare DC', ipAddress: '10.10.1.100', timestamp: daysAgo(55) },
    { userId: analyst1.id, action: 'LOGIN', module: 'Authentication', details: 'Analyst Tariro Moyo logged in from Network Operations Center', ipAddress: '10.10.1.102', timestamp: daysAgo(54) },
    { userId: viewer1.id, action: 'LOGIN', module: 'Authentication', details: 'Viewer Chenai Dube logged in from Management office', ipAddress: '10.10.1.103', timestamp: daysAgo(53) },
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

    // Failed login attempts
    { userId: null, action: 'LOGIN_FAILED', module: 'Authentication', details: 'Failed login attempt for username admin from unknown IP 192.168.1.55', ipAddress: '192.168.1.55', timestamp: daysAgo(15) },
    { userId: null, action: 'LOGIN_FAILED', module: 'Authentication', details: 'Failed login attempt for username root from unknown IP 45.33.32.156', ipAddress: '45.33.32.156', timestamp: daysAgo(12) },
    { userId: null, action: 'LOGIN_FAILED', module: 'Authentication', details: 'Multiple failed login attempts detected from IP 192.168.1.55 - possible brute force attack', ipAddress: '192.168.1.55', timestamp: daysAgo(15) },
    { userId: null, action: 'LOGIN_FAILED', module: 'Authentication', details: 'Failed login attempt for username administrator from external IP', ipAddress: '203.0.113.50', timestamp: daysAgo(3) },

    // Device management events
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

    // Vulnerability events
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

    // Solution events
    { userId: admin.id, action: 'SOLUTION_CREATED', module: 'Security Solutions', details: 'Created solution: Implement TLS 1.3 Encryption for Signal Communications - Priority: Critical', ipAddress: '10.10.1.100', timestamp: daysAgo(58) },
    { userId: analyst1.id, action: 'SOLUTION_CREATED', module: 'Security Solutions', details: 'Created solution: Credential Rotation and MFA Implementation - Priority: Critical', ipAddress: '10.10.1.102', timestamp: daysAgo(55) },
    { userId: admin.id, action: 'SOLUTION_UPDATED', module: 'Security Solutions', details: 'Updated TLS 1.3 implementation status to in_progress - Harare controller deployment started', ipAddress: '10.10.1.100', timestamp: daysAgo(25) },
    { userId: analyst1.id, action: 'SOLUTION_IMPLEMENTED', module: 'Security Solutions', details: 'Marked as implemented: Centralized Logging and SIEM Deployment', ipAddress: '10.10.1.102', timestamp: daysAgo(30) },
    { userId: admin.id, action: 'SOLUTION_IMPLEMENTED', module: 'Security Solutions', details: 'Marked as implemented: SNMP Access Control Hardening on Harare Gateway', ipAddress: '10.10.1.100', timestamp: daysAgo(30) },
    { userId: analyst1.id, action: 'SOLUTION_IMPLEMENTED', module: 'Security Solutions', details: 'Marked as implemented: Privacy Masking Configuration for CCTV Network', ipAddress: '10.10.1.102', timestamp: daysAgo(20) },
    { userId: admin.id, action: 'SOLUTION_CREATED', module: 'Security Solutions', details: 'Created emergency solution: Core Router Security Hardening - out-of-band management deployment', ipAddress: '10.10.1.100', timestamp: daysAgo(5) },
    { userId: analyst3.id, action: 'SOLUTION_CREATED', module: 'Security Solutions', details: 'Created solution: CCTV Telnet Backdoor Removal for Bulawayo Depot camera', ipAddress: '10.10.1.105', timestamp: daysAgo(8) },

    // Assessment events
    { userId: admin.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed critical assessment of Signal Controller - Harare Station', ipAddress: '10.10.1.100', timestamp: daysAgo(50) },
    { userId: analyst1.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of Network Gateway - Mutare Station', ipAddress: '10.10.1.102', timestamp: daysAgo(45) },
    { userId: admin.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed medium-risk assessment of Track Sensor - KM 45', ipAddress: '10.10.1.100', timestamp: daysAgo(40) },
    { userId: analyst2.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed critical assessment of Point Machine Controller - Harare Yard', ipAddress: '10.10.1.104', timestamp: daysAgo(10) },
    { userId: admin.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed critical assessment of Core Router - Harare DC', ipAddress: '10.10.1.100', timestamp: daysAgo(5) },
    { userId: analyst3.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of CCTV Camera - Platform A Bulawayo', ipAddress: '10.10.1.105', timestamp: daysAgo(35) },
    { userId: analyst2.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of Edge Gateway - Gweru', ipAddress: '10.10.1.104', timestamp: daysAgo(12) },
    { userId: analyst3.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of Axle Counter - Entry Harare', ipAddress: '10.10.1.105', timestamp: daysAgo(4) },
    { userId: analyst1.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of CCTV Camera - Locomotive Depot', ipAddress: '10.10.1.102', timestamp: daysAgo(8) },
    { userId: admin.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed low-risk assessment of Network Gateway - Harare Central', ipAddress: '10.10.1.100', timestamp: daysAgo(7) },
    { userId: analyst5.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed medium-risk assessment of CCTV Camera - Warehouse Gweru', ipAddress: '10.10.1.107', timestamp: daysAgo(25) },
    { userId: analyst5.id, action: 'ASSESSMENT_COMPLETED', module: 'Assessments', details: 'Completed high-risk assessment of Network Gateway - Bulawayo', ipAddress: '10.10.1.107', timestamp: daysAgo(7) },

    // User management events
    { userId: admin.id, action: 'USER_CREATED', module: 'User Management', details: 'Created new analyst account: Tapiwa Ncube - Cybersecurity department', ipAddress: '10.10.1.100', timestamp: daysAgo(52) },
    { userId: admin.id, action: 'USER_CREATED', module: 'User Management', details: 'Created new analyst account: Rupondo Gumbo - IT Security department', ipAddress: '10.10.1.100', timestamp: daysAgo(50) },
    { userId: admin.id, action: 'USER_CREATED', module: 'User Management', details: 'Created new viewer account: Nyasha Mahachi - Operations department', ipAddress: '10.10.1.100', timestamp: daysAgo(48) },
    { userId: admin.id, action: 'USER_CREATED', module: 'User Management', details: 'Created new admin account: Blessing Shumba - IT Security department', ipAddress: '10.10.1.100', timestamp: daysAgo(46) },
    { userId: admin2.id, action: 'USER_CREATED', module: 'User Management', details: 'Created new analyst account: Mufaro Zvobgo - Cybersecurity department', ipAddress: '10.10.1.101', timestamp: daysAgo(47) },
    { userId: admin.id, action: 'USER_DEACTIVATED', module: 'User Management', details: 'Deactivated analyst account: Kudzai Chikumba - left organization', ipAddress: '10.10.1.100', timestamp: daysAgo(30) },
    { userId: admin.id, action: 'USER_UPDATED', module: 'User Management', details: 'Updated role for Chenai Dube from analyst to viewer', ipAddress: '10.10.1.100', timestamp: daysAgo(20) },

    // Security incident events
    { userId: null, action: 'SECURITY_ALERT', module: 'Security', details: 'Anomalous traffic detected from external IP 45.33.32.156 targeting Harare DC - blocked by firewall', ipAddress: '10.10.1.1', timestamp: daysAgo(12) },
    { userId: null, action: 'SECURITY_ALERT', module: 'Security', details: 'Port scan detected from 192.168.1.55 against Bulawayo network segment - source quarantined', ipAddress: '10.10.1.1', timestamp: daysAgo(15) },
    { userId: admin.id, action: 'SECURITY_INCIDENT', module: 'Security', details: 'Security incident declared: Critical vulnerability CVE-2024-NRZ-010 in core router - emergency response activated', ipAddress: '10.10.1.100', timestamp: daysAgo(5) },
    { userId: admin.id, action: 'SECURITY_INCIDENT_RESOLVED', module: 'Security', details: 'Security incident resolved: SNMP disclosure on Harare Gateway - SNMPv3 deployed and access restricted', ipAddress: '10.10.1.100', timestamp: daysAgo(30) },

    // Report generation events
    { userId: admin.id, action: 'REPORT_GENERATED', module: 'Reports', details: 'Generated monthly security summary report for November 2024', ipAddress: '10.10.1.100', timestamp: daysAgo(30) },
    { userId: analyst1.id, action: 'REPORT_GENERATED', module: 'Reports', details: 'Generated vulnerability assessment report for Harare station devices', ipAddress: '10.10.1.102', timestamp: daysAgo(20) },
    { userId: admin.id, action: 'REPORT_GENERATED', module: 'Reports', details: 'Generated quarterly IoT security compliance report Q4 2024', ipAddress: '10.10.1.100', timestamp: daysAgo(10) },
    { userId: admin2.id, action: 'REPORT_GENERATED', module: 'Reports', details: 'Generated incident response report for CVE-2024-NRZ-010 core router breach attempt', ipAddress: '10.10.1.101', timestamp: daysAgo(4) },

    // Recent activity - most recent events
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
  ];

  const auditLogs = await Promise.all(
    auditLogData.map(a => prisma.auditLog.create({ data: a }))
  );
  console.log(`Created ${auditLogData.length} audit logs`);

  // ======================== SUMMARY ========================
  console.log('\n========================================');
  console.log('  NISAAP Database Seeding Complete!');
  console.log('========================================');
  console.log(`  Users:          ${users.length}`);
  console.log(`  IoT Devices:    ${devices.length}`);
  console.log(`  Vulnerabilities:${vulnerabilities.length}`);
  console.log(`  Solutions:      ${solutions.length}`);
  console.log(`  Assessments:    ${assessments.length}`);
  console.log(`  Audit Logs:     ${auditLogData.length}`);
  console.log(`  TOTAL RECORDS:  ${users.length + devices.length + vulnerabilityData.length + solutionData.length + assessmentData.length + auditLogData.length}`);
  console.log('========================================\n');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Seeding error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
