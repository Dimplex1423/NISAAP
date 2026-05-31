import { db } from './db';

export async function logAudit(
  userId: string | null,
  action: string,
  module: string,
  details?: string,
  ipAddress?: string
) {
  try {
    await db.auditLog.create({
      data: {
        userId,
        action,
        module,
        details,
        ipAddress,
      },
    });
  } catch (error) {
    console.error('Failed to log audit:', error);
  }
}
