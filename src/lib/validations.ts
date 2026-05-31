import { z } from 'zod';

// Password strength regex: at least one uppercase, one lowercase, one number
const passwordStrengthRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
const passwordStrengthMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';

// IPv4 regex
const ipv4Regex = /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

// MAC address regex (optional formats: XX:XX:XX:XX:XX:XX or XX-XX-XX-XX-XX-XX)
const macAddressRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordStrengthRegex, passwordStrengthMessage),
  email: z.string().email('Invalid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['admin', 'analyst', 'viewer'], { message: 'Role must be admin, analyst, or viewer' }),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordStrengthRegex, passwordStrengthMessage)
    .optional(),
  email: z.string().email('Invalid email address').optional(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
  role: z.enum(['admin', 'analyst', 'viewer'], { message: 'Role must be admin, analyst, or viewer' }).optional(),
  department: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const createDeviceSchema = z.object({
  deviceName: z.string().min(2, 'Device name must be at least 2 characters'),
  deviceType: z.enum(
    ['scada', 'plc', 'rtu', 'sensor', 'camera', 'gateway', 'server', 'workstation', 'router', 'switch', 'firewall', 'other'],
    { message: 'Invalid device type' }
  ),
  ipAddress: z.string().regex(ipv4Regex, 'Invalid IPv4 address'),
  macAddress: z.string().regex(macAddressRegex, 'Invalid MAC address format').optional(),
  location: z.string().min(2, 'Location must be at least 2 characters'),
  station: z.string().optional(),
  networkSegment: z.string().optional(),
  firmwareVersion: z.string().optional(),
  riskLevel: z.enum(['critical', 'high', 'medium', 'low'], { message: 'Invalid risk level' }).optional(),
  status: z.enum(['active', 'inactive', 'maintenance', 'decommissioned'], { message: 'Invalid status' }).optional(),
});

export const createVulnerabilitySchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  severity: z.enum(['critical', 'high', 'medium', 'low'], { message: 'Invalid severity level' }),
  cvssScore: z.number().min(0, 'CVSS score must be at least 0').max(10, 'CVSS score must be at most 10').optional(),
  cveId: z.string().optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'accepted_risk'], { message: 'Invalid vulnerability status' }).optional(),
  remediation: z.string().optional(),
});

export const createSolutionSchema = z.object({
  vulnerabilityId: z.string().min(1, 'Vulnerability ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['critical', 'high', 'medium', 'low'], { message: 'Invalid priority level' }).optional(),
  implementationStatus: z.enum(['proposed', 'approved', 'in_progress', 'implemented', 'verified'], { message: 'Invalid implementation status' }).optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  costEstimate: z.string().optional(),
});

export const createAssessmentSchema = z.object({
  deviceId: z.string().min(1, 'Device ID is required'),
  findings: z.string().min(10, 'Findings must be at least 10 characters'),
  recommendations: z.string().min(10, 'Recommendations must be at least 10 characters'),
  riskRating: z.enum(['critical', 'high', 'medium', 'low'], { message: 'Invalid risk rating' }).optional(),
});

// Helper to format Zod errors into a single string
export function formatZodErrors(error: { issues: Array<{ message: string }> }): string {
  return error.issues.map(e => e.message).join(', ');
}
